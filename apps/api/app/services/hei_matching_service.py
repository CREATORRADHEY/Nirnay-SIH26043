from typing import List, Optional
import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.enums import QualificationRoute
from app.models.actor import Actor
from app.models.challenge import Challenge
from app.models.challenge_hei_candidate import ChallengeHEICandidate
from app.models.hei_capability import HEICapability
from app.models.organization import Organization
from app.schemas.hei_matching import HEICandidateCreate
from app.services.qualification_service import get_latest_qualification_decision


def create_hei_candidate(
    db: Session, challenge_id: uuid.UUID, schema: HEICandidateCreate
) -> ChallengeHEICandidate:
    """Creates a non-authoritative HEI candidate match for a qualified Challenge.

    Enforces:
    - Challenge existence.
    - Latest QualificationDecision existence and route == INNOVATION_CHALLENGE.
    - Organization existence.
    - Organization active HEI capability check.
    - MANUAL match actor attribution.
    - Duplicate candidate detection (challenge_id, organization_id).
    Does NOT commit the transaction automatically.
    """
    challenge = db.get(Challenge, challenge_id)
    if challenge is None:
        raise ValueError(f"Challenge {challenge_id} not found.")

    latest_dec = get_latest_qualification_decision(db, challenge_id)
    if latest_dec is None:
        raise ValueError(f"Challenge {challenge_id} is not qualified for HEI candidate matching.")

    if latest_dec.route != QualificationRoute.INNOVATION_CHALLENGE:
        raise ValueError(
            f"Challenge {challenge_id} is qualified as {latest_dec.route.value}, which is not eligible for HEI matching."
        )

    org = db.get(Organization, schema.organization_id)
    if org is None:
        raise ValueError(f"Organization {schema.organization_id} not found.")

    has_capability = (
        db.scalars(
            select(HEICapability).where(
                HEICapability.organization_id == schema.organization_id,
                HEICapability.is_active == True,
            )
        ).first()
        is not None
    )
    if not has_capability:
        raise ValueError(f"Organization {schema.organization_id} has no active HEI capabilities.")

    if schema.match_method.upper() == "MANUAL" and schema.created_by_actor_id is None:
        raise ValueError("MANUAL match requires created_by_actor_id.")

    if schema.created_by_actor_id is not None:
        actor = db.get(Actor, schema.created_by_actor_id)
        if actor is None:
            raise ValueError(f"Actor {schema.created_by_actor_id} not found.")

    dup = db.scalars(
        select(ChallengeHEICandidate).where(
            ChallengeHEICandidate.challenge_id == challenge_id,
            ChallengeHEICandidate.organization_id == schema.organization_id,
        )
    ).first()
    if dup is not None:
        raise ValueError(
            f"Organization {schema.organization_id} is already a candidate for Challenge {challenge_id}."
        )

    candidate = ChallengeHEICandidate(
        challenge_id=challenge_id,
        organization_id=schema.organization_id,
        match_method=schema.match_method.strip(),
        rationale=schema.rationale.strip(),
        created_by_actor_id=schema.created_by_actor_id,
    )
    db.add(candidate)
    db.flush()
    return candidate


def list_hei_candidates(
    db: Session, challenge_id: uuid.UUID
) -> tuple[List[ChallengeHEICandidate], int]:
    """Lists candidate HEI matches for a Challenge (created_at ASC, id ASC)."""
    challenge = db.get(Challenge, challenge_id)
    if challenge is None:
        raise ValueError(f"Challenge {challenge_id} not found.")

    stmt = (
        select(ChallengeHEICandidate)
        .where(ChallengeHEICandidate.challenge_id == challenge_id)
        .order_by(ChallengeHEICandidate.created_at.asc(), ChallengeHEICandidate.id.asc())
    )
    items = list(db.scalars(stmt).all())
    return items, len(items)


def list_organization_capabilities(
    db: Session, organization_id: uuid.UUID
) -> tuple[List[HEICapability], int]:
    """Lists active HEI capabilities for an Organization."""
    org = db.get(Organization, organization_id)
    if org is None:
        raise ValueError(f"Organization {organization_id} not found.")

    stmt = (
        select(HEICapability)
        .where(
            HEICapability.organization_id == organization_id,
            HEICapability.is_active == True,
        )
        .order_by(HEICapability.created_at.desc(), HEICapability.id.desc())
    )
    items = list(db.scalars(stmt).all())
    return items, len(items)


def list_hei_organizations(db: Session) -> tuple[List[dict], int]:
    """List organizations that have at least one ACTIVE HEICapability.

    Ordered deterministically by organization.name ASC.
    Only active capabilities are returned.
    Read-only service method.
    """
    stmt = (
        select(Organization)
        .where(Organization.is_active == True)
        .join(HEICapability, Organization.id == HEICapability.organization_id)
        .where(HEICapability.is_active == True)
        .distinct()
        .order_by(Organization.name.asc())
    )
    orgs = list(db.scalars(stmt).all())

    results = []
    for org in orgs:
        active_caps = [cap for cap in org.hei_capabilities if cap.is_active]
        if active_caps:
            results.append({
                "organization_id": org.id,
                "name": org.name,
                "organization_type": org.organization_type,
                "district": org.district,
                "state": org.state,
                "active_capabilities": active_caps,
            })

    return results, len(results)
