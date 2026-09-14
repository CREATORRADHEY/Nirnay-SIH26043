"""Pilot Authorization Service.

Enforces that field pilots are authorized strictly from human-attributed PILOT_READY readiness decisions.
"""

from datetime import datetime
import uuid
from typing import Optional
from sqlalchemy.orm import Session

from app.core.enums import OperationalStatus, ReadinessStatus
from app.models.pilot import Pilot
from app.models.pilot_operational_state import PilotOperationalState
from app.models.readiness_decision import ReadinessDecision


def create_authorized_pilot(
    session: Session,
    challenge_id: uuid.UUID,
    readiness_decision_id: uuid.UUID,
    name: str,
    created_by_actor_id: uuid.UUID,
    host_organization_id: Optional[uuid.UUID] = None,
    site_description: Optional[str] = None,
    planned_start: Optional[datetime] = None,
    planned_end: Optional[datetime] = None,
) -> Pilot:
    """Creates a new field Pilot strictly authorized from a human-attributed PILOT_READY decision.

    RULES:
    1. Fetch ReadinessDecision by readiness_decision_id.
    2. Verify decision belongs to specified challenge_id.
    3. Verify decision status == PILOT_READY.
    4. Verify decision has human actor attribution (decided_by_actor_id IS NOT NULL).
    5. Instantiate Pilot + initial PilotOperationalState (PLANNED, v1).
    6. Flush session, return Pilot without committing transaction.
    """
    decision = session.get(ReadinessDecision, readiness_decision_id)
    if decision is None:
        raise ValueError(f"ReadinessDecision {readiness_decision_id} not found.")

    if decision.challenge_id != challenge_id:
        raise ValueError(
            f"ReadinessDecision {readiness_decision_id} belongs to challenge {decision.challenge_id}, "
            f"not target challenge {challenge_id}."
        )

    if decision.status != ReadinessStatus.PILOT_READY:
        raise ValueError(
            f"Cannot authorize pilot: readiness decision status is '{decision.status.value}', "
            f"expected '{ReadinessStatus.PILOT_READY.value}'."
        )

    if decision.decided_by_actor_id is None:
        raise ValueError(
            f"Cannot authorize pilot: readiness decision {readiness_decision_id} lacks required human actor attribution."
        )

    pilot = Pilot(
        challenge_id=challenge_id,
        authorized_by_readiness_decision_id=readiness_decision_id,
        host_organization_id=host_organization_id,
        name=name,
        site_description=site_description,
        planned_start=planned_start,
        planned_end=planned_end,
        created_by_actor_id=created_by_actor_id,
    )
    session.add(pilot)
    session.flush()

    initial_op_state = PilotOperationalState(
        pilot_id=pilot.id,
        status=OperationalStatus.PLANNED,
        version=1,
        rationale=f"Pilot authorized from PILOT_READY decision version {decision.version}.",
        recorded_by_actor_id=created_by_actor_id,
    )
    session.add(initial_op_state)
    session.flush()

    return pilot
