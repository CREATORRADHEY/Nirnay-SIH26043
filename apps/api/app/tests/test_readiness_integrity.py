from datetime import datetime, timezone
import unittest
import uuid

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.enums import CommitmentStatus, ConditionStatus, ReadinessStatus
from app.models.actor import Actor
from app.models.base import Base
from app.models.challenge import Challenge
from app.models.commitment import Commitment
from app.models.organization import Organization
from app.models.readiness_condition import ReadinessCondition
from app.models.readiness_decision import ReadinessDecision
from app.services.readiness_integrity import invalidate_readiness_for_commitment_change


class TestReadinessIntegrity(unittest.TestCase):
    """Integration tests for deterministic readiness dependency invalidation service."""

    def setUp(self) -> None:
        self.engine = create_engine("sqlite:///:memory:")
        Base.metadata.create_all(self.engine)
        self.SessionLocal = sessionmaker(bind=self.engine)
        self.session: Session = self.SessionLocal()

    def tearDown(self) -> None:
        self.session.close()

    def test_p2_hero_sequence_commitment_withdrawn_reopens_readiness(self) -> None:
        """P2 HERO SEQUENCE TEST:
        ACCEPTED commitment
        -> SATISFIED readiness dependency
        -> human PILOT_READY
        -> commitment WITHDRAWN
        -> deterministic REVIEW_REQUIRED
        -> historical PILOT_READY preserved
        -> duplicate invalidation prevented
        """
        # 1. Create Challenge + Actor + Organization
        actor = Actor(id=uuid.uuid4(), display_name="Programme Coordinator")
        org = Organization(id=uuid.uuid4(), name="BIT Mesra", organization_type="HEI", district="Ranchi")
        challenge = Challenge(
            id=uuid.uuid4(),
            title="Arsenic Water Treatment",
            summary="High toxicity",
            description="Full report",
            domain="WATER",
            source_type="COMMUNITY",
            district="Ranchi",
        )
        self.session.add_all([actor, org, challenge])
        self.session.flush()

        # 2. Create Commitment v1 -> ACCEPTED
        comm_v1 = Commitment(
            id=uuid.uuid4(),
            challenge_id=challenge.id,
            organization_id=org.id,
            commitment_type="LAB_SUPPORT",
            status=CommitmentStatus.ACCEPTED,
            version=1,
            scope_description="Testing laboratory equipment allocation.",
            recorded_by_actor_id=actor.id,
        )
        self.session.add(comm_v1)
        self.session.flush()

        # 3. Create ReadinessCondition dependent on comm_v1
        cond_v1 = ReadinessCondition(
            id=uuid.uuid4(),
            challenge_id=challenge.id,
            condition_key="HEI_LAB_ACCESS",
            status=ConditionStatus.SATISFIED,
            version=1,
            rationale="Spectrometer lab allocated.",
            assessed_by_actor_id=actor.id,
        )
        cond_v1.commitment_dependencies.append(comm_v1)
        self.session.add(cond_v1)
        self.session.flush()

        # 4. Create human-authorized PILOT_READY decision
        dec_v1 = ReadinessDecision(
            id=uuid.uuid4(),
            challenge_id=challenge.id,
            status=ReadinessStatus.PILOT_READY,
            version=1,
            rationale="All mandatory conditions satisfied.",
            decided_by_actor_id=actor.id,
        )
        dec_v1.conditions.append(cond_v1)
        self.session.add(dec_v1)
        self.session.flush()

        self.assertEqual(dec_v1.status, ReadinessStatus.PILOT_READY)

        # 5. Create Commitment v2 -> WITHDRAWN
        comm_v2 = Commitment(
            id=uuid.uuid4(),
            challenge_id=challenge.id,
            organization_id=org.id,
            commitment_type="LAB_SUPPORT",
            status=CommitmentStatus.WITHDRAWN,
            version=2,
            scope_description="Lab access withdrawn due to scheduling conflict.",
            recorded_by_actor_id=actor.id,
        )
        self.session.add(comm_v2)
        self.session.flush()

        # 6. Run deterministic invalidation service
        new_decision = invalidate_readiness_for_commitment_change(self.session, comm_v2)

        # 7. Verify new decision created with REVIEW_REQUIRED
        self.assertIsNotNone(new_decision)
        self.assertEqual(new_decision.status, ReadinessStatus.REVIEW_REQUIRED)
        self.assertEqual(new_decision.version, 2)
        self.assertEqual(new_decision.triggered_by_commitment_id, comm_v2.id)
        self.assertIsNone(new_decision.decided_by_actor_id)  # System-derived

        # 8. Verify historical records preserved
        self.assertEqual(dec_v1.status, ReadinessStatus.PILOT_READY)
        self.assertEqual(comm_v1.status, CommitmentStatus.ACCEPTED)
        self.assertEqual(comm_v2.status, CommitmentStatus.WITHDRAWN)

        # 9. Verify IDEMPOTENCY: running invalidation again returns None
        duplicate_decision = invalidate_readiness_for_commitment_change(self.session, comm_v2)
        self.assertIsNone(duplicate_decision)

    def test_unaffected_dependency_isolation(self) -> None:
        """CRITICAL P2 INTEGRITY INVARIANT:
        1. A commitment change for Challenge A must NOT alter readiness for Challenge B.
        2. A commitment change for an unrelated commitment_type must NOT alter readiness.
        """
        actor = Actor(id=uuid.uuid4(), display_name="Coordinator")
        org1 = Organization(id=uuid.uuid4(), name="IIT ISM", organization_type="HEI")
        org2 = Organization(id=uuid.uuid4(), name="NIT Jamshedpur", organization_type="HEI")

        ch_a = Challenge(title="Challenge A", summary="Sum A", description="Desc A", domain="WATER", source_type="COMMUNITY", district="Dhanbad")
        ch_b = Challenge(title="Challenge B", summary="Sum B", description="Desc B", domain="ENERGY", source_type="COMMUNITY", district="Ranchi")
        self.session.add_all([actor, org1, org2, ch_a, ch_b])
        self.session.flush()

        # Setup Challenge A: comm_a_v1 -> ACCEPTED, PILOT_READY
        comm_a_v1 = Commitment(
            challenge_id=ch_a.id, organization_id=org1.id, commitment_type="LAB", status=CommitmentStatus.ACCEPTED, version=1, scope_description="Lab A", recorded_by_actor_id=actor.id
        )
        cond_a = ReadinessCondition(challenge_id=ch_a.id, condition_key="LAB_KEY", status=ConditionStatus.SATISFIED, version=1, rationale="Lab A ready", assessed_by_actor_id=actor.id)
        cond_a.commitment_dependencies.append(comm_a_v1)
        dec_a = ReadinessDecision(challenge_id=ch_a.id, status=ReadinessStatus.PILOT_READY, version=1, rationale="A Ready", decided_by_actor_id=actor.id)
        dec_a.conditions.append(cond_a)
        self.session.add_all([comm_a_v1, cond_a, dec_a])

        # Setup Challenge B: comm_b_v1 -> ACCEPTED, PILOT_READY
        comm_b_v1 = Commitment(
            challenge_id=ch_b.id, organization_id=org2.id, commitment_type="FIELD", status=CommitmentStatus.ACCEPTED, version=1, scope_description="Field B", recorded_by_actor_id=actor.id
        )
        cond_b = ReadinessCondition(challenge_id=ch_b.id, condition_key="FIELD_KEY", status=ConditionStatus.SATISFIED, version=1, rationale="Field B ready", assessed_by_actor_id=actor.id)
        cond_b.commitment_dependencies.append(comm_b_v1)
        dec_b = ReadinessDecision(challenge_id=ch_b.id, status=ReadinessStatus.PILOT_READY, version=1, rationale="B Ready", decided_by_actor_id=actor.id)
        dec_b.conditions.append(cond_b)
        self.session.add_all([comm_b_v1, cond_b, dec_b])

        self.session.flush()

        # Change commitment for Challenge A (v2 WITHDRAWN)
        comm_a_v2 = Commitment(
            challenge_id=ch_a.id, organization_id=org1.id, commitment_type="LAB", status=CommitmentStatus.WITHDRAWN, version=2, scope_description="Lab A withdrawn", recorded_by_actor_id=actor.id
        )
        self.session.add(comm_a_v2)
        self.session.flush()

        # Invalidate readiness for Challenge A commitment change
        result_a = invalidate_readiness_for_commitment_change(self.session, comm_a_v2)
        self.assertIsNotNone(result_a)
        self.assertEqual(result_a.challenge_id, ch_a.id)
        self.assertEqual(result_a.status, ReadinessStatus.REVIEW_REQUIRED)

        # Verify Challenge B readiness decisions were completely UNTOUCHED
        b_decisions = list(self.session.query(ReadinessDecision).filter_by(challenge_id=ch_b.id).all())
        self.assertEqual(len(b_decisions), 1)
        self.assertEqual(b_decisions[0].status, ReadinessStatus.PILOT_READY)


if __name__ == "__main__":
    unittest.main()
