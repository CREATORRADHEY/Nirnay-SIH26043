from datetime import datetime, timezone
import unittest
import uuid

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.enums import EvidenceConclusion, OperationalStatus, ReadinessStatus
from app.models.actor import Actor
from app.models.base import Base
from app.models.challenge import Challenge
from app.models.organization import Organization
from app.models.outcome_assessment import OutcomeAssessment
from app.models.pilot import Pilot
from app.models.pilot_evidence_plan import PilotEvidencePlan
from app.models.pilot_operational_state import PilotOperationalState
from app.models.readiness_decision import ReadinessDecision
from app.services.pilot_authorization import create_authorized_pilot


class TestPilotAuthorization(unittest.TestCase):
    """Tests for Pilot Authorization Service and Jury Demo Scenario."""

    def setUp(self) -> None:
        self.engine = create_engine("sqlite:///:memory:")
        Base.metadata.create_all(self.engine)
        self.SessionLocal = sessionmaker(bind=self.engine)
        self.session: Session = self.SessionLocal()

    def tearDown(self) -> None:
        self.session.close()

    def test_create_authorized_pilot_success(self) -> None:
        actor = Actor(id=uuid.uuid4(), display_name="Programme Coordinator")
        org = Organization(id=uuid.uuid4(), name="BIT Mesra", organization_type="HEI", district="Ranchi")
        challenge = Challenge(id=uuid.uuid4(), title="Water Filtration", summary="Lead toxicity", description="Full report", domain="WATER", source_type="COMMUNITY", district="Ranchi")
        readiness = ReadinessDecision(id=uuid.uuid4(), challenge_id=challenge.id, status=ReadinessStatus.PILOT_READY, version=1, rationale="Authorized by coordinator", decided_by_actor=actor)
        self.session.add_all([actor, org, challenge, readiness])
        self.session.flush()

        pilot = create_authorized_pilot(
            session=self.session,
            challenge_id=challenge.id,
            readiness_decision_id=readiness.id,
            name="Ranchi Arsenic Pilot",
            created_by_actor_id=actor.id,
            host_organization_id=org.id,
        )

        self.assertIsNotNone(pilot)
        self.assertEqual(pilot.name, "Ranchi Arsenic Pilot")
        self.assertEqual(pilot.authorized_by_readiness_decision_id, readiness.id)
        self.assertEqual(len(pilot.operational_states), 1)
        self.assertEqual(pilot.operational_states[0].status, OperationalStatus.PLANNED)

    def test_authorization_fails_for_non_pilot_ready_statuses(self) -> None:
        actor = Actor(id=uuid.uuid4(), display_name="Coordinator")
        challenge = Challenge(title="Water", summary="Sum", description="Desc", domain="WATER", source_type="CITIZEN", district="Dis")
        self.session.add_all([actor, challenge])
        self.session.flush()

        # BLOCKED
        r_blocked = ReadinessDecision(challenge_id=challenge.id, status=ReadinessStatus.BLOCKED, version=1, rationale="Missing condition", decided_by_actor=actor)
        self.session.add(r_blocked)
        self.session.flush()

        with self.assertRaises(ValueError) as ctx:
            create_authorized_pilot(self.session, challenge.id, r_blocked.id, "Pilot", actor.id)
        self.assertIn("BLOCKED", str(ctx.exception))

        # REVIEW_READY
        r_rev_ready = ReadinessDecision(challenge_id=challenge.id, status=ReadinessStatus.REVIEW_READY, version=2, rationale="Awaiting human sign-off", decided_by_actor=actor)
        self.session.add(r_rev_ready)
        self.session.flush()

        with self.assertRaises(ValueError) as ctx:
            create_authorized_pilot(self.session, challenge.id, r_rev_ready.id, "Pilot", actor.id)
        self.assertIn("REVIEW_READY", str(ctx.exception))

        # REVIEW_REQUIRED
        r_rev_req = ReadinessDecision(challenge_id=challenge.id, status=ReadinessStatus.REVIEW_REQUIRED, version=3, rationale="Dependency invalidated", decided_by_actor=actor)
        self.session.add(r_rev_req)
        self.session.flush()

        with self.assertRaises(ValueError) as ctx:
            create_authorized_pilot(self.session, challenge.id, r_rev_req.id, "Pilot", actor.id)
        self.assertIn("REVIEW_REQUIRED", str(ctx.exception))

    def test_authorization_fails_if_challenge_mismatch(self) -> None:
        actor = Actor(display_name="Coordinator")
        ch_a = Challenge(title="Challenge A", summary="Sum A", description="Desc A", domain="WATER", source_type="CITIZEN", district="Dis A")
        ch_b = Challenge(title="Challenge B", summary="Sum B", description="Desc B", domain="ENERGY", source_type="CITIZEN", district="Dis B")
        r_b = ReadinessDecision(challenge=ch_b, status=ReadinessStatus.PILOT_READY, version=1, rationale="Ready B", decided_by_actor=actor)
        self.session.add_all([actor, ch_a, ch_b, r_b])
        self.session.flush()

        with self.assertRaises(ValueError) as ctx:
            create_authorized_pilot(self.session, ch_a.id, r_b.id, "Pilot for A", actor.id)
        self.assertIn("belongs to challenge", str(ctx.exception))

    def test_demo_scenario_completed_and_inconclusive(self) -> None:
        """JURY DEMO SCENARIO TEST:
        1. Challenge reaches human PILOT_READY.
        2. Field Pilot is authorized from exact PILOT_READY decision.
        3. Pre-declared Evidence Plan created (defining baseline, denominator, primary metric).
        4. Operational state transitions: PLANNED -> ACTIVE -> COMPLETED.
        5. Denominator changed during field execution.
        6. Human evaluator records EvidenceConclusion.INCONCLUSIVE with limitations.
        7. Verify Pilot remains operationally COMPLETED.
        8. Verify OutcomeConclusion is INCONCLUSIVE.
        9. Verify zero false claim of impact/success.
        """
        actor = Actor(id=uuid.uuid4(), display_name="Evaluation Panel Lead")
        org = Organization(id=uuid.uuid4(), name="Ranchi Municipal Corporation", organization_type="ULB", district="Ranchi")
        challenge = Challenge(
            id=uuid.uuid4(),
            title="Arsenic Water Sensor Pilot",
            summary="High arsenic levels in groundwater",
            description="Full report",
            domain="WATER",
            source_type="COMMUNITY",
            district="Ranchi",
        )
        readiness = ReadinessDecision(
            id=uuid.uuid4(),
            challenge_id=challenge.id,
            status=ReadinessStatus.PILOT_READY,
            version=1,
            rationale="Authorized by human coordinator following verification.",
            decided_by_actor=actor,
        )
        self.session.add_all([actor, org, challenge, readiness])
        self.session.flush()

        # 2. Authorize Pilot
        pilot = create_authorized_pilot(
            session=self.session,
            challenge_id=challenge.id,
            readiness_decision_id=readiness.id,
            name="Ranchi Arsenic Field Pilot Phase 1",
            created_by_actor_id=actor.id,
            host_organization_id=org.id,
        )

        # 3. Create Evidence Plan
        plan = PilotEvidencePlan(
            pilot_id=pilot.id,
            version=1,
            objective="Assess heavy metal reduction using ceramic membrane filter.",
            primary_metric="Arsenic concentration (ppb)",
            baseline_definition="Pre-filter groundwater baseline average across 5 wells = 85 ppb",
            denominator_definition="500 litres daily purified throughput measured over 14 days",
            data_collection_method="Daily ICP-MS lab assay",
            created_by_actor_id=actor.id,
        )
        self.session.add(plan)
        self.session.flush()

        # 4. Operational state transitions: ACTIVE -> COMPLETED
        state_active = PilotOperationalState(
            pilot_id=pilot.id, status=OperationalStatus.ACTIVE, version=2, rationale="Deployment begun.", recorded_by_actor_id=actor.id
        )
        state_completed = PilotOperationalState(
            pilot_id=pilot.id, status=OperationalStatus.COMPLETED, version=3, rationale="Planned 14-day field trial finished.", recorded_by_actor_id=actor.id
        )
        self.session.add_all([state_active, state_completed])
        self.session.flush()

        # 5 & 6. Human Assessor records OutcomeAssessment with INCONCLUSIVE due to denominator shift
        outcome = OutcomeAssessment(
            pilot_id=pilot.id,
            evidence_plan_id=plan.id,
            version=1,
            conclusion=EvidenceConclusion.INCONCLUSIVE,
            summary="Pilot field deployment finished on schedule. However, well pump rate fluctuation caused daily throughput denominator to vary significantly (200L to 750L), preventing baseline comparison.",
            limitations="Water throughput denominator changed substantially across evaluation window; requires controlled pump flow rate iteration.",
            assessed_by_actor_id=actor.id,
        )
        self.session.add(outcome)
        self.session.flush()

        # 7. Verify Pilot remains operationally COMPLETED
        latest_op_state = max(pilot.operational_states, key=lambda s: s.version)
        self.assertEqual(latest_op_state.status, OperationalStatus.COMPLETED)

        # 8. Verify Outcome is INCONCLUSIVE
        latest_outcome = max(pilot.outcome_assessments, key=lambda o: o.version)
        self.assertEqual(latest_outcome.conclusion, EvidenceConclusion.INCONCLUSIVE)

        # 9. Verify zero false claim of impact/success
        self.assertFalse(hasattr(pilot, "success"))
        self.assertFalse(hasattr(pilot, "impact_score"))


if __name__ == "__main__":
    unittest.main()
