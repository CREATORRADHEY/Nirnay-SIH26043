export interface ChallengeListItem {
  id: string;
  title: string;
  summary: string;
  domain: string;
  source_type: string;
  district: string;
  state: string;
  created_at: string;
}

export interface ChallengeListResponse {
  items: ChallengeListItem[];
  total: number;
  limit: number;
  offset: number;
}

export interface ChallengeResponse {
  id: string;
  title: string;
  summary: string;
  description: string;
  domain: string;
  source_type: string;
  district: string;
  state: string;
  submitted_by_actor_id?: string | null;
  source_organization_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface EvidenceResponse {
  id: string;
  challenge_id: string;
  submitted_by_actor_id?: string | null;
  evidence_type: string;
  storage_reference: string;
  description?: string | null;
  captured_at?: string | null;
  submitted_at: string;
}

export interface EvidenceListResponse {
  items: EvidenceResponse[];
  total: number;
}

export type QualificationRoute =
  | "SERVICE"
  | "CLARIFY"
  | "RESEARCH_REVIEW"
  | "INNOVATION_CHALLENGE";

export interface QualificationDecisionResponse {
  id: string;
  challenge_id: string;
  route: QualificationRoute;
  version: number;
  rationale: string;
  decided_by_actor_id: string;
  decided_at: string;
  evidence_ids: string[];
}

export interface QualificationHistoryResponse {
  items: QualificationDecisionResponse[];
  total: number;
}
