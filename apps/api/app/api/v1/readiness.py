import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.readiness import (
    ReadinessConditionCreate,
    ReadinessConditionListResponse,
    ReadinessConditionResponse,
    ReadinessDecisionCreate,
    ReadinessDecisionHistoryResponse,
    ReadinessDecisionResponse,
)
from app.services.readiness_service import (
    create_readiness_condition_version,
    create_readiness_decision,
    get_latest_readiness_conditions,
    get_latest_readiness_decision,
    get_readiness_history,
    list_readiness_conditions,
)

router = APIRouter(tags=["readiness"])


@router.post(
    "/challenges/{challenge_id}/readiness-conditions",
    response_model=ReadinessConditionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new version of a ReadinessCondition",
)
def post_readiness_condition_version(
    challenge_id: uuid.UUID,
    payload: ReadinessConditionCreate,
    db: Session = Depends(get_db),
) -> ReadinessConditionResponse:
    try:
        cond = create_readiness_condition_version(db, challenge_id, payload)
        db.commit()
        db.refresh(cond)
        return ReadinessConditionResponse.model_validate(cond)
    except ValueError as e:
        db.rollback()
        msg = str(e)
        if "not found" in msg.lower():
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=msg)
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=msg)


@router.get(
    "/challenges/{challenge_id}/readiness-conditions",
    response_model=ReadinessConditionListResponse,
    summary="List all readiness condition versions for Challenge",
)
def get_readiness_conditions(
    challenge_id: uuid.UUID,
    db: Session = Depends(get_db),
) -> ReadinessConditionListResponse:
    try:
        items, total = list_readiness_conditions(db, challenge_id)
        return ReadinessConditionListResponse(
            items=[ReadinessConditionResponse.model_validate(i) for i in items],
            total=total,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get(
    "/challenges/{challenge_id}/readiness-conditions/latest",
    response_model=ReadinessConditionListResponse,
    summary="List latest version of each readiness condition_key for Challenge",
)
def get_latest_conditions(
    challenge_id: uuid.UUID,
    db: Session = Depends(get_db),
) -> ReadinessConditionListResponse:
    try:
        items, total = get_latest_readiness_conditions(db, challenge_id)
        return ReadinessConditionListResponse(
            items=[ReadinessConditionResponse.model_validate(i) for i in items],
            total=total,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.post(
    "/challenges/{challenge_id}/readiness-decisions",
    response_model=ReadinessDecisionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new human ReadinessDecision",
)
def post_readiness_decision(
    challenge_id: uuid.UUID,
    payload: ReadinessDecisionCreate,
    db: Session = Depends(get_db),
) -> ReadinessDecisionResponse:
    try:
        decision = create_readiness_decision(db, challenge_id, payload)
        db.commit()
        db.refresh(decision)
        return ReadinessDecisionResponse.model_validate(decision)
    except ValueError as e:
        db.rollback()
        msg = str(e)
        if "not found" in msg.lower():
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=msg)
        if "review_required status cannot be manually set" in msg.lower():
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=msg)
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=msg)


@router.get(
    "/challenges/{challenge_id}/readiness-decisions",
    response_model=ReadinessDecisionHistoryResponse,
    summary="Get ordered readiness decision history (version ASC)",
)
def get_readiness_decisions(
    challenge_id: uuid.UUID,
    db: Session = Depends(get_db),
) -> ReadinessDecisionHistoryResponse:
    try:
        items, total = get_readiness_history(db, challenge_id)
        return ReadinessDecisionHistoryResponse(
            items=[ReadinessDecisionResponse.model_validate(i) for i in items],
            total=total,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get(
    "/challenges/{challenge_id}/readiness-decisions/latest",
    response_model=ReadinessDecisionResponse,
    summary="Get latest readiness decision for Challenge",
)
def get_latest_decision(
    challenge_id: uuid.UUID,
    db: Session = Depends(get_db),
) -> ReadinessDecisionResponse:
    try:
        decision = get_latest_readiness_decision(db, challenge_id)
        if decision is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No readiness decision found for Challenge {challenge_id}.",
            )
        return ReadinessDecisionResponse.model_validate(decision)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
