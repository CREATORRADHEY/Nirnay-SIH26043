"""FastAPI Router for Practical Jury Evaluation Workspace (/api/v1/evaluation/scenarios).

Exposes 4 core evaluation scenarios, live backend-derived checklists, isolated scenario reset,
engineering proof telemetry, and safe evaluation role switching.
"""

from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_actor, get_optional_actor
from app.models.actor import Actor
from app.core.enums import PlatformRole
from app.schemas.jury_evaluation import (
    ScenarioOverviewSchema,
    EngineeringProofSchema,
    ScenarioStatusResponse,
    ScenarioResetResponse,
    EvaluationReceiptResponse,
    RoleSwitchRequest,
    RoleSwitchResponse,
)
from app.services.jury_evaluation_service import JuryEvaluationService

router = APIRouter(prefix="/evaluation/scenarios", tags=["jury-evaluation"])


@router.get(
    "",
    response_model=List[ScenarioOverviewSchema],
    summary="Fetch 4 core jury evaluation scenarios overview",
)
def get_scenarios_overview() -> List[ScenarioOverviewSchema]:
    return JuryEvaluationService.get_scenarios_overview()


@router.get(
    "/proof",
    response_model=EngineeringProofSchema,
    summary="Fetch engineering proof panel build and contract telemetry",
)
def get_engineering_proof() -> EngineeringProofSchema:
    return JuryEvaluationService.get_engineering_proof()


@router.get(
    "/{scenario_id}/status",
    response_model=ScenarioStatusResponse,
    summary="Fetch live backend-derived checklist and PASS status for a scenario",
)
def get_scenario_status(
    scenario_id: str,
    db: Session = Depends(get_db),
    actor: Optional[Actor] = Depends(get_optional_actor),
) -> ScenarioStatusResponse:
    try:
        return JuryEvaluationService.get_scenario_status(scenario_id, db)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.post(
    "/{scenario_id}/reset",
    response_model=ScenarioResetResponse,
    summary="Reset isolated synthetic evaluation scenario fixture records",
)
def reset_scenario(
    scenario_id: str,
    db: Session = Depends(get_db),
    actor: Optional[Actor] = Depends(get_optional_actor),
) -> ScenarioResetResponse:
    try:
        return JuryEvaluationService.reset_scenario(scenario_id, db)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get(
    "/{scenario_id}/receipt",
    response_model=EvaluationReceiptResponse,
    summary="Fetch read-only evaluation receipt for completed or in-progress scenario",
)
def get_evaluation_receipt(
    scenario_id: str,
    db: Session = Depends(get_db),
    actor: Optional[Actor] = Depends(get_optional_actor),
) -> EvaluationReceiptResponse:
    try:
        return JuryEvaluationService.get_evaluation_receipt(scenario_id, db)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.post(
    "/role-switch",
    response_model=RoleSwitchResponse,
    summary="Safe evaluation-only role switcher using isolated seed identities",
)
def switch_evaluation_role(
    payload: RoleSwitchRequest,
    db: Session = Depends(get_db),
) -> RoleSwitchResponse:
    target_role_str = payload.role.upper()
    role_map = {
        "CITIZEN": PlatformRole.COMMUNITY_REPORTER,
        "GOVERNMENT": PlatformRole.GOVERNMENT_REVIEWER,
        "HEI": PlatformRole.HEI_REVIEWER,
        "SENIOR_GOVERNMENT": PlatformRole.PLATFORM_ADMIN,
    }

    if target_role_str not in role_map:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid evaluation role. Must be one of: {list(role_map.keys())}",
        )

    target_enum = role_map[target_role_str]
    actor = db.query(Actor).filter(Actor.platform_role == target_enum).first()
    if not actor:
        actor = Actor(display_name=f"Evaluation {target_role_str}", platform_role=target_enum)
        db.add(actor)
        db.commit()
        db.refresh(actor)

    return {
        "active_role": target_role_str,
        "display_name": actor.display_name,
        "actor_id": str(actor.id),
        "platform_role": actor.platform_role.value if hasattr(actor.platform_role, "value") else str(actor.platform_role),
    }
