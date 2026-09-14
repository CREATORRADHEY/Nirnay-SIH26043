from datetime import datetime
import uuid
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field

from app.core.enums import OperationalStatus


class PilotCreate(BaseModel):
    authorized_by_readiness_decision_id: uuid.UUID
    host_organization_id: Optional[uuid.UUID] = None
    name: str = Field(..., min_length=1, max_length=255)
    site_description: Optional[str] = None
    planned_start: Optional[datetime] = None
    planned_end: Optional[datetime] = None
    created_by_actor_id: uuid.UUID


class PilotResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    challenge_id: uuid.UUID
    authorized_by_readiness_decision_id: uuid.UUID
    host_organization_id: Optional[uuid.UUID] = None
    name: str
    site_description: Optional[str] = None
    planned_start: Optional[datetime] = None
    planned_end: Optional[datetime] = None
    created_by_actor_id: uuid.UUID
    created_at: datetime


class PilotListResponse(BaseModel):
    items: List[PilotResponse]
    total: int


class PilotOperationalStateCreate(BaseModel):
    status: OperationalStatus
    rationale: str = Field(..., min_length=1)
    recorded_by_actor_id: uuid.UUID
    expected_version: int = Field(..., ge=0)


class PilotOperationalStateResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    pilot_id: uuid.UUID
    status: OperationalStatus
    version: int
    rationale: str
    recorded_by_actor_id: uuid.UUID
    recorded_at: datetime


class PilotOperationalHistoryResponse(BaseModel):
    items: List[PilotOperationalStateResponse]
    total: int


class PilotEvidencePlanCreate(BaseModel):
    objective: str = Field(..., min_length=1)
    primary_metric: str = Field(..., min_length=1)
    baseline_definition: str = Field(..., min_length=1)
    denominator_definition: str = Field(..., min_length=1)
    data_collection_method: str = Field(..., min_length=1)
    evaluation_window: Optional[str] = None
    success_criteria: Optional[str] = None
    limitations: Optional[str] = None
    created_by_actor_id: uuid.UUID
    expected_version: int = Field(..., ge=0)


class PilotEvidencePlanResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    pilot_id: uuid.UUID
    version: int
    objective: str
    primary_metric: str
    baseline_definition: str
    denominator_definition: str
    data_collection_method: str
    evaluation_window: Optional[str] = None
    success_criteria: Optional[str] = None
    limitations: Optional[str] = None
    created_by_actor_id: uuid.UUID
    created_at: datetime


class PilotEvidencePlanHistoryResponse(BaseModel):
    items: List[PilotEvidencePlanResponse]
    total: int
