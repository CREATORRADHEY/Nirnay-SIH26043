import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.qualification import (
    QualificationDecisionCreate,
    QualificationDecisionResponse,
    QualificationHistoryResponse,
)
from app.services.qualification_service import (
    create_qualification_decision,
    get_latest_qualification_decision,
    get_qualification_history,
)

router = APIRouter(tags=["qualification"])


@router.post(
    "/challenges/{challenge_id}/qualification-decisions",
    response_model=QualificationDecisionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new finalized human qualification decision",
)
def post_qualification_decision(
    challenge_id: uuid.UUID,
    payload: QualificationDecisionCreate,
    db: Session = Depends(get_db),
) -> QualificationDecisionResponse:
    try:
        decision = create_qualification_decision(db, challenge_id, payload)
        db.commit()
        db.refresh(decision)
        return QualificationDecisionResponse.model_validate(decision)
    except ValueError as e:
        db.rollback()
        msg = str(e)
        if "not found" in msg.lower():
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=msg)
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=msg)


@router.get(
    "/challenges/{challenge_id}/qualification-decisions",
    response_model=QualificationHistoryResponse,
    summary="Get complete qualification decision history (version ASC)",
)
def get_qualification_decisions(
    challenge_id: uuid.UUID,
    db: Session = Depends(get_db),
) -> QualificationHistoryResponse:
    try:
        items, total = get_qualification_history(db, challenge_id)
        return QualificationHistoryResponse(
            items=[QualificationDecisionResponse.model_validate(i) for i in items],
            total=total,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get(
    "/challenges/{challenge_id}/qualification-decisions/latest",
    response_model=QualificationDecisionResponse,
    summary="Get latest qualification decision",
)
def get_latest_qualification(
    challenge_id: uuid.UUID,
    db: Session = Depends(get_db),
) -> QualificationDecisionResponse:
    try:
        decision = get_latest_qualification_decision(db, challenge_id)
        if decision is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No qualification decision found for Challenge {challenge_id}.",
            )
        return QualificationDecisionResponse.model_validate(decision)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
