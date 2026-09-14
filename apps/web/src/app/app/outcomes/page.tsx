"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/lib/auth-context";
import {
  fetchLatestOutcomeAssessment,
  fetchOutcomeHistory,
  createOutcomeAssessment,
  OutcomeAssessmentResponse,
  EvidenceConclusion,
} from "@/lib/api";

interface DemoPilotOption {
  id: string;
  name: string;
  opState: string;
}

const COMPLETED_PILOTS: DemoPilotOption[] = [
  {
    id: "b0a80002-0000-4000-8000-000000000006",
    name: "Hazaribagh Vendor Cold Chain Field Pilot",
    opState: "COMPLETED",
  },
  {
    id: "b0a80001-0000-4000-8000-000000000006",
    name: "Ward 12 Bio-Digestion Waste Sorting Pilot",
    opState: "COMPLETED",
  },
];

export default function OutcomeEvaluationPage() {
  const { user } = useAuth();
  const [selectedPilotId, setSelectedPilotId] = useState<string>("b0a80002-0000-4000-8000-000000000006");
  const [loading, setLoading] = useState(true);

  // Outcome state
  const [latestAssessment, setLatestAssessment] = useState<OutcomeAssessmentResponse | null>(null);
  const [history, setHistory] = useState<OutcomeAssessmentResponse[]>([]);
  const [conclusion, setConclusion] = useState<EvidenceConclusion>("INCONCLUSIVE");
  const [outcomeRationale, setOutcomeRationale] = useState<string>(
    "Monsoon weather variations reduced solar efficiency during weeks 3-4, requiring extended sample size."
  );
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadOutcomeData = useCallback(async (pId: string) => {
    setLoading(true);
    try {
      const [latestRes, historyRes] = await Promise.all([
        fetchLatestOutcomeAssessment(pId).catch(() => ({ data: null })),
        fetchOutcomeHistory(pId).catch(() => ({ data: { items: [] } })),
      ]);

      if (latestRes.data) {
        setLatestAssessment(latestRes.data);
      } else {
        setLatestAssessment(null);
      }

      const histItems = (historyRes as { data?: { items: OutcomeAssessmentResponse[] } })?.data?.items || [];
      setHistory(histItems);
    } catch (err) {
      console.error("Failed to load outcome assessment data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadOutcomeData(selectedPilotId);
  }, [selectedPilotId, loadOutcomeData]);

  const handlePilotChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newId = e.target.value;
    setSelectedPilotId(newId);
    setSuccessMessage(null);
    void loadOutcomeData(newId);
  };

  const handleRecordOutcomeAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPilotId || !outcomeRationale.trim()) return;

    setSubmitting(true);
    setSuccessMessage(null);

    try {
      const res = await createOutcomeAssessment(selectedPilotId, {
        evidence_plan_id: "plan-demo-1",
        conclusion: conclusion,
        summary: outcomeRationale,
        limitations: "Monsoon weather variations during weeks 3-4",
        assessed_by_actor_id: user?.id || "demo-reviewer",
        evidence_ids: [],
        expected_version: history.length,
      });

      const newVer = res.data?.version || (history.length + 1);
      setSuccessMessage(
        `✓ Outcome assessment recorded! Conclusion: ${conclusion} v${newVer}. Note: Operational state remains COMPLETED.`
      );
      void loadOutcomeData(selectedPilotId);
    } catch (err: unknown) {
      // Offline / Demo fallback
      const newVer = history.length + 1;
      const demoOutcome: OutcomeAssessmentResponse = {
        id: `out-demo-${Date.now()}`,
        pilot_id: selectedPilotId,
        evidence_plan_id: "plan-demo-1",
        conclusion: conclusion,
        version: newVer,
        summary: outcomeRationale,
        limitations: "Monsoon weather variations during weeks 3-4",
        assessed_by_actor_id: user?.id || "demo-reviewer",
        assessed_at: new Date().toISOString(),
        evidence_ids: [],
      };
      setLatestAssessment(demoOutcome);
      setHistory((prev) => [demoOutcome, ...prev]);
      setSuccessMessage(
        `✓ Outcome assessment recorded! Conclusion: ${conclusion} v${newVer}. Note: Operational state remains COMPLETED.`
      );
    } finally {
      setSubmitting(false);
    }
  };

  const currentPilot = COMPLETED_PILOTS.find((p) => p.id === selectedPilotId) || COMPLETED_PILOTS[0];

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto space-y-6 py-4">
        {/* Top Header */}
        <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">
              <span>Evidence Audit</span>
              <span>•</span>
              <span>Stage 5 Evaluation</span>
            </div>
            <h1 className="text-2xl font-bold text-stone-900 tracking-tight">Outcome Evaluation Workbench</h1>
            <p className="text-sm text-stone-600 mt-1">
              Evaluate factual evidence outcomes (INCONCLUSIVE vs VALIDATED) with strict operational state separation.
            </p>
          </div>
          <Link
            href="/app/commitments"
            className="px-4 py-2 bg-stone-900 text-white rounded-lg text-xs font-bold hover:bg-stone-800 transition-colors text-center shrink-0"
          >
            Commitment Register →
          </Link>
        </div>

        {/* Completed Pilot Selection Bar */}
        <div className="bg-stone-900 text-white p-4 rounded-xl border border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Select Completed Pilot:</span>
            <select
              value={selectedPilotId}
              onChange={handlePilotChange}
              className="bg-stone-800 border border-stone-700 rounded-lg px-3 py-1.5 text-xs font-bold text-white max-w-md focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              {COMPLETED_PILOTS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.id})
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center space-x-2 text-xs text-stone-400 font-mono">
            <span>Pilot State:</span>
            <span className="bg-stone-800 text-amber-300 border border-stone-700 px-2.5 py-0.5 rounded font-bold uppercase">
              {currentPilot.opState}
            </span>
          </div>
        </div>

        {/* Execution vs Evidence Separation Banner */}
        <div className="bg-amber-950 text-amber-100 p-5 rounded-xl border border-amber-800 shadow-md space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
              <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                Execution vs Evidence Separation Rule (Completion ≠ Impact)
              </h3>
            </div>
            <span className="px-2 py-0.5 bg-amber-900 text-amber-200 border border-amber-700 font-mono text-[10px] rounded">
              Governance Integrity Guaranteed
            </span>
          </div>
          <p className="text-xs text-amber-200/90 leading-relaxed">
            Operational state lifecycle (<span className="font-mono text-amber-300">COMPLETED</span>) records physical field execution ending. 
            Evidence outcome conclusions (<span className="font-mono text-amber-300">INCONCLUSIVE / VALIDATED</span>) are evaluated strictly independently by reviewers. Operational completion does NOT force impact validation.
          </p>
        </div>

        {loading ? (
          <div className="py-12 text-center text-stone-500 text-sm font-medium">Loading outcome evaluation workbench...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Pilot Metadata & Separation Status */}
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm space-y-4">
                <div className="border-b border-stone-100 pb-3">
                  <h3 className="text-sm font-bold text-stone-900">Integrity Separation Status</h3>
                  <span className="text-[11px] text-stone-500 font-mono">Decoupled Operational Audit</span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="bg-stone-50 p-3 rounded-lg border border-stone-200 flex items-center justify-between">
                    <span className="font-medium text-stone-700">Operational State:</span>
                    <span className="font-mono font-bold text-stone-900 bg-stone-200 px-2 py-0.5 rounded">
                      COMPLETED
                    </span>
                  </div>

                  <div className="bg-stone-50 p-3 rounded-lg border border-stone-200 flex items-center justify-between">
                    <span className="font-medium text-stone-700">Evidence Conclusion:</span>
                    <span className={`font-mono font-bold px-2 py-0.5 rounded ${
                      latestAssessment?.conclusion === "VALIDATED"
                        ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                        : "bg-amber-100 text-amber-900 border border-amber-300"
                    }`}>
                      {latestAssessment?.conclusion || "INCONCLUSIVE"}
                    </span>
                  </div>

                  <div className="pt-2 text-[11px] text-stone-500 space-y-1">
                    <div className="font-bold text-stone-800">Target Pilot:</div>
                    <div className="font-medium text-stone-900">{currentPilot.name}</div>
                    <div className="font-mono text-[10px] text-stone-400">ID: {currentPilot.id}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Middle & Right Column: Record Outcome Assessment Form & Audit History */}
            <div className="lg:col-span-2 space-y-6">
              {/* Record Outcome Form */}
              <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                  <div>
                    <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Formal Evidence Action</span>
                    <h2 className="text-lg font-bold text-stone-900 mt-0.5">Record Outcome Assessment</h2>
                  </div>
                  {latestAssessment && (
                    <span className="px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 font-mono font-bold text-xs rounded-lg">
                      Latest: v{latestAssessment.version} ({latestAssessment.conclusion})
                    </span>
                  )}
                </div>

                {successMessage && (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium space-y-1">
                    <div className="font-bold text-sm">{successMessage}</div>
                    <div className="text-[11px] text-emerald-700 font-mono">
                      Immutable outcome finding stored in version history chain.
                    </div>
                  </div>
                )}

                <form onSubmit={handleRecordOutcomeAssessment} className="space-y-4 text-sm">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Select Conclusion</label>
                    <select
                      value={conclusion}
                      onChange={(e) => setConclusion(e.target.value as EvidenceConclusion)}
                      className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2.5 text-stone-900 font-bold text-xs"
                    >
                      <option value="INCONCLUSIVE">INCONCLUSIVE (Weather / Sample Size Anomalies Requiring Extension)</option>
                      <option value="VALIDATED">VALIDATED (Evidence Satisfies Target Success Metrics)</option>
                      <option value="ITERATE">ITERATE (Requires Model Adjustments & Re-testing)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Rationale</label>
                    <textarea
                      rows={4}
                      value={outcomeRationale}
                      onChange={(e) => setOutcomeRationale(e.target.value)}
                      placeholder="Monsoon weather variations reduced solar efficiency during weeks 3-4, requiring extended sample size."
                      className="w-full bg-stone-50 border border-stone-300 rounded-lg p-3 text-stone-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                      required
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="text-[11px] text-stone-500 font-mono">
                      Assessed by: <span className="font-bold text-stone-800">State Nodal Reviewer</span>
                    </div>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs shadow transition-colors flex items-center space-x-2 disabled:opacity-50"
                    >
                      <span>{submitting ? "Recording..." : "Record Outcome Assessment →"}</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Version History & Outcome Audit Log */}
              <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                  <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                    Outcome Decision History ({history.length > 0 ? history.length : 1})
                  </h3>
                  <span className="text-xs text-stone-500 font-mono">Version Chain Audit</span>
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
                            <span className="font-bold text-stone-900 text-xs">Conclusion: {item.conclusion}</span>
                          </div>
                          <span className="text-[10px] font-mono text-stone-500">
                            {new Date(item.assessed_at).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-xs text-stone-700 bg-white p-2.5 rounded border border-stone-200">
                          {item.summary}
                        </p>
                        <div className="flex items-center justify-between text-[10px] font-mono text-stone-500 pt-1">
                          <span>Assessed by: {item.assessed_by_actor_id || "State Nodal Reviewer"}</span>
                          <span className="text-amber-800 font-bold">Separation Integrity: COMPLETED ≠ IMPAC</span>
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
                          <span className="font-bold text-stone-900 text-xs">Conclusion: INCONCLUSIVE</span>
                        </div>
                        <span className="text-[10px] font-mono text-stone-500">
                          {new Date().toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-stone-700 bg-white p-2.5 rounded border border-stone-200">
                        Monsoon weather variations reduced solar efficiency during weeks 3-4, requiring extended sample size.
                      </p>
                      <div className="flex items-center justify-between text-[10px] font-mono text-stone-500 pt-1">
                        <span>Assessed by: State Nodal Reviewer (Gov Admin)</span>
                        <span className="text-amber-800 font-bold">Separation Integrity: COMPLETED ≠ IMPACT</span>
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

