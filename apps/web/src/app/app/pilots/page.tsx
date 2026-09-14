"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/lib/auth-context";
import {
  fetchPilotDetail,
  createPilotOperationalState,
  PilotResponse,
  PilotOperationalStateResponse,
  OperationalStatus,
} from "@/lib/api";

interface DemoPilotItem {
  id: string;
  name: string;
  challenge_id: string;
  site_description: string;
}

const DEMO_PILOTS: DemoPilotItem[] = [
  {
    id: "b0a80002-0000-4000-8000-000000000006",
    name: "Hazaribagh Vendor Cold Chain Field Pilot",
    challenge_id: "c0a80002-0000-4000-8000-000000000002",
    site_description: "Peri-urban daily vegetable market, Ward 4, Hazaribagh",
  },
  {
    id: "b0a80001-0000-4000-8000-000000000006",
    name: "Ward 12 Bio-Digestion Waste Sorting Pilot",
    challenge_id: "c0a80001-0000-4000-8000-000000000001",
    site_description: "Community waste collection hub & sorting station, Ward 12, Ranchi",
  },
];

const DEMO_EVIDENCE_PLANS: Record<string, {
  objective: string;
  baseline: string;
  denominator: string;
  method: string;
  window: string;
}> = {
  "b0a80002-0000-4000-8000-000000000006": {
    objective: "Solar thermal cooling units evaluation for reducing overnight vegetable spoilage among peri-urban vendors.",
    baseline: "41% of surveyed households",
    denominator: "240 households",
    method: "Daily physical audit logs and temperature sensor telemetry",
    window: "60-day observation window (Aug-Sep 2026)",
  },
  "b0a80001-0000-4000-8000-000000000006": {
    objective: "Bio-digestion sensor and automated waste sorting efficiency evaluation.",
    baseline: "35% organic waste segregated at source",
    denominator: "500 urban households in Ward 12",
    method: "Digital weight telemetry & weekly microbial decomposition samples",
    window: "60-day observation window",
  },
};

export default function PilotExecutionPage() {
  const { user } = useAuth();
  const [selectedPilotId, setSelectedPilotId] = useState<string>("b0a80002-0000-4000-8000-000000000006");
  const [pilot, setPilot] = useState<PilotResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // Operational State Form State
  const [opStatus, setOpStatus] = useState<OperationalStatus>("COMPLETED");
  const [opRationale, setOpRationale] = useState<string>(
    "Field pilot testing period completed after 60-day observation window."
  );
  const [opHistory, setOpHistory] = useState<PilotOperationalStateResponse[]>([
    {
      id: "op-v1",
      pilot_id: "b0a80002-0000-4000-8000-000000000006",
      status: "PLANNED",
      version: 1,
      rationale: "Field pilot initialized following human PILOT_READY authorization.",
      recorded_by_actor_id: "demo-reviewer",
      recorded_at: "2026-07-15T09:00:00.000Z",
    },
    {
      id: "op-v2",
      pilot_id: "b0a80002-0000-4000-8000-000000000006",
      status: "ACTIVE",
      version: 2,
      rationale: "4 solar thermal units deployed and actively monitored across market vendors.",
      recorded_by_actor_id: "demo-reviewer",
      recorded_at: "2026-08-15T09:00:00.000Z",
    },
    {
      id: "op-v3",
      pilot_id: "b0a80002-0000-4000-8000-000000000006",
      status: "COMPLETED",
      version: 3,
      rationale: "Field pilot testing period completed after 60-day observation window.",
      recorded_by_actor_id: "demo-reviewer",
      recorded_at: "2026-09-14T09:00:00.000Z",
    },
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadPilotData = useCallback(async (pId: string) => {
    setLoading(true);
    try {
      const res = await fetchPilotDetail(pId).catch(() => ({ data: null }));
      if (res.data) {
        setPilot(res.data);
      } else {
        const fallbackObj = DEMO_PILOTS.find((p) => p.id === pId);
        if (fallbackObj) {
          setPilot({
            id: fallbackObj.id,
            challenge_id: fallbackObj.challenge_id,
            authorized_by_readiness_decision_id: "dec-auth-1",
            host_organization_id: "c0a80000-0000-4000-8000-000000000001",
            name: fallbackObj.name,
            site_description: fallbackObj.site_description,
            planned_start: "2026-08-01T00:00:00Z",
            planned_end: "2026-09-30T00:00:00Z",
            created_by_actor_id: "demo-reviewer",
            created_at: new Date().toISOString(),
          });
        }
      }
    } catch (err) {
      console.error("Failed to load pilot detail:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPilotData(selectedPilotId);
  }, [selectedPilotId, loadPilotData]);

  const handlePilotChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newId = e.target.value;
    setSelectedPilotId(newId);
    setSuccessMessage(null);
    void loadPilotData(newId);
  };

  const handleUpdateOperationalState = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPilotId || !opRationale.trim()) return;

    setSubmitting(true);
    setSuccessMessage(null);

    try {
      const res = await createPilotOperationalState(selectedPilotId, {
        status: opStatus,
        rationale: opRationale,
        recorded_by_actor_id: user?.id || "demo-reviewer",
        expected_version: opHistory.length,
      });

      const newVer = res.data?.version || (opHistory.length + 1);
      setSuccessMessage(
        `✓ Operational state updated! State advanced to ${opStatus} v${newVer}.`
      );
      if (res.data) {
        setOpHistory((prev) => [res.data, ...prev]);
      }
    } catch (err: unknown) {
      // Offline / Demo fallback
      const newVer = opHistory.length + 1;
      const newOpState: PilotOperationalStateResponse = {
        id: `op-demo-${Date.now()}`,
        pilot_id: selectedPilotId,
        status: opStatus,
        version: newVer,
        rationale: opRationale,
        recorded_by_actor_id: user?.id || "demo-reviewer",
        recorded_at: new Date().toISOString(),
      };
      setOpHistory((prev) => [newOpState, ...prev]);
      setSuccessMessage(
        `✓ Operational state updated! State advanced to ${opStatus} v${newVer}.`
      );
    } finally {
      setSubmitting(false);
    }
  };

  const currentPilotInfo = pilot || {
    id: selectedPilotId,
    name: "Hazaribagh Vendor Cold Chain Field Pilot",
    site_description: "Peri-urban daily vegetable market, Ward 4, Hazaribagh",
    planned_start: "2026-08-01T00:00:00Z",
    planned_end: "2026-09-30T00:00:00Z",
  };

  const latestOpState = opHistory[0]?.status || "COMPLETED";
  const evidencePlan = DEMO_EVIDENCE_PLANS[selectedPilotId] || DEMO_EVIDENCE_PLANS["b0a80002-0000-4000-8000-000000000006"];

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto space-y-6 py-4">
        {/* Top Header */}
        <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">
              <span>Field Operations</span>
              <span>•</span>
              <span>Stage 4 Execution</span>
            </div>
            <h1 className="text-2xl font-bold text-stone-900 tracking-tight">Pilot Execution Workspace</h1>
            <p className="text-sm text-stone-600 mt-1">
              Manage operational state transitions (PLANNED → ACTIVE → COMPLETED) and inspect evidence plans.
            </p>
          </div>
          <Link
            href="/app/outcomes"
            className="px-4 py-2 bg-amber-600 text-white rounded-lg text-xs font-bold hover:bg-amber-700 transition-colors text-center shrink-0 shadow"
          >
            Outcome Assessment →
          </Link>
        </div>

        {/* Pilot Selection Bar */}
        <div className="bg-stone-900 text-white p-4 rounded-xl border border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Select Active Pilot:</span>
            <select
              value={selectedPilotId}
              onChange={handlePilotChange}
              className="bg-stone-800 border border-stone-700 rounded-lg px-3 py-1.5 text-xs font-bold text-white max-w-md focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              {DEMO_PILOTS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.id})
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center space-x-2 text-xs text-stone-400 font-mono">
            <span>Status:</span>
            <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 px-2.5 py-0.5 rounded font-bold uppercase">
              {latestOpState}
            </span>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-stone-500 text-sm font-medium">Loading pilot workspace...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Evidence Plan Details */}
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm space-y-4">
                <div className="border-b border-stone-100 pb-3 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-stone-900">Inspect Evidence Plan</h3>
                    <span className="text-[11px] text-stone-500 font-mono">Evaluation & Metric Definition</span>
                  </div>
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-mono font-bold rounded">
                    PLAN v1
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-stone-500 font-bold uppercase text-[10px]">Objective:</span>
                    <p className="text-stone-900 font-medium mt-0.5 bg-stone-50 p-2.5 rounded border border-stone-200">
                      {evidencePlan.objective}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-amber-50/70 p-2.5 rounded border border-amber-200/60">
                      <span className="text-amber-900 font-bold uppercase text-[10px]">Baseline:</span>
                      <p className="text-amber-950 font-bold text-xs mt-0.5">{evidencePlan.baseline}</p>
                    </div>

                    <div className="bg-amber-50/70 p-2.5 rounded border border-amber-200/60">
                      <span className="text-amber-900 font-bold uppercase text-[10px]">Denominator:</span>
                      <p className="text-amber-950 font-bold text-xs mt-0.5">{evidencePlan.denominator}</p>
                    </div>
                  </div>

                  <div>
                    <span className="text-stone-500 font-bold uppercase text-[10px]">Data Collection Method:</span>
                    <p className="text-stone-700 text-[11px] mt-0.5">{evidencePlan.method}</p>
                  </div>

                  <div>
                    <span className="text-stone-500 font-bold uppercase text-[10px]">Evaluation Window:</span>
                    <p className="text-stone-700 text-[11px] mt-0.5 font-mono">{evidencePlan.window}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Middle & Right Column: Operational State Lifecycle Form & History */}
            <div className="lg:col-span-2 space-y-6">
              {/* Operational State Form */}
              <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                  <div>
                    <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Operational Transition</span>
                    <h2 className="text-lg font-bold text-stone-900 mt-0.5">Update Operational State</h2>
                  </div>
                  <span className="px-3 py-1 bg-stone-900 text-amber-400 font-mono font-bold text-xs rounded-lg">
                    Current: {latestOpState}
                  </span>
                </div>

                {successMessage && (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium space-y-1">
                    <div className="font-bold text-sm">{successMessage}</div>
                    <div className="text-[11px] text-emerald-700 font-mono">
                      State lifecycle event recorded. Note: Pilot completion is separate from factual outcome evaluation.
                    </div>
                  </div>
                )}

                <form onSubmit={handleUpdateOperationalState} className="space-y-4 text-sm">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Select State</label>
                    <select
                      value={opStatus}
                      onChange={(e) => setOpStatus(e.target.value as OperationalStatus)}
                      className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2.5 text-stone-900 font-bold text-xs"
                    >
                      <option value="PLANNED">PLANNED (Site Prep & Deployment Hardware Staging)</option>
                      <option value="ACTIVE">ACTIVE (Live Field Monitoring & Telemetry Ingestion)</option>
                      <option value="COMPLETED">COMPLETED (Field Pilot Testing Window Ended)</option>
                      <option value="SUSPENDED">SUSPENDED (Temporary Operational Pause)</option>
                      <option value="TERMINATED">TERMINATED (Early Cancellation)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Rationale</label>
                    <textarea
                      rows={4}
                      value={opRationale}
                      onChange={(e) => setOpRationale(e.target.value)}
                      placeholder="Field pilot testing period completed after 60-day observation window."
                      className="w-full bg-stone-50 border border-stone-300 rounded-lg p-3 text-stone-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                      required
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="text-[11px] text-stone-500 font-mono">
                      Site: <span className="font-bold text-stone-800">{currentPilotInfo.site_description}</span>
                    </div>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs shadow transition-colors flex items-center space-x-2 disabled:opacity-50"
                    >
                      <span>{submitting ? "Updating..." : "Update Operational State →"}</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Operational History Log */}
              <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                  <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                    Operational State History ({opHistory.length})
                  </h3>
                  <span className="text-xs text-stone-500 font-mono">State Lifecycle Transition Chain</span>
                </div>

                <div className="space-y-3">
                  {opHistory.map((item) => (
                    <div key={item.id} className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-0.5 bg-stone-900 text-amber-300 font-mono font-bold text-[10px] rounded">
                            v{item.version}
                          </span>
                          <span className="font-bold text-stone-900 text-xs">Status: {item.status}</span>
                        </div>
                        <span className="text-[10px] font-mono text-stone-500">
                          {new Date(item.recorded_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-stone-700 bg-white p-2.5 rounded border border-stone-200">
                        {item.rationale}
                      </p>
                      <div className="flex items-center justify-between text-[10px] font-mono text-stone-500 pt-1">
                        <span>Recorded by: {item.recorded_by_actor_id || "State Nodal Reviewer"}</span>
                        <span className="text-emerald-700 font-bold">✓ State Logged</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

