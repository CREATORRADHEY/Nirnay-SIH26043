from typing import Optional, List, Dict
from app.core.enums import PlatformRole, OrganizationType, OrganizationStatus
from app.models.actor import Actor
from app.models.organization import Organization
from app.models.organization_membership import OrganizationMembership

PERMISSIONS_MATRIX: Dict[PlatformRole, List[str]] = {
    PlatformRole.COMMUNITY_REPORTER: [
        "challenge:create",
        "challenge:view_own",
        "challenge:add_evidence",
    ],
    PlatformRole.GOVERNMENT_REVIEWER: [
        "challenge:view_review_scope",
        "qualification:record",
        "hei_candidate:create",
        "readiness:assess",
        "readiness:authorize",
        "pilot:create",
        "outcome:assess",
    ],
    PlatformRole.GOVERNMENT_ADMIN: [
        "challenge:create",
        "challenge:view_review_scope",
        "qualification:record",
        "hei_candidate:create",
        "readiness:assess",
        "readiness:authorize",
        "pilot:create",
        "outcome:assess",
        "organization:manage",
        "organization:invite",
    ],
    PlatformRole.HEI_MEMBER: [
        "commitment:record_own_org",
    ],
    PlatformRole.HEI_REVIEWER: [
        "commitment:record_own_org",
        "readiness:assess",
    ],
    PlatformRole.HEI_ADMIN: [
        "commitment:record_own_org",
        "organization:manage",
        "organization:invite",
    ],
    PlatformRole.INDUSTRY_MEMBER: [
        "commitment:record_own_org",
    ],
    PlatformRole.INDUSTRY_ADMIN: [
        "commitment:record_own_org",
        "organization:manage",
        "organization:invite",
    ],
    PlatformRole.PLATFORM_ADMIN: [
        "challenge:create",
        "challenge:view_own",
        "challenge:view_review_scope",
        "challenge:add_evidence",
        "qualification:record",
        "hei_candidate:create",
        "organization:manage",
        "organization:invite",
        "commitment:record_own_org",
        "readiness:assess",
        "readiness:authorize",
        "pilot:create",
        "outcome:assess",
        "platform:admin",
    ],
}

class PolicyService:
    @staticmethod
    def has_permission(role: str, permission: str) -> bool:
        try:
            r = PlatformRole(role)
            return permission in PERMISSIONS_MATRIX.get(r, [])
        except ValueError:
            return False

    @staticmethod
    def can_perform_action(
        actor: Actor,
        permission: str,
        organization: Optional[Organization] = None,
        membership: Optional[OrganizationMembership] = None,
    ) -> bool:
        if not actor.is_active:
            return False

        if not PolicyService.has_permission(actor.platform_role, permission):
            return False

        if organization is not None:
            if organization.status in [OrganizationStatus.PENDING, OrganizationStatus.SUSPENDED]:
                if permission not in ["challenge:create", "challenge:add_evidence"]:
                    return False

        return True

    @staticmethod
    def allowed_invite_roles(inviter_role: str) -> List[str]:
        if inviter_role == PlatformRole.PLATFORM_ADMIN:
            return [r.value for r in PlatformRole]
        if inviter_role in [PlatformRole.GOVERNMENT_ADMIN, PlatformRole.GOVERNMENT_REVIEWER]:
            return [PlatformRole.GOVERNMENT_REVIEWER.value, PlatformRole.COMMUNITY_REPORTER.value]
        if inviter_role == PlatformRole.HEI_ADMIN:
            return [PlatformRole.HEI_MEMBER.value, PlatformRole.HEI_REVIEWER.value]
        if inviter_role == PlatformRole.INDUSTRY_ADMIN:
            return [PlatformRole.INDUSTRY_MEMBER.value]
        return []
