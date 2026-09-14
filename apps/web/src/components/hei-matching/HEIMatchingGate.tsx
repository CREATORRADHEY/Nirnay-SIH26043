"use client";

import { Lock } from "lucide-react";
import { QualificationRoute } from "@/lib/types/challenge";

interface HEIMatchingGateProps {
  currentRoute?: QualificationRoute | null;
}

export function HEIMatchingGate({ currentRoute }: HEIMatchingGateProps) {
  return (
    <div className="p-8 sm:p-12 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-center space-y-4 max-w-2xl mx-auto shadow-xs">
      <div className="w-12 h-12 rounded-full bg-[#FFF4EE] border border-[#FCD8C5] text-[var(--primary)] flex items-center justify-center mx-auto">
        <Lock className="w-6 h-6" />
      </div>

      <div className="space-y-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--primary)] bg-[#FFF4EE] px-2.5 py-1 rounded border border-[#FCD8C5]">
          WORKFLOW GATED
        </span>
        <h3 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">
          HEI matching opens after the challenge is qualified as an Innovation Challenge.
        </h3>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed max-w-lg mx-auto">
          Currently, this challenge has{" "}
          {currentRoute ? (
            <span className="font-bold text-[var(--text-primary)]">
              qualification status: {currentRoute}
            </span>
          ) : (
            <span className="font-bold text-[var(--text-primary)]">
              no human qualification decision recorded
            </span>
          )}
          . Qualification separates service requests, clarification needs, and research reviews before matching higher-education capability.
        </p>
      </div>

      <div className="pt-3 border-t border-[var(--border)] text-xs text-[var(--text-secondary)]">
        <span>To unlock candidate matching, record a qualification decision specifying </span>
        <code className="font-mono text-[var(--primary)] font-bold">INNOVATION_CHALLENGE</code>.
      </div>
    </div>
  );
}
