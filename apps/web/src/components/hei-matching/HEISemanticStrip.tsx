"use client";

import { ChevronRight } from "lucide-react";

export function HEISemanticStrip() {
  const steps = [
    { label: "DISCOVERED", active: false },
    { label: "CANDIDATE", active: true },
    { label: "COMMITMENT", active: false },
    { label: "READINESS", active: false },
  ];

  return (
    <div className="p-4 rounded-xl border border-[var(--border)] bg-[#F9F7F2] space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        {steps.map((step, idx) => (
          <div key={step.label} className="flex items-center gap-2">
            <span
              className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded border transition-colors ${
                step.active
                  ? "bg-[var(--primary)] text-white border-[var(--primary)] shadow-xs"
                  : "bg-[var(--surface)] text-[var(--text-secondary)] border-[var(--border)]"
              }`}
            >
              {step.label}
            </span>
            {idx < steps.length - 1 && (
              <ChevronRight className="w-3.5 h-3.5 text-[var(--text-secondary)] opacity-50" />
            )}
          </div>
        ))}
      </div>
      <p className="text-[11px] text-[var(--text-secondary)] font-medium">
        Caption: <span className="italic">Matching identifies relevance. Commitment records actual intent.</span>
      </p>
    </div>
  );
}
