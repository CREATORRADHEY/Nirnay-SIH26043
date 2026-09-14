from datetime import datetime, timezone
import unittest
import uuid

from app.core.enums import EvidenceConclusion, OperationalStatus, ReadinessStatus
from app.models.actor import Actor
from app.models.base import Base
from app.models.challenge import Challenge
from app.models.evidence import Evidence
from app.models.organization import Organization
from app.models.outcome_assessment import OutcomeAssessment, outcome_assessment_evidence
from app.models.pilot import Pilot
from app.models.pilot_evidence_plan import PilotEvidencePlan
from app.models.pilot_operational_state import PilotOperationalState
from app.models.readiness_decision import ReadinessDecision


class TestPilotOutcomeModels(unittest.TestCase):
    """Unit tests for Pilot, PilotOperationalState, PilotEvidencePlan, and OutcomeAssessment models."""

    def test_pilot_instantiation_defaults(self) -> None:
        pilot_id = uuid.uuid4()
        challenge_id = uuid.uuid4()
        readiness_id = uuid.uuid4()
        actor_id = uuid.uuid4()
        now = datetime.now(timezone.utc)

        pilot = Pilot(
            id=pilot_id,
            challenge_id=challenge_id,
            authorized_by_readiness_decision_id=readiness_id,
            name="Ranchi Arsenic Filtration Pilot",
            site_description="Block 4 Community Well Site",
            created_by_actor_id=actor_id,
            created_at=now,
        )

        self.assertEqual(pilot.id, pilot_id)
        self.assertEqual(pilot.challenge_id, challenge_id)
        self.assertEqual(pilot.authorized_by_readiness_decision_id, readiness_id)
        self.assertEqual(pilot.name, "Ranchi Arsenic Filtration Pilot")
        self.assertEqual(pilot.site_description, "Block 4 Community Well Site")
        self.assertEqual(pilot.created_by_actor_id, actor_id)
        self.assertIsInstance(pilot.created_at, datetime)

    def test_canonical_operational_status_values(self) -> None:
        valid_statuses = {e.value for e in OperationalStatus}
        self.assertEqual(
            valid_statuses,
            {"PLANNED", "ACTIVE", "COMPLETED", "STOPPED"},
        )

    def test_canonical_evidence_conclusion_values(self) -> None:
        valid_conclusions = {e.value for e in EvidenceConclusion}
        self.assertEqual(
            valid_conclusions,
            {"NOT_REVIEWED", "VALIDATED", "ITERATE", "INCONCLUSIVE"},
        )

    def test_evidence_plan_preserves_denominator_definition(self) -> None:
        plan = PilotEvidencePlan(
            objective="Evaluate Lead reduction in drinking water",
            primary_metric="Lead concentration (mg/L)",
            baseline_definition="Pre-installation water sample average across 10 test wells (0.05 mg/L)",
            denominator_definition="Total test samples collected from 10 designated wells over 30 days",
            data_collection_method="Daily digital sensor log + weekly lab test sample",
            created_by_actor_id=uuid.uuid4(),
        )
        self.assertEqual(plan.primary_metric, "Lead concentration (mg/L)")
        self.assertEqual(plan.baseline_definition, "Pre-installation water sample average across 10 test wells (0.05 mg/L)")
        self.assertEqual(plan.denominator_definition, "Total test samples collected from 10 designated wells over 30 days")

    def test_table_constraints_and_foreign_keys(self) -> None:
        pilot_table = Pilot.__table__
        op_table = PilotOperationalState.__table__
        plan_table = PilotEvidencePlan.__table__
        out_table = OutcomeAssessment.__table__

        # 1. FK RESTRICT policy
        pilot_fks = {fk.column.table.name: fk.ondelete for fk in pilot_table.foreign_keys}
        self.assertEqual(pilot_fks.get("challenges"), "RESTRICT")
        self.assertEqual(pilot_fks.get("readiness_decisions"), "RESTRICT")
        self.assertEqual(pilot_fks.get("actors"), "RESTRICT")

        op_fks = {fk.column.table.name: fk.ondelete for fk in op_table.foreign_keys}
        self.assertEqual(op_fks.get("pilots"), "RESTRICT")
        self.assertEqual(op_fks.get("actors"), "RESTRICT")

        plan_fks = {fk.column.table.name: fk.ondelete for fk in plan_table.foreign_keys}
        self.assertEqual(plan_fks.get("pilots"), "RESTRICT")
        self.assertEqual(plan_fks.get("actors"), "RESTRICT")

        out_fks = {fk.column.table.name: fk.ondelete for fk in out_table.foreign_keys}
        self.assertEqual(out_fks.get("pilots"), "RESTRICT")
        self.assertEqual(out_fks.get("pilot_evidence_plans"), "RESTRICT")
        self.assertEqual(out_fks.get("actors"), "RESTRICT")

        # 2. Version Uniqueness
        op_uniques = {uc.name for uc in op_table.constraints if hasattr(uc, "name")}
        self.assertIn("uq_pilot_operational_state_pilot_version", op_uniques)

        plan_uniques = {uc.name for uc in plan_table.constraints if hasattr(uc, "name")}
        self.assertIn("uq_pilot_evidence_plan_pilot_version", plan_uniques)

        out_uniques = {uc.name for uc in out_table.constraints if hasattr(uc, "name")}
        self.assertIn("uq_outcome_assessment_pilot_version", out_uniques)

    def test_operational_vs_evidence_independence(self) -> None:
        """CRITICAL DOMAIN INVARIANTS:
        1. OperationalStatus != EvidenceConclusion.
        2. COMPLETED + VALIDATED, COMPLETED + ITERATE, COMPLETED + INCONCLUSIVE, STOPPED + INCONCLUSIVE are all valid.
        3. No success/failure, impact_score, or AI impact fields exist on Pilot or OutcomeAssessment.
        """
        actor = Actor(id=uuid.uuid4(), display_name="Evaluator")
        pilot = Pilot(name="Test Pilot", challenge_id=uuid.uuid4(), authorized_by_readiness_decision_id=uuid.uuid4(), created_by_actor=actor)
        plan = PilotEvidencePlan(pilot=pilot, objective="Obj", primary_metric="Met", baseline_definition="Base", denominator_definition="Denom", data_collection_method="Method", created_by_actor=actor)

        # Independent combinations
        out1 = OutcomeAssessment(pilot=pilot, evidence_plan=plan, version=1, conclusion=EvidenceConclusion.VALIDATED, summary="Met criteria", assessed_by_actor=actor)
        out2 = OutcomeAssessment(pilot=pilot, evidence_plan=plan, version=2, conclusion=EvidenceConclusion.ITERATE, summary="Requires design tweak", assessed_by_actor=actor)
        out3 = OutcomeAssessment(pilot=pilot, evidence_plan=plan, version=3, conclusion=EvidenceConclusion.INCONCLUSIVE, summary="Denominator changed", assessed_by_actor=actor)

        self.assertEqual(out1.conclusion, EvidenceConclusion.VALIDATED)
        self.assertEqual(out2.conclusion, EvidenceConclusion.ITERATE)
        self.assertEqual(out3.conclusion, EvidenceConclusion.INCONCLUSIVE)

        # Confirm no fake score or success fields exist
        self.assertFalse(hasattr(Pilot, "success"))
        self.assertFalse(hasattr(Pilot, "impact_score"))
        self.assertFalse(hasattr(PilotOperationalState, "success"))
        self.assertFalse(hasattr(OutcomeAssessment, "impact_score"))
        self.assertFalse(hasattr(OutcomeAssessment, "ai_impact_score"))
        self.assertFalse(hasattr(OutcomeAssessment, "effectiveness_score"))

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
            "pilots",
            "pilot_operational_states",
            "pilot_evidence_plans",
            "outcome_assessments",
            "outcome_assessment_evidence",
        }
        self.assertTrue(expected_tables.issubset(set(Base.metadata.tables.keys())))


if __name__ == "__main__":
    unittest.main()
