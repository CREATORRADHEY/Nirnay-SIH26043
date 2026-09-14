from typing import List, Optional
import uuid

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.enums import ConditionStatus, ReadinessStatus
from app.models.actor import Actor
from app.models.challenge import Challenge
from app.models.commitment import Commitment
from app.models.readiness_condition import ReadinessCondition
from app.models.readiness_decision import ReadinessDecision
from app.schemas.readiness import ReadinessConditionCreate, ReadinessDecisionCreate


def create_readiness_condition_version(
    db: Session, challenge_id: uuid.UUID, schema: ReadinessConditionCreate
) -> ReadinessCondition:
    """Creates a new version of a logical ReadinessCondition series for a Challenge."""
    challenge = db.get(Challenge, challenge_id)
    if challenge is None:
        raise ValueError(f"Challenge {challenge_id} not found.")

    if db.bind and db.bind.dialect.name == "postgresql":
        db.execute(select(Challenge).where(Challenge.id == challenge_id).with_for_update())

    actor = db.get(Actor, schema.assessed_by_actor_id)
    if actor is None:
        raise ValueError(f"Actor {schema.assessed_by_actor_id} not found.")

    commitments = []
    for c_id in schema.commitment_dependency_ids:
        c = db.get(Commitment, c_id)
        if c is None:
            raise ValueError(f"Commitment {c_id} not found.")
        if c.challenge_id != challenge_id:
            raise ValueError(f"Commitment {c_id} does not belong to Challenge {challenge_id}.")
        commitments.append(c)

    ck = schema.condition_key.strip()
    max_ver = db.scalar(
        select(func.max(ReadinessCondition.version)).where(
            ReadinessCondition.challenge_id == challenge_id,
            ReadinessCondition.condition_key == ck,
        )
    )
    actual_current_version = max_ver or 0

    if schema.expected_version != actual_current_version:
        raise ValueError(
            f"Readiness condition version mismatch: expected {schema.expected_version}, actual current version is {actual_current_version}."
        )

    new_version = actual_current_version + 1

    cond = ReadinessCondition(
        challenge_id=challenge_id,
        condition_key=ck,
        status=schema.status,
        version=new_version,
        rationale=schema.rationale.strip(),
        assessed_by_actor_id=schema.assessed_by_actor_id,
        valid_until=schema.valid_until,
        commitment_dependencies=commitments,
    )
    db.add(cond)
    db.flush()
    return cond


def list_readiness_conditions(
    db: Session, challenge_id: uuid.UUID
) -> tuple[List[ReadinessCondition], int]:
    """Lists readiness conditions for a Challenge (condition_key ASC, version ASC)."""
    challenge = db.get(Challenge, challenge_id)
    if challenge is None:
        raise ValueError(f"Challenge {challenge_id} not found.")

    stmt = (
        select(ReadinessCondition)
        .where(ReadinessCondition.challenge_id == challenge_id)
        .order_by(ReadinessCondition.condition_key.asc(), ReadinessCondition.version.asc())
    )
    items = list(db.scalars(stmt).all())
    return items, len(items)


def get_latest_readiness_conditions(
    db: Session, challenge_id: uuid.UUID
) -> tuple[List[ReadinessCondition], int]:
    """Lists the latest version of each condition_key for a Challenge."""
    challenge = db.get(Challenge, challenge_id)
    if challenge is None:
        raise ValueError(f"Challenge {challenge_id} not found.")

    subq = (
        select(
            ReadinessCondition.condition_key,
            func.max(ReadinessCondition.version).label("max_ver"),
        )
        .where(ReadinessCondition.challenge_id == challenge_id)
        .group_by(ReadinessCondition.condition_key)
        .subquery()
    )

    stmt = (
        select(ReadinessCondition)
        .join(
            subq,
            (ReadinessCondition.condition_key == subq.c.condition_key)
            & (ReadinessCondition.version == subq.c.max_ver),
        )
        .where(ReadinessCondition.challenge_id == challenge_id)
        .order_by(ReadinessCondition.condition_key.asc())
    )
    items = list(db.scalars(stmt).all())
    return items, len(items)


def create_readiness_decision(
    db: Session, challenge_id: uuid.UUID, schema: ReadinessDecisionCreate
) -> ReadinessDecision:
    """Creates a human ReadinessDecision for a Challenge.

    Enforces:
    - Challenge and Actor existence.
    - expected_version optimistic concurrency check.
    - Strict PILOT_READY validation (non-empty, all SATISFIED, all latest condition versions).
    Does NOT commit transaction automatically.
    """
    challenge = db.get(Challenge, challenge_id)
    if challenge is None:
        raise ValueError(f"Challenge {challenge_id} not found.")

    if db.bind and db.bind.dialect.name == "postgresql":
        db.execute(select(Challenge).where(Challenge.id == challenge_id).with_for_update())

    actor = db.get(Actor, schema.decided_by_actor_id)
    if actor is None:
        raise ValueError(f"Actor {schema.decided_by_actor_id} not found.")

    max_ver = db.scalar(
        select(func.max(ReadinessDecision.version)).where(
            ReadinessDecision.challenge_id == challenge_id
        )
    )
    actual_current_version = max_ver or 0

    if schema.expected_version != actual_current_version:
        raise ValueError(
            f"Readiness decision version mismatch: expected {schema.expected_version}, actual current version is {actual_current_version}."
        )

    conditions = []
    for cond_id in schema.condition_ids:
        cond = db.get(ReadinessCondition, cond_id)
        if cond is None:
            raise ValueError(f"Readiness condition {cond_id} not found.")
        if cond.challenge_id != challenge_id:
            raise ValueError(
                f"Readiness condition {cond_id} does not belong to Challenge {challenge_id}."
            )
        conditions.append(cond)

    if schema.status == ReadinessStatus.PILOT_READY:
        if not conditions:
            raise ValueError("PILOT_READY requires non-empty condition_ids.")

        for c in conditions:
            if c.status != ConditionStatus.SATISFIED:
                raise ValueError(
                    f"Condition {c.id} ({c.condition_key}) has status {c.status.value}, but PILOT_READY requires SATISFIED."
                )

            latest_ver = db.scalar(
                select(func.max(ReadinessCondition.version)).where(
                    ReadinessCondition.challenge_id == challenge_id,
                    ReadinessCondition.condition_key == c.condition_key,
                )
            )
            if c.version != latest_ver:
                raise ValueError(
                    f"Condition {c.id} ({c.condition_key}) is version {c.version}, but latest version is {latest_ver}."
                )

    new_version = actual_current_version + 1

    decision = ReadinessDecision(
        challenge_id=challenge_id,
        status=schema.status,
        version=new_version,
        rationale=schema.rationale.strip(),
        decided_by_actor_id=schema.decided_by_actor_id,
        conditions=conditions,
    )
    db.add(decision)
    db.flush()
    return decision


def get_readiness_history(
    db: Session, challenge_id: uuid.UUID
) -> tuple[List[ReadinessDecision], int]:
    """Retrieves ordered readiness decision history (version ASC) for a Challenge."""
    challenge = db.get(Challenge, challenge_id)
    if challenge is None:
        raise ValueError(f"Challenge {challenge_id} not found.")

    stmt = (
        select(ReadinessDecision)
        .where(ReadinessDecision.challenge_id == challenge_id)
        .order_by(ReadinessDecision.version.asc())
    )
    items = list(db.scalars(stmt).all())
    return items, len(items)


def get_latest_readiness_decision(
    db: Session, challenge_id: uuid.UUID
) -> Optional[ReadinessDecision]:
    """Retrieves the latest ReadinessDecision for a Challenge."""
    challenge = db.get(Challenge, challenge_id)
    if challenge is None:
        raise ValueError(f"Challenge {challenge_id} not found.")

    stmt = (
        select(ReadinessDecision)
        .where(ReadinessDecision.challenge_id == challenge_id)
        .order_by(ReadinessDecision.version.desc())
        .limit(1)
    )
    return db.scalars(stmt).first()
