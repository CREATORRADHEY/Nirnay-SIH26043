from typing import Any, Dict, List

from app.schemas.ai import (
    ChallengeExtractionResponse,
    DuplicateSuggestionResponse,
    EvidenceSummaryResponse,
    HEICandidateSuggestionResponse,
    QualificationSuggestionResponse,
)
from app.services.ai.base import AIProvider


class DisabledAIProvider(AIProvider):
    """Disabled AI Provider Implementation.

    Used when AI_ENABLED=false or AI_PROVIDER=disabled.
    Returns safe structured non-authoritative fallback responses without throwing HTTP errors.
    """

    def _unavailable_msg(self) -> str:
        return "AI assistance is disabled or unavailable. Core NIRNAY workflows remain fully functional."

    def extract_challenge(self, raw_text: str) -> ChallengeExtractionResponse:
        return ChallengeExtractionResponse(
            is_available=False,
            message=self._unavailable_msg(),
            suggested_title="",
            suggested_summary=raw_text[:200] if raw_text else "",
            suggested_domain="GENERAL",
        )

    def suggest_qualification(
        self,
        challenge_title: str,
        summary: str,
        description: str,
        evidence_notes: List[str],
    ) -> QualificationSuggestionResponse:
        return QualificationSuggestionResponse(
            is_available=False,
            message=self._unavailable_msg(),
            reasoning_summary="AI route suggestion is disabled. Please select qualification route manually.",
        )

    def suggest_duplicates(
        self,
        challenge_title: str,
        description: str,
        existing_candidates: List[Dict[str, Any]],
    ) -> DuplicateSuggestionResponse:
        return DuplicateSuggestionResponse(
            is_available=False,
            message=self._unavailable_msg(),
            possible_duplicates=[],
        )

    def suggest_hei_candidates(
        self,
        challenge_title: str,
        description: str,
        domain: str,
        hei_capabilities: List[Dict[str, Any]],
    ) -> HEICandidateSuggestionResponse:
        return HEICandidateSuggestionResponse(
            is_available=False,
            message=self._unavailable_msg(),
            suggested_candidates=[],
        )

    def summarize_evidence(
        self,
        challenge_title: str,
        evidences: List[Dict[str, Any]],
    ) -> EvidenceSummaryResponse:
        return EvidenceSummaryResponse(
            is_available=False,
            message=self._unavailable_msg(),
            summary_text="AI evidence summarization is disabled.",
        )
