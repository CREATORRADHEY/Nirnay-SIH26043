import os
import uuid
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_

from app.core.database import get_db
from app.core.dependencies import get_current_actor, get_optional_actor, require_permission
from app.models.actor import Actor
from app.models.challenge import Challenge
from app.models.evidence import Evidence
from app.models.qualification_decision import QualificationDecision
from app.models.challenge_hei_candidate import ChallengeHEICandidate
from app.models.commitment import Commitment
from app.models.readiness_decision import ReadinessDecision
from app.models.pilot import Pilot
from app.models.outcome_assessment import OutcomeAssessment
from app.schemas.challenge import ChallengeCreate, ChallengeListResponse, ChallengeResponse
from app.schemas.evidence import EvidenceCreate, EvidenceListResponse, EvidenceResponse
from app.schemas.clarification_schema import (
    ClarificationRequestCreate,
    ClarificationRequestResponse,
    ClarificationResponseCreate,
    ClarificationResponseResponse,
)
from app.services.challenge_service import create_challenge, get_challenge, list_challenges
from app.services.evidence_service import create_evidence, list_challenge_evidence
from app.services.clarification_service import (
    create_clarification_request,
    list_clarifications_for_challenge,
    create_clarification_response,
    resolve_clarification,
)
from app.services.storage_service import get_storage_adapter
from app.services.policy_service import PolicyService

router = APIRouter(tags=["challenges"])


@router.post(
    "/challenges",
    response_model=ChallengeResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Submit a new Challenge Passport record",
)
def submit_challenge(
    payload: ChallengeCreate,
    db: Session = Depends(get_db),
    current_actor: Actor = Depends(get_current_actor),
) -> ChallengeResponse:
    if not PolicyService.can_perform_action(current_actor, "challenge:create"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission denied: cannot submit challenge.",
        )

    # Restrict source_type for COMMUNITY_REPORTER
    if current_actor.platform_role == "COMMUNITY_REPORTER":
        if payload.source_type not in ["CITIZEN", "COMMUNITY"]:
            payload.source_type = "CITIZEN"

    # Force submitter identity to logged in actor
    payload.submitted_by_actor_id = current_actor.id

    try:
        challenge = create_challenge(db, payload)
        db.commit()
        db.refresh(challenge)
        return ChallengeResponse.model_validate(challenge)
    except ValueError as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get(
    "/me/challenges",
    summary="List challenges submitted by current authenticated user",
)
def get_my_challenges(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_actor: Actor = Depends(get_current_actor),
):
    query = db.query(Challenge).filter(Challenge.submitted_by_actor_id == current_actor.id)
    total = query.count()
    challenges = (
        query.order_by(Challenge.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )

    items = []
    for c in challenges:
        # Determine latest lifecycle state
        qual = (
            db.query(QualificationDecision)
            .filter(QualificationDecision.challenge_id == c.id)
            .order_by(QualificationDecision.decided_at.desc())
            .first()
        )
        hei_cand = db.query(ChallengeHEICandidate).filter(ChallengeHEICandidate.challenge_id == c.id).count()
        comm = db.query(Commitment).filter(Commitment.challenge_id == c.id).count()
        readiness = (
            db.query(ReadinessDecision)
            .filter(ReadinessDecision.challenge_id == c.id)
            .order_by(ReadinessDecision.created_at.desc())
            .first()
        )
        pilot = db.query(Pilot).filter(Pilot.challenge_id == c.id).first()
        outcome = (
            db.query(OutcomeAssessment)
            .filter(OutcomeAssessment.challenge_id == c.id)
            .first()
            if pilot else None
        )

        lifecycle_stage = "SUBMITTED"
        if qual:
            lifecycle_stage = (qual.route.value if hasattr(qual.route, "value") else qual.route)
        if hei_cand > 0:
            lifecycle_stage = "HEI_CANDIDATES_IDENTIFIED"
        if comm > 0:
            lifecycle_stage = "COMMITMENT_RECORDED"
        if readiness and (readiness.status.value if hasattr(readiness.status, "value") else readiness.status) == "PILOT_READY":
            lifecycle_stage = "PILOT_READY"
        if pilot:
            lifecycle_stage = f"PILOT_{pilot.operational_status}"
        if outcome:
            lifecycle_stage = f"OUTCOME_{outcome.overall_finding}"

        items.append({
            "id": str(c.id),
            "title": c.title,
            "summary": c.summary,
            "description": c.description,
            "domain": c.domain,
            "district": c.district,
            "state": c.state,
            "source_type": c.source_type,
            "submitted_at": c.created_at.isoformat(),
            "updated_at": c.updated_at.isoformat(),
            "lifecycle_stage": lifecycle_stage,
            "qualification_route": (qual.route.value if hasattr(qual.route, "value") else qual.route) if qual else None,
        })

    return {
        "items": items,
        "total": total,
        "limit": limit,
        "offset": offset,
    }


@router.get(
    "/challenges",
    response_model=ChallengeListResponse,
    summary="List Challenge Passport records",
)
def get_challenges(
    district: Optional[str] = Query(None, description="Filter by district"),
    domain: Optional[str] = Query(None, description="Filter by domain"),
    source_type: Optional[str] = Query(None, description="Filter by source_type"),
    limit: int = Query(20, ge=1, le=100, description="Page limit (max 100)"),
    offset: int = Query(0, ge=0, description="Page offset"),
    db: Session = Depends(get_db),
) -> ChallengeListResponse:
    items, total = list_challenges(
        db, district=district, domain=domain, source_type=source_type, limit=limit, offset=offset
    )
    return ChallengeListResponse(
        items=items,
        total=total,
        limit=max(1, min(limit, 100)),
        offset=max(0, offset),
    )


@router.get(
    "/challenges/{challenge_id}",
    response_model=ChallengeResponse,
    summary="Retrieve factual Challenge Passport details",
)
def get_challenge_detail(
    challenge_id: uuid.UUID,
    db: Session = Depends(get_db),
) -> ChallengeResponse:
    challenge = get_challenge(db, challenge_id)
    if challenge is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Challenge {challenge_id} not found.",
        )
    return ChallengeResponse.model_validate(challenge)


@router.post(
    "/challenges/{challenge_id}/evidence",
    response_model=EvidenceResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Attach Evidence metadata to a Challenge",
)
def add_challenge_evidence(
    challenge_id: uuid.UUID,
    payload: EvidenceCreate,
    db: Session = Depends(get_db),
    current_actor: Actor = Depends(get_current_actor),
) -> EvidenceResponse:
    challenge = get_challenge(db, challenge_id)
    if not challenge:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Challenge {challenge_id} not found.")

    if not PolicyService.can_perform_action(current_actor, "challenge:add_evidence"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permission denied to add evidence.")

    try:
        evidence = create_evidence(db, challenge_id, payload)
        db.commit()
        db.refresh(evidence)
        return EvidenceResponse.model_validate(evidence)
    except ValueError as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post(
    "/challenges/{challenge_id}/evidence/upload",
    response_model=EvidenceResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload Evidence file for a Challenge",
)
async def upload_challenge_evidence_file(
    challenge_id: uuid.UUID,
    evidence_type: str = Form(...),
    description: str = Form(...),
    source_type: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_actor: Actor = Depends(get_current_actor),
):
    challenge = get_challenge(db, challenge_id)
    if not challenge:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Challenge {challenge_id} not found.")

    if not PolicyService.can_perform_action(current_actor, "challenge:add_evidence"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permission denied to add evidence.")

    try:
        file_bytes = await file.read()
        storage_adapter = get_storage_adapter()
        storage_ref, _ = storage_adapter.save_file(
            file_bytes=file_bytes,
            original_filename=file.filename or "file.bin",
            content_type=file.content_type or "application/octet-stream",
        )

        payload = EvidenceCreate(
            evidence_type=evidence_type,
            storage_reference=storage_ref,
            description=f"{description} (Original file: {file.filename})",
            source_type=source_type,
        )
        evidence = create_evidence(db, challenge_id, payload)
        db.commit()
        db.refresh(evidence)
        return EvidenceResponse.model_validate(evidence)
    except ValueError as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get(
    "/evidence/{evidence_id}/file",
    summary="Securely stream/download uploaded evidence file",
)
def download_evidence_file(
    evidence_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_actor: Actor = Depends(get_current_actor),
):
    evidence = db.query(Evidence).filter(Evidence.id == evidence_id).first()
    if not evidence:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Evidence not found.")

    # Check permission to view evidence (IDOR protection)
    challenge = get_challenge(db, evidence.challenge_id)
    if not challenge:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Associated challenge not found.")

    is_owner = (current_actor.id == challenge.submitted_by_actor_id)
    has_review_scope = PolicyService.can_perform_action(current_actor, "challenge:view_review_scope")
    if not (is_owner or has_review_scope):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: You do not have permission to view or download this evidence file."
        )

    try:
        storage_adapter = get_storage_adapter()
        file_path = storage_adapter.get_file_path(evidence.storage_reference)
        return FileResponse(file_path, filename=f"evidence_{evidence_id}{os.path.splitext(file_path)[1]}")
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get(
    "/challenges/{challenge_id}/evidence",
    response_model=EvidenceListResponse,
    summary="List Evidence metadata for a Challenge",
)
def get_challenge_evidence(
    challenge_id: uuid.UUID,
    db: Session = Depends(get_db),
) -> EvidenceListResponse:
    try:
        items, total = list_challenge_evidence(db, challenge_id)
        return EvidenceListResponse(items=items, total=total)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


# ==========================================
# Clarification Endpoints
# ==========================================

@router.post(
    "/challenges/{challenge_id}/clarifications",
    response_model=ClarificationRequestResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Request Clarification on a Challenge",
)
def request_clarification(
    challenge_id: uuid.UUID,
    payload: ClarificationRequestCreate,
    db: Session = Depends(get_db),
    current_actor: Actor = Depends(get_current_actor),
):
    if not PolicyService.can_perform_action(current_actor, "qualification:record"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission denied: only Government Reviewers can request clarification.",
        )

    try:
        req = create_clarification_request(
            db=db,
            challenge_id=challenge_id,
            question=payload.question,
            requested_by_actor_id=current_actor.id,
            due_date=payload.due_date,
        )
        return ClarificationRequestResponse.model_validate(req)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get(
    "/challenges/{challenge_id}/clarifications",
    response_model=List[ClarificationRequestResponse],
    summary="List clarification requests and responses for a Challenge",
)
def get_clarifications(
    challenge_id: uuid.UUID,
    db: Session = Depends(get_db),
):
    reqs = list_clarifications_for_challenge(db, challenge_id)
    return [ClarificationRequestResponse.model_validate(r) for r in reqs]


@router.post(
    "/clarifications/{request_id}/respond",
    response_model=ClarificationResponseResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Respond to a Clarification Request",
)
def respond_clarification(
    request_id: uuid.UUID,
    payload: ClarificationResponseCreate,
    db: Session = Depends(get_db),
    current_actor: Actor = Depends(get_current_actor),
):
    try:
        resp = create_clarification_response(
            db=db,
            request_id=request_id,
            response_text=payload.response,
            responded_by_actor_id=current_actor.id,
        )
        return ClarificationResponseResponse.model_validate(resp)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post(
    "/clarifications/{request_id}/resolve",
    response_model=ClarificationRequestResponse,
    summary="Resolve a Clarification Request",
)
def resolve_clarification_endpoint(
    request_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_actor: Actor = Depends(get_current_actor),
):
    if not PolicyService.can_perform_action(current_actor, "qualification:record"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission denied: only Government Reviewers can resolve clarification requests.",
        )

    try:
        req = resolve_clarification(db, request_id, current_actor.id)
        return ClarificationRequestResponse.model_validate(req)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
