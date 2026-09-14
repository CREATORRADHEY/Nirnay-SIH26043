import uuid
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict


class ClarificationRequestCreate(BaseModel):
    question: str
    due_date: Optional[datetime] = None


class ClarificationResponseCreate(BaseModel):
    response: str


class ClarificationResponseResponse(BaseModel):
    id: uuid.UUID
    request_id: uuid.UUID
    response: str
    responded_by_actor_id: uuid.UUID
    responded_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ClarificationRequestResponse(BaseModel):
    id: uuid.UUID
    challenge_id: uuid.UUID
    question: str
    requested_by_actor_id: uuid.UUID
    status: str
    due_date: Optional[datetime] = None
    requested_at: datetime
    resolved_at: Optional[datetime] = None
    responses: List[ClarificationResponseResponse] = []

    model_config = ConfigDict(from_attributes=True)
