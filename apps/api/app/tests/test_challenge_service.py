import unittest
import uuid
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.models.actor import Actor
from app.models.base import Base
from app.models.challenge import Challenge
from app.models.commitment import Commitment
from app.models.organization import Organization
from app.models.qualification_decision import QualificationDecision
from app.models.readiness_decision import ReadinessDecision
from app.schemas.challenge import ChallengeCreate
from app.schemas.evidence import EvidenceCreate
from app.services.challenge_service import create_challenge, get_challenge, list_challenges
from app.services.evidence_service import create_evidence, list_challenge_evidence


class TestChallengeServices(unittest.TestCase):
    """Unit tests for Challenge and Evidence services using SQLite in-memory database."""

    def setUp(self) -> None:
        self.engine = create_engine("sqlite:///:memory:")
        Base.metadata.create_all(self.engine)
        self.SessionLocal = sessionmaker(bind=self.engine)
        self.session: Session = self.SessionLocal()

    def tearDown(self) -> None:
        self.session.close()

    def test_create_challenge_valid(self) -> None:
        actor = Actor(display_name="Citizen Reporter")
        org = Organization(name="Gram Panchayat", organization_type="PRI")
        self.session.add_all([actor, org])
        self.session.flush()

        schema = ChallengeCreate(
            title="Arsenic Water Contamination",
            summary="High toxicity in drinking well",
            description="Detailed report",
            domain="WATER",
            source_type="COMMUNITY",
            district="Ranchi",
            state="Jharkhand",
            submitted_by_actor_id=actor.id,
            source_organization_id=org.id,
        )

        challenge = create_challenge(self.session, schema)

        self.assertIsNotNone(challenge.id)
        self.assertEqual(challenge.title, "Arsenic Water Contamination")
        self.assertEqual(challenge.submitted_by_actor_id, actor.id)
        self.assertEqual(challenge.source_organization_id, org.id)

        # Domain Invariant: Zero automatic qualification/readiness side effects
        self.assertEqual(len(challenge.qualification_decisions), 0)
        self.assertEqual(len(challenge.hei_candidates), 0)
        self.assertEqual(len(challenge.commitments), 0)
        self.assertEqual(len(challenge.readiness_conditions), 0)
        self.assertEqual(len(challenge.readiness_decisions), 0)
        self.assertEqual(len(challenge.pilots), 0)

    def test_create_challenge_invalid_actor_reference(self) -> None:
        schema = ChallengeCreate(
            title="Title",
            summary="Sum",
            description="Desc",
            domain="WATER",
            source_type="CITIZEN",
            district="Dis",
            submitted_by_actor_id=uuid.uuid4(),
        )
        with self.assertRaises(ValueError) as ctx:
            create_challenge(self.session, schema)
        self.assertIn("Actor", str(ctx.exception))

    def test_create_challenge_invalid_organization_reference(self) -> None:
        schema = ChallengeCreate(
            title="Title",
            summary="Sum",
            description="Desc",
            domain="WATER",
            source_type="CITIZEN",
            district="Dis",
            source_organization_id=uuid.uuid4(),
        )
        with self.assertRaises(ValueError) as ctx:
            create_challenge(self.session, schema)
        self.assertIn("Organization", str(ctx.exception))

    def test_list_challenges_filtering_and_deterministic_ordering(self) -> None:
        c1 = Challenge(title="Water 1", summary="S1", description="D1", domain="WATER", source_type="CITIZEN", district="Ranchi")
        c2 = Challenge(title="Energy 1", summary="S2", description="D2", domain="ENERGY", source_type="GOVERNMENT", district="Ranchi")
        c3 = Challenge(title="Water 2", summary="S3", description="D3", domain="WATER", source_type="CITIZEN", district="Dhanbad")
        self.session.add_all([c1, c2, c3])
        self.session.flush()

        # District filter
        ranchi_items, ranchi_total = list_challenges(self.session, district="Ranchi")
        self.assertEqual(ranchi_total, 2)
        self.assertEqual(len(ranchi_items), 2)

        # Domain filter
        water_items, water_total = list_challenges(self.session, domain="WATER")
        self.assertEqual(water_total, 2)

        # Combined filter
        combined_items, combined_total = list_challenges(self.session, district="Ranchi", domain="WATER")
        self.assertEqual(combined_total, 1)
        self.assertEqual(combined_items[0].title, "Water 1")

    def test_create_evidence_and_reference_validation(self) -> None:
        actor = Actor(display_name="Tester")
        challenge = Challenge(title="Title", summary="Sum", description="Desc", domain="DOM", source_type="SRC", district="Dis")
        self.session.add_all([actor, challenge])
        self.session.flush()

        # Valid evidence
        schema = EvidenceCreate(
            evidence_type="PHOTO",
            storage_reference="gcs://bucket/well-photo.jpg",
            description="Photo of contaminated well",
            submitted_by_actor_id=actor.id,
        )
        evidence = create_evidence(self.session, challenge.id, schema)
        self.assertEqual(evidence.challenge_id, challenge.id)
        self.assertEqual(evidence.evidence_type, "PHOTO")

        # Invalid challenge_id
        with self.assertRaises(ValueError) as ctx:
            create_evidence(self.session, uuid.uuid4(), schema)
        self.assertIn("Challenge", str(ctx.exception))

        # Invalid actor_id
        bad_actor_schema = EvidenceCreate(
            evidence_type="DOCUMENT",
            storage_reference="gcs://bucket/doc.pdf",
            submitted_by_actor_id=uuid.uuid4(),
        )
        with self.assertRaises(ValueError) as ctx:
            create_evidence(self.session, challenge.id, bad_actor_schema)
        self.assertIn("Actor", str(ctx.exception))


if __name__ == "__main__":
    unittest.main()
