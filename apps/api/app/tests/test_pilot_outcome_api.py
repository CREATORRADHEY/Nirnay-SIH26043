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
from app.models.hei_capability import HEICapability
from app.models.organization import Organization


class TestPilotOutcomeAPI(unittest.TestCase):
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
        self.hei_org = Organization(name="IIT Ranchi", organization_type="HEI")
        self.actor = Actor(display_name="Lead Coordinator")

        self.session.add_all([self.gov_org, self.hei_org, self.actor])
        self.session.commit()

        self.cap = HEICapability(
            organization_id=self.hei_org.id,
            capability_type="LAB",
            name="Environmental Lab",
            discipline="Science",
            is_active=True,
        )
        self.session.add(self.cap)
        self.session.commit()

        self.challenge = Challenge(
            title="Borewell Contamination",
            summary="Sum",
            description="Desc",
            domain="WATER",
            source_type="COMMUNITY",
            district="Ranchi",
        )
        self.session.add(self.challenge)
        self.session.commit()

        self.evidence = Evidence(
            challenge_id=self.challenge.id,
            evidence_type="PHOTO",
            storage_reference="gcs://nirnay/water.jpg",
            description="Sample photo",
        )
        self.session.add(self.evidence)
        self.session.commit()

        # Qualify as INNOVATION_CHALLENGE
        self.client.post(
            f"/api/v1/challenges/{self.challenge.id}/qualification-decisions",
            json={
                "route": "INNOVATION_CHALLENGE",
                "rationale": "Qualified",
                "decided_by_actor_id": str(self.actor.id),
            },
        )

        # Add HEI Candidate
        self.client.post(
            f"/api/v1/challenges/{self.challenge.id}/hei-candidates",
            json={
                "organization_id": str(self.hei_org.id),
                "match_method": "MANUAL",
                "rationale": "Matched",
                "created_by_actor_id": str(self.actor.id),
            },
        )

        # Add Commitment v1 ACCEPTED
        r_c = self.client.post(
            f"/api/v1/challenges/{self.challenge.id}/commitments",
            json={
                "organization_id": str(self.hei_org.id),
                "commitment_type": "PILOT_HOST",
                "status": "ACCEPTED",
                "scope_description": "Host site",
                "recorded_by_actor_id": str(self.actor.id),
                "expected_version": 0,
            },
        )
        c_id = r_c.json()["id"]

        # Add ReadinessCondition v1 SATISFIED
        r_cond = self.client.post(
            f"/api/v1/challenges/{self.challenge.id}/readiness-conditions",
            json={
                "condition_key": "HOST_READY",
                "status": "SATISFIED",
                "rationale": "Host ready",
                "assessed_by_actor_id": str(self.actor.id),
                "commitment_dependency_ids": [c_id],
                "expected_version": 0,
            },
        )
        cond_id = r_cond.json()["id"]

        # Add ReadinessDecision v1 PILOT_READY
        r_dec = self.client.post(
            f"/api/v1/challenges/{self.challenge.id}/readiness-decisions",
            json={
                "status": "PILOT_READY",
                "rationale": "Ready for pilot",
                "decided_by_actor_id": str(self.actor.id),
                "condition_ids": [cond_id],
                "expected_version": 0,
            },
        )
        self.pilot_ready_decision_id = r_dec.json()["id"]

    def tearDown(self) -> None:
        app.dependency_overrides.clear()
        self.session.close()

    def test_demo_hero_pilot_evidence_plan_outcome_flow(self) -> None:
        ch_id = str(self.challenge.id)
        actor_id = str(self.actor.id)
        hei_org_id = str(self.hei_org.id)

        # 1. POST Pilot using current exact PILOT_READY decision
        p_payload = {
            "authorized_by_readiness_decision_id": self.pilot_ready_decision_id,
            "host_organization_id": hei_org_id,
            "name": "Ranchi Pilot 1",
            "site_description": "District ward 4",
            "created_by_actor_id": actor_id,
        }
        r_p = self.client.post(f"/api/v1/challenges/{ch_id}/pilots", json=p_payload)
        self.assertEqual(r_p.status_code, 201)
        pilot_data = r_p.json()
        pilot_id = pilot_data["id"]

        # 2. Verify initial PLANNED state exists
        r_op = self.client.get(f"/api/v1/pilots/{pilot_id}/operational-states/latest")
        self.assertEqual(r_op.status_code, 200)
        self.assertEqual(r_op.json()["status"], "PLANNED")
        self.assertEqual(r_op.json()["version"], 1)

        # 3. POST EvidencePlan v1
        ep_payload = {
            "objective": "Filter lead contamination",
            "primary_metric": "Lead reduction PPM",
            "baseline_definition": "15 PPM initial",
            "denominator_definition": "100 households tested",
            "data_collection_method": "Weekly water samples",
            "created_by_actor_id": actor_id,
            "expected_version": 0,
        }
        r_ep = self.client.post(f"/api/v1/pilots/{pilot_id}/evidence-plans", json=ep_payload)
        self.assertEqual(r_ep.status_code, 201)
        plan_data = r_ep.json()
        plan_id = plan_data["id"]
        self.assertEqual(plan_data["version"], 1)

        # 4. POST OperationalState v2 ACTIVE
        r_op2 = self.client.post(
            f"/api/v1/pilots/{pilot_id}/operational-states",
            json={
                "status": "ACTIVE",
                "rationale": "Field deployment launched",
                "recorded_by_actor_id": actor_id,
                "expected_version": 1,
            },
        )
        self.assertEqual(r_op2.status_code, 201)

        # 5. POST OperationalState v3 COMPLETED
        r_op3 = self.client.post(
            f"/api/v1/pilots/{pilot_id}/operational-states",
            json={
                "status": "COMPLETED",
                "rationale": "Field deployment concluded",
                "recorded_by_actor_id": actor_id,
                "expected_version": 2,
            },
        )
        self.assertEqual(r_op3.status_code, 201)

        # 6. Verify NO OutcomeAssessment exists automatically
        r_out_none = self.client.get(f"/api/v1/pilots/{pilot_id}/outcomes/latest")
        self.assertEqual(r_out_none.status_code, 404)

        # 7. POST Human OutcomeAssessment: conclusion = INCONCLUSIVE
        out_payload = {
            "evidence_plan_id": plan_id,
            "conclusion": "INCONCLUSIVE",
            "summary": "Water quality improved in 40 households but denominator shifted due to seasonal rainfall",
            "limitations": "Rainfall diluted sample pool; denominator shifting from 100 to 40 households",
            "assessed_by_actor_id": actor_id,
            "evidence_ids": [str(self.evidence.id)],
            "expected_version": 0,
        }
        r_out = self.client.post(f"/api/v1/pilots/{pilot_id}/outcomes", json=out_payload)
        self.assertEqual(r_out.status_code, 201)
        out_data = r_out.json()
        self.assertEqual(out_data["conclusion"], "INCONCLUSIVE")

        # 8. Verify latest states
        latest_op = self.client.get(f"/api/v1/pilots/{pilot_id}/operational-states/latest").json()
        latest_out = self.client.get(f"/api/v1/pilots/{pilot_id}/outcomes/latest").json()

        self.assertEqual(latest_op["status"], "COMPLETED")
        self.assertEqual(latest_out["conclusion"], "INCONCLUSIVE")
        self.assertNotIn("impact_score", latest_out)
        self.assertNotIn("success", latest_out)

    def test_stale_readiness_decision_rejection(self) -> None:
        ch_id = str(self.challenge.id)
        actor_id = str(self.actor.id)
        org_id = str(self.hei_org.id)

        stale_ready_id = self.pilot_ready_decision_id

        # Withdraw commitment -> triggers REVIEW_REQUIRED v2 readiness decision
        self.client.post(
            f"/api/v1/challenges/{ch_id}/commitments",
            json={
                "organization_id": org_id,
                "commitment_type": "PILOT_HOST",
                "status": "WITHDRAWN",
                "scope_description": "Withdrawn host",
                "recorded_by_actor_id": actor_id,
                "expected_version": 1,
            },
        )

        # Attempt to create pilot with stale PILOT_READY v1 -> 409 Conflict
        p_payload = {
            "authorized_by_readiness_decision_id": stale_ready_id,
            "name": "Stale Pilot Attempt",
            "created_by_actor_id": actor_id,
        }
        r = self.client.post(f"/api/v1/challenges/{ch_id}/pilots", json=p_payload)
        self.assertEqual(r.status_code, 409)
        self.assertIn("stale readiness decision", r.json()["detail"].lower())

    def test_concurrency_and_invalid_transitions(self) -> None:
        ch_id = str(self.challenge.id)
        actor_id = str(self.actor.id)

        # Create pilot
        r_p = self.client.post(
            f"/api/v1/challenges/{ch_id}/pilots",
            json={
                "authorized_by_readiness_decision_id": self.pilot_ready_decision_id,
                "name": "Transition Pilot",
                "created_by_actor_id": actor_id,
            },
        )
        pilot_id = r_p.json()["id"]

        # Current version is 1 (PLANNED)
        # Invalid transition PLANNED -> COMPLETED (must go through ACTIVE) -> 409
        r_inv = self.client.post(
            f"/api/v1/pilots/{pilot_id}/operational-states",
            json={
                "status": "COMPLETED",
                "rationale": "Direct completion invalid",
                "recorded_by_actor_id": actor_id,
                "expected_version": 1,
            },
        )
        self.assertEqual(r_inv.status_code, 409)
        self.assertIn("invalid operational transition", r_inv.json()["detail"].lower())

        # Valid transition PLANNED -> ACTIVE (expected_version=1 -> v2)
        r_act = self.client.post(
            f"/api/v1/pilots/{pilot_id}/operational-states",
            json={
                "status": "ACTIVE",
                "rationale": "Activated",
                "recorded_by_actor_id": actor_id,
                "expected_version": 1,
            },
        )
        self.assertEqual(r_act.status_code, 201)

        # Stale expected_version=1 -> 409
        r_stale = self.client.post(
            f"/api/v1/pilots/{pilot_id}/operational-states",
            json={
                "status": "STOPPED",
                "rationale": "Stale transition",
                "recorded_by_actor_id": actor_id,
                "expected_version": 1,
            },
        )
        self.assertEqual(r_stale.status_code, 409)

    def test_outcome_human_attribution_boundary(self) -> None:
        ch_id = str(self.challenge.id)
        actor_id = str(self.actor.id)

        r_p = self.client.post(
            f"/api/v1/challenges/{ch_id}/pilots",
            json={
                "authorized_by_readiness_decision_id": self.pilot_ready_decision_id,
                "name": "Outcome Test Pilot",
                "created_by_actor_id": actor_id,
            },
        )
        pilot_id = r_p.json()["id"]

        r_ep = self.client.post(
            f"/api/v1/pilots/{pilot_id}/evidence-plans",
            json={
                "objective": "Obj",
                "primary_metric": "Metric",
                "baseline_definition": "Base",
                "denominator_definition": "Denom",
                "data_collection_method": "Method",
                "created_by_actor_id": actor_id,
                "expected_version": 0,
            },
        )
        plan_id = r_ep.json()["id"]

        # VALIDATED conclusion without human actor -> 422
        r_no_actor = self.client.post(
            f"/api/v1/pilots/{pilot_id}/outcomes",
            json={
                "evidence_plan_id": plan_id,
                "conclusion": "VALIDATED",
                "summary": "No actor",
                "expected_version": 0,
            },
        )
        self.assertEqual(r_no_actor.status_code, 422)


if __name__ == "__main__":
    unittest.main()
