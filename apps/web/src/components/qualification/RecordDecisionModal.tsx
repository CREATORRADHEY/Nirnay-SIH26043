"use client";

import { useState } from "react";
import { ShieldCheck, X, AlertTriangle } from "lucide-react";
import { EvidenceResponse, QualificationRoute } from "@/lib/types/challenge";

interface RecordDecisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    route: QualificationRoute;
    rationale: string;
    evidence_ids: string[];
  }) => Promise<void>;
  evidenceList: EvidenceResponse[];
  reviewerActorId: string;
}

export function RecordDecisionModal({
  isOpen,
  onClose,
  onSubmit,
  evidenceList,
  reviewerActorId,
}: RecordDecisionModalProps) {
  const [route, setRoute] = useState<QualificationRoute>("INNOVATION_CHALLENGE");
  const [rationale, setRationale] = useState("");
  const [selectedEvidenceIds, setSelectedEvidenceIds] = useState<string[]>(
    evidenceList.map((e) => e.id)
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleEvidence = (id: string) => {
    if (selectedEvidenceIds.includes(id)) {
      setSelectedEvidenceIds(selectedEvidenceIds.filter((eId) => eId !== id));
    } else {
      setSelectedEvidenceIds([...selectedEvidenceIds, id]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rationale.trim()) {
      setError("Human qualification rationale is required.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        route,
        rationale: rationale.trim(),
        evidence_ids: selectedEvidenceIds,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to record qualification decision.");
    } finally {
      setSubmitting(false);
    }
  };

  const routesList: { value: QualificationRoute; label: string; desc: string }[] = [
    {
      value: "INNOVATION_CHALLENGE",
      label: "Innovation Challenge",
      desc: "Requires research partnership, novel technology development, or pilot testing.",
    },
    {
      value: "SERVICE",
      label: "Service Issue",
      desc: "Existing municipal/government service delivery issue with standard procedures.",
    },
    {
      value: "CLARIFY",
      label: "Clarification Needed",
      desc: "Requires further evidence, context, or field data before qualification.",
    },
    {
      value: "RESEARCH_REVIEW",
      label: "Research Review",
      desc: "Requires literature or baseline review before technical formulation.",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/30 backdrop-blur-xs p-0 sm:p-4">
      <div className="w-full max-w-xl h-full sm:h-auto max-h-[90vh] bg-[var(--surface)] border border-[var(--border)] rounded-none sm:rounded-xl shadow-xl flex flex-col overflow-hidden text-xs text-[var(--text-primary)]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between bg-[#F9F7F2]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[var(--primary)]" />
            <div>
              <h3 className="font-extrabold text-sm text-[var(--text-primary)]">
                Record Qualification Decision
              </h3>
              <p className="text-[11px] text-[var(--text-secondary)]">
                Creates a new immutable decision version in audit history
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
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="p-3 rounded bg-red-50 border border-red-200 text-red-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Route Selector */}
          <div className="space-y-2">
            <label className="block font-bold uppercase tracking-wider text-[10px] text-[var(--text-secondary)]">
              Qualification Route Selection *
            </label>
            <div className="space-y-2">
              {routesList.map((r) => (
                <label
                  key={r.value}
                  className={`p-3 rounded-lg border flex items-start gap-3 cursor-pointer transition-colors ${
                    route === r.value
                      ? "border-[var(--primary)] bg-[#FFF4EE]"
                      : "border-[var(--border)] bg-[var(--background)] hover:bg-[#F4F1EA]"
                  }`}
                >
                  <input
                    type="radio"
                    name="route"
                    value={r.value}
                    checked={route === r.value}
                    onChange={() => setRoute(r.value)}
                    className="mt-0.5 accent-[var(--primary)]"
                  />
                  <div>
                    <span className="font-bold text-xs text-[var(--text-primary)]">
                      {r.label} ({r.value})
                    </span>
                    <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                      {r.desc}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Rationale Input */}
          <div className="space-y-1.5">
            <label className="block font-bold uppercase tracking-wider text-[10px] text-[var(--text-secondary)]">
              Human Qualification Rationale *
            </label>
            <textarea
              rows={4}
              value={rationale}
              onChange={(e) => setRationale(e.target.value)}
              placeholder="Detail why this challenge is qualified under this route..."
              className="w-full p-3 rounded bg-[var(--background)] border border-[var(--border)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
              required
            />
          </div>

          {/* Supporting Evidence Checkboxes */}
          <div className="space-y-2">
            <label className="block font-bold uppercase tracking-wider text-[10px] text-[var(--text-secondary)]">
              Link Supporting Evidence ({evidenceList.length} available)
            </label>
            {evidenceList.length === 0 ? (
              <p className="text-[11px] text-[var(--text-secondary)] italic">
                No evidence metadata currently attached to this challenge.
              </p>
            ) : (
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {evidenceList.map((ev) => (
                  <label
                    key={ev.id}
                    className="flex items-center gap-2 p-2 rounded bg-[var(--background)] border border-[var(--border)] cursor-pointer text-xs"
                  >
                    <input
                      type="checkbox"
                      checked={selectedEvidenceIds.includes(ev.id)}
                      onChange={() => toggleEvidence(ev.id)}
                      className="accent-[var(--primary)]"
                    />
                    <span className="font-medium text-[var(--text-primary)] truncate">
                      [{ev.evidence_type}] {ev.description || ev.storage_reference}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Reviewer Actor Display */}
          <div className="p-3 rounded bg-[#F2EFE9] border border-[var(--border)] flex items-center justify-between text-[11px]">
            <span className="font-semibold text-[var(--text-secondary)]">Reviewer Identity:</span>
            <span className="font-mono text-[var(--text-primary)]">{reviewerActorId}</span>
          </div>

          {/* Explicit Confirmation Banner */}
          <div className="p-3 rounded bg-[#FFF4EE] border border-[#FCD8C5] text-[11px] text-[var(--text-primary)] space-y-1">
            <p className="font-semibold">
              This creates a new qualification decision version. Previous decisions remain in the audit history.
            </p>
            {route === "INNOVATION_CHALLENGE" && (
              <p className="text-[10px] text-[var(--primary)]">
                This enables HEI candidate matching. It does not assign or commit an HEI.
              </p>
            )}
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
              {submitting ? "Recording..." : "Record Decision"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
