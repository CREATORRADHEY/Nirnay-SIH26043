import uuid
from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy.orm import Session, joinedload

from app.models.clarification import ClarificationRequest, ClarificationResponse
from app.models.challenge import Challenge
from app.services.notification_service import create_notification


def create_clarification_request(
    db: Session,
    challenge_id: uuid.UUID,
    question: str,
    requested_by_actor_id: uuid.UUID,
    due_date: Optional[datetime] = None,
) -> ClarificationRequest:
    challenge = db.query(Challenge).filter(Challenge.id == challenge_id).first()
    if not challenge:
        raise ValueError(f"Challenge {challenge_id} not found.")

    request = ClarificationRequest(
        challenge_id=challenge_id,
        question=question,
        requested_by_actor_id=requested_by_actor_id,
        status="OPEN",
        due_date=due_date,
    )
    db.add(request)
    db.commit()
    db.refresh(request)

    # Notify challenge submitter if exists
    if challenge.submitted_by_actor_id:
        create_notification(
            db,
            recipient_actor_id=challenge.submitted_by_actor_id,
            type="CLARIFICATION_REQUESTED",
            title="Clarification Requested on Your Challenge",
            message=f"A reviewer requested clarification for '{challenge.title}': {question[:100]}...",
            resource_type="challenge",
            resource_id=challenge.id,
        )

    return request


def list_clarifications_for_challenge(
    db: Session, challenge_id: uuid.UUID
) -> List[ClarificationRequest]:
    return (
        db.query(ClarificationRequest)
        .options(joinedload(ClarificationRequest.responses))
        .filter(ClarificationRequest.challenge_id == challenge_id)
        .order_by(ClarificationRequest.requested_at.asc())
        .all()
    )


def create_clarification_response(
    db: Session,
    request_id: uuid.UUID,
    response_text: str,
    responded_by_actor_id: uuid.UUID,
) -> ClarificationResponse:
    request = (
        db.query(ClarificationRequest)
        .filter(ClarificationRequest.id == request_id)
        .first()
    )
    if not request:
        raise ValueError(f"Clarification request {request_id} not found.")

    response = ClarificationResponse(
        request_id=request_id,
        response=response_text,
        responded_by_actor_id=responded_by_actor_id,
    )
    request.status = "RESPONDED"
    db.add(response)
    db.commit()
    db.refresh(response)

    # Notify requesting actor
    challenge = db.query(Challenge).filter(Challenge.id == request.challenge_id).first()
    challenge_title = challenge.title if challenge else "Challenge"
    create_notification(
        db,
        recipient_actor_id=request.requested_by_actor_id,
        type="CLARIFICATION_RESPONDED",
        title="Clarification Response Submitted",
        message=f"Clarification response received for '{challenge_title}'.",
        resource_type="challenge",
        resource_id=request.challenge_id,
    )

    return response


def resolve_clarification(
    db: Session, request_id: uuid.UUID, actor_id: uuid.UUID
) -> ClarificationRequest:
    request = (
        db.query(ClarificationRequest)
        .filter(ClarificationRequest.id == request_id)
        .first()
    )
    if not request:
        raise ValueError(f"Clarification request {request_id} not found.")

    request.status = "RESOLVED"
    request.resolved_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(request)
    return request
