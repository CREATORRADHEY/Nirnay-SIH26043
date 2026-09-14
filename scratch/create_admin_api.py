content = """import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.database import get_db
from app.models.actor import Actor
from app.models.organization import Organization
from app.models.organization_membership import OrganizationMembership
from app.models.security_audit_log import SecurityAuditLog
from app.models.ai_audit_log import AIAuditLog
from app.models.challenge import Challenge
from app.models.pilot import Pilot
from app.models.qualification_decision import QualificationDecision
from app.models.readiness_decision import ReadinessDecision
from app.models.evidence import EvidenceClarification
from app.services.auth_service import get_current_actor
from app.services.ai.circuit_breaker import circuit_breaker
from app.core.config import get_settings

router = APIRouter(prefix="/admin", tags=["Platform Admin Operations"])


def require_platform_admin(actor: Actor = Depends(get_current_actor)) -> Actor:
    if not actor or actor.platform_role != "PLATFORM_ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Platform Admin authorization required.",
        )
    return actor


# Request & Response Schemas
class OrgStatusUpdatePayload(BaseModel):
    target_status: str = Field(..., description="Target status: ACTIVE, PENDING, REJECTED, SUSPENDED")
    rationale: str = Field(..., min_length=3, description="Mandatory audit rationale")

class UserStatusUpdatePayload(BaseModel):
    is_active: bool
    rationale: Optional[str] = None

class UserRoleUpdatePayload(BaseModel):
    new_role: str
    rationale: str = Field(..., min_length=3)


@router.get("/overview")
def get_admin_overview(
    db: Session = Depends(get_db),
    admin: Actor = Depends(require_platform_admin),
) -> Dict[str, Any]:
    active_accounts = db.query(func.count(Actor.id)).filter(Actor.is_active == True).scalar() or 0
    active_orgs = db.query(func.count(Organization.id)).filter(Organization.status == "ACTIVE").scalar() or 0
    pending_orgs = db.query(func.count(Organization.id)).filter(Organization.status == "PENDING").scalar() or 0
    suspended_orgs = db.query(func.count(Organization.id)).filter(Organization.status == "SUSPENDED").scalar() or 0
    
    open_clarifications = db.query(func.count(EvidenceClarification.id)).filter(EvidenceClarification.status == "OPEN").scalar() or 0
    
    # Innovation challenges
    latest_qual_subquery = (
        db.query(
            QualificationDecision.challenge_id,
            func.max(QualificationDecision.version).label("max_ver"),
        )
        .group_by(QualificationDecision.challenge_id)
        .subquery()
    )
    innovation_challenges = (
        db.query(func.count(QualificationDecision.id))
        .join(
            latest_qual_subquery,
            (QualificationDecision.challenge_id == latest_qual_subquery.c.challenge_id)
            & (QualificationDecision.version == latest_qual_subquery.c.max_ver),
        )
        .filter(QualificationDecision.route == "INNOVATION_CHALLENGE")
        .scalar() or 0
    )

    active_pilots = db.query(func.count(Pilot.id)).filter(Pilot.status.in_(["PLANNED", "ACTIVE"])).scalar() or 0
    
    # Readiness review required
    latest_readiness_subquery = (
        db.query(
            ReadinessDecision.challenge_id,
            func.max(ReadinessDecision.version).label("max_ver"),
        )
        .group_by(ReadinessDecision.challenge_id)
        .subquery()
    )
    readiness_review_required = (
        db.query(func.count(ReadinessDecision.id))
        .join(
            latest_readiness_subquery,
            (ReadinessDecision.challenge_id == latest_readiness_subquery.c.challenge_id)
            & (ReadinessDecision.version == latest_readiness_subquery.c.max_ver),
        )
        .filter(ReadinessDecision.status == "REVIEW_REQUIRED")
        .scalar() or 0
    )

    return {
        "active_accounts_count": active_accounts,
        "active_orgs_count": active_orgs,
        "pending_orgs_count": pending_orgs,
        "suspended_orgs_count": suspended_orgs,
        "open_clarifications_count": open_clarifications,
        "innovation_challenges_count": innovation_challenges,
        "active_pilots_count": active_pilots,
        "readiness_review_required_count": readiness_review_required,
        "generated_at": datetime.now(timezone.utc).isoformat(),
    }


@router.get("/organizations")
def list_organizations_admin(
    status_filter: Optional[str] = Query(None, alias="status"),
    search: Optional[str] = Query(None),
    org_type: Optional[str] = Query(None, alias="type"),
    district: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    admin: Actor = Depends(require_platform_admin),
) -> Dict[str, Any]:
    query = db.query(Organization)
    if status_filter:
        query = query.filter(Organization.status == status_filter.upper())
    if org_type:
        query = query.filter(Organization.organization_type == org_type)
    if district:
        query = query.filter(Organization.district.ilike(f"%{district}%"))
    if search:
        query = query.filter(Organization.name.ilike(f"%{search}%"))

    total = query.count()
    items = query.order_by(Organization.created_at.desc()).offset((page - 1) * limit).limit(limit).all()

    org_list = []
    for o in items:
        org_list.append({
            "id": str(o.id),
            "name": o.name,
            "organization_type": o.organization_type,
            "district": o.district,
            "state": o.state,
            "status": o.status,
            "status_rationale": o.status_rationale,
            "status_updated_at": o.status_updated_at.isoformat() if o.status_updated_at else None,
            "is_active": o.is_active,
            "created_at": o.created_at.isoformat(),
            "member_count": db.query(func.count(OrganizationMembership.id)).filter(OrganizationMembership.organization_id == o.id).scalar() or 0,
        })

    return {
        "items": org_list,
        "total": total,
        "page": page,
        "limit": limit,
    }


@router.get("/organizations/{organization_id}")
def get_organization_detail_admin(
    organization_id: str,
    db: Session = Depends(get_db),
    admin: Actor = Depends(require_platform_admin),
) -> Dict[str, Any]:
    try:
        org_uuid = uuid.UUID(organization_id)
    except ValueError:
        raise HTTPException(status_code=404, detail="Organization not found")

    org = db.query(Organization).filter(Organization.id == org_uuid).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")

    memberships = (
        db.query(OrganizationMembership, Actor)
        .join(Actor, OrganizationMembership.actor_id == Actor.id)
        .filter(OrganizationMembership.organization_id == org_uuid)
        .all()
    )

    members_list = []
    for m, a in memberships:
        members_list.append({
            "membership_id": str(m.id),
            "actor_id": str(a.id),
            "name": a.display_name,
            "email": a.email,
            "platform_role": a.platform_role,
            "org_role": m.role,
            "is_primary": m.is_primary,
            "is_active": a.is_active,
        })

    audit_logs = (
        db.query(SecurityAuditLog)
        .filter(SecurityAuditLog.details.ilike(f"%{organization_id}%"))
        .order_by(SecurityAuditLog.created_at.desc())
        .limit(20)
        .all()
    )

    audit_list = []
    for log in audit_logs:
        audit_list.append({
            "id": log.id,
            "event_type": log.event_type,
            "actor_id": log.actor_id,
            "details": log.details,
            "created_at": log.created_at.isoformat(),
        })

    return {
        "id": str(org.id),
        "name": org.name,
        "organization_type": org.organization_type,
        "district": org.district,
        "state": org.state,
        "status": org.status,
        "status_rationale": org.status_rationale,
        "status_updated_at": org.status_updated_at.isoformat() if org.status_updated_at else None,
        "is_active": org.is_active,
        "created_at": org.created_at.isoformat(),
        "members": members_list,
        "audit_logs": audit_list,
    }


@router.post("/organizations/{organization_id}/status")
def update_organization_status_admin(
    organization_id: str,
    payload: OrgStatusUpdatePayload,
    db: Session = Depends(get_db),
    admin: Actor = Depends(require_platform_admin),
) -> Dict[str, Any]:
    try:
        org_uuid = uuid.UUID(organization_id)
    except ValueError:
        raise HTTPException(status_code=404, detail="Organization not found")

    org = db.query(Organization).filter(Organization.id == org_uuid).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")

    target = payload.target_status.upper()
    if target not in ["ACTIVE", "PENDING", "REJECTED", "SUSPENDED"]:
        raise HTTPException(status_code=400, detail="Invalid organization target status.")

    if target in ["REJECTED", "SUSPENDED", "PENDING"] and not payload.rationale.trim():
        raise HTTPException(status_code=400, detail="Rationale is required for this status change.")

    old_status = org.status
    org.status = target
    org.status_rationale = payload.rationale
    org.status_updated_at = datetime.now(timezone.utc)
    if target == "SUSPENDED" or target == "REJECTED":
        org.is_active = False
    elif target == "ACTIVE":
        org.is_active = True

    event_type = f"ORG_{target}"
    audit_entry = SecurityAuditLog(
        event_type=event_type,
        actor_id=str(admin.id),
        details=f"Admin {admin.display_name} updated organization '{org.name}' ({org.id}) status from {old_status} to {target}. Rationale: {payload.rationale}",
    )
    db.add(audit_entry)
    db.commit()
    db.refresh(org)

    return {
        "id": str(org.id),
        "name": org.name,
        "status": org.status,
        "status_rationale": org.status_rationale,
        "status_updated_at": org.status_updated_at.isoformat(),
        "is_active": org.is_active,
    }


@router.get("/users")
def list_users_admin(
    search: Optional[str] = Query(None),
    role: Optional[str] = Query(None),
    is_active: Optional[bool] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    admin: Actor = Depends(require_platform_admin),
) -> Dict[str, Any]:
    query = db.query(Actor)
    if role:
        query = query.filter(Actor.platform_role == role)
    if is_active is not None:
        query = query.filter(Actor.is_active == is_active)
    if search:
        query = query.filter(
            (Actor.display_name.ilike(f"%{search}%")) | (Actor.email.ilike(f"%{search}%"))
        )

    total = query.count()
    items = query.order_by(Actor.created_at.desc()).offset((page - 1) * limit).limit(limit).all()

    users_list = []
    for a in items:
        org_names = (
            db.query(Organization.name)
            .join(OrganizationMembership, OrganizationMembership.organization_id == Organization.id)
            .filter(OrganizationMembership.actor_id == a.id)
            .all()
        )
        users_list.append({
            "id": str(a.id),
            "display_name": a.display_name,
            "email": a.email,
            "platform_role": a.platform_role,
            "is_active": a.is_active,
            "created_at": a.created_at.isoformat(),
            "organizations": [o[0] for o in org_names],
        })

    return {
        "items": users_list,
        "total": total,
        "page": page,
        "limit": limit,
    }


@router.patch("/users/{user_id}/status")
def update_user_status_admin(
    user_id: str,
    payload: UserStatusUpdatePayload,
    db: Session = Depends(get_db),
    admin: Actor = Depends(require_platform_admin),
) -> Dict[str, Any]:
    try:
        user_uuid = uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=404, detail="User not found")

    target_actor = db.query(Actor).filter(Actor.id == user_uuid).first()
    if not target_actor:
        raise HTTPException(status_code=404, detail="User not found")

    # Invariant Check: Do not allow deactivating the LAST active PLATFORM_ADMIN account
    if not payload.is_active and target_actor.platform_role == "PLATFORM_ADMIN":
        active_admins_count = (
            db.query(func.count(Actor.id))
            .filter(Actor.platform_role == "PLATFORM_ADMIN", Actor.is_active == True)
            .scalar() or 0
        )
        if active_admins_count <= 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="System Invariant Protection: Cannot deactivate the last active PLATFORM_ADMIN account.",
            )

    target_actor.is_active = payload.is_active
    audit_entry = SecurityAuditLog(
        event_type="USER_DEACTIVATED" if not payload.is_active else "USER_REACTIVATED",
        actor_id=str(admin.id),
        details=f"Admin {admin.display_name} set user '{target_actor.display_name}' ({target_actor.id}) active status to {payload.is_active}. Rationale: {payload.rationale or 'N/A'}",
    )
    db.add(audit_entry)
    db.commit()
    db.refresh(target_actor)

    return {
        "id": str(target_actor.id),
        "display_name": target_actor.display_name,
        "email": target_actor.email,
        "platform_role": target_actor.platform_role,
        "is_active": target_actor.is_active,
    }


@router.patch("/users/{user_id}/role")
def update_user_role_admin(
    user_id: str,
    payload: UserRoleUpdatePayload,
    db: Session = Depends(get_db),
    admin: Actor = Depends(require_platform_admin),
) -> Dict[str, Any]:
    try:
        user_uuid = uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=404, detail="User not found")

    target_actor = db.query(Actor).filter(Actor.id == user_uuid).first()
    if not target_actor:
        raise HTTPException(status_code=404, detail="User not found")

    new_role = payload.new_role.upper()
    valid_roles = ["COMMUNITY_REPORTER", "GOVERNMENT_REVIEWER", "HEI_ADMIN", "INDUSTRY_ADMIN", "PLATFORM_ADMIN"]
    if new_role not in valid_roles:
        raise HTTPException(status_code=400, detail=f"Invalid platform role: {new_role}")

    # Invariant Check: Cannot demote last PLATFORM_ADMIN
    if target_actor.platform_role == "PLATFORM_ADMIN" and new_role != "PLATFORM_ADMIN":
        active_admins_count = (
            db.query(func.count(Actor.id))
            .filter(Actor.platform_role == "PLATFORM_ADMIN", Actor.is_active == True)
            .scalar() or 0
        )
        if active_admins_count <= 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="System Invariant Protection: Cannot demote the last active PLATFORM_ADMIN account.",
            )

    old_role = target_actor.platform_role
    target_actor.platform_role = new_role
    audit_entry = SecurityAuditLog(
        event_type="USER_ROLE_CHANGED",
        actor_id=str(admin.id),
        details=f"Admin {admin.display_name} changed user '{target_actor.display_name}' ({target_actor.id}) role from {old_role} to {new_role}. Rationale: {payload.rationale}",
    )
    db.add(audit_entry)
    db.commit()
    db.refresh(target_actor)

    return {
        "id": str(target_actor.id),
        "display_name": target_actor.display_name,
        "platform_role": target_actor.platform_role,
        "is_active": target_actor.is_active,
    }


@router.get("/audit")
def list_system_audit_logs(
    event_type: Optional[str] = Query(None),
    actor_id: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    admin: Actor = Depends(require_platform_admin),
) -> Dict[str, Any]:
    query = db.query(SecurityAuditLog)
    if event_type:
        query = query.filter(SecurityAuditLog.event_type.ilike(f"%{event_type}%"))
    if actor_id:
        query = query.filter(SecurityAuditLog.actor_id == actor_id)

    total = query.count()
    items = query.order_by(SecurityAuditLog.created_at.desc()).offset((page - 1) * limit).limit(limit).all()

    audit_list = []
    for log in items:
        audit_list.append({
            "id": log.id,
            "event_type": log.event_type,
            "actor_id": log.actor_id,
            "ip_address": log.ip_address,
            "details": log.details,
            "created_at": log.created_at.isoformat(),
        })

    return {
        "items": audit_list,
        "total": total,
        "page": page,
        "limit": limit,
    }


@router.get("/ai-operations")
def get_ai_operations_telemetry(
    db: Session = Depends(get_db),
    admin: Actor = Depends(require_platform_admin),
) -> Dict[str, Any]:
    settings = get_settings()
    total_requests = db.query(func.count(AIAuditLog.id)).scalar() or 0
    success_count = db.query(func.count(AIAuditLog.id)).filter(AIAuditLog.success == True).scalar() or 0
    failure_count = db.query(func.count(AIAuditLog.id)).filter(AIAuditLog.success == False).scalar() or 0
    avg_latency = db.query(func.avg(AIAuditLog.latency_ms)).scalar() or 0.0

    # Task type counts
    task_counts = (
        db.query(AIAuditLog.task_type, func.count(AIAuditLog.id))
        .group_by(AIAuditLog.task_type)
        .all()
    )

    recent_entries = (
        db.query(AIAuditLog)
        .order_by(AIAuditLog.created_at.desc())
        .limit(10)
        .all()
    )

    recent_logs = []
    for log in recent_entries:
        recent_logs.append({
            "id": log.id,
            "task_type": log.task_type,
            "actor_id": log.actor_id,
            "challenge_id": log.challenge_id,
            "provider": log.provider,
            "model": log.model,
            "prompt_version": log.prompt_version,
            "success": log.success,
            "latency_ms": log.latency_ms,
            "created_at": log.created_at.isoformat(),
        })

    return {
        "ai_enabled": settings.ai_enabled,
        "provider": settings.ai_provider,
        "model": settings.ai_model,
        "total_requests": total_requests,
        "success_count": success_count,
        "failure_count": failure_count,
        "avg_latency_ms": round(float(avg_latency), 2),
        "circuit_breaker_status": circuit_breaker.get_state(),
        "task_breakdown": {t: c for t, c in task_counts},
        "recent_entries": recent_logs,
    }
"""

with open("apps/api/app/api/v1/admin.py", "w") as f:
    f.write(content)

print("apps/api/app/api/v1/admin.py created successfully")
