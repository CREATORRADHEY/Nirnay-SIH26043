"use client";

import { useEffect, useState, use, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ShieldCheck,
  MapPin,
  Tag,
  Calendar,
  Building2,
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
  fetchCommitments,
  fetchReadinessConditions,
  fetchLatestReadinessConditions,
  fetchReadinessHistory,
  fetchLatestReadinessDecision,
  fetchChallengePilots,
  fetchLatestPilotOperationalState,
  fetchLatestOutcomeAssessment,
  DEMO_REVIEWER_ACTOR_ID,
} from "@/lib/api";
import {
  ChallengeResponse,
  EvidenceResponse,
  QualificationDecisionResponse,
  QualificationRoute,
  HEIOrganization,
  HEICandidateResponse,
  CommitmentResponse,
  ReadinessConditionResponse,
  ReadinessDecisionResponse,
  PilotResponse,
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

import { CommitmentSemanticStrip } from "@/components/commitments/CommitmentSemanticStrip";
import { CandidateToCommitmentList } from "@/components/commitments/CandidateToCommitmentList";
import { RecordCommitmentSheet } from "@/components/commitments/RecordCommitmentSheet";
import { CommitmentTimeline } from "@/components/commitments/CommitmentTimeline";

import { HeroInvalidationNotice } from "@/components/readiness/HeroInvalidationNotice";
import { ReadinessOverviewPanel } from "@/components/readiness/ReadinessOverviewPanel";
import { ConditionMatrix } from "@/components/readiness/ConditionMatrix";
import { AssessConditionSheet } from "@/components/readiness/AssessConditionSheet";
import { RecordReadinessDecisionSheet } from "@/components/readiness/RecordReadinessDecisionSheet";
import { ReadinessTimeline } from "@/components/readiness/ReadinessTimeline";
import { PilotList } from "@/components/pilots/PilotList";
import { CreatePilotSheet } from "@/components/pilots/CreatePilotSheet";

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

  // Commitment & Readiness states
  const [commitmentsList, setCommitmentsList] = useState<CommitmentResponse[]>([]);
  const [latestConditionsList, setLatestConditionsList] = useState<ReadinessConditionResponse[]>([]);
  const [allConditionsList, setAllConditionsList] = useState<ReadinessConditionResponse[]>([]);
  const [readinessDecisionsList, setReadinessDecisionsList] = useState<ReadinessDecisionResponse[]>([]);
  const [latestReadinessDecision, setLatestReadinessDecision] = useState<ReadinessDecisionResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDemo, setIsDemo] = useState(false);

  // Modal / Sheet UI states
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [inspectOrg, setInspectOrg] = useState<HEIOrganization | null>(null);
  const [candidateOrg, setCandidateOrg] = useState<HEIOrganization | null>(null);

  const [recordCommitmentOrg, setRecordCommitmentOrg] = useState<{ organization_id: string; name: string } | null>(null);
  const [showAssessConditionSheet, setShowAssessConditionSheet] = useState(false);
  const [showRecordReadinessDecisionSheet, setShowRecordReadinessDecisionSheet] = useState(false);
  const [pilotsList, setPilotsList] = useState<PilotResponse[]>([]);
  const [showCreatePilotSheet, setShowCreatePilotSheet] = useState(false);

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

  const loadPassportData = useCallback(async () => {
    try {
      const [
        cRes,
        eRes,
        qHistRes,
        qLatestRes,
        heiOrgsRes,
        candsRes,
        commRes,
        condLatestRes,
        condAllRes,
        decHistRes,
        decLatestRes,
        pilotsRes,
      ] = await Promise.all([
        fetchChallengeDetail(challengeId),
        fetchChallengeEvidence(challengeId),
        fetchQualificationHistory(challengeId),
        fetchLatestQualification(challengeId),
        fetchHEIOrganizations(),
        fetchHEICandidates(challengeId),
        fetchCommitments(challengeId),
        fetchLatestReadinessConditions(challengeId),
        fetchReadinessConditions(challengeId),
        fetchReadinessHistory(challengeId),
        fetchLatestReadinessDecision(challengeId),
        fetchChallengePilots(challengeId),
      ]);

      setChallenge(cRes.data);
      setEvidenceList(eRes.data.items);
      setQualificationList(qHistRes.data.items);
      setLatestDecision(qLatestRes.data);
      setHeiOrganizations(heiOrgsRes.data.items);
      setCandidatesList(candsRes.data.items);
      setCommitmentsList(commRes.data.items);
      setLatestConditionsList(condLatestRes.data.items);
      setAllConditionsList(condAllRes.data.items);
      setReadinessDecisionsList(decHistRes.data.items);
      setLatestReadinessDecision(decLatestRes.data);

      const rawPilots = pilotsRes?.data?.items || [];
      const enrichedPilots = await Promise.all(
        rawPilots.map(async (p: PilotResponse) => {
          const [opRes, outRes] = await Promise.all([
            fetchLatestPilotOperationalState(p.id).catch(() => ({ data: null })),
            fetchLatestOutcomeAssessment(p.id).catch(() => ({ data: null })),
          ]);
          return {
            ...p,
            latestOperationalStatus: opRes?.data?.status || "PLANNED",
            latestConclusion: outRes?.data?.conclusion || "NOT_REVIEWED",
          };
        })
      );
      setPilotsList(enrichedPilots);

      setIsDemo(
        cRes.isDemo ||
          eRes.isDemo ||
          qHistRes.isDemo ||
          heiOrgsRes.isDemo ||
          commRes.isDemo
      );
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err) || "Failed to load passport data.");
    } finally {
      setLoading(false);
    }
  }, [challengeId]);

  const refreshCommitmentsAndReadiness = async () => {
    try {
      const [commRes, condLatestRes, condAllRes, decHistRes, decLatestRes, pilotsRes] =
        await Promise.all([
          fetchCommitments(challengeId),
          fetchLatestReadinessConditions(challengeId),
          fetchReadinessConditions(challengeId),
          fetchReadinessHistory(challengeId),
          fetchLatestReadinessDecision(challengeId),
          fetchChallengePilots(challengeId),
        ]);
      setCommitmentsList(commRes.data.items);
      setLatestConditionsList(condLatestRes.data.items);
      setAllConditionsList(condAllRes.data.items);
      setReadinessDecisionsList(decHistRes.data.items);
      setLatestReadinessDecision(decLatestRes.data);

      const rawPilots = pilotsRes?.data?.items || [];
      const enrichedPilots = await Promise.all(
        rawPilots.map(async (p: PilotResponse) => {
          const [opRes, outRes] = await Promise.all([
            fetchLatestPilotOperationalState(p.id).catch(() => ({ data: null })),
            fetchLatestOutcomeAssessment(p.id).catch(() => ({ data: null })),
          ]);
          return {
            ...p,
            latestOperationalStatus: opRes?.data?.status || "PLANNED",
            latestConclusion: outRes?.data?.conclusion || "NOT_REVIEWED",
          };
        })
      );
      setPilotsList(enrichedPilots);
    } catch (e) {
      console.error("Failed to refresh commitments/readiness", e);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      if (isMounted) {
        await loadPassportData();
      }
    };
    init();
    return () => {
      isMounted = false;
    };
  }, [loadPassportData]);

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
    await loadPassportData();
  };

  if (loading) {
    return (
      <ProductShell>
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-xs font-mono text-[var(--text-secondary)]">
            Retrieving challenge passport telemetry...
          </p>
        </div>
      </ProductShell>
    );
  }

  if (error || !challenge) {
    return (
      <ProductShell>
        <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
          <AlertTriangle className="w-10 h-10 text-[var(--danger)] mx-auto" />
          <h2 className="text-xl font-bold text-[var(--text-primary)]">
            Unable to load Challenge Passport
          </h2>
          <p className="text-xs text-[var(--text-secondary)] font-mono max-w-md mx-auto">
            {error || "Challenge not found"}
          </p>
          <Link
            href="/challenges"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--primary)] hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Explorer
          </Link>
        </div>
      </ProductShell>
    );
  }

  const candidateOrgIds = candidatesList.map((c) => c.organization_id);

  return (
    <ProductShell isDemo={isDemo}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Back navigation & Demo notice */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/challenges"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Challenge Explorer
          </Link>

          {!DEMO_REVIEWER_ACTOR_ID && (
            <span className="text-xs font-mono bg-amber-50 text-amber-900 border border-amber-200 px-3 py-1 rounded">
              Demo reviewer identity is not configured.
            </span>
          )}

          {isDemo && DEMO_REVIEWER_ACTOR_ID && (
            <span className="text-[11px] font-mono bg-[#F2EFE9] text-[var(--text-secondary)] px-2.5 py-1 rounded border border-[var(--border)] inline-flex items-center gap-1.5">
              <Info className="w-3 h-3 text-[var(--primary)]" />
              Demo Mode Active (Fallback Data)
            </span>
          )}
        </div>

        {/* Passport Banner */}
        <div className="bg-[#FAF8F5] border border-stone-200 rounded-xl p-6 space-y-4 shadow-2xs">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 text-xs font-bold rounded bg-[#F95700]/10 text-[#F95700] border border-[#F95700]/30 font-mono">
                PASSPORT #{challenge.id.slice(0, 8)}
              </span>
              <span className="px-2.5 py-1 text-xs font-semibold rounded bg-stone-100 text-stone-700 border border-stone-200">
                {challenge.domain}
              </span>
            </div>

            {/* Passport Journey Strip */}
            <div className="flex items-center gap-2 text-xs font-mono font-semibold">
              <span className="px-2 py-0.5 rounded bg-stone-200 text-stone-700">
                DISCOVERED
              </span>
              <span className="text-stone-300">→</span>
              <span
                className={`px-2 py-0.5 rounded ${
                  latestDecision?.route === "INNOVATION_CHALLENGE"
                    ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                    : "bg-stone-100 text-stone-500"
                }`}
              >
                QUALIFIED
              </span>
              <span className="text-stone-300">→</span>
              <span
                className={`px-2 py-0.5 rounded ${
                  candidatesList.length > 0
                    ? "bg-[#0A2540]/10 text-[#0A2540] border border-[#0A2540]/20"
                    : "bg-stone-100 text-stone-500"
                }`}
              >
                CANDIDATE MATCH
              </span>
              <span className="text-stone-300">→</span>
              <span
                className={`px-2 py-0.5 rounded ${
                  commitmentsList.length > 0
                    ? "bg-amber-100 text-amber-950 border border-amber-300"
                    : "bg-stone-100 text-stone-500"
                }`}
              >
                COMMITMENT
              </span>
              <span className="text-stone-300">→</span>
              <span
                className={`px-2 py-0.5 rounded ${
                  latestReadinessDecision?.status === "PILOT_READY"
                    ? "bg-emerald-100 text-emerald-950 border border-emerald-400 font-bold"
                    : latestReadinessDecision?.status === "REVIEW_REQUIRED"
                    ? "bg-amber-100 text-amber-950 border border-amber-400 font-bold animate-pulse"
                    : "bg-stone-100 text-stone-500"
                }`}
              >
                {latestReadinessDecision?.status === "REVIEW_REQUIRED"
                  ? "REVIEW REQUIRED"
                  : latestReadinessDecision?.status || "PILOT READINESS"}
              </span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 leading-tight">
            {challenge.title}
          </h1>

          <p className="text-sm text-stone-700 leading-relaxed max-w-4xl font-sans">
            {challenge.summary}
          </p>

          <div className="pt-3 border-t border-stone-200 flex flex-wrap items-center gap-6 text-xs text-stone-600 font-mono">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-stone-400" />
              {challenge.district}, {challenge.state}
            </span>
            <span className="flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-stone-400" />
              {challenge.source_type}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-stone-400" />
              Submitted {new Date(challenge.created_at).toLocaleDateString("en-IN")}
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-stone-200 overflow-x-auto">
          <nav className="flex space-x-6 min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
                  activeTab === tab
                    ? "border-[#F95700] text-[#F95700]"
                    : "border-transparent text-stone-500 hover:text-stone-800"
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === "Overview" && (
          <div className="space-y-6">
            <div className="bg-white border border-stone-200 rounded-lg p-6 space-y-4">
              <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-[#F95700]">
                Problem Description
              </h2>
              <p className="text-sm text-stone-800 leading-relaxed whitespace-pre-line font-sans">
                {challenge.description}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white border border-stone-200 rounded-lg p-4 space-y-1">
                <span className="text-xs font-mono text-stone-500 uppercase">Evidence Submitted</span>
                <p className="text-xl font-bold text-stone-900">{evidenceList.length} Items</p>
              </div>
              <div className="bg-white border border-stone-200 rounded-lg p-4 space-y-1">
                <span className="text-xs font-mono text-stone-500 uppercase">Qualification Status</span>
                <p className="text-[#F95700] text-sm font-bold mt-1">
                  {latestDecision ? latestDecision.route : "Pending Review"}
                </p>
              </div>
              <div className="bg-white border border-stone-200 rounded-lg p-4 space-y-1">
                <span className="text-xs font-mono text-stone-500 uppercase">Matched Candidate HEIs</span>
                <p className="text-stone-900 text-xl font-bold">{candidatesList.length} Institutions</p>
              </div>
            </div>
          </div>
        )}

        {/* EVIDENCE TAB */}
        {activeTab === "Evidence" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-stone-700">
                Submitted Evidence Telemetry ({evidenceList.length})
              </h2>
            </div>

            {evidenceList.length === 0 ? (
              <div className="p-8 rounded-lg border border-stone-200 bg-white text-center">
                <p className="text-xs text-stone-500 font-mono">No evidence submitted yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {evidenceList.map((ev) => (
                  <div
                    key={ev.id}
                    className="p-5 rounded-lg border border-stone-200 bg-white space-y-2 shadow-2xs"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 text-xs font-semibold rounded bg-[#FAF8F5] text-[#F95700] border border-stone-200 font-mono">
                          {ev.evidence_type}
                        </span>
                        <span className="text-xs font-mono text-stone-500">
                          ID: {ev.id.slice(0, 13)}...
                        </span>
                      </div>
                      <span className="text-xs text-stone-500 font-mono">
                        Submitted: {new Date(ev.submitted_at).toLocaleDateString("en-IN")}
                      </span>
                    </div>

                    <p className="text-xs text-stone-800 font-medium leading-relaxed">
                      {ev.description || "No description provided."}
                    </p>

                    <div className="pt-2 border-t border-stone-200 flex flex-wrap items-center justify-between text-xs text-stone-500 font-mono">
                      <span>
                        Reference:{" "}
                        <code className="bg-stone-100 px-1.5 py-0.5 rounded text-stone-900">
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
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-stone-200 pb-4">
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#F95700]">
                  QUALIFICATION REVIEW
                </span>
                <h2 className="text-2xl font-serif font-bold tracking-tight text-stone-900 mt-1">
                  Should this problem enter innovation?
                </h2>
                <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-xl leading-relaxed">
                  Qualification separates service issues, clarification needs, research questions and genuine innovation challenges before ecosystem resources are committed.
                </p>
              </div>

              <button
                onClick={() => setShowRecordModal(true)}
                disabled={!DEMO_REVIEWER_ACTOR_ID}
                className="px-4 py-2.5 rounded bg-[#F95700] text-white text-xs font-semibold hover:bg-[#d84b00] transition-colors inline-flex items-center gap-1.5 shrink-0 disabled:opacity-50 cursor-pointer shadow-2xs"
              >
                <Plus className="w-4 h-4" /> Record Decision
              </button>
            </div>

            {latestDecision ? (
              <LatestDecisionPanel decision={latestDecision} />
            ) : (
              <div className="p-8 rounded-lg border border-stone-200 bg-white text-center space-y-3">
                <ShieldCheck className="w-10 h-10 text-stone-400 mx-auto opacity-50" />
                <h3 className="text-sm font-bold text-stone-900">
                  Qualification review has not been recorded yet.
                </h3>
                <p className="text-xs text-stone-600 max-w-md mx-auto leading-relaxed">
                  Human qualification decision will classify this challenge into SERVICE, CLARIFY, RESEARCH_REVIEW, or INNOVATION_CHALLENGE.
                </p>
                <button
                  onClick={() => setShowRecordModal(true)}
                  disabled={!DEMO_REVIEWER_ACTOR_ID}
                  className="px-4 py-2 rounded bg-[#F95700] text-white text-xs font-semibold hover:bg-[#d84b00] transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Record First Decision
                </button>
              </div>
            )}

            <DecisionTimeline history={qualificationList} />

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
            <HEISemanticStrip />

            {latestDecision?.route !== "INNOVATION_CHALLENGE" ? (
              <HEIMatchingGate currentRoute={latestDecision?.route} />
            ) : (
              <div className="space-y-6">
                <CandidateList
                  candidates={candidatesList}
                  organizations={heiOrganizations}
                  onInspectCapabilities={(orgId) => {
                    const org = heiOrganizations.find((o) => o.organization_id === orgId);
                    if (org) setInspectOrg(org);
                  }}
                />

                <HEIDirectoryList
                  organizations={heiOrganizations}
                  candidateOrgIds={candidateOrgIds}
                  onInspectCapabilities={(org) => setInspectOrg(org)}
                  onAddCandidate={(org) => setCandidateOrg(org)}
                />

                <CapabilityInspectionSheet
                  organization={inspectOrg}
                  onClose={() => setInspectOrg(null)}
                />

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

        {/* COMMITMENTS TAB */}
        {activeTab === "Commitments" && (
          <div className="space-y-6">
            <div className="border-b border-stone-200 pb-4">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#F95700]">
                COMMITMENTS
              </span>
              <h2 className="text-2xl font-serif font-bold tracking-tight text-stone-900 mt-1">
                Intent must be explicit before readiness.
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-2xl leading-relaxed">
                Candidate matching identifies relevance. Commitments record what an organization has actually agreed, declined, withdrawn or allowed to expire.
              </p>
            </div>

            <CommitmentSemanticStrip />

            <CandidateToCommitmentList
              candidates={candidatesList}
              organizations={heiOrganizations}
              commitments={commitmentsList}
              onRecordCommitment={(org) => setRecordCommitmentOrg(org)}
            />

            <CommitmentTimeline
              commitments={commitmentsList}
              organizations={heiOrganizations}
            />

            <RecordCommitmentSheet
              isOpen={!!recordCommitmentOrg}
              onClose={() => setRecordCommitmentOrg(null)}
              challengeId={challengeId}
              candidateOrg={recordCommitmentOrg}
              existingCommitments={commitmentsList}
              reviewerActorId={DEMO_REVIEWER_ACTOR_ID}
              onCommitmentCreated={refreshCommitmentsAndReadiness}
            />
          </div>
        )}

        {/* PILOT READINESS TAB */}
        {activeTab === "Pilot Readiness" && (
          <div className="space-y-6">
            <div className="border-b border-stone-200 pb-4">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#F95700]">
                PILOT READINESS
              </span>
              <h2 className="text-2xl font-serif font-bold tracking-tight text-stone-900 mt-1">
                Ready is a decision, not an assumption.
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-2xl leading-relaxed">
                NIRNAY checks whether the conditions a pilot depends on are satisfied, traceable and still valid before a human authorizes the pilot.
              </p>
            </div>

            <HeroInvalidationNotice
              latestDecision={latestReadinessDecision}
              commitments={commitmentsList}
              decisions={readinessDecisionsList}
            />

            <ReadinessOverviewPanel
              latestDecision={latestReadinessDecision}
              onOpenRecordDecisionSheet={() => setShowRecordReadinessDecisionSheet(true)}
              reviewerActorId={DEMO_REVIEWER_ACTOR_ID}
            />

            <ConditionMatrix
              latestConditions={latestConditionsList}
              commitments={commitmentsList}
              organizations={heiOrganizations}
              onOpenAssessSheet={() => setShowAssessConditionSheet(true)}
            />

            <ReadinessTimeline decisions={readinessDecisionsList} />

            <AssessConditionSheet
              isOpen={showAssessConditionSheet}
              onClose={() => setShowAssessConditionSheet(false)}
              challengeId={challengeId}
              existingConditions={allConditionsList}
              commitments={commitmentsList}
              organizations={heiOrganizations}
              reviewerActorId={DEMO_REVIEWER_ACTOR_ID}
              onConditionCreated={refreshCommitmentsAndReadiness}
            />

            <RecordReadinessDecisionSheet
              isOpen={showRecordReadinessDecisionSheet}
              onClose={() => setShowRecordReadinessDecisionSheet(false)}
              challengeId={challengeId}
              latestConditions={latestConditionsList}
              existingDecisions={readinessDecisionsList}
              reviewerActorId={DEMO_REVIEWER_ACTOR_ID}
              onDecisionCreated={refreshCommitmentsAndReadiness}
            />
          </div>
        )}

        {/* PILOTS TAB */}
        {activeTab === "Pilots" && (
          <div className="space-y-6">
            <div className="border-b border-stone-200 pb-4">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#F95700]">
                FIELD PILOTS
              </span>
              <h2 className="text-2xl font-serif font-bold tracking-tight text-stone-900 mt-1">
                Move from readiness to controlled field learning.
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-2xl leading-relaxed">
                A pilot begins only after current human PILOT_READY authorization. Execution and evidence conclusions remain separate throughout the pilot lifecycle.
              </p>
            </div>

            <PilotList
              pilots={pilotsList}
              organizations={heiOrganizations}
              onOpenCreateSheet={() => setShowCreatePilotSheet(true)}
              isPilotReady={latestReadinessDecision?.status === "PILOT_READY"}
            />

            <CreatePilotSheet
              isOpen={showCreatePilotSheet}
              onClose={() => setShowCreatePilotSheet(false)}
              challengeId={challengeId}
              latestReadinessDecision={latestReadinessDecision}
              organizations={heiOrganizations}
              reviewerActorId={DEMO_REVIEWER_ACTOR_ID}
              onPilotCreated={() => {
                loadPassportData();
              }}
            />
          </div>
        )}

        {/* Future Tab Placeholders */}
        {["Outcomes"].includes(activeTab) && (
          <div className="p-10 rounded-lg border border-stone-200 bg-white text-center space-y-3 shadow-2xs">
            <Building2 className="w-8 h-8 text-stone-400 mx-auto opacity-50" />
            <h3 className="text-sm font-bold text-stone-900">
              {activeTab} Workflow Phase
            </h3>
            <p className="text-xs text-stone-600 max-w-md mx-auto leading-relaxed">
              This workflow stage will activate automatically as human qualification decisions, HEI candidate matching, commitments, and readiness sign-offs progress.
            </p>
            <span className="inline-block text-[10px] font-mono bg-stone-100 text-stone-600 px-2.5 py-1 rounded border border-stone-200">
              FUTURE WORKFLOW STAGE
            </span>
          </div>
        )}
      </div>
    </ProductShell>
  );
}
