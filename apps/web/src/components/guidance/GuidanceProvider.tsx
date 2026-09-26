"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  GuidanceState,
  GuidanceJourney,
  GuidanceStep,
  PageGuidance,
} from "@/lib/guidance/types";
import {
  getStoredGuidanceState,
  setStoredGuidanceState,
  clearStoredGuidanceState,
} from "@/lib/guidance/storage";
import {
  getJourneyForRole,
  getJourneyById,
  getPageGuidance,
} from "@/lib/guidance/registry";

interface GuidanceContextType {
  state: GuidanceState;
  userRole: string;
  activeJourney: GuidanceJourney | null;
  currentStep: GuidanceStep | null;
  currentPageGuidance: PageGuidance | null;
  isWelcomeOpen: boolean;
  isPanelOpen: boolean;
  isWhyStageOpen: boolean;
  startTour: (tourId?: string) => void;
  nextStep: () => void;
  previousStep: () => void;
  exitTour: () => void;
  togglePanel: () => void;
  closePanel: () => void;
  openWelcome: () => void;
  closeWelcome: (exploreMyself?: boolean) => void;
  openWhyStage: () => void;
  closeWhyStage: () => void;
  resetGuidance: () => void;
  explainCurrentPage: () => void;
}

const GuidanceContext = createContext<GuidanceContextType | undefined>(undefined);

export const GuidanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const [state, setState] = useState<GuidanceState>(getStoredGuidanceState);
  const [isWelcomeOpen, setIsWelcomeOpen] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isWhyStageOpen, setIsWhyStageOpen] = useState(false);

  const userRole = user?.platform_role || "COMMUNITY_REPORTER";

  // Sync state to localStorage on update
  const updateState = useCallback((updater: (prev: GuidanceState) => GuidanceState) => {
    setState((prev) => {
      const next = updater(prev);
      setStoredGuidanceState(next);
      return next;
    });
  }, []);

  // Show welcome modal on first authenticated visit if not dismissed
  useEffect(() => {
    if (user && !state.dismissedWelcome) {
      setIsWelcomeOpen(true);
    }
  }, [user, state.dismissedWelcome]);

  // Track route changes
  useEffect(() => {
    if (pathname) {
      updateState((prev) => ({ ...prev, lastRoute: pathname }));
    }
  }, [pathname, updateState]);

  const activeJourney = state.activeTourId ? getJourneyById(state.activeTourId) || null : null;
  const currentStep =
    activeJourney && activeJourney.steps[state.currentStepIndex]
      ? activeJourney.steps[state.currentStepIndex]
      : null;

  const currentPageGuidance = pathname ? getPageGuidance(pathname) || null : null;

  const startTour = useCallback(
    (tourId?: string) => {
      const journeyToStart = tourId
        ? getJourneyById(tourId)
        : getJourneyForRole(userRole);
      if (!journeyToStart) return;

      setIsWelcomeOpen(false);
      setIsPanelOpen(false);

      const firstStep = journeyToStart.steps[0];

      updateState((prev) => ({
        ...prev,
        dismissedWelcome: true,
        activeTourId: journeyToStart.id,
        currentStepIndex: 0,
        panelOpen: false,
      }));

      if (firstStep && firstStep.route && pathname !== firstStep.route) {
        router.push(firstStep.route);
      }
    },
    [userRole, pathname, router, updateState]
  );

  const nextStep = useCallback(() => {
    if (!activeJourney || !currentStep) return;

    const nextIndex = state.currentStepIndex + 1;
    if (nextIndex >= activeJourney.steps.length) {
      // Completed tour
      updateState((prev) => ({
        ...prev,
        activeTourId: null,
        currentStepIndex: 0,
        completedTours: Array.from(new Set([...prev.completedTours, activeJourney.id])),
      }));
      return;
    }

    const nextStepItem = activeJourney.steps[nextIndex];
    updateState((prev) => ({
      ...prev,
      currentStepIndex: nextIndex,
    }));

    if (nextStepItem.route && pathname !== nextStepItem.route) {
      router.push(nextStepItem.route);
    }
  }, [activeJourney, currentStep, state.currentStepIndex, pathname, router, updateState]);

  const previousStep = useCallback(() => {
    if (!activeJourney || state.currentStepIndex <= 0) return;

    const prevIndex = state.currentStepIndex - 1;
    const prevStepItem = activeJourney.steps[prevIndex];

    updateState((prev) => ({
      ...prev,
      currentStepIndex: prevIndex,
    }));

    if (prevStepItem.route && pathname !== prevStepItem.route) {
      router.push(prevStepItem.route);
    }
  }, [activeJourney, state.currentStepIndex, pathname, router, updateState]);

  const exitTour = useCallback(() => {
    updateState((prev) => ({
      ...prev,
      activeTourId: null,
      currentStepIndex: 0,
    }));
  }, [updateState]);

  const togglePanel = useCallback(() => {
    setIsPanelOpen((prev) => !prev);
  }, []);

  const closePanel = useCallback(() => {
    setIsPanelOpen(false);
  }, []);

  const openWelcome = useCallback(() => {
    setIsWelcomeOpen(true);
  }, []);

  const closeWelcome = useCallback(
    (exploreMyself = false) => {
      setIsWelcomeOpen(false);
      if (exploreMyself) {
        updateState((prev) => ({ ...prev, dismissedWelcome: true }));
      }
    },
    [updateState]
  );

  const openWhyStage = useCallback(() => {
    setIsWhyStageOpen(true);
  }, []);

  const closeWhyStage = useCallback(() => {
    setIsWhyStageOpen(false);
  }, []);

  const resetGuidance = useCallback(() => {
    clearStoredGuidanceState();
    setState(getStoredGuidanceState());
    setIsWelcomeOpen(true);
    setIsPanelOpen(false);
  }, []);

  const explainCurrentPage = useCallback(() => {
    setIsPanelOpen(false);
    setIsWhyStageOpen(true);
  }, []);

  // Keyboard navigation for active tour
  useEffect(() => {
    if (!state.activeTourId) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        exitTour();
      } else if (e.key === "ArrowRight") {
        nextStep();
      } else if (e.key === "ArrowLeft") {
        previousStep();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [state.activeTourId, exitTour, nextStep, previousStep]);

  return (
    <GuidanceContext.Provider
      value={{
        state,
        userRole,
        activeJourney,
        currentStep,
        currentPageGuidance,
        isWelcomeOpen,
        isPanelOpen,
        isWhyStageOpen,
        startTour,
        nextStep,
        previousStep,
        exitTour,
        togglePanel,
        closePanel,
        openWelcome,
        closeWelcome,
        openWhyStage,
        closeWhyStage,
        resetGuidance,
        explainCurrentPage,
      }}
    >
      {children}
    </GuidanceContext.Provider>
  );
};

export const useGuidance = () => {
  const context = useContext(GuidanceContext);
  if (!context) {
    throw new Error("useGuidance must be used within a GuidanceProvider");
  }
  return context;
};
