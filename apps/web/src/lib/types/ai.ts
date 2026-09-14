export interface ChallengeExtractionResponse {
  suggested_title: string;
  suggested_summary: string;
  suggested_domain?: string | null;
  affected_group_notes?: string | null;
  frequency_notes?: string | null;
  duration_notes?: string | null;
  current_situation_notes?: string | null;
  missing_information: string[];
  source_language: string;
}

export interface QualificationSuggestionResponse {
  suggested_route: "SERVICE" | "CLARIFY" | "RESEARCH_REVIEW" | "INNOVATION_CHALLENGE";
  reasoning_summary: string;
  evidence_considered: string[];
  missing_information: string[];
  limitations: string;
}

export interface DuplicateCandidate {
  challenge_id: string;
  title: string;
  explanation: string;
}

export interface DuplicateSuggestionResponse {
  possible_duplicate_challenge_ids: string[];
  duplicate_candidates: DuplicateCandidate[];
  reasoning_summary: string;
}

export interface HEICandidateSuggestion {
  organization_id: string;
  organization_name?: string | null;
  relevant_capabilities: string[];
  relevance_explanation: string;
  limitations?: string | null;
}

export interface HEICandidateSuggestionResponse {
  suggested_candidates: HEICandidateSuggestion[];
  reasoning_summary: string;
  limitations: string;
}

export interface EvidenceSummaryResponse {
  summary: string;
  source_evidence_ids: string[];
  missing_evidence: string[];
  uncertainties: string[];
}
