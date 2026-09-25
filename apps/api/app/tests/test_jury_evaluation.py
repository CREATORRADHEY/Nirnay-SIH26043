"""Unit & Integration Tests for Practical Jury Evaluation Workspace API (/api/v1/evaluation/scenarios)."""

import unittest
from starlette.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.core.config import get_settings
from app.core.database import get_db
from app.models.base import Base
from app.models.actor import Actor
from app.core.enums import PlatformRole


class TestJuryEvaluationAPI(unittest.TestCase):
    def setUp(self):
        self.engine = create_engine(
            "sqlite:///:memory:",
            connect_args={"check_same_thread": False},
            poolclass=StaticPool,
        )
        Base.metadata.create_all(self.engine)
        self.SessionLocal = sessionmaker(bind=self.engine)
        self.db: Session = self.SessionLocal()

        def override_get_db():
            try:
                yield self.db
            finally:
                pass

        app.dependency_overrides[get_db] = override_get_db
        self.client = TestClient(app)

        get_settings.cache_clear()

    def tearDown(self):
        self.db.close()
        Base.metadata.drop_all(self.engine)
        app.dependency_overrides.clear()

    def test_get_scenarios_overview_returns_4_scenarios(self):
        res = self.client.get("/api/v1/evaluation/scenarios")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(len(data), 4, "Must expose exactly 4 core evaluation scenarios!")
        scenario_ids = [s["scenario_id"] for s in data]
        self.assertIn("SCENARIO-01", scenario_ids)
        self.assertIn("SCENARIO-02", scenario_ids)
        self.assertIn("SCENARIO-03", scenario_ids)
        self.assertIn("SCENARIO-04", scenario_ids)

    def test_engineering_proof_endpoint(self):
        res = self.client.get("/api/v1/evaluation/scenarios/proof")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["contract_parity"], "PASS")
        self.assertEqual(data["alembic_head"], "013_decision_assurance")
        self.assertIn("Advisory Only", data["ai_authority_status"])

    def test_scenario_status_and_reset(self):
        # Reset Scenario 03
        reset_res = self.client.post("/api/v1/evaluation/scenarios/SCENARIO-03/reset")
        self.assertEqual(reset_res.status_code, 200)
        self.assertEqual(reset_res.json()["status"], "RESET_SUCCESS")

        # Query live status
        status_res = self.client.get("/api/v1/evaluation/scenarios/SCENARIO-03/status")
        self.assertEqual(status_res.status_code, 200)
        data = status_res.json()
        self.assertEqual(data["scenario_id"], "SCENARIO-03")
        self.assertIn("checklist", data)
        self.assertIn("inspected_records", data)

    def test_scenario_receipt_generation(self):
        res = self.client.get("/api/v1/evaluation/scenarios/SCENARIO-03/receipt")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("RECEIPT-", data["receipt_id"])
        self.assertEqual(data["environment"], "CONTROLLED SYNTHETIC EVALUATION ENVIRONMENT")
        self.assertIsInstance(data["verified_mechanisms"], list)

    def test_safe_role_switch(self):
        payload = {"role": "HEI"}
        res = self.client.post("/api/v1/evaluation/scenarios/role-switch", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["active_role"], "HEI")
        self.assertEqual(data["platform_role"], "HEI_REVIEWER")
