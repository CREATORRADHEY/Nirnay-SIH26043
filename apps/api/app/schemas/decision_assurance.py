from datetime import datetime
import uuid
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field, field_validator


INVALID_RATIONALES = {"ok", "yes", "approved", "looks good", "lgtm", "done", "test", "none"}


class DecisionAssuranceCreate(BaseModel):
    decision_type: str = Field(..., description="QUALIFICATION, READINESS, OUTCOME")
    authoritative_decision_id: uuid.UUID
    rubric_version: str = Field(default="v1")
    rubric_answers: Dict[str, Any] = Field(default_factory=dict)
    evidence_ids: List[uuid.UUID] = Field(default_factory=list)
    rationale: str = Field(..., min_length=10)
    limitations_note: Optional[str] = None
    ai_advisory_snapshot: Optional[Dict[str, Any]] = None
    conflict_declared: str = Field(default="NO_KNOWN_CONFLICT")

    @field_validator("rationale")
    @classmethod
    def validate_meaningful_rationale(cls, v: str) -> str:
        clean = v.strip().lower()
        if clean in INVALID_RATIONALES or len(clean) < 10 or len(clean.split()) < 3:
            raise ValueError(
                "Authoritative rationale must provide a meaningful explanation (at least 3 words and 10 characters)."
            )
        return v.strip()


class SecondReviewCreate(BaseModel):
    rationale: str = Field(..., min_length=10)
    decision: str = Field(..., min_length=1)

    @field_validator("rationale")
    @classmethod
    def validate_meaningful_rationale(cls, v: str) -> str:
        clean = v.strip().lower()
        if clean in INVALID_RATIONALES or len(clean) < 10 or len(clean.split()) < 3:
            raise ValueError(
                "Second review rationale must provide a meaningful explanation."
            )
        return v.strip()


class DisagreementResolutionCreate(BaseModel):
    resolution_rationale: str = Field(..., min_length=10)
    final_decision: str = Field(..., min_length=1)

    @field_validator("resolution_rationale")
    @classmethod
    def validate_meaningful_rationale(cls, v: str) -> str:
        clean = v.strip().lower()
        if clean in INVALID_RATIONALES or len(clean) < 10 or len(clean.split()) < 3:
            raise ValueError(
                "Resolution rationale must provide a meaningful explanation."
            )
        return v.strip()


class DecisionReviewRequestCreate(BaseModel):
    reason: str = Field(..., min_length=10)
    evidence_id: Optional[uuid.UUID] = None

    @field_validator("reason")
    @classmethod
    def validate_meaningful_reason(cls, v: str) -> str:
        clean = v.strip().lower()
        if clean in INVALID_RATIONALES or len(clean) < 10 or len(clean.split()) < 3:
            raise ValueError("Review request reason must be meaningful (at least 3 words).")
        return v.strip()


class DecisionAssuranceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    challenge_id: uuid.UUID
    decision_type: str
    authoritative_decision_id: uuid.UUID
    reviewer_actor_id: uuid.UUID
    reviewer_organization_id: Optional[uuid.UUID] = None
    rubric_version: str
    rubric_answers: Dict[str, Any]
    evidence_ids: List[uuid.UUID] = Field(default_factory=list)
    rationale: str
    limitations_note: Optional[str] = None
    ai_advisory_snapshot: Optional[Dict[str, Any]] = None
    ai_agreement_status: str
    conflict_declared: str
    second_review_required: bool
    second_review_reason: Optional[str] = None
    review_status: str
    second_reviewer_actor_id: Optional[uuid.UUID] = None
    second_review_rationale: Optional[str] = None
    second_review_decision: Optional[str] = None
    disagreement_resolved_by_actor_id: Optional[uuid.UUID] = None
    resolution_rationale: Optional[str] = None
    created_at: datetime
    superseded_at: Optional[datetime] = None

    @field_validator("evidence_ids", mode="before")
    @classmethod
    def extract_evidence_ids(cls, v: Any) -> Any:
        if isinstance(v, list):
            extracted = []
            for item in v:
                if isinstance(item, str):
                    try:
                        extracted.append(uuid.UUID(item))
                    except ValueError:
                        pass
                elif isinstance(item, uuid.UUID):
                    extracted.append(item)
            return extracted
        return []


class DecisionReviewRequestResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    challenge_id: uuid.UUID
    assurance_record_id: uuid.UUID
    requested_by_actor_id: uuid.UUID
    reason: str
    evidence_id: Optional[uuid.UUID] = None
    status: str
    created_at: datetime
