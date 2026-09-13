from datetime import datetime, timezone
import unittest
import uuid

from app.models.base import Base
from app.models.actor import Actor
from app.models.organization import Organization
from app.models.challenge import Challenge
from app.models.evidence import Evidence


class TestChallengeEvidenceModels(unittest.TestCase):
    """Unit tests for Challenge and Evidence foundation models and domain invariants."""

    def test_challenge_instantiation_defaults(self) -> None:
        challenge_id = uuid.uuid4()
        challenge = Challenge(
            id=challenge_id,
            title="Water Contamination in Rural Schools",
            summary="High fluoride level in groundwater causing health issues",
            description="Detailed report on water quality across 12 primary schools.",
            domain="WATER_SANITATION",
            source_type="COMMUNITY",
            district="Ranchi",
            state="Jharkhand",
        )

        self.assertEqual(challenge.id, challenge_id)
        self.assertEqual(challenge.title, "Water Contamination in Rural Schools")
        self.assertEqual(challenge.summary, "High fluoride level in groundwater causing health issues")
        self.assertEqual(challenge.description, "Detailed report on water quality across 12 primary schools.")
        self.assertEqual(challenge.domain, "WATER_SANITATION")
        self.assertEqual(challenge.source_type, "COMMUNITY")
        self.assertEqual(challenge.district, "Ranchi")
        self.assertEqual(challenge.state, "Jharkhand")
        self.assertIsNone(challenge.submitted_by_actor_id)
        self.assertIsNone(challenge.source_organization_id)

    def test_evidence_instantiation_defaults(self) -> None:
        evidence_id = uuid.uuid4()
        challenge_id = uuid.uuid4()
        evidence = Evidence(
            id=evidence_id,
            challenge_id=challenge_id,
            evidence_type="DOCUMENT",
            storage_reference="gcs://nirnay-evidence/ranchi-water-report.pdf",
            description="Lab test results from district water testing facility.",
        )

        self.assertEqual(evidence.id, evidence_id)
        self.assertEqual(evidence.challenge_id, challenge_id)
        self.assertEqual(evidence.evidence_type, "DOCUMENT")
        self.assertEqual(evidence.storage_reference, "gcs://nirnay-evidence/ranchi-water-report.pdf")
        self.assertEqual(evidence.description, "Lab test results from district water testing facility.")
        self.assertIsNone(evidence.submitted_by_actor_id)

    def test_relationships_and_attribution(self) -> None:
        actor = Actor(id=uuid.uuid4(), display_name="Jal Sahiyaa Worker")
        org = Organization(id=uuid.uuid4(), name="District Water Board", organization_type="GOVERNMENT")
        challenge = Challenge(
            id=uuid.uuid4(),
            title="Dry Borewells in Panchayat",
            summary="Depleting groundwater level",
            description="Multiple borewells failed during summer season.",
            domain="WATER_RESOURCE",
            source_type="PRI",
            district="Dhanbad",
            submitted_by_actor=actor,
            source_organization=org,
        )

        evidence = Evidence(
            id=uuid.uuid4(),
            challenge=challenge,
            submitted_by_actor=actor,
            evidence_type="PHOTO",
            storage_reference="gcs://nirnay-evidence/dry-well-01.jpg",
        )

        self.assertEqual(challenge.submitted_by_actor, actor)
        self.assertEqual(challenge.source_organization, org)
        self.assertIn(challenge, actor.submitted_challenges)
        self.assertIn(challenge, org.sourced_challenges)
        self.assertIn(evidence, challenge.evidences)
        self.assertEqual(evidence.challenge, challenge)
        self.assertEqual(evidence.submitted_by_actor, actor)
        self.assertIn(evidence, actor.submitted_evidences)

    def test_foreign_key_restrict_deletion(self) -> None:
        """Verify foreign keys enforce ON DELETE RESTRICT (no ON DELETE CASCADE)."""
        actor_fk = [fk for fk in Challenge.__table__.foreign_keys if fk.column.table.name == "actors"]
        org_fk = [fk for fk in Challenge.__table__.foreign_keys if fk.column.table.name == "organizations"]
        challenge_fk = [fk for fk in Evidence.__table__.foreign_keys if fk.column.table.name == "challenges"]
        evidence_actor_fk = [fk for fk in Evidence.__table__.foreign_keys if fk.column.table.name == "actors"]

        self.assertTrue(all(fk.ondelete == "RESTRICT" for fk in actor_fk))
        self.assertTrue(all(fk.ondelete == "RESTRICT" for fk in org_fk))
        self.assertTrue(all(fk.ondelete == "RESTRICT" for fk in challenge_fk))
        self.assertTrue(all(fk.ondelete == "RESTRICT" for fk in evidence_actor_fk))

    def test_domain_invariants_facts_not_decisions(self) -> None:
        """CRITICAL DOMAIN INVARIANT: Facts != Decisions != Readiness != Outcomes.

        Challenge Passport stores raw problem facts.
        It MUST NOT contain qualification decisions, readiness states, AI approvals, or pilot fields.
        """
        # 1. No QualificationRoute on Challenge
        self.assertFalse(hasattr(Challenge, "qualification_route"))
        self.assertFalse(hasattr(Challenge, "route"))

        # 2. No ReadinessStatus or status column on Challenge
        self.assertFalse(hasattr(Challenge, "readiness_status"))
        self.assertFalse(hasattr(Challenge, "status"))
        self.assertFalse(hasattr(Challenge, "pilot_status"))

        # 3. No Evaluation/Decision fields on Challenge
        self.assertFalse(hasattr(Challenge, "success"))
        self.assertFalse(hasattr(Challenge, "impact_score"))
        self.assertFalse(hasattr(Challenge, "genuineness_score"))
        self.assertFalse(hasattr(Challenge, "severity_score"))
        self.assertFalse(hasattr(Challenge, "assigned_hei_id"))
        self.assertFalse(hasattr(Challenge, "commitment_id"))

        # 4. No EvidenceConclusion on Evidence
        self.assertFalse(hasattr(Evidence, "evidence_conclusion"))
        self.assertFalse(hasattr(Evidence, "conclusion"))
        self.assertFalse(hasattr(Evidence, "verdict"))

    def test_expected_tables_in_metadata(self) -> None:
        """Verify metadata contains ONLY identity foundation + challenge/evidence tables."""
        expected_tables = {
            "organizations",
            "actors",
            "organization_memberships",
            "challenges",
            "evidences",
        }
        self.assertEqual(set(Base.metadata.tables.keys()), expected_tables)


if __name__ == "__main__":
    unittest.main()
