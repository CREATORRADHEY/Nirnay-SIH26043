import json
import unittest
from pathlib import Path
from app.core.enums import (
    QualificationRoute,
    CommitmentStatus,
    ConditionStatus,
    ReadinessStatus,
    OperationalStatus,
    EvidenceConclusion,
)

CANONICAL_PATH = (
    Path(__file__).resolve().parent.parent.parent.parent.parent
    / "packages"
    / "contracts"
    / "domain-states.json"
)


class TestDomainEnums(unittest.TestCase):

    def test_canonical_json_exists(self) -> None:
        self.assertTrue(CANONICAL_PATH.exists())

    def test_qualification_route_enum(self) -> None:
        self.assertEqual(
            [e.value for e in QualificationRoute],
            [
                "SERVICE",
                "CLARIFY",
                "RESEARCH_REVIEW",
                "INNOVATION_CHALLENGE",
            ],
        )
        self.assertTrue(issubclass(QualificationRoute, str))
        self.assertEqual(QualificationRoute.SERVICE, "SERVICE")

    def test_commitment_status_enum(self) -> None:
        self.assertEqual(
            [e.value for e in CommitmentStatus],
            [
                "PROPOSED",
                "OFFERED",
                "ACCEPTED",
                "DECLINED",
                "WITHDRAWN",
                "EXPIRED",
            ],
        )
        self.assertTrue(issubclass(CommitmentStatus, str))

    def test_condition_status_enum(self) -> None:
        self.assertEqual(
            [e.value for e in ConditionStatus],
            [
                "SATISFIED",
                "UNSATISFIED",
                "UNKNOWN",
                "DISPUTED",
                "EXPIRED",
            ],
        )
        self.assertTrue(issubclass(ConditionStatus, str))

    def test_readiness_status_enum(self) -> None:
        self.assertEqual(
            [e.value for e in ReadinessStatus],
            [
                "BLOCKED",
                "REVIEW_READY",
                "PILOT_READY",
                "REVIEW_REQUIRED",
            ],
        )
        self.assertTrue(issubclass(ReadinessStatus, str))

    def test_operational_status_enum(self) -> None:
        self.assertEqual(
            [e.value for e in OperationalStatus],
            [
                "PLANNED",
                "ACTIVE",
                "COMPLETED",
                "STOPPED",
            ],
        )
        self.assertTrue(issubclass(OperationalStatus, str))

    def test_evidence_conclusion_enum(self) -> None:
        self.assertEqual(
            [e.value for e in EvidenceConclusion],
            [
                "NOT_REVIEWED",
                "VALIDATED",
                "ITERATE",
                "INCONCLUSIVE",
            ],
        )
        self.assertTrue(issubclass(EvidenceConclusion, str))

    def test_enums_json_serializable(self) -> None:
        data = {
            "route": QualificationRoute.INNOVATION_CHALLENGE,
            "readiness": ReadinessStatus.PILOT_READY,
            "op_status": OperationalStatus.STOPPED,
            "conclusion": EvidenceConclusion.INCONCLUSIVE,
        }
        serialized = json.dumps(data)
        self.assertEqual(
            json.loads(serialized),
            {
                "route": "INNOVATION_CHALLENGE",
                "readiness": "PILOT_READY",
                "op_status": "STOPPED",
                "conclusion": "INCONCLUSIVE",
            },
        )


if __name__ == "__main__":
    unittest.main()
