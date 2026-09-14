from typing import List, Optional
import uuid

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.enums import CommitmentStatus, OrganizationType
from app.models.actor import Actor
from app.models.challenge import Challenge
from app.models.challenge_hei_candidate import ChallengeHEICandidate
from app.models.commitment import Commitment
from app.models.organization import Organization
from app.schemas.commitment import CommitmentCreate
from app.services.readiness_integrity import invalidate_readiness_for_commitment_change


def create_commitment_version(
    db: Session, challenge_id: uuid.UUID, schema: CommitmentCreate
) -> Commitment:
    """Creates a new version of a logical Commitment series for a Challenge.

    Enforces:
    - Challenge, Organization, and Actor existence.
    - Safe PostgreSQL row locking on parent Challenge.
    - Candidate check prior to accepting an ACCEPTED commitment.
    - expected_version optimistic concurrency check.
    - Append-only version increment.
    - Automatic readiness dependency invalidation in the SAME transaction.
    Does NOT commit the transaction automatically.
    """
    challenge = db.get(Challenge, challenge_id)
    if challenge is None:
        raise ValueError(f"Challenge {challenge_id} not found.")

    if db.bind and db.bind.dialect.name == "postgresql":
        db.execute(select(Challenge).where(Challenge.id == challenge_id).with_for_update())

    org = db.get(Organization, schema.organization_id)
    if org is None:
        raise ValueError(f"Organization {schema.organization_id} not found.")

    actor = db.get(Actor, schema.recorded_by_actor_id)
    if actor is None:
        raise ValueError(f"Actor {schema.recorded_by_actor_id} not found.")

    if schema.status == CommitmentStatus.ACCEPTED and org.organization_type == OrganizationType.HEI:
        cand = db.scalars(
            select(ChallengeHEICandidate).where(
                ChallengeHEICandidate.challenge_id == challenge_id,
                ChallengeHEICandidate.organization_id == schema.organization_id,
            )
        ).first()
        if cand is None:
            raise ValueError(
                f"Organization {schema.organization_id} is not an HEI candidate for Challenge {challenge_id}."
            )

    c_type = schema.commitment_type.strip()
    max_ver = db.scalar(
        select(func.max(Commitment.version)).where(
            Commitment.challenge_id == challenge_id,
            Commitment.organization_id == schema.organization_id,
            Commitment.commitment_type == c_type,
        )
    )
    actual_current_version = max_ver or 0

    if schema.expected_version != actual_current_version:
        raise ValueError(
            f"Commitment version mismatch: expected {schema.expected_version}, actual current version is {actual_current_version}."
        )

    new_version = actual_current_version + 1

    commitment = Commitment(
        challenge_id=challenge_id,
        organization_id=schema.organization_id,
        commitment_type=c_type,
        status=schema.status,
        version=new_version,
        scope_description=schema.scope_description.strip(),
        recorded_by_actor_id=schema.recorded_by_actor_id,
        valid_from=schema.valid_from,
        valid_until=schema.valid_until,
    )
    db.add(commitment)
    db.flush()

    # Trigger dependency invalidation in the SAME transaction
    invalidate_readiness_for_commitment_change(db, commitment)

    return commitment


def list_commitments(
    db: Session,
    challenge_id: uuid.UUID,
    organization_id: Optional[uuid.UUID] = None,
    commitment_type: Optional[str] = None,
) -> tuple[List[Commitment], int]:
    """Lists commitments for a Challenge with optional org/type filters."""
    challenge = db.get(Challenge, challenge_id)
    if challenge is None:
        raise ValueError(f"Challenge {challenge_id} not found.")

    stmt = select(Commitment).where(Commitment.challenge_id == challenge_id)
    if organization_id:
        stmt = stmt.where(Commitment.organization_id == organization_id)
    if commitment_type:
        stmt = stmt.where(Commitment.commitment_type == commitment_type.strip())

    stmt = stmt.order_by(Commitment.created_at.desc(), Commitment.version.desc())
    items = list(db.scalars(stmt).all())
    return items, len(items)


def get_commitment_history(
    db: Session, challenge_id: uuid.UUID, organization_id: uuid.UUID, commitment_type: str
) -> tuple[List[Commitment], int]:
    """Lists full version history for a logical commitment series (version ASC)."""
    challenge = db.get(Challenge, challenge_id)
    if challenge is None:
        raise ValueError(f"Challenge {challenge_id} not found.")

    stmt = (
        select(Commitment)
        .where(
            Commitment.challenge_id == challenge_id,
            Commitment.organization_id == organization_id,
            Commitment.commitment_type == commitment_type.strip(),
        )
        .order_by(Commitment.version.asc())
    )
    items = list(db.scalars(stmt).all())
    return items, len(items)
