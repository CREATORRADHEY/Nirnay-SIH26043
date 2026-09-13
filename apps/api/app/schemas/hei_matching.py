from datetime import datetime
import uuid
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field, model_validator


class HEICapabilityResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    organization_id: uuid.UUID
    capability_type: str
    name: str
    description: Optional[str] = None
    discipline: Optional[str] = None
    is_active: bool


class HEICandidateCreate(BaseModel):
    organization_id: uuid.UUID
    match_method: str = Field(..., min_length=1, max_length=50)
    rationale: str = Field(..., min_length=1)
    created_by_actor_id: Optional[uuid.UUID] = None

    @model_validator(mode="after")
    def validate_manual_match_actor(self) -> "HEICandidateCreate":
        if self.match_method.upper() == "MANUAL" and self.created_by_actor_id is None:
            raise ValueError("MANUAL match requires created_by_actor_id.")
        return self


class HEICandidateResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    challenge_id: uuid.UUID
    organization_id: uuid.UUID
    match_method: str
    rationale: str
    created_by_actor_id: Optional[uuid.UUID] = None
    created_at: datetime


class HEICandidateListResponse(BaseModel):
    items: List[HEICandidateResponse]
    total: int
