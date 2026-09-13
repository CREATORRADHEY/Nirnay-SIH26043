import React from "react";
import { Plus, Clock, Cpu, UserCheck } from "lucide-react";
import { ReadinessStatusBadge } from "./ReadinessStatusBadge";
import type { ReadinessDecisionResponse } from "@/lib/types/challenge";

interface Props {
  latestDecision: ReadinessDecisionResponse | null;
  onOpenRecordDecisionSheet: () => void;
  reviewerActorId: string;
}

export function ReadinessOverviewPanel({
  latestDecision,
  onOpenRecordDecisionSheet,
  reviewerActorId,
}: Props) {
  const isSystem = latestDecision && (latestDecision.status === "REVIEW_REQUIRED" || !latestDecision.decided_by_actor_id);

  return (
    <div className="bg-white border border-stone-200 rounded-lg p-6 my-6 shadow-2xs">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#F95700]">
            CURRENT READINESS STATE
          </span>
          <h3 className="text-lg font-serif font-bold text-stone-900 mt-0.5">
            {latestDecision ? `Status: ${latestDecision.status}` : "Pilot readiness has not been reviewed yet."}
          </h3>
        </div>
        <button
          onClick={onOpenRecordDecisionSheet}
          disabled={!reviewerActorId}
          title={!reviewerActorId ? "Demo reviewer identity is not configured." : undefined}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-[#F95700] text-white rounded-md hover:bg-[#d84b00] disabled:opacity-50 disabled:cursor-not-allowed shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          Record Readiness Decision
        </button>
      </div>

      {latestDecision ? (
        <div className="pt-4 space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <ReadinessStatusBadge status={latestDecision.status} size="lg" />
            <span className="font-mono text-xs font-bold text-stone-700 bg-stone-100 px-2.5 py-1 rounded border border-stone-200">
              Version {latestDecision.version}
            </span>
            <span className="text-xs font-mono text-stone-500 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-stone-400" />
              {new Date(latestDecision.created_at).toLocaleString()}
            </span>
          </div>

          <p className="text-sm text-stone-800 leading-relaxed font-sans bg-[#FAF8F5] p-3 rounded-md border border-stone-200">
            {latestDecision.rationale}
          </p>

          <div className="text-xs font-mono text-stone-500 flex items-center justify-between pt-1">
            <span className="flex items-center gap-1.5">
              {isSystem ? (
                <>
                  <Cpu className="w-3.5 h-3.5 text-amber-600" />
                  Attribution: <span className="font-semibold text-amber-900">System integrity check</span>
                </>
              ) : (
                <>
                  <UserCheck className="w-3.5 h-3.5 text-stone-400" />
                  Attribution:{" "}
                  <span className="font-semibold text-stone-900">
                    {latestDecision.decided_by_actor_id
                      ? `${latestDecision.decided_by_actor_id.slice(0, 8)}...`
                      : "Human Reviewer"}
                  </span>
                </>
              )}
            </span>
          </div>
        </div>
      ) : (
        <div className="pt-4 text-xs text-stone-500 italic">
          No readiness decision has been authorized yet. Review conditions below and record a human decision.
        </div>
      )}
    </div>
  );
}
