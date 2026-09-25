from typing import List, Optional, Tuple
import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.actor import Actor
from app.models.challenge import Challenge
from app.models.decision_assurance import DecisionAssuranceRecord, DecisionReviewRequest
from app.models.evidence import Evidence
from app.schemas.decision_assurance import (
    DecisionAssuranceCreate,
    DecisionReviewRequestCreate,
    DisagreementResolutionCreate,
    SecondReviewCreate,
)


def create_decision_assurance(
    db: Session,
    challenge_id: uuid.UUID,
    schema: DecisionAssuranceCreate,
    reviewer_actor: Actor,
) -> DecisionAssuranceRecord:
    """Creates an append-only evidence-backed DecisionAssuranceRecord.

    Enforces:
    - Challenge existence
    - Reviewer actor attribution
    - Evidence items existence & parent challenge validation
    - AI-Human agreement evaluation (stored as observational metadata)
    - Trigger evaluation for independent 2nd review (AI disagreement, potential conflict, uncertain rubric)
    """
    challenge = db.get(Challenge, challenge_id)
    if challenge is None:
        raise ValueError(f"Challenge {challenge_id} not found.")

    # Validate evidence items
    str_evidence_ids = []
    for ev_id in schema.evidence_ids:
        ev = db.get(Evidence, ev_id)
        if ev is None:
            raise ValueError(f"Evidence {ev_id} not found.")
        if ev.challenge_id != challenge_id:
            raise ValueError(f"Evidence {ev_id} does not belong to Challenge {challenge_id}.")
        str_evidence_ids.append(str(ev_id))

    # Evaluate AI Agreement Status (for analysis only)
    ai_status = "NOT_APPLICABLE"
    ai_disagreed = False
    if schema.ai_advisory_snapshot and isinstance(schema.ai_advisory_snapshot, dict):
        suggested = schema.ai_advisory_snapshot.get("suggested_route") or schema.ai_advisory_snapshot.get("suggested_status")
        if suggested:
            human_decision = str(
                schema.rubric_answers.get("selected_route")
                or schema.rubric_answers.get("route")
                or schema.rubric_answers.get("selected_status")
                or schema.rubric_answers.get("status")
                or ""
            )

            if suggested and human_decision and str(suggested).strip().upper() == human_decision.strip().upper():
                ai_status = "AGREEMENT"
            else:
                ai_status = "DISAGREEMENT"
                ai_disagreed = True

    # Evaluate Second Review Triggers
    second_review_req = False
    second_review_reasons = []

    if schema.conflict_declared == "POTENTIAL_CONFLICT":
        second_review_req = True
        second_review_reasons.append("Reviewer declared potential conflict of interest.")

    if ai_disagreed:
        second_review_req = True
        second_review_reasons.append("AI advisory disagreed with human decision.")

    # Check rubric for UNCERTAIN answers
    rubric_uncertain = False
    if isinstance(schema.rubric_answers, dict):
        for k, v in schema.rubric_answers.items():
            if str(v).upper() == "UNCERTAIN":
                rubric_uncertain = True
                break
    if rubric_uncertain:
        second_review_req = True
        second_review_reasons.append("Reviewer marked one or more rubric criteria as UNCERTAIN.")

    if schema.limitations_note and rubric_uncertain and len(schema.limitations_note.strip()) < 10:
        raise ValueError("Limitations note is required (at least 10 chars) when rubric criteria are UNCERTAIN.")

    review_status = "SECOND_REVIEW_PENDING" if second_review_req else "SINGLE_REVIEWED"
    reason_str = " | ".join(second_review_reasons) if second_review_reasons else None

    rec = DecisionAssuranceRecord(
        challenge_id=challenge_id,
        decision_type=schema.decision_type.upper(),
        authoritative_decision_id=schema.authoritative_decision_id,
        reviewer_actor_id=reviewer_actor.id,
        reviewer_organization_id=getattr(reviewer_actor, "organization_id", None),
        rubric_version=schema.rubric_version,
        rubric_answers=schema.rubric_answers,
        evidence_ids=str_evidence_ids,
        rationale=schema.rationale.strip(),
        limitations_note=schema.limitations_note.strip() if schema.limitations_note else None,
        ai_advisory_snapshot=schema.ai_advisory_snapshot,
        ai_agreement_status=ai_status,
        conflict_declared=schema.conflict_declared,
        second_review_required=second_review_req,
        second_review_reason=reason_str,
        review_status=review_status,
    )
    db.add(rec)
    db.flush()
    return rec


def submit_second_review(
    db: Session,
    assurance_id: uuid.UUID,
    second_reviewer_actor: Actor,
    schema: SecondReviewCreate,
) -> DecisionAssuranceRecord:
    """Submits an independent second review for an existing assurance record.

    Enforces:
    - Server-side check: Second reviewer MUST NOT be the initial reviewer.
    - Updates review_status to AGREED or DISAGREED based on decision alignment.
    - Preserves both reviews in history.
    """
    rec = db.get(DecisionAssuranceRecord, assurance_id)
    if rec is None:
        raise ValueError(f"DecisionAssuranceRecord {assurance_id} not found.")

    if rec.reviewer_actor_id == second_reviewer_actor.id:
        raise ValueError("Second reviewer cannot be the same user as the initial reviewer.")

    rec.second_reviewer_actor_id = second_reviewer_actor.id
    rec.second_review_rationale = schema.rationale.strip()
    rec.second_review_decision = schema.decision.strip()

    # Determine alignment
    first_decision = rec.rubric_answers.get("selected_route") or rec.rubric_answers.get("selected_status") or ""
    if str(schema.decision).strip().upper() == str(first_decision).strip().upper():
        rec.review_status = "AGREED"
    else:
        rec.review_status = "DISAGREED"

    db.flush()
    return rec


def resolve_disagreement(
    db: Session,
    assurance_id: uuid.UUID,
    resolver_actor: Actor,
    schema: DisagreementResolutionCreate,
) -> DecisionAssuranceRecord:
    """Resolves a reviewer disagreement by recording senior reviewer resolution.

    Enforces:
    - Updates review_status to RESOLVED.
    - Records resolver actor attribution & resolution rationale.
    - Preserves both original reviews.
    """
    rec = db.get(DecisionAssuranceRecord, assurance_id)
    if rec is None:
        raise ValueError(f"DecisionAssuranceRecord {assurance_id} not found.")

    if rec.review_status != "DISAGREED":
        raise ValueError(f"Assurance record {assurance_id} is in status '{rec.review_status}', not DISAGREED.")

    rec.disagreement_resolved_by_actor_id = resolver_actor.id
    rec.resolution_rationale = schema.resolution_rationale.strip()
    rec.review_status = "RESOLVED"

    db.flush()
    return rec


def create_decision_review_request(
    db: Session,
    challenge_id: uuid.UUID,
    assurance_id: uuid.UUID,
    requester_actor: Actor,
    schema: DecisionReviewRequestCreate,
) -> DecisionReviewRequest:
    """Submits a review request / appeal for a decision.

    Enforces:
    - Creates DecisionReviewRequest.
    - Marks target DecisionAssuranceRecord as second_review_required = True (SECOND_REVIEW_PENDING).
    - DOES NOT delete, overwrite, or silently alter original decision.
    """
    challenge = db.get(Challenge, challenge_id)
    if challenge is None:
        raise ValueError(f"Challenge {challenge_id} not found.")

    rec = db.get(DecisionAssuranceRecord, assurance_id)
    if rec is None:
        raise ValueError(f"DecisionAssuranceRecord {assurance_id} not found.")

    if schema.evidence_id:
        ev = db.get(Evidence, schema.evidence_id)
        if ev is None or ev.challenge_id != challenge_id:
            raise ValueError(f"Evidence {schema.evidence_id} invalid or does not belong to Challenge {challenge_id}.")

    req = DecisionReviewRequest(
        challenge_id=challenge_id,
        assurance_record_id=assurance_id,
        requested_by_actor_id=requester_actor.id,
        reason=schema.reason.strip(),
        evidence_id=schema.evidence_id,
        status="PENDING",
    )
    db.add(req)

    # Flag assurance record for review if not already completed
    if rec.review_status == "SINGLE_REVIEWED":
        rec.second_review_required = True
        rec.second_review_reason = f"Stakeholder review request submitted: {schema.reason[:100]}"
        rec.review_status = "SECOND_REVIEW_PENDING"

    db.flush()
    return req


def get_assurance_records(
    db: Session, challenge_id: uuid.UUID
) -> Tuple[List[DecisionAssuranceRecord], int]:
    """Gets all DecisionAssuranceRecords for a Challenge ordered by created_at DESC."""
    stmt = (
        select(DecisionAssuranceRecord)
        .where(DecisionAssuranceRecord.challenge_id == challenge_id)
        .order_by(DecisionAssuranceRecord.created_at.desc())
    )
    records = list(db.scalars(stmt).all())
    return records, len(records)


def get_review_requests(
    db: Session, challenge_id: uuid.UUID
) -> Tuple[List[DecisionReviewRequest], int]:
    """Gets all DecisionReviewRequests for a Challenge ordered by created_at DESC."""
    stmt = (
        select(DecisionReviewRequest)
        .where(DecisionReviewRequest.challenge_id == challenge_id)
        .order_by(DecisionReviewRequest.created_at.desc())
    )
    reqs = list(db.scalars(stmt).all())
    return reqs, len(reqs)
