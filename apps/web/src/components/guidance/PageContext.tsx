"use client";

import React from "react";
import { useGuidance } from "./GuidanceProvider";

export const PageContext: React.FC = () => {
  const { currentPageGuidance, openWhyStage } = useGuidance();

  if (!currentPageGuidance) return null;

  return (
    <div className="bg-[#FDFBF7] border border-amber-600/30 rounded-lg p-3 sm:p-4 mb-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200 pb-2 mb-2">
        <div className="flex items-center space-x-2">
          <span className="text-[10px] font-bold font-mono uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded">
            Stage {currentPageGuidance.stageIndex} of {currentPageGuidance.totalStages}
          </span>
          <h2 className="text-sm sm:text-base font-bold font-serif text-stone-900 tracking-tight">
            {currentPageGuidance.stageName}
          </h2>
        </div>
        <button
          onClick={openWhyStage}
          className="text-xs px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 border border-amber-500/30 rounded font-bold transition-colors self-start sm:self-auto flex items-center space-x-1"
        >
          <span>💡</span>
          <span>Why this stage?</span>
        </button>
      </div>

      <p className="text-xs text-stone-700 leading-relaxed">
        {currentPageGuidance.description}
      </p>

      <div className="mt-2 text-[11px] text-stone-500 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 pt-2 border-t border-stone-200/60 font-medium">
        {currentPageGuidance.previousStage && (
          <span>Previous: <strong className="text-stone-700">{currentPageGuidance.previousStage}</strong></span>
        )}
        {currentPageGuidance.nextStage && (
          <span>Next: <strong className="text-stone-700">{currentPageGuidance.nextStage}</strong></span>
        )}
      </div>
    </div>
  );
};
