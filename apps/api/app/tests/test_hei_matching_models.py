from datetime import datetime, timezone
import unittest
import uuid

from app.models.actor import Actor
from app.models.base import Base
from app.models.challenge import Challenge
from app.models.challenge_hei_candidate import ChallengeHEICandidate
from app.models.hei_capability import HEICapability
from app.models.organization import Organization
from app.models.qualification_decision import QualificationDecision


class TestHEIMatchingModels(unittest.TestCase):
    def test_hei_capability_instantiation_defaults(self) -> None:
        cap_id = uuid.uuid4()
        org_id = uuid.uuid4()

        capability = HEICapability(
            id=cap_id,
            organization_id=org_id,
            capability_type="RESEARCH_AREA",
            name="Water Testing & Membrane Filtration Lab",
            description="Specialized laboratory equipped for heavy metal detection.",
            discipline="Environmental Engineering",
            is_active=True,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )

        self.assertEqual(capability.id, cap_id)
        self.assertEqual(capability.organization_id, org_id)
        self.assertEqual(capability.capability_type, "RESEARCH_AREA")
        self.assertEqual(capability.name, "Water Testing & Membrane Filtration Lab")
        self.assertEqual(capability.description, "Specialized laboratory equipped for heavy metal detection.")
        self.assertEqual(capability.discipline, "Environmental Engineering")
        self.assertTrue(capability.is_active)
        self.assertIsInstance(capability.created_at, datetime)
        self.assertIsInstance(capability.updated_at, datetime)

    def test_organization_hei_capability_relationship(self) -> None:
        org = Organization(
            id=uuid.uuid4(),
            name="BIT Mesra",
            organization_type="HEI",
            district="Ranchi",
            state="Jharkhand",
        )

        cap1 = HEICapability(
            id=uuid.uuid4(),
            organization=org,
            capability_type="LAB",
            name="Water Quality Testing Facility",
        )
        cap2 = HEICapability(
            id=uuid.uuid4(),
            organization=org,
            capability_type="INCUBATION",
            name="Rural Technology Action Group",
        )

        self.assertEqual(len(org.hei_capabilities), 2)
        self.assertIn(cap1, org.hei_capabilities)
        self.assertIn(cap2, org.hei_capabilities)
        self.assertEqual(cap1.organization, org)
        self.assertEqual(cap2.organization, org)

    def test_challenge_hei_candidate_instantiation(self) -> None:
        candidate_id = uuid.uuid4()
        challenge_id = uuid.uuid4()
        org_id = uuid.uuid4()
        actor_id = uuid.uuid4()

        candidate = ChallengeHEICandidate(
            id=candidate_id,
            challenge_id=challenge_id,
            organization_id=org_id,
            match_method="RULE_BASED",
            rationale="HEI possesses registered expertise in water purification technology.",
            created_by_actor_id=actor_id,
            created_at=datetime.now(timezone.utc),
        )

        self.assertEqual(candidate.id, candidate_id)
        self.assertEqual(candidate.challenge_id, challenge_id)
        self.assertEqual(candidate.organization_id, org_id)
        self.assertEqual(candidate.match_method, "RULE_BASED")
        self.assertEqual(candidate.rationale, "HEI possesses registered expertise in water purification technology.")
        self.assertEqual(candidate.created_by_actor_id, actor_id)
        self.assertIsInstance(candidate.created_at, datetime)

    def test_challenge_hei_candidate_relationships(self) -> None:
        actor = Actor(id=uuid.uuid4(), display_name="Matching Coordinator")
        org = Organization(
            id=uuid.uuid4(),
            name="IIT ISM Dhanbad",
            organization_type="HEI",
            district="Dhanbad",
        )
        challenge = Challenge(
            id=uuid.uuid4(),
            title="Groundwater Contamination",
            summary="Arsenic toxicity",
            description="Full report",
            domain="WATER",
            source_type="COMMUNITY",
            district="Dhanbad",
        )

        candidate = ChallengeHEICandidate(
            id=uuid.uuid4(),
            challenge=challenge,
            organization=org,
            match_method="MANUAL",
            rationale="Proximity and discipline alignment.",
            created_by_actor=actor,
        )

        self.assertEqual(len(challenge.hei_candidates), 1)
        self.assertEqual(challenge.hei_candidates[0], candidate)
        self.assertEqual(candidate.challenge, challenge)

        self.assertEqual(len(org.challenge_candidates), 1)
        self.assertEqual(org.challenge_candidates[0], candidate)
        self.assertEqual(candidate.organization, org)

        self.assertEqual(len(actor.created_hei_candidates), 1)
        self.assertEqual(actor.created_hei_candidates[0], candidate)
        self.assertEqual(candidate.created_by_actor, actor)

    def test_candidate_created_by_actor_nullable(self) -> None:
        table = ChallengeHEICandidate.__table__
        self.assertTrue(table.columns["created_by_actor_id"].nullable)

        candidate = ChallengeHEICandidate(
            challenge_id=uuid.uuid4(),
            organization_id=uuid.uuid4(),
            match_method="AI_ASSISTED",
            rationale="Automated domain vector match.",
            created_by_actor=None,
        )
        self.assertIsNone(candidate.created_by_actor_id)
        self.assertIsNone(candidate.created_by_actor)

    def test_table_constraints_and_foreign_keys(self) -> None:
        cap_table = HEICapability.__table__
        cap_fks = {fk.column.table.name: fk.ondelete for fk in cap_table.foreign_keys}
        self.assertEqual(cap_fks.get("organizations"), "RESTRICT")

        cand_table = ChallengeHEICandidate.__table__
        cand_fks = {fk.column.table.name: fk.ondelete for fk in cand_table.foreign_keys}
        self.assertEqual(cand_fks.get("challenges"), "RESTRICT")
        self.assertEqual(cand_fks.get("organizations"), "RESTRICT")
        self.assertEqual(cand_fks.get("actors"), "RESTRICT")

        unique_names = {uc.name for uc in cand_table.constraints if hasattr(uc, "name")}
        self.assertIn("uq_challenge_hei_candidate", unique_names)

    def test_domain_invariants(self) -> None:
        self.assertFalse(hasattr(Challenge, "matched_hei"))
        self.assertFalse(hasattr(Challenge, "assigned_hei"))

        self.assertFalse(hasattr(QualificationDecision, "matched_hei_id"))

        self.assertFalse(hasattr(ChallengeHEICandidate, "accepted"))
        self.assertFalse(hasattr(ChallengeHEICandidate, "declined"))
        self.assertFalse(hasattr(ChallengeHEICandidate, "status"))

        self.assertFalse(hasattr(ChallengeHEICandidate, "committed"))
        self.assertFalse(hasattr(ChallengeHEICandidate, "faculty_confirmed"))
        self.assertFalse(hasattr(ChallengeHEICandidate, "resource_confirmed"))
        self.assertFalse(hasattr(ChallengeHEICandidate, "funding_confirmed"))

        self.assertFalse(hasattr(ChallengeHEICandidate, "pilot_ready"))
        self.assertFalse(hasattr(ChallengeHEICandidate, "approved"))
        self.assertFalse(hasattr(ChallengeHEICandidate, "assigned"))

        self.assertFalse(hasattr(ChallengeHEICandidate, "match_score"))
        self.assertFalse(hasattr(ChallengeHEICandidate, "ai_confidence"))
        self.assertFalse(hasattr(ChallengeHEICandidate, "success_probability"))

        cap_fk_tables = [fk.column.table.name for fk in HEICapability.__table__.foreign_keys]
        self.assertEqual(cap_fk_tables, ["organizations"])

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
        }
        self.assertEqual(set(Base.metadata.tables.keys()), expected_tables)


if __name__ == "__main__":
    unittest.main()
