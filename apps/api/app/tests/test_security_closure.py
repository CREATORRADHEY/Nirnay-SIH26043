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
from app.models.organization import Organization
from app.models.organization_membership import OrganizationMembership
from app.models.challenge import Challenge
from app.models.qualification_decision import QualificationDecision
from app.core.security import verify_password, hash_password

class TestSecurityClosureP1(unittest.TestCase):

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
        self.client = TestClient(fastapi_app)

    def tearDown(self):
        self.db.close()
        fastapi_app.dependency_overrides.clear()

    def test_argon2_password_hashing(self):
        pwd = "SecurePassword123!"
        hashed = hash_password(pwd)
        self.assertTrue(hashed.startswith("$argon2"))
        is_valid, needs_rehash = verify_password(pwd, hashed)
        self.assertTrue(is_valid)
        self.assertFalse(needs_rehash)

    def test_registration_login_security_cookies(self):
        email = f"sec_user_{uuid.uuid4().hex[:8]}@example.com"
        reg_resp = self.client.post(
            "/api/v1/auth/register",
            json={"display_name": "Security Tester", "email": email, "password": "Password123!"},
        )
        self.assertEqual(reg_resp.status_code, 201)
        data = reg_resp.json()
        self.assertIn("csrf_token", data)
        self.assertIn("nirnay_session", reg_resp.cookies)
        self.assertIn("nirnay_csrf", reg_resp.cookies)

        dup_resp = self.client.post(
            "/api/v1/auth/register",
            json={"display_name": "Dup Tester", "email": email, "password": "Password123!"},
        )
        self.assertEqual(dup_resp.status_code, 400)

    def test_csrf_protection_on_unsafe_methods(self):
        email = f"csrf_user_{uuid.uuid4().hex[:8]}@example.com"
        reg_client = TestClient(fastapi_app)
        reg_resp = reg_client.post(
            "/api/v1/auth/register",
            json={"display_name": "CSRF User", "email": email, "password": "Password123!"},
        )
        csrf_token = reg_resp.json()["csrf_token"]

        no_csrf_resp = reg_client.post(
            "/api/v1/auth/sessions/revoke-others",
        )
        self.assertEqual(no_csrf_resp.status_code, 403)

        valid_csrf_resp = reg_client.post(
            "/api/v1/auth/sessions/revoke-others",
            headers={"X-CSRF-Token": csrf_token},
        )
        self.assertEqual(valid_csrf_resp.status_code, 200)

    def test_forgot_password_enumeration_safety(self):
        resp = self.client.post(
            "/api/v1/auth/forgot-password",
            json={"email": "non_existent_user_xyz@example.com"},
        )
        self.assertEqual(resp.status_code, 200)
        self.assertIn("If an account exists", resp.json()["message"])

    def test_institutional_boundary_idor(self):
        rev_actor = Actor(display_name="Gov Reviewer", platform_role="GOVERNMENT_REVIEWER", is_active=True)
        org_a = Organization(name="HEI A", organization_type="HEI", status="ACTIVE")
        org_b = Organization(name="HEI B", organization_type="HEI", status="ACTIVE")
        ch = Challenge(
            id=uuid.UUID("c0a80001-0000-4000-8000-000000000001"),
            title="Test Challenge",
            summary="Test Summary",
            description="Test Description for IDOR Test",
            domain="WATER",
            source_type="COMMUNITY",
            district="Ranchi",
            state="Jharkhand",
        )
        self.db.add_all([rev_actor, org_a, org_b, ch])
        self.db.flush()

        qdec = QualificationDecision(
            challenge_id=ch.id,
            route="INNOVATION_CHALLENGE",
            version=1,
            rationale="Qualified for research pilot.",
            decided_by_actor_id=rev_actor.id,
        )
        self.db.add(qdec)
        self.db.commit()

        email_a = f"hei_a_{uuid.uuid4().hex[:8]}@example.com"
        reg_resp = self.client.post(
            "/api/v1/auth/register",
            json={"display_name": "HEI A Member", "email": email_a, "password": "Password123!", "platform_role": "HEI_MEMBER"},
        )
        csrf_a = reg_resp.json()["csrf_token"]
        actor_id_a = reg_resp.json()["id"]

        mem_a = OrganizationMembership(actor_id=uuid.UUID(actor_id_a), organization_id=org_a.id, role="MEMBER", is_primary=True)
        self.db.add(mem_a)
        self.db.commit()

        comm_resp = self.client.post(
            "/api/v1/challenges/c0a80001-0000-4000-8000-000000000001/commitments",
            headers={"X-CSRF-Token": csrf_a},
            cookies=reg_resp.cookies,
            json={
                "organization_id": str(org_b.id),
                "commitment_type": "RESEARCH_FACILITY",
                "status": "PROPOSED",
                "scope_description": "Lab equipment sharing",
                "recorded_by_actor_id": actor_id_a,
                "expected_version": 0,
            },
        )
        self.assertEqual(comm_resp.status_code, 403)
        self.assertIn("Institutional boundary violation", comm_resp.json()["detail"])

    def test_pending_organization_blocked(self):
        pending_org = Organization(name="Pending Startup", organization_type="INDUSTRY", status="PENDING")
        self.db.add(pending_org)
        self.db.commit()

        email_adm = f"admin_{uuid.uuid4().hex[:8]}@example.com"
        reg_resp = self.client.post(
            "/api/v1/auth/register",
            json={"display_name": "Admin", "email": email_adm, "password": "Password123!", "platform_role": "PLATFORM_ADMIN"},
        )
        csrf = reg_resp.json()["csrf_token"]

        inv_resp = self.client.post(
            f"/api/v1/organizations/{pending_org.id}/invites",
            headers={"X-CSRF-Token": csrf},
            cookies=reg_resp.cookies,
            json={"email": "member@example.com", "role": "MEMBER"},
        )
        self.assertEqual(inv_resp.status_code, 403)
        self.assertIn("pending or suspended", inv_resp.json()["detail"])


if __name__ == "__main__":
    unittest.main()
