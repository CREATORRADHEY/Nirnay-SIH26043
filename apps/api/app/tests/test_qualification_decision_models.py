from datetime import datetime, timezone
import unittest
import uuid

from app.core.enums import QualificationRoute
from app.models.actor import Actor
from app.models.base import Base
from app.models.challenge import Challenge
from app.models.evidence import Evidence
from app.models.organization import Organization
from app.models.qualification_decision import QualificationDecision, qualification_decision_evidence


class TestQualificationDecisionModels(unittest.TestCase):
    """Unit tests for QualificationDecision model and domain invariants."""

    def test_qualification_decision_instantiation_defaults(self) -> None:
        decision_id = uuid.uuid4()
        challenge_id = uuid.uuid4()
        actor_id = uuid.uuid4()

        decision = QualificationDecision(
            id=decision_id,
            challenge_id=challenge_id,
            route=QualificationRoute.INNOVATION_CHALLENGE,
            version=1,
            rationale="Problem requires HEI technical R&D innovation for filtration sensor solution.",
            decided_by_actor_id=actor_id,
            decided_at=datetime.now(timezone.utc),
        )

        self.assertEqual(decision.id, decision_id)
        self.assertEqual(decision.challenge_id, challenge_id)
        self.assertEqual(decision.route, QualificationRoute.INNOVATION_CHALLENGE)
        self.assertEqual(decision.version, 1)
        self.assertEqual(decision.rationale, "Problem requires HEI technical R&D innovation for filtration sensor solution.")
        self.assertEqual(decision.decided_by_actor_id, actor_id)
        self.assertIsInstance(decision.decided_at, datetime)

    def test_canonical_qualification_route_values(self) -> None:
        """Verify QualificationRoute enum values match canonical domain contracts."""
        self.assertEqual(QualificationRoute.SERVICE.value, "SERVICE")
        self.assertEqual(QualificationRoute.CLARIFY.value, "CLARIFY")
        self.assertEqual(QualificationRoute.RESEARCH_REVIEW.value, "RESEARCH_REVIEW")
        self.assertEqual(QualificationRoute.INNOVATION_CHALLENGE.value, "INNOVATION_CHALLENGE")

        valid_routes = {e.value for e in QualificationRoute}
        self.assertEqual(valid_routes, {"SERVICE", "CLARIFY", "RESEARCH_REVIEW", "INNOVATION_CHALLENGE"})
        self.assertNotIn("PENDING", valid_routes)
        self.assertNotIn("APPROVED", valid_routes)
        self.assertNotIn("REJECTED", valid_routes)

    def test_versioned_decision_history_and_relationships(self) -> None:
        """Verify append-only decision history linked to Challenge, Actor, and Evidence."""
        actor = Actor(id=uuid.uuid4(), display_name="Evaluator Coordinator")
        challenge = Challenge(
            id=uuid.uuid4(),
            title="Arsenic in Drinking Water",
            summary="High toxicity level",
            description="Detailed report",
            domain="WATER",
            source_type="COMMUNITY",
            district="Ranchi",
        )

        evidence1 = Evidence(
            id=uuid.uuid4(),
            challenge=challenge,
            evidence_type="DOCUMENT",
            storage_reference="gcs://nirnay/water-lab.pdf",
        )
        evidence2 = Evidence(
            id=uuid.uuid4(),
            challenge=challenge,
            evidence_type="PHOTO",
            storage_reference="gcs://nirnay/well-photo.jpg",
        )

        # Version 1 decision - CLARIFY (zero evidence initially referenced)
        v1_decision = QualificationDecision(
            id=uuid.uuid4(),
            challenge=challenge,
            route=QualificationRoute.CLARIFY,
            version=1,
            rationale="More laboratory testing evidence needed.",
            decided_by_actor=actor,
        )

        # Version 2 decision - INNOVATION_CHALLENGE (referencing 2 evidence items)
        v2_decision = QualificationDecision(
            id=uuid.uuid4(),
            challenge=challenge,
            route=QualificationRoute.INNOVATION_CHALLENGE,
            version=2,
            rationale="Validated lab report confirms innovation challenge route.",
            decided_by_actor=actor,
            evidence_items=[evidence1, evidence2],
        )

        self.assertEqual(len(challenge.qualification_decisions), 2)
        self.assertIn(v1_decision, challenge.qualification_decisions)
        self.assertIn(v2_decision, challenge.qualification_decisions)
        self.assertEqual(len(actor.qualification_decisions_made), 2)

        self.assertEqual(len(v1_decision.evidence_items), 0)
        self.assertEqual(len(v2_decision.evidence_items), 2)
        self.assertIn(v2_decision, evidence1.qualification_decisions)
        self.assertIn(v2_decision, evidence2.qualification_decisions)

    def test_table_constraints_and_foreign_keys(self) -> None:
        """Verify UNIQUE(challenge_id, version), CHECK(version >= 1), and RESTRICT FKs."""
        table = QualificationDecision.__table__

        # 1. UniqueConstraint on (challenge_id, version)
        unique_names = {uc.name for uc in table.constraints if hasattr(uc, "name")}
        self.assertIn("uq_qualification_decision_challenge_version", unique_names)

        # 2. CheckConstraint version >= 1
        check_constraints = [c for c in table.constraints if hasattr(c, "sqltext") and "version >= 1" in str(c.sqltext)]
        self.assertTrue(len(check_constraints) >= 1)

        # 3. Foreign key RESTRICT deletion policies
        fks = {fk.column.table.name: fk.ondelete for fk in table.foreign_keys}
        self.assertEqual(fks.get("challenges"), "RESTRICT")
        self.assertEqual(fks.get("actors"), "RESTRICT")

        # 4. Association table FKs
        assoc_table = qualification_decision_evidence
        assoc_fks = {fk.column.table.name: fk.ondelete for fk in assoc_table.foreign_keys}
        self.assertEqual(assoc_fks.get("qualification_decisions"), "RESTRICT")
        self.assertEqual(assoc_fks.get("evidences"), "RESTRICT")

    def test_domain_invariants(self) -> None:
        """CRITICAL DOMAIN INVARIANTS:
        1. Challenge facts remain independent from qualification decisions.
        2. Qualification route exists ONLY on QualificationDecision.
        3. A newly instantiated Challenge has zero qualification decisions.
        4. QualificationDecision requires decided_by_actor_id.
        5. No AI-authoritative decision fields exist.
        """
        challenge = Challenge(
            title="Sample", summary="Sum", description="Desc",
            domain="DOM", source_type="CITIZEN", district="Dis"
        )

        # 1. Challenge facts remain independent without route column
        self.assertFalse(hasattr(Challenge, "qualification_route"))
        self.assertFalse(hasattr(Challenge, "route"))

        # 2. Newly instantiated Challenge has zero qualification decisions
        self.assertEqual(len(challenge.qualification_decisions), 0)

        # 3. QualificationDecision decided_by_actor_id is non-nullable in column definition
        self.assertFalse(QualificationDecision.__table__.columns["decided_by_actor_id"].nullable)

        # 4. No AI-authoritative decision fields on QualificationDecision
        self.assertFalse(hasattr(QualificationDecision, "ai_approved"))
        self.assertFalse(hasattr(QualificationDecision, "ai_decided"))
        self.assertFalse(hasattr(QualificationDecision, "ai_confidence"))
        self.assertFalse(hasattr(QualificationDecision, "automatic_route"))

    def test_expected_metadata_tables(self) -> None:
        """Verify metadata contains exact expected tables."""
        expected_tables = {
            "organizations",
            "actors",
            "organization_memberships",
            "challenges",
            "evidences",
            "qualification_decisions",
            "qualification_decision_evidence",
        }
        self.assertTrue(expected_tables.issubset(set(Base.metadata.tables.keys())))


if __name__ == "__main__":
    unittest.main()
