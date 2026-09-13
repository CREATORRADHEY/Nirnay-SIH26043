"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ShieldCheck,
  MapPin,
  Tag,
  Calendar,
  FileCheck2,
  Building2,
  Sparkles,
  Info,
  Plus,
  AlertTriangle,
} from "lucide-react";

import { ProductShell } from "@/components/shell/ProductShell";
import {
  fetchChallengeDetail,
  fetchChallengeEvidence,
  fetchQualificationHistory,
  fetchLatestQualification,
  createQualificationDecision,
  fetchHEIOrganizations,
  fetchHEICandidates,
  createHEICandidate,
  DEMO_REVIEWER_ACTOR_ID,
} from "@/lib/api";
import {
  ChallengeResponse,
  EvidenceResponse,
  QualificationDecisionResponse,
  QualificationRoute,
  HEIOrganization,
  HEICandidateResponse,
} from "@/lib/types/challenge";

import { LatestDecisionPanel } from "@/components/qualification/LatestDecisionPanel";
import { DecisionTimeline } from "@/components/qualification/DecisionTimeline";
import { RecordDecisionModal } from "@/components/qualification/RecordDecisionModal";

import { HEISemanticStrip } from "@/components/hei-matching/HEISemanticStrip";
import { HEIMatchingGate } from "@/components/hei-matching/HEIMatchingGate";
import { CandidateList } from "@/components/hei-matching/CandidateList";
import { HEIDirectoryList } from "@/components/hei-matching/HEIDirectoryList";
import { CapabilityInspectionSheet } from "@/components/hei-matching/CapabilityInspectionSheet";
import { CreateCandidateSheet } from "@/components/hei-matching/CreateCandidateSheet";

interface PassportPageProps {
  params: Promise<{ challengeId: string }>;
}

export default function ChallengePassportPage({ params }: PassportPageProps) {
  const resolvedParams = use(params);
  const challengeId = resolvedParams.challengeId;

  const [challenge, setChallenge] = useState<ChallengeResponse | null>(null);
  const [evidenceList, setEvidenceList] = useState<EvidenceResponse[]>([]);
  const [qualificationList, setQualificationList] = useState<
    QualificationDecisionResponse[]
  >([]);
  const [latestDecision, setLatestDecision] =
    useState<QualificationDecisionResponse | null>(null);

  const [heiOrganizations, setHeiOrganizations] = useState<HEIOrganization[]>([]);
  const [candidatesList, setCandidatesList] = useState<HEICandidateResponse[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDemo, setIsDemo] = useState(false);

  // Modal / Sheet UI states
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [inspectOrg, setInspectOrg] = useState<HEIOrganization | null>(null);
  const [candidateOrg, setCandidateOrg] = useState<HEIOrganization | null>(null);

  const [activeTab, setActiveTab] = useState<
    | "Overview"
    | "Evidence"
    | "Qualification"
    | "HEI Match"
    | "Commitments"
    | "Pilot Readiness"
    | "Pilots"
    | "Outcomes"
  >("Overview");

  const tabs = [
    "Overview",
    "Evidence",
    "Qualification",
    "HEI Match",
    "Commitments",
    "Pilot Readiness",
    "Pilots",
    "Outcomes",
  ] as const;

    const loadPassportData = async () => {
    try {
      const [cRes, eRes, qHistRes, qLatestRes, heiOrgsRes, candsRes] =
        await Promise.all([
          fetchChallengeDetail(challengeId),
          fetchChallengeEvidence(challengeId),
          fetchQualificationHistory(challengeId),
          fetchLatestQualification(challengeId),
          fetchHEIOrganizations(),
          fetchHEICandidates(challengeId),
        ]);

      setChallenge(cRes.data);
      setEvidenceList(eRes.data.items);
      setQualificationList(qHistRes.data.items);
      setLatestDecision(qLatestRes.data);
      setHeiOrganizations(heiOrgsRes.data.items);
      setCandidatesList(candsRes.data.items);

      setIsDemo(
        cRes.isDemo ||
          eRes.isDemo ||
          qHistRes.isDemo ||
          heiOrgsRes.isDemo ||
          candsRes.isDemo
      );
    } catch {
      setError("Could not load Challenge Passport data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    async function init() {
      setLoading(true);
      setError(null);
      try {
        const [cRes, eRes, qHistRes, qLatestRes, heiOrgsRes, candsRes] =
          await Promise.all([
            fetchChallengeDetail(challengeId),
            fetchChallengeEvidence(challengeId),
            fetchQualificationHistory(challengeId),
            fetchLatestQualification(challengeId),
            fetchHEIOrganizations(),
            fetchHEICandidates(challengeId),
          ]);

        if (isMounted) {
          setChallenge(cRes.data);
          setEvidenceList(eRes.data.items);
          setQualificationList(qHistRes.data.items);
          setLatestDecision(qLatestRes.data);
          setHeiOrganizations(heiOrgsRes.data.items);
          setCandidatesList(candsRes.data.items);

          setIsDemo(
            cRes.isDemo ||
              eRes.isDemo ||
              qHistRes.isDemo ||
              heiOrgsRes.isDemo ||
              candsRes.isDemo
          );
        }
      } catch {
        if (isMounted) {
          setError("Could not load Challenge Passport data.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    init();
    return () => {
      isMounted = false;
    };
  }, [challengeId]);

  const handleRecordDecisionSubmit = async (data: {
    route: QualificationRoute;
    rationale: string;
    evidence_ids: string[];
  }) => {
    if (!DEMO_REVIEWER_ACTOR_ID) {
      throw new Error("Demo reviewer identity is not configured.");
    }
    await createQualificationDecision(challengeId, {
      route: data.route,
      rationale: data.rationale,
      decided_by_actor_id: DEMO_REVIEWER_ACTOR_ID,
      evidence_ids: data.evidence_ids,
    });
    // Auto-refresh passport state
    await loadPassportData();
  };

  const handleCreateCandidateSubmit = async (data: {
    organization_id: string;
    match_method: string;
    rationale: string;
  }) => {
    if (!DEMO_REVIEWER_ACTOR_ID) {
      throw new Error("Demo reviewer identity is not configured.");
    }
    await createHEICandidate(challengeId, {
      organization_id: data.organization_id,
      match_method: data.match_method,
      rationale: data.rationale,
      created_by_actor_id: DEMO_REVIEWER_ACTOR_ID,
    });
    // Auto-refresh candidate list
    await loadPassportData();
  };

  if (loading) {
    return (
      <ProductShell>
        <div className="p-8 space-y-4 animate-pulse">
          <div className="h-4 bg-[#E8E4D9] rounded w-1/4" />
          <div className="h-8 bg-[#E8E4D9] rounded w-2/3" />
          <div className="h-32 bg-[#E8E4D9] rounded w-full" />
        </div>
      </ProductShell>
    );
  }

  if (error || !challenge) {
    return (
      <ProductShell>
        <div className="p-12 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-center space-y-4">
          <Info className="w-8 h-8 text-amber-600 mx-auto" />
          <h2 className="text-lg font-bold text-[var(--text-primary)]">
            Challenge Passport Not Found
          </h2>
          <p className="text-xs text-[var(--text-secondary)]">
            {error || "The requested challenge record could not be retrieved."}
          </p>
          <Link
            href="/challenges"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded bg-[var(--primary)] text-white text-xs font-semibold hover:bg-[var(--primary-hover)] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Explorer
          </Link>
        </div>
      </ProductShell>
    );
  }

  // Factual Journey progression steps derived strictly from backend API states
  const journeySteps = [
    { label: "Challenge", status: "complete", detail: "Factual Record" },
    {
      label: "Evidence",
      status: evidenceList.length > 0 ? "complete" : "neutral",
      detail: `${evidenceList.length} Attached`,
    },
    {
      label: "Qualification",
      status: latestDecision ? "complete" : "neutral",
      detail: latestDecision ? latestDecision.route : "Pending Review",
    },
    {
      label: "HEI Match",
      status: candidatesList.length > 0 ? "complete" : "neutral",
      detail: `${candidatesList.length} Candidates`,
    },
    { label: "Commitment", status: "neutral", detail: "Future Phase" },
    { label: "Readiness", status: "neutral", detail: "Future Phase" },
    { label: "Pilot", status: "neutral", detail: "Future Phase" },
    { label: "Outcome", status: "neutral", detail: "Future Phase" },
  ];

  const candidateOrgIds = candidatesList.map((c) => c.organization_id);

  return (
    <ProductShell isDemo={isDemo}>
      <div className="space-y-6">
        {/* Back Link & Header Badge */}
        <div className="flex items-center justify-between">
          <Link
            href="/challenges"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Challenges
          </Link>
          <span className="text-[10px] font-mono bg-[#F2EFE9] text-[var(--text-secondary)] px-2 py-0.5 rounded border border-[var(--border)] uppercase font-semibold">
            FACTUAL PASSPORT RECORD
          </span>
        </div>

        {/* Demo Data Notice Banner */}
        {isDemo && (
          <div className="p-3 rounded-lg bg-[#FFF4EE] border border-[#FCD8C5] flex items-center justify-between text-xs text-[var(--text-primary)]">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[var(--primary)]" />
              <span>
                <strong className="font-semibold">DEMO PASSPORT MODE:</strong> Real backend workflow state rendered with synthetic fallback support.
              </span>
            </div>
            <span className="font-mono text-[10px] bg-[#E8E4D9] px-2 py-0.5 rounded text-[var(--text-secondary)]">
              SAMPLE DATA
            </span>
          </div>
        )}

        {/* Missing Reviewer Identity Warning */}
        {!DEMO_REVIEWER_ACTOR_ID && (
          <div className="p-3 rounded-lg bg-amber-50 border border-amber-300 text-amber-900 flex items-center gap-2 text-xs font-medium">
            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
            <span>Demo reviewer identity is not configured. Mutation actions will be disabled.</span>
          </div>
        )}

        {/* Passport Header Title Block */}
        <div className="p-6 sm:p-8 rounded-xl border border-[var(--border)] bg-[var(--surface)] space-y-4 shadow-xs">
          <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-secondary)]">
            <span className="font-mono font-semibold text-[var(--primary)]">
              ID: {challenge.id}
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
              {challenge.district}, {challenge.state}
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
              Created:{" "}
              {new Date(challenge.created_at).toLocaleDateString("en-IN", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight leading-snug">
            {challenge.title}
          </h1>

          <div className="flex flex-wrap gap-2 pt-1">
            <span className="px-3 py-1 text-xs rounded-full bg-[#F4F1EA] text-[var(--text-primary)] border border-[var(--border)] font-medium inline-flex items-center gap-1">
              <Tag className="w-3 h-3 text-[var(--primary)]" /> {challenge.domain}
            </span>
            <span className="px-3 py-1 text-xs rounded-full bg-[#F4F1EA] text-[var(--text-secondary)] border border-[var(--border)] font-medium">
              Source: {challenge.source_type}
            </span>
          </div>
        </div>

        {/* Passport Journey Progression Strip */}
        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
            <span>PASSPORT JOURNEY WORKFLOW</span>
            <span className="font-mono text-[var(--primary)]">FACTUAL AUDIT TRAIL</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 pt-1">
            {journeySteps.map((step, idx) => (
              <div
                key={idx}
                className={`p-2 rounded border text-center text-xs flex flex-col justify-between h-14 ${
                  step.status === "complete"
                    ? "bg-[#EBF5EE] border-[#C6E7D0] text-[#166534]"
                    : "bg-[#F9F7F2] border-[var(--border)] text-[var(--text-secondary)] opacity-80"
                }`}
              >
                <span className="font-bold truncate text-[11px]">{step.label}</span>
                <span className="text-[9px] font-mono truncate">{step.detail}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Passport Internal Tabs */}
        <div className="border-b border-[var(--border)] flex gap-1 overflow-x-auto pb-0">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-xs font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
                activeTab === tab
                  ? "border-[var(--primary)] text-[var(--primary)] font-semibold"
                  : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content Display */}

        {/* OVERVIEW TAB */}
        {activeTab === "Overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Main Narrative Column */}
            <div className="lg:col-span-8 space-y-6">
              <div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--surface)] space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--primary)]">
                  Problem Summary
                </h3>
                <p className="text-sm text-[var(--text-primary)] leading-relaxed font-medium">
                  {challenge.summary}
                </p>
              </div>

              <div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--surface)] space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                  Full Problem Description & Context
                </h3>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">
                  {challenge.description}
                </p>
              </div>
            </div>

            {/* Metadata Rail */}
            <div className="lg:col-span-4 space-y-4">
              <div className="p-5 rounded-xl border border-[var(--border)] bg-[var(--surface)] space-y-3 text-xs">
                <h3 className="font-bold text-[var(--text-primary)] uppercase tracking-wider border-b border-[var(--border)] pb-2">
                  Passport Metadata Rail
                </h3>

                <div className="space-y-2.5 text-[var(--text-secondary)]">
                  <div>
                    <span className="block font-medium text-[10px] uppercase text-[var(--text-secondary)]">
                      Challenge Record ID
                    </span>
                    <span className="font-mono text-xs text-[var(--text-primary)] font-bold">
                      {challenge.id}
                    </span>
                  </div>

                  <div>
                    <span className="block font-medium text-[10px] uppercase text-[var(--text-secondary)]">
                      Domain
                    </span>
                    <span className="text-xs text-[var(--text-primary)] font-medium">
                      {challenge.domain}
                    </span>
                  </div>

                  <div>
                    <span className="block font-medium text-[10px] uppercase text-[var(--text-secondary)]">
                      Source Type
                    </span>
                    <span className="text-xs text-[var(--text-primary)] font-medium">
                      {challenge.source_type}
                    </span>
                  </div>

                  <div>
                    <span className="block font-medium text-[10px] uppercase text-[var(--text-secondary)]">
                      District & State
                    </span>
                    <span className="text-xs text-[var(--text-primary)] font-medium">
                      {challenge.district}, {challenge.state}
                    </span>
                  </div>

                  <div>
                    <span className="block font-medium text-[10px] uppercase text-[var(--text-secondary)]">
                      Submitted By Actor ID
                    </span>
                    <span className="font-mono text-xs text-[var(--text-primary)]">
                      {challenge.submitted_by_actor_id || "Not provided"}
                    </span>
                  </div>

                  <div>
                    <span className="block font-medium text-[10px] uppercase text-[var(--text-secondary)]">
                      Source Organization ID
                    </span>
                    <span className="font-mono text-xs text-[var(--text-primary)]">
                      {challenge.source_organization_id || "Not provided"}
                    </span>
                  </div>

                  <div>
                    <span className="block font-medium text-[10px] uppercase text-[var(--text-secondary)]">
                      Created Timestamp
                    </span>
                    <span className="text-xs text-[var(--text-primary)]">
                      {new Date(challenge.created_at).toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div>
                    <span className="block font-medium text-[10px] uppercase text-[var(--text-secondary)]">
                      Updated Timestamp
                    </span>
                    <span className="text-xs text-[var(--text-primary)]">
                      {new Date(challenge.updated_at).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* EVIDENCE TAB */}
        {activeTab === "Evidence" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                Attached Evidence Records ({evidenceList.length})
              </h3>
            </div>

            {evidenceList.length === 0 ? (
              <div className="p-8 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-center space-y-2">
                <FileCheck2 className="w-8 h-8 text-[var(--text-secondary)] mx-auto opacity-50" />
                <p className="text-xs font-semibold text-[var(--text-primary)]">
                  No evidence metadata has been attached to this challenge yet.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {evidenceList.map((ev) => (
                  <div
                    key={ev.id}
                    className="p-5 rounded-xl border border-[var(--border)] bg-[var(--surface)] space-y-2 shadow-xs"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 text-xs font-semibold rounded bg-[#F4F1EA] text-[var(--primary)] border border-[var(--border)]">
                          {ev.evidence_type}
                        </span>
                        <span className="text-xs font-mono text-[var(--text-secondary)]">
                          ID: {ev.id.slice(0, 13)}...
                        </span>
                      </div>
                      <span className="text-[11px] text-[var(--text-secondary)]">
                        Submitted: {new Date(ev.submitted_at).toLocaleDateString("en-IN")}
                      </span>
                    </div>

                    <p className="text-xs text-[var(--text-primary)] font-medium leading-relaxed">
                      {ev.description || "No description provided."}
                    </p>

                    <div className="pt-2 border-t border-[var(--border)] flex flex-wrap items-center justify-between text-[11px] text-[var(--text-secondary)] font-mono">
                      <span>
                        Evidence reference:{" "}
                        <code className="bg-[#F2EFE9] px-1.5 py-0.5 rounded text-[var(--text-primary)]">
                          {ev.storage_reference}
                        </code>
                      </span>
                      {ev.captured_at && (
                        <span>Captured: {new Date(ev.captured_at).toLocaleDateString("en-IN")}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* QUALIFICATION TAB */}
        {activeTab === "Qualification" && (
          <div className="space-y-6">
            {/* Qualification Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[var(--border)] pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--primary)]">
                  QUALIFICATION REVIEW
                </span>
                <h2 className="text-2xl font-bold tracking-tight text-[var(--text-primary)] mt-1">
                  Should this problem enter innovation?
                </h2>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1 max-w-xl leading-relaxed">
                  Qualification separates service issues, clarification needs, research questions and genuine innovation challenges before ecosystem resources are committed.
                </p>
              </div>

              <button
                onClick={() => setShowRecordModal(true)}
                disabled={!DEMO_REVIEWER_ACTOR_ID}
                className="px-4 py-2.5 rounded bg-[var(--primary)] text-white text-xs font-semibold hover:bg-[var(--primary-hover)] transition-colors inline-flex items-center gap-1.5 shrink-0 disabled:opacity-50 cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" /> Record Decision
              </button>
            </div>

            {/* Latest Decision Panel or Empty State */}
            {latestDecision ? (
              <LatestDecisionPanel decision={latestDecision} />
            ) : (
              <div className="p-8 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-center space-y-3">
                <ShieldCheck className="w-10 h-10 text-[var(--text-secondary)] mx-auto opacity-50" />
                <h3 className="text-sm font-bold text-[var(--text-primary)]">
                  Qualification review has not been recorded yet.
                </h3>
                <p className="text-xs text-[var(--text-secondary)] max-w-md mx-auto leading-relaxed">
                  Human qualification decision will classify this challenge into SERVICE, CLARIFY, RESEARCH_REVIEW, or INNOVATION_CHALLENGE.
                </p>
                <button
                  onClick={() => setShowRecordModal(true)}
                  disabled={!DEMO_REVIEWER_ACTOR_ID}
                  className="px-4 py-2 rounded bg-[var(--primary)] text-white text-xs font-semibold hover:bg-[var(--primary-hover)] transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Record First Decision
                </button>
              </div>
            )}

            {/* Decision History Audit Timeline */}
            <DecisionTimeline history={qualificationList} />

            {/* Record Decision Modal */}
            <RecordDecisionModal
              isOpen={showRecordModal}
              onClose={() => setShowRecordModal(false)}
              onSubmit={handleRecordDecisionSubmit}
              evidenceList={evidenceList}
              reviewerActorId={DEMO_REVIEWER_ACTOR_ID}
            />
          </div>
        )}

        {/* HEI MATCH TAB */}
        {activeTab === "HEI Match" && (
          <div className="space-y-6">
            {/* Semantic Strip */}
            <HEISemanticStrip />

            {/* Workflow Gate Check */}
            {latestDecision?.route !== "INNOVATION_CHALLENGE" ? (
              <HEIMatchingGate currentRoute={latestDecision?.route} />
            ) : (
              <div className="space-y-6">
                {/* Existing Candidate Matches */}
                <CandidateList
                  candidates={candidatesList}
                  organizations={heiOrganizations}
                  onInspectCapabilities={(orgId) => {
                    const org = heiOrganizations.find((o) => o.organization_id === orgId);
                    if (org) setInspectOrg(org);
                  }}
                />

                {/* Eligible HEI Discovery Directory */}
                <HEIDirectoryList
                  organizations={heiOrganizations}
                  candidateOrgIds={candidateOrgIds}
                  onInspectCapabilities={(org) => setInspectOrg(org)}
                  onAddCandidate={(org) => setCandidateOrg(org)}
                />

                {/* Capability Inspection Side Sheet */}
                <CapabilityInspectionSheet
                  organization={inspectOrg}
                  onClose={() => setInspectOrg(null)}
                />

                {/* Create Candidate Side Sheet */}
                <CreateCandidateSheet
                  organization={candidateOrg}
                  onClose={() => setCandidateOrg(null)}
                  onSubmit={handleCreateCandidateSubmit}
                  reviewerActorId={DEMO_REVIEWER_ACTOR_ID}
                />
              </div>
            )}
          </div>
        )}

        {/* Structured Future Tab Placeholders */}
        {["Commitments", "Pilot Readiness", "Pilots", "Outcomes"].includes(activeTab) && (
          <div className="p-10 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-center space-y-3 shadow-xs">
            <Building2 className="w-8 h-8 text-[var(--text-secondary)] mx-auto opacity-50" />
            <h3 className="text-sm font-bold text-[var(--text-primary)]">
              {activeTab} Workflow Phase
            </h3>
            <p className="text-xs text-[var(--text-secondary)] max-w-md mx-auto leading-relaxed">
              This workflow stage will activate automatically as human qualification decisions, HEI candidate matching, commitments, and readiness sign-offs progress.
            </p>
            <span className="inline-block text-[10px] font-mono bg-[#F2EFE9] text-[var(--text-secondary)] px-2.5 py-1 rounded border border-[var(--border)]">
              FUTURE WORKFLOW STAGE
            </span>
          </div>
        )}
      </div>
    </ProductShell>
  );
}
