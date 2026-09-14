from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select, func
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_actor
from app.models.actor import Actor
from app.models.challenge import Challenge
from app.models.commitment import Commitment
from app.models.pilot import Pilot
from app.models.readiness_decision import ReadinessDecision
from app.models.organization import Organization
from app.services.policy_service import PolicyService
from app.core.enums import PlatformRole

router = APIRouter(prefix="/api/v1/dashboard", tags=["Role Dashboards"])


class SummaryMetric(BaseModel):
    label: str
    count: int
    key: str


class RoleDashboardResponse(BaseModel):
    role_context: str
    metrics: List[SummaryMetric]
    recent_activity: List[Dict[str, Any]]
    action_items: Optional[List[Dict[str, Any]]] = None


@router.get("/summary")
def get_dashboard_summary(
    current_actor: Actor = Depends(get_current_actor),
    db: Session = Depends(get_db),
):
    role = current_actor.platform_role
    primary_org = None
    if current_actor.memberships:
        primary_mem = next((m for m in current_actor.memberships if m.is_primary), current_actor.memberships[0])
        if primary_mem and primary_mem.organization:
            primary_org = {
                "id": str(primary_mem.organization.id),
                "name": primary_mem.organization.name,
                "type": primary_mem.organization.organization_type,
            }

    metrics: Dict[str, int] = {}
    action_items: List[Dict[str, Any]] = []

    if role in [PlatformRole.COMMUNITY_REPORTER.value]:
        my_challenges = db.scalars(select(Challenge).where(Challenge.submitted_by_actor_id == current_actor.id)).all()
        metrics["my_submitted_challenges"] = len(my_challenges)
        metrics["qualified_for_pilot"] = sum(1 for c in my_challenges if c.current_qualification_state == "INNOVATION_CHALLENGE")
        metrics["under_review"] = sum(1 for c in my_challenges if c.current_qualification_state in ("INTAKE", "SUBMITTED"))
        action_items = [
            {
                "title": "Submit New Societal Challenge",
                "count": 0,
                "description": "Report a civic, agricultural, or infrastructure problem in your district.",
                "link": "/challenges",
            }
        ]

    elif role in [PlatformRole.GOVERNMENT_REVIEWER.value, PlatformRole.GOVERNMENT_ADMIN.value]:
        all_challenges = db.scalars(select(Challenge)).all()
        metrics["pending_qualification_queue"] = sum(1 for c in all_challenges if c.current_qualification_state in ("INTAKE", "SUBMITTED"))
        metrics["qualified_challenges"] = sum(1 for c in all_challenges if c.current_qualification_state == "INNOVATION_CHALLENGE")
        readiness_reviews = db.scalars(select(ReadinessDecision)).all()
        metrics["readiness_review_required"] = sum(1 for r in readiness_reviews if r.readiness_state == "REVIEW_REQUIRED")
        metrics["active_ground_pilots"] = db.scalar(select(func.count(Pilot.id)).where(Pilot.current_operational_state == "ACTIVE")) or 0
        action_items = [
            {
                "title": "Evaluate Qualification Queue",
                "count": metrics["pending_qualification_queue"],
                "description": "Review newly submitted challenges for route qualification.",
                "link": "/challenges",
            },
            {
                "title": "Review Readiness Decisions",
                "count": metrics["readiness_review_required"],
                "description": "Authorize qualified pilots when condition dependencies are satisfied.",
                "link": "/challenges",
            },
        ]

    elif role in [PlatformRole.HEI_MEMBER.value, PlatformRole.HEI_REVIEWER.value, PlatformRole.HEI_ADMIN.value]:
        hei_org_ids = [m.organization_id for m in current_actor.memberships if m.organization and m.organization.organization_type == "HEI"]
        commitments = db.scalars(select(Commitment).where(Commitment.organization_id.in_(hei_org_ids))).all() if hei_org_ids else []
        metrics["active_commitments"] = sum(1 for c in commitments if c.commitment_state == "ACCEPTED")
        metrics["total_commitments"] = len(commitments)
        metrics["hosted_active_pilots"] = (db.scalar(select(func.count(Pilot.id)).where(Pilot.host_organization_id.in_(hei_org_ids), Pilot.current_operational_state == "ACTIVE")) if hei_org_ids else 0) or 0
        action_items = [
            {
                "title": "Explore HEI Matching Candidates",
                "count": 0,
                "description": "Review challenges needing university R&D partnerships.",
                "link": "/challenges",
            }
        ]

    elif role in [PlatformRole.INDUSTRY_MEMBER.value, PlatformRole.INDUSTRY_ADMIN.value]:
        ind_org_ids = [m.organization_id for m in current_actor.memberships if m.organization and m.organization.organization_type in ("INDUSTRY", "MSME")]
        commitments = db.scalars(select(Commitment).where(Commitment.organization_id.in_(ind_org_ids))).all() if ind_org_ids else []
        metrics["co_funding_commitments"] = sum(1 for c in commitments if c.commitment_state == "ACCEPTED")
        metrics["total_industry_records"] = len(commitments)
        action_items = [
            {
                "title": "Co-Funding & Deployment Opportunities",
                "count": 0,
                "description": "Provide CSR, equipment, or co-funding commitments to ready pilots.",
                "link": "/challenges",
            }
        ]

    elif role in [PlatformRole.PLATFORM_ADMIN.value]:
        metrics["total_users"] = db.scalar(select(func.count(Actor.id))) or 0
        metrics["registered_organizations"] = db.scalar(select(func.count(Organization.id))) or 0
        metrics["pending_organization_reviews"] = db.scalar(select(func.count(Organization.id)).where(Organization.status == "PENDING")) or 0
        action_items = [
            {
                "title": "Onboard & Review Organizations",
                "count": metrics["pending_organization_reviews"],
                "description": "Approve new government departments, HEIs, and industry partners.",
                "link": "/app/organizations",
            }
        ]

    return {
        "actor_id": str(current_actor.id),
        "display_name": current_actor.display_name,
        "role": role,
        "primary_organization": primary_org,
        "metrics": metrics,
        "action_items": action_items,
    }


@router.get("/government")
def get_government_dashboard(
    current_actor: Actor = Depends(get_current_actor),
    db: Session = Depends(get_db),
):
    if current_actor.platform_role not in [PlatformRole.GOVERNMENT_REVIEWER.value, PlatformRole.GOVERNMENT_ADMIN.value, PlatformRole.PLATFORM_ADMIN.value]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Government reviewer permission required.")
    return get_dashboard_summary(current_actor, db)
