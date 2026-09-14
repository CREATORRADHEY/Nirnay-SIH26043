import React from "react";
import type { CommitmentStatus } from "@/lib/types/challenge";

const STATUS_STYLES: Record<CommitmentStatus, string> = {
  PROPOSED: "bg-stone-100 text-stone-700 border-stone-300",
  OFFERED: "bg-sky-50 text-sky-800 border-sky-200",
  ACCEPTED: "bg-emerald-50 text-emerald-800 border-emerald-200",
  DECLINED: "bg-rose-50 text-rose-800 border-rose-200",
  WITHDRAWN: "bg-amber-50 text-amber-900 border-amber-300",
  EXPIRED: "bg-stone-100 text-stone-600 border-stone-200",
};

interface Props {
  status: CommitmentStatus;
  size?: "sm" | "md";
}

export function CommitmentStatusBadge({ status, size = "md" }: Props) {
  const styles = STATUS_STYLES[status] || STATUS_STYLES.PROPOSED;
  const padding = size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs";

  return (
    <span className={`inline-flex items-center font-mono font-semibold rounded border ${styles} ${padding}`}>
      {status}
    </span>
  );
}
