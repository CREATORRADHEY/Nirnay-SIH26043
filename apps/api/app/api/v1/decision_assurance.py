import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_actor
from app.models.actor import Actor
from app.schemas.decision_assurance import (
    DecisionAssuranceCreate,
    DecisionAssuranceResponse,
    DecisionReviewRequestCreate,
    DecisionReviewRequestResponse,
    DisagreementResolutionCreate,
    SecondReviewCreate,
)
from app.services.decision_assurance_service import (
    create_decision_assurance,
    create_decision_review_request,
    get_assurance_records,
    get_review_requests,
    resolve_disagreement,
    submit_second_review,
)
from app.services.policy_service import PolicyService

router = APIRouter(tags=["decision-assurance"])


@router.post(
    "/challenges/{challenge_id}/decision-assurance",
    response_model=DecisionAssuranceResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Record decision assurance metadata for an authoritative decision",
)
def post_decision_assurance(
    challenge_id: uuid.UUID,
    payload: DecisionAssuranceCreate,
    actor: Actor = Depends(get_current_actor),
    db: Session = Depends(get_db),
) -> DecisionAssuranceResponse:
    if not PolicyService.can_perform_action(actor, "qualification:record"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only authorized reviewers can record decision assurance.",
        )

    try:
        record = create_decision_assurance(db, challenge_id, payload, actor)
        db.commit()
        db.refresh(record)
        return DecisionAssuranceResponse.model_validate(record)
    except ValueError as e:
        db.rollback()
        msg = str(e)
        if "not found" in msg.lower():
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=msg)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=msg)


@router.get(
    "/challenges/{challenge_id}/decision-assurance",
    response_model=List[DecisionAssuranceResponse],
    summary="List all decision assurance records for a challenge",
)
def get_challenge_decision_assurance(
    challenge_id: uuid.UUID,
    db: Session = Depends(get_db),
) -> List[DecisionAssuranceResponse]:
    try:
        items, _ = get_assurance_records(db, challenge_id)
        return [DecisionAssuranceResponse.model_validate(i) for i in items]
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.post(
    "/decision-assurance/{assurance_id}/second-review",
    response_model=DecisionAssuranceResponse,
    summary="Submit independent second review (enforces 2nd reviewer != 1st reviewer)",
)
def post_second_review(
    assurance_id: uuid.UUID,
    payload: SecondReviewCreate,
    actor: Actor = Depends(get_current_actor),
    db: Session = Depends(get_db),
) -> DecisionAssuranceResponse:
    if not PolicyService.can_perform_action(actor, "qualification:record"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only authorized reviewers can perform independent second reviews.",
        )

    try:
        record = submit_second_review(db, assurance_id, actor, payload)
        db.commit()
        db.refresh(record)
        return DecisionAssuranceResponse.model_validate(record)
    except ValueError as e:
        db.rollback()
        msg = str(e)
        if "not found" in msg.lower():
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=msg)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=msg)


@router.post(
    "/decision-assurance/{assurance_id}/resolve-disagreement",
    response_model=DecisionAssuranceResponse,
    summary="Resolve reviewer disagreement (Senior Reviewer / Admin)",
)
def post_resolve_disagreement(
    assurance_id: uuid.UUID,
    payload: DisagreementResolutionCreate,
    actor: Actor = Depends(get_current_actor),
    db: Session = Depends(get_db),
) -> DecisionAssuranceResponse:
    if not PolicyService.can_perform_action(actor, "admin:system") and not PolicyService.can_perform_action(actor, "qualification:record"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only senior government reviewers or administrators can resolve reviewer disagreement.",
        )

    try:
        record = resolve_disagreement(db, assurance_id, actor, payload)
        db.commit()
        db.refresh(record)
        return DecisionAssuranceResponse.model_validate(record)
    except ValueError as e:
        db.rollback()
        msg = str(e)
        if "not found" in msg.lower():
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=msg)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=msg)


@router.post(
    "/challenges/{challenge_id}/decision-assurance/{assurance_id}/review-requests",
    response_model=DecisionReviewRequestResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Submit a review request / appeal for a decision",
)
def post_review_request(
    challenge_id: uuid.UUID,
    assurance_id: uuid.UUID,
    payload: DecisionReviewRequestCreate,
    actor: Actor = Depends(get_current_actor),
    db: Session = Depends(get_db),
) -> DecisionReviewRequestResponse:
    try:
        req = create_decision_review_request(db, challenge_id, assurance_id, actor, payload)
        db.commit()
        db.refresh(req)
        return DecisionReviewRequestResponse.model_validate(req)
    except ValueError as e:
        db.rollback()
        msg = str(e)
        if "not found" in msg.lower():
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=msg)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=msg)


@router.get(
    "/challenges/{challenge_id}/decision-assurance/review-requests",
    response_model=List[DecisionReviewRequestResponse],
    summary="List all review requests for a challenge",
)
def get_challenge_review_requests(
    challenge_id: uuid.UUID,
    db: Session = Depends(get_db),
) -> List[DecisionReviewRequestResponse]:
    try:
        items, _ = get_review_requests(db, challenge_id)
        return [DecisionReviewRequestResponse.model_validate(i) for i in items]
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
