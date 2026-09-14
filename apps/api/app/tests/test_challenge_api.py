import unittest
import uuid
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.database import get_db
from app.core.dependencies import get_current_actor
from app.main import app
from app.models.actor import Actor
from app.models.base import Base
from app.models.challenge import Challenge
from app.models.organization import Organization


class TestChallengeAPI(unittest.TestCase):
    """API endpoint integration tests using FastAPI TestClient and thread-safe in-memory SQLite."""

    def setUp(self) -> None:
        self.engine = create_engine(
            "sqlite:///:memory:",
            connect_args={"check_same_thread": False},
            poolclass=StaticPool,
        )
        Base.metadata.create_all(self.engine)
        self.SessionLocal = sessionmaker(bind=self.engine)
        self.session: Session = self.SessionLocal()

        def override_get_db():
            db = self.SessionLocal()
            try:
                yield db
            finally:
                db.close()

        self.actor = Actor(
            id=uuid.uuid4(),
            display_name="Test Citizen",
            platform_role="COMMUNITY_REPORTER",
        )
        self.session.add(self.actor)
        self.session.commit()

        app.dependency_overrides[get_db] = override_get_db
        app.dependency_overrides[get_current_actor] = lambda: self.actor
        self.client = TestClient(app)

    def tearDown(self) -> None:
        app.dependency_overrides.clear()
        self.session.close()

    def test_post_challenge_success(self) -> None:
        payload = {
            "title": "Clean Water Access in Ranchi",
            "summary": "Heavy metal contamination in borewell supply.",
            "description": "Lab test shows lead concentration exceeds safety limit.",
            "domain": "WATER",
            "source_type": "COMMUNITY",
            "district": "Ranchi",
            "state": "Jharkhand",
        }
        res = self.client.post("/api/v1/challenges", json=payload)
        self.assertEqual(res.status_code, 201)
        data = res.json()
        self.assertEqual(data["title"], "Clean Water Access in Ranchi")
        self.assertEqual(data["domain"], "WATER")
        self.assertIn("id", data)

    def test_post_challenge_invalid_payload(self) -> None:
        payload = {
            "title": "",  # invalid empty string
            "summary": "Summary",
        }
        res = self.client.post("/api/v1/challenges", json=payload)
        self.assertEqual(res.status_code, 422)

    def test_get_challenge_detail_success_and_not_found(self) -> None:
        c = Challenge(
            title="Solar Pump Failure",
            summary="Pump motor stopped",
            description="Detailed report",
            domain="ENERGY",
            source_type="GOVERNMENT",
            district="Dhanbad",
        )
        self.session.add(c)
        self.session.commit()

        # Existing
        res = self.client.get(f"/api/v1/challenges/{c.id}")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()["title"], "Solar Pump Failure")

        # Missing
        missing_id = uuid.uuid4()
        res_missing = self.client.get(f"/api/v1/challenges/{missing_id}")
        self.assertEqual(res_missing.status_code, 404)

    def test_get_challenges_list_and_filters(self) -> None:
        c1 = Challenge(title="Ch 1", summary="S1", description="D1", domain="WATER", source_type="COMMUNITY", district="Ranchi")
        c2 = Challenge(title="Ch 2", summary="S2", description="D2", domain="ENERGY", source_type="GOVERNMENT", district="Dhanbad")
        self.session.add_all([c1, c2])
        self.session.commit()

        # List all
        res = self.client.get("/api/v1/challenges")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["total"], 2)

        # Filter by domain
        res_domain = self.client.get("/api/v1/challenges?domain=ENERGY")
        self.assertEqual(res_domain.status_code, 200)
        self.assertEqual(res_domain.json()["total"], 1)
        self.assertEqual(res_domain.json()["items"][0]["title"], "Ch 2")

    def test_post_and_get_evidence(self) -> None:
        c = Challenge(title="Water Test", summary="Sum", description="Desc", domain="WATER", source_type="CITIZEN", district="Ranchi")
        self.session.add(c)
        self.session.commit()

        ev_payload = {
            "evidence_type": "PHOTO",
            "storage_reference": "gcs://nirnay/water-sample.jpg",
            "description": "Water sample photograph",
        }
        res_post = self.client.post(f"/api/v1/challenges/{c.id}/evidence", json=ev_payload)
        self.assertEqual(res_post.status_code, 201)
        ev_data = res_post.json()
        self.assertEqual(ev_data["evidence_type"], "PHOTO")

        res_get = self.client.get(f"/api/v1/challenges/{c.id}/evidence")
        self.assertEqual(res_get.status_code, 200)
        self.assertEqual(res_get.json()["total"], 1)


if __name__ == "__main__":
    unittest.main()
