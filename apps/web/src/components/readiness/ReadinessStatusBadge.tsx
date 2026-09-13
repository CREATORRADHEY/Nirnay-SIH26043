import React from "react";
import type { ReadinessStatus, ConditionStatus } from "@/lib/types/challenge";

const READINESS_STYLES: Record<ReadinessStatus, string> = {
  BLOCKED: "bg-rose-100 text-rose-900 border-rose-300",
  REVIEW_READY: "bg-[#0A2540]/10 text-[#0A2540] border-[#0A2540]/30",
  PILOT_READY: "bg-emerald-100 text-emerald-950 border-emerald-400",
  REVIEW_REQUIRED: "bg-amber-100 text-amber-950 border-amber-400 animate-pulse",
};

const CONDITION_STYLES: Record<ConditionStatus, string> = {
  SATISFIED: "bg-emerald-50 text-emerald-800 border-emerald-200",
  UNSATISFIED: "bg-rose-50 text-rose-800 border-rose-200",
  UNKNOWN: "bg-stone-100 text-stone-600 border-stone-200",
  DISPUTED: "bg-amber-50 text-amber-900 border-amber-300",
  EXPIRED: "bg-stone-100 text-stone-600 border-stone-300",
};

export function ReadinessStatusBadge({ status, size = "md" }: { status: ReadinessStatus; size?: "sm" | "md" | "lg" }) {
  const styles = READINESS_STYLES[status] || READINESS_STYLES.BLOCKED;
  const padding = size === "lg" ? "px-3 py-1.5 text-sm" : size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs";

  return (
    <span className={`inline-flex items-center font-mono font-bold rounded border ${styles} ${padding}`}>
      {status}
    </span>
  );
}

export function ConditionStatusBadge({ status, size = "md" }: { status: ConditionStatus; size?: "sm" | "md" }) {
  const styles = CONDITION_STYLES[status] || CONDITION_STYLES.UNKNOWN;
  const padding = size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs";

  return (
    <span className={`inline-flex items-center font-mono font-semibold rounded border ${styles} ${padding}`}>
      {status}
    </span>
  );
}
