"use client";
import React, { useEffect, useState, useCallback } from "react";
import { CheckCircle2, AlertTriangle, RefreshCw, Server, ShieldCheck, FileCheck, Layers } from "lucide-react";
import { API_BASE_URL, ENABLE_DEMO_FALLBACK, DEMO_REVIEWER_ACTOR_ID, fetchChallengeDetail, fetchPilotDetail } from "@/lib/api";

export function SystemCheck() {
  const [loading, setLoading] = useState(true);
  const [checks, setChecks] = useState<{
    backendOk: boolean;
    reviewerOk: boolean;
    scenarioAOk: boolean;
    scenarioBOk: boolean;
    errorMsg?: string;
  }>({
    backendOk: false,
    reviewerOk: false,
    scenarioAOk: false,
    scenarioBOk: false,
  });

  const runCheck = useCallback(async () => {
    let backendOk = false;
    const reviewerOk = Boolean(DEMO_REVIEWER_ACTOR_ID);
    let scenarioAOk = false;
    let scenarioBOk = false;
    let errorMsg: string | undefined = undefined;

    try {
      // Check backend ping or API
      const res = await fetch(`${API_BASE_URL}/api/v1/challenges`, { cache: "no-store" }).catch(() => null);
      if (res && res.ok) {
        backendOk = true;
      }

      // Check Scenario A Challenge
      const chaA = await fetchChallengeDetail("c0a80001-0000-4000-8000-000000000001").catch(() => null);
      if (chaA && chaA.data) {
        scenarioAOk = true;
      }

      // Check Scenario B Pilot
      const pilotB = await fetchPilotDetail("b0a80002-0000-4000-8000-000000000006").catch(() => null);
      if (pilotB && pilotB.data) {
        scenarioBOk = true;
      }
    } catch (err) {
      errorMsg = err instanceof Error ? err.message : String(err);
    } finally {
      setChecks({
        backendOk,
        reviewerOk,
        scenarioAOk,
        scenarioBOk,
        errorMsg,
      });
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    runCheck();
  }, [runCheck]);

  const allSystemReady = checks.backendOk && checks.reviewerOk && checks.scenarioAOk && checks.scenarioBOk;

  return (
    <div className="bg-white rounded-xl border border-[#E7E5E4] p-5 shadow-sm my-6">
      <div className="flex items-center justify-between border-b border-[#F5F5F4] pb-4 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#1C1917] font-mono">
            DEMO SYSTEM READINESS CHECK
          </h3>
        </div>
        <div className="flex items-center gap-3">
          {loading ? (
            <span className="text-xs text-stone-500 flex items-center gap-1.5 font-mono">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Verifying...
            </span>
          ) : allSystemReady ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-mono font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> SYSTEM READY FOR JURY
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-mono font-medium">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> SEED OR CONFIG CHECK REQUIRED
            </span>
          )}
          <button
            onClick={() => { setLoading(true); runCheck(); }}
            className="text-xs text-stone-600 hover:text-stone-900 border border-stone-200 rounded px-2 py-1 font-mono hover:bg-stone-50 transition-colors"
          >
            Re-verify
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
        <div className="p-3 rounded-lg border border-[#F5F5F4] bg-[#FAF9F6]">
          <div className="text-stone-500 mb-1 flex items-center gap-1.5">
            <Server className="w-3.5 h-3.5" /> Backend API
          </div>
          <div className="font-medium text-[#1C1917]">
            {checks.backendOk ? (
              <span className="text-emerald-700 font-semibold">Connected (Live)</span>
            ) : ENABLE_DEMO_FALLBACK ? (
              <span className="text-amber-700 font-semibold">Demo Fallback ON</span>
            ) : (
              <span className="text-rose-700 font-semibold">Offline / Failed</span>
            )}
          </div>
        </div>

        <div className="p-3 rounded-lg border border-[#F5F5F4] bg-[#FAF9F6]">
          <div className="text-stone-500 mb-1 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" /> Reviewer Actor
          </div>
          <div className="font-medium text-[#1C1917] truncate">
            {checks.reviewerOk ? (
              <span className="text-emerald-700 font-semibold">Configured</span>
            ) : (
              <span className="text-rose-700 font-semibold">Unset</span>
            )}
          </div>
        </div>

        <div className="p-3 rounded-lg border border-[#F5F5F4] bg-[#FAF9F6]">
          <div className="text-stone-500 mb-1 flex items-center gap-1.5">
            <FileCheck className="w-3.5 h-3.5" /> Scenario A Data
          </div>
          <div className="font-medium text-[#1C1917]">
            {checks.scenarioAOk ? (
              <span className="text-emerald-700 font-semibold">Ready (PILOT_READY)</span>
            ) : (
              <span className="text-amber-700 font-semibold">Run Seed Script</span>
            )}
          </div>
        </div>

        <div className="p-3 rounded-lg border border-[#F5F5F4] bg-[#FAF9F6]">
          <div className="text-stone-500 mb-1 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5" /> Scenario B Data
          </div>
          <div className="font-medium text-[#1C1917]">
            {checks.scenarioBOk ? (
              <span className="text-emerald-700 font-semibold">Ready (ACTIVE)</span>
            ) : (
              <span className="text-amber-700 font-semibold">Run Seed Script</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
