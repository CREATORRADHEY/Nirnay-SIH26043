import unittest
import uuid
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.database import get_db
from app.core.enums import CommitmentStatus, ConditionStatus, QualificationRoute, ReadinessStatus
from app.main import app
from app.models.actor import Actor
from app.models.base import Base
from app.models.challenge import Challenge
from app.models.hei_capability import HEICapability
from app.models.organization import Organization
from app.services.readiness_integrity import invalidate_readiness_for_commitment_change


class TestCommitmentReadinessAPI(unittest.TestCase):
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

        # Seed foundation entities
        self.gov_org = Organization(name="Gov Ministry", organization_type="GOVERNMENT")
        self.hei_org = Organization(name="IIT Dhanbad", organization_type="HEI")
        self.actor = Actor(display_name="Lead Evaluator")

        self.session.add_all([self.gov_org, self.hei_org, self.actor])
        self.session.commit()

        self.cap = HEICapability(
            organization_id=self.hei_org.id,
            capability_type="LAB",
            name="Water Tech Lab",
            discipline="Environmental",
            is_active=True,
        )
        self.session.add(self.cap)
        self.session.commit()

        self.challenge = Challenge(
            title="Lead Contamination",
            summary="Sum",
            description="Desc",
            domain="WATER",
            source_type="CITIZEN",
            district="Ranchi",
        )
        self.session.add(self.challenge)
        self.session.commit()

        # Qualify challenge as INNOVATION_CHALLENGE
        q_payload = {
            "route": "INNOVATION_CHALLENGE",
            "rationale": "Qualified for innovation challenge",
            "decided_by_actor_id": str(self.actor.id),
        }
        self.client.post(f"/api/v1/challenges/{self.challenge.id}/qualification-decisions", json=q_payload)

        # Create HEI candidate match
        cand_payload = {
            "organization_id": str(self.hei_org.id),
            "match_method": "MANUAL",
            "rationale": "Matches lab capability",
            "created_by_actor_id": str(self.actor.id),
        }
        self.client.post(f"/api/v1/challenges/{self.challenge.id}/hei-candidates", json=cand_payload)

    def tearDown(self) -> None:
        app.dependency_overrides.clear()
        self.session.close()

    def test_hero_commitment_readiness_invalidation_flow(self) -> None:
        ch_id = str(self.challenge.id)
        actor_id = str(self.actor.id)
        org_id = str(self.hei_org.id)

        # 1. POST Commitment v1: ACCEPTED
        com_payload = {
            "organization_id": org_id,
            "commitment_type": "FACULTY_SUPPORT",
            "status": "ACCEPTED",
            "scope_description": "2 faculty members committed",
            "recorded_by_actor_id": actor_id,
            "expected_version": 0,
        }
        r_com1 = self.client.post(f"/api/v1/challenges/{ch_id}/commitments", json=com_payload)
        self.assertEqual(r_com1.status_code, 201)
        com1_data = r_com1.json()
        self.assertEqual(com1_data["version"], 1)
        self.assertEqual(com1_data["status"], "ACCEPTED")
        com1_id = com1_data["id"]

        # 2. POST ReadinessCondition v1: SATISFIED with commitment dependency
        cond_payload = {
            "condition_key": "HEI_COMMITMENT",
            "status": "SATISFIED",
            "rationale": "Faculty commitment verified",
            "assessed_by_actor_id": actor_id,
            "commitment_dependency_ids": [com1_id],
            "expected_version": 0,
        }
        r_cond1 = self.client.post(f"/api/v1/challenges/{ch_id}/readiness-conditions", json=cond_payload)
        self.assertEqual(r_cond1.status_code, 201)
        cond1_data = r_cond1.json()
        self.assertEqual(cond1_data["version"], 1)
        cond1_id = cond1_data["id"]

        # 3. POST ReadinessDecision v1: PILOT_READY
        dec_payload = {
            "status": "PILOT_READY",
            "rationale": "All conditions satisfied for pilot",
            "decided_by_actor_id": actor_id,
            "condition_ids": [cond1_id],
            "expected_version": 0,
        }
        r_dec1 = self.client.post(f"/api/v1/challenges/{ch_id}/readiness-decisions", json=dec_payload)
        self.assertEqual(r_dec1.status_code, 201)
        dec1_data = r_dec1.json()
        self.assertEqual(dec1_data["version"], 1)
        self.assertEqual(dec1_data["status"], "PILOT_READY")

        # 4. POST Commitment v2: WITHDRAWN -> triggers dependency invalidation in SAME transaction
        com_payload_v2 = {
            "organization_id": org_id,
            "commitment_type": "FACULTY_SUPPORT",
            "status": "WITHDRAWN",
            "scope_description": "Faculty support withdrawn due to conflict",
            "recorded_by_actor_id": actor_id,
            "expected_version": 1,
        }
        r_com2 = self.client.post(f"/api/v1/challenges/{ch_id}/commitments", json=com_payload_v2)
        self.assertEqual(r_com2.status_code, 201)

        # 5. GET Readiness Decision History -> Version 1 PILOT_READY, Version 2 REVIEW_REQUIRED
        r_hist = self.client.get(f"/api/v1/challenges/{ch_id}/readiness-decisions")
        self.assertEqual(r_hist.status_code, 200)
        history = r_hist.json()
        self.assertEqual(history["total"], 2)

        v1_dec = history["items"][0]
        self.assertEqual(v1_dec["version"], 1)
        self.assertEqual(v1_dec["status"], "PILOT_READY")

        v2_dec = history["items"][1]
        self.assertEqual(v2_dec["version"], 2)
        self.assertEqual(v2_dec["status"], "REVIEW_REQUIRED")

        # 6. Verify Commitment history -> v1 ACCEPTED, v2 WITHDRAWN
        r_com_hist = self.client.get(f"/api/v1/challenges/{ch_id}/commitments/{org_id}/FACULTY_SUPPORT")
        self.assertEqual(r_com_hist.status_code, 200)
        c_history = r_com_hist.json()
        self.assertEqual(c_history["total"], 2)
        self.assertEqual(c_history["items"][0]["status"], "ACCEPTED")
        self.assertEqual(c_history["items"][1]["status"], "WITHDRAWN")

    def test_optimistic_concurrency_conflict(self) -> None:
        ch_id = str(self.challenge.id)
        actor_id = str(self.actor.id)
        org_id = str(self.hei_org.id)

        # Create v1 commitment
        p1 = {
            "organization_id": org_id,
            "commitment_type": "EQUIPMENT",
            "status": "ACCEPTED",
            "scope_description": "Lab equipment",
            "recorded_by_actor_id": actor_id,
            "expected_version": 0,
        }
        r1 = self.client.post(f"/api/v1/challenges/{ch_id}/commitments", json=p1)
        self.assertEqual(r1.status_code, 201)

        # Request A with expected_version=1 -> succeeds (v2)
        p_a = {
            "organization_id": org_id,
            "commitment_type": "EQUIPMENT",
            "status": "ACCEPTED",
            "scope_description": "Updated lab equipment",
            "recorded_by_actor_id": actor_id,
            "expected_version": 1,
        }
        r_a = self.client.post(f"/api/v1/challenges/{ch_id}/commitments", json=p_a)
        self.assertEqual(r_a.status_code, 201)

        # Request B with stale expected_version=1 -> 409 Conflict
        p_b = {
            "organization_id": org_id,
            "commitment_type": "EQUIPMENT",
            "status": "WITHDRAWN",
            "scope_description": "Conflicting withdrawal",
            "recorded_by_actor_id": actor_id,
            "expected_version": 1,
        }
        r_b = self.client.post(f"/api/v1/challenges/{ch_id}/commitments", json=p_b)
        self.assertEqual(r_b.status_code, 409)
        self.assertIn("version mismatch", r_b.json()["detail"].lower())

    def test_unaffected_challenge_isolation(self) -> None:
        # Create Challenge B
        ch_b = Challenge(
            title="Challenge B",
            summary="Sum",
            description="Desc",
            domain="ENERGY",
            source_type="GOVERNMENT",
            district="Dhanbad",
        )
        self.session.add(ch_b)
        self.session.commit()

        # Run hero flow on self.challenge
        self.test_hero_commitment_readiness_invalidation_flow()

        # Check Challenge B readiness decisions remain 0
        r_b = self.client.get(f"/api/v1/challenges/{ch_b.id}/readiness-decisions")
        self.assertEqual(r_b.status_code, 200)
        self.assertEqual(r_b.json()["total"], 0)

    def test_pilot_ready_negative_validations(self) -> None:
        ch_id = str(self.challenge.id)
        actor_id = str(self.actor.id)
        org_id = str(self.hei_org.id)

        com_payload = {
            "organization_id": org_id,
            "commitment_type": "FUNDS",
            "status": "ACCEPTED",
            "scope_description": "Grants",
            "recorded_by_actor_id": actor_id,
            "expected_version": 0,
        }
        r_c = self.client.post(f"/api/v1/challenges/{ch_id}/commitments", json=com_payload)
        c_id = r_c.json()["id"]

        # 1. Empty condition list -> 409
        r1 = self.client.post(
            f"/api/v1/challenges/{ch_id}/readiness-decisions",
            json={
                "status": "PILOT_READY",
                "rationale": "No conditions",
                "decided_by_actor_id": actor_id,
                "condition_ids": [],
                "expected_version": 0,
            },
        )
        self.assertEqual(r1.status_code, 409)

        # 2. UNSATISFIED condition -> 409
        r_unsat = self.client.post(
            f"/api/v1/challenges/{ch_id}/readiness-conditions",
            json={
                "condition_key": "FUNDS_RECEIVED",
                "status": "UNSATISFIED",
                "rationale": "Funds pending",
                "assessed_by_actor_id": actor_id,
                "commitment_dependency_ids": [c_id],
                "expected_version": 0,
            },
        )
        self.assertEqual(r_unsat.status_code, 201)
        unsat_cond_id = r_unsat.json()["id"]

        r2 = self.client.post(
            f"/api/v1/challenges/{ch_id}/readiness-decisions",
            json={
                "status": "PILOT_READY",
                "rationale": "Trying to approve unsatisfied",
                "decided_by_actor_id": actor_id,
                "condition_ids": [unsat_cond_id],
                "expected_version": 0,
            },
        )
        self.assertEqual(r2.status_code, 409)

        # 3. Client attempting to post REVIEW_REQUIRED -> 422
        r3 = self.client.post(
            f"/api/v1/challenges/{ch_id}/readiness-decisions",
            json={
                "status": "REVIEW_REQUIRED",
                "rationale": "Manual review required",
                "decided_by_actor_id": actor_id,
                "expected_version": 0,
            },
        )
        self.assertEqual(r3.status_code, 422)

    def test_invalidation_idempotency(self) -> None:
        # Run hero flow once
        self.test_hero_commitment_readiness_invalidation_flow()
        ch_id = str(self.challenge.id)

        # Check total readiness decisions is 2
        r_dec = self.client.get(f"/api/v1/challenges/{ch_id}/readiness-decisions")
        self.assertEqual(r_dec.json()["total"], 2)

        # Get latest commitment v2 (which is WITHDRAWN)
        r_com = self.client.get(f"/api/v1/challenges/{ch_id}/commitments/{self.hei_org.id}/FACULTY_SUPPORT")
        com_v2_data = r_com.json()["items"][1]

        # Call invalidate_readiness_for_commitment_change directly again with same commitment -> returns None (idempotent)
        from app.models.commitment import Commitment
        com_v2 = self.session.get(Commitment, uuid.UUID(com_v2_data["id"]))
        res_idemp = invalidate_readiness_for_commitment_change(self.session, com_v2)
        self.assertIsNone(res_idemp)

    def test_readiness_conditions_latest_endpoint(self) -> None:
        ch_id = str(self.challenge.id)
        actor_id = str(self.actor.id)

        # Add condition A v1
        self.client.post(
            f"/api/v1/challenges/{ch_id}/readiness-conditions",
            json={
                "condition_key": "COND_A",
                "status": "UNSATISFIED",
                "rationale": "Draft A",
                "assessed_by_actor_id": actor_id,
                "expected_version": 0,
            },
        )
        # Add condition A v2
        self.client.post(
            f"/api/v1/challenges/{ch_id}/readiness-conditions",
            json={
                "condition_key": "COND_A",
                "status": "SATISFIED",
                "rationale": "Verified A",
                "assessed_by_actor_id": actor_id,
                "expected_version": 1,
            },
        )
        # Add condition B v1
        self.client.post(
            f"/api/v1/challenges/{ch_id}/readiness-conditions",
            json={
                "condition_key": "COND_B",
                "status": "SATISFIED",
                "rationale": "Verified B",
                "assessed_by_actor_id": actor_id,
                "expected_version": 0,
            },
        )

        # GET latest conditions -> returns 2 items (COND_A v2, COND_B v1)
        r_latest = self.client.get(f"/api/v1/challenges/{ch_id}/readiness-conditions/latest")
        self.assertEqual(r_latest.status_code, 200)
        data = r_latest.json()
        self.assertEqual(data["total"], 2)
        cond_a = next(c for c in data["items"] if c["condition_key"] == "COND_A")
        self.assertEqual(cond_a["version"], 2)
        self.assertEqual(cond_a["status"], "SATISFIED")


if __name__ == "__main__":
    unittest.main()
