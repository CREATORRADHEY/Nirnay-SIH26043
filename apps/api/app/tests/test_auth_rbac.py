import unittest
import uuid
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.database import get_db
from app.core.security import hash_password, verify_password, hash_token
from app.main import app as fastapi_app

from app.models.base import Base
from app.models.actor import Actor
from app.models.organization import Organization
from app.models.organization_membership import OrganizationMembership
from app.models.account import Account
from app.models.auth_session import AuthSession
from app.models.auth_tokens import EmailVerificationToken, PasswordResetToken, OrganizationInvite
from app.services.auth_service import AuthService
from app.services.policy_service import PolicyService


class TestAuthRBAC(unittest.TestCase):

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

    def test_password_hashing(self):
        pwd = "SecurePass123!"
        h = hash_password(pwd)
        is_valid, needs_rehash = verify_password(pwd, h)
        self.assertTrue(is_valid)
        self.assertFalse(needs_rehash)
        is_wrong_valid, _ = verify_password("WrongPass", h)
        self.assertFalse(is_wrong_valid)

    def test_register_and_login_flow(self):
        email = f"user_{uuid.uuid4().hex[:6]}@example.com"
        
        reg_res = self.client.post("/api/v1/auth/register", json={
            "display_name": "Test Citizen",
            "email": email,
            "password": "Password123!",
        })
        self.assertEqual(reg_res.status_code, 201)
        data = reg_res.json()
        self.assertEqual(data["display_name"], "Test Citizen")
        self.assertEqual(data["platform_role"], "COMMUNITY_REPORTER")
        self.assertIn("nirnay_session", reg_res.cookies)

        session_cookie = reg_res.cookies["nirnay_session"]
        csrf_token = data["csrf_token"]

        me_res = self.client.get("/api/v1/auth/me", cookies={"nirnay_session": session_cookie})
        self.assertEqual(me_res.status_code, 200)
        self.assertEqual(me_res.json()["display_name"], "Test Citizen")

        logout_res = self.client.post("/api/v1/auth/logout", cookies={"nirnay_session": session_cookie}, headers={"X-CSRF-Token": csrf_token})
        self.assertEqual(logout_res.status_code, 200)

        unauth_res = self.client.get("/api/v1/auth/me", cookies={"nirnay_session": session_cookie})
        self.assertEqual(unauth_res.status_code, 401)

        login_res = self.client.post("/api/v1/auth/login", json={
            "email": email,
            "password": "Password123!",
        })
        self.assertEqual(login_res.status_code, 200)
        self.assertIn("nirnay_session", login_res.cookies)

    def test_rbac_government_reviewer_restriction(self):
        email = f"citizen_{uuid.uuid4().hex[:6]}@example.com"
        reg_res = self.client.post("/api/v1/auth/register", json={
            "display_name": "Plain Citizen",
            "email": email,
            "password": "Password123!",
        })
        cookie = reg_res.cookies["nirnay_session"]

        gov_res = self.client.get("/api/v1/dashboard/government", cookies={"nirnay_session": cookie})
        self.assertEqual(gov_res.status_code, 403)

    def test_organization_onboarding_and_invite(self):
        email = f"admin_{uuid.uuid4().hex[:6]}@example.com"
        reg_res = self.client.post("/api/v1/auth/register", json={
            "display_name": "Org Admin User",
            "email": email,
            "password": "Password123!",
            "platform_role": "PLATFORM_ADMIN",
        })
        cookie = reg_res.cookies["nirnay_session"]
        csrf = reg_res.json()["csrf_token"]

        org_res = self.client.post("/api/v1/organizations", json={
            "name": "Ranchi Water Innovation Lab",
            "type": "HEI",
            "district": "Ranchi",
        }, cookies={"nirnay_session": cookie}, headers={"X-CSRF-Token": csrf})
        self.assertEqual(org_res.status_code, 201)
        org_data = org_res.json()
        org_id = org_data["id"]

        invite_email = f"member_{uuid.uuid4().hex[:6]}@example.com"
        inv_res = self.client.post(f"/api/v1/organizations/{org_id}/invites", json={
            "email": invite_email,
            "role": "MEMBER",
        }, cookies={"nirnay_session": cookie}, headers={"X-CSRF-Token": csrf})
        self.assertEqual(inv_res.status_code, 201)
        inv_data = inv_res.json()
        token = inv_data["invite_token"]
        self.assertIsNotNone(token)


if __name__ == "__main__":
    unittest.main()
