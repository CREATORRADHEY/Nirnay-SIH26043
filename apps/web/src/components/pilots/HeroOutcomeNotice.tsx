import React from "react";
import { AlertCircle, Info } from "lucide-react";
import type { OperationalStatus, EvidenceConclusion } from "@/lib/types/challenge";

interface Props {
  opStatus: OperationalStatus;
  conclusion: EvidenceConclusion;
  limitations?: string | null;
}

export function HeroOutcomeNotice({ opStatus, conclusion, limitations }: Props) {
  if (conclusion !== "INCONCLUSIVE") return null;

  const isCompleted = opStatus === "COMPLETED";
  const isStopped = opStatus === "STOPPED";

  return (
    <div className="bg-[#FAF8F5] border-2 border-amber-300 rounded-xl p-6 my-6 shadow-2xs">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-amber-100 rounded-lg text-amber-900 shrink-0 mt-0.5">
          <AlertCircle className="w-5 h-5 text-amber-700" />
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-base font-serif font-bold text-stone-900">
              {isCompleted
                ? "Completed, but not proven."
                : isStopped
                ? "Stopped, evidence inconclusive."
                : "Outcome assessment: INCONCLUSIVE"}
            </h3>
            <span className="text-xs font-mono font-bold bg-amber-200 text-amber-950 px-2.5 py-1 rounded border border-amber-300">
              INCONCLUSIVE EVIDENCE
            </span>
          </div>

          <p className="text-sm text-stone-800 leading-relaxed font-sans">
            {isCompleted &&
              "The pilot finished operationally, but the evidence basis changed. NIRNAY records the result as INCONCLUSIVE rather than converting completion into an impact claim."}
            {isStopped &&
              "The pilot operationally stopped before completion. Available evidence is recorded as INCONCLUSIVE rather than assuming failure."}
            {!isCompleted &&
              !isStopped &&
              "The recorded outcome assessment conclusion is INCONCLUSIVE."}
          </p>

          {limitations && (
            <div className="mt-3 p-3 bg-white border border-amber-200 rounded-md font-mono text-xs text-stone-700 space-y-1">
              <span className="font-bold text-amber-900 flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-amber-700" />
                Evidence Limitations Rationale:
              </span>
              <p className="text-stone-800 font-sans italic">{limitations}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
