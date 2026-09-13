import type {
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
} from "./types/challenge";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export const DEMO_REVIEWER_ACTOR_ID =
  process.env.NEXT_PUBLIC_DEMO_REVIEWER_ACTOR_ID || "d99c55a9-e4d4-42c1-abd1-5e9ccb2ad67c";

// Fallback synthetic demo data for frontend resilience when backend is unreachable
export const DEMO_CHALLENGES: ChallengeResponse[] = [
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

    const url = `${API_BASE_URL}/api/v1/challenges?${query.toString()}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data: ChallengeListResponse = await res.json();
    return { data, isDemo: false };
  } catch {
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
    const url = `${API_BASE_URL}/api/v1/challenges/${challengeId}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data: ChallengeResponse = await res.json();
    return { data, isDemo: false };
  } catch {
    const found = DEMO_CHALLENGES.find((c) => c.id === challengeId) || DEMO_CHALLENGES[0];
    return { data: found, isDemo: true };
  }
}

export async function fetchChallengeEvidence(
  challengeId: string
): Promise<{ data: EvidenceListResponse; isDemo: boolean }> {
  try {
    const url = `${API_BASE_URL}/api/v1/challenges/${challengeId}/evidence`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data: EvidenceListResponse = await res.json();
    return { data, isDemo: false };
  } catch {
    const demoEv = DEMO_EVIDENCE[challengeId] || { items: [], total: 0 };
    return { data: demoEv, isDemo: true };
  }
}

export async function fetchQualificationHistory(
  challengeId: string
): Promise<{ data: QualificationHistoryResponse; isDemo: boolean }> {
  try {
    const url = `${API_BASE_URL}/api/v1/challenges/${challengeId}/qualification-decisions`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data: QualificationHistoryResponse = await res.json();
    return { data, isDemo: false };
  } catch {
    const items = demoQualificationsStore[challengeId] || [];
    return { data: { items, total: items.length }, isDemo: true };
  }
}

export async function fetchLatestQualification(
  challengeId: string
): Promise<{ data: QualificationDecisionResponse | null; isDemo: boolean }> {
  try {
    const url = `${API_BASE_URL}/api/v1/challenges/${challengeId}/qualification-decisions/latest`;
    const res = await fetch(url, { cache: "no-store" });
    if (res.status === 404) return { data: null, isDemo: false };
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data: QualificationDecisionResponse = await res.json();
    return { data, isDemo: false };
  } catch {
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
    const url = `${API_BASE_URL}/api/v1/challenges/${challengeId}/qualification-decisions`;
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
    const url = `${API_BASE_URL}/api/v1/hei-organizations`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data: HEIOrganizationListResponse = await res.json();
    return { data, isDemo: false };
  } catch {
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
    const url = `${API_BASE_URL}/api/v1/challenges/${challengeId}/hei-candidates`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data: HEICandidateListResponse = await res.json();
    return { data, isDemo: false };
  } catch {
    const items = demoCandidatesStore[challengeId] || [];
    return { data: { items, total: items.length }, isDemo: true };
  }
}

export async function createHEICandidate(
  challengeId: string,
  payload: HEICandidateCreate
): Promise<{ data: HEICandidateResponse; isDemo: boolean }> {
  try {
    const url = `${API_BASE_URL}/api/v1/challenges/${challengeId}/hei-candidates`;
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
    const url = `${API_BASE_URL}/api/v1/organizations/${organizationId}/hei-capabilities`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data: HEICapability[] = await res.json();
    return { data, isDemo: false };
  } catch {
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
