import React from "react";
import { OperationalStatusBadge, EvidenceConclusionBadge } from "./PilotBadges";
import type { OperationalStatus, EvidenceConclusion } from "@/lib/types/challenge";

interface Props {
  opStatus: OperationalStatus;
  conclusion: EvidenceConclusion;
}

export function PilotSeparationPanel({ opStatus, conclusion }: Props) {
  return (
    <div className="bg-[#FAF8F5] border border-stone-300 rounded-xl p-6 my-6 space-y-4 shadow-2xs">
      <div className="text-center pb-2">
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#F95700]">
          CANONICAL BOUNDARY SEPARATION
        </span>
        <h4 className="text-base font-serif font-bold text-stone-900 mt-0.5">
          Execution Status vs. Evidence Conclusion
        </h4>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
        {/* Column 1: Execution */}
        <div className="p-4 bg-white border border-stone-200 rounded-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-stone-500 font-bold uppercase tracking-wider">EXECUTION</span>
            <OperationalStatusBadge status={opStatus} size="sm" />
          </div>
          <p className="text-stone-900 font-serif font-bold text-sm">
            Operational State: {opStatus}
          </p>
          <p className="text-stone-600 font-sans text-xs leading-relaxed">
            {opStatus === "COMPLETED" && "The planned pilot deployment activity reached completion."}
            {opStatus === "ACTIVE" && "The pilot is currently undergoing active field execution."}
            {opStatus === "PLANNED" && "The pilot is scheduled and awaiting field launch."}
            {opStatus === "STOPPED" && "The pilot was operationally halted prior to completion."}
          </p>
        </div>

        {/* Column 2: Evidence */}
        <div className="p-4 bg-white border border-stone-200 rounded-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-stone-500 font-bold uppercase tracking-wider">EVIDENCE</span>
            <EvidenceConclusionBadge conclusion={conclusion} size="sm" />
          </div>
          <p className="text-stone-900 font-serif font-bold text-sm">
            Evidence Conclusion: {conclusion}
          </p>
          <p className="text-stone-600 font-sans text-xs leading-relaxed">
            {conclusion === "VALIDATED" && "Collected evidence supports the pre-declared outcome hypothesis."}
            {conclusion === "INCONCLUSIVE" && "The available evidence does not support a definitive impact claim."}
            {conclusion === "ITERATE" && "Evidence indicates pilot parameters need refinement before scale."}
            {conclusion === "NOT_REVIEWED" && "Pilot evidence has not undergone formal outcome review yet."}
          </p>
        </div>
      </div>

      <div className="p-3 bg-stone-900 text-stone-100 rounded-lg text-center font-serif text-xs font-semibold tracking-wide">
        &quot;Completion is not impact.&quot;
      </div>
    </div>
  );
}
