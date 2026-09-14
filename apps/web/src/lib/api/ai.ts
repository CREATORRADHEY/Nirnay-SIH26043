import {
  ChallengeExtractionResponse,
  QualificationSuggestionResponse,
  DuplicateSuggestionResponse,
  HEICandidateSuggestionResponse,
  EvidenceSummaryResponse,
} from "../types/ai";

function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
}

export async function extractChallengeWithAI(
  rawText: string
): Promise<{ data: ChallengeExtractionResponse; isDemo: boolean }> {
  try {
    const url = `${getApiBaseUrl()}/api/v1/ai/extract-challenge`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ raw_text: rawText }),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || `AI Extraction failed (${res.status})`);
    }
    const data: ChallengeExtractionResponse = await res.json();
    return { data, isDemo: false };
  } catch (err) {
    if (process.env.NEXT_PUBLIC_ENABLE_DEMO_FALLBACK !== "true") throw err;
    return {
      data: {
        suggested_title: "Clean Water Infrastructure Access Deficit",
        suggested_summary: rawText || "Water supply reliability issue reported in rural sector.",
        suggested_domain: "WATER_SANITATION",
        affected_group_notes: "Rural households without piped water supply",
        frequency_notes: "Daily seasonal disruption",
        duration_notes: "Last 6 months",
        current_situation_notes: "Tanker supply unreliable",
        missing_information: ["Specific GPS coordinates", "Water quality testing parameters"],
        source_language: "Hinglish",
      },
      isDemo: true,
    };
  }
}

export async function fetchQualificationSuggestion(
  challengeId: string
): Promise<{ data: QualificationSuggestionResponse; isDemo: boolean }> {
  try {
    const url = `${getApiBaseUrl()}/api/v1/ai/challenges/${challengeId}/qualification-suggestion`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || `AI Suggestion failed (${res.status})`);
    }
    const data: QualificationSuggestionResponse = await res.json();
    return { data, isDemo: false };
  } catch (err) {
    if (process.env.NEXT_PUBLIC_ENABLE_DEMO_FALLBACK !== "true") throw err;
    return {
      data: {
        suggested_route: "INNOVATION_CHALLENGE",
        reasoning_summary: "The problem presents non-standard technical requirements and decentralized scalability needs requiring HEI R&D collaboration.",
        evidence_considered: ["Citizen description text", "Field photo metadata"],
        missing_information: ["Technical pilot constraints", "Budget matching commitment"],
        limitations: "AI suggestion only — authoritative decision must be recorded by authorized Government Reviewer.",
      },
      isDemo: true,
    };
  }
}

export async function fetchDuplicateSuggestions(
  challengeId: string
): Promise<{ data: DuplicateSuggestionResponse; isDemo: boolean }> {
  try {
    const url = `${getApiBaseUrl()}/api/v1/ai/challenges/${challengeId}/duplicate-suggestion`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || `AI Duplicate check failed (${res.status})`);
    }
    const data: DuplicateSuggestionResponse = await res.json();
    return { data, isDemo: false };
  } catch (err) {
    if (process.env.NEXT_PUBLIC_ENABLE_DEMO_FALLBACK !== "true") throw err;
    return {
      data: {
        possible_duplicate_challenge_ids: [],
        duplicate_candidates: [],
        reasoning_summary: "No direct duplicates identified within active bounded challenge set.",
      },
      isDemo: true,
    };
  }
}

export async function fetchHEICandidateSuggestions(
  challengeId: string
): Promise<{ data: HEICandidateSuggestionResponse; isDemo: boolean }> {
  try {
    const url = `${getApiBaseUrl()}/api/v1/ai/challenges/${challengeId}/hei-candidate-suggestion`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || `AI HEI matching failed (${res.status})`);
    }
    const data: HEICandidateSuggestionResponse = await res.json();
    return { data, isDemo: false };
  } catch (err) {
    if (process.env.NEXT_PUBLIC_ENABLE_DEMO_FALLBACK !== "true") throw err;
    return {
      data: {
        suggested_candidates: [
          {
            organization_id: "org-hei-bit-mesra-001",
            organization_name: "BIT Mesra Department of Environmental Engineering",
            relevant_capabilities: ["Water Treatment R&D", "Sensor IoT Prototyping"],
            relevance_explanation: "BIT Mesra has active research capability in low-cost filtration technology.",
            limitations: "Requires human reviewer to officially add as candidate.",
          },
        ],
        reasoning_summary: "Matched active institutional capabilities against water innovation requirements.",
        limitations: "Advisory suggestion only. Candidate creation remains authoritative human action.",
      },
      isDemo: true,
    };
  }
}

export async function fetchEvidenceSummary(
  challengeId: string
): Promise<{ data: EvidenceSummaryResponse; isDemo: boolean }> {
  try {
    const url = `${getApiBaseUrl()}/api/v1/ai/challenges/${challengeId}/evidence-summary`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || `AI Evidence summary failed (${res.status})`);
    }
    const data: EvidenceSummaryResponse = await res.json();
    return { data, isDemo: false };
  } catch (err) {
    if (process.env.NEXT_PUBLIC_ENABLE_DEMO_FALLBACK !== "true") throw err;
    return {
      data: {
        summary: "Submitted evidence includes site photos and preliminary citizen description detailing seasonal water shortage.",
        source_evidence_ids: ["ev-001"],
        missing_evidence: ["Water quality lab report", "Piped network map"],
        uncertainties: ["Seasonal variance impact on pilot timeline"],
      },
      isDemo: true,
    };
  }
}
