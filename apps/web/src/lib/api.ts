export type * from "./types/challenge";
import type {
  OperationalStatus,
  ChallengeListResponse,
  ChallengeResponse,
  EvidenceListResponse,
  QualificationDecisionCreate,
  QualificationDecisionResponse,
  QualificationHistoryResponse,
  HEIOrganization,
  HEIOrganizationListResponse,
  HEICapability,
  HEICandidateCreate,
  HEICandidateResponse,
  HEICandidateListResponse,
  CommitmentCreate,
  CommitmentResponse,
  CommitmentHistoryResponse,
  ReadinessConditionCreate,
  ReadinessConditionResponse,
  ReadinessConditionListResponse,
  ReadinessDecisionCreate,
  ReadinessDecisionResponse,
  ReadinessDecisionHistoryResponse,
  PilotCreate,
  PilotResponse,
  PilotListResponse,
  PilotOperationalStateCreate,
  PilotOperationalStateResponse,
  PilotOperationalHistoryResponse,
  PilotEvidencePlanCreate,
  PilotEvidencePlanResponse,
  PilotEvidencePlanHistoryResponse,
  OutcomeAssessmentCreate,
  OutcomeAssessmentResponse,
  OutcomeAssessmentHistoryResponse,
} from "./types/challenge";

export function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
}
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export const ENABLE_DEMO_FALLBACK =
  process.env.NEXT_PUBLIC_ENABLE_DEMO_FALLBACK === "true";

export const DEMO_REVIEWER_ACTOR_ID =
  process.env.NEXT_PUBLIC_DEMO_REVIEWER_ACTOR_ID || "d99c55a9-e4d4-42c1-abd1-5e9ccb2ad67c";

// Fallback synthetic demo data for frontend resilience when backend is unreachable
export const DEMO_CHALLENGES: ChallengeResponse[] = [
  {
    id: "c0a80001-0000-4000-8000-000000000001",
    title: "Unreliable Segregated Dry-Waste Collection in Ward 12, Ranchi",
    summary:
      "Ward 12 in Ranchi struggles with unsegregated waste overflow at doorstep collection points, leading to landfill burden.",
    description:
      "Municipal ward 12 requires a localized decentralized sorting model. Local HEI technical partnership is required to pilot smart dry-waste bin monitoring and community sorting incentive models.",
    domain: "Waste Management & Sanitation",
    source_type: "Government Portal",
    district: "Ranchi",
    state: "Jharkhand",
    submitted_by_actor_id: "d99c55a9-e4d4-42c1-abd1-5e9ccb2ad67c",
    source_organization_id: "c0a80000-0000-4000-8000-000000000001",
    created_at: "2026-03-14T09:00:00Z",
    updated_at: "2026-03-14T09:00:00Z",
  },
  {
    id: "c0a80002-0000-4000-8000-000000000002",
    title: "Off-Grid Solar Thermal Preservation for Vegetable Vendor Hubs in Hazaribagh",
    summary:
      "Smallholder vegetable vendors in Hazaribagh suffer 35% produce loss due to lack of overnight cold storage.",
    description:
      "Deploying low-cost solar thermal evaporative cooling units across peri-urban vendor markets to extend produce shelf life from 24h to 72h.",
    domain: "Agricultural Technology & Rural Infrastructure",
    source_type: "Government Portal",
    district: "Hazaribagh",
    state: "Jharkhand",
    submitted_by_actor_id: "d99c55a9-e4d4-42c1-abd1-5e9ccb2ad67c",
    source_organization_id: "c0a80000-0000-4000-8000-000000000001",
    created_at: "2026-03-15T09:00:00Z",
    updated_at: "2026-03-15T09:00:00Z",
  },
  {
    id: "c0010000-0000-0000-0000-000000000001",
    title: "Sustainable Water Management for Semi-Urban Towns",
    summary:
      "Rapid urban expansion in Ranchi district has caused groundwater depletion and inadequate rainwater harvesting infrastructure across municipal wards.",
    description:
      "Semi-urban towns in Ranchi district face acute seasonal water scarcity due to unplanned ground extraction, lack of runoff rainwater harvesting in public buildings, and inefficient distribution. Municipal authorities lack real-time hydrological data and localized filtration models to manage community supply during dry months.",
    domain: "Environment",
    source_type: "Citizen Reported",
    district: "Ranchi",
    state: "Jharkhand",
    submitted_by_actor_id: "a0010000-0000-0000-0000-000000000001",
    source_organization_id: "o0010000-0000-0000-0000-000000000001",
    created_at: "2026-03-10T09:30:00Z",
    updated_at: "2026-03-10T09:30:00Z",
  },
  {
    id: "c0020000-0000-0000-0000-000000000002",
    title: "Solar Cold Storage for Peri-Urban Farmers",
    summary:
      "Perishable vegetable crops in East Singhbhum spoil rapidly post-harvest due to lack of affordable grid-independent cold storage solutions.",
    description:
      "Smallholder farmers in East Singhbhum suffer up to 35% crop loss during peak harvest season due to high ambient temperatures and unreliable grid power. Existing commercial cold storage units are centralized, expensive, and logistically unviable for micro-farmers.",
    domain: "Agriculture",
    source_type: "Government Portal",
    district: "East Singhbhum",
    state: "Jharkhand",
    submitted_by_actor_id: null,
    source_organization_id: null,
    created_at: "2026-03-12T14:15:00Z",
    updated_at: "2026-03-12T14:15:00Z",
  },
];

export const DEMO_EVIDENCE: Record<string, EvidenceListResponse> = {
  "c0010000-0000-0000-0000-000000000001": {
    items: [
      {
        id: "e0010000-0000-0000-0000-000000000001",
        challenge_id: "c0010000-0000-0000-0000-000000000001",
        evidence_type: "Field Report",
        storage_reference: "gcs://nirnay-evidence/ranchi-water-survey-2026.pdf",
        description:
          "Hydrogeological field survey of 12 wards in Ranchi showing 4.2m average drop in groundwater table over 3 years.",
        captured_at: "2026-03-01T10:00:00Z",
        submitted_at: "2026-03-10T10:00:00Z",
      },
    ],
    total: 1,
  },
};

// Mutable fallback store for active demo session
const demoQualificationsStore: Record<string, QualificationDecisionResponse[]> = {
  "c0010000-0000-0000-0000-000000000001": [
    {
      id: "q0010000-0000-0000-0000-000000000001",
      challenge_id: "c0010000-0000-0000-0000-000000000001",
      route: "INNOVATION_CHALLENGE",
      version: 1,
      rationale:
        "Problem involves complex hydrogeological technology, requiring interdisciplinary academic research partnership and pilot testing before municipal scaling.",
      decided_by_actor_id: DEMO_REVIEWER_ACTOR_ID,
      decided_at: "2026-03-11T12:00:00Z",
      evidence_ids: ["e0010000-0000-0000-0000-000000000001"],
    },
  ],
};

const demoHEIOrganizationsStore: HEIOrganization[] = [
  {
    organization_id: "99544ae4-8480-42b1-a681-a7b7c75f4343",
    name: "Birla Institute of Technology, Mesra",
    organization_type: "HEI",
    district: "Ranchi",
    state: "Jharkhand",
    active_capabilities: [
      {
        id: "d85e319e-5c48-4d69-9cab-7e5b4394fab6",
        capability_type: "RESEARCH_LAB",
        name: "Water Quality & Hydrogeology Center",
        discipline: "Environmental Engineering",
        description: "Specialized laboratory for groundwater testing, aquifer modeling, and community water filtration.",
      },
      {
        id: "5c65109e-cca1-4d52-a099-884533be6763",
        capability_type: "INCUBATOR",
        name: "GreenTech Innovation Cell",
        discipline: "Sustainable Infrastructure",
        description: "Incubation support for low-cost rural water treatment hardware.",
      },
    ],
  },
  {
    organization_id: "b4b6e4f0-dc8e-44d9-9105-b488de958779",
    name: "National Institute of Technology, Jamshedpur",
    organization_type: "HEI",
    district: "East Singhbhum",
    state: "Jharkhand",
    active_capabilities: [
      {
        id: "d8c3815d-8481-404a-8ae4-af19fecb6e5b",
        capability_type: "FACULTY_EXPERTISE",
        name: "Renewable Energy & Solar Thermal Group",
        discipline: "Electrical Engineering",
        description: "R&D expertise in off-grid solar cold storage and thermal insulation for agricultural produce.",
      },
    ],
  },
  {
    organization_id: "942af61d-3224-4925-9ea9-a383f0249980",
    name: "IIT (ISM) Dhanbad",
    organization_type: "HEI",
    district: "Dhanbad",
    state: "Jharkhand",
    active_capabilities: [
      {
        id: "7316bc38-c1fc-467c-a612-44237240a0d2",
        capability_type: "FIELD_CAPABILITY",
        name: "Geo-Spatial Aquifer Mapping Unit",
        discipline: "Geophysics",
        description: "Satellite & GIS subsurface water table mapping across semi-urban mining belts.",
      },
    ],
  },
];

const demoCandidatesStore: Record<string, HEICandidateResponse[]> = {};

export async function fetchChallenges(params?: {
  district?: string;
  domain?: string;
  source_type?: string;
  limit?: number;
  offset?: number;
}): Promise<{ data: ChallengeListResponse; isDemo: boolean }> {
  try {
    const query = new URLSearchParams();
    if (params?.district) query.set("district", params.district);
    if (params?.domain) query.set("domain", params.domain);
    if (params?.source_type) query.set("source_type", params.source_type);
    if (params?.limit) query.set("limit", params.limit.toString());
    if (params?.offset) query.set("offset", params.offset.toString());

    const url = `${getApiBaseUrl()}/api/v1/challenges?${query.toString()}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data: ChallengeListResponse = await res.json();
    return { data, isDemo: false };
  } catch (err) {
    if (process.env.NEXT_PUBLIC_ENABLE_DEMO_FALLBACK !== "true") throw err;
    let filtered = [...DEMO_CHALLENGES];
    if (params?.district) {
      filtered = filtered.filter(
        (c) => c.district.toLowerCase() === params.district?.toLowerCase()
      );
    }
    if (params?.domain) {
      filtered = filtered.filter(
        (c) => c.domain.toLowerCase() === params.domain?.toLowerCase()
      );
    }
    if (params?.source_type) {
      filtered = filtered.filter(
        (c) => c.source_type.toLowerCase() === params.source_type?.toLowerCase()
      );
    }

    const items = filtered.map((c) => ({
      id: c.id,
      title: c.title,
      summary: c.summary,
      domain: c.domain,
      source_type: c.source_type,
      district: c.district,
      state: c.state,
      created_at: c.created_at,
    }));

    return {
      data: {
        items,
        total: items.length,
        limit: params?.limit || 20,
        offset: params?.offset || 0,
      },
      isDemo: true,
    };
  }
}

export async function fetchChallengeDetail(
  challengeId: string
): Promise<{ data: ChallengeResponse; isDemo: boolean }> {
  try {
    const url = `${getApiBaseUrl()}/api/v1/challenges/${challengeId}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data: ChallengeResponse = await res.json();
    return { data, isDemo: false };
  } catch (err) {
    if (process.env.NEXT_PUBLIC_ENABLE_DEMO_FALLBACK !== "true") throw err;
    const found = DEMO_CHALLENGES.find((c) => c.id === challengeId) || DEMO_CHALLENGES[0];
    return { data: found, isDemo: true };
  }
}

export async function fetchChallengeEvidence(
  challengeId: string
): Promise<{ data: EvidenceListResponse; isDemo: boolean }> {
  try {
    const url = `${getApiBaseUrl()}/api/v1/challenges/${challengeId}/evidence`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data: EvidenceListResponse = await res.json();
    return { data, isDemo: false };
  } catch (err) {
    if (process.env.NEXT_PUBLIC_ENABLE_DEMO_FALLBACK !== "true") throw err;
    const demoEv = DEMO_EVIDENCE[challengeId] || { items: [], total: 0 };
    return { data: demoEv, isDemo: true };
  }
}

export async function fetchQualificationHistory(
  challengeId: string
): Promise<{ data: QualificationHistoryResponse; isDemo: boolean }> {
  try {
    const url = `${getApiBaseUrl()}/api/v1/challenges/${challengeId}/qualification-decisions`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data: QualificationHistoryResponse = await res.json();
    return { data, isDemo: false };
  } catch (err) {
    if (process.env.NEXT_PUBLIC_ENABLE_DEMO_FALLBACK !== "true") throw err;
    const items = demoQualificationsStore[challengeId] || [];
    return { data: { items, total: items.length }, isDemo: true };
  }
}

export async function fetchLatestQualification(
  challengeId: string
): Promise<{ data: QualificationDecisionResponse | null; isDemo: boolean }> {
  try {
    const url = `${getApiBaseUrl()}/api/v1/challenges/${challengeId}/qualification-decisions/latest`;
    const res = await fetch(url, { cache: "no-store" });
    if (res.status === 404) return { data: null, isDemo: false };
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data: QualificationDecisionResponse = await res.json();
    return { data, isDemo: false };
  } catch (err) {
    if (process.env.NEXT_PUBLIC_ENABLE_DEMO_FALLBACK !== "true") throw err;
    const items = demoQualificationsStore[challengeId] || [];
    const latest = items.length > 0 ? items[items.length - 1] : null;
    return { data: latest, isDemo: true };
  }
}

export async function createQualificationDecision(
  challengeId: string,
  payload: QualificationDecisionCreate
): Promise<{ data: QualificationDecisionResponse; isDemo: boolean }> {
  try {
    const url = `${getApiBaseUrl()}/api/v1/challenges/${challengeId}/qualification-decisions`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || `HTTP error ${res.status}`);
    }
    const data: QualificationDecisionResponse = await res.json();
    return { data, isDemo: false };
  } catch (err) {
    if (process.env.NEXT_PUBLIC_ENABLE_DEMO_FALLBACK !== "true") throw err;
    // Check if error is actual server rejection
    if (err instanceof Error && err.message.includes("is not found")) {
      throw err;
    }
    // Fallback store update for client demo mode
    const items = demoQualificationsStore[challengeId] || [];
    const newDec: QualificationDecisionResponse = {
      id: `q-demo-${Date.now()}`,
      challenge_id: challengeId,
      route: payload.route,
      version: items.length + 1,
      rationale: payload.rationale,
      decided_by_actor_id: payload.decided_by_actor_id,
      decided_at: new Date().toISOString(),
      evidence_ids: payload.evidence_ids || [],
    };
    demoQualificationsStore[challengeId] = [...items, newDec];
    return { data: newDec, isDemo: true };
  }
}

export async function fetchHEIOrganizations(): Promise<{
  data: HEIOrganizationListResponse;
  isDemo: boolean;
}> {
  try {
    const url = `${getApiBaseUrl()}/api/v1/hei-organizations`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data: HEIOrganizationListResponse = await res.json();
    return { data, isDemo: false };
  } catch (err) {
    if (process.env.NEXT_PUBLIC_ENABLE_DEMO_FALLBACK !== "true") throw err;
    return {
      data: {
        items: demoHEIOrganizationsStore,
        total: demoHEIOrganizationsStore.length,
      },
      isDemo: true,
    };
  }
}

export async function fetchHEICandidates(
  challengeId: string
): Promise<{ data: HEICandidateListResponse; isDemo: boolean }> {
  try {
    const url = `${getApiBaseUrl()}/api/v1/challenges/${challengeId}/hei-candidates`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data: HEICandidateListResponse = await res.json();
    return { data, isDemo: false };
  } catch (err) {
    if (process.env.NEXT_PUBLIC_ENABLE_DEMO_FALLBACK !== "true") throw err;
    const items = demoCandidatesStore[challengeId] || [];
    return { data: { items, total: items.length }, isDemo: true };
  }
}

export async function createHEICandidate(
  challengeId: string,
  payload: HEICandidateCreate
): Promise<{ data: HEICandidateResponse; isDemo: boolean }> {
  try {
    const url = `${getApiBaseUrl()}/api/v1/challenges/${challengeId}/hei-candidates`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || `HTTP error ${res.status}`);
    }
    const data: HEICandidateResponse = await res.json();
    return { data, isDemo: false };
  } catch (err) {
    if (process.env.NEXT_PUBLIC_ENABLE_DEMO_FALLBACK !== "true") throw err;
    if (err instanceof Error && (err.message.includes("already a candidate") || err.message.includes("not eligible"))) {
      throw err;
    }
    const items = demoCandidatesStore[challengeId] || [];
    const newCand: HEICandidateResponse = {
      id: `cand-demo-${Date.now()}`,
      challenge_id: challengeId,
      organization_id: payload.organization_id,
      match_method: payload.match_method,
      rationale: payload.rationale,
      created_by_actor_id: payload.created_by_actor_id || DEMO_REVIEWER_ACTOR_ID,
      created_at: new Date().toISOString(),
    };
    demoCandidatesStore[challengeId] = [...items, newCand];
    return { data: newCand, isDemo: true };
  }
}

export async function fetchOrganizationCapabilities(
  organizationId: string
): Promise<{ data: HEICapability[]; isDemo: boolean }> {
  try {
    const url = `${getApiBaseUrl()}/api/v1/organizations/${organizationId}/hei-capabilities`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data: HEICapability[] = await res.json();
    return { data, isDemo: false };
  } catch (err) {
    if (process.env.NEXT_PUBLIC_ENABLE_DEMO_FALLBACK !== "true") throw err;
    const foundOrg = demoHEIOrganizationsStore.find(
      (o) => o.organization_id === organizationId
    );
    const caps: HEICapability[] = (foundOrg?.active_capabilities || []).map((c) => ({
      ...c,
      organization_id: organizationId,
      is_active: true,
    }));
    return { data: caps, isDemo: true };
  }
}


const demoCommitmentsStore: Record<string, CommitmentResponse[]> = {};
const demoReadinessConditionsStore: Record<string, ReadinessConditionResponse[]> = {};
const demoReadinessDecisionsStore: Record<string, ReadinessDecisionResponse[]> = {};

export async function fetchCommitments(
  challengeId: string,
  organizationId?: string,
  commitmentType?: string
): Promise<{ data: CommitmentHistoryResponse; isDemo: boolean }> {
  try {
    let url = `${getApiBaseUrl()}/api/v1/challenges/${challengeId}/commitments`;
    const params = new URLSearchParams();
    if (organizationId) params.append("organization_id", organizationId);
    if (commitmentType) params.append("commitment_type", commitmentType);
    if (params.toString()) url += `?${params.toString()}`;

    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data: CommitmentHistoryResponse = await res.json();
    return { data, isDemo: false };
  } catch (err) {
    if (process.env.NEXT_PUBLIC_ENABLE_DEMO_FALLBACK !== "true") throw err;
    let items = demoCommitmentsStore[challengeId] || [];
    if (organizationId) {
      items = items.filter((c) => c.organization_id === organizationId);
    }
    if (commitmentType) {
      items = items.filter((c) => c.commitment_type === commitmentType);
    }
    return { data: { items, total: items.length }, isDemo: true };
  }
}

export async function fetchCommitmentHistory(
  challengeId: string,
  organizationId: string,
  commitmentType: string
): Promise<{ data: CommitmentHistoryResponse; isDemo: boolean }> {
  try {
    const url = `${getApiBaseUrl()}/api/v1/challenges/${challengeId}/commitments/${organizationId}/${commitmentType}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data: CommitmentHistoryResponse = await res.json();
    return { data, isDemo: false };
  } catch (err) {
    if (process.env.NEXT_PUBLIC_ENABLE_DEMO_FALLBACK !== "true") throw err;
    const all = demoCommitmentsStore[challengeId] || [];
    const items = all.filter(
      (c) => c.organization_id === organizationId && c.commitment_type === commitmentType
    );
    return { data: { items, total: items.length }, isDemo: true };
  }
}

export async function createCommitmentVersion(
  challengeId: string,
  payload: CommitmentCreate
): Promise<{ data: CommitmentResponse; isDemo: boolean }> {
  try {
    const url = `${getApiBaseUrl()}/api/v1/challenges/${challengeId}/commitments`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || `HTTP error ${res.status}`);
    }
    const data: CommitmentResponse = await res.json();
    return { data, isDemo: false };
  } catch (err) {
    if (process.env.NEXT_PUBLIC_ENABLE_DEMO_FALLBACK !== "true") throw err;
    if (err instanceof Error && (err.message.includes("409") || err.message.includes("version") || err.message.includes("not found"))) {
      throw err;
    }
    const all = demoCommitmentsStore[challengeId] || [];
    const series = all.filter(
      (c) => c.organization_id === payload.organization_id && c.commitment_type === payload.commitment_type
    );
    const latestVer = series.length > 0 ? Math.max(...series.map((s) => s.version)) : 0;
    if (payload.expected_version !== latestVer) {
      throw new Error(`409 Conflict: Stale expected_version ${payload.expected_version}. Latest version is ${latestVer}.`);
    }

    const newComm: CommitmentResponse = {
      id: `comm-demo-${Date.now()}`,
      challenge_id: challengeId,
      organization_id: payload.organization_id,
      commitment_type: payload.commitment_type,
      status: payload.status,
      version: latestVer + 1,
      scope_description: payload.scope_description,
      recorded_by_actor_id: payload.recorded_by_actor_id || DEMO_REVIEWER_ACTOR_ID,
      valid_from: payload.valid_from || null,
      valid_until: payload.valid_until || null,
      created_at: new Date().toISOString(),
    };
    demoCommitmentsStore[challengeId] = [...all, newComm];

    // Mock invalidation check for offline demo
    const decs = demoReadinessDecisionsStore[challengeId] || [];
    const latestDec = decs.length > 0 ? decs[decs.length - 1] : null;
    if (latestDec && latestDec.status === "PILOT_READY") {
      const conds = demoReadinessConditionsStore[challengeId] || [];
      const isAffected = conds.some((cond) =>
        cond.commitment_dependency_ids?.some((depId) => {
          const matchSeries = all.find((c) => c.id === depId);
          return matchSeries && matchSeries.organization_id === payload.organization_id && matchSeries.commitment_type === payload.commitment_type;
        })
      );
      if (isAffected) {
        const autoDec: ReadinessDecisionResponse = {
          id: `dec-auto-${Date.now()}`,
          challenge_id: challengeId,
          status: "REVIEW_REQUIRED",
          version: latestDec.version + 1,
          rationale: "Pilot readiness reopened automatically because a relied-on commitment series was updated.",
          decided_by_actor_id: null,
          created_at: new Date().toISOString(),
          triggered_by_commitment_id: newComm.id,
          condition_ids: latestDec.condition_ids,
        };
        demoReadinessDecisionsStore[challengeId] = [...decs, autoDec];
      }
    }

    return { data: newComm, isDemo: true };
  }
}

export async function fetchReadinessConditions(
  challengeId: string
): Promise<{ data: ReadinessConditionListResponse; isDemo: boolean }> {
  try {
    const url = `${getApiBaseUrl()}/api/v1/challenges/${challengeId}/readiness-conditions`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data: ReadinessConditionListResponse = await res.json();
    return { data, isDemo: false };
  } catch (err) {
    if (process.env.NEXT_PUBLIC_ENABLE_DEMO_FALLBACK !== "true") throw err;
    const items = demoReadinessConditionsStore[challengeId] || [];
    return { data: { items, total: items.length }, isDemo: true };
  }
}

export async function fetchLatestReadinessConditions(
  challengeId: string
): Promise<{ data: ReadinessConditionListResponse; isDemo: boolean }> {
  try {
    const url = `${getApiBaseUrl()}/api/v1/challenges/${challengeId}/readiness-conditions/latest`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data: ReadinessConditionListResponse = await res.json();
    return { data, isDemo: false };
  } catch (err) {
    if (process.env.NEXT_PUBLIC_ENABLE_DEMO_FALLBACK !== "true") throw err;
    const items = demoReadinessConditionsStore[challengeId] || [];
    const latestByKey: Record<string, ReadinessConditionResponse> = {};
    for (const item of items) {
      if (!latestByKey[item.condition_key] || item.version > latestByKey[item.condition_key].version) {
        latestByKey[item.condition_key] = item;
      }
    }
    const result = Object.values(latestByKey);
    return { data: { items: result, total: result.length }, isDemo: true };
  }
}

export async function createReadinessCondition(
  challengeId: string,
  payload: ReadinessConditionCreate
): Promise<{ data: ReadinessConditionResponse; isDemo: boolean }> {
  try {
    const url = `${getApiBaseUrl()}/api/v1/challenges/${challengeId}/readiness-conditions`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || `HTTP error ${res.status}`);
    }
    const data: ReadinessConditionResponse = await res.json();
    return { data, isDemo: false };
  } catch (err) {
    if (process.env.NEXT_PUBLIC_ENABLE_DEMO_FALLBACK !== "true") throw err;
    if (err instanceof Error && (err.message.includes("409") || err.message.includes("version") || err.message.includes("not found"))) {
      throw err;
    }
    const all = demoReadinessConditionsStore[challengeId] || [];
    const keyItems = all.filter((c) => c.condition_key === payload.condition_key);
    const latestVer = keyItems.length > 0 ? Math.max(...keyItems.map((k) => k.version)) : 0;
    if (payload.expected_version !== latestVer) {
      throw new Error(`409 Conflict: Stale expected_version ${payload.expected_version}. Latest version is ${latestVer}.`);
    }

    const newCond: ReadinessConditionResponse = {
      id: `cond-demo-${Date.now()}`,
      challenge_id: challengeId,
      condition_key: payload.condition_key,
      status: payload.status,
      version: latestVer + 1,
      rationale: payload.rationale,
      assessed_by_actor_id: payload.assessed_by_actor_id || DEMO_REVIEWER_ACTOR_ID,
      valid_until: payload.valid_until || null,
      assessed_at: new Date().toISOString(),
      commitment_dependency_ids: payload.commitment_dependency_ids || [],
    };
    demoReadinessConditionsStore[challengeId] = [...all, newCond];
    return { data: newCond, isDemo: true };
  }
}

export async function fetchReadinessHistory(
  challengeId: string
): Promise<{ data: ReadinessDecisionHistoryResponse; isDemo: boolean }> {
  try {
    const url = `${getApiBaseUrl()}/api/v1/challenges/${challengeId}/readiness-decisions`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data: ReadinessDecisionHistoryResponse = await res.json();
    return { data, isDemo: false };
  } catch (err) {
    if (process.env.NEXT_PUBLIC_ENABLE_DEMO_FALLBACK !== "true") throw err;
    const items = demoReadinessDecisionsStore[challengeId] || [];
    return { data: { items, total: items.length }, isDemo: true };
  }
}

export async function fetchLatestReadinessDecision(
  challengeId: string
): Promise<{ data: ReadinessDecisionResponse | null; isDemo: boolean }> {
  try {
    const url = `${getApiBaseUrl()}/api/v1/challenges/${challengeId}/readiness-decisions/latest`;
    const res = await fetch(url, { cache: "no-store" });
    if (res.status === 404) return { data: null, isDemo: false };
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data: ReadinessDecisionResponse = await res.json();
    return { data, isDemo: false };
  } catch (err) {
    if (process.env.NEXT_PUBLIC_ENABLE_DEMO_FALLBACK !== "true") throw err;
    const items = demoReadinessDecisionsStore[challengeId] || [];
    const latest = items.length > 0 ? items[items.length - 1] : null;
    return { data: latest, isDemo: true };
  }
}

export async function createReadinessDecision(
  challengeId: string,
  payload: ReadinessDecisionCreate
): Promise<{ data: ReadinessDecisionResponse; isDemo: boolean }> {
  if (payload.status === "REVIEW_REQUIRED") {
    throw new Error("REVIEW_REQUIRED status cannot be manually set by client API.");
  }

  try {
    const url = `${getApiBaseUrl()}/api/v1/challenges/${challengeId}/readiness-decisions`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || `HTTP error ${res.status}`);
    }
    const data: ReadinessDecisionResponse = await res.json();
    return { data, isDemo: false };
  } catch (err) {
    if (process.env.NEXT_PUBLIC_ENABLE_DEMO_FALLBACK !== "true") throw err;
    if (err instanceof Error && (err.message.includes("REVIEW_REQUIRED") || err.message.includes("409") || err.message.includes("version") || err.message.includes("not found"))) {
      throw err;
    }
    const all = demoReadinessDecisionsStore[challengeId] || [];
    const latestVer = all.length > 0 ? Math.max(...all.map((d) => d.version)) : 0;
    if (payload.expected_version !== latestVer) {
      throw new Error(`409 Conflict: Stale expected_version ${payload.expected_version}. Latest version is ${latestVer}.`);
    }

    const newDec: ReadinessDecisionResponse = {
      id: `dec-demo-${Date.now()}`,
      challenge_id: challengeId,
      status: payload.status,
      version: latestVer + 1,
      rationale: payload.rationale,
      decided_by_actor_id: payload.decided_by_actor_id || DEMO_REVIEWER_ACTOR_ID,
      created_at: new Date().toISOString(),
      triggered_by_commitment_id: null,
      condition_ids: payload.condition_ids || [],
    };
    demoReadinessDecisionsStore[challengeId] = [...all, newDec];
    return { data: newDec, isDemo: true };
  }
}


const demoPilotsStore: Record<string, PilotResponse[]> = {
  "c0a80002-0000-4000-8000-000000000002": [{
    id: "b0a80002-0000-4000-8000-000000000006",
    challenge_id: "c0a80002-0000-4000-8000-000000000002",
    authorized_by_readiness_decision_id: "b0a80002-0000-4000-8000-000000000005",
    host_organization_id: "c0a80000-0000-4000-8000-000000000001",
    name: "Hazaribagh Vendor Cold Chain Field Pilot",
    site_description: "Peri-urban daily vegetable market, Ward 4, Hazaribagh",
    planned_start: "2026-08-01T00:00:00Z",
    planned_end: "2026-09-30T00:00:00Z",
    created_by_actor_id: "d99c55a9-e4d4-42c1-abd1-5e9ccb2ad67c",
    created_at: "2026-03-16T10:00:00Z",
  }],
};
const demoOperationalStatesStore: Record<string, PilotOperationalStateResponse[]> = {
  "b0a80002-0000-4000-8000-000000000006": [
    {
      id: "b0a80002-0000-4000-8000-000000000007",
      pilot_id: "b0a80002-0000-4000-8000-000000000006",
      status: "PLANNED" as OperationalStatus,
      version: 1,
      rationale: "Field pilot initialized following human PILOT_READY authorization.",
      recorded_by_actor_id: "d99c55a9-e4d4-42c1-abd1-5e9ccb2ad67c",
      recorded_at: "2026-03-16T10:05:00Z",
    },
    {
      id: "b0a80002-0000-4000-8000-000000000008",
      pilot_id: "b0a80002-0000-4000-8000-000000000006",
      status: "ACTIVE" as OperationalStatus,
      version: 2,
      rationale: "4 solar thermal units deployed and actively monitored across market vendors.",
      recorded_by_actor_id: "d99c55a9-e4d4-42c1-abd1-5e9ccb2ad67c",
      recorded_at: "2026-03-16T10:10:00Z",
    },
  ],};
const demoEvidencePlansStore: Record<string, PilotEvidencePlanResponse[]> = {
  "b0a80002-0000-4000-8000-000000000006": [
    {
      id: "b0a80002-0000-4000-8000-000000000009",
      pilot_id: "b0a80002-0000-4000-8000-000000000006",
      version: 1,
      objective: "Evaluate solar thermal cooling units for reducing overnight vegetable spoilage among peri-urban vendors.",
      primary_metric: "Households receiving scheduled segregated waste collection",
      baseline_definition: "41% of surveyed households",
      denominator_definition: "240 households surveyed before pilot",
      data_collection_method: "Daily physical audit logs and temperature sensor telemetry",
      evaluation_window: "60-day observation window (Aug-Sep 2026)",
      success_criteria: "Fresh produce retention rate exceeds 75% at 48 hours across denominator",
      limitations: "Seasonal rain variations may affect solar thermal efficiency during monsoon weeks",
      created_by_actor_id: "d99c55a9-e4d4-42c1-abd1-5e9ccb2ad67c",
      created_at: "2026-03-16T10:15:00Z",
    },
  ],};
const demoOutcomesStore: Record<string, OutcomeAssessmentResponse[]> = {};

export async function createPilot(
  challengeId: string,
  payload: PilotCreate
): Promise<{ data: PilotResponse; isDemo: boolean }> {
  try {
    const url = `${getApiBaseUrl()}/api/v1/challenges/${challengeId}/pilots`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || `HTTP error ${res.status}`);
    }
    const data: PilotResponse = await res.json();
    return { data, isDemo: false };
  } catch (err) {
    if (process.env.NEXT_PUBLIC_ENABLE_DEMO_FALLBACK !== "true") throw err;
    const existing = demoPilotsStore[challengeId] || [];
    const newPilot: PilotResponse = {
      id: `pilot-demo-${Date.now()}`,
      challenge_id: challengeId,
      authorized_by_readiness_decision_id: payload.authorized_by_readiness_decision_id,
      host_organization_id: payload.host_organization_id || null,
      name: payload.name,
      site_description: payload.site_description || null,
      planned_start: payload.planned_start || null,
      planned_end: payload.planned_end || null,
      created_by_actor_id: payload.created_by_actor_id || DEMO_REVIEWER_ACTOR_ID,
      created_at: new Date().toISOString(),
    };
    demoPilotsStore[challengeId] = [...existing, newPilot];

    // Initialize PLANNED state automatically
    demoOperationalStatesStore[newPilot.id] = [
      {
        id: `op-demo-init-${Date.now()}`,
        pilot_id: newPilot.id,
        status: "PLANNED" as OperationalStatus,
        version: 1,
        rationale: "Initial pilot created from PILOT_READY authorization.",
        recorded_by_actor_id: newPilot.created_by_actor_id,
        recorded_at: new Date().toISOString(),
      },
    ];

    return { data: newPilot, isDemo: true };
  }
}

export async function fetchChallengePilots(
  challengeId: string
): Promise<{ data: PilotListResponse; isDemo: boolean }> {
  try {
    const url = `${getApiBaseUrl()}/api/v1/challenges/${challengeId}/pilots`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data: PilotListResponse = await res.json();
    return { data, isDemo: false };
  } catch (err) {
    if (process.env.NEXT_PUBLIC_ENABLE_DEMO_FALLBACK !== "true") throw err;
    const items = demoPilotsStore[challengeId] || [];
    return { data: { items, total: items.length }, isDemo: true };
  }
}

export async function fetchPilotDetail(
  pilotId: string
): Promise<{ data: PilotResponse; isDemo: boolean }> {
  try {
    const url = `${getApiBaseUrl()}/api/v1/pilots/${pilotId}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data: PilotResponse = await res.json();
    return { data, isDemo: false };
  } catch (err) {
    if (process.env.NEXT_PUBLIC_ENABLE_DEMO_FALLBACK !== "true") throw err;
    for (const key of Object.keys(demoPilotsStore)) {
      const found = demoPilotsStore[key].find((p) => p.id === pilotId);
      if (found) return { data: found, isDemo: true };
    }
    // Synthetic default
    const synthetic: PilotResponse = {
      id: pilotId,
      challenge_id: "c0010000-0000-0000-0000-000000000001",
      authorized_by_readiness_decision_id: "dec-demo-001",
      host_organization_id: "99544ae4-8480-42b1-a681-a7b7c75f4343",
      name: "Ranchi Ward 4 Water Filtration Pilot",
      site_description: "Community water distribution center and ward testing laboratory",
      planned_start: new Date().toISOString(),
      planned_end: new Date(Date.now() + 30 * 86400000).toISOString(),
      created_by_actor_id: DEMO_REVIEWER_ACTOR_ID,
      created_at: new Date().toISOString(),
    };
    return { data: synthetic, isDemo: true };
  }
}

export async function createPilotOperationalState(
  pilotId: string,
  payload: PilotOperationalStateCreate
): Promise<{ data: PilotOperationalStateResponse; isDemo: boolean }> {
  try {
    const url = `${getApiBaseUrl()}/api/v1/pilots/${pilotId}/operational-states`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || `HTTP error ${res.status}`);
    }
    const data: PilotOperationalStateResponse = await res.json();
    return { data, isDemo: false };
  } catch (err) {
    if (err instanceof Error && (err.message.includes("409") || err.message.includes("version"))) {
      throw err;
    }
    if (process.env.NEXT_PUBLIC_ENABLE_DEMO_FALLBACK !== "true") throw err;

    const existing = demoOperationalStatesStore[pilotId] || [];
    const latestVersion = existing.length > 0 ? Math.max(...existing.map((s) => s.version)) : 0;
    if (payload.expected_version !== latestVersion) {
      throw new Error(`409 Conflict: Stale expected_version ${payload.expected_version}. Latest version is ${latestVersion}.`);
    }

    const newState: PilotOperationalStateResponse = {
      id: `op-demo-${Date.now()}`,
      pilot_id: pilotId,
      status: payload.status,
      version: latestVersion + 1,
      rationale: payload.rationale,
      recorded_by_actor_id: payload.recorded_by_actor_id || DEMO_REVIEWER_ACTOR_ID,
      recorded_at: new Date().toISOString(),
    };
    demoOperationalStatesStore[pilotId] = [...existing, newState];
    return { data: newState, isDemo: true };
  }
}

export async function fetchPilotOperationalHistory(
  pilotId: string
): Promise<{ data: PilotOperationalHistoryResponse; isDemo: boolean }> {
  try {
    const url = `${getApiBaseUrl()}/api/v1/pilots/${pilotId}/operational-states`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data: PilotOperationalHistoryResponse = await res.json();
    return { data, isDemo: false };
  } catch (err) {
    if (process.env.NEXT_PUBLIC_ENABLE_DEMO_FALLBACK !== "true") throw err;
    const items = demoOperationalStatesStore[pilotId] || [
      {
        id: `op-demo-default-${pilotId}`,
        pilot_id: pilotId,
        status: "PLANNED" as OperationalStatus,
        version: 1,
        rationale: "Initial pilot created from PILOT_READY authorization.",
        recorded_by_actor_id: DEMO_REVIEWER_ACTOR_ID,
        recorded_at: new Date().toISOString(),
      },
    ];
    return { data: { items, total: items.length }, isDemo: true };
  }
}

export async function fetchLatestPilotOperationalState(
  pilotId: string
): Promise<{ data: PilotOperationalStateResponse | null; isDemo: boolean }> {
  try {
    const url = `${getApiBaseUrl()}/api/v1/pilots/${pilotId}/operational-states/latest`;
    const res = await fetch(url, { cache: "no-store" });
    if (res.status === 404) return { data: null, isDemo: false };
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data: PilotOperationalStateResponse = await res.json();
    return { data, isDemo: false };
  } catch (err) {
    if (process.env.NEXT_PUBLIC_ENABLE_DEMO_FALLBACK !== "true") throw err;
    const items = demoOperationalStatesStore[pilotId] || [];
    const latest = items.length > 0 ? items[items.length - 1] : {
      id: `op-demo-default-${pilotId}`,
      pilot_id: pilotId,
      status: "PLANNED" as OperationalStatus,
      version: 1,
      rationale: "Initial pilot created from PILOT_READY authorization.",
      recorded_by_actor_id: DEMO_REVIEWER_ACTOR_ID,
      recorded_at: new Date().toISOString(),
    };
    return { data: latest, isDemo: true };
  }
}

export async function createPilotEvidencePlan(
  pilotId: string,
  payload: PilotEvidencePlanCreate
): Promise<{ data: PilotEvidencePlanResponse; isDemo: boolean }> {
  try {
    const url = `${getApiBaseUrl()}/api/v1/pilots/${pilotId}/evidence-plans`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || `HTTP error ${res.status}`);
    }
    const data: PilotEvidencePlanResponse = await res.json();
    return { data, isDemo: false };
  } catch (err) {
    if (err instanceof Error && (err.message.includes("409") || err.message.includes("version"))) {
      throw err;
    }
    if (process.env.NEXT_PUBLIC_ENABLE_DEMO_FALLBACK !== "true") throw err;

    const existing = demoEvidencePlansStore[pilotId] || [];
    const latestVersion = existing.length > 0 ? Math.max(...existing.map((p) => p.version)) : 0;
    if (payload.expected_version !== latestVersion) {
      throw new Error(`409 Conflict: Stale expected_version ${payload.expected_version}. Latest version is ${latestVersion}.`);
    }

    const newPlan: PilotEvidencePlanResponse = {
      id: `plan-demo-${Date.now()}`,
      pilot_id: pilotId,
      version: latestVersion + 1,
      objective: payload.objective,
      primary_metric: payload.primary_metric,
      baseline_definition: payload.baseline_definition,
      denominator_definition: payload.denominator_definition,
      data_collection_method: payload.data_collection_method,
      evaluation_window: payload.evaluation_window || null,
      success_criteria: payload.success_criteria || null,
      limitations: payload.limitations || null,
      created_by_actor_id: payload.created_by_actor_id || DEMO_REVIEWER_ACTOR_ID,
      created_at: new Date().toISOString(),
    };
    demoEvidencePlansStore[pilotId] = [...existing, newPlan];
    return { data: newPlan, isDemo: true };
  }
}

export async function fetchPilotEvidencePlanHistory(
  pilotId: string
): Promise<{ data: PilotEvidencePlanHistoryResponse; isDemo: boolean }> {
  try {
    const url = `${getApiBaseUrl()}/api/v1/pilots/${pilotId}/evidence-plans`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data: PilotEvidencePlanHistoryResponse = await res.json();
    return { data, isDemo: false };
  } catch (err) {
    if (process.env.NEXT_PUBLIC_ENABLE_DEMO_FALLBACK !== "true") throw err;
    const items = demoEvidencePlansStore[pilotId] || [];
    return { data: { items, total: items.length }, isDemo: true };
  }
}

export async function fetchLatestPilotEvidencePlan(
  pilotId: string
): Promise<{ data: PilotEvidencePlanResponse | null; isDemo: boolean }> {
  try {
    const url = `${getApiBaseUrl()}/api/v1/pilots/${pilotId}/evidence-plans/latest`;
    const res = await fetch(url, { cache: "no-store" });
    if (res.status === 404) return { data: null, isDemo: false };
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data: PilotEvidencePlanResponse = await res.json();
    return { data, isDemo: false };
  } catch (err) {
    if (process.env.NEXT_PUBLIC_ENABLE_DEMO_FALLBACK !== "true") throw err;
    const items = demoEvidencePlansStore[pilotId] || [];
    const latest = items.length > 0 ? items[items.length - 1] : null;
    return { data: latest, isDemo: true };
  }
}

export async function createOutcomeAssessment(
  pilotId: string,
  payload: OutcomeAssessmentCreate
): Promise<{ data: OutcomeAssessmentResponse; isDemo: boolean }> {
  if (payload.conclusion !== "NOT_REVIEWED" && !payload.assessed_by_actor_id) {
    throw new Error(`Conclusion ${payload.conclusion} requires human actor attribution.`);
  }

  try {
    const url = `${getApiBaseUrl()}/api/v1/pilots/${pilotId}/outcomes`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || `HTTP error ${res.status}`);
    }
    const data: OutcomeAssessmentResponse = await res.json();
    return { data, isDemo: false };
  } catch (err) {
    if (err instanceof Error && (err.message.includes("409") || err.message.includes("version") || err.message.includes("requires human"))) {
      throw err;
    }
    if (process.env.NEXT_PUBLIC_ENABLE_DEMO_FALLBACK !== "true") throw err;

    const existing = demoOutcomesStore[pilotId] || [];
    const latestVersion = existing.length > 0 ? Math.max(...existing.map((o) => o.version)) : 0;
    if (payload.expected_version !== latestVersion) {
      throw new Error(`409 Conflict: Stale expected_version ${payload.expected_version}. Latest version is ${latestVersion}.`);
    }

    const newOutcome: OutcomeAssessmentResponse = {
      id: `out-demo-${Date.now()}`,
      pilot_id: pilotId,
      evidence_plan_id: payload.evidence_plan_id,
      version: latestVersion + 1,
      conclusion: payload.conclusion,
      summary: payload.summary,
      limitations: payload.limitations || null,
      assessed_by_actor_id: payload.assessed_by_actor_id || null,
      assessed_at: new Date().toISOString(),
      evidence_ids: payload.evidence_ids || [],
    };
    demoOutcomesStore[pilotId] = [...existing, newOutcome];
    return { data: newOutcome, isDemo: true };
  }
}

export async function fetchOutcomeHistory(
  pilotId: string
): Promise<{ data: OutcomeAssessmentHistoryResponse; isDemo: boolean }> {
  try {
    const url = `${getApiBaseUrl()}/api/v1/pilots/${pilotId}/outcomes`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data: OutcomeAssessmentHistoryResponse = await res.json();
    return { data, isDemo: false };
  } catch (err) {
    if (process.env.NEXT_PUBLIC_ENABLE_DEMO_FALLBACK !== "true") throw err;
    const items = demoOutcomesStore[pilotId] || [];
    return { data: { items, total: items.length }, isDemo: true };
  }
}

export async function fetchLatestOutcomeAssessment(
  pilotId: string
): Promise<{ data: OutcomeAssessmentResponse | null; isDemo: boolean }> {
  try {
    const url = `${getApiBaseUrl()}/api/v1/pilots/${pilotId}/outcomes/latest`;
    const res = await fetch(url, { cache: "no-store" });
    if (res.status === 404) return { data: null, isDemo: false };
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data: OutcomeAssessmentResponse = await res.json();
    return { data, isDemo: false };
  } catch (err) {
    if (process.env.NEXT_PUBLIC_ENABLE_DEMO_FALLBACK !== "true") throw err;
    const items = demoOutcomesStore[pilotId] || [];
    const latest = items.length > 0 ? items[items.length - 1] : null;
    return { data: latest, isDemo: true };
  }
}

// ==========================================
// P4B PLATFORM ADMIN API FUNCTIONS
// ==========================================

export interface AdminOverviewResponse {
  active_accounts: number;
  active_organizations: number;
  pending_organizations: number;
  suspended_organizations: number;
  open_clarifications: number;
  total_challenges: number;
  active_pilots: number;
  readiness_review_required: number;
}

export interface AdminOrganizationItem {
  id: string;
  name: string;
  organization_type: string;
  district: string;
  state: string;
  status: string;
  status_rationale?: string;
  created_at: string;
  members_count: number;
  capabilities_count: number;
}

export interface AdminOrganizationsResponse {
  items: AdminOrganizationItem[];
  total: number;
  page: number;
  limit: number;
}

export interface AdminUserItem {
  id: string;
  display_name: string;
  email: string | null;
  platform_role: string;
  is_active: boolean;
  created_at: string;
  organizations: string[];
}

export interface AdminUsersResponse {
  items: AdminUserItem[];
  total: number;
  page: number;
  limit: number;
}

export interface AdminAuditLogItem {
  id: string;
  event_type: string;
  actor_id?: string;
  ip_address?: string;
  details?: string;
  created_at: string;
}

export interface AdminAuditLogsResponse {
  items: AdminAuditLogItem[];
  total: number;
  page: number;
  limit: number;
}

export interface AdminAIOperationsResponse {
  ai_enabled: boolean;
  provider: string;
  model: string;
  total_requests: number;
  success_count: number;
  failure_count: number;
  avg_latency_ms: number;
  circuit_breaker_status: string;
  task_breakdown: Record<string, number>;
  recent_entries: Array<{
    id: string;
    task_type: string;
    actor_id?: string;
    challenge_id?: string;
    provider: string;
    model: string;
    prompt_version: string;
    success: boolean;
    latency_ms: number;
    created_at: string;
  }>;
}

export async function fetchAdminOverview(): Promise<AdminOverviewResponse> {
  const url = `${getApiBaseUrl()}/api/v1/admin/overview`;
  const res = await fetch(url, { credentials: "include", cache: "no-store" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: `HTTP error ${res.status}` }));
    throw new Error(err.detail || "Failed to fetch admin overview");
  }
  return res.json();
}

export async function fetchAdminOrganizations(
  status?: string,
  org_type?: string,
  page: number = 1,
  limit: number = 20
): Promise<AdminOrganizationsResponse> {
  const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
  if (status) params.append("status", status);
  if (org_type) params.append("org_type", org_type);

  const url = `${getApiBaseUrl()}/api/v1/admin/organizations?${params.toString()}`;
  const res = await fetch(url, { credentials: "include", cache: "no-store" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: `HTTP error ${res.status}` }));
    throw new Error(err.detail || "Failed to fetch admin organizations");
  }
  return res.json();
}

export async function updateAdminOrganizationStatus(
  orgId: string,
  status: string,
  rationale?: string
): Promise<AdminOrganizationItem> {
  const url = `${getApiBaseUrl()}/api/v1/admin/organizations/${orgId}/status`;
  const res = await fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ status, rationale }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: `HTTP error ${res.status}` }));
    throw new Error(err.detail || "Failed to update organization status");
  }
  return res.json();
}

export async function fetchAdminUsers(
  role?: string,
  is_active?: boolean,
  search?: string,
  page: number = 1,
  limit: number = 20
): Promise<AdminUsersResponse> {
  const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
  if (role) params.append("role", role);
  if (is_active !== undefined) params.append("is_active", is_active.toString());
  if (search) params.append("search", search);

  const url = `${getApiBaseUrl()}/api/v1/admin/users?${params.toString()}`;
  const res = await fetch(url, { credentials: "include", cache: "no-store" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: `HTTP error ${res.status}` }));
    throw new Error(err.detail || "Failed to fetch admin users");
  }
  return res.json();
}

export async function updateAdminUserStatus(
  userId: string,
  is_active: boolean,
  rationale?: string
): Promise<{ id: string; display_name: string; email: string | null; platform_role: string; is_active: boolean }> {
  const url = `${getApiBaseUrl()}/api/v1/admin/users/${userId}/status`;
  const res = await fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ is_active, rationale }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: `HTTP error ${res.status}` }));
    throw new Error(err.detail || "Failed to update user status");
  }
  return res.json();
}

export async function updateAdminUserRole(
  userId: string,
  new_role: string,
  rationale: string
): Promise<{ id: string; display_name: string; platform_role: string; is_active: boolean }> {
  const url = `${getApiBaseUrl()}/api/v1/admin/users/${userId}/role`;
  const res = await fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ new_role, rationale }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: `HTTP error ${res.status}` }));
    throw new Error(err.detail || "Failed to update user role");
  }
  return res.json();
}

export async function fetchAdminAuditLogs(
  event_type?: string,
  actor_id?: string,
  page: number = 1,
  limit: number = 20
): Promise<AdminAuditLogsResponse> {
  const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
  if (event_type) params.append("event_type", event_type);
  if (actor_id) params.append("actor_id", actor_id);

  const url = `${getApiBaseUrl()}/api/v1/admin/audit?${params.toString()}`;
  const res = await fetch(url, { credentials: "include", cache: "no-store" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: `HTTP error ${res.status}` }));
    throw new Error(err.detail || "Failed to fetch admin audit logs");
  }
  return res.json();
}

export async function fetchAdminAIOperations(): Promise<AdminAIOperationsResponse> {
  const url = `${getApiBaseUrl()}/api/v1/admin/ai-operations`;
  const res = await fetch(url, { credentials: "include", cache: "no-store" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: `HTTP error ${res.status}` }));
    throw new Error(err.detail || "Failed to fetch AI operations telemetry");
  }
  return res.json();
}
