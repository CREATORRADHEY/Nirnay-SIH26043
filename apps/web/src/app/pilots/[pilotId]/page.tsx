"use client";

import { useEffect, useState, use, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  Clock,
  UserCheck,
  Building2,
  Calendar,
  History,
  Plus,
  Info,
  AlertTriangle,
} from "lucide-react";

import { ProductShell } from "@/components/shell/ProductShell";
import {
  fetchPilotDetail,
  fetchPilotOperationalHistory,
  fetchLatestPilotOperationalState,
  fetchPilotEvidencePlanHistory,
  fetchLatestPilotEvidencePlan,
  fetchOutcomeHistory,
  fetchLatestOutcomeAssessment,
  fetchChallengeDetail,
  fetchChallengeEvidence,
  fetchHEIOrganizations,
  DEMO_REVIEWER_ACTOR_ID,
} from "@/lib/api";
import {
  PilotResponse,
  PilotOperationalStateResponse,
  PilotEvidencePlanResponse,
  OutcomeAssessmentResponse,
  ChallengeResponse,
  EvidenceResponse,
  HEIOrganization,
} from "@/lib/types/challenge";

import {
  OperationalStatusBadge,
  EvidenceConclusionBadge,
} from "@/components/pilots/PilotBadges";
import { PilotSeparationPanel } from "@/components/pilots/PilotSeparationPanel";
import { HeroOutcomeNotice } from "@/components/pilots/HeroOutcomeNotice";
import { UpdateOperationalStateSheet } from "@/components/pilots/UpdateOperationalStateSheet";
import { CreateEvidencePlanSheet } from "@/components/pilots/CreateEvidencePlanSheet";
import { RecordOutcomeAssessmentSheet } from "@/components/pilots/RecordOutcomeAssessmentSheet";

interface PilotWorkspaceProps {
  params: Promise<{ pilotId: string }>;
}

export default function PilotWorkspacePage({ params }: PilotWorkspaceProps) {
  const resolvedParams = use(params);
  const pilotId = resolvedParams.pilotId;

  const [pilot, setPilot] = useState<PilotResponse | null>(null);
  const [challenge, setChallenge] = useState<ChallengeResponse | null>(null);
  const [organizations, setOrganizations] = useState<HEIOrganization[]>([]);
  const [evidenceItems, setEvidenceItems] = useState<EvidenceResponse[]>([]);

  const [opHistory, setOpHistory] = useState<PilotOperationalStateResponse[]>([]);
  const [latestOpState, setLatestOpState] = useState<PilotOperationalStateResponse | null>(null);

  const [planHistory, setPlanHistory] = useState<PilotEvidencePlanResponse[]>([]);
  const [latestPlan, setLatestPlan] = useState<PilotEvidencePlanResponse | null>(null);

  const [outcomeHistory, setOutcomeHistory] = useState<OutcomeAssessmentResponse[]>([]);
  const [latestOutcome, setLatestOutcome] = useState<OutcomeAssessmentResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDemo, setIsDemo] = useState(false);

  // Sheets
  const [showOpStateSheet, setShowOpStateSheet] = useState(false);
  const [showPlanSheet, setShowPlanSheet] = useState(false);
  const [showOutcomeSheet, setShowOutcomeSheet] = useState(false);

  const [activeTab, setActiveTab] = useState<
    "Overview" | "Evidence Plan" | "Execution" | "Outcome"
  >("Overview");

  const loadWorkspaceData = useCallback(async () => {
    try {
      const [
        pilotRes,
        opHistRes,
        opLatestRes,
        planHistRes,
        planLatestRes,
        outHistRes,
        outLatestRes,
        heiOrgsRes,
      ] = await Promise.all([
        fetchPilotDetail(pilotId),
        fetchPilotOperationalHistory(pilotId),
        fetchLatestPilotOperationalState(pilotId),
        fetchPilotEvidencePlanHistory(pilotId),
        fetchLatestPilotEvidencePlan(pilotId),
        fetchOutcomeHistory(pilotId),
        fetchLatestOutcomeAssessment(pilotId),
        fetchHEIOrganizations(),
      ]);

      setPilot(pilotRes.data);
      setOpHistory(opHistRes.data.items);
      setLatestOpState(opLatestRes.data);
      setPlanHistory(planHistRes.data.items);
      setLatestPlan(planLatestRes.data);
      setOutcomeHistory(outHistRes.data.items);
      setLatestOutcome(outLatestRes.data);
      setOrganizations(heiOrgsRes.data.items);

      if (pilotRes.data.challenge_id) {
        const [cRes, eRes] = await Promise.all([
          fetchChallengeDetail(pilotRes.data.challenge_id),
          fetchChallengeEvidence(pilotRes.data.challenge_id),
        ]);
        setChallenge(cRes.data);
        setEvidenceItems(eRes.data.items);
      }

      setIsDemo(
        pilotRes.isDemo ||
          opHistRes.isDemo ||
          planHistRes.isDemo ||
          outHistRes.isDemo
      );
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load pilot workspace.");
    } finally {
      setLoading(false);
    }
  }, [pilotId]);

  useEffect(() => {
    let isMounted = true;
    const run = async () => {
      if (isMounted) {
        await loadWorkspaceData();
      }
    };
    run();
    return () => {
      isMounted = false;
    };
  }, [loadWorkspaceData]);

  if (loading) {
    return (
      <ProductShell>
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <div className="w-8 h-8 border-2 border-[#F95700] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-xs font-mono text-stone-500">
            Loading pilot workspace telemetry...
          </p>
        </div>
      </ProductShell>
    );
  }

  if (error || !pilot) {
    return (
      <ProductShell>
        <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
          <AlertTriangle className="w-10 h-10 text-rose-600 mx-auto" />
          <h2 className="text-xl font-bold text-stone-900">
            Unable to load Pilot Workspace
          </h2>
          <p className="text-xs text-stone-500 font-mono max-w-md mx-auto">
            {error || "Pilot not found"}
          </p>
          <Link
            href="/challenges"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#F95700] hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Challenges
          </Link>
        </div>
      </ProductShell>
    );
  }

  const currentOpStatus = latestOpState?.status || "PLANNED";
  const currentConclusion = latestOutcome?.conclusion || "NOT_REVIEWED";
  const hostOrg = organizations.find((o) => o.organization_id === pilot.host_organization_id);

  return (
    <ProductShell isDemo={isDemo}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Navigation & Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href={`/challenges/${pilot.challenge_id}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Challenge Passport
          </Link>

          {isDemo && (
            <span className="text-[11px] font-mono bg-amber-50 text-amber-900 border border-amber-300 px-3 py-1 rounded inline-flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-amber-700" />
              DEMO FALLBACK
            </span>
          )}
        </div>

        {/* Hero Banner */}
        <div className="bg-[#FAF8F5] border border-stone-200 rounded-xl p-6 space-y-4 shadow-2xs">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 text-xs font-bold rounded bg-[#F95700]/10 text-[#F95700] border border-[#F95700]/30 font-mono">
                FIELD PILOT WORKSPACE
              </span>
              <span className="text-xs font-mono font-semibold bg-stone-100 text-stone-700 px-2.5 py-1 rounded border border-stone-200">
                AUTHORIZED FROM PILOT_READY
              </span>
            </div>

            <div className="flex items-center gap-2">
              <OperationalStatusBadge status={currentOpStatus} size="md" />
              <EvidenceConclusionBadge conclusion={currentConclusion} size="md" />
            </div>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 leading-tight">
              {pilot.name}
            </h1>
            {challenge && (
              <p className="text-xs font-mono text-stone-600 mt-1">
                Challenge: <span className="font-semibold text-stone-800">{challenge.title}</span>
              </p>
            )}
          </div>

          <div className="pt-3 border-t border-stone-200 flex flex-wrap items-center gap-6 text-xs text-stone-600 font-mono">
            {hostOrg && (
              <span className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-stone-400" />
                Host: <strong className="text-stone-800">{hostOrg.name}</strong>
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-stone-400" />
              Window: {pilot.planned_start ? new Date(pilot.planned_start).toLocaleDateString() : "Immediate"}
              {" → "}
              {pilot.planned_end ? new Date(pilot.planned_end).toLocaleDateString() : "TBD"}
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-stone-200 overflow-x-auto">
          <nav className="flex space-x-6 min-w-max">
            {(["Overview", "Evidence Plan", "Execution", "Outcome"] as const).map((tab) => (
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white border border-stone-200 rounded-lg p-6 space-y-4">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#F95700]">
                  Pilot Purpose & Location
                </h3>
                <p className="text-sm text-stone-800 leading-relaxed font-sans">
                  {pilot.site_description || "No specific site description recorded."}
                </p>
              </div>

              <PilotSeparationPanel opStatus={currentOpStatus} conclusion={currentConclusion} />
            </div>

            {/* Contextual Rail */}
            <div className="bg-[#FAF8F5] border border-stone-200 rounded-lg p-6 space-y-4 h-fit font-mono text-xs text-stone-600">
              <h3 className="font-bold text-stone-900 uppercase tracking-wider text-xs border-b border-stone-200 pb-2">
                Metadata & Attribution
              </h3>
              <div>
                <span className="text-stone-400 block">Pilot ID:</span>
                <span className="font-semibold text-stone-800 break-all">{pilot.id}</span>
              </div>
              <div>
                <span className="text-stone-400 block">Challenge ID:</span>
                <span className="font-semibold text-stone-800 break-all">{pilot.challenge_id}</span>
              </div>
              <div>
                <span className="text-stone-400 block">Readiness Decision ID:</span>
                <span className="font-semibold text-stone-800 break-all">
                  {pilot.authorized_by_readiness_decision_id}
                </span>
              </div>
              <div>
                <span className="text-stone-400 block">Created By Actor:</span>
                <span className="font-semibold text-stone-800">{pilot.created_by_actor_id}</span>
              </div>
              <div>
                <span className="text-stone-400 block">Created At:</span>
                <span className="font-semibold text-stone-800">
                  {new Date(pilot.created_at).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* EVIDENCE PLAN TAB */}
        {activeTab === "Evidence Plan" && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 pb-4">
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#F95700]">
                  EVIDENCE PLAN
                </span>
                <h2 className="text-2xl font-serif font-bold tracking-tight text-stone-900 mt-1">
                  Define what will count before interpreting what happened.
                </h2>
                <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-2xl leading-relaxed">
                  The evidence plan preserves the metric, baseline, denominator and collection method used to interpret the pilot.
                </p>
              </div>
              <button
                onClick={() => setShowPlanSheet(true)}
                disabled={!DEMO_REVIEWER_ACTOR_ID}
                className="px-4 py-2 text-xs font-semibold bg-[#F95700] text-white rounded-md hover:bg-[#d84b00] disabled:opacity-50 transition-colors inline-flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-4 h-4" />
                {latestPlan ? "Create New Version" : "Create Evidence Plan"}
              </button>
            </div>

            {latestPlan ? (
              <div className="bg-white border border-stone-200 rounded-lg p-6 space-y-6 shadow-2xs">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 pb-4">
                  <div>
                    <span className="font-mono text-xs font-bold text-[#F95700] bg-[#FAF8F5] px-2.5 py-1 rounded border border-stone-200">
                      Version {latestPlan.version}
                    </span>
                    <h3 className="text-lg font-serif font-bold text-stone-900 mt-2">
                      {latestPlan.objective}
                    </h3>
                  </div>
                  <span className="text-xs font-mono text-stone-500">
                    Created {new Date(latestPlan.created_at).toLocaleDateString()}
                  </span>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-mono font-bold text-stone-500 uppercase">Primary Metric</span>
                  <p className="text-sm font-semibold text-stone-900">{latestPlan.primary_metric}</p>
                </div>

                {/* Key Jury Prominent Definitions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#FAF8F5] border-2 border-stone-300 rounded-xl p-5 font-mono text-xs">
                  <div className="p-3 bg-white border border-stone-200 rounded-lg space-y-1">
                    <span className="text-[#F95700] font-bold uppercase tracking-wider block">
                      Baseline Definition:
                    </span>
                    <p className="text-stone-900 font-sans font-medium">{latestPlan.baseline_definition}</p>
                  </div>
                  <div className="p-3 bg-white border border-stone-200 rounded-lg space-y-1">
                    <span className="text-[#F95700] font-bold uppercase tracking-wider block">
                      Denominator Definition:
                    </span>
                    <p className="text-stone-900 font-sans font-medium">{latestPlan.denominator_definition}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono pt-2">
                  <div>
                    <span className="text-stone-500 uppercase block font-semibold">Collection Method:</span>
                    <span className="text-stone-800">{latestPlan.data_collection_method}</span>
                  </div>
                  {latestPlan.evaluation_window && (
                    <div>
                      <span className="text-stone-500 uppercase block font-semibold">Evaluation Window:</span>
                      <span className="text-stone-800">{latestPlan.evaluation_window}</span>
                    </div>
                  )}
                  {latestPlan.success_criteria && (
                    <div>
                      <span className="text-stone-500 uppercase block font-semibold">Success Criteria:</span>
                      <span className="text-stone-800">{latestPlan.success_criteria}</span>
                    </div>
                  )}
                </div>

                {latestPlan.limitations && (
                  <div className="p-3 bg-stone-50 border border-stone-200 rounded-md text-xs font-mono text-stone-700 space-y-1">
                    <span className="font-bold text-stone-900">Known Limitations & Exclusions:</span>
                    <p className="text-stone-800 font-sans">{latestPlan.limitations}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white border border-stone-200 rounded-lg p-8 text-center space-y-3">
                <FileText className="w-8 h-8 text-stone-400 mx-auto opacity-50" />
                <h4 className="text-sm font-serif font-bold text-stone-800">No Evidence Plan Recorded Yet</h4>
                <p className="text-xs text-stone-500 max-w-md mx-auto">
                  Click &quot;Create Evidence Plan&quot; to declare the baseline, denominator, metric, and collection method before interpreting outcome evidence.
                </p>
              </div>
            )}

            {/* Plan Audit History */}
            {planHistory.length > 0 && (
              <div className="bg-white border border-stone-200 rounded-lg p-6 space-y-4">
                <h3 className="text-sm font-serif font-bold text-stone-900 flex items-center gap-2">
                  <History className="w-4 h-4 text-[#F95700]" />
                  Evidence Plan Version History ({planHistory.length})
                </h3>
                <div className="space-y-3 font-mono text-xs">
                  {planHistory.map((p) => (
                    <div key={p.id} className="p-3 bg-[#FAF8F5] border border-stone-200 rounded flex items-center justify-between">
                      <div>
                        <span className="font-bold text-stone-900">v{p.version}</span>
                        <span className="text-stone-600 ml-3">{p.primary_metric}</span>
                      </div>
                      <span className="text-stone-400">{new Date(p.created_at).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* EXECUTION TAB */}
        {activeTab === "Execution" && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 pb-4">
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#F95700]">
                  EXECUTION LIFECYCLE
                </span>
                <h2 className="text-2xl font-serif font-bold tracking-tight text-stone-900 mt-1">
                  Execution is operational state, not evidence of impact.
                </h2>
              </div>
              <button
                onClick={() => setShowOpStateSheet(true)}
                disabled={!DEMO_REVIEWER_ACTOR_ID || ["COMPLETED", "STOPPED"].includes(currentOpStatus)}
                className="px-4 py-2 text-xs font-semibold bg-[#F95700] text-white rounded-md hover:bg-[#d84b00] disabled:opacity-50 transition-colors inline-flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-4 h-4" />
                Update Operational State
              </button>
            </div>

            {/* Operational State Timeline */}
            <div className="bg-white border border-stone-200 rounded-lg p-6 space-y-6">
              <h3 className="text-sm font-serif font-bold text-stone-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#F95700]" />
                Operational State History ({opHistory.length})
              </h3>

              <div className="relative pl-6 border-l-2 border-stone-200 space-y-6">
                {opHistory.map((op) => (
                  <div key={op.id} className="relative">
                    <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-white border-2 border-[#F95700] flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#F95700]" />
                    </div>

                    <div className="bg-[#FAF8F5] border border-stone-200 rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-stone-900 bg-white px-2 py-0.5 rounded border border-stone-300">
                            v{op.version}
                          </span>
                          <OperationalStatusBadge status={op.status} size="sm" />
                        </div>
                        <span className="text-xs font-mono text-stone-500">
                          {new Date(op.recorded_at).toLocaleString()}
                        </span>
                      </div>

                      <p className="text-xs text-stone-800 font-sans leading-relaxed">
                        {op.rationale}
                      </p>

                      <div className="text-[11px] font-mono text-stone-500 flex items-center gap-1">
                        <UserCheck className="w-3.5 h-3.5 text-stone-400" />
                        Actor: {op.recorded_by_actor_id}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* OUTCOME TAB */}
        {activeTab === "Outcome" && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 pb-4">
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#F95700]">
                  OUTCOME ASSESSMENT
                </span>
                <h2 className="text-2xl font-serif font-bold tracking-tight text-stone-900 mt-1">
                  What did the evidence actually support?
                </h2>
                <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-2xl leading-relaxed">
                  Pilot completion records execution. Outcome assessment records what the available evidence supports.
                </p>
              </div>

              <button
                onClick={() => setShowOutcomeSheet(true)}
                disabled={!DEMO_REVIEWER_ACTOR_ID || planHistory.length === 0}
                className="px-4 py-2 text-xs font-semibold bg-[#F95700] text-white rounded-md hover:bg-[#d84b00] disabled:opacity-50 transition-colors inline-flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-4 h-4" />
                Record Outcome Assessment
              </button>
            </div>

            {/* Separation Panel */}
            <PilotSeparationPanel opStatus={currentOpStatus} conclusion={currentConclusion} />

            {/* Hero Outcome Notice (COMPLETED + INCONCLUSIVE or STOPPED + INCONCLUSIVE) */}
            <HeroOutcomeNotice
              opStatus={currentOpStatus}
              conclusion={currentConclusion}
              limitations={latestOutcome?.limitations}
            />

            {/* Outcome Assessment Audit Timeline */}
            <div className="bg-white border border-stone-200 rounded-lg p-6 space-y-6">
              <h3 className="text-sm font-serif font-bold text-stone-900 flex items-center gap-2">
                <History className="w-4 h-4 text-[#F95700]" />
                Outcome Assessment Audit History ({outcomeHistory.length})
              </h3>

              {outcomeHistory.length === 0 ? (
                <p className="text-xs text-stone-500 italic font-mono">
                  No outcome assessments recorded yet. Click &quot;Record Outcome Assessment&quot; above.
                </p>
              ) : (
                <div className="relative pl-6 border-l-2 border-stone-200 space-y-6">
                  {outcomeHistory.map((out) => (
                    <div key={out.id} className="relative">
                      <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-white border-2 border-[#F95700] flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#F95700]" />
                      </div>

                      <div className="bg-[#FAF8F5] border border-stone-200 rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-stone-900 bg-white px-2 py-0.5 rounded border border-stone-300">
                              v{out.version}
                            </span>
                            <EvidenceConclusionBadge conclusion={out.conclusion} size="sm" />
                          </div>
                          <span className="text-xs font-mono text-stone-500">
                            {new Date(out.assessed_at).toLocaleString()}
                          </span>
                        </div>

                        <p className="text-xs text-stone-800 font-sans leading-relaxed">
                          {out.summary}
                        </p>

                        {out.limitations && (
                          <p className="text-xs text-stone-600 font-mono bg-white p-2.5 rounded border border-stone-200">
                            <strong>Limitations:</strong> {out.limitations}
                          </p>
                        )}

                        <div className="text-[11px] font-mono text-stone-500 flex justify-between pt-2 border-t border-stone-200">
                          <span>Evaluated Plan ID: {out.evidence_plan_id.slice(0, 8)}...</span>
                          <span>Attribution: {out.assessed_by_actor_id ? out.assessed_by_actor_id.slice(0, 8) + "..." : "System"}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Sheets */}
        <UpdateOperationalStateSheet
          isOpen={showOpStateSheet}
          onClose={() => setShowOpStateSheet(false)}
          pilotId={pilotId}
          currentOperationalState={latestOpState}
          reviewerActorId={DEMO_REVIEWER_ACTOR_ID}
          onStateUpdated={loadWorkspaceData}
        />

        <CreateEvidencePlanSheet
          isOpen={showPlanSheet}
          onClose={() => setShowPlanSheet(false)}
          pilotId={pilotId}
          latestPlan={latestPlan}
          reviewerActorId={DEMO_REVIEWER_ACTOR_ID}
          onPlanCreated={loadWorkspaceData}
        />

        <RecordOutcomeAssessmentSheet
          isOpen={showOutcomeSheet}
          onClose={() => setShowOutcomeSheet(false)}
          pilotId={pilotId}
          evidencePlans={planHistory}
          latestOutcome={latestOutcome}
          evidenceItems={evidenceItems}
          reviewerActorId={DEMO_REVIEWER_ACTOR_ID}
          onOutcomeCreated={loadWorkspaceData}
        />
      </div>
    </ProductShell>
  );
}
