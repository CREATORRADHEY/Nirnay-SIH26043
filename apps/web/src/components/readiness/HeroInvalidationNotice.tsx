import React from "react";
import { AlertTriangle } from "lucide-react";
import type { CommitmentResponse, ReadinessDecisionResponse } from "@/lib/types/challenge";

interface Props {
  latestDecision: ReadinessDecisionResponse | null;
  commitments: CommitmentResponse[];
  decisions: ReadinessDecisionResponse[];
}

export function HeroInvalidationNotice({ latestDecision, commitments }: Props) {
  if (!latestDecision || latestDecision.status !== "REVIEW_REQUIRED") {
    return null;
  }

  // Find the triggered commitment if present
  const triggeredCommitment = commitments.find(
    (c) => c.id === latestDecision.triggered_by_commitment_id
  );

  // Find original commitment version relied on in earlier series if available
  let previousCommitmentStr = "Commitment v1 — ACCEPTED";
  const changedCommitmentStr = triggeredCommitment
    ? `Commitment v${triggeredCommitment.version} — ${triggeredCommitment.status}`
    : "Commitment Series Updated";

  if (triggeredCommitment) {
    const orgId = triggeredCommitment.organization_id;
    const type = triggeredCommitment.commitment_type;
    const earlierInSeries = commitments
      .filter((c) => c.organization_id === orgId && c.commitment_type === type && c.version < triggeredCommitment.version)
      .sort((a, b) => b.version - a.version)[0];
    if (earlierInSeries) {
      previousCommitmentStr = `Commitment v${earlierInSeries.version} — ${earlierInSeries.status}`;
    }
  }

  return (
    <div className="bg-[#FAF8F5] border-2 border-amber-400/80 rounded-xl p-6 my-6 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-amber-100 rounded-lg text-amber-900 shrink-0 mt-0.5">
          <AlertTriangle className="w-5 h-5 text-amber-700" />
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-base font-serif font-bold text-stone-900">
              Readiness requires review
            </h3>
            <span className="text-xs font-mono font-bold bg-amber-200 text-amber-950 px-2.5 py-1 rounded border border-amber-300">
              SYSTEM INTEGRITY RE-OPEN
            </span>
          </div>

          <p className="text-sm text-stone-700 mt-2 leading-relaxed">
            A commitment used in the previous readiness decision has changed. NIRNAY preserved the earlier decision and reopened readiness instead of silently treating the pilot as ready.
          </p>

          {/* Two-column before/after dependency comparison */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 bg-white border border-amber-300 rounded-lg p-4 font-mono text-xs">
            <div className="p-3 bg-stone-50 border border-stone-200 rounded">
              <span className="text-stone-500 uppercase tracking-wider font-semibold block mb-1">
                Relied on in previous PILOT_READY:
              </span>
              <p className="text-stone-900 font-bold text-sm">
                {previousCommitmentStr}
              </p>
              <p className="text-stone-500 text-[11px] mt-1">
                Verified as satisfied requirement during earlier human review.
              </p>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded">
              <span className="text-amber-800 uppercase tracking-wider font-semibold block mb-1">
                Changed to:
              </span>
              <p className="text-amber-950 font-bold text-sm">
                {changedCommitmentStr}
              </p>
              <p className="text-amber-800 text-[11px] mt-1">
                Dependency invalidated. Human re-review required.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
