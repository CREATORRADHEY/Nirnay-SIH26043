from datetime import datetime, timezone
import unittest
import uuid

from app.core.enums import ConditionStatus, ReadinessStatus
from app.models.actor import Actor
from app.models.base import Base
from app.models.challenge import Challenge
from app.models.commitment import Commitment
from app.models.organization import Organization
from app.models.readiness_condition import ReadinessCondition, readiness_condition_commitment_dependencies
from app.models.readiness_decision import ReadinessDecision, readiness_decision_conditions


class TestReadinessModels(unittest.TestCase):
    """Unit tests for ReadinessCondition and ReadinessDecision ORM models."""

    def test_readiness_condition_instantiation(self) -> None:
        cond_id = uuid.uuid4()
        challenge_id = uuid.uuid4()
        actor_id = uuid.uuid4()
        now = datetime.now(timezone.utc)

        condition = ReadinessCondition(
            id=cond_id,
            challenge_id=challenge_id,
            condition_key="HEI_COMMITMENT",
            status=ConditionStatus.SATISFIED,
            version=1,
            rationale="Formal commitment accepted by HEI leadership.",
            assessed_by_actor_id=actor_id,
            assessed_at=now,
        )

        self.assertEqual(condition.id, cond_id)
        self.assertEqual(condition.challenge_id, challenge_id)
        self.assertEqual(condition.condition_key, "HEI_COMMITMENT")
        self.assertEqual(condition.status, ConditionStatus.SATISFIED)
        self.assertEqual(condition.version, 1)
        self.assertEqual(condition.rationale, "Formal commitment accepted by HEI leadership.")
        self.assertEqual(condition.assessed_by_actor_id, actor_id)
        self.assertIsInstance(condition.assessed_at, datetime)

    def test_canonical_condition_status_values(self) -> None:
        valid_statuses = {e.value for e in ConditionStatus}
        self.assertEqual(
            valid_statuses,
            {"SATISFIED", "UNSATISFIED", "UNKNOWN", "DISPUTED", "EXPIRED"},
        )

    def test_readiness_decision_instantiation(self) -> None:
        decision_id = uuid.uuid4()
        challenge_id = uuid.uuid4()
        actor_id = uuid.uuid4()
        now = datetime.now(timezone.utc)

        decision = ReadinessDecision(
            id=decision_id,
            challenge_id=challenge_id,
            status=ReadinessStatus.PILOT_READY,
            version=1,
            rationale="All mandatory conditions satisfied; authorized by coordinator.",
            decided_by_actor_id=actor_id,
            created_at=now,
        )

        self.assertEqual(decision.id, decision_id)
        self.assertEqual(decision.challenge_id, challenge_id)
        self.assertEqual(decision.status, ReadinessStatus.PILOT_READY)
        self.assertEqual(decision.version, 1)
        self.assertEqual(decision.decided_by_actor_id, actor_id)
        self.assertIsInstance(decision.created_at, datetime)

    def test_canonical_readiness_status_values(self) -> None:
        valid_statuses = {e.value for e in ReadinessStatus}
        self.assertEqual(
            valid_statuses,
            {"BLOCKED", "REVIEW_READY", "PILOT_READY", "REVIEW_REQUIRED"},
        )

    def test_table_constraints_and_foreign_keys(self) -> None:
        cond_table = ReadinessCondition.__table__
        dec_table = ReadinessDecision.__table__

        # 1. Foreign key RESTRICT policies
        cond_fks = {fk.column.table.name: fk.ondelete for fk in cond_table.foreign_keys}
        self.assertEqual(cond_fks.get("challenges"), "RESTRICT")
        self.assertEqual(cond_fks.get("actors"), "RESTRICT")

        dec_fks = {fk.column.table.name: fk.ondelete for fk in dec_table.foreign_keys}
        self.assertEqual(dec_fks.get("challenges"), "RESTRICT")
        self.assertEqual(dec_fks.get("actors"), "RESTRICT")
        self.assertEqual(dec_fks.get("commitments"), "RESTRICT")

        # 2. Unique Constraints
        cond_uniques = {uc.name for uc in cond_table.constraints if hasattr(uc, "name")}
        self.assertIn("uq_readiness_condition_challenge_key_version", cond_uniques)

        dec_uniques = {uc.name for uc in dec_table.constraints if hasattr(uc, "name")}
        self.assertIn("uq_readiness_decision_challenge_version", dec_uniques)

        # 3. Check Constraint on PILOT_READY requiring human actor
        dec_checks = [
            c for c in dec_table.constraints
            if hasattr(c, "sqltext") and "PILOT_READY" in str(c.sqltext)
        ]
        self.assertTrue(len(dec_checks) >= 1)

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
            "readiness_conditions",
            "readiness_condition_commitment_dependencies",
            "readiness_decisions",
            "readiness_decision_conditions",
        }
        self.assertTrue(expected_tables.issubset(set(Base.metadata.tables.keys())))


if __name__ == "__main__":
    unittest.main()
