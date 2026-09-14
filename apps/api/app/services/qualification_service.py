from typing import List, Optional
import uuid

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.actor import Actor
from app.models.challenge import Challenge
from app.models.evidence import Evidence
from app.models.qualification_decision import QualificationDecision
from app.schemas.qualification import QualificationDecisionCreate


def create_qualification_decision(
    db: Session, challenge_id: uuid.UUID, schema: QualificationDecisionCreate
) -> QualificationDecision:
    """Creates a new append-only QualificationDecision version for a Challenge.

    Enforces:
    - Challenge existence & PostgreSQL row locking for safe version allocation.
    - Deciding Actor existence.
    - Evidence items existence and parent Challenge validation.
    - Safe server-side version allocation (max version + 1).
    Does NOT commit the transaction automatically.
    """
    challenge = db.get(Challenge, challenge_id)
    if challenge is None:
        raise ValueError(f"Challenge {challenge_id} not found.")

    # Lock parent challenge row for update if supported dialect
    if db.bind and db.bind.dialect.name == "postgresql":
        db.execute(select(Challenge).where(Challenge.id == challenge_id).with_for_update())

    actor = db.get(Actor, schema.decided_by_actor_id)
    if actor is None:
        raise ValueError(f"Actor {schema.decided_by_actor_id} not found.")

    evidence_items = []
    for ev_id in schema.evidence_ids:
        ev = db.get(Evidence, ev_id)
        if ev is None:
            raise ValueError(f"Evidence {ev_id} not found.")
        if ev.challenge_id != challenge_id:
            raise ValueError(f"Evidence {ev_id} does not belong to Challenge {challenge_id}.")
        evidence_items.append(ev)

    max_ver = db.scalar(
        select(func.max(QualificationDecision.version)).where(
            QualificationDecision.challenge_id == challenge_id
        )
    )
    next_version = (max_ver or 0) + 1

    decision = QualificationDecision(
        challenge_id=challenge_id,
        route=schema.route,
        version=next_version,
        rationale=schema.rationale.strip(),
        decided_by_actor_id=schema.decided_by_actor_id,
        evidence_items=evidence_items,
    )
    db.add(decision)
    db.flush()
    return decision


def get_qualification_history(
    db: Session, challenge_id: uuid.UUID
) -> tuple[List[QualificationDecision], int]:
    """Retrieves the ordered qualification decision history (version ASC) for a Challenge."""
    challenge = db.get(Challenge, challenge_id)
    if challenge is None:
        raise ValueError(f"Challenge {challenge_id} not found.")

    stmt = (
        select(QualificationDecision)
        .where(QualificationDecision.challenge_id == challenge_id)
        .order_by(QualificationDecision.version.asc())
    )
    items = list(db.scalars(stmt).all())
    return items, len(items)


def get_latest_qualification_decision(
    db: Session, challenge_id: uuid.UUID
) -> Optional[QualificationDecision]:
    """Retrieves the latest QualificationDecision (highest version) for a Challenge."""
    challenge = db.get(Challenge, challenge_id)
    if challenge is None:
        raise ValueError(f"Challenge {challenge_id} not found.")

    stmt = (
        select(QualificationDecision)
        .where(QualificationDecision.challenge_id == challenge_id)
        .order_by(QualificationDecision.version.desc())
        .limit(1)
    )
    return db.scalars(stmt).first()
