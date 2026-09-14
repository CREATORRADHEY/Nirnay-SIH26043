"use client";

import React, { useState } from "react";
import {
  fetchQualificationSuggestion,
  fetchDuplicateSuggestions,
  fetchHEICandidateSuggestions,
  fetchEvidenceSummary,
} from "@/lib/api/ai";
import {
  QualificationSuggestionResponse,
  DuplicateSuggestionResponse,
  HEICandidateSuggestionResponse,
  EvidenceSummaryResponse,
} from "@/lib/types/ai";

interface GovernmentAIPanelProps {
  challengeId: string;
  onApplyRoute?: (route: string, reasoning: string) => void;
  onApplyHEI?: (heiOrgId: string, rationale: string) => void;
}

export function GovernmentAIPanel({
  challengeId,
  onApplyRoute,
  onApplyHEI,
}: GovernmentAIPanelProps) {
  const [activeTab, setActiveTab] = useState<"summary" | "qualification" | "duplicates" | "hei" | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [evidenceSummary, setEvidenceSummary] = useState<EvidenceSummaryResponse | null>(null);
  const [qualificationSuggestion, setQualificationSuggestion] = useState<QualificationSuggestionResponse | null>(null);
  const [duplicateSuggestions, setDuplicateSuggestions] = useState<DuplicateSuggestionResponse | null>(null);
  const [heiSuggestions, setHeiSuggestions] = useState<HEICandidateSuggestionResponse | null>(null);

  const handleFetchSummary = async () => {
    setActiveTab("summary");
    setLoading(true);
    setError(null);
    try {
      const res = await fetchEvidenceSummary(challengeId);
      setEvidenceSummary(res.data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "AI assistance unavailable";
      setError(msg || "AI assistance is temporarily unavailable. You can continue manually.");
    } finally {
      setLoading(false);
    }
  };

  const handleFetchQualification = async () => {
    setActiveTab("qualification");
    setLoading(true);
    setError(null);
    try {
      const res = await fetchQualificationSuggestion(challengeId);
      setQualificationSuggestion(res.data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "AI assistance unavailable";
      setError(msg || "AI assistance is temporarily unavailable. You can continue manually.");
    } finally {
      setLoading(false);
    }
  };

  const handleFetchDuplicates = async () => {
    setActiveTab("duplicates");
    setLoading(true);
    setError(null);
    try {
      const res = await fetchDuplicateSuggestions(challengeId);
      setDuplicateSuggestions(res.data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "AI assistance unavailable";
      setError(msg || "AI assistance is temporarily unavailable. You can continue manually.");
    } finally {
      setLoading(false);
    }
  };

  const handleFetchHEI = async () => {
    setActiveTab("hei");
    setLoading(true);
    setError(null);
    try {
      const res = await fetchHEICandidateSuggestions(challengeId);
      setHeiSuggestions(res.data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "AI assistance unavailable";
      setError(msg || "AI assistance is temporarily unavailable. You can continue manually.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-stone-900 text-stone-100 rounded-xl border border-stone-800 p-5 shadow-lg space-y-4">
      <div className="flex items-center justify-between border-b border-stone-800 pb-3">
        <div className="flex items-center space-x-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
          <h3 className="text-sm font-bold tracking-wider uppercase text-amber-400">
            AI Review Assistance (Advisory Only)
          </h3>
        </div>
        <span className="text-[10px] font-mono bg-stone-800 px-2 py-0.5 rounded text-stone-400 border border-stone-700">
          Non-Authoritative
        </span>
      </div>

      <div className="text-xs text-stone-400 leading-relaxed">
        AI tools analyze evidence metadata and challenge descriptions. All qualification, matching, and readiness decisions remain strict human reviewer authority.
      </div>

      {/* Action Buttons Toolbar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
        <button
          type="button"
          onClick={handleFetchSummary}
          className={`px-3 py-2 rounded-lg text-xs font-bold border transition-colors ${
            activeTab === "summary"
              ? "bg-amber-600 border-amber-500 text-white"
              : "bg-stone-800 border-stone-700 text-stone-300 hover:bg-stone-700"
          }`}
        >
          Summarize Evidence
        </button>

        <button
          type="button"
          onClick={handleFetchQualification}
          className={`px-3 py-2 rounded-lg text-xs font-bold border transition-colors ${
            activeTab === "qualification"
              ? "bg-amber-600 border-amber-500 text-white"
              : "bg-stone-800 border-stone-700 text-stone-300 hover:bg-stone-700"
          }`}
        >
          Suggest Route
        </button>

        <button
          type="button"
          onClick={handleFetchDuplicates}
          className={`px-3 py-2 rounded-lg text-xs font-bold border transition-colors ${
            activeTab === "duplicates"
              ? "bg-amber-600 border-amber-500 text-white"
              : "bg-stone-800 border-stone-700 text-stone-300 hover:bg-stone-700"
          }`}
        >
          Find Duplicates
        </button>

        <button
          type="button"
          onClick={handleFetchHEI}
          className={`px-3 py-2 rounded-lg text-xs font-bold border transition-colors ${
            activeTab === "hei"
              ? "bg-amber-600 border-amber-500 text-white"
              : "bg-stone-800 border-stone-700 text-stone-300 hover:bg-stone-700"
          }`}
        >
          Suggest HEIs
        </button>
      </div>

      {/* Result Container */}
      {loading && (
        <div className="py-6 text-center text-xs text-amber-400 font-mono space-x-2 flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
          <span>Processing AI advisory analysis...</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-950/80 border border-red-800 text-red-300 rounded-lg text-xs font-mono">
          ⚠️ {error}
        </div>
      )}

      {!loading && !error && activeTab === "summary" && evidenceSummary && (
        <div className="bg-stone-950 p-4 rounded-lg border border-stone-800 text-xs space-y-3">
          <div className="font-bold text-amber-400 uppercase tracking-wider text-[11px]">
            Evidence Summary & Completeness
          </div>
          <p className="text-stone-300 leading-relaxed">{evidenceSummary.summary}</p>
          {evidenceSummary.missing_evidence?.length > 0 && (
            <div>
              <span className="font-bold text-stone-400 block mb-1 uppercase text-[10px]">
                Missing Evidence Artifacts:
              </span>
              <ul className="list-disc list-inside text-stone-400 space-y-0.5">
                {evidenceSummary.missing_evidence.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          )}
          {evidenceSummary.uncertainties?.length > 0 && (
            <div className="text-[11px] text-amber-300/80 italic">
              Uncertainties: {evidenceSummary.uncertainties.join(", ")}
            </div>
          )}
        </div>
      )}

      {!loading && !error && activeTab === "qualification" && qualificationSuggestion && (
        <div className="bg-stone-950 p-4 rounded-lg border border-stone-800 text-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-amber-400 uppercase tracking-wider text-[11px]">
              AI Route Suggestion
            </span>
            <span className="px-2.5 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded font-mono font-bold text-[11px]">
              {qualificationSuggestion.suggested_route}
            </span>
          </div>

          <p className="text-stone-300 leading-relaxed">
            {qualificationSuggestion.reasoning_summary}
          </p>

          <div className="text-[10px] text-stone-400 border-t border-stone-800 pt-2 space-y-1">
            <div>
              <span className="font-bold text-stone-300">Evidence Considered:</span>{" "}
              {qualificationSuggestion.evidence_considered?.join(", ")}
            </div>
            <div className="italic text-amber-400/80">
              {qualificationSuggestion.limitations}
            </div>
          </div>

          {onApplyRoute && (
            <button
              type="button"
              onClick={() =>
                onApplyRoute(
                  qualificationSuggestion.suggested_route,
                  qualificationSuggestion.reasoning_summary
                )
              }
              className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded transition-colors"
            >
              Copy Route & Rationale to Decision Form →
            </button>
          )}
        </div>
      )}

      {!loading && !error && activeTab === "duplicates" && duplicateSuggestions && (
        <div className="bg-stone-950 p-4 rounded-lg border border-stone-800 text-xs space-y-3">
          <div className="font-bold text-amber-400 uppercase tracking-wider text-[11px]">
            Duplicate Assistance Analysis
          </div>
          <p className="text-stone-300">{duplicateSuggestions.reasoning_summary}</p>
          {duplicateSuggestions.duplicate_candidates?.length === 0 ? (
            <div className="text-stone-500 italic text-[11px]">
              No potential duplicate challenges identified.
            </div>
          ) : (
            <div className="space-y-2">
              {duplicateSuggestions.duplicate_candidates.map((cand) => (
                <div key={cand.challenge_id} className="p-2.5 bg-stone-900 rounded border border-stone-800 space-y-1">
                  <div className="font-bold text-stone-200">{cand.title}</div>
                  <div className="text-stone-400 text-[11px]">{cand.explanation}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {!loading && !error && activeTab === "hei" && heiSuggestions && (
        <div className="bg-stone-950 p-4 rounded-lg border border-stone-800 text-xs space-y-3">
          <div className="font-bold text-amber-400 uppercase tracking-wider text-[11px]">
            Suggested HEI Institution Candidates
          </div>
          <p className="text-stone-300 text-[11px]">{heiSuggestions.reasoning_summary}</p>

          <div className="space-y-2.5">
            {heiSuggestions.suggested_candidates?.map((cand) => (
              <div key={cand.organization_id} className="p-3 bg-stone-900 rounded border border-stone-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-100">
                    {cand.organization_name || cand.organization_id}
                  </span>
                  {onApplyHEI && (
                    <button
                      type="button"
                      onClick={() =>
                        onApplyHEI(cand.organization_id, cand.relevance_explanation)
                      }
                      className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white font-bold text-[10px] rounded transition-colors"
                    >
                      + Add as Candidate Match
                    </button>
                  )}
                </div>
                <div className="text-stone-300 text-[11px]">{cand.relevance_explanation}</div>
                {cand.relevant_capabilities?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {cand.relevant_capabilities.map((cap, i) => (
                      <span key={i} className="px-1.5 py-0.5 bg-stone-800 text-amber-300 font-mono text-[10px] rounded border border-stone-700">
                        {cap}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
