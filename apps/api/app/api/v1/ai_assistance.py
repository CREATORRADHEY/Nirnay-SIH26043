import time
import uuid
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.database import get_db
from app.core.dependencies import get_current_actor, get_optional_actor
from app.models.actor import Actor
from app.models.ai_audit_log import AIAuditLog
from app.models.challenge import Challenge
from app.models.hei_capability import HEICapability
from app.models.organization import Organization
from app.schemas.ai import (
    ChallengeExtractionRequest,
    ChallengeExtractionResponse,
    DuplicateSuggestionResponse,
    EvidenceSummaryResponse,
    HEICandidateSuggestionResponse,
    QualificationSuggestionResponse,
)
from app.services.ai import get_ai_provider
from app.services.policy_service import PolicyService

router = APIRouter(prefix="/ai", tags=["ai-assistance"])


def _audit_ai_request(
    db: Session,
    task_type: str,
    prompt_version: str,
    actor_id: Optional[uuid.UUID],
    challenge_id: Optional[uuid.UUID],
    success: bool,
    latency_ms: int,
):
    """Helper to record lightweight AI audit log in DB."""
    try:
        settings = get_settings()
        audit = AIAuditLog(
            task_type=task_type,
            actor_id=actor_id,
            challenge_id=challenge_id,
            provider=settings.ai_provider,
            model=settings.ai_model,
            prompt_version=prompt_version,
            success=success,
            latency_ms=latency_ms,
        )
        db.add(audit)
        db.commit()
    except Exception:
        db.rollback()


@router.post(
    "/challenges/extract",
    response_model=ChallengeExtractionResponse,
    summary="Structure raw Hinglish / English problem text into draft challenge fields",
)
def extract_challenge(
    payload: ChallengeExtractionRequest,
    actor: Optional[Actor] = Depends(get_optional_actor),
    db: Session = Depends(get_db),
) -> ChallengeExtractionResponse:
    start_t = time.time()
    provider = get_ai_provider()
    res = provider.extract_challenge(payload.raw_text)
    latency = int((time.time() - start_t) * 1000)

    actor_id = actor.id if actor else None
    _audit_ai_request(
        db,
        task_type="challenge_extraction",
        prompt_version="challenge_extraction_v1",
        actor_id=actor_id,
        challenge_id=None,
        success=res.is_available,
        latency_ms=latency,
    )
    return res


@router.post(
    "/challenges/{challenge_id}/qualification-suggestion",
    response_model=QualificationSuggestionResponse,
    summary="Advisory qualification route suggestion for Government Reviewers",
)
def suggest_qualification(
    challenge_id: uuid.UUID,
    actor: Actor = Depends(get_current_actor),
    db: Session = Depends(get_db),
) -> QualificationSuggestionResponse:
    if not PolicyService.can_perform_action(actor, "qualification:record"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission denied: only authorized Government Reviewers can request qualification route suggestions.",
        )

    challenge = db.get(Challenge, challenge_id)
    if challenge is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Challenge not found.")

    start_t = time.time()
    provider = get_ai_provider()
    evidence_notes = [e.summary for e in challenge.evidences if e.summary]
    res = provider.suggest_qualification(
        challenge_title=challenge.title,
        summary=challenge.summary,
        description=challenge.description,
        evidence_notes=evidence_notes,
    )
    latency = int((time.time() - start_t) * 1000)

    _audit_ai_request(
        db,
        task_type="qualification_suggestion",
        prompt_version="qualification_suggestion_v1",
        actor_id=actor.id,
        challenge_id=challenge_id,
        success=res.is_available,
        latency_ms=latency,
    )
    return res


@router.post(
    "/challenges/{challenge_id}/duplicate-suggestion",
    response_model=DuplicateSuggestionResponse,
    summary="Advisory duplicate challenge detection from bounded candidate set",
)
def suggest_duplicates(
    challenge_id: uuid.UUID,
    actor: Actor = Depends(get_current_actor),
    db: Session = Depends(get_db),
) -> DuplicateSuggestionResponse:
    if not PolicyService.can_perform_action(actor, "challenge:view_review_scope"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission denied: cannot request duplicate suggestions.",
        )

    challenge = db.get(Challenge, challenge_id)
    if challenge is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Challenge not found.")

    # Bounded candidate retrieval (same district or domain, max 10)
    candidates_stmt = (
        select(Challenge)
        .where(
            Challenge.id != challenge_id,
            (Challenge.district == challenge.district) | (Challenge.domain == challenge.domain),
        )
        .limit(10)
    )
    existing_objs = list(db.scalars(candidates_stmt).all())
    existing_candidates = [
        {"id": str(c.id), "title": c.title, "district": c.district, "domain": c.domain}
        for c in existing_objs
    ]

    start_t = time.time()
    provider = get_ai_provider()
    res = provider.suggest_duplicates(challenge.title, challenge.description, existing_candidates)
    latency = int((time.time() - start_t) * 1000)

    _audit_ai_request(
        db,
        task_type="duplicate_suggestion",
        prompt_version="duplicate_suggestion_v1",
        actor_id=actor.id,
        challenge_id=challenge_id,
        success=res.is_available,
        latency_ms=latency,
    )
    return res


@router.post(
    "/challenges/{challenge_id}/hei-candidate-suggestion",
    response_model=HEICandidateSuggestionResponse,
    summary="Advisory HEI candidate capability discovery from registered capabilities",
)
def suggest_hei_candidates(
    challenge_id: uuid.UUID,
    actor: Actor = Depends(get_current_actor),
    db: Session = Depends(get_db),
) -> HEICandidateSuggestionResponse:
    if not PolicyService.can_perform_action(actor, "hei_candidate:create"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission denied: cannot request HEI candidate suggestions.",
        )

    challenge = db.get(Challenge, challenge_id)
    if challenge is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Challenge not found.")

    # Bounded HEI capabilities retrieval
    caps_stmt = (
        select(HEICapability, Organization)
        .join(Organization, HEICapability.organization_id == Organization.id)
        .where(HEICapability.is_active == True)
        .limit(20)
    )
    results = db.execute(caps_stmt).all()
    bounded_caps = [
        {
            "organization_id": str(org.id),
            "name": org.name,
            "capability_name": cap.name,
            "discipline": cap.discipline,
        }
        for cap, org in results
    ]
    valid_org_ids = {c["organization_id"] for c in bounded_caps}

    start_t = time.time()
    provider = get_ai_provider()
    res = provider.suggest_hei_candidates(
        challenge.title, challenge.description, challenge.domain, bounded_caps
    )
    latency = int((time.time() - start_t) * 1000)

    # SAFETY VALIDATION: Verify all returned org IDs belong to permitted candidate set
    if res.suggested_candidates:
        res.suggested_candidates = [
            cand for cand in res.suggested_candidates
            if str(cand.organization_id) in valid_org_ids
        ]

    _audit_ai_request(
        db,
        task_type="hei_candidate_suggestion",
        prompt_version="hei_candidate_suggestion_v1",
        actor_id=actor.id,
        challenge_id=challenge_id,
        success=res.is_available,
        latency_ms=latency,
    )
    return res


@router.post(
    "/challenges/{challenge_id}/evidence-summary",
    response_model=EvidenceSummaryResponse,
    summary="Advisory evidence summary for authorized reviewers",
)
def summarize_evidence(
    challenge_id: uuid.UUID,
    actor: Actor = Depends(get_current_actor),
    db: Session = Depends(get_db),
) -> EvidenceSummaryResponse:
    if not PolicyService.can_perform_action(actor, "challenge:view_review_scope"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission denied: cannot request evidence summary.",
        )

    challenge = db.get(Challenge, challenge_id)
    if challenge is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Challenge not found.")

    evidences = [
        {"id": str(e.id), "title": e.title, "summary": e.summary}
        for e in challenge.evidences
    ]

    start_t = time.time()
    provider = get_ai_provider()
    res = provider.summarize_evidence(challenge.title, evidences)
    latency = int((time.time() - start_t) * 1000)

    _audit_ai_request(
        db,
        task_type="evidence_summary",
        prompt_version="evidence_summary_v1",
        actor_id=actor.id,
        challenge_id=challenge_id,
        success=res.is_available,
        latency_ms=latency,
    )
    return res
