"""Pydantic schemas for P5.3 AI Evaluation API."""

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class MetricAttribution(BaseModel):
    numerator: int
    denominator: int
    percentage: float


class TimeMetric(BaseModel):
    with_ai: float
    without_ai: float
    time_saved_percentage: float


class EvaluationMetricsSchema(BaseModel):
    dataset_size: int
    ai_enabled: bool
    human_human_agreement: MetricAttribution
    ai_human_agreement: MetricAttribution
    ai_adjudicated_reference_agreement: MetricAttribution
    escalation_rate: MetricAttribution
    ai_failure_rate: MetricAttribution
    schema_rejection_rate: MetricAttribution
    unknown_candidate_rejection_rate: MetricAttribution
    manual_workflow_completion_rate: MetricAttribution
    ai_off_workflow_completion_rate: MetricAttribution
    measured_median_review_time_minutes: TimeMetric
    ai_override_rate: MetricAttribution


class AgreementMatrix(BaseModel):
    reviewer_a_vs_b: str
    ai_vs_reviewer_a: str
    ai_vs_reviewer_b: str
    ai_vs_reference: str


class CaseResultSchema(BaseModel):
    case_id: str
    title: str
    domain: str
    district: str
    reviewer_a_route: str
    reviewer_b_route: str
    human_reference_route: str
    ai_suggested_route: Optional[str] = None
    ambiguity_flag: bool
    matrix: AgreementMatrix


class EvaluationRunResponse(BaseModel):
    metrics: EvaluationMetricsSchema
    cases: List[CaseResultSchema]


class ReviewCaseRequest(BaseModel):
    reviewer_id: str
    selected_route: str
    notes: Optional[str] = None
