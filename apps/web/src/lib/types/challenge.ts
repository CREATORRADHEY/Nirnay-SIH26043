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


export type OperationalStatus = "PLANNED" | "ACTIVE" | "COMPLETED" | "STOPPED";

export type EvidenceConclusion =
  | "NOT_REVIEWED"
  | "VALIDATED"
  | "ITERATE"
  | "INCONCLUSIVE";

export interface PilotCreate {
  authorized_by_readiness_decision_id: string;
  host_organization_id?: string | null;
  name: string;
  site_description?: string | null;
  planned_start?: string | null;
  planned_end?: string | null;
  created_by_actor_id: string;
}

export interface PilotResponse {
  id: string;
  challenge_id: string;
  authorized_by_readiness_decision_id: string;
  host_organization_id?: string | null;
  name: string;
  site_description?: string | null;
  planned_start?: string | null;
  planned_end?: string | null;
  created_by_actor_id: string;
  created_at: string;
}

export interface PilotListResponse {
  items: PilotResponse[];
  total: number;
}

export interface PilotOperationalStateCreate {
  status: OperationalStatus;
  rationale: string;
  recorded_by_actor_id: string;
  expected_version: number;
}

export interface PilotOperationalStateResponse {
  id: string;
  pilot_id: string;
  status: OperationalStatus;
  version: number;
  rationale: string;
  recorded_by_actor_id: string;
  recorded_at: string;
}

export interface PilotOperationalHistoryResponse {
  items: PilotOperationalStateResponse[];
  total: number;
}

export interface PilotEvidencePlanCreate {
  objective: string;
  primary_metric: string;
  baseline_definition: string;
  denominator_definition: string;
  data_collection_method: string;
  evaluation_window?: string | null;
  success_criteria?: string | null;
  limitations?: string | null;
  created_by_actor_id: string;
  expected_version: number;
}

export interface PilotEvidencePlanResponse {
  id: string;
  pilot_id: string;
  version: number;
  objective: string;
  primary_metric: string;
  baseline_definition: string;
  denominator_definition: string;
  data_collection_method: string;
  evaluation_window?: string | null;
  success_criteria?: string | null;
  limitations?: string | null;
  created_by_actor_id: string;
  created_at: string;
}

export interface PilotEvidencePlanHistoryResponse {
  items: PilotEvidencePlanResponse[];
  total: number;
}

export interface OutcomeAssessmentCreate {
  evidence_plan_id: string;
  conclusion: EvidenceConclusion;
  summary: string;
  limitations?: string | null;
  assessed_by_actor_id?: string | null;
  evidence_ids?: string[];
  expected_version: number;
}

export interface OutcomeAssessmentResponse {
  id: string;
  pilot_id: string;
  evidence_plan_id: string;
  version: number;
  conclusion: EvidenceConclusion;
  summary: string;
  limitations?: string | null;
  assessed_by_actor_id?: string | null;
  assessed_at: string;
  evidence_ids: string[];
}

export interface OutcomeAssessmentHistoryResponse {
  items: OutcomeAssessmentResponse[];
  total: number;
}

export interface DecisionAssuranceCreate {
  decision_type: "QUALIFICATION" | "READINESS" | "OUTCOME";
  authoritative_decision_id: string;
  rubric_version?: string;
  rubric_answers?: Record<string, any>;
  evidence_ids?: string[];
  rationale: string;
  limitations_note?: string | null;
  ai_advisory_snapshot?: Record<string, any> | null;
  conflict_declared?: "NO_KNOWN_CONFLICT" | "POTENTIAL_CONFLICT";
}

export interface DecisionAssuranceResponse {
  id: string;
  challenge_id: string;
  decision_type: string;
  authoritative_decision_id: string;
  reviewer_actor_id: string;
  reviewer_organization_id?: string | null;
  rubric_version: string;
  rubric_answers: Record<string, any>;
  evidence_ids: string[];
  rationale: string;
  limitations_note?: string | null;
  ai_advisory_snapshot?: Record<string, any> | null;
  ai_agreement_status: "AGREEMENT" | "DISAGREEMENT" | "NOT_APPLICABLE";
  conflict_declared: "NO_KNOWN_CONFLICT" | "POTENTIAL_CONFLICT";
  second_review_required: boolean;
  second_review_reason?: string | null;
  review_status: "SINGLE_REVIEWED" | "SECOND_REVIEW_PENDING" | "AGREED" | "DISAGREED" | "RESOLVED";
  second_reviewer_actor_id?: string | null;
  second_review_rationale?: string | null;
  second_review_decision?: string | null;
  disagreement_resolved_by_actor_id?: string | null;
  resolution_rationale?: string | null;
  created_at: string;
  superseded_at?: string | null;
}

export interface SecondReviewCreate {
  rationale: string;
  decision: string;
}

export interface DisagreementResolutionCreate {
  resolution_rationale: string;
  final_decision: string;
}

export interface DecisionReviewRequestCreate {
  reason: string;
  evidence_id?: string | null;
}

export interface DecisionReviewRequestResponse {
  id: string;
  challenge_id: string;
  assurance_record_id: string;
  requested_by_actor_id: string;
  reason: string;
  evidence_id?: string | null;
  status: string;
  created_at: string;
}

export type Challenge = ChallengeResponse;
export type HEIOrganizationResponse = HEIOrganization;
