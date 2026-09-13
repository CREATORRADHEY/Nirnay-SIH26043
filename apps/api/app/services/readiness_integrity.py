"""Readiness Integrity Service.

Implements deterministic dependency invalidation when commitment state changes.
"""

from typing import Optional
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.enums import CommitmentStatus, ReadinessStatus
from app.models.commitment import Commitment
from app.models.readiness_condition import ReadinessCondition, readiness_condition_commitment_dependencies
from app.models.readiness_decision import ReadinessDecision


def invalidate_readiness_for_commitment_change(
    session: Session,
    new_commitment: Commitment,
) -> Optional[ReadinessDecision]:
    """Deterministically invalidates readiness decisions if a new commitment version invalidates
    relied-upon prior commitment dependencies.

    RULES:
    1. Identify prior commitments in the same series (same challenge_id, organization_id, commitment_type, lower version).
    2. Check if any prior commitment version was explicitly referenced by a ReadinessCondition
       belonging to the same challenge.
    3. Check the current (highest version) ReadinessDecision for this challenge.
    4. If the new commitment status moves away from ACCEPTED (e.g., WITHDRAWN, EXPIRED, DECLINED, or superseded PROPOSED/OFFERED)
       AND a relied-upon commitment dependency is impacted:
    5. Check idempotency: Do NOT append a duplicate REVIEW_REQUIRED decision if one already exists for this triggered_by_commitment_id.
    6. Append a NEW ReadinessDecision with status=REVIEW_REQUIRED, linked to existing conditions, flush session, and return it.

    Caller retains transaction ownership (does NOT call session.commit()).
    """
    # 1. Check idempotency: If a REVIEW_REQUIRED decision was already created for this commitment change, return None.
    existing_invalidation = session.scalars(
        select(ReadinessDecision).where(
            ReadinessDecision.challenge_id == new_commitment.challenge_id,
            ReadinessDecision.triggered_by_commitment_id == new_commitment.id,
            ReadinessDecision.status == ReadinessStatus.REVIEW_REQUIRED,
        )
    ).first()

    if existing_invalidation is not None:
        return None

    # 2. Find prior commitment IDs in the same logical series (same challenge, org, type, lower version)
    prior_commitment_ids = list(
        session.scalars(
            select(Commitment.id).where(
                Commitment.challenge_id == new_commitment.challenge_id,
                Commitment.organization_id == new_commitment.organization_id,
                Commitment.commitment_type == new_commitment.commitment_type,
                Commitment.version < new_commitment.version,
            )
        ).all()
    )

    if not prior_commitment_ids:
        return None

    # 3. Check if any readiness conditions for this challenge explicitly depend on any of these prior commitment IDs
    dependent_condition_ids = list(
        session.scalars(
            select(readiness_condition_commitment_dependencies.c.readiness_condition_id).where(
                readiness_condition_commitment_dependencies.c.commitment_id.in_(prior_commitment_ids)
            )
        ).all()
    )

    if not dependent_condition_ids:
        return None

    # Verify these dependent conditions actually belong to new_commitment.challenge_id
    challenge_dependent_conditions = list(
        session.scalars(
            select(ReadinessCondition).where(
                ReadinessCondition.id.in_(dependent_condition_ids),
                ReadinessCondition.challenge_id == new_commitment.challenge_id,
            )
        ).all()
    )

    if not challenge_dependent_conditions:
        return None

    # 4. Fetch the latest ReadinessDecision for this challenge
    all_decisions = list(
        session.scalars(
            select(ReadinessDecision)
            .where(ReadinessDecision.challenge_id == new_commitment.challenge_id)
            .order_by(ReadinessDecision.version.desc())
        ).all()
    )

    latest_decision = all_decisions[0] if all_decisions else None

    # If there is no prior decision, or if latest decision is already REVIEW_REQUIRED, no new invalidation needed
    if latest_decision is None or latest_decision.status == ReadinessStatus.REVIEW_REQUIRED:
        return None

    # 5. Check if the commitment change breaks the relied-upon state basis.
    dependency_invalidated = new_commitment.status in {
        CommitmentStatus.WITHDRAWN,
        CommitmentStatus.EXPIRED,
        CommitmentStatus.DECLINED,
        CommitmentStatus.PROPOSED,
        CommitmentStatus.OFFERED,
    }

    if not dependency_invalidated:
        return None

    # 6. Calculate next decision version for this challenge
    next_version = (latest_decision.version + 1) if latest_decision else 1

    # 7. Create new REVIEW_REQUIRED decision
    rationale = (
        f"Dependency invalidation: commitment '{new_commitment.commitment_type}' for organization "
        f"'{new_commitment.organization_id}' updated to version {new_commitment.version} with status {new_commitment.status.value}."
    )

    new_decision = ReadinessDecision(
        challenge_id=new_commitment.challenge_id,
        status=ReadinessStatus.REVIEW_REQUIRED,
        version=next_version,
        rationale=rationale,
        decided_by_actor_id=None,  # System-derived invalidation
        triggered_by_commitment_id=new_commitment.id,
    )

    # Link the conditions attached to the latest decision
    if latest_decision and latest_decision.conditions:
        new_decision.conditions.extend(latest_decision.conditions)

    session.add(new_decision)
    session.flush()

    return new_decision
