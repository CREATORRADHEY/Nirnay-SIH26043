import unittest
import uuid
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.database import get_db
from app.main import app as fastapi_app
from app.models.base import Base

class TestMobileOTPAuth(unittest.TestCase):

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

    def test_mobile_otp_send_and_verify(self):
        # 1. Send OTP
        phone = "9876543210"
        send_res = self.client.post(
            "/api/v1/auth/mobile-otp/send",
            json={"phone": phone}
        )
        self.assertEqual(send_res.status_code, 200)
        data = send_res.json()
        self.assertEqual(data["status"], "success")
        self.assertEqual(data["otp_code"], "123456")

        # 2. Verify OTP with test code 123456
        verify_res = self.client.post(
            "/api/v1/auth/mobile-otp/verify",
            json={
                "phone": phone,
                "code": "123456",
                "display_name": "Ramesh Kumar",
                "platform_role": "COMMUNITY_REPORTER"
            }
        )
        self.assertEqual(verify_res.status_code, 200)
        verify_data = verify_res.json()
        self.assertEqual(verify_data["display_name"], "Ramesh Kumar")
        self.assertEqual(verify_data["platform_role"], "COMMUNITY_REPORTER")
        self.assertIn("nirnay_session", verify_res.cookies)

    def test_mobile_otp_invalid_code(self):
        phone = "9876543210"
        verify_res = self.client.post(
            "/api/v1/auth/mobile-otp/verify",
            json={
                "phone": phone,
                "code": "999999",
            }
        )
        self.assertEqual(verify_res.status_code, 401)
