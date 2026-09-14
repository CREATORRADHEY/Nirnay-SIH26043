"use client";

import { History } from "lucide-react";
import { QualificationDecisionResponse } from "@/lib/types/challenge";

interface DecisionTimelineProps {
  history: QualificationDecisionResponse[];
}

export function DecisionTimeline({ history }: DecisionTimelineProps) {
  if (history.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
        <History className="w-4 h-4 text-[var(--primary)]" />
        <span>Qualification Audit History ({history.length})</span>
      </div>

      <div className="relative border-l-2 border-[var(--border)] ml-3 space-y-6 pl-5 py-1">
        {history.map((dec) => (
          <div key={dec.id} className="relative group">
            {/* Timeline bullet */}
            <span className="absolute -left-[27px] top-1.5 w-3 h-3 rounded-full bg-[var(--primary)] border-2 border-white ring-2 ring-[var(--border)]" />

            <div className="p-4 rounded-lg border border-[var(--border)] bg-[var(--surface)] space-y-2 hover:border-[var(--primary)] transition-colors">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[var(--text-primary)]">
                    Version {dec.version}
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-mono font-semibold rounded bg-[#FFF4EE] text-[var(--primary)] border border-[#FCD8C5]">
                    {dec.route}
                  </span>
                </div>
                <span className="text-[11px] text-[var(--text-secondary)] font-mono">
                  {new Date(dec.decided_at).toLocaleDateString("en-IN")}
                </span>
              </div>

              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {dec.rationale}
              </p>

              <div className="flex flex-wrap items-center justify-between text-[11px] text-[var(--text-secondary)] pt-2 border-t border-[#F0EDF3] font-mono">
                <span>Actor: {dec.decided_by_actor_id.slice(0, 13)}...</span>
                <span>Evidence linked: {dec.evidence_ids.length}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
