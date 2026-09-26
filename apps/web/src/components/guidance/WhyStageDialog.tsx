"use client";

import React from "react";
import { useGuidance } from "./GuidanceProvider";

export const WhyStageDialog: React.FC = () => {
  const { isWhyStageOpen, closeWhyStage, currentPageGuidance } = useGuidance();

  if (!isWhyStageOpen || !currentPageGuidance) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="why-stage-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-[#FDFBF7] text-stone-900 border border-amber-600/40 rounded-xl shadow-2xl max-w-xl w-full p-6 space-y-5 animate-in zoom-in-95 duration-200 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-stone-200 pb-3">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded border border-amber-300">
              Stage {currentPageGuidance.stageIndex} of {currentPageGuidance.totalStages}
            </span>
            <h2 id="why-stage-title" className="text-lg font-bold font-serif text-stone-900">
              {currentPageGuidance.stageName}
            </h2>
          </div>
          <button
            onClick={closeWhyStage}
            className="text-stone-400 hover:text-stone-700 text-sm font-bold p-1 rounded"
            aria-label="Close dialog"
          >
            ✕
          </button>
        </div>

        <p className="text-xs text-stone-700 leading-relaxed font-medium bg-amber-50/70 border-l-2 border-amber-500 p-3 rounded-r">
          {currentPageGuidance.description}
        </p>

        <div className="space-y-3 text-xs">
          <div className="border border-stone-200 rounded-lg p-3 bg-white space-y-1">
            <span className="font-bold text-stone-900 uppercase text-[10px] tracking-wider text-amber-700 font-mono block">
              1. Who Uses This Stage?
            </span>
            <p className="text-stone-700">{currentPageGuidance.whoUsesIt}</p>
          </div>

          <div className="border border-stone-200 rounded-lg p-3 bg-white space-y-1">
            <span className="font-bold text-stone-900 uppercase text-[10px] tracking-wider text-amber-700 font-mono block">
              2. What Decision Happens Here?
            </span>
            <p className="text-stone-700">{currentPageGuidance.whatDecisionHappens}</p>
          </div>

          <div className="border border-stone-200 rounded-lg p-3 bg-white space-y-1">
            <span className="font-bold text-stone-900 uppercase text-[10px] tracking-wider text-amber-700 font-mono block">
              3. What Evidence / Information Matters?
            </span>
            <p className="text-stone-700">{currentPageGuidance.whatEvidenceMatters}</p>
          </div>

          <div className="border border-stone-200 rounded-lg p-3 bg-white space-y-1">
            <span className="font-bold text-stone-900 uppercase text-[10px] tracking-wider text-amber-700 font-mono block">
              4. What Happens Next?
            </span>
            <p className="text-stone-700">{currentPageGuidance.whatHappensNext}</p>
          </div>

          <div className="border border-amber-300 rounded-lg p-3 bg-amber-50/90 space-y-1">
            <span className="font-bold text-amber-900 uppercase text-[10px] tracking-wider font-mono block">
              5. Why Does This Stage Exist? (Governance Principle)
            </span>
            <p className="text-stone-800 font-medium">{currentPageGuidance.whyThisStage}</p>
          </div>
        </div>

        <div className="flex items-center justify-end pt-2 border-t border-stone-200">
          <button
            onClick={closeWhyStage}
            className="px-4 py-2 bg-stone-900 text-stone-100 hover:text-white rounded text-xs font-bold transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
