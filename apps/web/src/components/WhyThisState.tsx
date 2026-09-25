"use client";

import React from "react";
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
}) => {
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
      <div className="bg-stone-900 px-5 py-3 flex flex-wrap items-center justify-between gap-3 text-white">
        <div className="flex items-center space-x-3">
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
      </div>
    </div>
  );
};
