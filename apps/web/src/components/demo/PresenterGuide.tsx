"use client";
import React, { useState } from "react";
import { Mic, ChevronDown, ChevronUp } from "lucide-react";

export function PresenterGuide() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="bg-stone-900 text-stone-100 rounded-xl p-5 shadow-lg border border-stone-800 my-6">
      <div className="flex items-center justify-between cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-mono text-xs font-semibold">
            <Mic className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-stone-100 tracking-wide uppercase font-mono">
              Presenter Speaking Guide & Live Sequence
            </h3>
            <p className="text-xs text-stone-400">Follow this exact 3-minute sequence for jury demonstration</p>
          </div>
        </div>
        <button className="text-stone-400 hover:text-stone-200 p-1">
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {isOpen && (
        <div className="mt-5 pt-4 border-t border-stone-800 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          {/* Scenario A Guide */}
          <div className="bg-stone-950/60 rounded-lg p-4 border border-stone-800/80">
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono font-bold text-amber-400 tracking-wider">SCENARIO A — DEPENDENCY INTEGRITY</span>
              <span className="bg-stone-800 text-stone-300 px-2 py-0.5 rounded text-[10px] font-mono">~60 SEC</span>
            </div>
            <ol className="space-y-2.5 text-stone-300 list-decimal list-inside leading-relaxed">
              <li>
                <strong className="text-white">Open Scenario A:</strong> Show latest Readiness status is <span className="text-emerald-400 font-mono">PILOT_READY v1</span>.
              </li>
              <li>
                <strong className="text-white">Show Dependency:</strong> Point out condition depends on <span className="text-stone-200 font-medium">BIT Mesra Commitment ACCEPTED</span>.
              </li>
              <li>
                <strong className="text-white">Simulate Change:</strong> Switch to <span className="text-stone-200">Commitments</span> tab → Record new version <span className="text-amber-300 font-mono">WITHDRAWN</span>.
              </li>
              <li>
                <strong className="text-white">Observe Invalidation:</strong> Return to <span className="text-stone-200">Readiness</span> → Status automatically changes to <span className="text-amber-400 font-mono font-semibold">REVIEW_REQUIRED</span>.
              </li>
              <li>
                <strong className="text-white">Key Jury Cue:</strong> <em className="text-stone-400">&quot;NIRNAY preserves audit history while automatically invalidating readiness when underlying commitments break.&quot;</em>
              </li>
            </ol>
          </div>

          {/* Scenario B Guide */}
          <div className="bg-stone-950/60 rounded-lg p-4 border border-stone-800/80">
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono font-bold text-emerald-400 tracking-wider">SCENARIO B — EVIDENCE INTEGRITY</span>
              <span className="bg-stone-800 text-stone-300 px-2 py-0.5 rounded text-[10px] font-mono">~75 SEC</span>
            </div>
            <ol className="space-y-2.5 text-stone-300 list-decimal list-inside leading-relaxed">
              <li>
                <strong className="text-white">Open Scenario B:</strong> Show Pilot Workspace in <span className="text-sky-400 font-mono">ACTIVE</span> operational state.
              </li>
              <li>
                <strong className="text-white">Show Evidence Plan:</strong> Point out declared <span className="text-stone-200 font-medium">Baseline (41%)</span> and <span className="text-stone-200 font-medium">Denominator (240 households)</span>.
              </li>
              <li>
                <strong className="text-white">Complete Pilot:</strong> Click <span className="text-stone-200 font-medium">Update Operational State</span> → Advance to <span className="text-emerald-400 font-mono">COMPLETED</span>.
              </li>
              <li>
                <strong className="text-white">Highlight Separation:</strong> Show that <em className="text-stone-400">no outcome is auto-generated</em> (Completion != Impact).
              </li>
              <li>
                <strong className="text-white">Record Outcome:</strong> Click <span className="text-stone-200 font-medium">Record Outcome</span> → Select <span className="text-amber-400 font-mono">INCONCLUSIVE</span> with limitation on denominator change.
              </li>
              <li>
                <strong className="text-white">Key Jury Cue:</strong> <em className="text-stone-400">&quot;Completed, but not proven. Execution completion is strictly separated from impact claims.&quot;</em>
              </li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}
