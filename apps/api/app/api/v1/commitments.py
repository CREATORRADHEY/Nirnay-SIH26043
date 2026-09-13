import uuid
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_actor
from app.models.actor import Actor
from app.schemas.commitment import CommitmentCreate, CommitmentHistoryResponse, CommitmentResponse
from app.services.commitment_service import (
    create_commitment_version,
    get_commitment_history,
    list_commitments,
)
from app.core.enums import PlatformRole

router = APIRouter(tags=["commitments"])


@router.post(
    "/challenges/{challenge_id}/commitments",
    response_model=CommitmentResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new version of a Commitment series",
)
def post_commitment_version(
    challenge_id: uuid.UUID,
    payload: CommitmentCreate,
    actor: Actor = Depends(get_current_actor),
    db: Session = Depends(get_db),
) -> CommitmentResponse:
    role_str = getattr(actor.platform_role, "value", str(actor.platform_role))
    if role_str in [PlatformRole.COMMUNITY_REPORTER.value, PlatformRole.GOVERNMENT_REVIEWER.value]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Government Reviewers and Citizens cannot record institutional commitments on behalf of HEI/Industry.",
        )
    if role_str != PlatformRole.PLATFORM_ADMIN.value:
        mem_org_ids = [m.organization_id for m in actor.memberships]
        if payload.organization_id not in mem_org_ids:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Institutional boundary violation: You cannot record commitments on behalf of another organization.",
            )
    payload.recorded_by_actor_id = actor.id

    try:
        commitment = create_commitment_version(db, challenge_id, payload)
        db.commit()
        db.refresh(commitment)
        return CommitmentResponse.model_validate(commitment)
    except ValueError as e:
        db.rollback()
        msg = str(e)
        if "not found" in msg.lower():
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=msg)
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=msg)


@router.get(
    "/challenges/{challenge_id}/commitments",
    response_model=CommitmentHistoryResponse,
    summary="List commitments for Challenge",
)
def get_commitments(
    challenge_id: uuid.UUID,
    organization_id: Optional[uuid.UUID] = Query(None),
    commitment_type: Optional[str] = Query(None),
    db: Session = Depends(get_db),
) -> CommitmentHistoryResponse:
    try:
        items, total = list_commitments(
            db, challenge_id, organization_id=organization_id, commitment_type=commitment_type
        )
        return CommitmentHistoryResponse(
            items=[CommitmentResponse.model_validate(i) for i in items],
            total=total,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get(
    "/challenges/{challenge_id}/commitments/{organization_id}/{commitment_type}",
    response_model=CommitmentHistoryResponse,
    summary="Get complete version history for a logical commitment series",
)
def get_commitment_series_history(
    challenge_id: uuid.UUID,
    organization_id: uuid.UUID,
    commitment_type: str,
    db: Session = Depends(get_db),
) -> CommitmentHistoryResponse:
    try:
        items, total = get_commitment_history(
            db, challenge_id, organization_id, commitment_type
        )
        return CommitmentHistoryResponse(
            items=[CommitmentResponse.model_validate(i) for i in items],
            total=total,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
