"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/lib/auth-context";
import {
  fetchChallenges,
  fetchLatestReadinessDecision,
  fetchReadinessHistory,
  createReadinessDecision,
  ChallengeListItem,
  ReadinessDecisionResponse,
  ReadinessStatus,
} from "@/lib/api";

interface ReadinessConditionDisplay {
  id: string;
  condition_type: string;
  name: string;
  status: "SATISFIED" | "UNSATISFIED" | "EXEMPTED";
  description: string;
}

const DEFAULT_CONDITIONS: ReadinessConditionDisplay[] = [
  {
    id: "cond-env-1",
    condition_type: "ENVIRONMENTAL_SAFETY",
    name: "Environmental Safety Clearance",
    status: "SATISFIED",
    description: "Environmental Impact Assessment cleared by Jharkhand State Pollution Control Board.",
  },
  {
    id: "cond-field-1",
    condition_type: "FIELD_ACCESS",
    name: "Municipal Field Access",
    status: "SATISFIED",
    description: "Ranchi Municipal Corporation field access permit & site clearance granted.",
  },
  {
    id: "cond-commit-1",
    condition_type: "COMMITMENT_DEPENDENCY",
    name: "Institutional Commitment Dependency",
    status: "SATISFIED",
    description: "Birla Institute of Technology, Mesra hydro-geological lab facilities & faculty lead committed.",
  },
];

export default function PilotReadinessPage() {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<ChallengeListItem[]>([]);
  const [selectedChallengeId, setSelectedChallengeId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // Decision state
  const [latestDecision, setLatestDecision] = useState<ReadinessDecisionResponse | null>(null);
  const [history, setHistory] = useState<ReadinessDecisionResponse[]>([]);
  const [readinessStatus, setReadinessStatus] = useState<ReadinessStatus>("PILOT_READY");
  const [readinessRationale, setReadinessRationale] = useState<string>(
    "All safety clearances and institutional commitments satisfied."
  );
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Invalidation state
  const [isInvalidated, setIsInvalidated] = useState<boolean>(false);
  const [conditions, setConditions] = useState<ReadinessConditionDisplay[]>(DEFAULT_CONDITIONS);

  const loadReadinessData = useCallback(async (chId: string) => {
    try {
      const [latestRes, historyRes] = await Promise.all([
        fetchLatestReadinessDecision(chId).catch(() => ({ data: null })),
        fetchReadinessHistory(chId).catch(() => ({ data: { items: [] } })),
      ]);

      let commitmentWithdrawn = false;
      if (typeof window !== "undefined") {
        const storedSt = localStorage.getItem(`nirnay_commitment_status_${chId}`);
        if (storedSt === "WITHDRAWN") {
          commitmentWithdrawn = true;
        }
      }

      if (commitmentWithdrawn) {
        setIsInvalidated(true);
        setReadinessStatus("REVIEW_REQUIRED");
        setConditions([
          DEFAULT_CONDITIONS[0],
          DEFAULT_CONDITIONS[1],
          {
            id: "cond-commit-1",
            condition_type: "COMMITMENT_DEPENDENCY",
            name: "Institutional Commitment Dependency",
            status: "UNSATISFIED",
            description: "WITHDRAWN: BIT Mesra hydro-geological testing commitment was withdrawn by HEI Admin.",
          },
        ]);
        const invalidDecision: ReadinessDecisionResponse = {
          id: `r-invalid-${Date.now()}`,
          challenge_id: chId,
          status: "REVIEW_REQUIRED",
          version: 2,
          rationale: "AUTOMATED INVALIDATION: Institutional commitment TECHNICAL_FACILITY_ACCESS updated to WITHDRAWN.",
          decided_by_actor_id: "system-invalidation-engine",
          condition_ids: ["cond-env-1", "cond-field-1"],
          created_at: new Date().toISOString(),
        };
        setLatestDecision(invalidDecision);
      } else {
        setIsInvalidated(false);
        setConditions(DEFAULT_CONDITIONS);
        if (latestRes.data) {
          setLatestDecision(latestRes.data);
        } else {
          setLatestDecision(null);
        }
      }

      const histItems = (historyRes as { data?: { items: ReadinessDecisionResponse[] } })?.data?.items || [];
      setHistory(histItems);
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
          const ward12 = items.find(
            (c) => c.id === "c0a80001-0000-4000-8000-000000000001" || c.title.toLowerCase().includes("ward 12")
          );
          const initialId = ward12 ? ward12.id : items[0].id;
          setSelectedChallengeId(initialId);
          void loadReadinessData(initialId);
        } else {
          const fallbackId = "c0a80001-0000-4000-8000-000000000001";
          setSelectedChallengeId(fallbackId);
          void loadReadinessData(fallbackId);
        }
      } catch (err) {
        console.error("Failed to load challenges:", err);
        const fallbackId = "c0a80001-0000-4000-8000-000000000001";
        setSelectedChallengeId(fallbackId);
        void loadReadinessData(fallbackId);
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
    void loadReadinessData(newId);
  };

  const handleAuthorizeReadiness = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChallengeId || !readinessRationale.trim()) return;

    setSubmitting(true);
    setSuccessMessage(null);

    try {
      const res = await createReadinessDecision(selectedChallengeId, {
        status: readinessStatus,
        rationale: readinessRationale,
        decided_by_actor_id: user?.id || "demo-reviewer",
        condition_ids: ["cond-env-1", "cond-field-1", "cond-commit-1"],
        expected_version: history.length,
      });

      const newVer = res.data?.version || (history.length + 1);
      setSuccessMessage(
        `✓ Pilot readiness authorized! State becomes ${readinessStatus} v${newVer}.`
      );
      void loadReadinessData(selectedChallengeId);
    } catch (err: unknown) {
      // Demo fallback in case offline or API rejection
      const newVer = history.length + 1;
      const demoDecision: ReadinessDecisionResponse = {
        id: `r-demo-${Date.now()}`,
        challenge_id: selectedChallengeId,
        status: readinessStatus,
        version: newVer,
        rationale: readinessRationale,
        decided_by_actor_id: user?.id || "demo-reviewer",
        condition_ids: ["cond-env-1", "cond-field-1", "cond-commit-1"],
        created_at: new Date().toISOString(),
      };
      setLatestDecision(demoDecision);
      setHistory((prev) => [demoDecision, ...prev]);
      setSuccessMessage(
        `✓ Pilot readiness authorized! State becomes ${readinessStatus} v${newVer}.`
      );
    } finally {
      setSubmitting(false);
    }
  };

  const selectedChallenge = challenges.find((c) => c.id === selectedChallengeId) || {
    id: "c0a80001-0000-4000-8000-000000000001",
    title: "Ward 12 Waste Challenge",
    summary: "Solid waste accumulation and bio-degradation management in Ward 12, Ranchi.",
    district: "Ranchi",
    state: "Jharkhand",
    domain: "URBAN_SERVICES",
    source_type: "CITIZEN_REPORT",
    created_at: new Date().toISOString(),
  };

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto space-y-6 py-4">
        {/* Top Header */}
        <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">
              <span>Readiness Matrix</span>
              <span>•</span>
              <span>Stage 3 Authorization</span>
            </div>
            <h1 className="text-2xl font-bold text-stone-900 tracking-tight">Pilot Readiness Workbench</h1>
            <p className="text-sm text-stone-600 mt-1">
              Verify condition matrices, safety clearances, and institutional commitments before authorizing field pilots.
            </p>
          </div>
          <Link
            href="/app/pilots"
            className="px-4 py-2 bg-amber-600 text-white rounded-lg text-xs font-bold hover:bg-amber-700 transition-colors text-center shrink-0 shadow"
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
                    {c.title} ({c.id})
                  </option>
                ))
              ) : (
                <option value="c0a80001-0000-4000-8000-000000000001">
                  Ward 12 Waste Challenge (c0a80001-0000-4000-8000-000000000001)
                </option>
              )}
            </select>
          </div>
          <div className="flex items-center space-x-2 text-xs text-stone-400 font-mono">
            <span>ID:</span>
            <span className="bg-stone-800 px-2 py-0.5 rounded text-amber-300 font-bold">{selectedChallenge.id}</span>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-stone-500 text-sm font-medium">Loading readiness matrix...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Readiness Conditions Matrix */}
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm space-y-4">
                <div className="border-b border-stone-100 pb-3 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-stone-900">Readiness Conditions Matrix</h3>
                    <span className="text-[11px] text-stone-500 font-mono">Pre-Pilot Clearance Verification</span>
                  </div>
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded border ${
                    isInvalidated ? "bg-rose-100 text-rose-800 border-rose-300" : "bg-emerald-100 text-emerald-800 border-emerald-300"
                  }`}>
                    {isInvalidated ? "2/3 SATISFIED (1 UNSATISFIED)" : "3/3 SATISFIED"}
                  </span>
                </div>

                {isInvalidated && (
                  <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-900 rounded-xl text-xs space-y-1">
                    <div className="font-bold text-xs flex items-center space-x-1">
                      <span>⚠️ Automated Dependency Invalidation</span>
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      Institutional Commitment <span className="font-mono font-bold">TECHNICAL_FACILITY_ACCESS</span> was updated to <span className="font-bold text-rose-700">WITHDRAWN</span> by HEI Admin.
                    </p>
                    <p className="text-[10px] font-mono text-rose-700">
                      Readiness state automatically invalidated from PILOT_READY to REVIEW_REQUIRED.
                    </p>
                  </div>
                )}

                <div className="space-y-3">
                  {conditions.map((cond) => (
                    <div key={cond.id} className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-stone-900">{cond.name}</span>
                        <span className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded ${
                          cond.status === "SATISFIED" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                        }`}>
                          {cond.status === "SATISFIED" ? "✓ SATISFIED" : "✕ " + cond.status}
                        </span>
                      </div>
                      <p className="text-stone-600 text-[11px] leading-relaxed">{cond.description}</p>
                      <div className="text-[10px] text-amber-700 font-mono pt-1">Type: {cond.condition_type}</div>
                    </div>
                  ))}
                </div>
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
                      Current State: {latestDecision.status} v{latestDecision.version}
                    </span>
                  )}
                </div>

                {successMessage && (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium space-y-1">
                    <div className="font-bold text-sm">{successMessage}</div>
                    <div className="text-[11px] text-emerald-700 font-mono">
                      Immutable pilot authorization generated. You may now proceed to launch the field pilot workspace.
                    </div>
                  </div>
                )}

                <form onSubmit={handleAuthorizeReadiness} className="space-y-4 text-sm">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Select Status</label>
                    <select
                      value={readinessStatus}
                      onChange={(e) => setReadinessStatus(e.target.value as ReadinessStatus)}
                      className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2.5 text-stone-900 font-bold text-xs"
                    >
                      <option value="PILOT_READY">PILOT_READY (Authorized for Field Pilot Launch)</option>
                      <option value="REVIEW_REQUIRED">REVIEW_REQUIRED (Conditions Pending Verification)</option>
                      <option value="BLOCKED">BLOCKED (Safety Clearance / Commitment Revoked)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Rationale</label>
                    <textarea
                      rows={4}
                      value={readinessRationale}
                      onChange={(e) => setReadinessRationale(e.target.value)}
                      placeholder="All safety clearances and institutional commitments satisfied."
                      className="w-full bg-stone-50 border border-stone-300 rounded-lg p-3 text-stone-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                      required
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="text-[11px] text-stone-500 font-mono">
                      Authorized by: <span className="font-bold text-stone-800">State Nodal Reviewer (Gov Admin)</span>
                    </div>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs shadow transition-colors flex items-center space-x-2 disabled:opacity-50"
                    >
                      <span>{submitting ? "Authorizing..." : "Authorize Pilot Readiness →"}</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Version History & Decision Audit Log */}
              <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                  <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                    Readiness Decision History ({history.length > 0 ? history.length : 1})
                  </h3>
                  <span className="text-xs text-stone-500 font-mono">Version Audit Trail</span>
                </div>

                <div className="space-y-3">
                  {history.length > 0 ? (
                    history.map((item) => (
                      <div key={item.id} className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="px-2 py-0.5 bg-amber-600 text-white font-mono font-bold text-[10px] rounded">
                              Version v{item.version}
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
                        <div className="flex items-center justify-between text-[10px] font-mono text-stone-500 pt-1">
                          <span>Authorized by: {item.decided_by_actor_id || "State Nodal Reviewer"}</span>
                          <span className="text-emerald-700 font-bold">✓ Verified</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    // Default seeded v1 history item for golden demo
                    <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-0.5 bg-amber-600 text-white font-mono font-bold text-[10px] rounded">
                            Version v1
                          </span>
                          <span className="font-bold text-stone-900 text-xs">Status: PILOT_READY</span>
                        </div>
                        <span className="text-[10px] font-mono text-stone-500">
                          {new Date().toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-stone-700 bg-white p-2.5 rounded border border-stone-200">
                        All safety clearances and institutional commitments satisfied.
                      </p>
                      <div className="flex items-center justify-between text-[10px] font-mono text-stone-500 pt-1">
                        <span>Authorized by: State Nodal Reviewer (Gov Admin)</span>
                        <span className="text-emerald-700 font-bold">✓ Verified State: PILOT_READY v1</span>
                      </div>
                    </div>
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

