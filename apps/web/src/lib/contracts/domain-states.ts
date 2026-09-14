export const QUALIFICATION_ROUTES = [
  "SERVICE",
  "CLARIFY",
  "RESEARCH_REVIEW",
  "INNOVATION_CHALLENGE",
] as const;

export type QualificationRoute = (typeof QUALIFICATION_ROUTES)[number];

export const COMMITMENT_STATUSES = [
  "PROPOSED",
  "OFFERED",
  "ACCEPTED",
  "DECLINED",
  "WITHDRAWN",
  "EXPIRED",
] as const;

export type CommitmentStatus = (typeof COMMITMENT_STATUSES)[number];

export const CONDITION_STATUSES = [
  "SATISFIED",
  "UNSATISFIED",
  "UNKNOWN",
  "DISPUTED",
  "EXPIRED",
] as const;

export type ConditionStatus = (typeof CONDITION_STATUSES)[number];

export const READINESS_STATUSES = [
  "BLOCKED",
  "REVIEW_READY",
  "PILOT_READY",
  "REVIEW_REQUIRED",
] as const;

export type ReadinessStatus = (typeof READINESS_STATUSES)[number];

export const OPERATIONAL_STATUSES = [
  "PLANNED",
  "ACTIVE",
  "COMPLETED",
  "STOPPED",
] as const;

export type OperationalStatus = (typeof OPERATIONAL_STATUSES)[number];

export const EVIDENCE_CONCLUSIONS = [
  "NOT_REVIEWED",
  "VALIDATED",
  "ITERATE",
  "INCONCLUSIVE",
] as const;

export type EvidenceConclusion = (typeof EVIDENCE_CONCLUSIONS)[number];
