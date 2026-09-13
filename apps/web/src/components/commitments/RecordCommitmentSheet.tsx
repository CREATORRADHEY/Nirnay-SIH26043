import React, { useState } from "react";
import { X, AlertCircle, Check } from "lucide-react";
import { CommitmentStatusBadge } from "./CommitmentStatusBadge";
import type {
  CommitmentCreate,
  CommitmentResponse,
  CommitmentStatus,
} from "@/lib/types/challenge";
import { createCommitmentVersion } from "@/lib/api";

const SUGGESTED_TYPES = [
  "HEI_PARTICIPATION",
  "FACULTY_MENTORING",
  "LAB_SUPPORT",
  "TECHNICAL_SUPPORT",
  "FIELD_SUPPORT",
  "FUNDING_SUPPORT",
];

const COMMITMENT_STATUSES: CommitmentStatus[] = [
  "PROPOSED",
  "OFFERED",
  "ACCEPTED",
  "DECLINED",
  "WITHDRAWN",
  "EXPIRED",
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  challengeId: string;
  candidateOrg: { organization_id: string; name: string } | null;
  existingCommitments: CommitmentResponse[];
  reviewerActorId: string;
  onCommitmentCreated: () => void;
}

export function RecordCommitmentSheet({
  isOpen,
  onClose,
  challengeId,
  candidateOrg,
  existingCommitments,
  reviewerActorId,
  onCommitmentCreated,
}: Props) {
  const [commitmentType, setCommitmentType] = useState("HEI_PARTICIPATION");
  const [status, setStatus] = useState<CommitmentStatus>("ACCEPTED");
  const [scopeDescription, setScopeDescription] = useState("");
  const [validFrom, setValidFrom] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [concurrencyNotice, setConcurrencyNotice] = useState<string | null>(null);

  if (!isOpen || !candidateOrg) return null;

  const orgSeries = existingCommitments.filter(
    (c) =>
      c.organization_id === candidateOrg.organization_id &&
      c.commitment_type === commitmentType
  );
  const latestVersion =
    orgSeries.length > 0 ? Math.max(...orgSeries.map((s) => s.version)) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerActorId) {
      setError("Demo reviewer identity is not configured.");
      return;
    }
    if (!scopeDescription.trim()) {
      setError("Scope description is required.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setConcurrencyNotice(null);

    try {
      const payload: CommitmentCreate = {
        organization_id: candidateOrg.organization_id,
        commitment_type: commitmentType.trim(),
        status,
        scope_description: scopeDescription.trim(),
        recorded_by_actor_id: reviewerActorId,
        valid_from: validFrom ? new Date(validFrom).toISOString() : null,
        valid_until: validUntil ? new Date(validUntil).toISOString() : null,
        expected_version: latestVersion,
      };

      await createCommitmentVersion(challengeId, payload);
      onCommitmentCreated();
      onClose();
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Failed to record commitment.";
      if (errMsg.includes("409") || errMsg.includes("expected_version") || errMsg.includes("Stale")) {
        setConcurrencyNotice(
          "This commitment changed since you opened it. We have refreshed the latest record."
        );
        onCommitmentCreated();
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
              Record Commitment
            </p>
            <h3 className="text-lg font-serif font-bold text-stone-900 mt-0.5">
              {candidateOrg.name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
            aria-label="Close sheet"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {!reviewerActorId && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-md text-xs text-amber-900 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>Demo reviewer identity is not configured. Commitment recording requires reviewer attribution.</span>
            </div>
          )}

          {concurrencyNotice && (
            <div className="p-3 bg-amber-50 border border-amber-300 rounded-md text-xs text-amber-950 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">{concurrencyNotice}</p>
                <p className="mt-1 text-amber-800">Please review the updated history and submit again when ready.</p>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-md text-xs text-rose-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Commitment Type */}
          <div>
            <label className="block text-xs font-mono font-semibold uppercase text-stone-700 mb-1">
              Commitment Type
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {SUGGESTED_TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setCommitmentType(t)}
                  className={`text-xs px-2.5 py-1 rounded border font-mono transition-colors ${
                    commitmentType === t
                      ? "bg-[#F95700] text-white border-[#F95700]"
                      : "bg-white text-stone-700 border-stone-300 hover:border-stone-400"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={commitmentType}
              onChange={(e) => setCommitmentType(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#F95700]"
              placeholder="e.g. HEI_PARTICIPATION"
              required
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-mono font-semibold uppercase text-stone-700 mb-2">
              Commitment Status
            </label>
            <div className="grid grid-cols-2 gap-2">
              {COMMITMENT_STATUSES.map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatus(st)}
                  className={`p-2.5 rounded-md border text-left flex items-center justify-between transition-colors ${
                    status === st
                      ? "bg-white border-[#F95700] shadow-xs"
                      : "bg-stone-50 border-stone-200 hover:bg-white"
                  }`}
                >
                  <CommitmentStatusBadge status={st} size="sm" />
                  {status === st && <Check className="w-4 h-4 text-[#F95700]" />}
                </button>
              ))}
            </div>
          </div>

          {/* Scope Description */}
          <div>
            <label className="block text-xs font-mono font-semibold uppercase text-stone-700 mb-1">
              Scope Description
            </label>
            <textarea
              rows={4}
              value={scopeDescription}
              onChange={(e) => setScopeDescription(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#F95700]"
              placeholder="Record exact agreed, offered, or withdrawn commitment scope details..."
              required
            />
          </div>

          {/* Validity dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-semibold uppercase text-stone-700 mb-1">
                Valid From (Optional)
              </label>
              <input
                type="date"
                value={validFrom}
                onChange={(e) => setValidFrom(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#F95700]"
              />
            </div>
            <div>
              <label className="block text-xs font-mono font-semibold uppercase text-stone-700 mb-1">
                Valid Until (Optional)
              </label>
              <input
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#F95700]"
              />
            </div>
          </div>

          {/* Reviewer & Series Version context */}
          <div className="p-3 bg-stone-100 rounded-md border border-stone-200 space-y-1.5 text-xs text-stone-600 font-mono">
            <div className="flex justify-between">
              <span>Target Series:</span>
              <span className="font-semibold text-stone-900">{commitmentType}</span>
            </div>
            <div className="flex justify-between">
              <span>Expected Target Version:</span>
              <span className="font-semibold text-stone-900">v{latestVersion + 1}</span>
            </div>
            <div className="flex justify-between">
              <span>Recorded By Reviewer:</span>
              <span className="font-semibold text-stone-900">
                {reviewerActorId ? `${reviewerActorId.slice(0, 8)}...` : "Not Configured"}
              </span>
            </div>
          </div>

          {/* Footer CTAs */}
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
              {isSubmitting ? "Recording..." : "Record Commitment Version"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
