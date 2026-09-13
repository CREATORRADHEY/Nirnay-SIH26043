import unittest
import os
import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool

from app.models.base import Base
from app.models.commitment import Commitment
from app.models.readiness_decision import ReadinessDecision
from app.models.pilot_operational_state import PilotOperationalState
from app.models.pilot_evidence_plan import PilotEvidencePlan
from app.models.outcome_assessment import OutcomeAssessment
from app.core.enums import CommitmentStatus, ReadinessStatus, OperationalStatus, EvidenceConclusion
from app.schemas.commitment import CommitmentCreate
from app.schemas.pilot import PilotOperationalStateCreate
from app.schemas.outcome import OutcomeAssessmentCreate
from scripts.seed_golden_demo import (
    seed_golden_demo_data,
    SCENARIO_A_CHALLENGE_ID,
    SCENARIO_A_COMMITMENT_1_ID,
    SCENARIO_B_CHALLENGE_ID,
    SCENARIO_B_PILOT_ID,
    REVIEWER_ACTOR_ID,
)
from app.services.commitment_service import create_commitment_version
from app.services.pilot_service import create_pilot_operational_state
from app.services.outcome_service import create_outcome_assessment


class TestGoldenDemoSeed(unittest.TestCase):
    def setUp(self):
        import app.core.database as db_mod
        import scripts.seed_golden_demo as seed_mod

        self.engine = create_engine(
            "sqlite:///:memory:",
            connect_args={"check_same_thread": False},
            poolclass=StaticPool,
        )
        Base.metadata.create_all(self.engine)
        self.SessionLocal = sessionmaker(bind=self.engine)

        db_mod.engine = self.engine
        db_mod.SessionLocal = self.SessionLocal
        seed_mod.engine = self.engine
        seed_mod.SessionLocal = self.SessionLocal

        # Seed data
        seed_golden_demo_data(reset=False)
        self.session: Session = self.SessionLocal()

    def tearDown(self):
        self.session.close()

    def test_scenario_a_initial_state_and_invalidation(self):
        # Initial state checks
        rd_latest = (
            self.session.query(ReadinessDecision)
            .filter(ReadinessDecision.challenge_id == SCENARIO_A_CHALLENGE_ID)
            .order_by(ReadinessDecision.version.desc())
            .first()
        )
        self.assertIsNotNone(rd_latest)
        self.assertEqual(rd_latest.status, ReadinessStatus.PILOT_READY)
        self.assertEqual(rd_latest.version, 1)

        # Mutate commitment to WITHDRAWN
        schema = CommitmentCreate(
            organization_id=rd_latest.conditions[0].commitment_dependencies[0].organization_id,
            commitment_type="FIELD_TESTING_SITE",
            status=CommitmentStatus.WITHDRAWN,
            version=2,
            scope_description="Lab renovation forces testing site withdrawal",
            recorded_by_actor_id=REVIEWER_ACTOR_ID,
            expected_version=1,
        )
        create_commitment_version(
            self.session,
            SCENARIO_A_CHALLENGE_ID,
            schema,
        )

        # Verify automatic invalidation to REVIEW_REQUIRED
        rd_after = (
            self.session.query(ReadinessDecision)
            .filter(ReadinessDecision.challenge_id == SCENARIO_A_CHALLENGE_ID)
            .order_by(ReadinessDecision.version.desc())
            .first()
        )
        self.assertEqual(rd_after.status, ReadinessStatus.REVIEW_REQUIRED)
        self.assertEqual(rd_after.version, 2)

    def test_scenario_b_initial_state_and_evidence_separation(self):
        # Initial state: ACTIVE v2
        op_latest = (
            self.session.query(PilotOperationalState)
            .filter(PilotOperationalState.pilot_id == SCENARIO_B_PILOT_ID)
            .order_by(PilotOperationalState.version.desc())
            .first()
        )
        self.assertIsNotNone(op_latest)
        self.assertEqual(op_latest.status, OperationalStatus.ACTIVE)
        self.assertEqual(op_latest.version, 2)

        # Evidence Plan exists
        plan = (
            self.session.query(PilotEvidencePlan)
            .filter(PilotEvidencePlan.pilot_id == SCENARIO_B_PILOT_ID)
            .first()
        )
        self.assertIsNotNone(plan)
        self.assertEqual(plan.baseline_definition, "41% of surveyed households")

        # Advance state to COMPLETED
        schema_op = PilotOperationalStateCreate(
            status=OperationalStatus.COMPLETED,
            version=3,
            rationale="Observation window completed",
            recorded_by_actor_id=REVIEWER_ACTOR_ID,
            expected_version=2,
        )
        op_completed = create_pilot_operational_state(
            self.session,
            SCENARIO_B_PILOT_ID,
            schema_op,
        )
        self.assertEqual(op_completed.status, OperationalStatus.COMPLETED)

        # Verify NO outcome exists automatically
        outcomes = (
            self.session.query(OutcomeAssessment)
            .filter(OutcomeAssessment.pilot_id == SCENARIO_B_PILOT_ID)
            .all()
        )
        self.assertEqual(len(outcomes), 0)

        # Record INCONCLUSIVE outcome
        schema_out = OutcomeAssessmentCreate(
            evidence_plan_id=plan.id,
            version=1,
            conclusion=EvidenceConclusion.INCONCLUSIVE,
            summary="Observation denominator changed during pilot",
            limitations="Surveyed sample shifted from 240 to 140 households",
            assessed_by_actor_id=REVIEWER_ACTOR_ID,
            expected_version=0,
        )
        outcome = create_outcome_assessment(
            self.session,
            SCENARIO_B_PILOT_ID,
            schema_out,
        )
        self.assertEqual(outcome.conclusion, EvidenceConclusion.INCONCLUSIVE)

        # Verify separation: Operational state remains COMPLETED, Evidence conclusion remains INCONCLUSIVE
        op_final = (
            self.session.query(PilotOperationalState)
            .filter(PilotOperationalState.pilot_id == SCENARIO_B_PILOT_ID)
            .order_by(PilotOperationalState.version.desc())
            .first()
        )
        self.assertEqual(op_final.status, OperationalStatus.COMPLETED)
        self.assertEqual(outcome.conclusion, EvidenceConclusion.INCONCLUSIVE)
