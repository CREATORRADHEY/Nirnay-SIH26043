from typing import List, Optional
import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.actor import Actor
from app.models.challenge import Challenge
from app.models.evidence import Evidence
from app.schemas.evidence import EvidenceCreate


def create_evidence(db: Session, challenge_id: uuid.UUID, schema: EvidenceCreate) -> Evidence:
    """Creates a new Evidence metadata record attached to a Challenge.

    Enforces that Challenge and optional Actor exist.
    Does NOT commit the transaction automatically.
    """
    challenge = db.get(Challenge, challenge_id)
    if challenge is None:
        raise ValueError(f"Challenge {challenge_id} not found.")

    if schema.submitted_by_actor_id is not None:
        actor = db.get(Actor, schema.submitted_by_actor_id)
        if actor is None:
            raise ValueError(f"Actor {schema.submitted_by_actor_id} not found.")

    evidence = Evidence(
        challenge_id=challenge_id,
        submitted_by_actor_id=schema.submitted_by_actor_id,
        evidence_type=schema.evidence_type.strip(),
        storage_reference=schema.storage_reference.strip(),
        description=schema.description.strip() if schema.description else None,
        captured_at=schema.captured_at,
    )
    db.add(evidence)
    db.flush()
    return evidence


def list_challenge_evidence(db: Session, challenge_id: uuid.UUID) -> tuple[List[Evidence], int]:
    """Lists all Evidence metadata records for a given Challenge."""
    challenge = db.get(Challenge, challenge_id)
    if challenge is None:
        raise ValueError(f"Challenge {challenge_id} not found.")

    stmt = select(Evidence).where(Evidence.challenge_id == challenge_id).order_by(Evidence.submitted_at.desc(), Evidence.id.desc())
    items = list(db.scalars(stmt).all())
    return items, len(items)
