import React from "react";
import { History, UserCheck, Cpu } from "lucide-react";
import { ReadinessStatusBadge } from "./ReadinessStatusBadge";
import type { ReadinessDecisionResponse } from "@/lib/types/challenge";

interface Props {
  decisions: ReadinessDecisionResponse[];
}

export function ReadinessTimeline({ decisions }: Props) {
  if (decisions.length === 0) {
    return (
      <div className="bg-white border border-stone-200 rounded-lg p-8 text-center my-6">
        <History className="w-8 h-8 text-stone-400 mx-auto mb-2" />
        <h4 className="text-sm font-serif font-bold text-stone-800">No Readiness Decisions Recorded Yet</h4>
        <p className="text-xs text-stone-500 mt-1">
          Record a readiness decision to document human review or pilot authorization.
        </p>
      </div>
    );
  }

  // Sort descending by version for timeline presentation
  const sorted = [...decisions].sort((a, b) => b.version - a.version);

  return (
    <div className="bg-white border border-stone-200 rounded-lg p-6 my-6">
      <div className="flex items-center justify-between pb-4 border-b border-stone-200 mb-6">
        <div>
          <h3 className="text-sm font-serif font-bold text-stone-900 flex items-center gap-2">
            <History className="w-4 h-4 text-[#F95700]" />
            Readiness Decision Audit History
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Immutable chronological log of human reviews and system integrity re-opens.
          </p>
        </div>
        <span className="text-xs font-mono bg-stone-100 text-stone-600 px-2.5 py-1 rounded border border-stone-200">
          {sorted.length} Record{sorted.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="relative pl-6 border-l-2 border-stone-200 space-y-6">
        {sorted.map((dec) => {
          const isSystem = dec.status === "REVIEW_REQUIRED" || !dec.decided_by_actor_id;

          return (
            <div key={dec.id} className="relative group">
              {/* Dot */}
              <div
                className={`absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-white border-2 flex items-center justify-center ${
                  isSystem ? "border-amber-500" : "border-[#F95700]"
                }`}
              >
                <div
                  className={`w-1.5 h-1.5 rounded-full ${
                    isSystem ? "bg-amber-500" : "bg-[#F95700]"
                  }`}
                />
              </div>

              <div
                className={`border rounded-lg p-4 transition-all ${
                  dec.status === "REVIEW_REQUIRED"
                    ? "bg-amber-50/50 border-amber-300"
                    : "bg-[#FAF8F5] border-stone-200 hover:border-stone-300"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-stone-900 bg-white px-2 py-0.5 rounded border border-stone-300">
                      v{dec.version}
                    </span>
                    <ReadinessStatusBadge status={dec.status} size="sm" />
                  </div>
                  <div className="flex items-center gap-3 text-xs text-stone-500 font-mono">
                    <span className="flex items-center gap-1 font-semibold text-stone-700">
                      {isSystem ? (
                        <>
                          <Cpu className="w-3.5 h-3.5 text-amber-600" />
                          System integrity check
                        </>
                      ) : (
                        <>
                          <UserCheck className="w-3.5 h-3.5 text-stone-400" />
                          Actor: {dec.decided_by_actor_id ? `${dec.decided_by_actor_id.slice(0, 8)}...` : "Human"}
                        </>
                      )}
                    </span>
                    <span>{new Date(dec.created_at).toLocaleString()}</span>
                  </div>
                </div>

                <p className="text-xs text-stone-800 leading-relaxed whitespace-pre-line font-sans">
                  {dec.rationale}
                </p>

                {dec.condition_ids && dec.condition_ids.length > 0 && (
                  <div className="mt-2 text-[11px] font-mono text-stone-500 pt-2 border-t border-stone-200/60">
                    Supporting Conditions Count: {dec.condition_ids.length}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
