"""FastAPI Router for AI Evaluation Workspace (/api/v1/evaluation/ai).

Exposes synthetic evaluation dataset, controlled execution endpoints, and factual metrics.
"""

from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.dependencies import get_current_actor, get_optional_actor
from app.models.actor import Actor
from app.schemas.ai_evaluation import (
    EvaluationRunResponse,
    ReviewCaseRequest,
)
from app.services.ai_evaluation_service import AIEvaluationService

router = APIRouter(prefix="/evaluation/ai", tags=["ai-evaluation"])


@router.get(
    "/dataset",
    response_model=List[Dict[str, Any]],
    summary="Fetch controlled synthetic evaluation dataset (30 cases)",
)
def get_evaluation_dataset(
    actor: Optional[Actor] = Depends(get_optional_actor),
) -> List[Dict[str, Any]]:
    """Returns the 30 controlled synthetic evaluation cases."""
    return AIEvaluationService.get_dataset()


@router.post(
    "/run",
    response_model=EvaluationRunResponse,
    summary="Execute controlled synthetic evaluation suite",
)
def run_evaluation(
    ai_enabled: bool = Query(True, description="Toggle AI provider evaluation vs AI-off baseline"),
    actor: Optional[Actor] = Depends(get_optional_actor),
) -> EvaluationRunResponse:
    """Runs the controlled evaluation suite across all 30 dataset cases."""
    return AIEvaluationService.run_evaluation(ai_enabled=ai_enabled)


@router.get(
    "/metrics",
    response_model=EvaluationRunResponse,
    summary="Fetch aggregate factual metrics for the controlled synthetic evaluation dataset",
)
def get_evaluation_metrics(
    ai_enabled: bool = Query(True, description="Fetch metrics for AI enabled vs AI-off baseline"),
    actor: Optional[Actor] = Depends(get_optional_actor),
) -> EvaluationRunResponse:
    """Returns aggregate factual metrics with numerators and denominators."""
    return AIEvaluationService.run_evaluation(ai_enabled=ai_enabled)


@router.post(
    "/cases/{case_id}/review",
    summary="Record dual-reviewer assessment for a synthetic case",
)
def review_synthetic_case(
    case_id: str,
    payload: ReviewCaseRequest,
    actor: Optional[Actor] = Depends(get_optional_actor),
) -> Dict[str, Any]:
    dataset = AIEvaluationService.get_dataset()
    target = next((c for c in dataset if c["case_id"] == case_id), None)
    if not target:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Synthetic evaluation case not found.")

    if payload.reviewer_id.upper() in ["REVIEWER_A", "REV_A"]:
        target["reviewer_a_route"] = payload.selected_route
    elif payload.reviewer_id.upper() in ["REVIEWER_B", "REV_B"]:
        target["reviewer_b_route"] = payload.selected_route
    else:
        target["human_reference_route"] = payload.selected_route

    return {
        "message": f"Updated review for case {case_id}",
        "case_id": case_id,
        "reviewer_id": payload.reviewer_id,
        "selected_route": payload.selected_route,
    }
