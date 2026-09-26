"use client";

import React from "react";
import { useGuidance } from "./GuidanceProvider";

export const GuidedModeButton: React.FC = () => {
  const { togglePanel, isPanelOpen, state } = useGuidance();

  return (
    <button
      onClick={togglePanel}
      data-tour="guided-mode-btn"
      aria-label="Open Guided Mission Mode"
      aria-expanded={isPanelOpen}
      className={`text-xs px-3 py-1.5 rounded-md font-medium transition-all flex items-center space-x-1.5 border ${
        isPanelOpen || state.activeTourId
          ? "bg-amber-500 text-stone-950 border-amber-400 font-bold shadow-sm"
          : "bg-stone-800/80 hover:bg-stone-800 text-amber-300 hover:text-amber-200 border-amber-500/40"
      }`}
    >
      <svg
        className="w-3.5 h-3.5 text-current animate-pulse-slow"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
        ></path>
      </svg>
      <span>Guided Mode</span>
      {state.activeTourId && (
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block ml-0.5"></span>
      )}
    </button>
  );
};
