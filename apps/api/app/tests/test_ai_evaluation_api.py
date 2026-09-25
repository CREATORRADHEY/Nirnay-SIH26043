"""Unit & Integration Tests for AI Evaluation Workspace API (/api/v1/evaluation/ai)."""

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
from app.services.ai_evaluation_service import AIEvaluationService


class TestAIEvaluationAPI(unittest.TestCase):
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
        settings = get_settings()
        settings.ai_enabled = True
        settings.ai_provider = "fake"

    def tearDown(self):
        self.db.close()
        Base.metadata.drop_all(self.engine)
        app.dependency_overrides.clear()

    def test_get_dataset_returns_30_synthetic_cases(self):
        res = self.client.get("/api/v1/evaluation/ai/dataset")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIsInstance(data, list)
        self.assertEqual(len(data), 30, "Evaluation dataset must contain exactly 30 cases!")

    def test_run_evaluation_suite_ai_enabled(self):
        res = self.client.post("/api/v1/evaluation/ai/run?ai_enabled=true")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("metrics", data)
        self.assertIn("cases", data)

        metrics = data["metrics"]
        self.assertEqual(metrics["dataset_size"], 30)
        self.assertTrue(metrics["ai_enabled"])
        self.assertGreaterEqual(metrics["human_human_agreement"]["numerator"], 0)
        self.assertGreaterEqual(metrics["ai_human_agreement"]["numerator"], 0)
        self.assertEqual(metrics["manual_workflow_completion_rate"]["percentage"], 100.0)

    def test_run_evaluation_suite_ai_disabled(self):
        res = self.client.post("/api/v1/evaluation/ai/run?ai_enabled=false")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        metrics = data["metrics"]
        self.assertFalse(metrics["ai_enabled"])
        self.assertEqual(metrics["ai_off_workflow_completion_rate"]["percentage"], 100.0)
        self.assertEqual(metrics["ai_failure_rate"]["percentage"], 100.0)

    def test_review_synthetic_case(self):
        payload = {
            "reviewer_id": "REVIEWER_A",
            "selected_route": "INNOVATION_CHALLENGE",
            "notes": "Updated dual-review route",
        }
        res = self.client.post("/api/v1/evaluation/ai/cases/CASE-001/review", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["case_id"], "CASE-001")
