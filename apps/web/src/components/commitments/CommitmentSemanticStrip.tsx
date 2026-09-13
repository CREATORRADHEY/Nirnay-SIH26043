import React from "react";
import { ArrowRight, FileCheck } from "lucide-react";

export function CommitmentSemanticStrip() {
  return (
    <div className="bg-[#FAF8F5] border border-stone-200 rounded-lg p-4 my-6">
      <div className="flex flex-wrap items-center gap-2 text-xs font-mono font-medium text-stone-500 mb-2">
        <span className="text-stone-400">DISCOVERED</span>
        <ArrowRight className="w-3 h-3 text-stone-300" />
        <span className="text-stone-400">CANDIDATE</span>
        <ArrowRight className="w-3 h-3 text-stone-300" />
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#F95700]/10 text-[#F95700] font-semibold border border-[#F95700]/30">
          <FileCheck className="w-3.5 h-3.5" />
          COMMITMENT
        </span>
        <ArrowRight className="w-3 h-3 text-stone-300" />
        <span className="text-stone-400">READINESS</span>
      </div>
      <p className="text-xs text-stone-600 italic">
        &quot;Matching identifies relevance. Commitment records actual intent.&quot;
      </p>
    </div>
  );
}
