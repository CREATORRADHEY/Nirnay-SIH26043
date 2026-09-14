import React, { useState } from "react";
import { X, AlertCircle, Check, ShieldCheck, Lock } from "lucide-react";
import { ReadinessStatusBadge, ConditionStatusBadge } from "./ReadinessStatusBadge";
import type {
  ReadinessStatus,
  ReadinessDecisionCreate,
  ReadinessConditionResponse,
  ReadinessDecisionResponse,
} from "@/lib/types/challenge";
import { createReadinessDecision } from "@/lib/api";

const HUMAN_STATUSES: ReadinessStatus[] = ["BLOCKED", "REVIEW_READY", "PILOT_READY"];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  challengeId: string;
  latestConditions: ReadinessConditionResponse[];
  existingDecisions: ReadinessDecisionResponse[];
  reviewerActorId: string;
  onDecisionCreated: () => void;
}

export function RecordReadinessDecisionSheet({
  isOpen,
  onClose,
  challengeId,
  latestConditions,
  existingDecisions,
  reviewerActorId,
  onDecisionCreated,
}: Props) {
  const [status, setStatus] = useState<ReadinessStatus>("REVIEW_READY");
  const [rationale, setRationale] = useState("");
  const satisfiedConditions = latestConditions.filter((c) => c.status === "SATISFIED");
  const [selectedConditionIds, setSelectedConditionIds] = useState<string[]>(
    satisfiedConditions.map((c) => c.id)
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const latestVersion =
    existingDecisions.length > 0
      ? Math.max(...existingDecisions.map((d) => d.version))
      : 0;

  const toggleConditionId = (id: string) => {
    setSelectedConditionIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerActorId) {
      setError("Demo reviewer identity is not configured.");
      return;
    }
    if (!rationale.trim()) {
      setError("Rationale is required.");
      return;
    }
    if (status === "PILOT_READY" && selectedConditionIds.length === 0) {
      setError("PILOT_READY authorization requires at least one supporting SATISFIED condition.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const payload: ReadinessDecisionCreate = {
        status,
        rationale: rationale.trim(),
        decided_by_actor_id: reviewerActorId,
        condition_ids: status === "PILOT_READY" ? selectedConditionIds : [],
        expected_version: latestVersion,
      };

      await createReadinessDecision(challengeId, payload);
      onDecisionCreated();
      onClose();
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Failed to record readiness decision.";
      setError(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-lg bg-[#FAF8F5] h-full shadow-2xl flex flex-col border-l border-stone-300">
        {/* Header */}
        <div className="p-6 border-b border-stone-200 flex items-center justify-between bg-white">
          <div>
            <p className="text-xs font-mono font-semibold uppercase tracking-wider text-[#F95700]">
              Record Readiness Decision
            </p>
            <h3 className="text-lg font-serif font-bold text-stone-900 mt-0.5">
              Human Pilot Authorization
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {!reviewerActorId && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-md text-xs text-amber-900 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>Demo reviewer identity is not configured. Human attribution is required for readiness decisions.</span>
            </div>
          )}

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-md text-xs text-rose-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Decision Status choices */}
          <div>
            <label className="block text-xs font-mono font-semibold uppercase text-stone-700 mb-2">
              Readiness Status
            </label>
            <div className="space-y-2">
              {HUMAN_STATUSES.map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatus(st)}
                  className={`w-full p-3 rounded-md border text-left flex items-center justify-between transition-colors ${
                    status === st
                      ? "bg-white border-[#F95700] ring-1 ring-[#F95700] shadow-xs"
                      : "bg-white border-stone-200 hover:bg-stone-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <ReadinessStatusBadge status={st} size="sm" />
                    <span className="text-xs text-stone-600 font-sans">
                      {st === "BLOCKED" && "Pilot cannot proceed; mandatory conditions missing or disputed."}
                      {st === "REVIEW_READY" && "Conditions documented and ready for human review."}
                      {st === "PILOT_READY" && "Human sign-off authorizing pilot implementation."}
                    </span>
                  </div>
                  {status === st && <Check className="w-4 h-4 text-[#F95700] shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          {/* Rationale */}
          <div>
            <label className="block text-xs font-mono font-semibold uppercase text-stone-700 mb-1">
              Decision Rationale
            </label>
            <textarea
              rows={3}
              value={rationale}
              onChange={(e) => setRationale(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#F95700]"
              placeholder="State clear reasons for this readiness decision..."
              required
            />
          </div>

          {/* PILOT_READY Specific condition selection */}
          {status === "PILOT_READY" && (
            <div className="space-y-4 pt-2">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-md text-xs text-emerald-950 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <span>
                  PILOT_READY is a human authorization. If a relied-on dependency changes later, NIRNAY can reopen this decision for review.
                </span>
              </div>

              <div>
                <label className="block text-xs font-mono font-semibold uppercase text-stone-700 mb-1">
                  Select Supporting SATISFIED Conditions
                </label>
                <p className="text-xs text-stone-500 mb-2">
                  Only SATISFIED conditions are available for PILOT_READY sign-off.
                </p>

                {latestConditions.length === 0 ? (
                  <p className="text-xs text-rose-600 italic font-mono">
                    No conditions available. Please assess conditions first.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {latestConditions.map((cond) => {
                      const isSatisfied = cond.status === "SATISFIED";
                      const isSelected = selectedConditionIds.includes(cond.id);
                      return (
                        <div
                          key={cond.id}
                          onClick={() => isSatisfied && toggleConditionId(cond.id)}
                          className={`p-2.5 rounded-md border flex items-center justify-between text-xs transition-colors ${
                            !isSatisfied
                              ? "bg-stone-100 border-stone-200 opacity-60 cursor-not-allowed"
                              : isSelected
                              ? "bg-white border-[#F95700] cursor-pointer shadow-2xs"
                              : "bg-white border-stone-200 cursor-pointer hover:bg-stone-50"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {isSatisfied ? (
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => {}}
                                className="rounded text-[#F95700] focus:ring-[#F95700]"
                              />
                            ) : (
                              <Lock className="w-3.5 h-3.5 text-stone-400" />
                            )}
                            <span className="font-mono font-bold text-stone-900">{cond.condition_key}</span>
                            <span className="text-stone-500 text-[11px]">v{cond.version}</span>
                          </div>
                          <ConditionStatusBadge status={cond.status} size="sm" />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Confirmation section */}
              <div className="p-3 bg-stone-100 border border-stone-300 rounded-md space-y-2">
                <p className="text-xs font-serif font-bold text-stone-900">
                  Authorize this challenge as PILOT_READY?
                </p>
                <div className="text-[11px] font-mono text-stone-600 space-y-1">
                  <div className="flex justify-between">
                    <span>Supporting Conditions:</span>
                    <span className="font-semibold text-stone-900">{selectedConditionIds.length} Selected</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Reviewer Attribution:</span>
                    <span className="font-semibold text-stone-900">
                      {reviewerActorId ? `${reviewerActorId.slice(0, 8)}...` : "None"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CTAs */}
          <div className="pt-4 border-t border-stone-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-200 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !reviewerActorId}
              className="px-5 py-2 text-sm font-semibold bg-[#F95700] text-white rounded-md hover:bg-[#d84b00] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-colors"
            >
              {isSubmitting
                ? "Recording..."
                : status === "PILOT_READY"
                ? "Authorize Pilot Readiness"
                : "Record Readiness Decision"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
