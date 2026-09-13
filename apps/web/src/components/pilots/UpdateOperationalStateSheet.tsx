import React, { useState } from "react";
import { X, AlertCircle, Check } from "lucide-react";
import { OperationalStatusBadge } from "./PilotBadges";
import type {
  OperationalStatus,
  PilotOperationalStateCreate,
  PilotOperationalStateResponse,
} from "@/lib/types/challenge";
import { createPilotOperationalState } from "@/lib/api";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  pilotId: string;
  currentOperationalState: PilotOperationalStateResponse | null;
  reviewerActorId: string;
  onStateUpdated: () => void;
}

export function UpdateOperationalStateSheet({
  isOpen,
  onClose,
  pilotId,
  currentOperationalState,
  reviewerActorId,
  onStateUpdated,
}: Props) {
  const currentStatus = currentOperationalState?.status || "PLANNED";

  // Derive sensible next state options
  const allowedNext: OperationalStatus[] =
    currentStatus === "PLANNED"
      ? ["ACTIVE", "STOPPED"]
      : currentStatus === "ACTIVE"
      ? ["COMPLETED", "STOPPED"]
      : [];

  const [selectedStatus, setSelectedStatus] = useState<OperationalStatus>(
    allowedNext.length > 0 ? allowedNext[0] : "ACTIVE"
  );
  const [rationale, setRationale] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [concurrencyNotice, setConcurrencyNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const latestVersion = currentOperationalState?.version || 0;

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

    setIsSubmitting(true);
    setError(null);
    setConcurrencyNotice(null);

    try {
      const payload: PilotOperationalStateCreate = {
        status: selectedStatus,
        rationale: rationale.trim(),
        recorded_by_actor_id: reviewerActorId,
        expected_version: latestVersion,
      };

      await createPilotOperationalState(pilotId, payload);
      onStateUpdated();
      onClose();
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Failed to update state.";
      if (errMsg.includes("409") || errMsg.includes("expected_version") || errMsg.includes("Stale")) {
        setConcurrencyNotice(
          "Pilot state changed since you opened it. We have refreshed the latest state."
        );
        onStateUpdated();
      } else {
        setError(errMsg);
      }
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
              Operational Lifecycle
            </p>
            <h3 className="text-lg font-serif font-bold text-stone-900 mt-0.5">
              Update Operational State
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {!reviewerActorId && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-md text-xs text-amber-900 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>Demo reviewer identity is not configured. Actor attribution is required.</span>
            </div>
          )}

          {allowedNext.length === 0 && (
            <div className="p-3 bg-stone-100 border border-stone-200 rounded-md text-xs text-stone-700 font-mono">
              Operational state is final ({currentStatus}). No further state transitions allowed.
            </div>
          )}

          {concurrencyNotice && (
            <div className="p-3 bg-amber-50 border border-amber-300 rounded-md text-xs text-amber-950 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>{concurrencyNotice}</span>
            </div>
          )}

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-md text-xs text-rose-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Current State */}
          <div className="p-3 bg-white border border-stone-200 rounded-md font-mono text-xs flex justify-between items-center">
            <span className="text-stone-500">Current State:</span>
            <OperationalStatusBadge status={currentStatus} size="sm" />
          </div>

          {/* Allowed transitions */}
          {allowedNext.length > 0 && (
            <div>
              <label className="block text-xs font-mono font-semibold uppercase text-stone-700 mb-2">
                Target Operational State
              </label>
              <div className="space-y-2">
                {allowedNext.map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setSelectedStatus(st)}
                    className={`w-full p-3 rounded-md border text-left flex items-center justify-between transition-colors ${
                      selectedStatus === st
                        ? "bg-white border-[#F95700] ring-1 ring-[#F95700] shadow-xs"
                        : "bg-white border-stone-200 hover:bg-stone-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <OperationalStatusBadge status={st} size="sm" />
                      <span className="text-xs text-stone-600 font-sans">
                        {st === "ACTIVE" && "Initiate active field execution."}
                        {st === "COMPLETED" && "Field activity reached completion."}
                        {st === "STOPPED" && "Halt pilot execution prior to completion."}
                      </span>
                    </div>
                    {selectedStatus === st && <Check className="w-4 h-4 text-[#F95700]" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Rationale */}
          <div>
            <label className="block text-xs font-mono font-semibold uppercase text-stone-700 mb-1">
              Transition Rationale
            </label>
            <textarea
              rows={3}
              value={rationale}
              onChange={(e) => setRationale(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#F95700]"
              placeholder="State clear reason for this operational state advance..."
              required
              disabled={allowedNext.length === 0}
            />
          </div>

          {/* Version Context */}
          <div className="p-3 bg-stone-100 rounded-md border border-stone-200 space-y-1 text-xs text-stone-600 font-mono">
            <div className="flex justify-between">
              <span>Expected State Version:</span>
              <span className="font-semibold text-stone-900">v{latestVersion + 1}</span>
            </div>
            <div className="flex justify-between">
              <span>Recorded By Reviewer:</span>
              <span className="font-semibold text-stone-900">
                {reviewerActorId ? `${reviewerActorId.slice(0, 8)}...` : "Not Configured"}
              </span>
            </div>
          </div>

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
              disabled={isSubmitting || allowedNext.length === 0 || !reviewerActorId}
              className="px-5 py-2 text-sm font-semibold bg-[#F95700] text-white rounded-md hover:bg-[#d84b00] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-colors"
            >
              {isSubmitting ? "Updating..." : "Update Operational State"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
