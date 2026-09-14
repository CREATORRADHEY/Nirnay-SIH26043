from datetime import datetime
import uuid
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field


class ChallengeCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    summary: str = Field(..., min_length=1)
    description: str = Field(..., min_length=1)
    domain: str = Field(..., min_length=1, max_length=100)
    source_type: str = Field(..., min_length=1, max_length=50)
    district: str = Field(..., min_length=1, max_length=100)
    state: str = Field(default="Jharkhand", min_length=1, max_length=100)
    submitted_by_actor_id: Optional[uuid.UUID] = None
    source_organization_id: Optional[uuid.UUID] = None


class ChallengeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    summary: str
    description: str
    domain: str
    source_type: str
    district: str
    state: str
    submitted_by_actor_id: Optional[uuid.UUID] = None
    source_organization_id: Optional[uuid.UUID] = None
    created_at: datetime
    updated_at: datetime


class ChallengeListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    summary: str
    domain: str
    source_type: str
    district: str
    state: str
    created_at: datetime


class ChallengeListResponse(BaseModel):
    items: List[ChallengeListItem]
    total: int
    limit: int
    offset: int
