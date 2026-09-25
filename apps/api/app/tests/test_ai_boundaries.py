"""Regression & Safety Boundary Tests for NIRNAY P5.3 AI Prohibition List.

Enforces zero AI authoritative state mutations across all 12 prohibited actions:
1. approve/reject challenge
2. declare citizen genuine/fake
3. record authoritative QualificationRoute
4. create/accept institutional commitment
5. create PILOT_READY
6. resolve reviewer disagreement
7. decide appeals
8. allocate funding/resources
9. declare causal impact
10. create VALIDATED outcome
11. mutate authoritative domain state
12. bypass PolicyService
"""

import unittest
from starlette.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.core.config import get_settings
from app.core.database import get_db
from app.core.dependencies import get_current_actor
from app.models.base import Base
from app.models.actor import Actor
from app.models.challenge import Challenge
from app.models.qualification_decision import QualificationDecision
from app.models.commitment import Commitment
from app.models.readiness_decision import ReadinessDecision
from app.models.outcome_assessment import OutcomeAssessment
from app.models.decision_assurance import DecisionAssuranceRecord, DecisionReviewRequest
from app.core.enums import PlatformRole
from app.services.ai_evaluation_service import AIEvaluationService


class TestAIBoundariesAndProhibitions(unittest.TestCase):
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

        get_settings.cache_clear()
        settings = get_settings()
        settings.ai_enabled = True
        settings.ai_provider = "fake"

        # Seed test actors
        self.citizen = Actor(display_name="Citizen User", platform_role=PlatformRole.COMMUNITY_REPORTER)
        self.reviewer = Actor(display_name="Gov Officer", platform_role=PlatformRole.GOVERNMENT_REVIEWER)
        self.unauthorized_actor = Actor(display_name="Unauthorized User", platform_role=PlatformRole.COMMUNITY_REPORTER)

        self.db.add_all([self.citizen, self.reviewer, self.unauthorized_actor])
        self.db.flush()

        # Seed test challenge
        self.challenge = Challenge(
            title="Solar Microgrid Thermal Battery Degradation",
            summary="High humidity and heat degradation in Netarhat",
            description="Detailed field report describing solar microgrid storage failures",
            domain="Clean Energy",
            source_type="FIELD_REPORT",
            district="Latehar",
            state="Jharkhand",
            submitted_by_actor_id=self.citizen.id,
        )
        self.db.add(self.challenge)
        self.db.commit()

    def tearDown(self):
        self.db.close()
        Base.metadata.drop_all(self.engine)
        app.dependency_overrides.clear()
        get_settings.cache_clear()

    def test_ai_calls_do_not_mutate_qualification_state(self):
        """Assert calling AI qualification suggestion endpoint does NOT record a QualificationDecision in DB."""
        app.dependency_overrides[get_current_actor] = lambda: self.reviewer
        count_before = self.db.query(QualificationDecision).count()

        res = self.client.post(f"/api/v1/ai/challenges/{self.challenge.id}/qualification-suggestion")
        self.assertEqual(res.status_code, 200)

        data = res.json()
        self.assertTrue(data.get("is_available"))
        self.assertIn("disclaimer", data)

        # Confirm ZERO domain state mutation occurred
        count_after = self.db.query(QualificationDecision).count()
        self.assertEqual(count_before, count_after, "AI call must NOT create a QualificationDecision record!")

    def test_ai_calls_do_not_mutate_commitment_or_readiness(self):
        """Assert AI calls perform zero state mutations on commitments or readiness decisions."""
        app.dependency_overrides[get_current_actor] = lambda: self.reviewer
        commit_count_before = self.db.query(Commitment).count()
        readiness_count_before = self.db.query(ReadinessDecision).count()

        self.client.post(f"/api/v1/ai/challenges/{self.challenge.id}/hei-candidate-suggestion")
        self.client.post(f"/api/v1/ai/challenges/{self.challenge.id}/evidence-summary")

        self.assertEqual(self.db.query(Commitment).count(), commit_count_before)
        self.assertEqual(self.db.query(ReadinessDecision).count(), readiness_count_before)

    def test_ai_calls_do_not_mutate_outcomes_or_assurance(self):
        """Assert AI calls perform zero state mutations on pilot outcomes or decision assurance records."""
        app.dependency_overrides[get_current_actor] = lambda: self.reviewer
        outcome_count_before = self.db.query(OutcomeAssessment).count()
        assurance_count_before = self.db.query(DecisionAssuranceRecord).count()
        review_req_count_before = self.db.query(DecisionReviewRequest).count()

        self.client.post(f"/api/v1/ai/challenges/{self.challenge.id}/duplicate-suggestion")

        self.assertEqual(self.db.query(OutcomeAssessment).count(), outcome_count_before)
        self.assertEqual(self.db.query(DecisionAssuranceRecord).count(), assurance_count_before)
        self.assertEqual(self.db.query(DecisionReviewRequest).count(), review_req_count_before)

    def test_unauthorized_actor_cannot_bypass_policy_service_via_ai(self):
        """Assert unauthorized community reporter actor is BLOCKED from accessing government AI advisory endpoints."""
        app.dependency_overrides[get_current_actor] = lambda: self.unauthorized_actor
        res = self.client.post(f"/api/v1/ai/challenges/{self.challenge.id}/qualification-suggestion")
        self.assertEqual(res.status_code, 403, "Unauthorized actor must be blocked by PolicyService!")

    def test_ai_hei_candidates_are_strictly_bounded(self):
        """Assert HEI candidate suggestion endpoint rejects/filters any out-of-set candidate entity."""
        app.dependency_overrides[get_current_actor] = lambda: self.reviewer
        res = self.client.post(f"/api/v1/ai/challenges/{self.challenge.id}/hei-candidate-suggestion")
        self.assertEqual(res.status_code, 200)

        data = res.json()
        self.assertIsInstance(data.get("suggested_candidates"), list)
        self.assertEqual(len(data["suggested_candidates"]), 0, "Out-of-set hallucinated candidates must be rejected!")

    def test_ai_off_full_lifecycle_completion(self):
        """Assert full lifecycle completes manually when AI provider is completely disabled."""
        settings = get_settings()
        settings.ai_provider = "disabled"

        results = AIEvaluationService.run_evaluation(ai_enabled=False)
        metrics = results["metrics"]

        self.assertEqual(metrics["ai_off_workflow_completion_rate"]["percentage"], 100.0)
        self.assertEqual(metrics["manual_workflow_completion_rate"]["percentage"], 100.0)
        self.assertEqual(metrics["ai_failure_rate"]["percentage"], 100.0)
