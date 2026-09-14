import React from "react";
import type { OperationalStatus, EvidenceConclusion } from "@/lib/types/challenge";

const OPERATIONAL_STYLES: Record<OperationalStatus, string> = {
  PLANNED: "bg-stone-100 text-stone-800 border-stone-300",
  ACTIVE: "bg-sky-50 text-sky-900 border-sky-300 font-bold",
  COMPLETED: "bg-stone-200 text-stone-900 border-stone-400 font-bold",
  STOPPED: "bg-amber-100 text-amber-950 border-amber-400 font-bold",
};

const EVIDENCE_STYLES: Record<EvidenceConclusion, string> = {
  NOT_REVIEWED: "bg-stone-100 text-stone-600 border-stone-200",
  VALIDATED: "bg-emerald-100 text-emerald-950 border-emerald-400 font-bold",
  ITERATE: "bg-amber-100 text-amber-950 border-amber-400 font-bold",
  INCONCLUSIVE: "bg-[#FAF8F5] text-stone-900 border-amber-400 font-bold",
};

export function OperationalStatusBadge({
  status,
  size = "md",
}: {
  status: OperationalStatus;
  size?: "sm" | "md" | "lg";
}) {
  const styles = OPERATIONAL_STYLES[status] || OPERATIONAL_STYLES.PLANNED;
  const padding = size === "lg" ? "px-3 py-1.5 text-sm" : size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs";

  return (
    <span className={`inline-flex items-center font-mono rounded border ${styles} ${padding}`}>
      {status}
    </span>
  );
}

export function EvidenceConclusionBadge({
  conclusion,
  size = "md",
}: {
  conclusion: EvidenceConclusion;
  size?: "sm" | "md" | "lg";
}) {
  const styles = EVIDENCE_STYLES[conclusion] || EVIDENCE_STYLES.NOT_REVIEWED;
  const padding = size === "lg" ? "px-3 py-1.5 text-sm" : size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs";

  return (
    <span className={`inline-flex items-center font-mono rounded border ${styles} ${padding}`}>
      {conclusion}
    </span>
  );
}
