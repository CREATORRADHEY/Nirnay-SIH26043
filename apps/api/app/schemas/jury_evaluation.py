"""Pydantic schemas for P5.4 Practical Jury Evaluation Workspace API."""

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class ScenarioOverviewSchema(BaseModel):
    scenario_id: str
    title: str
    subtitle: str
    question: str
    purpose: str
    starting_state: str
    actors_involved: List[str]
    estimated_steps: int
    verification_target: str
    challenge_id: str


class EngineeringProofSchema(BaseModel):
    contract_parity: str
    alembic_head: str
    backend_pytest_count: int
    frontend_unit_tests: int
    playwright_e2e_tests: int
    ai_authority_status: str
    verification_timestamp: str


class ChecklistItemSchema(BaseModel):
    id: str
    label: str
    satisfied: bool


class ScenarioStatusResponse(BaseModel):
    scenario_id: str
    title: str
    challenge_id: str
    result: str
    checklist: List[ChecklistItemSchema]
    inspected_records: Dict[str, Any]


class ScenarioResetResponse(BaseModel):
    scenario_id: str
    status: str
    challenge_id: str


class EvaluationReceiptResponse(BaseModel):
    receipt_id: str
    scenario_id: str
    title: str
    result: str
    environment: str
    executed_at: str
    checklist: List[ChecklistItemSchema]
    inspected_records: Dict[str, Any]
    verified_mechanisms: List[str]


class RoleSwitchRequest(BaseModel):
    role: str = Field(..., description="Role to activate: CITIZEN, GOVERNMENT, HEI, SENIOR_GOVERNMENT")


class RoleSwitchResponse(BaseModel):
    active_role: str
    display_name: str
    actor_id: str
    platform_role: str
