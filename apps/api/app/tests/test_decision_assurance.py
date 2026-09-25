import unittest
import uuid
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.database import get_db
from app.core.dependencies import get_current_actor
from app.core.enums import PlatformRole, QualificationRoute
from app.main import app
from app.models.account import Account
from app.models.actor import Actor
from app.models.base import Base
from app.models.challenge import Challenge
from app.models.evidence import Evidence
from app.models.qualification_decision import QualificationDecision
from app.models.decision_assurance import DecisionAssuranceRecord
from app.schemas.decision_assurance import (
    DecisionAssuranceCreate,
    DecisionReviewRequestCreate,
    DisagreementResolutionCreate,
    SecondReviewCreate,
)
from app.services.decision_assurance_service import (
    create_decision_assurance,
    create_decision_review_request,
    resolve_disagreement,
    submit_second_review,
)


class TestDecisionAssurance(unittest.TestCase):
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
        app.dependency_overrides[get_current_actor] = (
            lambda: self.session.query(Actor).get(self.actor1.id)
            if hasattr(self, "actor1") and self.actor1
            else None
        )
        self.client = TestClient(app)

        # Seed Actors
        self.actor1 = Actor(
            display_name="Gov Reviewer1",
            platform_role=PlatformRole.GOVERNMENT_REVIEWER,
        )
        self.session.add(self.actor1)
        self.session.flush()

        self.acc1 = Account(
            actor_id=self.actor1.id,
            email=f"gov1_{uuid.uuid4().hex[:6]}@example.gov.in",
            password_hash="hashed_pw_123",
            is_verified=True,
        )
        self.session.add(self.acc1)

        self.actor2 = Actor(
            display_name="Gov Reviewer2",
            platform_role=PlatformRole.GOVERNMENT_REVIEWER,
        )
        self.session.add(self.actor2)
        self.session.flush()

        self.acc2 = Account(
            actor_id=self.actor2.id,
            email=f"gov2_{uuid.uuid4().hex[:6]}@example.gov.in",
            password_hash="hashed_pw_123",
            is_verified=True,
        )
        self.session.add(self.acc2)

        self.actor_cit = Actor(
            display_name="Citizen User",
            platform_role=PlatformRole.COMMUNITY_REPORTER,
        )
        self.session.add(self.actor_cit)
        self.session.flush()

        self.acc_cit = Account(
            actor_id=self.actor_cit.id,
            email=f"citizen_{uuid.uuid4().hex[:6]}@example.com",
            password_hash="hashed_pw_123",
            is_verified=True,
        )
        self.session.add(self.acc_cit)
        self.session.flush()

        # Seed Challenge & Evidence
        self.ch = Challenge(
            title="Waste Management Assurance Challenge",
            summary="Waste Management Challenge Summary",
            description="Test challenge for decision assurance verification.",
            domain="Environment",
            source_type="CITIZEN",
            district="Ranchi",
            state="Jharkhand",
            submitted_by_actor_id=self.actor_cit.id,
        )
        self.session.add(self.ch)
        self.session.flush()

        self.ev = Evidence(
            challenge_id=self.ch.id,
            evidence_type="PHOTO",
            storage_reference="/storage/photo.jpg",
            description="Site Photo Evidence",
            submitted_by_actor_id=self.actor_cit.id,
        )
        self.session.add(self.ev)

        # Seed Qualification Decision
        self.qdec = QualificationDecision(
            challenge_id=self.ch.id,
            route=QualificationRoute.INNOVATION_CHALLENGE,
            version=1,
            rationale="Authoritative human reviewer route selection rationale text.",
            decided_by_actor_id=self.actor1.id,
        )
        self.session.add(self.qdec)
        self.session.commit()

    def tearDown(self) -> None:
        self.session.close()
        app.dependency_overrides.clear()

    def test_meaningful_rationale_validation(self):
        with self.assertRaises(ValueError):
            DecisionAssuranceCreate.validate_meaningful_rationale("ok")

        with self.assertRaises(ValueError):
            DecisionAssuranceCreate.validate_meaningful_rationale("approved")

        res = DecisionAssuranceCreate.validate_meaningful_rationale("This is a valid human decision rationale.")
        self.assertEqual(res, "This is a valid human decision rationale.")

    def test_create_decision_assurance_persists(self):
        schema = DecisionAssuranceCreate(
            decision_type="QUALIFICATION",
            authoritative_decision_id=self.qdec.id,
            rubric_answers={
                "q1_routine": "NO",
                "q2_defined": "YES",
                "q3_evidence": "YES",
                "q4_experimentation": "YES",
                "q5_scope": "YES",
                "selected_route": "INNOVATION_CHALLENGE",
            },
            evidence_ids=[self.ev.id],
            rationale="Detailed human rationale explaining why routine service delivery is insufficient.",
            ai_advisory_snapshot={"suggested_route": "INNOVATION_CHALLENGE"},
            conflict_declared="NO_KNOWN_CONFLICT",
        )

        rec = create_decision_assurance(self.session, self.ch.id, schema, self.actor1)
        self.session.commit()

        self.assertIsNotNone(rec.id)
        self.assertEqual(rec.challenge_id, self.ch.id)
        self.assertEqual(rec.ai_agreement_status, "AGREEMENT")
        self.assertFalse(rec.second_review_required)
        self.assertEqual(rec.review_status, "SINGLE_REVIEWED")
        self.assertIn(str(self.ev.id), rec.evidence_ids)

    def test_ai_disagreement_triggers_second_review(self):
        schema = DecisionAssuranceCreate(
            decision_type="QUALIFICATION",
            authoritative_decision_id=self.qdec.id,
            rubric_answers={"selected_route": "INNOVATION_CHALLENGE"},
            evidence_ids=[self.ev.id],
            rationale="Detailed human rationale explaining why innovation challenge is chosen.",
            ai_advisory_snapshot={"suggested_route": "RESEARCH_REVIEW"},
            conflict_declared="NO_KNOWN_CONFLICT",
        )

        rec = create_decision_assurance(self.session, self.ch.id, schema, self.actor1)
        self.session.commit()

        self.assertEqual(rec.ai_agreement_status, "DISAGREEMENT")
        self.assertTrue(rec.second_review_required)
        self.assertEqual(rec.review_status, "SECOND_REVIEW_PENDING")
        self.assertIn("AI advisory disagreed", rec.second_review_reason)

    def test_second_reviewer_cannot_be_first_reviewer(self):
        schema = DecisionAssuranceCreate(
            decision_type="QUALIFICATION",
            authoritative_decision_id=self.qdec.id,
            rubric_answers={"selected_route": "INNOVATION_CHALLENGE"},
            evidence_ids=[self.ev.id],
            rationale="Detailed human rationale explaining why innovation challenge is chosen.",
            ai_advisory_snapshot={"suggested_route": "RESEARCH_REVIEW"},
        )
        rec = create_decision_assurance(self.session, self.ch.id, schema, self.actor1)
        self.session.commit()

        # Attempt second review by same actor1
        with self.assertRaises(ValueError):
            submit_second_review(
                self.session,
                rec.id,
                self.actor1,
                SecondReviewCreate(
                    rationale="Attempting self second review",
                    decision="INNOVATION_CHALLENGE",
                ),
            )

    def test_second_review_agreement_and_disagreement(self):
        schema = DecisionAssuranceCreate(
            decision_type="QUALIFICATION",
            authoritative_decision_id=self.qdec.id,
            rubric_answers={"selected_route": "INNOVATION_CHALLENGE"},
            evidence_ids=[self.ev.id],
            rationale="Detailed human rationale explaining why innovation challenge is chosen.",
            conflict_declared="POTENTIAL_CONFLICT",
        )
        rec = create_decision_assurance(self.session, self.ch.id, schema, self.actor1)
        self.session.commit()

        # Independent second review by actor2 -> Agreement
        rec2 = submit_second_review(
            self.session,
            rec.id,
            self.actor2,
            SecondReviewCreate(
                rationale="Independent review confirms innovation route criteria.",
                decision="INNOVATION_CHALLENGE",
            ),
        )
        self.session.commit()

        self.assertEqual(rec2.review_status, "AGREED")
        self.assertEqual(rec2.second_reviewer_actor_id, self.actor2.id)

    def test_disagreement_and_resolution(self):
        schema = DecisionAssuranceCreate(
            decision_type="QUALIFICATION",
            authoritative_decision_id=self.qdec.id,
            rubric_answers={"selected_route": "INNOVATION_CHALLENGE"},
            evidence_ids=[self.ev.id],
            rationale="Detailed human rationale explaining why innovation challenge is chosen.",
            conflict_declared="POTENTIAL_CONFLICT",
        )
        rec = create_decision_assurance(self.session, self.ch.id, schema, self.actor1)
        self.session.commit()

        # Second review disagrees
        submit_second_review(
            self.session,
            rec.id,
            self.actor2,
            SecondReviewCreate(
                rationale="Independent review believes research review is better.",
                decision="RESEARCH_REVIEW",
            ),
        )
        self.session.commit()
        self.assertEqual(rec.review_status, "DISAGREED")

        # Senior resolution
        resolve_disagreement(
            self.session,
            rec.id,
            self.actor1,
            DisagreementResolutionCreate(
                resolution_rationale="Senior review evaluated evidence and affirmed INNOVATION_CHALLENGE.",
                final_decision="INNOVATION_CHALLENGE",
            ),
        )
        self.session.commit()

        self.assertEqual(rec.review_status, "RESOLVED")
        self.assertEqual(rec.disagreement_resolved_by_actor_id, self.actor1.id)

    def test_review_request_does_not_overwrite_history(self):
        schema = DecisionAssuranceCreate(
            decision_type="QUALIFICATION",
            authoritative_decision_id=self.qdec.id,
            rubric_answers={"selected_route": "INNOVATION_CHALLENGE"},
            evidence_ids=[self.ev.id],
            rationale="Detailed human rationale explaining why innovation challenge is chosen.",
        )
        rec = create_decision_assurance(self.session, self.ch.id, schema, self.actor1)
        self.session.commit()

        req = create_decision_review_request(
            self.session,
            self.ch.id,
            rec.id,
            self.actor_cit,
            DecisionReviewRequestCreate(
                reason="New evidence shows standard service model should apply.",
                evidence_id=self.ev.id,
            ),
        )
        self.session.commit()

        self.assertIsNotNone(req.id)
        self.assertEqual(req.status, "PENDING")
        self.assertTrue(rec.second_review_required)
        self.assertEqual(rec.review_status, "SECOND_REVIEW_PENDING")
        self.assertEqual(rec.rubric_answers["selected_route"], "INNOVATION_CHALLENGE")
