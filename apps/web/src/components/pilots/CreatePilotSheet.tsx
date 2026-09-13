import React, { useState } from "react";
import { X, AlertCircle, ShieldCheck } from "lucide-react";
import type {
  PilotCreate,
  ReadinessDecisionResponse,
  HEIOrganization,
} from "@/lib/types/challenge";
import { createPilot } from "@/lib/api";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  challengeId: string;
  latestReadinessDecision: ReadinessDecisionResponse | null;
  organizations: HEIOrganization[];
  reviewerActorId: string;
  onPilotCreated: (pilotId: string) => void;
}

export function CreatePilotSheet({
  isOpen,
  onClose,
  challengeId,
  latestReadinessDecision,
  organizations,
  reviewerActorId,
  onPilotCreated,
}: Props) {
  const [name, setName] = useState("");
  const [hostOrgId, setHostOrgId] = useState("");
  const [siteDescription, setSiteDescription] = useState("");
  const [plannedStart, setPlannedStart] = useState("");
  const [plannedEnd, setPlannedEnd] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const isPilotReady = latestReadinessDecision?.status === "PILOT_READY";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerActorId) {
      setError("Demo reviewer identity is not configured.");
      return;
    }
    if (!isPilotReady || !latestReadinessDecision) {
      setError("Pilot creation requires current human PILOT_READY authorization.");
      return;
    }
    if (!name.trim()) {
      setError("Pilot name is required.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const payload: PilotCreate = {
        authorized_by_readiness_decision_id: latestReadinessDecision.id,
        host_organization_id: hostOrgId || null,
        name: name.trim(),
        site_description: siteDescription.trim() || null,
        planned_start: plannedStart ? new Date(plannedStart).toISOString() : null,
        planned_end: plannedEnd ? new Date(plannedEnd).toISOString() : null,
        created_by_actor_id: reviewerActorId,
      };

      const res = await createPilot(challengeId, payload);
      onPilotCreated(res.data.id);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create pilot.");
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
              Pilot Authorization Gate
            </p>
            <h3 className="text-lg font-serif font-bold text-stone-900 mt-0.5">
              Create Field Pilot
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
              <span>Demo reviewer identity is not configured. Creator attribution is required.</span>
            </div>
          )}

          {!isPilotReady && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-md text-xs text-rose-900 flex items-start gap-2 font-mono">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Pilot Creation Disabled</p>
                <p className="mt-1">
                  {latestReadinessDecision?.status === "REVIEW_REQUIRED" &&
                    "Pilot creation is paused because readiness requires review."}
                  {latestReadinessDecision?.status === "BLOCKED" &&
                    "Pilot readiness is currently blocked."}
                  {latestReadinessDecision?.status === "REVIEW_READY" &&
                    "Human pilot authorization has not been recorded."}
                  {!latestReadinessDecision &&
                    "No pilot readiness decision has been recorded."}
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-md text-xs text-rose-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Authorization Basis Context Box */}
          {latestReadinessDecision && (
            <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-lg text-xs font-mono text-emerald-950 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>Authorized Basis: PILOT_READY v{latestReadinessDecision.version}</span>
              </div>
              <p className="text-[11px] text-emerald-800">
                Decision ID: {latestReadinessDecision.id}
              </p>
              <p className="text-[11px] text-emerald-800">
                Rationale: {latestReadinessDecision.rationale}
              </p>
            </div>
          )}

          {/* Pilot Name */}
          <div>
            <label className="block text-xs font-mono font-semibold uppercase text-stone-700 mb-1">
              Pilot Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#F95700]"
              placeholder="e.g. Ranchi Ward 4 Water Testing Deployment"
              required
              disabled={!isPilotReady}
            />
          </div>

          {/* Host Organization */}
          <div>
            <label className="block text-xs font-mono font-semibold uppercase text-stone-700 mb-1">
              Host Organization (Optional)
            </label>
            <select
              value={hostOrgId}
              onChange={(e) => setHostOrgId(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#F95700]"
              disabled={!isPilotReady}
            >
              <option value="">-- Select Host Institution --</option>
              {organizations.map((org) => (
                <option key={org.organization_id} value={org.organization_id}>
                  {org.name} ({org.state})
                </option>
              ))}
            </select>
          </div>

          {/* Site Description */}
          <div>
            <label className="block text-xs font-mono font-semibold uppercase text-stone-700 mb-1">
              Site Description & Location Details
            </label>
            <textarea
              rows={3}
              value={siteDescription}
              onChange={(e) => setSiteDescription(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#F95700]"
              placeholder="Describe physical deployment ward, laboratory, or community site..."
              disabled={!isPilotReady}
            />
          </div>

          {/* Planned Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-semibold uppercase text-stone-700 mb-1">
                Planned Start
              </label>
              <input
                type="date"
                value={plannedStart}
                onChange={(e) => setPlannedStart(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#F95700]"
                disabled={!isPilotReady}
              />
            </div>
            <div>
              <label className="block text-xs font-mono font-semibold uppercase text-stone-700 mb-1">
                Planned End
              </label>
              <input
                type="date"
                value={plannedEnd}
                onChange={(e) => setPlannedEnd(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#F95700]"
                disabled={!isPilotReady}
              />
            </div>
          </div>

          {/* Confirmation note */}
          <div className="p-3 bg-stone-100 rounded-md border border-stone-200 text-xs text-stone-600 font-mono">
            This pilot will be authorized from the current human PILOT_READY decision.
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
              disabled={isSubmitting || !isPilotReady || !reviewerActorId}
              className="px-5 py-2 text-sm font-semibold bg-[#F95700] text-white rounded-md hover:bg-[#d84b00] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-colors"
            >
              {isSubmitting ? "Creating..." : "Create Field Pilot"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
