import unittest
import uuid
from starlette.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.core.database import get_db
from app.models.base import Base
from app.models.account import Account
from app.models.actor import Actor
from app.models.organization import Organization
from app.models.organization_membership import OrganizationMembership
from app.models.challenge import Challenge
from app.models.qualification_decision import QualificationDecision
from app.models.hei_capability import HEICapability
from app.models.challenge_hei_candidate import ChallengeHEICandidate
from app.models.commitment import Commitment
from app.models.readiness_decision import ReadinessDecision
from app.models.readiness_condition import ReadinessCondition
from app.core.enums import (
    PlatformRole,
    OrganizationType,
    OrganizationStatus,
    QualificationRoute,
    CommitmentStatus,
    ReadinessStatus,
)


class TestP3HEIIndustryWorkflows(unittest.TestCase):
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
            try:
                yield self.db
            finally:
                pass

        app.dependency_overrides[get_db] = override_get_db
        self.client = TestClient(app)

        # Seed test actors and organizations
        self.hei_org = Organization(
            name="Birla Institute of Technology Mesra",
            organization_type=OrganizationType.HEI,
            status=OrganizationStatus.ACTIVE,
            state="Jharkhand",
            district="Ranchi",
        )
        self.ind_org = Organization(
            name="Tata Steel R&D",
            organization_type=OrganizationType.INDUSTRY,
            status=OrganizationStatus.ACTIVE,
            state="Jharkhand",
            district="Jamshedpur",
        )
        self.db.add_all([self.hei_org, self.ind_org])
        self.db.flush()

        self.hei_actor = Actor(
            display_name="Dr. R. K. Sharma",
            platform_role=PlatformRole.HEI_ADMIN,
        )
        self.ind_actor = Actor(
            display_name="Anand V. Verma",
            platform_role=PlatformRole.INDUSTRY_ADMIN,
        )
        self.gov_actor = Actor(
            display_name="Officer S. K. Roy",
            platform_role=PlatformRole.GOVERNMENT_REVIEWER,
        )
        self.db.add_all([self.hei_actor, self.ind_actor, self.gov_actor])
        self.db.flush()

        self.hei_mem = OrganizationMembership(
            actor_id=self.hei_actor.id,
            organization_id=self.hei_org.id,
            role="MEMBER",
            affiliation_label="Director R&D",
            is_primary=True,
        )
        self.ind_mem = OrganizationMembership(
            actor_id=self.ind_actor.id,
            organization_id=self.ind_org.id,
            role="MEMBER",
            affiliation_label="VP Innovation",
            is_primary=True,
        )
        self.db.add_all([self.hei_mem, self.ind_mem])
        self.db.flush()

        # Seed qualified challenge
        self.challenge = Challenge(
            title="Solar Microgrid Storage in Heavy Rainfall Regions",
            summary="Testing solar storage efficiency in Netarhat plateau",
            description="Detailed field requirements for battery storage in high humidity",
            domain="Clean Energy",
            source_type="FIELD_REPORT",
            district="Latehar",
            state="Jharkhand",
            submitted_by_actor_id=self.gov_actor.id,
        )
        self.db.add(self.challenge)
        self.db.flush()

        self.qual = QualificationDecision(
            challenge_id=self.challenge.id,
            route=QualificationRoute.INNOVATION_CHALLENGE,
            version=1,
            rationale="Qualified for HEI R&D matching",
            decided_by_actor_id=self.gov_actor.id,
        )
        self.db.add(self.qual)

        # Seed HEI capability
        self.hei_cap = HEICapability(
            organization_id=self.hei_org.id,
            capability_type="LAB_FACILITY",
            name="Advanced Battery Testing Lab",
            description="High humidity testing chamber and cell diagnostic bench",
            discipline="Clean Energy & Battery Tech",
            is_active=True,
        )
        self.db.add(self.hei_cap)
        self.db.commit()

    def tearDown(self):
        self.db.close()
        Base.metadata.drop_all(self.engine)
        app.dependency_overrides.clear()

    def test_hei_organizations_listing(self):
        """Verify endpoint returns HEI organizations with active capabilities."""
        res = self.client.get("/api/v1/hei-organizations")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertGreaterEqual(data["total"], 1)
        org_names = [o["name"] for o in data["items"]]
        self.assertIn("Birla Institute of Technology Mesra", org_names)

    def test_hei_candidate_match_creation(self):
        """Verify GOVERNMENT_REVIEWER can propose candidate HEI match."""
        from app.core.dependencies import get_current_actor
        app.dependency_overrides[get_current_actor] = lambda: self.gov_actor

        payload = {
            "organization_id": str(self.hei_org.id),
            "match_method": "MANUAL",
            "rationale": "High domain fit for lithium battery testing",
            "created_by_actor_id": str(self.gov_actor.id),
        }
        res = self.client.post(f"/api/v1/challenges/{self.challenge.id}/hei-candidates", json=payload)
        self.assertEqual(res.status_code, 201)
        data = res.json()
        self.assertEqual(data["organization_id"], str(self.hei_org.id))
        self.assertEqual(data["match_method"], "MANUAL")

    def test_industry_commitment_creation_and_versioning(self):
        """Verify INDUSTRY_ADMIN can record binding resource commitment and increment version."""
        from app.core.dependencies import get_current_actor
        app.dependency_overrides[get_current_actor] = lambda: self.ind_actor

        # Version 1: OFFERED
        payload_v1 = {
            "organization_id": str(self.ind_org.id),
            "commitment_type": "MATCHING_FUNDS",
            "status": "OFFERED",
            "scope_description": "₹15 Lakhs matching grant for prototype assembly",
            "expected_version": 0,
        }
        res_v1 = self.client.post(f"/api/v1/challenges/{self.challenge.id}/commitments", json=payload_v1)
        self.assertEqual(res_v1.status_code, 201)
        data_v1 = res_v1.json()
        self.assertEqual(data_v1["version"], 1)
        self.assertEqual(data_v1["status"], "OFFERED")

        # Version 2: ACCEPTED
        payload_v2 = {
            "organization_id": str(self.ind_org.id),
            "commitment_type": "MATCHING_FUNDS",
            "status": "ACCEPTED",
            "scope_description": "₹15 Lakhs matching grant approved by board",
            "expected_version": 1,
        }
        res_v2 = self.client.post(f"/api/v1/challenges/{self.challenge.id}/commitments", json=payload_v2)
        self.assertEqual(res_v2.status_code, 201)
        data_v2 = res_v2.json()
        self.assertEqual(data_v2["version"], 2)
        self.assertEqual(data_v2["status"], "ACCEPTED")

    def test_institutional_boundary_protection(self):
        """Verify an actor cannot record commitment for an unassigned organization."""
        from app.core.dependencies import get_current_actor
        app.dependency_overrides[get_current_actor] = lambda: self.ind_actor

        payload = {
            "organization_id": str(self.hei_org.id),
            "commitment_type": "FACULTY_RND",
            "status": "OFFERED",
            "scope_description": "Unauthorized commitment",
            "expected_version": 0,
        }
        res = self.client.post(f"/api/v1/challenges/{self.challenge.id}/commitments", json=payload)
        self.assertEqual(res.status_code, 403)
        self.assertIn("Institutional boundary violation", res.json()["detail"])
