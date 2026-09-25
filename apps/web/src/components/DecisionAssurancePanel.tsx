"use client";

import React, { useState } from "react";
import { DecisionAssuranceResponse } from "@/lib/types/challenge";
import { submitSecondReview, resolveDisagreement, createDecisionReviewRequest } from "@/lib/api";

interface DecisionAssurancePanelProps {
  assuranceRecords: DecisionAssuranceResponse[];
  challengeId: string;
  userRole?: string;
  onRefresh?: () => void;
}

export function DecisionAssurancePanel({
  assuranceRecords,
  challengeId,
  userRole,
  onRefresh,
}: DecisionAssurancePanelProps) {
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [secondReviewDecision, setSecondReviewDecision] = useState("INNOVATION_CHALLENGE");
  const [secondReviewRationale, setSecondReviewRationale] = useState("");
  const [resolutionDecision, setResolutionDecision] = useState("INNOVATION_CHALLENGE");
  const [resolutionRationale, setResolutionRationale] = useState("");
  const [appealReason, setAppealReason] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!assuranceRecords || assuranceRecords.length === 0) {
    return (
      <div className="p-6 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-600 space-y-2">
        <div className="font-bold text-stone-900 text-sm">No Decision Assurance Metadata Recorded</div>
        <p>
          Authoritative governance metadata, criteria rubrics, evidence references, and independent review logs will appear here upon decision finalization.
        </p>
      </div>
    );
  }

  const handleSecondReview = async (recId: string) => {
    if (!secondReviewRationale || secondReviewRationale.length < 10) {
      setErrorMsg("Independent review rationale must be at least 10 characters.");
      return;
    }
    setSubmitting(true);
    setErrorMsg(null);
    try {
      await submitSecondReview(recId, {
        rationale: secondReviewRationale,
        decision: secondReviewDecision,
      });
      setSuccessMsg("Independent second review recorded successfully.");
      setSecondReviewRationale("");
      if (onRefresh) onRefresh();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to submit second review.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResolve = async (recId: string) => {
    if (!resolutionRationale || resolutionRationale.length < 10) {
      setErrorMsg("Resolution rationale must be at least 10 characters.");
      return;
    }
    setSubmitting(true);
    setErrorMsg(null);
    try {
      await resolveDisagreement(recId, {
        resolution_rationale: resolutionRationale,
        final_decision: resolutionDecision,
      });
      setSuccessMsg("Reviewer disagreement resolved cleanly.");
      setResolutionRationale("");
      if (onRefresh) onRefresh();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to resolve disagreement.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAppeal = async (recId: string) => {
    if (!appealReason || appealReason.length < 10) {
      setErrorMsg("Review request reason must be at least 10 characters.");
      return;
    }
    setSubmitting(true);
    setErrorMsg(null);
    try {
      await createDecisionReviewRequest(challengeId, recId, {
        reason: appealReason,
      });
      setSuccessMsg("Stakeholder review request submitted. Original decision preserved in history.");
      setAppealReason("");
      setSelectedRecordId(null);
      if (onRefresh) onRefresh();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to submit review request.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {errorMsg && (
        <div className="p-3 bg-red-50 text-red-900 text-xs rounded border border-red-200">
          {errorMsg}
        </div>
      )}
      {successMsg && (
        <div className="p-3 bg-emerald-50 text-emerald-900 text-xs rounded border border-emerald-200">
          {successMsg}
        </div>
      )}

      <div className="space-y-4">
        {assuranceRecords.map((rec) => {
          const isSelected = selectedRecordId === rec.id;
          return (
            <div
              key={rec.id}
              className="p-5 bg-white rounded-xl border border-stone-200 shadow-sm space-y-4 text-xs"
            >
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-stone-900 text-sm">
                      {rec.decision_type} ASSURANCE RECEIPT
                    </span>
                    <span className="font-mono text-[10px] text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
                      ID: {rec.id.slice(0, 8)}
                    </span>
                  </div>
                  <div className="text-[11px] text-stone-500">
                    Decided at {new Date(rec.created_at).toLocaleString()} by Reviewer {rec.reviewer_actor_id.slice(0, 8)}
                  </div>
                </div>

                {/* Badges */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {rec.review_status === "SINGLE_REVIEWED" && (
                    <span className="bg-stone-100 text-stone-700 px-2.5 py-1 rounded font-bold">
                      SINGLE REVIEWED
                    </span>
                  )}
                  {rec.review_status === "SECOND_REVIEW_PENDING" && (
                    <span className="bg-amber-100 text-amber-900 px-2.5 py-1 rounded font-bold animate-pulse">
                      2ND REVIEW REQUIRED
                    </span>
                  )}
                  {rec.review_status === "AGREED" && (
                    <span className="bg-emerald-100 text-emerald-900 px-2.5 py-1 rounded font-bold">
                      2ND REVIEW AGREED
                    </span>
                  )}
                  {rec.review_status === "DISAGREED" && (
                    <span className="bg-red-100 text-red-900 px-2.5 py-1 rounded font-bold">
                      REVIEWERS DISAGREED
                    </span>
                  )}
                  {rec.review_status === "RESOLVED" && (
                    <span className="bg-blue-100 text-blue-900 px-2.5 py-1 rounded font-bold">
                      SENIOR RESOLVED
                    </span>
                  )}

                  {rec.ai_agreement_status === "AGREEMENT" && (
                    <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-mono text-[10px]">
                      AI Match
                    </span>
                  )}
                  {rec.ai_agreement_status === "DISAGREEMENT" && (
                    <span className="bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded font-mono text-[10px]">
                      AI Disagreed (Observed)
                    </span>
                  )}
                  {rec.conflict_declared === "POTENTIAL_CONFLICT" && (
                    <span className="bg-purple-100 text-purple-900 px-2 py-0.5 rounded font-bold text-[10px]">
                      Potential Conflict Declared
                    </span>
                  )}
                </div>
              </div>

              {/* Rationale */}
              <div className="space-y-1">
                <span className="font-bold text-stone-700 uppercase text-[10px] tracking-wider block">
                  Mandatory Human Rationale
                </span>
                <p className="bg-stone-50 p-3 rounded border border-stone-200 text-stone-800 italic">
                  &quot;{rec.rationale}&quot;
                </p>
              </div>

              {/* Rubric Snapshot & Evidence */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-stone-50 p-3 rounded border border-stone-200 text-[11px]">
                <div>
                  <span className="font-bold text-stone-900 block mb-1">
                    Structured Criteria Rubric ({rec.rubric_version})
                  </span>
                  {rec.rubric_answers && Object.keys(rec.rubric_answers).length > 0 ? (
                    <ul className="space-y-0.5 text-stone-700">
                      {Object.entries(rec.rubric_answers).map(([k, v]) => (
                        <li key={k} className="flex justify-between border-b border-stone-200/50 py-0.5">
                          <span className="text-stone-600 truncate max-w-[180px]">{k}:</span>
                          <span className="font-bold">{String(v)}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-stone-500">Standard criteria evaluated.</span>
                  )}
                </div>

                <div>
                  <span className="font-bold text-stone-900 block mb-1">
                    Evidence References Considered ({rec.evidence_ids.length})
                  </span>
                  {rec.evidence_ids && rec.evidence_ids.length > 0 ? (
                    <ul className="space-y-0.5 font-mono text-[10px] text-stone-600">
                      {rec.evidence_ids.map((evId) => (
                        <li key={evId}>• Evidence ID: {evId.slice(0, 12)}...</li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-stone-500">No specific attached evidence records referenced.</span>
                  )}
                </div>
              </div>

              {/* AI Advisory Snapshot (Visual Boundary) */}
              {rec.ai_advisory_snapshot && (
                <div className="p-3 bg-amber-50/60 rounded border border-amber-200/80 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-amber-900">
                      AI ADVISORY — NON-AUTHORITATIVE
                    </span>
                    <span className="text-[10px] text-amber-700 font-mono">
                      AI cannot submit decisions
                    </span>
                  </div>
                  <div className="text-[11px] text-amber-800">
                    Suggested: <span className="font-bold">{rec.ai_advisory_snapshot.suggested_route || rec.ai_advisory_snapshot.suggested_status}</span>
                  </div>
                </div>
              )}

              {/* Second Review / Resolution Details */}
              {rec.second_reviewer_actor_id && (
                <div className="p-3 bg-blue-50/50 rounded border border-blue-200 space-y-1 text-[11px]">
                  <div className="font-bold text-blue-900">
                    Independent Second Review (Actor: {rec.second_reviewer_actor_id.slice(0, 8)})
                  </div>
                  <div className="text-blue-800">
                    Decision: <span className="font-bold">{rec.second_review_decision}</span>
                  </div>
                  <p className="text-blue-900 italic">&quot;{rec.second_review_rationale}&quot;</p>
                </div>
              )}

              {rec.disagreement_resolved_by_actor_id && (
                <div className="p-3 bg-purple-50/50 rounded border border-purple-200 space-y-1 text-[11px]">
                  <div className="font-bold text-purple-900">
                    Senior Resolution (Actor: {rec.disagreement_resolved_by_actor_id.slice(0, 8)})
                  </div>
                  <p className="text-purple-900 italic">&quot;{rec.resolution_rationale}&quot;</p>
                </div>
              )}

              {/* Actions Footer */}
              <div className="flex items-center justify-between border-t border-stone-100 pt-3 text-[11px]">
                <button
                  type="button"
                  onClick={() => setSelectedRecordId(isSelected ? null : rec.id)}
                  className="text-stone-700 hover:text-stone-900 font-medium underline"
                >
                  {isSelected ? "Close Actions" : "Request Review / Appeal"}
                </button>
              </div>

              {/* Expandable Appeal Form */}
              {isSelected && (
                <div className="p-4 bg-stone-50 rounded-lg border border-stone-200 space-y-3 mt-2">
                  <div className="font-bold text-stone-900">Submit Stakeholder Review Request</div>
                  <p className="text-stone-600">
                    Requesting a review flags this decision for independent governance inspection. Original decision history will be strictly preserved.
                  </p>
                  <textarea
                    value={appealReason}
                    onChange={(e) => setAppealReason(e.target.value)}
                    placeholder="Provide specific reason and new evidence basis for review request (min 10 characters)..."
                    className="w-full p-2.5 rounded border border-stone-300 text-xs focus:ring-1 focus:ring-stone-800"
                    rows={2}
                  />
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => handleAppeal(rec.id)}
                    className="bg-stone-900 text-white font-bold px-4 py-2 rounded hover:bg-stone-800 disabled:opacity-50"
                  >
                    {submitting ? "Submitting Request..." : "Submit Review Request"}
                  </button>
                </div>
              )}

              {/* Independent Second Review Action (for 2nd reviewers) */}
              {rec.review_status === "SECOND_REVIEW_PENDING" && userRole === "GOVERNMENT_REVIEWER" && (
                <div className="p-4 bg-amber-50 rounded-lg border border-amber-300 space-y-3 mt-2">
                  <div className="font-bold text-amber-900">Perform Independent Second Review</div>
                  <p className="text-amber-800">
                    You are recording an independent assessment as Reviewer 2. You cannot be the same user as Reviewer 1.
                  </p>
                  <div className="space-y-2">
                    <label className="block font-bold text-stone-700">Independent Route / Status Assessment:</label>
                    <select
                      value={secondReviewDecision}
                      onChange={(e) => setSecondReviewDecision(e.target.value)}
                      className="p-2 rounded border border-stone-300 bg-white font-mono text-xs w-full"
                    >
                      <option value="INNOVATION_CHALLENGE">INNOVATION_CHALLENGE</option>
                      <option value="RESEARCH_REVIEW">RESEARCH_REVIEW</option>
                      <option value="CLARIFY">CLARIFY</option>
                      <option value="SERVICE">SERVICE</option>
                    </select>
                  </div>
                  <textarea
                    value={secondReviewRationale}
                    onChange={(e) => setSecondReviewRationale(e.target.value)}
                    placeholder="Independent second review rationale (min 10 chars)..."
                    className="w-full p-2.5 rounded border border-stone-300 text-xs"
                    rows={2}
                  />
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => handleSecondReview(rec.id)}
                    className="bg-amber-900 text-white font-bold px-4 py-2 rounded hover:bg-amber-800 disabled:opacity-50"
                  >
                    {submitting ? "Submitting 2nd Review..." : "Submit Independent 2nd Review"}
                  </button>
                </div>
              )}

              {/* Disagreement Resolution Action (for Senior Reviewer / Admin) */}
              {rec.review_status === "DISAGREED" && (
                <div className="p-4 bg-red-50 rounded-lg border border-red-300 space-y-3 mt-2">
                  <div className="font-bold text-red-900">Senior Governance Disagreement Resolution</div>
                  <p className="text-red-800">
                    Reviewer 1 and Reviewer 2 submitted differing assessments. Record authoritative senior resolution. Both earlier reviews remain preserved in history.
                  </p>
                  <div className="space-y-2">
                    <label className="block font-bold text-stone-700">Authoritative Resolution Route:</label>
                    <select
                      value={resolutionDecision}
                      onChange={(e) => setResolutionDecision(e.target.value)}
                      className="p-2 rounded border border-stone-300 bg-white font-mono text-xs w-full"
                    >
                      <option value="INNOVATION_CHALLENGE">INNOVATION_CHALLENGE</option>
                      <option value="RESEARCH_REVIEW">RESEARCH_REVIEW</option>
                      <option value="CLARIFY">CLARIFY</option>
                      <option value="SERVICE">SERVICE</option>
                    </select>
                  </div>
                  <textarea
                    value={resolutionRationale}
                    onChange={(e) => setResolutionRationale(e.target.value)}
                    placeholder="Senior resolution rationale explaining authoritative basis (min 10 chars)..."
                    className="w-full p-2.5 rounded border border-stone-300 text-xs"
                    rows={2}
                  />
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => handleResolve(rec.id)}
                    className="bg-red-900 text-white font-bold px-4 py-2 rounded hover:bg-red-800 disabled:opacity-50"
                  >
                    {submitting ? "Resolving Disagreement..." : "Record Senior Resolution"}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
