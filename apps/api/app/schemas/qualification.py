from datetime import datetime
import uuid
from typing import Any, List, Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.core.enums import QualificationRoute


class QualificationDecisionCreate(BaseModel):
    route: QualificationRoute
    rationale: str = Field(..., min_length=1)
    decided_by_actor_id: uuid.UUID
    evidence_ids: List[uuid.UUID] = Field(default_factory=list)


class QualificationDecisionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    challenge_id: uuid.UUID
    route: QualificationRoute
    version: int
    rationale: str
    decided_by_actor_id: uuid.UUID
    decided_at: datetime
    evidence_ids: List[uuid.UUID] = Field(default_factory=list)

    @field_validator("evidence_ids", mode="before")
    @classmethod
    def extract_evidence_ids(cls, v: Any) -> Any:
        if isinstance(v, list) and v:
            extracted = []
            for item in v:
                if hasattr(item, "id"):
                    extracted.append(item.id)
                elif hasattr(item, "evidence_id"):
                    extracted.append(item.evidence_id)
                else:
                    extracted.append(item)
            return extracted
        return v if v is not None else []


class QualificationHistoryResponse(BaseModel):
    items: List[QualificationDecisionResponse]
    total: int
