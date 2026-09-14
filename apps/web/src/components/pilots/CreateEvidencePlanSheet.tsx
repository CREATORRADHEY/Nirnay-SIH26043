import React, { useState } from "react";
import { X, AlertCircle } from "lucide-react";
import type {
  PilotEvidencePlanCreate,
  PilotEvidencePlanResponse,
} from "@/lib/types/challenge";
import { createPilotEvidencePlan } from "@/lib/api";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  pilotId: string;
  latestPlan: PilotEvidencePlanResponse | null;
  reviewerActorId: string;
  onPlanCreated: () => void;
}

export function CreateEvidencePlanSheet({
  isOpen,
  onClose,
  pilotId,
  latestPlan,
  reviewerActorId,
  onPlanCreated,
}: Props) {
  const [objective, setObjective] = useState(
    latestPlan?.objective || "Validate community dry-waste segregation compliance."
  );
  const [primaryMetric, setPrimaryMetric] = useState(
    latestPlan?.primary_metric || "Percentage of households adhering to dry-waste segregation"
  );
  const [baselineDefinition, setBaselineDefinition] = useState(
    latestPlan?.baseline_definition || "Pre-pilot compliance rate of 41% dry-waste segregation in Ward 4"
  );
  const [denominatorDefinition, setDenominatorDefinition] = useState(
    latestPlan?.denominator_definition || "Total 240 surveyed households receiving weekly collection"
  );
  const [dataCollectionMethod, setDataCollectionMethod] = useState(
    latestPlan?.data_collection_method || "Bi-weekly doorstep physical audit logs recorded by sanitary workers"
  );
  const [evaluationWindow, setEvaluationWindow] = useState(
    latestPlan?.evaluation_window || "30 consecutive observation days"
  );
  const [successCriteria, setSuccessCriteria] = useState(
    latestPlan?.success_criteria || "Sustained >65% compliance over 30 days"
  );
  const [limitations, setLimitations] = useState(
    latestPlan?.limitations || "Excludes unserviced informal settlements outside Municipal Ward 4 boundary"
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const latestVersion = latestPlan?.version || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerActorId) {
      setError("Demo reviewer identity is not configured.");
      return;
    }
    if (!objective.trim() || !primaryMetric.trim() || !baselineDefinition.trim() || !denominatorDefinition.trim() || !dataCollectionMethod.trim()) {
      setError("Objective, primary metric, baseline, denominator, and collection method are required.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const payload: PilotEvidencePlanCreate = {
        objective: objective.trim(),
        primary_metric: primaryMetric.trim(),
        baseline_definition: baselineDefinition.trim(),
        denominator_definition: denominatorDefinition.trim(),
        data_collection_method: dataCollectionMethod.trim(),
        evaluation_window: evaluationWindow.trim() || null,
        success_criteria: successCriteria.trim() || null,
        limitations: limitations.trim() || null,
        created_by_actor_id: reviewerActorId,
        expected_version: latestVersion,
      };

      await createPilotEvidencePlan(pilotId, payload);
      onPlanCreated();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create evidence plan.");
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
              Evaluation Rigor
            </p>
            <h3 className="text-lg font-serif font-bold text-stone-900 mt-0.5">
              {latestPlan ? `Create Evidence Plan v${latestPlan.version + 1}` : "Create Evidence Plan v1"}
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
              <span>Demo reviewer identity is not configured. Creator attribution is required.</span>
            </div>
          )}

          <div className="p-3 bg-stone-100 border border-stone-200 rounded-md text-xs text-stone-700 font-mono">
            A new version preserves previous evaluation assumptions instead of overwriting them.
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-md text-xs text-rose-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Objective */}
          <div>
            <label className="block text-xs font-mono font-semibold uppercase text-stone-700 mb-1">
              Pilot Objective
            </label>
            <textarea
              rows={2}
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#F95700]"
              placeholder="State clear objective of the pilot evaluation..."
              required
            />
          </div>

          {/* Primary Metric */}
          <div>
            <label className="block text-xs font-mono font-semibold uppercase text-stone-700 mb-1">
              Primary Metric
            </label>
            <input
              type="text"
              value={primaryMetric}
              onChange={(e) => setPrimaryMetric(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#F95700]"
              placeholder="e.g. Percentage of households adhering to dry-waste segregation"
              required
            />
          </div>

          {/* Prominent Baseline & Denominator */}
          <div className="p-4 bg-white border-2 border-stone-300 rounded-xl space-y-4 shadow-2xs">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#F95700]">
              Key Jury Evaluation Definitions
            </h4>

            <div>
              <label className="block text-xs font-mono font-bold uppercase text-stone-900 mb-1">
                Baseline Definition (Required)
              </label>
              <textarea
                rows={2}
                value={baselineDefinition}
                onChange={(e) => setBaselineDefinition(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-[#FAF8F5] border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#F95700] font-mono text-xs"
                placeholder="Declare precise pre-pilot starting value or status..."
                required
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase text-stone-900 mb-1">
                Denominator Definition (Required)
              </label>
              <textarea
                rows={2}
                value={denominatorDefinition}
                onChange={(e) => setDenominatorDefinition(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-[#FAF8F5] border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#F95700] font-mono text-xs"
                placeholder="Declare precise denominator sample size or population pool..."
                required
              />
            </div>
          </div>

          {/* Collection Method */}
          <div>
            <label className="block text-xs font-mono font-semibold uppercase text-stone-700 mb-1">
              Data Collection Method
            </label>
            <textarea
              rows={2}
              value={dataCollectionMethod}
              onChange={(e) => setDataCollectionMethod(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#F95700]"
              placeholder="Explain how telemetry and physical evidence will be gathered..."
              required
            />
          </div>

          {/* Window & Criteria */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-semibold uppercase text-stone-700 mb-1">
                Evaluation Window
              </label>
              <input
                type="text"
                value={evaluationWindow}
                onChange={(e) => setEvaluationWindow(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#F95700]"
                placeholder="e.g. 30 observation days"
              />
            </div>
            <div>
              <label className="block text-xs font-mono font-semibold uppercase text-stone-700 mb-1">
                Success Criteria
              </label>
              <input
                type="text"
                value={successCriteria}
                onChange={(e) => setSuccessCriteria(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#F95700]"
                placeholder="e.g. >65% compliance"
              />
            </div>
          </div>

          {/* Limitations */}
          <div>
            <label className="block text-xs font-mono font-semibold uppercase text-stone-700 mb-1">
              Known Limitations & Exclusions
            </label>
            <textarea
              rows={2}
              value={limitations}
              onChange={(e) => setLimitations(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#F95700]"
              placeholder="Record known sampling constraints or boundary exclusions..."
            />
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
              {isSubmitting ? "Recording..." : "Record Evidence Plan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
