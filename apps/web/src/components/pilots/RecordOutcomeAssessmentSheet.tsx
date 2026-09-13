import React, { useState } from "react";
import { X, AlertCircle, Check, FileText } from "lucide-react";
import { EvidenceConclusionBadge } from "./PilotBadges";
import type {
  EvidenceConclusion,
  OutcomeAssessmentCreate,
  PilotEvidencePlanResponse,
  OutcomeAssessmentResponse,
  EvidenceResponse,
} from "@/lib/types/challenge";
import { createOutcomeAssessment } from "@/lib/api";

const CONCLUSIONS: EvidenceConclusion[] = [
  "NOT_REVIEWED",
  "VALIDATED",
  "ITERATE",
  "INCONCLUSIVE",
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  pilotId: string;
  evidencePlans: PilotEvidencePlanResponse[];
  latestOutcome: OutcomeAssessmentResponse | null;
  evidenceItems: EvidenceResponse[];
  reviewerActorId: string;
  onOutcomeCreated: () => void;
}

export function RecordOutcomeAssessmentSheet({
  isOpen,
  onClose,
  pilotId,
  evidencePlans,
  latestOutcome,
  evidenceItems,
  reviewerActorId,
  onOutcomeCreated,
}: Props) {
  const latestPlan = evidencePlans.length > 0 ? evidencePlans[evidencePlans.length - 1] : null;
  const [selectedPlanId, setSelectedPlanId] = useState<string>(latestPlan?.id || "");
  const [conclusion, setConclusion] = useState<EvidenceConclusion>("INCONCLUSIVE");
  const [summary, setSummary] = useState("");
  const [limitations, setLimitations] = useState(
    "The denominator changed during the observation period, so the final measurement is not directly comparable with the pre-declared baseline."
  );
  const [selectedEvidenceIds, setSelectedEvidenceIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const activePlan = evidencePlans.find((p) => p.id === (selectedPlanId || latestPlan?.id)) || latestPlan;
  const latestVersion = latestOutcome?.version || 0;

  const toggleEvidence = (id: string) => {
    setSelectedEvidenceIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePlan) {
      setError("An Evidence Plan is required before recording an outcome assessment.");
      return;
    }
    if (conclusion !== "NOT_REVIEWED" && !reviewerActorId) {
      setError(`Conclusion ${conclusion} requires human actor attribution.`);
      return;
    }
    if (!summary.trim()) {
      setError("Summary is required.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const payload: OutcomeAssessmentCreate = {
        evidence_plan_id: activePlan.id,
        conclusion,
        summary: summary.trim(),
        limitations: limitations.trim() || null,
        assessed_by_actor_id: conclusion === "NOT_REVIEWED" ? null : reviewerActorId,
        evidence_ids: selectedEvidenceIds,
        expected_version: latestVersion,
      };

      await createOutcomeAssessment(pilotId, payload);
      onOutcomeCreated();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to record outcome assessment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-xl bg-[#FAF8F5] h-full shadow-2xl flex flex-col border-l border-stone-300">
        {/* Header */}
        <div className="p-6 border-b border-stone-200 flex items-center justify-between bg-white">
          <div>
            <p className="text-xs font-mono font-semibold uppercase tracking-wider text-[#F95700]">
              Human Outcome Evaluation
            </p>
            <h3 className="text-lg font-serif font-bold text-stone-900 mt-0.5">
              Record Outcome Assessment
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
          {conclusion !== "NOT_REVIEWED" && !reviewerActorId && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-md text-xs text-amber-900 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>Demo reviewer identity is not configured. Human attribution is required for non-NOT_REVIEWED conclusions.</span>
            </div>
          )}

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-md text-xs text-rose-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Evidence Plan selection */}
          <div>
            <label className="block text-xs font-mono font-semibold uppercase text-stone-700 mb-1">
              Evidence Plan Evaluated
            </label>
            {evidencePlans.length === 0 ? (
              <p className="text-xs text-rose-600 font-mono italic">
                No Evidence Plan found. Please create an Evidence Plan first.
              </p>
            ) : (
              <select
                value={selectedPlanId || latestPlan?.id}
                onChange={(e) => setSelectedPlanId(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#F95700]"
              >
                {evidencePlans.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    Evidence Plan v{plan.version} — {plan.primary_metric}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Traceability Context Box */}
          {activePlan && (
            <div className="p-4 bg-white border border-stone-300 rounded-lg space-y-2 font-mono text-xs shadow-2xs">
              <div className="flex items-center justify-between text-[#F95700] font-bold">
                <span>EVIDENCE PLAN BASIS v{activePlan.version}</span>
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <span className="text-stone-500 font-semibold block">Primary Metric:</span>
                <span className="text-stone-900">{activePlan.primary_metric}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-stone-200 text-[11px]">
                <div>
                  <span className="text-stone-500 font-semibold block">Baseline:</span>
                  <span className="text-stone-800">{activePlan.baseline_definition}</span>
                </div>
                <div>
                  <span className="text-stone-500 font-semibold block">Denominator:</span>
                  <span className="text-stone-800">{activePlan.denominator_definition}</span>
                </div>
              </div>
            </div>
          )}

          {/* Conclusion Choice */}
          <div>
            <label className="block text-xs font-mono font-semibold uppercase text-stone-700 mb-2">
              Evidence Conclusion
            </label>
            <div className="space-y-2">
              {CONCLUSIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setConclusion(c)}
                  className={`w-full p-3 rounded-md border text-left flex items-center justify-between transition-colors ${
                    conclusion === c
                      ? "bg-white border-[#F95700] ring-1 ring-[#F95700] shadow-xs"
                      : "bg-white border-stone-200 hover:bg-stone-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <EvidenceConclusionBadge conclusion={c} size="sm" />
                    <span className="text-xs text-stone-600 font-sans">
                      {c === "NOT_REVIEWED" && "Default state prior to formal human evaluation."}
                      {c === "VALIDATED" && "Evidence supports pre-declared outcome hypothesis."}
                      {c === "ITERATE" && "Refinement needed before scale."}
                      {c === "INCONCLUSIVE" && "Available evidence does not support a definitive impact claim."}
                    </span>
                  </div>
                  {conclusion === c && <Check className="w-4 h-4 text-[#F95700]" />}
                </button>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div>
            <label className="block text-xs font-mono font-semibold uppercase text-stone-700 mb-1">
              Assessment Summary
            </label>
            <textarea
              rows={3}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#F95700]"
              placeholder="State clear human outcome evaluation summary..."
              required
            />
          </div>

          {/* Limitations */}
          <div>
            <label className="block text-xs font-mono font-semibold uppercase text-stone-700 mb-1">
              Evaluation Limitations & Discrepancies
            </label>
            <textarea
              rows={3}
              value={limitations}
              onChange={(e) => setLimitations(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#F95700]"
              placeholder="Record any baseline/denominator shifts or observational limitations..."
            />
          </div>

          {/* Supporting Evidence Selection */}
          <div>
            <label className="block text-xs font-mono font-semibold uppercase text-stone-700 mb-1">
              Supporting Challenge Evidence Records (Optional)
            </label>
            {evidenceItems.length === 0 ? (
              <p className="text-xs text-stone-400 font-mono italic">No evidence records submitted yet.</p>
            ) : (
              <div className="max-h-36 overflow-y-auto space-y-1.5 p-2 bg-white border border-stone-300 rounded-md">
                {evidenceItems.map((ev) => {
                  const isChecked = selectedEvidenceIds.includes(ev.id);
                  return (
                    <label
                      key={ev.id}
                      className={`flex items-start gap-2.5 p-2 rounded text-xs cursor-pointer transition-colors ${
                        isChecked ? "bg-amber-50 border border-amber-300" : "hover:bg-stone-50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleEvidence(ev.id)}
                        className="mt-0.5 rounded text-[#F95700] focus:ring-[#F95700]"
                      />
                      <div className="font-mono text-stone-800">
                        <span className="font-bold">[{ev.evidence_type}]</span> {ev.description || ev.storage_reference}
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
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
              disabled={isSubmitting || !activePlan || (conclusion !== "NOT_REVIEWED" && !reviewerActorId)}
              className="px-5 py-2 text-sm font-semibold bg-[#F95700] text-white rounded-md hover:bg-[#d84b00] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-colors"
            >
              {isSubmitting ? "Recording..." : "Record Outcome Assessment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
