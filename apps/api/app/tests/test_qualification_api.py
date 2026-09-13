import unittest
import uuid
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.database import get_db
from app.main import app
from app.models.actor import Actor
from app.models.base import Base
from app.models.challenge import Challenge
from app.models.evidence import Evidence
from app.models.organization import Organization


class TestQualificationAPI(unittest.TestCase):
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

        app.dependency_overrides[get_db] = override_get_db
        self.client = TestClient(app)

        # Seed organization and actor
        self.org = Organization(name="Test Org", organization_type="GOVERNMENT")
        self.actor = Actor(display_name="Evaluator Actor")
        self.challenge = Challenge(
            title="Water Pollution",
            summary="Lead contamination",
            description="Detailed report",
            domain="WATER",
            source_type="COMMUNITY",
            district="Ranchi",
        )
        self.session.add_all([self.org, self.actor, self.challenge])
        self.session.commit()

        self.evidence = Evidence(
            challenge_id=self.challenge.id,
            evidence_type="PHOTO",
            storage_reference="gcs://nirnay/water.jpg",
            description="Water photo",
        )
        self.session.add(self.evidence)
        self.session.commit()

    def tearDown(self) -> None:
        app.dependency_overrides.clear()
        self.session.close()

    def test_qualification_versioning_and_history(self) -> None:
        # First decision -> version 1
        p1 = {
            "route": "CLARIFY",
            "rationale": "Need additional lab test reports",
            "decided_by_actor_id": str(self.actor.id),
            "evidence_ids": [str(self.evidence.id)],
        }
        r1 = self.client.post(f"/api/v1/challenges/{self.challenge.id}/qualification-decisions", json=p1)
        self.assertEqual(r1.status_code, 201)
        d1 = r1.json()
        self.assertEqual(d1["version"], 1)
        self.assertEqual(d1["route"], "CLARIFY")

        # Second decision -> version 2
        p2 = {
            "route": "INNOVATION_CHALLENGE",
            "rationale": "Lab test verified, ready for innovation challenge",
            "decided_by_actor_id": str(self.actor.id),
            "evidence_ids": [str(self.evidence.id)],
        }
        r2 = self.client.post(f"/api/v1/challenges/{self.challenge.id}/qualification-decisions", json=p2)
        self.assertEqual(r2.status_code, 201)
        d2 = r2.json()
        self.assertEqual(d2["version"], 2)
        self.assertEqual(d2["route"], "INNOVATION_CHALLENGE")

        # History GET -> returns 2 items in version ASC order
        rh = self.client.get(f"/api/v1/challenges/{self.challenge.id}/qualification-decisions")
        self.assertEqual(rh.status_code, 200)
        history = rh.json()
        self.assertEqual(history["total"], 2)
        self.assertEqual(history["items"][0]["version"], 1)
        self.assertEqual(history["items"][0]["route"], "CLARIFY")
        self.assertEqual(history["items"][1]["version"], 2)
        self.assertEqual(history["items"][1]["route"], "INNOVATION_CHALLENGE")

        # Latest GET -> returns version 2
        rl = self.client.get(f"/api/v1/challenges/{self.challenge.id}/qualification-decisions/latest")
        self.assertEqual(rl.status_code, 200)
        latest = rl.json()
        self.assertEqual(latest["version"], 2)
        self.assertEqual(latest["route"], "INNOVATION_CHALLENGE")

    def test_missing_challenge_actor_evidence(self) -> None:
        missing_id = uuid.uuid4()

        # Missing Challenge -> 404
        p = {
            "route": "SERVICE",
            "rationale": "Service route",
            "decided_by_actor_id": str(self.actor.id),
        }
        r = self.client.post(f"/api/v1/challenges/{missing_id}/qualification-decisions", json=p)
        self.assertEqual(r.status_code, 404)

        # Missing Actor -> 404
        p_no_actor = {
            "route": "SERVICE",
            "rationale": "Service route",
            "decided_by_actor_id": str(missing_id),
        }
        r2 = self.client.post(f"/api/v1/challenges/{self.challenge.id}/qualification-decisions", json=p_no_actor)
        self.assertEqual(r2.status_code, 404)

        # Missing Evidence -> 404
        p_no_ev = {
            "route": "SERVICE",
            "rationale": "Service route",
            "decided_by_actor_id": str(self.actor.id),
            "evidence_ids": [str(missing_id)],
        }
        r3 = self.client.post(f"/api/v1/challenges/{self.challenge.id}/qualification-decisions", json=p_no_ev)
        self.assertEqual(r3.status_code, 404)

    def test_evidence_belonging_to_another_challenge_rejected(self) -> None:
        ch2 = Challenge(
            title="Other Challenge",
            summary="Sum",
            description="Desc",
            domain="ENERGY",
            source_type="GOVERNMENT",
            district="Dhanbad",
        )
        self.session.add(ch2)
        self.session.commit()

        # Try to use evidence belonging to self.challenge for ch2 -> rejected
        p = {
            "route": "SERVICE",
            "rationale": "Invalid evidence reference",
            "decided_by_actor_id": str(self.actor.id),
            "evidence_ids": [str(self.evidence.id)],
        }
        r = self.client.post(f"/api/v1/challenges/{ch2.id}/qualification-decisions", json=p)
        self.assertEqual(r.status_code, 409)
        self.assertIn("does not belong", r.json()["detail"])

    def test_invalid_qualification_route_rejected(self) -> None:
        p = {
            "route": "INVALID_ROUTE",
            "rationale": "Invalid route test",
            "decided_by_actor_id": str(self.actor.id),
        }
        r = self.client.post(f"/api/v1/challenges/{self.challenge.id}/qualification-decisions", json=p)
        self.assertEqual(r.status_code, 422)

    def test_no_qualification_decision_latest_returns_404(self) -> None:
        c_new = Challenge(
            title="Unqualified",
            summary="Sum",
            description="Desc",
            domain="HEALTH",
            source_type="CITIZEN",
            district="Ranchi",
        )
        self.session.add(c_new)
        self.session.commit()

        rl = self.client.get(f"/api/v1/challenges/{c_new.id}/qualification-decisions/latest")
        self.assertEqual(rl.status_code, 404)
        self.assertIn("No qualification decision found", rl.json()["detail"])


if __name__ == "__main__":
    unittest.main()
