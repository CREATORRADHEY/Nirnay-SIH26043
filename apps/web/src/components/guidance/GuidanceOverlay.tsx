"use client";

import React, { useEffect, useState, useRef } from "react";
import { useGuidance } from "./GuidanceProvider";
import { useLanguage } from "@/lib/language-context";
import { useRouter } from "next/navigation";

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export const GuidanceOverlay: React.FC = () => {
  const { activeJourney, currentStep, state, nextStep, previousStep, exitTour } = useGuidance();
  const { t } = useLanguage();
  const router = useRouter();

  const [targetRect, setTargetRect] = useState<Rect | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const [isViewingPage, setIsViewingPage] = useState(false);

  // Reset viewing page mode on step change
  useEffect(() => {
    setIsViewingPage(false);
  }, [state.currentStepIndex]);

  // Check screen width for mobile bottom sheet
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Bounding box measurement and scroll alignment
  useEffect(() => {
    if (!currentStep) {
      setTargetRect(null);
      return;
    }

    const updateRect = () => {
      if (!currentStep.targetSelector) {
        setTargetRect(null);
        return;
      }

      const el = document.querySelector(currentStep.targetSelector);
      if (el) {
        const rect = el.getBoundingClientRect();
        setTargetRect({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        });
      } else {
        setTargetRect(null);
      }
    };

    updateRect();
    const timer = setTimeout(updateRect, 300); // Allow DOM to render on route change

    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect);
    };
  }, [currentStep]);

  if (!activeJourney || !currentStep) return null;

  const totalSteps = activeJourney.steps.length;
  const currentStepNumber = state.currentStepIndex + 1;

  const handleGoToSection = () => {
    if (currentStep.route) {
      router.push(currentStep.route);
    }
  };

  // If user clicked "View Page", render floating dock pill allowing full screen interaction
  if (isViewingPage) {
    return (
      <div className="fixed bottom-5 right-5 z-50 pointer-events-auto flex items-center gap-3 bg-stone-900/95 backdrop-blur text-stone-100 p-3 px-4 rounded-full shadow-2xl border-2 border-amber-500 animate-in fade-in slide-in-from-bottom-3 duration-200">
        <span className="flex h-3 w-3 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
        </span>
        <div className="flex flex-col text-left">
          <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider leading-none">
            Step {currentStepNumber} of {totalSteps} Active
          </span>
          <span className="text-xs font-bold text-white max-w-[200px] truncate leading-tight mt-0.5">
            {currentStep.title}
          </span>
        </div>
        <div className="h-6 w-px bg-stone-700 mx-1"></div>
        <button
          onClick={() => setIsViewingPage(false)}
          className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-full text-xs font-bold transition-all shadow-xs flex items-center space-x-1 cursor-pointer"
        >
          <span>{t("resume_tour", "Resume Tour")}</span>
          <span>➔</span>
        </button>
        <button
          onClick={exitTour}
          className="text-stone-400 hover:text-stone-200 text-xs p-1 rounded transition-colors cursor-pointer"
          title="Exit Tour"
        >
          ✕
        </button>
      </div>
    );
  }

  return (
    <div
      role="dialog"
      aria-label={`Guidance Step ${currentStepNumber} of ${totalSteps}: ${currentStep.title}`}
      aria-live="polite"
      className="fixed inset-0 z-50 pointer-events-auto"
    >
      {/* Background Dim Backdrop */}
      <div
        onClick={exitTour}
        className="absolute inset-0 bg-stone-950/65 transition-opacity duration-200"
      />

      {/* Spotlight Ring around target element if found */}
      {targetRect && (
        <div
          className="absolute rounded-lg border-2 border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.5)] transition-all duration-300 pointer-events-none"
          style={{
            top: `${targetRect.top - 4}px`,
            left: `${targetRect.left - 4}px`,
            width: `${targetRect.width + 8}px`,
            height: `${targetRect.height + 8}px`,
          }}
        />
      )}

      {/* Guidance Card Component */}
      <div
        ref={cardRef}
        className={`fixed z-50 transition-all duration-200 ${
          isMobile
            ? "bottom-0 left-0 right-0 p-4 bg-[#FDFBF7] border-t-2 border-amber-500 rounded-t-2xl shadow-2xl max-h-[80vh] overflow-y-auto"
            : targetRect
            ? "max-w-md w-full bg-[#FDFBF7] border border-amber-500/80 rounded-xl shadow-2xl p-5"
            : "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 max-w-md w-full bg-[#FDFBF7] border border-amber-500/80 rounded-xl shadow-2xl p-5"
        }`}
        style={
          !isMobile && targetRect
            ? {
                top: `${Math.min(
                  Math.max(20, targetRect.top + targetRect.height + 12),
                  window.innerHeight - 300
                )}px`,
                left: `${Math.min(
                  Math.max(20, targetRect.left),
                  window.innerWidth - 460
                )}px`,
              }
            : undefined
        }
      >
        <div className="space-y-3 text-stone-900">
          <div className="flex items-center justify-between border-b border-stone-200 pb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-2 py-0.5 rounded border border-amber-200 font-mono">
              Step {currentStepNumber} of {totalSteps}
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsViewingPage(true)}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-stone-100 hover:bg-amber-100 text-stone-700 hover:text-amber-900 border border-stone-300 hover:border-amber-300 rounded text-xs font-semibold transition-colors cursor-pointer"
                title="Temporarily hide overlay to view and inspect full screen"
              >
                <span>👁️</span>
                <span>{t("view_page", "View Page")}</span>
              </button>
              <button
                onClick={exitTour}
                className="text-stone-400 hover:text-stone-700 text-xs px-2 py-1 rounded transition-colors font-medium cursor-pointer"
                aria-label="Exit guidance"
              >
                Exit ✕
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-base font-bold text-stone-900 font-serif tracking-tight">
              {currentStep.title}
            </h3>
            <p className="text-xs text-stone-700 mt-1 leading-relaxed">
              {currentStep.description}
            </p>
          </div>

          <div className="bg-amber-50/80 border-l-2 border-amber-500 p-2.5 rounded-r text-[11px] text-stone-800">
            <span className="font-bold text-amber-900 block mb-0.5">Why it matters:</span>
            <span>{currentStep.whyItMatters}</span>
          </div>

          {!targetRect && currentStep.targetSelector && (
            <div className="bg-stone-100 border border-stone-300 p-2.5 rounded text-xs text-stone-700 flex items-center justify-between">
              <span>Open this section to continue</span>
              <button
                onClick={handleGoToSection}
                className="px-2.5 py-1 bg-stone-900 text-amber-400 rounded text-[11px] font-bold hover:bg-stone-800 cursor-pointer"
              >
                Go to section ➔
              </button>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-stone-200">
            <button
              onClick={previousStep}
              disabled={state.currentStepIndex === 0}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors cursor-pointer ${
                state.currentStepIndex === 0
                  ? "text-stone-400 cursor-not-allowed"
                  : "bg-stone-200 hover:bg-stone-300 text-stone-800"
              }`}
            >
              Back
            </button>

            <div className="flex items-center space-x-2">
              <button
                onClick={nextStep}
                className="px-4 py-1.5 rounded bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-xs flex items-center space-x-1 cursor-pointer"
              >
                <span>
                  {currentStepNumber === totalSteps ? "Finish" : "Next"}
                </span>
                <span>➔</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
