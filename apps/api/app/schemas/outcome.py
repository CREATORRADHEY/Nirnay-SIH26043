from datetime import datetime
import uuid
from typing import Any, List, Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

from app.core.enums import EvidenceConclusion


class OutcomeAssessmentCreate(BaseModel):
    evidence_plan_id: uuid.UUID
    conclusion: EvidenceConclusion
    summary: str = Field(..., min_length=1)
    limitations: Optional[str] = None
    assessed_by_actor_id: Optional[uuid.UUID] = None
    evidence_ids: List[uuid.UUID] = Field(default_factory=list)
    expected_version: int = Field(..., ge=0)

    @model_validator(mode="after")
    def validate_human_attribution(self) -> "OutcomeAssessmentCreate":
        if self.conclusion != EvidenceConclusion.NOT_REVIEWED and self.assessed_by_actor_id is None:
            raise ValueError(f"Conclusion {self.conclusion.value} requires human actor attribution (assessed_by_actor_id).")
        return self


class OutcomeAssessmentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    pilot_id: uuid.UUID
    evidence_plan_id: uuid.UUID
    version: int
    conclusion: EvidenceConclusion
    summary: str
    limitations: Optional[str] = None
    assessed_by_actor_id: Optional[uuid.UUID] = None
    assessed_at: datetime
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


class OutcomeAssessmentHistoryResponse(BaseModel):
    items: List[OutcomeAssessmentResponse]
    total: int
