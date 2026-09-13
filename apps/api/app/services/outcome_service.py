from typing import List, Optional
import uuid

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.enums import EvidenceConclusion
from app.models.actor import Actor
from app.models.evidence import Evidence
from app.models.outcome_assessment import OutcomeAssessment
from app.models.pilot import Pilot
from app.models.pilot_evidence_plan import PilotEvidencePlan
from app.schemas.outcome import OutcomeAssessmentCreate


def create_outcome_assessment(
    db: Session, pilot_id: uuid.UUID, schema: OutcomeAssessmentCreate
) -> OutcomeAssessment:
    """Creates a new append-only OutcomeAssessment version for a Pilot.

    Enforces:
    - Pilot and EvidencePlan existence.
    - EvidencePlan belonging to target Pilot.
    - Human actor attribution for VALIDATED, ITERATE, INCONCLUSIVE conclusions.
    - Supporting Evidence belonging to target Pilot's Challenge.
    - expected_version optimistic concurrency check.
    Does NOT commit the transaction automatically.
    """
    pilot = db.get(Pilot, pilot_id)
    if pilot is None:
        raise ValueError(f"Pilot {pilot_id} not found.")

    if db.bind and db.bind.dialect.name == "postgresql":
        db.execute(select(Pilot).where(Pilot.id == pilot_id).with_for_update())

    plan = db.get(PilotEvidencePlan, schema.evidence_plan_id)
    if plan is None:
        raise ValueError(f"Evidence plan {schema.evidence_plan_id} not found.")
    if plan.pilot_id != pilot_id:
        raise ValueError(
            f"Evidence plan {schema.evidence_plan_id} does not belong to Pilot {pilot_id}."
        )

    if schema.conclusion != EvidenceConclusion.NOT_REVIEWED and schema.assessed_by_actor_id is None:
        raise ValueError(
            f"Conclusion {schema.conclusion.value} requires human actor attribution (assessed_by_actor_id)."
        )

    if schema.assessed_by_actor_id is not None:
        actor = db.get(Actor, schema.assessed_by_actor_id)
        if actor is None:
            raise ValueError(f"Actor {schema.assessed_by_actor_id} not found.")

    evidence_items = []
    for ev_id in schema.evidence_ids:
        ev = db.get(Evidence, ev_id)
        if ev is None:
            raise ValueError(f"Evidence {ev_id} not found.")
        if ev.challenge_id != pilot.challenge_id:
            raise ValueError(
                f"Evidence {ev_id} does not belong to Challenge {pilot.challenge_id}."
            )
        evidence_items.append(ev)

    max_ver = db.scalar(
        select(func.max(OutcomeAssessment.version)).where(
            OutcomeAssessment.pilot_id == pilot_id
        )
    )
    current_version = max_ver or 0

    if schema.expected_version != current_version:
        raise ValueError(
            f"Outcome assessment version mismatch: expected {schema.expected_version}, actual current version is {current_version}."
        )

    new_version = current_version + 1

    assessment = OutcomeAssessment(
        pilot_id=pilot_id,
        evidence_plan_id=schema.evidence_plan_id,
        version=new_version,
        conclusion=schema.conclusion,
        summary=schema.summary.strip(),
        limitations=schema.limitations.strip() if schema.limitations else None,
        assessed_by_actor_id=schema.assessed_by_actor_id,
        evidence_items=evidence_items,
    )
    db.add(assessment)
    db.flush()
    return assessment


def get_outcome_history(
    db: Session, pilot_id: uuid.UUID
) -> tuple[List[OutcomeAssessment], int]:
    """Retrieves ordered outcome assessment history (version ASC) for a Pilot."""
    pilot = db.get(Pilot, pilot_id)
    if pilot is None:
        raise ValueError(f"Pilot {pilot_id} not found.")

    stmt = (
        select(OutcomeAssessment)
        .where(OutcomeAssessment.pilot_id == pilot_id)
        .order_by(OutcomeAssessment.version.asc())
    )
    items = list(db.scalars(stmt).all())
    return items, len(items)


def get_latest_outcome_assessment(
    db: Session, pilot_id: uuid.UUID
) -> Optional[OutcomeAssessment]:
    """Retrieves the latest OutcomeAssessment for a Pilot."""
    pilot = db.get(Pilot, pilot_id)
    if pilot is None:
        raise ValueError(f"Pilot {pilot_id} not found.")

    stmt = (
        select(OutcomeAssessment)
        .where(OutcomeAssessment.pilot_id == pilot_id)
        .order_by(OutcomeAssessment.version.desc())
        .limit(1)
    )
    return db.scalars(stmt).first()
