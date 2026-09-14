from datetime import datetime, timedelta, timezone
import unittest
import uuid

from app.core.enums import CommitmentStatus, ReadinessStatus
from app.models.actor import Actor
from app.models.base import Base
from app.models.challenge import Challenge
from app.models.challenge_hei_candidate import ChallengeHEICandidate
from app.models.commitment import Commitment
from app.models.organization import Organization


class TestCommitmentModels(unittest.TestCase):
    def test_commitment_instantiation_defaults(self) -> None:
        comm_id = uuid.uuid4()
        challenge_id = uuid.uuid4()
        org_id = uuid.uuid4()
        actor_id = uuid.uuid4()
        now = datetime.now(timezone.utc)
        valid_until = now + timedelta(days=90)

        commitment = Commitment(
            id=comm_id,
            challenge_id=challenge_id,
            organization_id=org_id,
            commitment_type="HEI_PARTICIPATION",
            status=CommitmentStatus.PROPOSED,
            version=1,
            scope_description="Faculty guidance and lab equipment access for water quality sensor testing.",
            recorded_by_actor_id=actor_id,
            valid_from=now,
            valid_until=valid_until,
            created_at=now,
        )

        self.assertEqual(commitment.id, comm_id)
        self.assertEqual(commitment.challenge_id, challenge_id)
        self.assertEqual(commitment.organization_id, org_id)
        self.assertEqual(commitment.commitment_type, "HEI_PARTICIPATION")
        self.assertEqual(commitment.status, CommitmentStatus.PROPOSED)
        self.assertEqual(commitment.version, 1)
        self.assertEqual(
            commitment.scope_description,
            "Faculty guidance and lab equipment access for water quality sensor testing.",
        )
        self.assertEqual(commitment.recorded_by_actor_id, actor_id)
        self.assertEqual(commitment.valid_from, now)
        self.assertEqual(commitment.valid_until, valid_until)
        self.assertIsInstance(commitment.created_at, datetime)

    def test_canonical_commitment_status_values(self) -> None:
        self.assertEqual(CommitmentStatus.PROPOSED.value, "PROPOSED")
        self.assertEqual(CommitmentStatus.OFFERED.value, "OFFERED")
        self.assertEqual(CommitmentStatus.ACCEPTED.value, "ACCEPTED")
        self.assertEqual(CommitmentStatus.DECLINED.value, "DECLINED")
        self.assertEqual(CommitmentStatus.WITHDRAWN.value, "WITHDRAWN")
        self.assertEqual(CommitmentStatus.EXPIRED.value, "EXPIRED")

        valid_statuses = {e.value for e in CommitmentStatus}
        self.assertEqual(
            valid_statuses,
            {"PROPOSED", "OFFERED", "ACCEPTED", "DECLINED", "WITHDRAWN", "EXPIRED"},
        )

    def test_commitment_relationships(self) -> None:
        actor = Actor(id=uuid.uuid4(), display_name="HEI Nodal Officer")
        org = Organization(
            id=uuid.uuid4(),
            name="NIT Jamshedpur",
            organization_type="HEI",
            district="East Singhbhum",
            state="Jharkhand",
        )
        challenge = Challenge(
            id=uuid.uuid4(),
            title="Heavy Metal Water Contamination",
            summary="High Lead levels",
            description="Detailed lab analysis",
            domain="WATER",
            source_type="COMMUNITY",
            district="East Singhbhum",
        )

        comm1 = Commitment(
            id=uuid.uuid4(),
            challenge=challenge,
            organization=org,
            commitment_type="LAB_SUPPORT",
            status=CommitmentStatus.PROPOSED,
            version=1,
            scope_description="Testing spectrometer lab allocation.",
            recorded_by_actor=actor,
        )

        comm2 = Commitment(
            id=uuid.uuid4(),
            challenge=challenge,
            organization=org,
            commitment_type="LAB_SUPPORT",
            status=CommitmentStatus.ACCEPTED,
            version=2,
            scope_description="Testing spectrometer lab allocation + student support.",
            recorded_by_actor=actor,
        )

        self.assertEqual(len(challenge.commitments), 2)
        self.assertIn(comm1, challenge.commitments)
        self.assertIn(comm2, challenge.commitments)
        self.assertEqual(comm1.challenge, challenge)

        self.assertEqual(len(org.commitments), 2)
        self.assertIn(comm1, org.commitments)
        self.assertIn(comm2, org.commitments)
        self.assertEqual(comm1.organization, org)

        self.assertEqual(len(actor.recorded_commitments), 2)
        self.assertIn(comm1, actor.recorded_commitments)
        self.assertIn(comm2, actor.recorded_commitments)
        self.assertEqual(comm1.recorded_by_actor, actor)

    def test_recorded_by_actor_mandatory(self) -> None:
        table = Commitment.__table__
        self.assertFalse(table.columns["recorded_by_actor_id"].nullable)

    def test_table_constraints_and_foreign_keys(self) -> None:
        table = Commitment.__table__

        fks = {fk.column.table.name: fk.ondelete for fk in table.foreign_keys}
        self.assertEqual(fks.get("challenges"), "RESTRICT")
        self.assertEqual(fks.get("organizations"), "RESTRICT")
        self.assertEqual(fks.get("actors"), "RESTRICT")

        unique_names = {uc.name for uc in table.constraints if hasattr(uc, "name")}
        self.assertIn("uq_commitment_challenge_org_type_version", unique_names)

        version_checks = [
            c for c in table.constraints
            if hasattr(c, "sqltext") and "version >= 1" in str(c.sqltext)
        ]
        self.assertTrue(len(version_checks) >= 1)

        window_checks = [
            c for c in table.constraints
            if hasattr(c, "sqltext") and "valid_until >= valid_from" in str(c.sqltext)
        ]
        self.assertTrue(len(window_checks) >= 1)

    def test_versioned_history_invariants(self) -> None:
        actor = Actor(id=uuid.uuid4(), display_name="Coordinator")
        org = Organization(id=uuid.uuid4(), name="Central University", organization_type="HEI")
        challenge = Challenge(title="Test", summary="Sum", description="Desc", domain="WATER", source_type="CITIZEN", district="Dis")

        v1 = Commitment(
            id=uuid.uuid4(),
            challenge=challenge,
            organization=org,
            commitment_type="FACULTY_MENTORING",
            status=CommitmentStatus.ACCEPTED,
            version=1,
            scope_description="2 faculty mentors assigned.",
            recorded_by_actor=actor,
        )

        v2 = Commitment(
            id=uuid.uuid4(),
            challenge=challenge,
            organization=org,
            commitment_type="FACULTY_MENTORING",
            status=CommitmentStatus.WITHDRAWN,
            version=2,
            scope_description="Faculty mentor workload conflict.",
            recorded_by_actor=actor,
        )

        self.assertEqual(len(challenge.commitments), 2)
        self.assertEqual(v1.status, CommitmentStatus.ACCEPTED)
        self.assertEqual(v2.status, CommitmentStatus.WITHDRAWN)

        self.assertEqual(v1.version, 1)
        self.assertEqual(v2.version, 2)

        latest_commitment = max(challenge.commitments, key=lambda c: c.version)
        self.assertEqual(latest_commitment.status, CommitmentStatus.WITHDRAWN)

        self.assertFalse(hasattr(Challenge, "commitment_status"))
        self.assertFalse(hasattr(Challenge, "committed_hei"))

        self.assertFalse(hasattr(ChallengeHEICandidate, "accepted"))
        self.assertFalse(hasattr(ChallengeHEICandidate, "committed"))

        self.assertFalse(hasattr(Commitment, "readiness_status"))
        self.assertFalse(hasattr(Commitment, "pilot_ready"))

        self.assertFalse(hasattr(Commitment, "ai_score"))
        self.assertFalse(hasattr(Commitment, "ai_confidence"))
        self.assertFalse(hasattr(Commitment, "auto_accepted"))

    def test_expected_metadata_tables(self) -> None:
        expected_tables = {
            "organizations",
            "actors",
            "organization_memberships",
            "challenges",
            "evidences",
            "qualification_decisions",
            "qualification_decision_evidence",
            "hei_capabilities",
            "challenge_hei_candidates",
            "commitments",
        }
        self.assertTrue(expected_tables.issubset(set(Base.metadata.tables.keys())))


if __name__ == "__main__":
    unittest.main()
