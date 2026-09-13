from datetime import datetime
import uuid
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field

from app.core.enums import CommitmentStatus


class CommitmentCreate(BaseModel):
    organization_id: uuid.UUID
    commitment_type: str = Field(..., min_length=1, max_length=100)
    status: CommitmentStatus
    scope_description: str = Field(..., min_length=1)
    recorded_by_actor_id: uuid.UUID
    valid_from: Optional[datetime] = None
    valid_until: Optional[datetime] = None
    expected_version: int = Field(..., ge=0)


class CommitmentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    challenge_id: uuid.UUID
    organization_id: uuid.UUID
    commitment_type: str
    status: CommitmentStatus
    version: int
    scope_description: str
    recorded_by_actor_id: uuid.UUID
    valid_from: Optional[datetime] = None
    valid_until: Optional[datetime] = None
    created_at: datetime


class CommitmentHistoryResponse(BaseModel):
    items: List[CommitmentResponse]
    total: int
