"use client";

import React, { useEffect, useRef } from "react";
import { useGuidance } from "./GuidanceProvider";

export const GuidedModePanel: React.FC = () => {
  const {
    isPanelOpen,
    closePanel,
    startTour,
    explainCurrentPage,
    resetGuidance,
    userRole,
    state,
    currentPageGuidance,
  } = useGuidance();

  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        // Check if the click target is the Guided Mode button itself
        const target = event.target as HTMLElement;
        if (target.closest('[data-tour="guided-mode-btn"]')) return;
        closePanel();
      }
    };

    if (isPanelOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isPanelOpen, closePanel]);

  if (!isPanelOpen) return null;

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-label="Guided Mode Control Panel"
      className="absolute top-14 right-6 w-80 bg-stone-900 border border-stone-700 text-stone-100 rounded-lg shadow-2xl z-50 p-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200"
    >
      <div className="flex items-center justify-between border-b border-stone-800 pb-3">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-md bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-sm tracking-tight text-white">NIRNAY Guided Mode</h3>
            <p className="text-[11px] text-stone-400">Contextual Workflow Guidance</p>
          </div>
        </div>
        <button
          onClick={closePanel}
          className="text-stone-400 hover:text-white p-1 rounded hover:bg-stone-800 transition-colors"
          aria-label="Close guidance panel"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="space-y-2">
        <button
          onClick={() => startTour()}
          className="w-full text-left px-3 py-2.5 rounded-md bg-stone-800 hover:bg-stone-700/80 border border-stone-700 text-xs font-semibold text-stone-200 hover:text-white transition-all flex items-center justify-between group"
        >
          <div className="flex items-center space-x-2">
            <span className="text-amber-400 text-sm">➔</span>
            <span>{state.activeTourId ? "Continue my workflow" : "Take my role tour"}</span>
          </div>
          <span className="text-[10px] text-stone-400 group-hover:text-stone-300 font-mono">
            {userRole.replace(/_/g, " ")}
          </span>
        </button>

        <button
          onClick={() => startTour("jury-90sec-journey")}
          className="w-full text-left px-3 py-2.5 rounded-md bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-xs font-semibold text-amber-300 transition-all flex items-center justify-between group"
        >
          <div className="flex items-center space-x-2">
            <span className="text-amber-400">⚡</span>
            <span>90-sec platform tour</span>
          </div>
          <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-mono">
            Jury Mode
          </span>
        </button>

        <button
          onClick={explainCurrentPage}
          className="w-full text-left px-3 py-2.5 rounded-md bg-stone-800/60 hover:bg-stone-800 border border-stone-700/80 text-xs font-medium text-stone-300 hover:text-white transition-all flex items-center justify-between"
        >
          <div className="flex items-center space-x-2">
            <span className="text-stone-400">💡</span>
            <span>Explain this page</span>
          </div>
          <span className="text-[10px] text-stone-400 font-mono">
            {currentPageGuidance ? currentPageGuidance.stageName : "General"}
          </span>
        </button>

        <button
          onClick={resetGuidance}
          className="w-full text-left px-3 py-2 rounded-md hover:bg-stone-800/50 text-[11px] font-medium text-stone-400 hover:text-stone-300 transition-colors flex items-center space-x-2"
        >
          <span>🔄</span>
          <span>Restart guidance & onboarding</span>
        </button>
      </div>

      <div className="pt-2 border-t border-stone-800 text-[11px] text-stone-400 flex items-center justify-between">
        <span>Active Guidance v1</span>
        <span className="font-mono text-[10px] text-stone-500">NIRNAY System</span>
      </div>
    </div>
  );
};
