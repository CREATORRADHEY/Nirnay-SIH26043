"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/lib/auth-context";
import { WhyThisState } from "@/components/WhyThisState";
import {
  fetchChallengeDetail,
  fetchChallengeEvidence,
  fetchQualificationHistory,
  fetchHEICandidates,
  fetchCommitments,
  fetchReadinessConditions,
  fetchReadinessHistory,
  ChallengeResponse,
  EvidenceResponse,
  QualificationDecisionResponse,
  HEICandidateResponse,
  CommitmentResponse,
  ReadinessConditionResponse,
  ReadinessDecisionResponse,
  PilotResponse,
  PilotOperationalStateResponse,
  OutcomeAssessmentResponse,
} from "@/lib/api";

interface ClarificationItem {
  id: string;
  question: string;
  status: string;
  requested_at: string;
  responses: Array<{
    id: string;
    response: string;
    responded_at: string;
  }>;
}

export default function ChallengePassportPage({ params }: { params: Promise<{ challengeId: string }> }) {
  const { challengeId } = use(params);
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<
    "overview" | "evidence" | "clarifications" | "qualification" | "matching" | "commitments" | "readiness" | "pilot" | "outcome" | "history"
  >("overview");

  const [challenge, setChallenge] = useState<ChallengeResponse | null>(null);
  const [evidenceList, setEvidenceList] = useState<EvidenceResponse[]>([]);
  const [clarifications, setClarifications] = useState<ClarificationItem[]>([]);
  const [qualifications, setQualifications] = useState<QualificationDecisionResponse[]>([]);
  const [heiCandidates, setHeiCandidates] = useState<HEICandidateResponse[]>([]);
  const [commitments, setCommitments] = useState<CommitmentResponse[]>([]);
  const [conditions, setConditions] = useState<ReadinessConditionResponse[]>([]);
  const [readinessDecisions, setReadinessDecisions] = useState<ReadinessDecisionResponse[]>([]);
  const [pilots, setPilots] = useState<PilotResponse[]>([]);
  const [opStates, setOpStates] = useState<PilotOperationalStateResponse[]>([]);
  const [outcomes, setOutcomes] = useState<OutcomeAssessmentResponse[]>([]);
  const [loading, setLoading] = useState(true);

  // Clarification reply form
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [submittingReply, setSubmittingReply] = useState<Record<string, boolean>>({});

  const loadAllPassportData = async () => {
    try {
      const [chRes, evRes, qualRes, heiRes, commRes, condRes, readRes] = await Promise.all([
        fetchChallengeDetail(challengeId).catch(() => null),
        fetchChallengeEvidence(challengeId).catch(() => null),
        fetchQualificationHistory(challengeId).catch(() => null),
        fetchHEICandidates(challengeId).catch(() => null),
        fetchCommitments(challengeId).catch(() => null),
        fetchReadinessConditions(challengeId).catch(() => null),
        fetchReadinessHistory(challengeId).catch(() => null),
      ]);

      if (chRes?.data) setChallenge(chRes.data);
      if (evRes?.data) setEvidenceList(evRes.data.items || []);
      if (qualRes?.data) setQualifications(qualRes.data.items || []);
      if (heiRes?.data) setHeiCandidates(heiRes.data.items || []);
      if (commRes?.data) setCommitments(commRes.data.items || []);
      if (condRes?.data) setConditions(condRes.data.items || []);
      if (readRes?.data) setReadinessDecisions(readRes.data.items || []);

      // Clarification requests
      const clarRes = await fetch(`/api/v1/challenges/${challengeId}/clarifications`).then((r) => (r.ok ? r.json() : null));
      if (clarRes) setClarifications(clarRes || []);

      // Pilots
      const pilotRes = await fetch(`/api/v1/challenges/${challengeId}/pilots`).then((r) => (r.ok ? r.json() : null));
      if (pilotRes && Array.isArray(pilotRes.items) && pilotRes.items.length > 0) {
        setPilots(pilotRes.items);
        const pId = pilotRes.items[0].id;
        const [opRes, outRes] = await Promise.all([
          fetch(`/api/v1/pilots/${pId}/operational-states`).then((r) => (r.ok ? r.json() : null)),
          fetch(`/api/v1/pilots/${pId}/outcomes`).then((r) => (r.ok ? r.json() : null)),
        ]);
        if (opRes && opRes.items) setOpStates(opRes.items);
        if (outRes && outRes.items) setOutcomes(outRes.items);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllPassportData();
  }, [challengeId]);

  const handleSendResponse = async (requestId: string) => {
    const text = replyText[requestId];
    if (!text || !text.trim()) return;

    setSubmittingReply((prev) => ({ ...prev, [requestId]: true }));
    try {
      const res = await fetch(`/api/v1/clarifications/${requestId}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ response: text }),
      });
      if (res.ok) {
        setReplyText((prev) => ({ ...prev, [requestId]: "" }));
        loadAllPassportData();
      }
    } catch {
    } finally {
      setSubmittingReply((prev) => ({ ...prev, [requestId]: false }));
    }
  };

  if (loading) {
    return (
      <AppShell>
        <div className="flex justify-center py-20 text-stone-600 text-sm font-medium">
          <div className="w-5 h-5 border-2 border-amber-600 border-t-transparent rounded-full animate-spin mr-2"></div>
          Loading Challenge Passport...
        </div>
      </AppShell>
    );
  }

  if (!challenge) {
    return (
      <AppShell>
        <div className="max-w-md mx-auto py-12 text-center">
          <h2 className="text-xl font-bold text-stone-900">Challenge Record Not Found</h2>
          <p className="text-sm text-stone-600 mt-2">The requested Passport record could not be loaded.</p>
          <Link href="/app/challenges" className="mt-4 inline-block text-xs font-bold text-amber-700 hover:underline">
            ← Return to My Challenges
          </Link>
        </div>
      </AppShell>
    );
  }

  // Derive Current State & History Info
  const latestQual = qualifications.length > 0 ? qualifications[qualifications.length - 1] : null;
  const latestReadiness = readinessDecisions.length > 0 ? readinessDecisions[readinessDecisions.length - 1] : null;
  const latestCommitment = commitments.length > 0 ? commitments[0] : null; // ordered desc
  const activePilot = pilots.length > 0 ? pilots[0] : null;
  const latestOpState = opStates.length > 0 ? opStates[opStates.length - 1] : null;
  const latestOutcome = outcomes.length > 0 ? outcomes[outcomes.length - 1] : null;

  let currentState = "REPORTED";
  let previousState: string | null = null;
  let whatHappened = "Societal challenge reported and recorded in municipal intake ledger.";
  let triggerEvent: string | null = null;
  let nextActionLabel: string | null = null;
  let nextActionHref: string | null = null;

  if (clarifications.some((c) => c.status === "OPEN")) {
    currentState = "CLARIFY";
    whatHappened = "Government reviewer requested additional evidence or clarification from submitter.";
    nextActionLabel = "Respond to Query";
    nextActionHref = `/app/challenges/${challengeId}?tab=clarifications`;
  } else if (latestQual) {
    currentState = latestQual.route;
    whatHappened = `Qualified by government reviewer via ${latestQual.route} route: ${latestQual.rationale}`;
    if (latestQual.route === "INNOVATION_CHALLENGE") {
      if (heiCandidates.length === 0) {
        nextActionLabel = "Identify HEI Candidate";
        nextActionHref = `/app/hei-matching?challenge_id=${challengeId}`;
      } else if (!latestCommitment || latestCommitment.status !== "ACCEPTED") {
        currentState = "MATCHED";
        whatHappened = `HEI candidate match identified (${heiCandidates.length} institution candidate). Awaiting institutional commitment.`;
        nextActionLabel = "Record HEI Commitment";
        nextActionHref = `/app/commitments?challenge_id=${challengeId}`;
      } else if (!latestReadiness || latestReadiness.status !== "PILOT_READY") {
        if (latestReadiness && latestReadiness.status === "REVIEW_REQUIRED") {
          currentState = "REVIEW_REQUIRED";
          previousState = readinessDecisions.length > 1 ? readinessDecisions[readinessDecisions.length - 2].status : "PILOT_READY v1";
          whatHappened = latestReadiness.rationale;
          triggerEvent = `Commitment changed to ${latestCommitment.status}`;
          nextActionLabel = "Re-evaluate Pilot Readiness";
          nextActionHref = `/app/readiness?challenge_id=${challengeId}`;
        } else {
          currentState = "COMMITTED";
          whatHappened = `Institutional commitment ${latestCommitment.status} (v${latestCommitment.version}) by organization ${latestCommitment.organization_id.slice(0, 8)}. Awaiting pilot readiness authorization.`;
          nextActionLabel = "Authorize Readiness";
          nextActionHref = `/app/readiness?challenge_id=${challengeId}`;
        }
      } else if (activePilot) {
        currentState = `PILOT_${latestOpState ? latestOpState.status : "PLANNED"}`;
        whatHappened = `Field pilot authorized and operational state set to ${latestOpState ? latestOpState.status : "PLANNED"}.`;
        if (latestOpState && latestOpState.status === "COMPLETED") {
          if (latestOutcome) {
            currentState = `OUTCOME_${latestOutcome.conclusion}`;
            whatHappened = `Pilot completed. Evidence conclusion evaluated as ${latestOutcome.conclusion}: ${latestOutcome.summary}`;
          } else {
            nextActionLabel = "Assess Pilot Outcome";
            nextActionHref = `/app/outcomes?pilot_id=${activePilot.id}`;
          }
        } else {
          nextActionLabel = "Update Pilot Operations";
          nextActionHref = `/app/pilots?challenge_id=${challengeId}`;
        }
      } else {
        currentState = "PILOT_READY";
        whatHappened = "Human reviewer authorized PILOT_READY. Ready for ground pilot deployment.";
        nextActionLabel = "Launch Field Pilot";
        nextActionHref = `/app/pilots?challenge_id=${challengeId}`;
      }
    }
  }

  // Lifecycle stage statuses for rail
  const railSteps = [
    { label: "REPORTED", done: true, active: currentState === "REPORTED" },
    { label: "QUALIFIED", done: !!latestQual, active: currentState === "INNOVATION_CHALLENGE" || currentState === "SERVICE" || currentState === "RESEARCH_REVIEW" },
    { label: "MATCHED", done: heiCandidates.length > 0, active: currentState === "MATCHED" },
    { label: "COMMITTED", done: commitments.some((c) => c.status === "ACCEPTED"), active: currentState === "COMMITTED" },
    { label: "PILOT READINESS", done: latestReadiness?.status === "PILOT_READY", active: currentState === "PILOT_READY" || currentState === "REVIEW_REQUIRED" },
    { label: "PILOT", done: !!activePilot, active: currentState.startsWith("PILOT_") },
    { label: "OUTCOME", done: !!latestOutcome, active: currentState.startsWith("OUTCOME_") },
  ];

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto space-y-6 py-2">
        {/* Navigation & Header */}
        <div className="space-y-3">
          <Link href="/app/challenges" className="text-xs font-bold text-stone-500 hover:text-stone-800 flex items-center space-x-1">
            <span>← Back to Challenges</span>
          </Link>

          <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <span className="bg-amber-100 text-amber-900 text-xs font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
                  {challenge.domain}
                </span>
                <span className="text-xs font-semibold text-stone-600">
                  {challenge.district}, {challenge.state}
                </span>
                <span className="text-[10px] font-bold bg-stone-100 text-stone-700 px-2 py-0.5 rounded border border-stone-200 uppercase">
                  Source: {challenge.source_type}
                </span>
              </div>
              <span className="text-xs font-mono text-stone-500">ID: {challenge.id}</span>
            </div>

            <h1 className="text-2xl font-bold text-stone-900 tracking-tight">{challenge.title}</h1>
            <p className="text-sm font-medium text-stone-800 bg-stone-50 p-3.5 rounded-lg border border-stone-200">
              {challenge.summary}
            </p>
          </div>
        </div>

        {/* Universal Current State Header */}
        <WhyThisState
          currentState={currentState}
          previousState={previousState}
          whatHappened={whatHappened}
          triggerEvent={triggerEvent}
          nextActionLabel={nextActionLabel}
          nextActionHref={nextActionHref}
        />

        {/* Prominent Lifecycle Rail */}
        <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-stone-500 uppercase tracking-widest">
              Authoritative Lifecycle Rail
            </h2>
            <span className="text-[11px] font-mono text-amber-700 font-bold">
              Stage: {currentState}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-7 gap-2 text-center text-xs font-bold">
            {railSteps.map((step, idx) => (
              <div
                key={idx}
                className={`p-2.5 rounded-lg border flex flex-col justify-between ${
                  step.active
                    ? "bg-amber-50 text-amber-950 border-amber-400 ring-2 ring-amber-500/20"
                    : step.done
                    ? "bg-emerald-50 text-emerald-900 border-emerald-300"
                    : "bg-stone-50 text-stone-400 border-stone-200"
                }`}
              >
                <span className="text-[10px] uppercase font-mono block text-stone-500">Step {idx + 1}</span>
                <span className="truncate">{step.label}</span>
                <span className="text-[9px] mt-1 font-mono uppercase">
                  {step.active ? "● Current" : step.done ? "✓ Done" : "— Pending"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Target Navigation Tabs */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="flex items-center border-b border-stone-200 overflow-x-auto bg-stone-50 px-2 pt-2">
            {[
              { id: "overview", label: "Overview" },
              { id: "evidence", label: `Evidence (${evidenceList.length})` },
              { id: "clarifications", label: `Clarifications (${clarifications.length})` },
              { id: "qualification", label: `Qualification (${qualifications.length})` },
              { id: "matching", label: `Matching (${heiCandidates.length})` },
              { id: "commitments", label: `Commitments (${commitments.length})` },
              { id: "readiness", label: `Readiness (${readinessDecisions.length})` },
              { id: "pilot", label: `Pilot (${pilots.length})` },
              { id: "outcome", label: `Outcome (${outcomes.length})` },
              { id: "history", label: "History & Audit" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`px-4 py-2.5 text-xs font-bold whitespace-nowrap transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? "border-amber-600 text-amber-900 bg-white rounded-t-lg"
                    : "border-transparent text-stone-600 hover:text-stone-900 hover:bg-stone-100/60"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* 1. OVERVIEW */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Detailed Narrative</h3>
                  <div className="text-sm text-stone-800 leading-relaxed whitespace-pre-line bg-stone-50 p-4 rounded-lg border border-stone-200">
                    {challenge.description}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 bg-stone-50 rounded-lg border border-stone-200 space-y-1">
                    <span className="font-bold text-stone-700 uppercase tracking-wider block">Submission Location</span>
                    <p className="text-stone-900 font-semibold">{challenge.district}, {challenge.state}</p>
                  </div>
                  <div className="p-4 bg-stone-50 rounded-lg border border-stone-200 space-y-1">
                    <span className="font-bold text-stone-700 uppercase tracking-wider block">Submitter Actor ID</span>
                    <p className="text-stone-900 font-mono">{challenge.submitted_by_actor_id || "Recorded Community Submitter"}</p>
                  </div>
                </div>
              </div>
            )}

            {/* 2. EVIDENCE */}
            {activeTab === "evidence" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-stone-500 uppercase tracking-widest">
                    Attached Evidence Materials ({evidenceList.length})
                  </h3>
                </div>

                {evidenceList.length === 0 ? (
                  <p className="text-xs text-stone-500 py-6 italic text-center border-2 border-dashed border-stone-200 rounded-lg">
                    No evidence files attached to this record.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {evidenceList.map((ev) => (
                      <div key={ev.id} className="p-4 bg-stone-50 rounded-lg border border-stone-200 space-y-2">
                        <span className="bg-stone-200 text-stone-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                          {ev.evidence_type}
                        </span>
                        <p className="text-xs text-stone-800 font-semibold">{ev.description}</p>
                        {ev.storage_reference?.startsWith("local://") && (
                          <a
                            href={`/api/v1/evidence/${ev.id}/file`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-bold text-amber-700 hover:underline flex items-center space-x-1 pt-1"
                          >
                            <span>Download / View File</span>
                            <span>↗</span>
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 3. CLARIFICATIONS */}
            {activeTab === "clarifications" && (
              <div className="space-y-6">
                <h3 className="text-xs font-bold text-stone-500 uppercase tracking-widest">
                  Clarification Thread ({clarifications.length})
                </h3>

                {clarifications.length === 0 ? (
                  <p className="text-xs text-stone-500 py-6 italic text-center border-2 border-dashed border-stone-200 rounded-lg">
                    No clarification queries requested for this challenge.
                  </p>
                ) : (
                  <div className="space-y-4 divide-y divide-stone-100">
                    {clarifications.map((req) => (
                      <div key={req.id} className="pt-3 space-y-3">
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 text-xs space-y-1">
                          <div className="flex items-center justify-between font-bold uppercase text-blue-900">
                            <span>Reviewer Question</span>
                            <span>Status: {req.status}</span>
                          </div>
                          <p className="text-stone-900 font-medium pt-1 text-sm">{req.question}</p>
                        </div>

                        {req.responses && req.responses.length > 0 && (
                          <div className="ml-4 space-y-2">
                            {req.responses.map((resp) => (
                              <div key={resp.id} className="bg-emerald-50 p-3.5 rounded-lg border border-emerald-200 text-xs">
                                <span className="font-bold text-emerald-900 uppercase">Citizen Response:</span>
                                <p className="text-stone-800 mt-1 text-sm">{resp.response}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        {req.status !== "RESOLVED" && user?.platform_role === "COMMUNITY_REPORTER" && (
                          <div className="ml-4 pt-2 space-y-2">
                            <textarea
                              rows={2}
                              value={replyText[req.id] || ""}
                              onChange={(e) => setReplyText({ ...replyText, [req.id]: e.target.value })}
                              placeholder="Type your response to the government reviewer query..."
                              className="w-full p-3 bg-stone-50 border border-stone-300 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                            />
                            <div className="flex justify-end">
                              <button
                                onClick={() => handleSendResponse(req.id)}
                                disabled={submittingReply[req.id] || !replyText[req.id]?.trim()}
                                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg disabled:opacity-50"
                              >
                                Submit Reply
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 4. QUALIFICATION */}
            {activeTab === "qualification" && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-stone-500 uppercase tracking-widest">
                  Qualification Decisions ({qualifications.length})
                </h3>

                {qualifications.length === 0 ? (
                  <p className="text-xs text-stone-500 py-6 italic text-center border-2 border-dashed border-stone-200 rounded-lg">
                    Qualification pending initial government review.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {qualifications.map((q) => (
                      <div key={q.id} className="p-4 bg-stone-50 rounded-lg border border-stone-200 text-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-stone-900 text-sm">Route: {q.route} (v{q.version})</span>
                          <span className="text-stone-500 font-mono">{new Date(q.decided_at).toLocaleString()}</span>
                        </div>
                        <p className="text-stone-700 bg-white p-3 rounded border border-stone-200">{q.rationale}</p>
                        <div className="text-[10px] text-stone-500 font-mono">
                          Decided by Actor: {q.decided_by_actor_id}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 5. MATCHING */}
            {activeTab === "matching" && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-stone-500 uppercase tracking-widest">
                  Matched HEI Candidates ({heiCandidates.length})
                </h3>

                {heiCandidates.length === 0 ? (
                  <p className="text-xs text-stone-500 py-6 italic text-center border-2 border-dashed border-stone-200 rounded-lg">
                    No HEI candidates matched to this challenge yet.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {heiCandidates.map((c) => (
                      <div key={c.id} className="p-4 bg-stone-50 rounded-lg border border-stone-200 text-xs space-y-2">
                        <div className="flex items-center justify-between font-bold text-stone-900">
                          <span>Organization ID: {c.organization_id}</span>
                          <span className="bg-blue-100 text-blue-900 px-2 py-0.5 rounded font-mono text-[10px]">
                            CANDIDATE match (Method: {c.match_method})
                          </span>
                        </div>
                        <p className="text-stone-700 bg-white p-2.5 rounded border border-stone-200">{c.rationale}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 6. COMMITMENTS */}
            {activeTab === "commitments" && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-stone-500 uppercase tracking-widest">
                  Institutional Commitments Series ({commitments.length})
                </h3>

                {commitments.length === 0 ? (
                  <p className="text-xs text-stone-500 py-6 italic text-center border-2 border-dashed border-stone-200 rounded-lg">
                    No commitments recorded for this challenge.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {commitments.map((cm) => (
                      <div key={cm.id} className="p-4 bg-stone-50 rounded-lg border border-stone-200 text-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-stone-900 text-sm">
                            Commitment v{cm.version} — Status: {cm.status}
                          </span>
                          <span className="text-[10px] font-mono text-stone-500">
                            Type: {cm.commitment_type}
                          </span>
                        </div>
                        <p className="text-stone-700 bg-white p-2.5 rounded border border-stone-200">
                          {cm.scope_description}
                        </p>
                        <div className="flex justify-between text-[10px] font-mono text-stone-500">
                          <span>Org ID: {cm.organization_id}</span>
                          <span>Recorded by: {cm.recorded_by_actor_id}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 7. READINESS */}
            {activeTab === "readiness" && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-stone-500 uppercase tracking-widest">
                  Pilot Readiness History & Dependency Invalidation ({readinessDecisions.length})
                </h3>

                {readinessDecisions.length === 0 ? (
                  <p className="text-xs text-stone-500 py-6 italic text-center border-2 border-dashed border-stone-200 rounded-lg">
                    No readiness decisions recorded.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {readinessDecisions.map((rd) => (
                      <div key={rd.id} className="p-4 bg-stone-50 rounded-lg border border-stone-200 text-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-stone-900 text-sm">
                            Readiness v{rd.version} — {rd.status}
                          </span>
                          <span className="text-[10px] font-mono text-stone-500">
                            {new Date(rd.created_at).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-stone-700 bg-white p-2.5 rounded border border-stone-200">
                          {rd.rationale}
                        </p>
                        {rd.triggered_by_commitment_id && (
                          <div className="text-[10px] text-amber-800 font-mono font-bold bg-amber-50 p-2 rounded border border-amber-200">
                            ⚡ Triggered by commitment change ID: {rd.triggered_by_commitment_id}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 8. PILOT */}
            {activeTab === "pilot" && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-stone-500 uppercase tracking-widest">
                  Field Pilot Status ({pilots.length})
                </h3>

                {pilots.length === 0 ? (
                  <p className="text-xs text-stone-500 py-6 italic text-center border-2 border-dashed border-stone-200 rounded-lg">
                    No active or planned pilot created for this challenge.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {pilots.map((p) => (
                      <div key={p.id} className="p-4 bg-stone-50 rounded-lg border border-stone-200 text-xs space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-stone-900 text-base">{p.name}</span>
                          <span className="bg-blue-100 text-blue-900 px-2.5 py-1 rounded font-bold">
                            Operational Status: {latestOpState ? latestOpState.status : "PLANNED"}
                          </span>
                        </div>
                        <p className="text-stone-700 bg-white p-3 rounded border border-stone-200">{p.site_description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 9. OUTCOME */}
            {activeTab === "outcome" && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-stone-500 uppercase tracking-widest">
                  Pilot Outcome Assessment ({outcomes.length})
                </h3>

                {outcomes.length === 0 ? (
                  <div className="p-6 bg-stone-50 rounded-lg border border-stone-200 text-xs space-y-2">
                    <div className="font-bold text-stone-900 text-sm">Operational Status: COMPLETED</div>
                    <div className="font-bold text-amber-900 bg-amber-100 p-2 rounded border border-amber-300 inline-block">
                      Evidence Conclusion: NOT_REVIEWED
                    </div>
                    <p className="text-stone-600 mt-2">
                      Pilot operations complete. Awaiting authorized human reviewer outcome assessment.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {outcomes.map((o) => (
                      <div key={o.id} className="p-4 bg-stone-50 rounded-lg border border-stone-200 text-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-stone-900 text-sm">
                            Evidence Conclusion: {o.conclusion}
                          </span>
                          <span className="text-[10px] font-mono text-stone-500">
                            {new Date(o.assessed_at).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-stone-800 bg-white p-3 rounded border border-stone-200">{o.summary}</p>
                        <div className="text-[10px] text-stone-500 font-mono">
                          Assessed by Human Actor: {o.assessed_by_actor_id}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 10. HISTORY & AUDIT */}
            {activeTab === "history" && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-stone-500 uppercase tracking-widest">
                  Human-Readable Lifecycle Audit History
                </h3>

                <div className="space-y-3 relative before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-stone-200">
                  <div className="relative pl-8 text-xs space-y-1">
                    <span className="absolute left-2 top-1 w-3 h-3 rounded-full bg-amber-600 ring-4 ring-white"></span>
                    <span className="font-bold text-stone-900 block">1. Challenge Submitted</span>
                    <p className="text-stone-600">Recorded on {new Date(challenge.created_at).toLocaleString()} by Submitter.</p>
                  </div>

                  {evidenceList.map((ev, i) => (
                    <div key={ev.id} className="relative pl-8 text-xs space-y-1">
                      <span className="absolute left-2 top-1 w-3 h-3 rounded-full bg-blue-600 ring-4 ring-white"></span>
                      <span className="font-bold text-stone-900 block">Evidence File Attached ({ev.evidence_type})</span>
                      <p className="text-stone-600">{ev.description}</p>
                    </div>
                  ))}

                  {clarifications.map((cl) => (
                    <div key={cl.id} className="relative pl-8 text-xs space-y-1">
                      <span className="absolute left-2 top-1 w-3 h-3 rounded-full bg-purple-600 ring-4 ring-white"></span>
                      <span className="font-bold text-stone-900 block">Clarification Requested</span>
                      <p className="text-stone-600">{cl.question}</p>
                      {cl.responses?.map((r) => (
                        <p key={r.id} className="text-emerald-800 font-semibold bg-emerald-50 p-2 rounded">
                          ✓ Submitter Responded: {r.response}
                        </p>
                      ))}
                    </div>
                  ))}

                  {qualifications.map((q) => (
                    <div key={q.id} className="relative pl-8 text-xs space-y-1">
                      <span className="absolute left-2 top-1 w-3 h-3 rounded-full bg-emerald-600 ring-4 ring-white"></span>
                      <span className="font-bold text-stone-900 block">Qualification Recorded: {q.route} v{q.version}</span>
                      <p className="text-stone-600">{q.rationale}</p>
                    </div>
                  ))}

                  {heiCandidates.map((c) => (
                    <div key={c.id} className="relative pl-8 text-xs space-y-1">
                      <span className="absolute left-2 top-1 w-3 h-3 rounded-full bg-blue-500 ring-4 ring-white"></span>
                      <span className="font-bold text-stone-900 block">HEI Candidate Identified</span>
                      <p className="text-stone-600">Org ID {c.organization_id}: {c.rationale}</p>
                    </div>
                  ))}

                  {commitments.map((cm) => (
                    <div key={cm.id} className="relative pl-8 text-xs space-y-1">
                      <span className="absolute left-2 top-1 w-3 h-3 rounded-full bg-purple-500 ring-4 ring-white"></span>
                      <span className="font-bold text-stone-900 block">Commitment Recorded: v{cm.version} ({cm.status})</span>
                      <p className="text-stone-600">{cm.scope_description}</p>
                    </div>
                  ))}

                  {readinessDecisions.map((rd) => (
                    <div key={rd.id} className="relative pl-8 text-xs space-y-1">
                      <span className="absolute left-2 top-1 w-3 h-3 rounded-full bg-amber-700 ring-4 ring-white"></span>
                      <span className="font-bold text-stone-900 block">Readiness Decision: v{rd.version} ({rd.status})</span>
                      <p className="text-stone-600">{rd.rationale}</p>
                    </div>
                  ))}

                  {outcomes.map((o) => (
                    <div key={o.id} className="relative pl-8 text-xs space-y-1">
                      <span className="absolute left-2 top-1 w-3 h-3 rounded-full bg-emerald-700 ring-4 ring-white"></span>
                      <span className="font-bold text-stone-900 block">Outcome Assessed: {o.conclusion}</span>
                      <p className="text-stone-600">{o.summary}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
