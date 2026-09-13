from datetime import datetime
import uuid
from typing import Any, List, Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.core.enums import ConditionStatus, ReadinessStatus


class ReadinessConditionCreate(BaseModel):
    condition_key: str = Field(..., min_length=1, max_length=100)
    status: ConditionStatus
    rationale: str = Field(..., min_length=1)
    assessed_by_actor_id: uuid.UUID
    valid_until: Optional[datetime] = None
    commitment_dependency_ids: List[uuid.UUID] = Field(default_factory=list)
    expected_version: int = Field(..., ge=0)


class ReadinessConditionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    challenge_id: uuid.UUID
    condition_key: str
    status: ConditionStatus
    version: int
    rationale: str
    assessed_by_actor_id: uuid.UUID
    valid_until: Optional[datetime] = None
    assessed_at: datetime
    commitment_dependency_ids: List[uuid.UUID] = Field(default_factory=list)

    @field_validator("commitment_dependency_ids", mode="before")
    @classmethod
    def extract_commitment_dependency_ids(cls, v: Any) -> Any:
        if isinstance(v, list) and v:
            extracted = []
            for item in v:
                if hasattr(item, "id"):
                    extracted.append(item.id)
                elif hasattr(item, "commitment_id"):
                    extracted.append(item.commitment_id)
                else:
                    extracted.append(item)
            return extracted
        return v if v is not None else []


class ReadinessConditionListResponse(BaseModel):
    items: List[ReadinessConditionResponse]
    total: int


class ReadinessDecisionCreate(BaseModel):
    status: ReadinessStatus
    rationale: str = Field(..., min_length=1)
    decided_by_actor_id: uuid.UUID
    condition_ids: List[uuid.UUID] = Field(default_factory=list)
    expected_version: int = Field(..., ge=0)

    @field_validator("status")
    @classmethod
    def validate_human_status(cls, v: ReadinessStatus) -> ReadinessStatus:
        if v == ReadinessStatus.REVIEW_REQUIRED:
            raise ValueError("REVIEW_REQUIRED status cannot be manually set by client API.")
        return v


class ReadinessDecisionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    challenge_id: uuid.UUID
    status: ReadinessStatus
    version: int
    rationale: str
    decided_by_actor_id: Optional[uuid.UUID] = None
    created_at: datetime
    triggered_by_commitment_id: Optional[uuid.UUID] = None
    condition_ids: List[uuid.UUID] = Field(default_factory=list)

    @field_validator("condition_ids", mode="before")
    @classmethod
    def extract_condition_ids(cls, v: Any) -> Any:
        if isinstance(v, list) and v:
            extracted = []
            for item in v:
                if hasattr(item, "id"):
                    extracted.append(item.id)
                elif hasattr(item, "readiness_condition_id"):
                    extracted.append(item.readiness_condition_id)
                else:
                    extracted.append(item)
            return extracted
        return v if v is not None else []


class ReadinessDecisionHistoryResponse(BaseModel):
    items: List[ReadinessDecisionResponse]
    total: int
