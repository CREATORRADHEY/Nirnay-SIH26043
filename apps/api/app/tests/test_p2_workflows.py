import unittest
import io
import uuid

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.database import get_db
from app.core.dependencies import get_current_actor
from app.core.security import hash_password
from app.main import app as fastapi_app
from app.models.base import Base
from app.models.account import Account
from app.models.actor import Actor

class TestP2Workflows(unittest.TestCase):

    def setUp(self):
        self.engine = create_engine(
            "sqlite:///:memory:",
            connect_args={"check_same_thread": False},
            poolclass=StaticPool,
        )
        Base.metadata.create_all(self.engine)
        self.SessionLocal = sessionmaker(bind=self.engine)
        self.db: Session = self.SessionLocal()
        self.current_user_actor = None

        def override_get_db():
            db = self.SessionLocal()
            try:
                yield db
            finally:
                db.close()

        def override_get_current_actor():
            if not self.current_user_actor:
                raise Exception("No logged in actor")
            return self.db.query(Actor).get(self.current_user_actor.id)

        fastapi_app.dependency_overrides[get_db] = override_get_db
        fastapi_app.dependency_overrides[get_current_actor] = override_get_current_actor
        self.client = TestClient(fastapi_app)

    def tearDown(self):
        self.db.close()
        fastapi_app.dependency_overrides.clear()

    def _create_user(self, email: str, password: str, platform_role: str, display_name: str):
        pw_hash = hash_password(password)
        actor = Actor(
            display_name=display_name,
            platform_role=platform_role,
        )
        self.db.add(actor)
        self.db.commit()

        account = Account(
            actor_id=actor.id,
            email=email,
            password_hash=pw_hash,
            is_verified=True,
        )
        self.db.add(account)
        self.db.commit()
        return account, actor

    def test_citizen_challenge_submission_and_my_challenges(self):
        _, actor = self._create_user("citizen.p2@test.gov.in", "Citizen123!", "COMMUNITY_REPORTER", "Citizen Reporter P2")
        self.current_user_actor = actor

        sub_res = self.client.post(
            "/api/v1/challenges",
            json={
                "title": "Safe Drinking Water Access in Dumka Rural",
                "summary": "Fluoride and iron contamination in drinking water wells across Dumka.",
                "description": "Severe fluoride and iron contamination in drinking water wells across 5 panchayats in Dumka district causing endemic health issues.",
                "domain": "WATER_SANITATION",
                "source_type": "CITIZEN",
                "district": "Dumka",
                "state": "Jharkhand",
            },
        )
        self.assertEqual(sub_res.status_code, 201, sub_res.text)
        ch_data = sub_res.json()
        self.assertEqual(ch_data["title"], "Safe Drinking Water Access in Dumka Rural")
        ch_id = ch_data["id"]

        me_res = self.client.get("/api/v1/me/challenges")
        self.assertEqual(me_res.status_code, 200, me_res.text)
        data = me_res.json()
        items = data if isinstance(data, list) else data.get("items", [])
        self.assertGreaterEqual(len(items), 1)
        self.assertTrue(any(item["id"] == ch_id for item in items))

    def test_evidence_file_upload_and_secure_download(self):
        _, actor = self._create_user("citizen.ev@test.gov.in", "Citizen123!", "COMMUNITY_REPORTER", "Citizen Evidence Upload")
        self.current_user_actor = actor

        sub_res = self.client.post(
            "/api/v1/challenges",
            json={
                "title": "Rural Health Center Water Testing Report",
                "summary": "Lab test reports showing high heavy metal concentration.",
                "description": "Lab test reports showing high heavy metal concentration in drinking water.",
                "domain": "HEALTHCARE",
                "source_type": "CITIZEN",
                "district": "Ranchi",
                "state": "Jharkhand",
            },
        )
        self.assertEqual(sub_res.status_code, 201, sub_res.text)
        ch_id = sub_res.json()["id"]

        file_content = b"%PDF-WATER_TEST_REPORT_PDF_DATA_DUMKA_2026"
        upload_res = self.client.post(
            f"/api/v1/challenges/{ch_id}/evidence/upload",
            files={"file": ("water_report.pdf", io.BytesIO(file_content), "application/pdf")},
            data={
                "evidence_type": "DOCUMENT",
                "description": "Official Water Testing Laboratory Report",
                "source_type": "CITIZEN",
            },
        )
        self.assertEqual(upload_res.status_code, 201, upload_res.text)
        ev_data = upload_res.json()
        self.assertIn("Official Water Testing Laboratory Report", ev_data["description"])
        ev_id = ev_data["id"]

        dl_res = self.client.get(f"/api/v1/evidence/{ev_id}/file")
        self.assertEqual(dl_res.status_code, 200)
        self.assertEqual(dl_res.content, file_content)

    def test_government_review_queue_and_rbac(self):
        _, gov_actor = self._create_user("officer.p2@test.gov.in", "GovOfficer123!", "GOVERNMENT_REVIEWER", "Officer R. K. Sharma")
        _, cit_actor = self._create_user("cit.req@test.gov.in", "Citizen123!", "COMMUNITY_REPORTER", "Citizen Requester")

        self.current_user_actor = cit_actor
        queue_res_cit = self.client.get("/api/v1/government/review-queue")
        self.assertEqual(queue_res_cit.status_code, 403)

        self.current_user_actor = gov_actor
        queue_res_gov = self.client.get("/api/v1/government/review-queue")
        self.assertEqual(queue_res_gov.status_code, 200)
        data = queue_res_gov.json()
        self.assertIn("items", data)
        self.assertIn("total", data)
        self.assertIn("stats", data)

    def test_clarification_workflow_and_notifications(self):
        _, gov_actor = self._create_user("reviewer.clar@test.gov.in", "ReviewerPass123!", "GOVERNMENT_REVIEWER", "Reviewer Clarification")
        _, cit_actor = self._create_user("reporter.clar@test.gov.in", "ReporterPass123!", "COMMUNITY_REPORTER", "Reporter Clarification")

        self.current_user_actor = cit_actor
        ch_res = self.client.post(
            "/api/v1/challenges",
            json={
                "title": "Bridge Washout in West Singhbhum",
                "summary": "Wooden footbridge destroyed by monsoon stream surge.",
                "description": "Monsoon stream surge destroyed wooden footbridge, isolating 3 villages.",
                "domain": "INFRASTRUCTURE",
                "source_type": "CITIZEN",
                "district": "West Singhbhum",
                "state": "Jharkhand",
            },
        )
        self.assertEqual(ch_res.status_code, 201, ch_res.text)
        ch_id = ch_res.json()["id"]

        self.current_user_actor = gov_actor
        clar_res = self.client.post(
            f"/api/v1/challenges/{ch_id}/clarifications",
            json={"question": "Please clarify whether school children have an alternative walking route across the stream."},
        )
        self.assertEqual(clar_res.status_code, 201, clar_res.text)
        req_id = clar_res.json()["id"]

        self.current_user_actor = cit_actor
        notif_res = self.client.get("/api/v1/notifications")
        self.assertEqual(notif_res.status_code, 200)
        data = notif_res.json()
        notifs = data if isinstance(data, list) else data.get("items", [])
        self.assertGreaterEqual(len(notifs), 1)
        self.assertIn("Clarification Requested", notifs[0]["title"])

        resp_res = self.client.post(
            f"/api/v1/clarifications/{req_id}/respond",
            json={"response": "No alternative walking route exists within 8km radius. Children are currently missing school."},
        )
        self.assertEqual(resp_res.status_code, 201, resp_res.text)
        self.assertEqual(resp_res.json()["response"], "No alternative walking route exists within 8km radius. Children are currently missing school.")

        self.current_user_actor = gov_actor
        gov_notif_res = self.client.get("/api/v1/notifications")
        self.assertEqual(gov_notif_res.status_code, 200)
        gov_data = gov_notif_res.json()
        gov_notifs = gov_data if isinstance(gov_data, list) else gov_data.get("items", [])
        self.assertGreaterEqual(len(gov_notifs), 1)
        self.assertIn("Clarification Response", gov_notifs[0]["title"])
