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

export interface QualificationDecisionCreate {
  route: QualificationRoute;
  rationale: string;
  decided_by_actor_id: string;
  evidence_ids: string[];
}

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

export interface HEIOrganizationCapabilityItem {
  id: string;
  capability_type: string;
  name: string;
  description?: string | null;
  discipline?: string | null;
}

export interface HEIOrganization {
  organization_id: string;
  name: string;
  organization_type: string;
  district?: string | null;
  state: string;
  active_capabilities: HEIOrganizationCapabilityItem[];
}

export interface HEIOrganizationListResponse {
  items: HEIOrganization[];
  total: number;
}

export interface HEICapability {
  id: string;
  organization_id: string;
  capability_type: string;
  name: string;
  description?: string | null;
  discipline?: string | null;
  is_active: boolean;
}

export interface HEICandidateCreate {
  organization_id: string;
  match_method: string;
  rationale: string;
  created_by_actor_id?: string | null;
}

export interface HEICandidateResponse {
  id: string;
  challenge_id: string;
  organization_id: string;
  match_method: string;
  rationale: string;
  created_by_actor_id?: string | null;
  created_at: string;
}

export interface HEICandidateListResponse {
  items: HEICandidateResponse[];
  total: number;
}


export type CommitmentStatus =
  | "PROPOSED"
  | "OFFERED"
  | "ACCEPTED"
  | "DECLINED"
  | "WITHDRAWN"
  | "EXPIRED";

export interface CommitmentCreate {
  organization_id: string;
  commitment_type: string;
  status: CommitmentStatus;
  scope_description: string;
  recorded_by_actor_id: string;
  valid_from?: string | null;
  valid_until?: string | null;
  expected_version: number;
}

export interface CommitmentResponse {
  id: string;
  challenge_id: string;
  organization_id: string;
  commitment_type: string;
  status: CommitmentStatus;
  version: number;
  scope_description: string;
  recorded_by_actor_id: string;
  valid_from?: string | null;
  valid_until?: string | null;
  created_at: string;
}

export interface CommitmentHistoryResponse {
  items: CommitmentResponse[];
  total: number;
}

export type ConditionStatus =
  | "SATISFIED"
  | "UNSATISFIED"
  | "UNKNOWN"
  | "DISPUTED"
  | "EXPIRED";

export interface ReadinessConditionCreate {
  condition_key: string;
  status: ConditionStatus;
  rationale: string;
  assessed_by_actor_id: string;
  valid_until?: string | null;
  commitment_dependency_ids?: string[];
  expected_version: number;
}

export interface ReadinessConditionResponse {
  id: string;
  challenge_id: string;
  condition_key: string;
  status: ConditionStatus;
  version: number;
  rationale: string;
  assessed_by_actor_id: string;
  valid_until?: string | null;
  assessed_at: string;
  commitment_dependency_ids: string[];
}

export interface ReadinessConditionListResponse {
  items: ReadinessConditionResponse[];
  total: number;
}

export type ReadinessStatus =
  | "BLOCKED"
  | "REVIEW_READY"
  | "PILOT_READY"
  | "REVIEW_REQUIRED";

export interface ReadinessDecisionCreate {
  status: ReadinessStatus;
  rationale: string;
  decided_by_actor_id: string;
  condition_ids?: string[];
  expected_version: number;
}

export interface ReadinessDecisionResponse {
  id: string;
  challenge_id: string;
  status: ReadinessStatus;
  version: number;
  rationale: string;
  decided_by_actor_id?: string | null;
  created_at: string;
  triggered_by_commitment_id?: string | null;
  condition_ids: string[];
}

export interface ReadinessDecisionHistoryResponse {
  items: ReadinessDecisionResponse[];
  total: number;
}
