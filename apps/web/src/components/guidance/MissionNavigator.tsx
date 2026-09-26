"use client";

import React, { useState } from "react";
import { useGuidance } from "./GuidanceProvider";
import { usePathname } from "next/navigation";

export const MissionNavigator: React.FC = () => {
  const { startTour, state, userRole, currentPageGuidance } = useGuidance();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  // Neutral workflow steps for mission overview
  const missionSteps = [
    { name: "Review", route: "/app/review" },
    { name: "Qualification", route: "/app/qualification" },
    { name: "Matching", route: "/app/hei-matching" },
    { name: "Readiness", route: "/app/readiness" },
    { name: "Pilot", route: "/app/pilots" },
    { name: "Outcome", route: "/app/outcomes" },
  ];

  const currentStageName = currentPageGuidance ? currentPageGuidance.stageName : "Workflow Overview";

  if (collapsed) {
    return (
      <div className="fixed bottom-4 right-4 z-40">
        <button
          onClick={() => setCollapsed(false)}
          className="bg-stone-900 text-stone-100 hover:text-amber-400 border border-stone-700 px-3 py-1.5 rounded-full shadow-lg text-xs font-semibold flex items-center space-x-2 transition-all"
        >
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
          <span>YOUR MISSION</span>
        </button>
      </div>
    );
  }

  return (
    <div className="bg-stone-900 text-stone-100 border border-stone-800 rounded-lg p-3 shadow-md my-4 animate-in fade-in duration-200">
      <div className="flex items-center justify-between border-b border-stone-800 pb-2 mb-2">
        <div className="flex items-center space-x-2">
          <span className="text-amber-500 font-bold text-xs uppercase tracking-wider font-mono">
            YOUR MISSION
          </span>
          <span className="text-[10px] text-stone-400 font-mono bg-stone-800 px-1.5 py-0.5 rounded">
            {userRole.replace(/_/g, " ")}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => startTour()}
            className="text-[11px] px-2 py-0.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded font-bold border border-amber-500/40 transition-colors"
          >
            {state.activeTourId ? "Resume Tour" : "Start Tour ➔"}
          </button>
          <button
            onClick={() => setCollapsed(true)}
            className="text-stone-400 hover:text-white text-xs px-1"
            aria-label="Minimize mission navigator"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="flex items-center space-x-2 overflow-x-auto py-1 text-xs">
        {missionSteps.map((step) => {
          const isActive = pathname === step.route || (step.route !== "/app" && pathname?.startsWith(step.route));
          return (
            <div
              key={step.route}
              className={`flex items-center space-x-1 whitespace-nowrap px-2 py-1 rounded ${
                isActive
                  ? "bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold"
                  : "bg-stone-800/60 text-stone-400 font-medium"
              }`}
            >
              <span className={isActive ? "text-amber-400" : "text-stone-500"}>●</span>
              <span>{step.name}</span>
            </div>
          );
        })}
      </div>

      <div className="mt-2 text-[11px] text-stone-400 flex items-center justify-between pt-2 border-t border-stone-800/60">
        <span>Current Focus: <strong className="text-stone-200">{currentStageName}</strong></span>
        <span className="text-stone-400">Strict Governance Architecture</span>
      </div>
    </div>
  );
};
