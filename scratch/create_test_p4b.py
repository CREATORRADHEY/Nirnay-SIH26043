content = """import uuid
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.main import app
from app.models.actor import Actor
from app.models.account import Account
from app.models.organization import Organization
from app.models.security_audit_log import SecurityAuditLog
from app.core.dependencies import get_current_actor


class TestPlatformAdminP4B:
    @pytest.fixture(autouse=True)
    def setup_method(self, db_session: Session):
        self.session = db_session
        client = TestClient(app)

        # Create Platform Admin
        admin_account = Account(email="admin.p4b@nirnay.gov.in", password_hash="hashed_pw", is_verified=True)
        self.session.add(admin_account)
        self.session.commit()

        self.admin_actor = Actor(
            account_id=admin_account.id,
            display_name="Master Platform Admin",
            email="admin.p4b@nirnay.gov.in",
            platform_role="PLATFORM_ADMIN",
            is_active=True,
        )
        self.session.add(self.admin_actor)

        # Create Non-Admin User (Government Reviewer)
        gov_account = Account(email="gov.reviewer@nirnay.gov.in", password_hash="hashed_pw", is_verified=True)
        self.session.add(gov_account)
        self.session.commit()

        self.gov_actor = Actor(
            account_id=gov_account.id,
            display_name="Gov Reviewer",
            email="gov.reviewer@nirnay.gov.in",
            platform_role="GOVERNMENT_REVIEWER",
            is_active=True,
        )
        self.session.add(self.gov_actor)

        # Create Test Organization
        self.test_org = Organization(
            name="BIT Mesra Water Lab",
            organization_type="HEI",
            district="Ranchi",
            state="Jharkhand",
            status="PENDING",
            is_active=True,
        )
        self.session.add(self.test_org)
        self.session.commit()

        self.client = client

    def test_admin_overview_and_non_admin_rejection(self):
        # 1. Non-admin access should be rejected with 403
        app.dependency_overrides[get_current_actor] = lambda: self.gov_actor
        res = self.client.get("/api/v1/admin/overview")
        assert res.status_code == 403, "Non-admin user must be rejected with 403 Forbidden"

        # 2. Platform Admin access should succeed
        app.dependency_overrides[get_current_actor] = lambda: self.admin_actor
        res = self.client.get("/api/v1/admin/overview")
        assert res.status_code == 200
        data = res.json()
        assert "active_accounts_count" in data
        assert "pending_orgs_count" in data
        assert data["pending_orgs_count"] >= 1

    def test_organization_approval_lifecycle_and_audit(self):
        app.dependency_overrides[get_current_actor] = lambda: self.admin_actor
        org_id = str(self.test_org.id)

        # 1. Approve Organization
        res = self.client.post(
            f"/api/v1/admin/organizations/{org_id}/status",
            json={"target_status": "ACTIVE", "rationale": "Verified official HEI charter documentation."},
        )
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "ACTIVE"
        assert data["is_active"] is True

        # Check Audit Log
        audit = self.session.query(SecurityAuditLog).filter(SecurityAuditLog.event_type == "ORG_ACTIVE").first()
        assert audit is not None
        assert "Verified official HEI charter" in audit.details

        # 2. Suspend Organization (requires rationale)
        res = self.client.post(
            f"/api/v1/admin/organizations/{org_id}/status",
            json={"target_status": "SUSPENDED", "rationale": "Pending security compliance review."},
        )
        assert res.status_code == 200
        assert res.json()["status"] == "SUSPENDED"

    def test_last_platform_admin_invariant_protection(self):
        app.dependency_overrides[get_current_actor] = lambda: self.admin_actor
        admin_id = str(self.admin_actor.id)

        # Attempt to deactivate the ONLY active platform admin -> Must fail with 400
        res = self.client.patch(
            f"/api/v1/admin/users/{admin_id}/status",
            json={"is_active": False, "rationale": "Accidental deactivation"},
        )
        assert res.status_code == 400
        assert "Cannot deactivate the last active PLATFORM_ADMIN account" in res.json()["detail"]

        # Attempt to demote the ONLY active platform admin -> Must fail with 400
        res = self.client.patch(
            f"/api/v1/admin/users/{admin_id}/role",
            json={"new_role": "COMMUNITY_REPORTER", "rationale": "Accidental demotion"},
        )
        assert res.status_code == 400
        assert "Cannot demote the last active PLATFORM_ADMIN account" in res.json()["detail"]

    def test_audit_logs_and_ai_operations_telemetry(self):
        app.dependency_overrides[get_current_actor] = lambda: self.admin_actor

        # Audit Endpoint
        res = self.client.get("/api/v1/admin/audit")
        assert res.status_code == 200
        assert "items" in res.json()

        # AI Operations Endpoint
        res = self.client.get("/api/v1/admin/ai-operations")
        assert res.status_code == 200
        data = res.json()
        assert "ai_enabled" in data
        assert "circuit_breaker_status" in data

    def test_readiness_health_check(self):
        res = self.client.get("/health/ready")
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "ready"
        assert data["checks"]["database"]["status"] == "ok"
"""

with open("apps/api/app/tests/test_p4b_admin.py", "w") as f:
    f.write(content)

print("apps/api/app/tests/test_p4b_admin.py created successfully")
