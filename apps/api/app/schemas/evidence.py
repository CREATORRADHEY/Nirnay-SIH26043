from datetime import datetime
import uuid
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field


class EvidenceCreate(BaseModel):
    evidence_type: str = Field(..., min_length=1, max_length=50)
    storage_reference: str = Field(..., min_length=1, max_length=500)
    description: Optional[str] = None
    submitted_by_actor_id: Optional[uuid.UUID] = None
    captured_at: Optional[datetime] = None


class EvidenceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    challenge_id: uuid.UUID
    submitted_by_actor_id: Optional[uuid.UUID] = None
    evidence_type: str
    storage_reference: str
    description: Optional[str] = None
    captured_at: Optional[datetime] = None
    submitted_at: datetime


class EvidenceListResponse(BaseModel):
    items: List[EvidenceResponse]
    total: int
