"use client";

import { useState } from "react";
import { Plus, X, AlertTriangle } from "lucide-react";
import { HEIOrganization } from "@/lib/types/challenge";

interface CreateCandidateSheetProps {
  organization: HEIOrganization | null;
  onClose: () => void;
  onSubmit: (data: { organization_id: string; match_method: string; rationale: string }) => Promise<void>;
  reviewerActorId: string;
}

export function CreateCandidateSheet({
  organization,
  onClose,
  onSubmit,
  reviewerActorId,
}: CreateCandidateSheetProps) {
  const [rationale, setRationale] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!organization) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rationale.trim()) {
      setError("Rationale for candidate matching is required.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        organization_id: organization.organization_id,
        match_method: "MANUAL",
        rationale: rationale.trim(),
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add HEI candidate.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/30 backdrop-blur-xs p-0 sm:p-4">
      <div className="w-full max-w-lg h-full sm:h-auto max-h-[90vh] bg-[var(--surface)] border border-[var(--border)] rounded-none sm:rounded-xl shadow-xl flex flex-col overflow-hidden text-xs text-[var(--text-primary)]">
        {/* Sheet Header */}
        <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between bg-[#F9F7F2]">
          <div className="flex items-center gap-2.5">
            <Plus className="w-5 h-5 text-[var(--primary)]" />
            <div>
              <h3 className="font-extrabold text-sm text-[var(--text-primary)]">
                Add HEI Candidate Match
              </h3>
              <p className="text-[11px] text-[var(--text-secondary)]">
                {organization.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-[#E8E4D9] text-[var(--text-secondary)] focus:outline-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && (
            <div className="p-3 rounded bg-red-50 border border-red-200 text-red-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <div className="p-3 rounded bg-[#F4F1EA] border border-[var(--border)] space-y-1">
            <span className="font-bold text-[var(--text-primary)]">Match Method:</span>
            <p className="text-[var(--text-secondary)] font-mono">MANUAL (Nodal Reviewer Inspection)</p>
          </div>

          <div className="space-y-1.5">
            <label className="block font-bold uppercase tracking-wider text-[10px] text-[var(--text-secondary)]">
              Matching Rationale *
            </label>
            <textarea
              rows={4}
              value={rationale}
              onChange={(e) => setRationale(e.target.value)}
              placeholder="Explain why this HEI institution and its active capabilities are relevant candidates..."
              className="w-full p-3 rounded bg-[var(--background)] border border-[var(--border)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
              required
            />
          </div>

          <div className="p-3 rounded bg-[#F2EFE9] border border-[var(--border)] flex items-center justify-between text-[11px]">
            <span className="font-semibold text-[var(--text-secondary)]">Reviewer Identity:</span>
            <span className="font-mono text-[var(--text-primary)]">{reviewerActorId}</span>
          </div>

          {/* Critical Boundary Notice */}
          <div className="p-3.5 rounded bg-[#FFF4EE] border border-[#FCD8C5] text-[11px] text-[var(--text-primary)] space-y-1">
            <p className="font-bold text-[var(--primary)]">Architectural Boundary Notice:</p>
            <p className="leading-relaxed">
              Candidate matching indicates potential relevance only. It does not create an assignment or commitment.
            </p>
          </div>

          {/* Form Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-[var(--border)]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded bg-[var(--primary)] text-white text-xs font-semibold hover:bg-[var(--primary-hover)] transition-colors disabled:opacity-50 inline-flex items-center gap-1.5"
            >
              {submitting ? "Adding..." : "Add Candidate"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
