import uuid
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field

from app.core.enums import QualificationRoute


class AIResponseBase(BaseModel):
    is_available: bool = True
    message: Optional[str] = None
    disclaimer: str = Field(
        default="AI advisory suggestion only. Non-authoritative; human decision remains final."
    )


class ChallengeExtractionRequest(BaseModel):
    raw_text: str = Field(..., min_length=1, max_length=10000)


class ChallengeExtractionResponse(AIResponseBase):
    suggested_title: str = Field(default="")
    suggested_summary: str = Field(default="")
    suggested_domain: str = Field(default="GENERAL")
    affected_group_notes: Optional[str] = None
    frequency_notes: Optional[str] = None
    duration_notes: Optional[str] = None
    current_situation_notes: Optional[str] = None
    missing_information: List[str] = Field(default_factory=list)
    source_language: str = Field(default="English / Hinglish")


class QualificationSuggestionRequest(BaseModel):
    challenge_id: uuid.UUID


class QualificationSuggestionResponse(AIResponseBase):
    suggested_route: Optional[QualificationRoute] = None
    reasoning_summary: str = Field(default="")
    evidence_considered: List[str] = Field(default_factory=list)
    missing_information: List[str] = Field(default_factory=list)
    limitations: str = Field(
        default="AI suggestion based on current challenge text and evidence metadata."
    )


class DuplicateCandidateItem(BaseModel):
    challenge_id: uuid.UUID
    title: str
    similarity_reason: str


class DuplicateSuggestionResponse(AIResponseBase):
    possible_duplicates: List[DuplicateCandidateItem] = Field(default_factory=list)


class HEICandidateItem(BaseModel):
    organization_id: uuid.UUID
    organization_name: str
    relevant_capabilities: List[str] = Field(default_factory=list)
    relevance_explanation: str


class HEICandidateSuggestionResponse(AIResponseBase):
    suggested_candidates: List[HEICandidateItem] = Field(default_factory=list)
    limitations: str = Field(
        default="Suggestions derived strictly from registered HEI active capabilities."
    )


class EvidenceSummaryResponse(AIResponseBase):
    summary_text: str = Field(default="")
    source_evidence_ids_used: List[str] = Field(default_factory=list)
    missing_evidence: List[str] = Field(default_factory=list)
    uncertainties: List[str] = Field(default_factory=list)
