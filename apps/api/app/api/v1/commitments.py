import uuid
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.commitment import CommitmentCreate, CommitmentHistoryResponse, CommitmentResponse
from app.services.commitment_service import (
    create_commitment_version,
    get_commitment_history,
    list_commitments,
)

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
    db: Session = Depends(get_db),
) -> CommitmentResponse:
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
