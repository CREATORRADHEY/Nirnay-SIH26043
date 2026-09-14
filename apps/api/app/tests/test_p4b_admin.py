import uuid
import unittest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app as fastapi_app
from app.core.database import get_db
from app.models.base import Base
from app.models.actor import Actor
from app.models.account import Account
from app.models.organization import Organization
from app.models.security_audit_log import SecurityAuditLog
from app.core.dependencies import get_current_actor


class TestPlatformAdminP4B(unittest.TestCase):
    def setUp(self):
        self.engine = create_engine(
            "sqlite:///:memory:",
            connect_args={"check_same_thread": False},
            poolclass=StaticPool,
        )
        Base.metadata.create_all(self.engine)
        self.SessionLocal = sessionmaker(bind=self.engine)
        self.db: Session = self.SessionLocal()

        def override_get_db():
            db = self.SessionLocal()
            try:
                yield db
            finally:
                db.close()

        fastapi_app.dependency_overrides[get_db] = override_get_db

        # Create Platform Admin Actor & Account
        self.admin_actor = Actor(
            display_name="Master Platform Admin",
            platform_role="PLATFORM_ADMIN",
            is_active=True,
        )
        self.db.add(self.admin_actor)
        self.db.commit()

        admin_account = Account(
            actor_id=self.admin_actor.id,
            email="admin.p4b@nirnay.gov.in",
            password_hash="hashed_pw",
            is_verified=True,
        )
        self.db.add(admin_account)
        self.db.commit()

        # Create Non-Admin User (Government Reviewer)
        self.gov_actor = Actor(
            display_name="Gov Reviewer",
            platform_role="GOVERNMENT_REVIEWER",
            is_active=True,
        )
        self.db.add(self.gov_actor)
        self.db.commit()

        gov_account = Account(
            actor_id=self.gov_actor.id,
            email="gov.reviewer@nirnay.gov.in",
            password_hash="hashed_pw",
            is_verified=True,
        )
        self.db.add(gov_account)
        self.db.commit()

        # Create Test Organization
        self.test_org = Organization(
            name="BIT Mesra Water Lab",
            organization_type="HEI",
            district="Ranchi",
            state="Jharkhand",
            status="PENDING",
            is_active=True,
        )
        self.db.add(self.test_org)
        self.db.commit()

        self.client = TestClient(fastapi_app)

    def tearDown(self):
        fastapi_app.dependency_overrides.clear()
        self.db.close()
        Base.metadata.drop_all(self.engine)

    def test_admin_overview_and_non_admin_rejection(self):
        # 1. Non-admin access should be rejected with 403
        fastapi_app.dependency_overrides[get_current_actor] = lambda: self.gov_actor
        res = self.client.get("/api/v1/admin/overview")
        assert res.status_code == 403, "Non-admin user must be rejected with 403 Forbidden"

        # 2. Platform Admin access should succeed
        fastapi_app.dependency_overrides[get_current_actor] = lambda: self.admin_actor
        res = self.client.get("/api/v1/admin/overview")
        assert res.status_code == 200
        data = res.json()
        assert "active_accounts" in data
        assert "pending_organizations" in data
        assert data["pending_organizations"] >= 1

    def test_organization_approval_lifecycle_and_audit(self):
        fastapi_app.dependency_overrides[get_current_actor] = lambda: self.admin_actor
        org_id = str(self.test_org.id)

        # 1. Approve Organization
        res = self.client.patch(
            f"/api/v1/admin/organizations/{org_id}/status",
            json={"status": "ACTIVE", "rationale": "Verified official HEI charter documentation."},
        )
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "ACTIVE"

        # Check Audit Log
        audit = self.db.query(SecurityAuditLog).filter(SecurityAuditLog.event_type == "ORG_ACTIVATED").first()
        assert audit is not None
        assert "Verified official HEI charter" in audit.details

        # 2. Suspend Organization (requires rationale)
        res = self.client.patch(
            f"/api/v1/admin/organizations/{org_id}/status",
            json={"status": "SUSPENDED", "rationale": "Pending security compliance review."},
        )
        assert res.status_code == 200
        assert res.json()["status"] == "SUSPENDED"

    def test_last_platform_admin_invariant_protection(self):
        fastapi_app.dependency_overrides[get_current_actor] = lambda: self.admin_actor
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
        fastapi_app.dependency_overrides[get_current_actor] = lambda: self.admin_actor

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
