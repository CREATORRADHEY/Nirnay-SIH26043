import React, { useState } from "react";
import { X, AlertCircle, Check } from "lucide-react";
import { ConditionStatusBadge } from "./ReadinessStatusBadge";
import type {
  ConditionStatus,
  ReadinessConditionCreate,
  ReadinessConditionResponse,
  CommitmentResponse,
  HEIOrganization,
} from "@/lib/types/challenge";
import { createReadinessCondition } from "@/lib/api";

const SUGGESTED_KEYS = [
  "HEI_COMMITMENT",
  "FIELD_PERMISSION",
  "FACULTY_AVAILABILITY",
  "EVIDENCE_PLAN",
  "SITE_ACCESS",
  "RESOURCE_AVAILABILITY",
];

const CONDITION_STATUSES: ConditionStatus[] = [
  "SATISFIED",
  "UNSATISFIED",
  "UNKNOWN",
  "DISPUTED",
  "EXPIRED",
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  challengeId: string;
  existingConditions: ReadinessConditionResponse[];
  commitments: CommitmentResponse[];
  organizations: HEIOrganization[];
  reviewerActorId: string;
  onConditionCreated: () => void;
}

export function AssessConditionSheet({
  isOpen,
  onClose,
  challengeId,
  existingConditions,
  commitments,
  organizations,
  reviewerActorId,
  onConditionCreated,
}: Props) {
  const [conditionKey, setConditionKey] = useState("HEI_COMMITMENT");
  const [status, setStatus] = useState<ConditionStatus>("SATISFIED");
  const [rationale, setRationale] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [selectedCommitmentIds, setSelectedCommitmentIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [concurrencyNotice, setConcurrencyNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const keyConditions = existingConditions.filter((c) => c.condition_key === conditionKey);
  const latestVersion =
    keyConditions.length > 0 ? Math.max(...keyConditions.map((c) => c.version)) : 0;

  const toggleCommitmentDep = (id: string) => {
    setSelectedCommitmentIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const getOrgName = (orgId: string) => {
    const org = organizations.find((o) => o.organization_id === orgId);
    return org ? org.name : `Organization ${orgId.slice(0, 8)}...`;
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

    setIsSubmitting(true);
    setError(null);
    setConcurrencyNotice(null);

    try {
      const payload: ReadinessConditionCreate = {
        condition_key: conditionKey.trim(),
        status,
        rationale: rationale.trim(),
        assessed_by_actor_id: reviewerActorId,
        valid_until: validUntil ? new Date(validUntil).toISOString() : null,
        commitment_dependency_ids: selectedCommitmentIds,
        expected_version: latestVersion,
      };

      await createReadinessCondition(challengeId, payload);
      onConditionCreated();
      onClose();
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Failed to assess condition.";
      if (errMsg.includes("409") || errMsg.includes("expected_version") || errMsg.includes("Stale")) {
        setConcurrencyNotice(
          "This condition changed since you opened it. We have refreshed the latest record."
        );
        onConditionCreated();
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
              Assess Readiness Condition
            </p>
            <h3 className="text-lg font-serif font-bold text-stone-900 mt-0.5">
              Condition Key: {conditionKey}
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
              <span>Demo reviewer identity is not configured. Condition assessment requires reviewer attribution.</span>
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

          {/* Condition Key selection */}
          <div>
            <label className="block text-xs font-mono font-semibold uppercase text-stone-700 mb-1">
              Condition Key
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {SUGGESTED_KEYS.map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setConditionKey(k)}
                  className={`text-xs px-2.5 py-1 rounded border font-mono transition-colors ${
                    conditionKey === k
                      ? "bg-[#F95700] text-white border-[#F95700]"
                      : "bg-white text-stone-700 border-stone-300 hover:border-stone-400"
                  }`}
                >
                  {k}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={conditionKey}
              onChange={(e) => setConditionKey(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#F95700]"
              placeholder="e.g. HEI_COMMITMENT"
              required
            />
          </div>

          {/* Status selection */}
          <div>
            <label className="block text-xs font-mono font-semibold uppercase text-stone-700 mb-2">
              Condition Status
            </label>
            <div className="grid grid-cols-2 gap-2">
              {CONDITION_STATUSES.map((st) => (
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
                  <ConditionStatusBadge status={st} size="sm" />
                  {status === st && <Check className="w-4 h-4 text-[#F95700]" />}
                </button>
              ))}
            </div>
          </div>

          {/* Rationale */}
          <div>
            <label className="block text-xs font-mono font-semibold uppercase text-stone-700 mb-1">
              Assessment Rationale
            </label>
            <textarea
              rows={3}
              value={rationale}
              onChange={(e) => setRationale(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#F95700]"
              placeholder="Explain why this condition is satisfied, disputed, or unsatisfied..."
              required
            />
          </div>

          {/* Commitment Dependencies Selection */}
          <div>
            <label className="block text-xs font-mono font-semibold uppercase text-stone-700 mb-1">
              Commitment Dependencies (Optional)
            </label>
            <p className="text-xs text-stone-500 mb-2">
              Select specific commitment versions this condition relies on:
            </p>
            {commitments.length === 0 ? (
              <p className="text-xs text-stone-400 italic">No commitments recorded yet.</p>
            ) : (
              <div className="max-h-40 overflow-y-auto space-y-1.5 p-2 bg-white border border-stone-300 rounded-md">
                {commitments.map((comm) => {
                  const isChecked = selectedCommitmentIds.includes(comm.id);
                  return (
                    <label
                      key={comm.id}
                      className={`flex items-start gap-2.5 p-2 rounded text-xs cursor-pointer transition-colors ${
                        isChecked ? "bg-amber-50 border border-amber-300" : "hover:bg-stone-50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleCommitmentDep(comm.id)}
                        className="mt-0.5 rounded text-[#F95700] focus:ring-[#F95700]"
                      />
                      <div className="font-mono text-stone-800">
                        <span className="font-bold">{getOrgName(comm.organization_id)}</span>
                        <span className="text-stone-500 font-normal">
                          {" • "}{comm.commitment_type} • v{comm.version} ({comm.status})
                        </span>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* Valid until date */}
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

          {/* Version Context */}
          <div className="p-3 bg-stone-100 rounded-md border border-stone-200 space-y-1 text-xs text-stone-600 font-mono">
            <div className="flex justify-between">
              <span>Expected Key Version:</span>
              <span className="font-semibold text-stone-900">v{latestVersion + 1}</span>
            </div>
            <div className="flex justify-between">
              <span>Assessed By Reviewer:</span>
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
              disabled={isSubmitting || !reviewerActorId}
              className="px-5 py-2 text-sm font-semibold bg-[#F95700] text-white rounded-md hover:bg-[#d84b00] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-colors"
            >
              {isSubmitting ? "Recording..." : "Record Condition Version"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
