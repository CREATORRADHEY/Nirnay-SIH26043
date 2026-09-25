"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/lib/auth-context";
import { WhyThisState } from "@/components/WhyThisState";
import {
  fetchChallenges,
  fetchLatestReadinessDecision,
  fetchReadinessHistory,
  fetchReadinessConditions,
  fetchCommitments,
  createReadinessDecision,
  ChallengeListItem,
  ReadinessDecisionResponse,
  ReadinessConditionResponse,
  CommitmentResponse,
  ReadinessStatus,
} from "@/lib/api";

export default function PilotReadinessPage() {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<ChallengeListItem[]>([]);
  const [selectedChallengeId, setSelectedChallengeId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // Decision & Condition state from real backend
  const [latestDecision, setLatestDecision] = useState<ReadinessDecisionResponse | null>(null);
  const [history, setHistory] = useState<ReadinessDecisionResponse[]>([]);
  const [conditions, setConditions] = useState<ReadinessConditionResponse[]>([]);
  const [commitments, setCommitments] = useState<CommitmentResponse[]>([]);

  // Form state
  const [readinessStatus, setReadinessStatus] = useState<ReadinessStatus>("PILOT_READY");
  const [readinessRationale, setReadinessRationale] = useState<string>(
    "All safety clearances and institutional commitments satisfied."
  );
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadReadinessData = useCallback(async (chId: string) => {
    try {
      const [latestRes, historyRes, condRes, commRes] = await Promise.all([
        fetchLatestReadinessDecision(chId).catch(() => ({ data: null })),
        fetchReadinessHistory(chId).catch(() => ({ data: { items: [] } })),
        fetchReadinessConditions(chId).catch(() => ({ data: { items: [] } })),
        fetchCommitments(chId).catch(() => ({ data: { items: [] } })),
      ]);

      if (latestRes.data) {
        setLatestDecision(latestRes.data);
      } else {
        setLatestDecision(null);
      }

      const histItems = (historyRes as { data?: { items: ReadinessDecisionResponse[] } })?.data?.items || [];
      setHistory(histItems);

      const condItems = (condRes as { data?: { items: ReadinessConditionResponse[] } })?.data?.items || [];
      setConditions(condItems);

      const commItems = (commRes as { data?: { items: CommitmentResponse[] } })?.data?.items || [];
      setCommitments(commItems);
    } catch (err) {
      console.error("Failed to fetch readiness data:", err);
    }
  }, []);

  useEffect(() => {
    async function init() {
      try {
        const res = await fetchChallenges();
        const items = res.data?.items || [];
        setChallenges(items);

        if (items.length > 0) {
          const firstId = items[0].id;
          setSelectedChallengeId(firstId);
          void loadReadinessData(firstId);
        }
      } catch (err) {
        console.error("Failed to load challenges:", err);
      } finally {
        setLoading(false);
      }
    }
    void init();
  }, [loadReadinessData]);

  const handleChallengeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newId = e.target.value;
    setSelectedChallengeId(newId);
    setSuccessMessage(null);
    setErrorMessage(null);
    void loadReadinessData(newId);
  };

  const handleAuthorizeReadiness = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChallengeId || !readinessRationale.trim()) return;

    setSubmitting(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const conditionIds = conditions.map((c) => c.id);
      const res = await createReadinessDecision(selectedChallengeId, {
        status: readinessStatus,
        rationale: readinessRationale,
        decided_by_actor_id: user?.id || "demo-reviewer",
        condition_ids: conditionIds,
        expected_version: history.length,
      });

      const newVer = res.data?.version || history.length + 1;
      setSuccessMessage(`✓ Pilot readiness authorized! State becomes ${readinessStatus} v${newVer}.`);
      void loadReadinessData(selectedChallengeId);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to record readiness decision";
      setErrorMessage(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const selectedChallenge = challenges.find((c) => c.id === selectedChallengeId) || {
    id: selectedChallengeId || "c0a80001-0000-4000-8000-000000000001",
    title: "Ward 12 Waste Challenge",
    summary: "Solid waste accumulation and bio-degradation management in Ward 12, Ranchi.",
    district: "Ranchi",
    state: "Jharkhand",
    domain: "URBAN_SERVICES",
    source_type: "CITIZEN_REPORT",
    created_at: new Date().toISOString(),
  };

  const isInvalidated = latestDecision?.status === "REVIEW_REQUIRED";
  const prevDecision = history.length > 1 ? history[history.length - 2] : null;

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto space-y-6 py-4">
        {/* Top Header */}
        <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">
              <span>Readiness Matrix</span>
              <span>•</span>
              <span>Stage 5 Authorization</span>
            </div>
            <h1 className="text-2xl font-bold text-stone-900 tracking-tight">Pilot Readiness Authorization</h1>
            <p className="text-sm text-stone-600 mt-1">
              Verify condition matrices, safety clearances, and institutional commitments before granting human PILOT_READY authorization.
            </p>
          </div>
          <Link
            href="/app/pilots"
            className="px-5 py-2.5 bg-amber-600 text-white rounded-lg text-xs font-bold hover:bg-amber-700 transition-colors text-center shrink-0 shadow"
          >
            Launch Pilot Workspace →
          </Link>
        </div>

        {/* Challenge Selection Bar */}
        <div className="bg-stone-900 text-white p-4 rounded-xl border border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Select Challenge:</span>
            <select
              value={selectedChallengeId}
              onChange={handleChallengeChange}
              className="bg-stone-800 border border-stone-700 rounded-lg px-3 py-1.5 text-xs font-bold text-white max-w-md focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              {challenges.length > 0 ? (
                challenges.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title} ({c.id.slice(0, 8)}...)
                  </option>
                ))
              ) : (
                <option value="c0a80001-0000-4000-8000-000000000001">
                  Ward 12 Waste Challenge
                </option>
              )}
            </select>
          </div>
          <div className="flex items-center space-x-2 text-xs text-stone-400 font-mono">
            <span>ID:</span>
            <span className="bg-stone-800 px-2 py-0.5 rounded text-amber-300 font-bold">{selectedChallenge.id}</span>
          </div>
        </div>

        {/* Hero Dependency Invalidation Banner */}
        {latestDecision && (
          <WhyThisState
            currentState={latestDecision.status}
            previousState={prevDecision ? `${prevDecision.status} v${prevDecision.version}` : null}
            whatHappened={latestDecision.rationale}
            triggerEvent={
              latestDecision.triggered_by_commitment_id
                ? `Dependency invalidation triggered by Commitment update ID ${latestDecision.triggered_by_commitment_id}`
                : null
            }
            nextActionLabel={isInvalidated ? "Re-evaluate Pilot Readiness" : "Grant PILOT_READY"}
            onNextActionClick={() => {
              window.scrollTo({ top: 400, behavior: "smooth" });
            }}
          />
        )}

        {loading ? (
          <div className="py-12 text-center text-stone-500 text-sm font-medium">Loading readiness matrix...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Readiness Conditions Matrix & Commitments Status */}
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm space-y-4">
                <div className="border-b border-stone-100 pb-3 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-stone-900">Readiness Conditions Matrix</h3>
                    <span className="text-[11px] text-stone-500 font-mono">Pre-Pilot Clearance Verification</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold rounded border ${
                      isInvalidated ? "bg-rose-100 text-rose-800 border-rose-300" : "bg-emerald-100 text-emerald-800 border-emerald-300"
                    }`}
                  >
                    {isInvalidated ? "INVALIDATED (REVIEW REQUIRED)" : `${conditions.length} CONDITIONS RECORDED`}
                  </span>
                </div>

                <div className="space-y-3">
                  {conditions.length === 0 ? (
                    <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-500 italic text-center">
                      No explicit conditions attached to latest decision. Standard pre-pilot checklist applies.
                    </div>
                  ) : (
                    conditions.map((cond) => (
                      <div key={cond.id} className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 space-y-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-stone-900">{cond.condition_key} (v{cond.version})</span>
                          <span
                            className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded ${
                              cond.status === "SATISFIED" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                            }`}
                          >
                            {cond.status}
                          </span>
                        </div>
                        <p className="text-stone-600 text-[11px] leading-relaxed">{cond.rationale}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Related Commitments */}
              <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                  <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                    Institutional Commitments Basis ({commitments.length})
                  </h3>
                  <Link href={`/app/commitments?challenge_id=${selectedChallengeId}`} className="text-[11px] font-bold text-amber-700 hover:underline">
                    Manage →
                  </Link>
                </div>
                {commitments.length === 0 ? (
                  <p className="text-xs text-stone-500 italic">No commitments recorded for this challenge.</p>
                ) : (
                  <div className="space-y-2">
                    {commitments.map((cm) => (
                      <div key={cm.id} className="p-3 bg-stone-50 rounded-lg border border-stone-200 text-xs space-y-1">
                        <div className="flex items-center justify-between font-bold">
                          <span className="text-stone-900">{cm.commitment_type} v{cm.version}</span>
                          <span
                            className={`px-2 py-0.5 text-[10px] rounded ${
                              cm.status === "ACCEPTED"
                                ? "bg-emerald-100 text-emerald-900"
                                : cm.status === "WITHDRAWN"
                                ? "bg-rose-100 text-rose-900 font-bold"
                                : "bg-stone-200 text-stone-800"
                            }`}
                          >
                            {cm.status}
                          </span>
                        </div>
                        <p className="text-stone-600 text-[11px]">{cm.scope_description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Middle & Right Column: Record Readiness Decision & Audit History */}
            <div className="lg:col-span-2 space-y-6">
              {/* Record Decision Card */}
              <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                  <div>
                    <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Human Governance Action</span>
                    <h2 className="text-lg font-bold text-stone-900 mt-0.5">Record Readiness Decision</h2>
                  </div>
                  {latestDecision && (
                    <span className="px-2.5 py-1 bg-amber-100 text-amber-900 border border-amber-300 font-mono font-bold text-xs rounded-lg">
                      Current: {latestDecision.status} v{latestDecision.version}
                    </span>
                  )}
                </div>

                {successMessage && (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium space-y-1">
                    <div className="font-bold text-sm">{successMessage}</div>
                  </div>
                )}

                {errorMessage && (
                  <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-medium">
                    ⚠️ {errorMessage}
                  </div>
                )}

                <form onSubmit={handleAuthorizeReadiness} className="space-y-4 text-sm">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                      Readiness Status * (Authorized Human Only)
                    </label>
                    <select
                      value={readinessStatus}
                      onChange={(e) => setReadinessStatus(e.target.value as ReadinessStatus)}
                      className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2.5 text-stone-900 font-bold text-xs"
                    >
                      <option value="PILOT_READY">PILOT_READY (Authorized for Field Pilot Launch)</option>
                      <option value="BLOCKED">BLOCKED (Safety Clearance or Commitment Revoked)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Authorization Rationale *</label>
                    <textarea
                      rows={4}
                      value={readinessRationale}
                      onChange={(e) => setReadinessRationale(e.target.value)}
                      placeholder="State human sign-off justification..."
                      className="w-full bg-stone-50 border border-stone-300 rounded-lg p-3 text-stone-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                      required
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="text-[11px] text-stone-500 font-mono">
                      Authorized by: <span className="font-bold text-stone-800">{user?.display_name || "State Nodal Reviewer"}</span>
                    </div>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs shadow transition-colors flex items-center space-x-2 disabled:opacity-50"
                    >
                      <span>{submitting ? "Authorizing..." : "Authorize Readiness →"}</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Version History & Decision Audit Log */}
              <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                  <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                    Readiness Decision History ({history.length})
                  </h3>
                  <span className="text-xs text-stone-500 font-mono">Immutable Version Chain</span>
                </div>

                <div className="space-y-3">
                  {history.length === 0 ? (
                    <p className="text-xs text-stone-500 py-4 italic text-center">No readiness decisions recorded.</p>
                  ) : (
                    history.map((item) => (
                      <div key={item.id} className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="px-2 py-0.5 bg-amber-600 text-white font-mono font-bold text-[10px] rounded">
                              v{item.version}
                            </span>
                            <span className="font-bold text-stone-900 text-xs">Status: {item.status}</span>
                          </div>
                          <span className="text-[10px] font-mono text-stone-500">
                            {new Date(item.created_at).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-xs text-stone-700 bg-white p-2.5 rounded border border-stone-200">
                          {item.rationale}
                        </p>
                        {item.triggered_by_commitment_id && (
                          <div className="text-[10px] text-amber-800 font-mono font-bold bg-amber-50 p-2 rounded border border-amber-200">
                            ⚡ Dependency invalidation triggered by commitment update ID: {item.triggered_by_commitment_id}
                          </div>
                        )}
                        <div className="flex items-center justify-between text-[10px] font-mono text-stone-500 pt-1">
                          <span>Authorized by: {item.decided_by_actor_id || "System Invalidation Engine"}</span>
                          <span className="text-emerald-700 font-bold">✓ Persisted</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
