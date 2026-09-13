from typing import List, Optional
import uuid

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.enums import OperationalStatus
from app.models.actor import Actor
from app.models.challenge import Challenge
from app.models.organization import Organization
from app.models.pilot import Pilot
from app.models.pilot_evidence_plan import PilotEvidencePlan
from app.models.pilot_operational_state import PilotOperationalState
from app.schemas.pilot import (
    PilotCreate,
    PilotEvidencePlanCreate,
    PilotOperationalStateCreate,
)
from app.services.pilot_authorization import create_authorized_pilot
from app.services.readiness_service import get_latest_readiness_decision


def create_pilot(db: Session, challenge_id: uuid.UUID, schema: PilotCreate) -> Pilot:
    """Creates a new authorized field Pilot for a Challenge.

    Enforces:
    - Challenge, Actor, and Host Organization existence.
    - Referenced readiness decision MUST be the CURRENT latest readiness decision for the Challenge.
    - Current decision MUST have status == PILOT_READY and human actor attribution.
    - Automatic instantiation of initial PLANNED v1 operational state.
    Does NOT commit the transaction automatically.
    """
    challenge = db.get(Challenge, challenge_id)
    if challenge is None:
        raise ValueError(f"Challenge {challenge_id} not found.")

    if db.bind and db.bind.dialect.name == "postgresql":
        db.execute(select(Challenge).where(Challenge.id == challenge_id).with_for_update())

    actor = db.get(Actor, schema.created_by_actor_id)
    if actor is None:
        raise ValueError(f"Actor {schema.created_by_actor_id} not found.")

    if schema.host_organization_id is not None:
        org = db.get(Organization, schema.host_organization_id)
        if org is None:
            raise ValueError(f"Organization {schema.host_organization_id} not found.")

    latest_dec = get_latest_readiness_decision(db, challenge_id)
    if latest_dec is None:
        raise ValueError(f"Challenge {challenge_id} has no readiness decisions.")

    if latest_dec.id != schema.authorized_by_readiness_decision_id:
        raise ValueError(
            f"Stale readiness decision: referenced decision {schema.authorized_by_readiness_decision_id} is not the latest readiness decision for Challenge {challenge_id}."
        )

    pilot = create_authorized_pilot(
        db,
        challenge_id=challenge_id,
        readiness_decision_id=schema.authorized_by_readiness_decision_id,
        name=schema.name.strip(),
        created_by_actor_id=schema.created_by_actor_id,
        host_organization_id=schema.host_organization_id,
        site_description=schema.site_description.strip() if schema.site_description else None,
        planned_start=schema.planned_start,
        planned_end=schema.planned_end,
    )
    return pilot


def list_challenge_pilots(
    db: Session, challenge_id: uuid.UUID
) -> tuple[List[Pilot], int]:
    """Lists pilots for a Challenge (created_at ASC, id ASC)."""
    challenge = db.get(Challenge, challenge_id)
    if challenge is None:
        raise ValueError(f"Challenge {challenge_id} not found.")

    stmt = (
        select(Pilot)
        .where(Pilot.challenge_id == challenge_id)
        .order_by(Pilot.created_at.asc(), Pilot.id.asc())
    )
    items = list(db.scalars(stmt).all())
    return items, len(items)


def get_pilot(db: Session, pilot_id: uuid.UUID) -> Optional[Pilot]:
    """Fetches a Pilot by primary key ID."""
    return db.get(Pilot, pilot_id)


def create_pilot_operational_state(
    db: Session, pilot_id: uuid.UUID, schema: PilotOperationalStateCreate
) -> PilotOperationalState:
    """Appends a new versioned PilotOperationalState.

    Enforces:
    - Pilot and Actor existence.
    - expected_version concurrency protection.
    - Valid operational state transition rules.
    Does NOT commit the transaction automatically.
    """
    pilot = db.get(Pilot, pilot_id)
    if pilot is None:
        raise ValueError(f"Pilot {pilot_id} not found.")

    if db.bind and db.bind.dialect.name == "postgresql":
        db.execute(select(Pilot).where(Pilot.id == pilot_id).with_for_update())

    actor = db.get(Actor, schema.recorded_by_actor_id)
    if actor is None:
        raise ValueError(f"Actor {schema.recorded_by_actor_id} not found.")

    latest_state = db.scalars(
        select(PilotOperationalState)
        .where(PilotOperationalState.pilot_id == pilot_id)
        .order_by(PilotOperationalState.version.desc())
        .limit(1)
    ).first()

    current_version = latest_state.version if latest_state else 0
    current_status = latest_state.status if latest_state else None

    if schema.expected_version != current_version:
        raise ValueError(
            f"Operational state version mismatch: expected {schema.expected_version}, actual current version is {current_version}."
        )

    # Operational transition rules
    allowed_map = {
        OperationalStatus.PLANNED: [OperationalStatus.ACTIVE, OperationalStatus.STOPPED],
        OperationalStatus.ACTIVE: [OperationalStatus.COMPLETED, OperationalStatus.STOPPED],
        OperationalStatus.COMPLETED: [],
        OperationalStatus.STOPPED: [],
    }

    if current_status and schema.status not in allowed_map.get(current_status, []):
        raise ValueError(
            f"Invalid operational transition from {current_status.value} to {schema.status.value}."
        )

    new_version = current_version + 1

    state = PilotOperationalState(
        pilot_id=pilot_id,
        status=schema.status,
        version=new_version,
        rationale=schema.rationale.strip(),
        recorded_by_actor_id=schema.recorded_by_actor_id,
    )
    db.add(state)
    db.flush()
    return state


def get_pilot_operational_history(
    db: Session, pilot_id: uuid.UUID
) -> tuple[List[PilotOperationalState], int]:
    """Retrieves ordered operational state history (version ASC) for a Pilot."""
    pilot = db.get(Pilot, pilot_id)
    if pilot is None:
        raise ValueError(f"Pilot {pilot_id} not found.")

    stmt = (
        select(PilotOperationalState)
        .where(PilotOperationalState.pilot_id == pilot_id)
        .order_by(PilotOperationalState.version.asc())
    )
    items = list(db.scalars(stmt).all())
    return items, len(items)


def get_latest_pilot_operational_state(
    db: Session, pilot_id: uuid.UUID
) -> Optional[PilotOperationalState]:
    """Retrieves the latest operational state for a Pilot."""
    pilot = db.get(Pilot, pilot_id)
    if pilot is None:
        raise ValueError(f"Pilot {pilot_id} not found.")

    stmt = (
        select(PilotOperationalState)
        .where(PilotOperationalState.pilot_id == pilot_id)
        .order_by(PilotOperationalState.version.desc())
        .limit(1)
    )
    return db.scalars(stmt).first()


def create_evidence_plan_version(
    db: Session, pilot_id: uuid.UUID, schema: PilotEvidencePlanCreate
) -> PilotEvidencePlan:
    """Appends a new versioned PilotEvidencePlan for a Pilot."""
    pilot = db.get(Pilot, pilot_id)
    if pilot is None:
        raise ValueError(f"Pilot {pilot_id} not found.")

    if db.bind and db.bind.dialect.name == "postgresql":
        db.execute(select(Pilot).where(Pilot.id == pilot_id).with_for_update())

    actor = db.get(Actor, schema.created_by_actor_id)
    if actor is None:
        raise ValueError(f"Actor {schema.created_by_actor_id} not found.")

    max_ver = db.scalar(
        select(func.max(PilotEvidencePlan.version)).where(
            PilotEvidencePlan.pilot_id == pilot_id
        )
    )
    current_version = max_ver or 0

    if schema.expected_version != current_version:
        raise ValueError(
            f"Evidence plan version mismatch: expected {schema.expected_version}, actual current version is {current_version}."
        )

    new_version = current_version + 1

    plan = PilotEvidencePlan(
        pilot_id=pilot_id,
        version=new_version,
        objective=schema.objective.strip(),
        primary_metric=schema.primary_metric.strip(),
        baseline_definition=schema.baseline_definition.strip(),
        denominator_definition=schema.denominator_definition.strip(),
        data_collection_method=schema.data_collection_method.strip(),
        evaluation_window=schema.evaluation_window.strip() if schema.evaluation_window else None,
        success_criteria=schema.success_criteria.strip() if schema.success_criteria else None,
        limitations=schema.limitations.strip() if schema.limitations else None,
        created_by_actor_id=schema.created_by_actor_id,
    )
    db.add(plan)
    db.flush()
    return plan


def get_evidence_plan_history(
    db: Session, pilot_id: uuid.UUID
) -> tuple[List[PilotEvidencePlan], int]:
    """Retrieves ordered evidence plan history (version ASC) for a Pilot."""
    pilot = db.get(Pilot, pilot_id)
    if pilot is None:
        raise ValueError(f"Pilot {pilot_id} not found.")

    stmt = (
        select(PilotEvidencePlan)
        .where(PilotEvidencePlan.pilot_id == pilot_id)
        .order_by(PilotEvidencePlan.version.asc())
    )
    items = list(db.scalars(stmt).all())
    return items, len(items)


def get_latest_evidence_plan(
    db: Session, pilot_id: uuid.UUID
) -> Optional[PilotEvidencePlan]:
    """Retrieves the latest evidence plan for a Pilot."""
    pilot = db.get(Pilot, pilot_id)
    if pilot is None:
        raise ValueError(f"Pilot {pilot_id} not found.")

    stmt = (
        select(PilotEvidencePlan)
        .where(PilotEvidencePlan.pilot_id == pilot_id)
        .order_by(PilotEvidencePlan.version.desc())
        .limit(1)
    )
    return db.scalars(stmt).first()
