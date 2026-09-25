"use client";

import React, { useEffect, useState } from "react";
import { HowNIRNAYUsesAI } from "@/components/HowNIRNAYUsesAI";
import { runAIEvaluation } from "@/lib/api";
import {
  Sparkles,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Filter,
  Eye,
  ShieldCheck,
  X,
} from "lucide-react";

export default function AIEvaluationWorkspacePage() {
  const [aiEnabled, setAiEnabled] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);
  const [evaluationData, setEvaluationData] = useState<any>(null);
  const [selectedCase, setSelectedCase] = useState<any>(null);
  const [filterRoute, setFilterRoute] = useState<string>("ALL");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadData = async (aiState: boolean) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await runAIEvaluation(aiState);
      setEvaluationData(res);
    } catch (err: any) {
      console.error("Failed to run AI evaluation:", err);
      setErrorMsg(err.message || "Failed to load evaluation dataset.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(aiEnabled);
  }, [aiEnabled]);

  const metrics = evaluationData?.metrics;
  const cases = evaluationData?.cases || [];

  const filteredCases = cases.filter((c: any) => {
    if (filterRoute === "ALL") return true;
    return c.human_reference_route === filterRoute || c.reviewer_a_route === filterRoute;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* CONTROLLED SYNTHETIC EVALUATION BANNER */}
      <div className="bg-amber-500 text-stone-950 p-3 rounded-lg flex items-center justify-between shadow">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>CONTROLLED SYNTHETIC EVALUATION WORKSPACE — NOT PRODUCTION BENCHMARK</span>
        </div>
        <span className="text-[11px] font-mono bg-stone-900 text-amber-300 px-2.5 py-0.5 rounded font-bold">
          30 Controlled Test Cases
        </span>
      </div>

      {/* Header & Mode Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-stone-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-stone-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-600" />
            <span>AI Clarity & Practical Evaluation</span>
          </h1>
          <p className="text-xs text-stone-600 mt-1">
            Factual evaluation suite comparing dual human reviewers (Reviewer A & B), AI advisory output, and Adjudicated Reference routes.
          </p>
        </div>

        {/* AI Provider Toggle */}
        <div className="flex items-center gap-2 bg-stone-100 p-1.5 rounded-lg border border-stone-200">
          <button
            type="button"
            onClick={() => setAiEnabled(true)}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
              aiEnabled
                ? "bg-amber-600 text-white shadow"
                : "text-stone-700 hover:text-stone-900"
            }`}
          >
            AI ENABLED
          </button>
          <button
            type="button"
            onClick={() => setAiEnabled(false)}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
              !aiEnabled
                ? "bg-stone-800 text-white shadow"
                : "text-stone-700 hover:text-stone-900"
            }`}
          >
            AI OFF (Manual Baseline)
          </button>
        </div>
      </div>

      {/* Canonical AI Capability Model Explanation */}
      <HowNIRNAYUsesAI />

      {/* Evaluation Metrics Cards */}
      {loading ? (
        <div className="p-8 bg-white rounded-xl border border-stone-200 text-center space-y-2">
          <div className="animate-spin w-6 h-6 border-2 border-amber-600 border-t-transparent rounded-full mx-auto" />
          <p className="text-xs text-stone-600 font-medium">Running evaluation suite across 30 synthetic cases...</p>
        </div>
      ) : errorMsg ? (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs">
          {errorMsg}
        </div>
      ) : metrics ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wide">
              Factual Evaluation Metrics (Numerators / Denominators)
            </h2>
            <button
              type="button"
              onClick={() => loadData(aiEnabled)}
              className="text-xs text-amber-800 hover:underline flex items-center gap-1 font-semibold"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Re-run Suite
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {/* Dual-Reviewer Fixture Agreement */}
            <div className="p-3 bg-white rounded-lg border border-stone-200 shadow-sm space-y-1">
              <span className="text-[10px] font-bold text-stone-500 uppercase block">Dual-Reviewer Fixture Match</span>
              <div className="text-lg font-extrabold text-stone-900">
                {metrics.human_human_agreement.percentage}%
              </div>
              <span className="text-[10px] font-mono text-stone-600 block">
                {metrics.human_human_agreement.numerator} / {metrics.human_human_agreement.denominator} cases
              </span>
            </div>

            {/* AI-Fixture Agreement */}
            <div className="p-3 bg-amber-50/60 rounded-lg border border-amber-200 shadow-sm space-y-1">
              <span className="text-[10px] font-bold text-amber-900 uppercase block">AI-Fixture Match</span>
              <div className="text-lg font-extrabold text-amber-900">
                {aiEnabled ? `${metrics.ai_human_agreement.percentage}%` : "N/A (AI OFF)"}
              </div>
              <span className="text-[10px] font-mono text-stone-600 block">
                {aiEnabled ? `${metrics.ai_human_agreement.numerator} / ${metrics.ai_human_agreement.denominator} cases` : "0 / 30 cases"}
              </span>
            </div>

            {/* AI-Reference Match */}
            <div className="p-3 bg-emerald-50/60 rounded-lg border border-emerald-200 shadow-sm space-y-1">
              <span className="text-[10px] font-bold text-emerald-900 uppercase block">AI-Reference Scenario Match</span>
              <div className="text-lg font-extrabold text-emerald-900">
                {aiEnabled ? `${metrics.ai_adjudicated_reference_agreement.percentage}%` : "N/A (AI OFF)"}
              </div>
              <span className="text-[10px] font-mono text-stone-600 block">
                {aiEnabled ? `${metrics.ai_adjudicated_reference_agreement.numerator} / ${metrics.ai_adjudicated_reference_agreement.denominator} cases` : "0 / 30 cases"}
              </span>
            </div>

            {/* Escalation Rate */}
            <div className="p-3 bg-white rounded-lg border border-stone-200 shadow-sm space-y-1">
              <span className="text-[10px] font-bold text-stone-500 uppercase block">Escalation / Dual Review</span>
              <div className="text-lg font-extrabold text-stone-900">
                {metrics.escalation_rate.percentage}%
              </div>
              <span className="text-[10px] font-mono text-stone-600 block">
                {metrics.escalation_rate.numerator} / {metrics.escalation_rate.denominator} cases
              </span>
            </div>

            {/* AI Override Rate */}
            <div className="p-3 bg-white rounded-lg border border-stone-200 shadow-sm space-y-1">
              <span className="text-[10px] font-bold text-stone-500 uppercase block">AI Override Rate</span>
              <div className="text-lg font-extrabold text-stone-900">
                {aiEnabled ? `${metrics.ai_override_rate.percentage}%` : "0.0%"}
              </div>
              <span className="text-[10px] font-mono text-stone-600 block">
                {metrics.ai_override_rate.numerator} / {metrics.ai_override_rate.denominator} cases
              </span>
            </div>

            {/* Measured Timing */}
            <div className="p-3 bg-stone-900 text-white rounded-lg border border-stone-800 shadow-sm space-y-1">
              <span className="text-[10px] font-bold text-stone-400 uppercase block flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-400" /> Usability Timing
              </span>
              <div className="text-xs font-bold text-amber-300">
                Pending Field Trial
              </div>
              <span className="text-[9px] text-stone-400 block font-mono">
                Instrumentation Active
              </span>
            </div>
          </div>

          {/* Workflow Completion & Safety Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-stone-50 p-3.5 rounded-lg border border-stone-200 text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <span className="font-bold text-stone-900 block">Manual Baseline Completion</span>
                <span className="text-[11px] text-stone-600">
                  {metrics.manual_workflow_completion_rate.percentage}% ({metrics.manual_workflow_completion_rate.numerator}/{metrics.manual_workflow_completion_rate.denominator})
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <span className="font-bold text-stone-900 block">AI-Off Workflow Pass</span>
                <span className="text-[11px] text-stone-600">
                  {metrics.ai_off_workflow_completion_rate.percentage}% ({metrics.ai_off_workflow_completion_rate.numerator}/{metrics.ai_off_workflow_completion_rate.denominator})
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <span className="font-bold text-stone-900 block">Schema Rejection Rate</span>
                <span className="text-[11px] text-stone-600">
                  {metrics.schema_rejection_rate.percentage}% ({metrics.schema_rejection_rate.numerator}/{metrics.schema_rejection_rate.denominator})
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <span className="font-bold text-stone-900 block">Unknown Candidate Rejection</span>
                <span className="text-[11px] text-stone-600">
                  {metrics.unknown_candidate_rejection_rate.percentage}% ({metrics.unknown_candidate_rejection_rate.numerator}/{metrics.unknown_candidate_rejection_rate.denominator})
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Dataset & Case Agreement Matrix Table */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden space-y-4 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-200">
          <div>
            <h3 className="text-base font-bold text-stone-900">Synthetic Case Dataset & Agreement Matrix</h3>
            <p className="text-xs text-stone-500">Inspect case details, reviewer routes, AI suggestions, and reference routes.</p>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-stone-500" />
            <select
              value={filterRoute}
              onChange={(e) => setFilterRoute(e.target.value)}
              className="text-xs border border-stone-300 rounded-md p-1.5 bg-white text-stone-800 font-medium"
            >
              <option value="ALL">All Routes ({cases.length})</option>
              <option value="SERVICE">SERVICE</option>
              <option value="CLARIFY">CLARIFY</option>
              <option value="RESEARCH_REVIEW">RESEARCH_REVIEW</option>
              <option value="INNOVATION_CHALLENGE">INNOVATION_CHALLENGE</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-700">
            <thead className="bg-stone-100 text-stone-700 uppercase font-semibold text-[10px] tracking-wider border-b border-stone-200">
              <tr>
                <th className="py-2.5 px-3">Case ID</th>
                <th className="py-2.5 px-3">Title & Domain</th>
                <th className="py-2.5 px-3">Reviewer A</th>
                <th className="py-2.5 px-3">Reviewer B</th>
                <th className="py-2.5 px-3">AI Advisory</th>
                <th className="py-2.5 px-3">Reference Route</th>
                <th className="py-2.5 px-3">Agreement Matrix</th>
                <th className="py-2.5 px-3 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {filteredCases.map((c: any) => (
                <tr key={c.case_id} className="hover:bg-stone-50/80 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-bold text-stone-900">{c.case_id}</td>
                  <td className="py-2.5 px-3">
                    <span className="font-semibold text-stone-900 block truncate max-w-xs">{c.title}</span>
                    <span className="text-[10px] text-stone-500">{c.district} • {c.domain}</span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 bg-stone-100 border border-stone-300 rounded font-mono font-semibold text-[10px]">
                      {c.reviewer_a_route}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 bg-stone-100 border border-stone-300 rounded font-mono font-semibold text-[10px]">
                      {c.reviewer_b_route}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    {c.ai_suggested_route ? (
                      <span className="px-2 py-0.5 bg-amber-50 border border-amber-300 text-amber-900 rounded font-mono font-semibold text-[10px]">
                        {c.ai_suggested_route}
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-stone-400">AI OFF</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded font-mono font-bold text-[10px]">
                      {c.human_reference_route}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-1.5 text-[10px]">
                      <span
                        className={`px-1.5 py-0.5 rounded font-bold ${
                          c.matrix.reviewer_a_vs_b === "AGREE"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        A↔B: {c.matrix.reviewer_a_vs_b}
                      </span>
                      {c.ai_suggested_route && (
                        <span
                          className={`px-1.5 py-0.5 rounded font-bold ${
                            c.matrix.ai_vs_reference === "AGREE"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-900"
                          }`}
                        >
                          AI↔Ref: {c.matrix.ai_vs_reference}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedCase(c)}
                      className="px-2.5 py-1 text-stone-700 bg-stone-100 hover:bg-stone-200 rounded text-[11px] font-semibold flex items-center gap-1 ml-auto"
                    >
                      <Eye className="w-3 h-3" /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Case Detail Modal */}
      {selectedCase && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4 shadow-2xl border border-stone-300">
            <div className="flex items-start justify-between border-b border-stone-200 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-amber-700 uppercase bg-amber-100 px-2 py-0.5 rounded">
                  {selectedCase.case_id} — Synthetic Evaluation Case
                </span>
                <h3 className="text-base font-bold text-stone-900 mt-1">{selectedCase.title}</h3>
                <p className="text-xs text-stone-500">{selectedCase.district} • {selectedCase.domain}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCase(null)}
                className="text-stone-400 hover:text-stone-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-stone-700">
              <div className="bg-stone-50 p-3 rounded-lg border border-stone-200 space-y-1">
                <span className="font-bold text-stone-900 block">Adjudicated Reference Route:</span>
                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded font-mono font-bold text-xs inline-block">
                  {selectedCase.human_reference_route}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="p-2.5 bg-stone-100 rounded border border-stone-200 text-center">
                  <span className="text-[10px] font-bold text-stone-500 block uppercase">Reviewer A</span>
                  <span className="font-mono font-bold text-stone-900">{selectedCase.reviewer_a_route}</span>
                </div>
                <div className="p-2.5 bg-stone-100 rounded border border-stone-200 text-center">
                  <span className="text-[10px] font-bold text-stone-500 block uppercase">Reviewer B</span>
                  <span className="font-mono font-bold text-stone-900">{selectedCase.reviewer_b_route}</span>
                </div>
                <div className="p-2.5 bg-amber-50 rounded border border-amber-200 text-center">
                  <span className="text-[10px] font-bold text-amber-900 block uppercase">AI Advisory</span>
                  <span className="font-mono font-bold text-amber-900">
                    {selectedCase.ai_suggested_route || "AI OFF"}
                  </span>
                </div>
              </div>

              <div className="bg-stone-50 p-3 rounded-lg border border-stone-200 space-y-2">
                <span className="font-bold text-stone-900 block">4-Way Agreement Matrix:</span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 bg-white rounded border border-stone-200">
                    Reviewer A ↔ B: <span className="font-bold text-stone-900">{selectedCase.matrix.reviewer_a_vs_b}</span>
                  </div>
                  <div className="p-2 bg-white rounded border border-stone-200">
                    AI ↔ Reviewer A: <span className="font-bold text-stone-900">{selectedCase.matrix.ai_vs_reviewer_a}</span>
                  </div>
                  <div className="p-2 bg-white rounded border border-stone-200">
                    AI ↔ Reviewer B: <span className="font-bold text-stone-900">{selectedCase.matrix.ai_vs_reviewer_b}</span>
                  </div>
                  <div className="p-2 bg-white rounded border border-stone-200">
                    AI ↔ Adjudicated Ref: <span className="font-bold text-emerald-900">{selectedCase.matrix.ai_vs_reference}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-stone-200 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedCase(null)}
                className="px-4 py-1.5 bg-stone-800 hover:bg-stone-900 text-white rounded-md text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
