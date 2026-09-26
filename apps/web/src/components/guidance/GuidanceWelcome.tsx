"use client";

import React from "react";
import { useGuidance } from "./GuidanceProvider";

export const GuidanceWelcome: React.FC = () => {
  const { isWelcomeOpen, closeWelcome, startTour, userRole } = useGuidance();

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isWelcomeOpen) {
        closeWelcome(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isWelcomeOpen, closeWelcome]);

  if (!isWelcomeOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-modal-title"
      onClick={() => closeWelcome(true)}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs animate-in fade-in duration-200 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#FDFBF7] text-stone-900 border border-stone-300 rounded-xl shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 animate-in zoom-in-95 duration-200 cursor-default"
      >
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500/15 border border-amber-600/30 flex items-center justify-center text-amber-700 font-bold">
            <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </div>
          <div>
            <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider font-mono">
              NIRNAY Platform Guide
            </span>
            <h2 id="welcome-modal-title" className="text-xl sm:text-2xl font-bold font-serif text-stone-900 tracking-tight">
              Welcome to NIRNAY
            </h2>
          </div>
        </div>

        <div className="space-y-3 text-sm text-stone-700 leading-relaxed border-y border-stone-200/80 py-4">
          <p className="font-medium text-stone-900">
            NIRNAY takes a societal challenge from evidence to qualification, collaboration, pilot and outcome.
          </p>
          <p className="text-stone-600">
            We&apos;ll guide you step-by-step through your role as{" "}
            <span className="font-semibold text-amber-800 bg-amber-100/60 px-2 py-0.5 rounded border border-amber-200">
              {userRole.replace(/_/g, " ")}
            </span>
            , highlighting key decisions, evidence requirements, and governance boundaries.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-2">
          <button
            onClick={() => closeWelcome(true)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-lg border border-stone-300 text-stone-700 hover:bg-stone-100 text-xs font-semibold transition-colors text-center"
          >
            Explore Myself
          </button>
          <button
            onClick={() => {
              closeWelcome(false);
              startTour();
            }}
            className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center space-x-2 text-center"
          >
            <span>Start Guided Tour</span>
            <span>➔</span>
          </button>
        </div>
      </div>
    </div>
  );
};
