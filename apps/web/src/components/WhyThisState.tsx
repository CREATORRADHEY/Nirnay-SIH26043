"use client";

import React, { useState } from "react";
import Link from "next/link";

export interface WhyThisStateProps {
  currentState: string;
  previousState?: string | null;
  whatHappened: string;
  triggerEvent?: string | null;
  nextActionLabel?: string | null;
  nextActionHref?: string | null;
  onNextActionClick?: () => void;
  roleAllowed?: boolean;

  // Decision Assurance Props (P5.2)
  assuranceStatus?: "SINGLE_REVIEWED" | "SECOND_REVIEW_PENDING" | "AGREED" | "DISAGREED" | "RESOLVED" | string | null;
  assuranceRationale?: string | null;
  evidenceBasisCount?: number | null;
  aiAgreementStatus?: "AGREEMENT" | "DISAGREEMENT" | "NOT_APPLICABLE" | string | null;
}

export const WhyThisState: React.FC<WhyThisStateProps> = ({
  currentState,
  previousState,
  whatHappened,
  triggerEvent,
  nextActionLabel,
  nextActionHref,
  onNextActionClick,
  roleAllowed = true,
  assuranceStatus,
  assuranceRationale,
  evidenceBasisCount,
  aiAgreementStatus,
}) => {
  const [showDetails, setShowDetails] = useState(false);

  const getBadgeStyle = (state: string) => {
    switch (state.toUpperCase()) {
      case "PILOT_READY":
      case "ACCEPTED":
      case "COMPLETED":
      case "VALIDATED":
        return "bg-emerald-100 text-emerald-900 border-emerald-300";
      case "REVIEW_REQUIRED":
      case "AWAITING_CLARIFICATION":
      case "CLARIFY":
      case "WITHDRAWN":
      case "INCONCLUSIVE":
        return "bg-amber-100 text-amber-950 border-amber-400 font-bold";
      case "BLOCKED":
      case "DECLINED":
      case "STOPPED":
        return "bg-rose-100 text-rose-900 border-rose-300";
      case "INNOVATION_CHALLENGE":
      case "ACTIVE":
      case "HEI_CANDIDATES_IDENTIFIED":
      case "COMMITMENT_RECORDED":
        return "bg-blue-100 text-blue-900 border-blue-300";
      default:
        return "bg-stone-100 text-stone-800 border-stone-300";
    }
  };

  return (
    <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden my-4">
      {/* State Header Bar */}
      <div className="bg-stone-900 px-5 py-3 flex flex-wrap items-center justify-between gap-3 text-white">
        <div className="flex items-center space-x-3 flex-wrap">
          <span className="text-[11px] font-mono uppercase tracking-widest text-amber-400 font-bold">
            Current State
          </span>
          <span
            className={`px-3 py-1 text-xs font-mono font-extrabold rounded-md border uppercase tracking-wide ${getBadgeStyle(
              currentState
            )}`}
          >
            {currentState.replace(/_/g, " ")}
          </span>

          {previousState && (
            <span className="text-xs text-stone-400 font-mono hidden sm:inline">
              (Previous: <span className="text-stone-200 line-through">{previousState.replace(/_/g, " ")}</span>)
            </span>
          )}

          {assuranceStatus && (
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-stone-800 border border-stone-700 text-amber-300">
              Assurance: {assuranceStatus.replace(/_/g, " ")}
            </span>
          )}
        </div>

        {nextActionLabel && roleAllowed && (
          <div>
            {nextActionHref ? (
              <Link
                href={nextActionHref}
                className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm inline-flex items-center space-x-1"
              >
                <span>{nextActionLabel}</span>
                <span>→</span>
              </Link>
            ) : onNextActionClick ? (
              <button
                onClick={onNextActionClick}
                className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm inline-flex items-center space-x-1"
              >
                <span>{nextActionLabel}</span>
                <span>→</span>
              </button>
            ) : null}
          </div>
        )}
      </div>

      {/* Narrative Section */}
      <div className="p-4 bg-amber-50/50 border-t border-amber-100/60 text-xs space-y-2">
        <div className="flex items-start space-x-2">
          <span className="font-bold text-stone-900 uppercase tracking-wider shrink-0 text-[11px]">
            What Happened:
          </span>
          <p className="text-stone-800 font-medium leading-relaxed">{whatHappened}</p>
        </div>

        {triggerEvent && (
          <div className="flex items-start space-x-2 pt-1 border-t border-amber-100/80">
            <span className="font-bold text-amber-900 uppercase tracking-wider shrink-0 text-[11px]">
              State Trigger:
            </span>
            <p className="text-amber-950 font-mono text-[11px] font-semibold">{triggerEvent}</p>
          </div>
        )}

        {/* Expandable Decision Assurance Basis */}
        {(assuranceRationale || evidenceBasisCount !== undefined || aiAgreementStatus) && (
          <div className="pt-2 border-t border-amber-200/60">
            <button
              type="button"
              onClick={() => setShowDetails(!showDetails)}
              className="text-[11px] font-bold text-amber-900 hover:underline flex items-center gap-1"
            >
              <span>{showDetails ? "▼ Hide Decision Basis & Governance Audit" : "▶ View Decision Basis & Governance Audit"}</span>
            </button>

            {showDetails && (
              <div className="mt-2 p-3 bg-white rounded border border-amber-200 space-y-2 text-[11px] text-stone-700">
                {assuranceRationale && (
                  <div>
                    <span className="font-bold text-stone-900 block">Authoritative Human Rationale:</span>
                    <p className="italic text-stone-800 bg-stone-50 p-2 rounded border border-stone-200 mt-1">
                      &quot;{assuranceRationale}&quot;
                    </p>
                  </div>
                )}
                {evidenceBasisCount !== null && evidenceBasisCount !== undefined && (
                  <div className="font-mono text-[10px] text-stone-600">
                    Evidence Records Considered: <span className="font-bold text-stone-900">{evidenceBasisCount}</span>
                  </div>
                )}
                {aiAgreementStatus && (
                  <div className="font-mono text-[10px] text-stone-600">
                    AI Observational Status: <span className="font-bold text-amber-900">{aiAgreementStatus}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
