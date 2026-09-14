import uuid
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.core.database import get_db
from app.core.dependencies import get_current_actor
from app.models.actor import Actor
from app.models.challenge import Challenge
from app.models.evidence import Evidence
from app.models.clarification import ClarificationRequest
from app.models.qualification_decision import QualificationDecision
from app.models.challenge_hei_candidate import ChallengeHEICandidate
from app.models.commitment import Commitment
from app.models.readiness_decision import ReadinessDecision
from app.models.pilot import Pilot
from app.models.outcome_assessment import OutcomeAssessment
from app.services.policy_service import PolicyService

router = APIRouter(tags=["government-review"])


@router.get(
    "/government/review-queue",
    summary="Retrieve government intake and review queue with filters and counts",
)
def get_review_queue(
    district: Optional[str] = Query(None, description="Filter by district"),
    domain: Optional[str] = Query(None, description="Filter by domain"),
    source_type: Optional[str] = Query(None, description="Filter by source_type"),
    review_state: Optional[str] = Query(None, description="Filter by review state"),
    search: Optional[str] = Query(None, description="Search text in title or summary"),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_actor: Actor = Depends(get_current_actor),
):
    if not PolicyService.can_perform_action(current_actor, "challenge:view_review_scope"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission denied: Government Reviewer access required.",
        )

    query = db.query(Challenge)

    if district:
        query = query.filter(Challenge.district.ilike(f"%{district}%"))
    if domain:
        query = query.filter(Challenge.domain == domain)
    if source_type:
        query = query.filter(Challenge.source_type == source_type)
    if search:
        search_fmt = f"%{search}%".lower()
        query = query.filter(
            or_(
                Challenge.title.ilike(search_fmt),
                Challenge.summary.ilike(search_fmt),
                Challenge.description.ilike(search_fmt),
            )
        )

    all_challenges = query.order_by(Challenge.created_at.desc()).all()

    items = []
    unreviewed_count = 0
    awaiting_clarification_count = 0
    innovation_challenge_count = 0

    for c in all_challenges:
        qual = (
            db.query(QualificationDecision)
            .filter(QualificationDecision.challenge_id == c.id)
            .order_by(QualificationDecision.decided_at.desc())
            .first()
        )
        ev_count = db.query(Evidence).filter(Evidence.challenge_id == c.id).count()
        clar_reqs = db.query(ClarificationRequest).filter(ClarificationRequest.challenge_id == c.id).all()
        clar_count = len(clar_reqs)
        open_clar_count = len([r for r in clar_reqs if r.status == "OPEN"])

        cand_count = db.query(ChallengeHEICandidate).filter(ChallengeHEICandidate.challenge_id == c.id).count()
        comm_count = db.query(Commitment).filter(Commitment.challenge_id == c.id).count()

        readiness = (
            db.query(ReadinessDecision)
            .filter(ReadinessDecision.challenge_id == c.id)
            .order_by(ReadinessDecision.created_at.desc())
            .first()
        )
        pilot = db.query(Pilot).filter(Pilot.challenge_id == c.id).first()
        outcome = (
            db.query(OutcomeAssessment)
            .filter(OutcomeAssessment.challenge_id == c.id)
            .first()
            if pilot else None
        )

        state = "UNREVIEWED"
        if qual:
            state = (qual.route.value if hasattr(qual.route, "value") else qual.route)
        if open_clar_count > 0:
            state = "AWAITING_CLARIFICATION"
        elif qual and (qual.route.value if hasattr(qual.route, "value") else qual.route) == "INNOVATION_CHALLENGE":
            if cand_count == 0:
                state = "INNOVATION_CHALLENGE"
            elif comm_count == 0:
                state = "CANDIDATE_MATCHED"
            elif not readiness or (readiness.status.value if hasattr(readiness.status, "value") else readiness.status) != "PILOT_READY":
                state = "READINESS_REVIEW"
            elif pilot:
                state = "ACTIVE_PILOT"
                if outcome:
                    state = "OUTCOME_REVIEW"
            else:
                state = "READINESS_APPROVED"

        if state == "UNREVIEWED":
            unreviewed_count += 1
        elif state == "AWAITING_CLARIFICATION":
            awaiting_clarification_count += 1
        elif state == "INNOVATION_CHALLENGE":
            innovation_challenge_count += 1

        if review_state and state != review_state:
            continue

        items.append({
            "id": str(c.id),
            "title": c.title,
            "summary": c.summary,
            "description": c.description,
            "domain": c.domain,
            "district": c.district,
            "state": c.state,
            "source_type": c.source_type,
            "submitted_at": c.created_at.isoformat(),
            "updated_at": c.updated_at.isoformat(),
            "review_state": state,
            "qualification_route": (qual.route.value if hasattr(qual.route, "value") else qual.route) if qual else None,
            "evidence_count": ev_count,
            "clarification_count": clar_count,
            "open_clarification_count": open_clar_count,
            "candidate_count": cand_count,
            "commitment_count": comm_count,
            "readiness_decision": (readiness.status.value if hasattr(readiness.status, "value") else readiness.status) if readiness else None,
            "pilot_status": pilot.operational_status if pilot else None,
            "outcome_finding": outcome.overall_finding if outcome else None,
        })

    total_filtered = len(items)
    paginated_items = items[offset : offset + limit]

    return {
        "items": paginated_items,
        "total": total_filtered,
        "limit": limit,
        "offset": offset,
        "stats": {
            "unreviewed": unreviewed_count,
            "awaiting_clarification": awaiting_clarification_count,
            "innovation_challenges": innovation_challenge_count,
        },
    }
