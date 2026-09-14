import uuid
from datetime import datetime, timedelta, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_actor
from app.models.actor import Actor
from app.models.organization import Organization
from app.models.organization_membership import OrganizationMembership
from app.models.auth_tokens import OrganizationInvite
from app.core.security import generate_secure_token, hash_token
from app.services.policy_service import PolicyService
from app.core.enums import OrganizationStatus, PlatformRole

router = APIRouter(prefix="/api/v1/organizations", tags=["Organizations"])


class OrganizationCreateRequest(BaseModel):
    name: str
    type: str
    state: Optional[str] = "Jharkhand"
    district: Optional[str] = "Ranchi"


class OrganizationInviteRequest(BaseModel):
    email: str
    role: Optional[str] = "MEMBER"


@router.get("", response_model=List[dict])
def list_organizations(
    db: Session = Depends(get_db),
):
    orgs = db.scalars(select(Organization).where(Organization.is_active == True)).all()
    result = []
    for o in orgs:
        result.append(
            {
                "id": str(o.id),
                "name": o.name,
                "type": o.organization_type,
                "district": o.district,
                "state": o.state,
                "status": o.status,
                "created_at": o.created_at.isoformat(),
            }
        )
    return result


@router.post("", status_code=status.HTTP_201_CREATED)
def create_organization(
    payload: OrganizationCreateRequest,
    current_actor: Actor = Depends(get_current_actor),
    db: Session = Depends(get_db),
):
    initial_status = OrganizationStatus.ACTIVE.value if current_actor.platform_role == PlatformRole.PLATFORM_ADMIN.value else OrganizationStatus.PENDING.value

    org = Organization(
        name=payload.name.strip(),
        organization_type=payload.type.strip().upper(),
        state=payload.state or "Jharkhand",
        district=payload.district or "Ranchi",
        status=initial_status,
        is_active=True,
    )
    db.add(org)
    db.flush()

    membership = OrganizationMembership(
        actor_id=current_actor.id,
        organization_id=org.id,
        role="ADMIN",
        is_primary=True,
    )
    db.add(membership)
    db.commit()

    return {
        "id": str(org.id),
        "name": org.name,
        "type": org.organization_type,
        "status": org.status,
        "message": "Organization created successfully." + (" Pending admin review." if initial_status == OrganizationStatus.PENDING.value else ""),
    }


@router.post("/{org_id}/activate")
def activate_organization(
    org_id: str,
    current_actor: Actor = Depends(get_current_actor),
    db: Session = Depends(get_db),
):
    if not PolicyService.can_perform_action(current_actor, "platform:admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only Platform Administrators can activate pending organizations.",
        )

    try:
        o_uuid = uuid.UUID(org_id)
        org = db.scalar(select(Organization).where(Organization.id == o_uuid))
        if not org:
            raise HTTPException(status_code=404, detail="Organization not found.")
        org.status = OrganizationStatus.ACTIVE.value
        db.commit()
        return {"id": str(org.id), "status": org.status, "message": "Organization activated."}
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid organization ID.")


@router.post("/{org_id}/invites", status_code=status.HTTP_201_CREATED)
def invite_organization_member(
    org_id: str,
    payload: OrganizationInviteRequest,
    current_actor: Actor = Depends(get_current_actor),
    db: Session = Depends(get_db),
):
    try:
        o_uuid = uuid.UUID(org_id)
        org = db.scalar(select(Organization).where(Organization.id == o_uuid))
        if not org:
            raise HTTPException(status_code=404, detail="Organization not found.")
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid organization ID.")

    if org.status in [OrganizationStatus.PENDING.value, OrganizationStatus.SUSPENDED.value]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot issue invitations for pending or suspended organizations.",
        )

    membership = db.scalar(
        select(OrganizationMembership).where(
            OrganizationMembership.actor_id == current_actor.id,
            OrganizationMembership.organization_id == o_uuid,
        )
    )
    if not membership and current_actor.platform_role != PlatformRole.PLATFORM_ADMIN.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a member of this organization.",
        )

    requested_role = payload.role.upper() if payload.role else "MEMBER"
    allowed_roles = PolicyService.allowed_invite_roles(current_actor.platform_role)
    if requested_role not in allowed_roles and current_actor.platform_role != PlatformRole.PLATFORM_ADMIN.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Your role ({current_actor.platform_role}) cannot grant requested role ({requested_role}). Allowed: {allowed_roles}",
        )

    raw_token = generate_secure_token()
    invite = OrganizationInvite(
        organization_id=o_uuid,
        email=payload.email.strip().lower(),
        role=requested_role,
        token_hash=hash_token(raw_token),
        invited_by_actor_id=current_actor.id,
        expires_at=datetime.now(timezone.utc) + timedelta(days=7),
    )
    db.add(invite)
    db.commit()

    return {
        "id": str(invite.id),
        "organization_id": str(org.id),
        "email": invite.email,
        "role": invite.role,
        "invite_token": raw_token,
        "message": "Invitation created successfully.",
    }
