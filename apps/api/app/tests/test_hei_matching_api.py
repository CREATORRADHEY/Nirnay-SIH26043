import unittest
import uuid
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.database import get_db
from app.core.enums import QualificationRoute
from app.main import app
from app.models.actor import Actor
from app.models.base import Base
from app.models.challenge import Challenge
from app.models.commitment import Commitment
from app.models.hei_capability import HEICapability
from app.models.organization import Organization
from app.models.qualification_decision import QualificationDecision


class TestHEIMatchingAPI(unittest.TestCase):
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

        # Seed data
        self.gov_org = Organization(name="Gov Dept", organization_type="GOVERNMENT")
        self.actor = Actor(display_name="Coordinator")

        self.hei_org = Organization(name="IIT Ranchi", organization_type="HEI")
        self.no_cap_org = Organization(name="Empty Org", organization_type="HEI")

        self.session.add_all([self.gov_org, self.actor, self.hei_org, self.no_cap_org])
        self.session.commit()

        # Add active HEI capability for hei_org
        self.cap = HEICapability(
            organization_id=self.hei_org.id,
            capability_type="RESEARCH_LAB",
            name="Water Quality & Environmental Engineering Lab",
            discipline="Environmental Science",
            is_active=True,
        )
        self.session.add(self.cap)
        self.session.commit()

        # Add challenge
        self.challenge = Challenge(
            title="Water Contamination",
            summary="Sum",
            description="Desc",
            domain="WATER",
            source_type="COMMUNITY",
            district="Ranchi",
        )
        self.session.add(self.challenge)
        self.session.commit()

    def tearDown(self) -> None:
        app.dependency_overrides.clear()
        self.session.close()

    def test_unqualified_challenge_rejects_hei_matching(self) -> None:
        p = {
            "organization_id": str(self.hei_org.id),
            "match_method": "MANUAL",
            "rationale": "Relevant lab",
            "created_by_actor_id": str(self.actor.id),
        }
        r = self.client.post(f"/api/v1/challenges/{self.challenge.id}/hei-candidates", json=p)
        self.assertEqual(r.status_code, 409)
        self.assertIn("not qualified", r.json()["detail"].lower())

    def test_non_innovation_routes_reject_hei_matching(self) -> None:
        for route in [QualificationRoute.SERVICE, QualificationRoute.CLARIFY, QualificationRoute.RESEARCH_REVIEW]:
            ch = Challenge(
                title=f"Challenge {route.value}",
                summary="Sum",
                description="Desc",
                domain="WATER",
                source_type="COMMUNITY",
                district="Ranchi",
            )
            self.session.add(ch)
            self.session.commit()

            q_dec = QualificationDecision(
                challenge_id=ch.id,
                route=route,
                version=1,
                rationale="Qualified non-innovation route",
                decided_by_actor_id=self.actor.id,
            )
            self.session.add(q_dec)
            self.session.commit()

            p = {
                "organization_id": str(self.hei_org.id),
                "match_method": "MANUAL",
                "rationale": "Candidate proposal",
                "created_by_actor_id": str(self.actor.id),
            }
            r = self.client.post(f"/api/v1/challenges/{ch.id}/hei-candidates", json=p)
            self.assertEqual(r.status_code, 409)
            self.assertIn("not eligible for hei matching", r.json()["detail"].lower())

    def test_innovation_challenge_qualified_allows_hei_matching(self) -> None:
        # Qualify as INNOVATION_CHALLENGE
        q_dec = QualificationDecision(
            challenge_id=self.challenge.id,
            route=QualificationRoute.INNOVATION_CHALLENGE,
            version=1,
            rationale="Qualified for innovation challenge",
            decided_by_actor_id=self.actor.id,
        )
        self.session.add(q_dec)
        self.session.commit()

        p = {
            "organization_id": str(self.hei_org.id),
            "match_method": "MANUAL",
            "rationale": "Top research capability in water treatment",
            "created_by_actor_id": str(self.actor.id),
        }
        r = self.client.post(f"/api/v1/challenges/{self.challenge.id}/hei-candidates", json=p)
        self.assertEqual(r.status_code, 201)
        data = r.json()
        self.assertEqual(data["organization_id"], str(self.hei_org.id))
        self.assertEqual(data["match_method"], "MANUAL")

        # Verify NO Commitment row created (MATCHING != COMMITMENT)
        commitments = self.session.scalars(select(Commitment)).all()
        self.assertEqual(len(commitments), 0)

        # GET HEI Candidates -> 200 OK
        r_get = self.client.get(f"/api/v1/challenges/{self.challenge.id}/hei-candidates")
        self.assertEqual(r_get.status_code, 200)
        self.assertEqual(r_get.json()["total"], 1)

    def test_org_without_active_capabilities_rejected(self) -> None:
        q_dec = QualificationDecision(
            challenge_id=self.challenge.id,
            route=QualificationRoute.INNOVATION_CHALLENGE,
            version=1,
            rationale="Qualified",
            decided_by_actor_id=self.actor.id,
        )
        self.session.add(q_dec)
        self.session.commit()

        p = {
            "organization_id": str(self.no_cap_org.id),
            "match_method": "MANUAL",
            "rationale": "Relevant org",
            "created_by_actor_id": str(self.actor.id),
        }
        r = self.client.post(f"/api/v1/challenges/{self.challenge.id}/hei-candidates", json=p)
        self.assertEqual(r.status_code, 409)
        self.assertIn("no active hei capabilities", r.json()["detail"].lower())

    def test_duplicate_candidate_rejected(self) -> None:
        q_dec = QualificationDecision(
            challenge_id=self.challenge.id,
            route=QualificationRoute.INNOVATION_CHALLENGE,
            version=1,
            rationale="Qualified",
            decided_by_actor_id=self.actor.id,
        )
        self.session.add(q_dec)
        self.session.commit()

        p = {
            "organization_id": str(self.hei_org.id),
            "match_method": "MANUAL",
            "rationale": "Relevant org",
            "created_by_actor_id": str(self.actor.id),
        }
        r1 = self.client.post(f"/api/v1/challenges/{self.challenge.id}/hei-candidates", json=p)
        self.assertEqual(r1.status_code, 201)

        # Duplicate POST -> 409
        r2 = self.client.post(f"/api/v1/challenges/{self.challenge.id}/hei-candidates", json=p)
        self.assertEqual(r2.status_code, 409)
        self.assertIn("already a candidate", r2.json()["detail"].lower())

    def test_manual_match_requires_actor(self) -> None:
        p_no_actor = {
            "organization_id": str(self.hei_org.id),
            "match_method": "MANUAL",
            "rationale": "Missing actor attribution",
        }
        r = self.client.post(f"/api/v1/challenges/{self.challenge.id}/hei-candidates", json=p_no_actor)
        self.assertEqual(r.status_code, 422)

    def test_get_organization_capabilities(self) -> None:
        r = self.client.get(f"/api/v1/organizations/{self.hei_org.id}/hei-capabilities")
        self.assertEqual(r.status_code, 200)
        caps = r.json()
        self.assertEqual(len(caps), 1)
        self.assertEqual(caps[0]["name"], "Water Quality & Environmental Engineering Lab")


    def test_get_hei_organizations_discovery(self) -> None:
        # Add another org with inactive capability
        inactive_org = Organization(name="AAA Inactive Org", organization_type="HEI")
        self.session.add(inactive_org)
        self.session.commit()

        inactive_cap = HEICapability(
            organization_id=inactive_org.id,
            capability_type="TEST",
            name="Inactive Cap",
            is_active=False,
        )
        self.session.add(inactive_cap)
        self.session.commit()

        # Add second active HEI org
        active_org_b = Organization(name="BIT Mesra", organization_type="HEI", district="Ranchi")
        self.session.add(active_org_b)
        self.session.commit()

        cap_b = HEICapability(
            organization_id=active_org_b.id,
            capability_type="RESEARCH_CENTER",
            name="Hydrology Research Center",
            discipline="Civil Engineering",
            is_active=True,
        )
        self.session.add(cap_b)
        self.session.commit()

        # Execute discovery GET
        r = self.client.get("/api/v1/hei-organizations")
        self.assertEqual(r.status_code, 200)
        data = r.json()

        # Active orgs returned = 2 (BIT Mesra, IIT Ranchi). Inactive/empty excluded.
        self.assertEqual(data["total"], 2)
        names = [item["name"] for item in data["items"]]
        self.assertEqual(names, ["BIT Mesra", "IIT Ranchi"])

        # Verify active_capabilities returned and no score fields present
        for item in data["items"]:
            self.assertIn("active_capabilities", item)
            self.assertNotIn("match_score", item)
            self.assertNotIn("ai_score", item)
            self.assertNotIn("ranking_score", item)
            for cap in item["active_capabilities"]:
                self.assertIn("name", cap)
                self.assertIn("capability_type", cap)

if __name__ == "__main__":
    unittest.main()
