"use client";

import { ShieldCheck, FileCheck2, User, Clock } from "lucide-react";
import { QualificationDecisionResponse, QualificationRoute } from "@/lib/types/challenge";

interface LatestDecisionPanelProps {
  decision: QualificationDecisionResponse;
}

export function LatestDecisionPanel({ decision }: LatestDecisionPanelProps) {
  const getRouteBadgeStyle = (route: QualificationRoute) => {
    switch (route) {
      case "SERVICE":
        return "bg-slate-100 text-slate-800 border-slate-300";
      case "CLARIFY":
        return "bg-amber-50 text-amber-900 border-amber-300";
      case "RESEARCH_REVIEW":
        return "bg-sky-50 text-sky-900 border-sky-300";
      case "INNOVATION_CHALLENGE":
        return "bg-[#EBF5EE] text-[#166534] border-[#C6E7D0]";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  return (
    <div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--surface)] space-y-4 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] pb-4">
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded bg-[#F4F1EA] text-[var(--primary)]">
            <ShieldCheck className="w-5 h-5" />
          </span>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
              LATEST HUMAN DECISION
            </span>
            <h3 className="text-base font-extrabold text-[var(--text-primary)]">
              Version {decision.version} Final Decision
            </h3>
          </div>
        </div>

        <span
          className={`px-3 py-1 text-xs font-mono font-bold rounded-full border ${getRouteBadgeStyle(
            decision.route
          )}`}
        >
          {decision.route}
        </span>
      </div>

      <div className="space-y-1.5">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
          Human Qualification Rationale
        </span>
        <p className="text-xs sm:text-sm text-[var(--text-primary)] leading-relaxed font-medium">
          {decision.rationale}
        </p>
      </div>

      <div className="pt-3 border-t border-[var(--border)] grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-[var(--text-secondary)]">
        <div className="flex items-center gap-1.5 font-mono">
          <User className="w-3.5 h-3.5 text-[var(--primary)]" />
          <span>Decided By: {decision.decided_by_actor_id.slice(0, 13)}...</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
          <span>{new Date(decision.decided_at).toLocaleString("en-IN")}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <FileCheck2 className="w-3.5 h-3.5 text-[var(--success)]" />
          <span>{decision.evidence_ids.length} Linked Evidence Items</span>
        </div>
      </div>
    </div>
  );
}
