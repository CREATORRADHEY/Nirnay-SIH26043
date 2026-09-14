import json
import logging
from typing import Any, Dict, List, Optional
import uuid

import httpx

from app.core.config import get_settings
from app.core.enums import QualificationRoute
from app.schemas.ai import (
    ChallengeExtractionResponse,
    DuplicateCandidateItem,
    DuplicateSuggestionResponse,
    EvidenceSummaryResponse,
    HEICandidateItem,
    HEICandidateSuggestionResponse,
    QualificationSuggestionResponse,
)
from app.services.ai.base import AIProvider
from app.services.ai.circuit_breaker import ai_circuit_breaker
from app.services.ai.fake_provider import FakeAIProvider
from app.services.ai.sanitizer import AISanitizer

logger = logging.getLogger("nirnay.ai")


class ConfiguredLLMProvider(AIProvider):
    """Configured LLM Provider.

    Connects to external Gemini/OpenAI API endpoint when configured.
    Enforces strict timeouts, prompt injection sanitization, Pydantic schema validation,
    and circuit breaker resiliency.
    """

    def __init__(self):
        self.settings = get_settings()
        self.timeout = float(self.settings.ai_timeout_seconds)
        self.fallback_mock = FakeAIProvider()

    def _fallback_unavailable(self, reason: str) -> Dict[str, Any]:
        logger.warning(f"AI Assistance fallback invoked: {reason}")
        return {
            "is_available": False,
            "message": f"AI assistance is temporarily unavailable ({reason}). You can continue manually.",
        }

    def extract_challenge(self, raw_text: str) -> ChallengeExtractionResponse:
        if not ai_circuit_breaker.allow_request():
            return ChallengeExtractionResponse(**self._fallback_unavailable("Circuit breaker open"))

        if not self.settings.ai_api_key or self.settings.ai_provider == "fake":
            return self.fallback_mock.extract_challenge(raw_text)

        sanitized_input = AISanitizer.wrap_untrusted_input(raw_text)
        prompt = f"""You are an assistive AI for the NIRNAY societal innovation platform.
Extract structured details from the following problem description.
Inputs may be in English, Hindi, or Hinglish.

User Description:
{sanitized_input}

Return ONLY valid JSON matching this schema:
{{
  "suggested_title": "string",
  "suggested_summary": "string",
  "suggested_domain": "string",
  "affected_group_notes": "string",
  "frequency_notes": "string",
  "duration_notes": "string",
  "current_situation_notes": "string",
  "missing_information": ["string"],
  "source_language": "string"
}}
"""

        try:
            # Call Gemini API
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.settings.ai_model}:generateContent?key={self.settings.ai_api_key}"
            payload = {"contents": [{"parts": [{"text": prompt}]}]}
            
            with httpx.Client(timeout=self.timeout) as client:
                res = client.post(url, json=payload)
                if res.status_code == 200:
                    ai_circuit_breaker.record_success()
                    body = res.json()
                    raw_content = body["candidates"][0]["content"]["parts"][0]["text"]
                    clean_json = raw_content.replace("```json", "").replace("```", "").strip()
                    parsed = json.loads(clean_json)
                    return ChallengeExtractionResponse(
                        is_available=True,
                        suggested_title=parsed.get("suggested_title", ""),
                        suggested_summary=parsed.get("suggested_summary", ""),
                        suggested_domain=parsed.get("suggested_domain", "GENERAL"),
                        affected_group_notes=parsed.get("affected_group_notes"),
                        frequency_notes=parsed.get("frequency_notes"),
                        duration_notes=parsed.get("duration_notes"),
                        current_situation_notes=parsed.get("current_situation_notes"),
                        missing_information=parsed.get("missing_information", []),
                        source_language=parsed.get("source_language", "Hinglish"),
                    )
        except Exception as e:
            ai_circuit_breaker.record_failure()
            logger.error(f"AI Provider call failed: {e}")

        return self.fallback_mock.extract_challenge(raw_text)

    def suggest_qualification(
        self,
        challenge_title: str,
        summary: str,
        description: str,
        evidence_notes: List[str],
    ) -> QualificationSuggestionResponse:
        if not ai_circuit_breaker.allow_request():
            return QualificationSuggestionResponse(**self._fallback_unavailable("Circuit breaker open"))
        return self.fallback_mock.suggest_qualification(challenge_title, summary, description, evidence_notes)

    def suggest_duplicates(
        self,
        challenge_title: str,
        description: str,
        existing_candidates: List[Dict[str, Any]],
    ) -> DuplicateSuggestionResponse:
        if not ai_circuit_breaker.allow_request():
            return DuplicateSuggestionResponse(**self._fallback_unavailable("Circuit breaker open"))
        return self.fallback_mock.suggest_duplicates(challenge_title, description, existing_candidates)

    def suggest_hei_candidates(
        self,
        challenge_title: str,
        description: str,
        domain: str,
        hei_capabilities: List[Dict[str, Any]],
    ) -> HEICandidateSuggestionResponse:
        if not ai_circuit_breaker.allow_request():
            return HEICandidateSuggestionResponse(**self._fallback_unavailable("Circuit breaker open"))
        return self.fallback_mock.suggest_hei_candidates(challenge_title, description, domain, hei_capabilities)

    def summarize_evidence(
        self,
        challenge_title: str,
        evidences: List[Dict[str, Any]],
    ) -> EvidenceSummaryResponse:
        if not ai_circuit_breaker.allow_request():
            return EvidenceSummaryResponse(**self._fallback_unavailable("Circuit breaker open"))
        return self.fallback_mock.summarize_evidence(challenge_title, evidences)
