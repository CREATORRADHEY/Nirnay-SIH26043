import type {
  ChallengeListResponse,
  ChallengeResponse,
  EvidenceListResponse,
  QualificationHistoryResponse,
} from "./types/challenge.ts";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

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
  {
    id: "c0030000-0000-0000-0000-000000000003",
    title: "Maternal Health Tele-Consultation for Remote Tribal Wards",
    summary:
      "High maternal mortality risks in rural West Singhbhum due to geographical isolation and lack of specialist obstetric diagnostic support.",
    description:
      "Auxiliary Nurse Midwives (ANMs) in sub-centers across West Singhbhum lack real-time telemedicine tools and portable diagnostic devices to detect high-risk pregnancy indicators early. Pregnant women travel over 40km over difficult terrain for routine ultrasound and specialist consultations.",
    domain: "Healthcare",
    source_type: "NGO Survey",
    district: "West Singhbhum",
    state: "Jharkhand",
    submitted_by_actor_id: null,
    source_organization_id: null,
    created_at: "2026-03-14T11:00:00Z",
    updated_at: "2026-03-14T11:00:00Z",
  },
  {
    id: "c0040000-0000-0000-0000-000000000004",
    title: "Digital Skill Enablement & Market Access for Artisan Weavers",
    summary:
      "Traditional handloom weavers in Dhanbad struggle with direct market linkages and digital inventory management.",
    description:
      "Traditional weaver clusters in Dhanbad rely on intermediaries who capture up to 70% of artisan value. Weavers lack basic digital cataloging skills, standardized quality verification tools, and direct e-commerce onboarding support.",
    domain: "Rural Economy",
    source_type: "Community Representation",
    district: "Dhanbad",
    state: "Jharkhand",
    submitted_by_actor_id: null,
    source_organization_id: null,
    created_at: "2026-03-15T16:45:00Z",
    updated_at: "2026-03-15T16:45:00Z",
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
      {
        id: "e0020000-0000-0000-0000-000000000002",
        challenge_id: "c0010000-0000-0000-0000-000000000001",
        evidence_type: "Water Sample Test",
        storage_reference: "gcs://nirnay-evidence/ranchi-lab-test-water.json",
        description:
          "Lab analysis indicating elevated total dissolved solids (TDS) and bacterial contamination in 8 unmonitored borewells.",
        captured_at: "2026-03-05T14:30:00Z",
        submitted_at: "2026-03-10T10:15:00Z",
      },
    ],
    total: 2,
  },
};

export const DEMO_QUALIFICATIONS: Record<string, QualificationHistoryResponse> = {
  "c0010000-0000-0000-0000-000000000001": {
    items: [
      {
        id: "q0010000-0000-0000-0000-000000000001",
        challenge_id: "c0010000-0000-0000-0000-000000000001",
        route: "INNOVATION_CHALLENGE",
        version: 1,
        rationale:
          "Problem involves complex hydrogeological technology, requiring interdisciplinary academic research partnership and pilot testing before municipal scaling.",
        decided_by_actor_id: "a0010000-0000-0000-0000-000000000001",
        decided_at: "2026-03-11T12:00:00Z",
        evidence_ids: ["e0010000-0000-0000-0000-000000000001"],
      },
    ],
    total: 1,
  },
};

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
  } catch (err) {
    console.warn("Backend API unreachable, using demo data fallback:", err);
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
  } catch (err) {
    console.warn("Backend API unreachable, using demo challenge fallback:", err);
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
  } catch (err) {
    console.warn("Backend API unreachable, using demo evidence fallback:", err);
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
  } catch (err) {
    console.warn("Backend API unreachable, using demo qualification fallback:", err);
    const demoQual = DEMO_QUALIFICATIONS[challengeId] || { items: [], total: 0 };
    return { data: demoQual, isDemo: true };
  }
}
