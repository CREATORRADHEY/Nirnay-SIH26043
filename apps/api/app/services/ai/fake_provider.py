import uuid
from typing import Any, Dict, List

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
from app.services.ai.sanitizer import AISanitizer


class FakeAIProvider(AIProvider):
    """Deterministic Mock AI Provider for Development and Automated Testing."""

    def extract_challenge(self, raw_text: str) -> ChallengeExtractionResponse:
        sanitized = AISanitizer.redact_pii(raw_text)
        is_adversarial = AISanitizer.is_adversarial_prompt(raw_text)
        
        if is_adversarial:
            return ChallengeExtractionResponse(
                is_available=True,
                suggested_title="Adversarial Text Flagged",
                suggested_summary="Input contained prohibited instructions. Cleaned content extracted safely.",
                suggested_domain="GENERAL",
                missing_information=["Valid non-adversarial problem description"],
            )

        title = "Solar Microgrid Storage and Battery Maintenance"
        if len(sanitized) > 10:
            words = sanitized.split()
            title = " ".join(words[:6]).title()

        return ChallengeExtractionResponse(
            is_available=True,
            suggested_title=title,
            suggested_summary=f"Extracted summary: {sanitized[:150]}...",
            suggested_domain="Clean Energy & Storage",
            affected_group_notes="Rural households in Netarhat plateau",
            frequency_notes="Daily power cuts during monsoon season",
            duration_notes="Ongoing for past 18 months",
            current_situation_notes="Villagers relying on diesel generator backups",
            missing_information=["Peak load requirement in kW", "Existing transformer capacity"],
            source_language="Hinglish",
        )

    def suggest_qualification(
        self,
        challenge_title: str,
        summary: str,
        description: str,
        evidence_notes: List[str],
    ) -> QualificationSuggestionResponse:
        route = QualificationRoute.INNOVATION_CHALLENGE
        if "clarify" in description.lower() or "missing" in summary.lower():
            route = QualificationRoute.CLARIFY

        return QualificationSuggestionResponse(
            is_available=True,
            suggested_route=route,
            reasoning_summary=f"Based on evidence analysis for '{challenge_title}', this problem involves R&D matching for storage technology.",
            evidence_considered=evidence_notes or ["Field inspection report", "Transformer capacity log"],
            missing_information=["Environmental clearance document"],
            limitations="AI suggestion based on text analysis. Human reviewer must create final QualificationDecision.",
        )

    def suggest_duplicates(
        self,
        challenge_title: str,
        description: str,
        existing_candidates: List[Dict[str, Any]],
    ) -> DuplicateSuggestionResponse:
        duplicates = []
        for cand in existing_candidates[:2]:
            duplicates.append(
                DuplicateCandidateItem(
                    challenge_id=uuid.UUID(str(cand["id"])),
                    title=cand.get("title", "Existing Challenge"),
                    similarity_reason=f"Matches location '{cand.get('district', 'Jharkhand')}' and domain '{cand.get('domain', 'Energy')}'",
                )
            )

        return DuplicateSuggestionResponse(
            is_available=True,
            possible_duplicates=duplicates,
        )

    def suggest_hei_candidates(
        self,
        challenge_title: str,
        description: str,
        domain: str,
        hei_capabilities: List[Dict[str, Any]],
    ) -> HEICandidateSuggestionResponse:
        suggestions = []
        for cap in hei_capabilities[:3]:
            org_id = cap.get("organization_id")
            if org_id:
                suggestions.append(
                    HEICandidateItem(
                        organization_id=uuid.UUID(str(org_id)),
                        organization_name=cap.get("name", "BIT Mesra"),
                        relevant_capabilities=[cap.get("name", "Battery Research Lab")],
                        relevance_explanation=f"High domain match for {domain} and R&D testing capabilities.",
                    )
                )

        return HEICandidateSuggestionResponse(
            is_available=True,
            suggested_candidates=suggestions,
        )

    def summarize_evidence(
        self,
        challenge_title: str,
        evidences: List[Dict[str, Any]],
    ) -> EvidenceSummaryResponse:
        evidence_ids = [str(e.get("id")) for e in evidences if e.get("id")]
        return EvidenceSummaryResponse(
            is_available=True,
            summary_text=f"Summary of {len(evidences)} evidence files submitted for '{challenge_title}'. Documents confirm field degradation.",
            source_evidence_ids_used=evidence_ids,
            missing_evidence=["Calibrated sensor logs"],
            uncertainties=["Long-term battery degradation rates in monsoon conditions"],
        )
