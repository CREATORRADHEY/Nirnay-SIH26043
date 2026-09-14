from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional
import uuid

from app.schemas.ai import (
    ChallengeExtractionResponse,
    DuplicateSuggestionResponse,
    EvidenceSummaryResponse,
    HEICandidateSuggestionResponse,
    QualificationSuggestionResponse,
)


class AIUnavailableException(Exception):
    """Exception raised when AI provider is disabled, unavailable, or timed out."""
    pass


class AIProvider(ABC):
    """Abstract Base Class for AI Assistance Providers.

    Enforces task-specific methods with strict Pydantic return schemas.
    AI services MUST NOT contain unrestricted generic chat methods.
    """

    @abstractmethod
    def extract_challenge(self, raw_text: str) -> ChallengeExtractionResponse:
        """Structures free-text English / Hindi / Hinglish problem description into candidate challenge fields."""
        pass

    @abstractmethod
    def suggest_qualification(
        self,
        challenge_title: str,
        summary: str,
        description: str,
        evidence_notes: List[str],
    ) -> QualificationSuggestionResponse:
        """Provides non-authoritative qualification route suggestion for Government Reviewer."""
        pass

    @abstractmethod
    def suggest_duplicates(
        self,
        challenge_title: str,
        description: str,
        existing_candidates: List[Dict[str, Any]],
    ) -> DuplicateSuggestionResponse:
        """Ranks and explains potential duplicate candidates from a bounded candidate set."""
        pass

    @abstractmethod
    def suggest_hei_candidates(
        self,
        challenge_title: str,
        description: str,
        domain: str,
        hei_capabilities: List[Dict[str, Any]],
    ) -> HEICandidateSuggestionResponse:
        """Suggests relevant HEI capabilities from a bounded set of registered active capabilities."""
        pass

    @abstractmethod
    def summarize_evidence(
        self,
        challenge_title: str,
        evidences: List[Dict[str, Any]],
    ) -> EvidenceSummaryResponse:
        """Provides an advisory summary of evidence metadata and approved text."""
        pass
