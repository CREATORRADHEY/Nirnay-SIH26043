#!/usr/bin/env python3
import json
import re
import sys
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
CANONICAL_PATH = ROOT_DIR / "packages" / "contracts" / "domain-states.json"
PYTHON_ENUMS_PATH = ROOT_DIR / "apps" / "api" / "app" / "core" / "enums.py"
TS_CONTRACT_PATH = (
    ROOT_DIR / "apps" / "web" / "src" / "lib" / "contracts" / "domain-states.ts"
)

TS_NAME_MAP = {
    "QualificationRoute": "QUALIFICATION_ROUTES",
    "CommitmentStatus": "COMMITMENT_STATUSES",
    "ConditionStatus": "CONDITION_STATUSES",
    "ReadinessStatus": "READINESS_STATUSES",
    "OperationalStatus": "OPERATIONAL_STATUSES",
    "EvidenceConclusion": "EVIDENCE_CONCLUSIONS",
}


def check_contracts() -> None:
    errors = []

    if not CANONICAL_PATH.exists():
        print(f"ERROR: Canonical contract file missing at {CANONICAL_PATH}")
        sys.exit(1)

    with open(CANONICAL_PATH, "r", encoding="utf-8") as f:
        canonical = json.load(f)

    # 1. Validate Python Enums
    sys.path.insert(0, str(ROOT_DIR / "apps" / "api"))
    try:
        import app.core.enums as py_enums
    except Exception as e:
        errors.append(f"Failed to import Python enums from app.core.enums: {e}")
        py_enums = None

    if py_enums:
        for enum_name, expected_values in canonical.items():
            if not hasattr(py_enums, enum_name):
                errors.append(f"Python enum '{enum_name}' missing in app/core/enums.py")
                continue

            enum_cls = getattr(py_enums, enum_name)
            actual_values = [item.value for item in enum_cls]

            if actual_values != expected_values:
                errors.append(
                    f"Python enum '{enum_name}' value mismatch:\n"
                    f"  Canonical: {expected_values}\n"
                    f"  Python:    {actual_values}"
                )

    # 2. Validate TypeScript Contract
    if not TS_CONTRACT_PATH.exists():
        errors.append(f"TypeScript contract file missing at {TS_CONTRACT_PATH}")
    else:
        ts_content = TS_CONTRACT_PATH.read_text(encoding="utf-8")

        for enum_name, expected_values in canonical.items():
            ts_array_name = TS_NAME_MAP.get(enum_name)
            if not ts_array_name:
                errors.append(f"No TS array mapping defined for '{enum_name}'")
                continue

            pattern = rf"export\s+const\s+{ts_array_name}\s*=\s*\[(.*?)\]\s*as\s+const;"
            match = re.search(pattern, ts_content, re.DOTALL)
            if not match:
                errors.append(
                    f"TypeScript array '{ts_array_name}' missing or malformed in domain-states.ts"
                )
                continue

            array_body = match.group(1)
            actual_values = re.findall(r'["\']([^"\']+)["\']', array_body)

            if actual_values != expected_values:
                errors.append(
                    f"TypeScript array '{ts_array_name}' value mismatch:\n"
                    f"  Canonical:  {expected_values}\n"
                    f"  TypeScript: {actual_values}"
                )

    if errors:
        print("NIRNAY contract parity: FAIL")
        for err in errors:
            print(f" - {err}")
        sys.exit(1)

    print("NIRNAY contract parity: PASS")


if __name__ == "__main__":
    check_contracts()
