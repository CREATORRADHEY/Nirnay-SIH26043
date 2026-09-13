from typing import List, Optional
import uuid

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.actor import Actor
from app.models.challenge import Challenge
from app.models.organization import Organization
from app.schemas.challenge import ChallengeCreate


def create_challenge(db: Session, schema: ChallengeCreate) -> Challenge:
    """Creates a new factual Challenge record.

    Enforces reference validation for submitted_by_actor_id and source_organization_id.
    Does NOT commit the transaction automatically.
    """
    if schema.submitted_by_actor_id is not None:
        actor = db.get(Actor, schema.submitted_by_actor_id)
        if actor is None:
            raise ValueError(f"Actor {schema.submitted_by_actor_id} not found.")

    if schema.source_organization_id is not None:
        org = db.get(Organization, schema.source_organization_id)
        if org is None:
            raise ValueError(f"Organization {schema.source_organization_id} not found.")

    challenge = Challenge(
        title=schema.title.strip(),
        summary=schema.summary.strip(),
        description=schema.description.strip(),
        domain=schema.domain.strip(),
        source_type=schema.source_type.strip(),
        district=schema.district.strip(),
        state=schema.state.strip(),
        submitted_by_actor_id=schema.submitted_by_actor_id,
        source_organization_id=schema.source_organization_id,
    )
    db.add(challenge)
    db.flush()
    return challenge


def get_challenge(db: Session, challenge_id: uuid.UUID) -> Optional[Challenge]:
    """Fetches a Challenge record by primary key ID."""
    return db.get(Challenge, challenge_id)


def list_challenges(
    db: Session,
    district: Optional[str] = None,
    domain: Optional[str] = None,
    source_type: Optional[str] = None,
    limit: int = 20,
    offset: int = 0,
) -> tuple[List[Challenge], int]:
    """Lists Challenge records with deterministic ordering (created_at DESC, id DESC) and optional filtering."""
    safe_limit = max(1, min(limit, 100))
    safe_offset = max(0, offset)

    stmt = select(Challenge)
    count_stmt = select(func.count(Challenge.id))

    if district:
        stmt = stmt.where(Challenge.district == district.strip())
        count_stmt = count_stmt.where(Challenge.district == district.strip())
    if domain:
        stmt = stmt.where(Challenge.domain == domain.strip())
        count_stmt = count_stmt.where(Challenge.domain == domain.strip())
    if source_type:
        stmt = stmt.where(Challenge.source_type == source_type.strip())
        count_stmt = count_stmt.where(Challenge.source_type == source_type.strip())

    total = db.scalar(count_stmt) or 0

    stmt = stmt.order_by(Challenge.created_at.desc(), Challenge.id.desc()).limit(safe_limit).offset(safe_offset)
    items = list(db.scalars(stmt).all())

    return items, total
