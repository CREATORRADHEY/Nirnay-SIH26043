import { GuidanceState } from "./types";

export const GUIDANCE_STORAGE_KEY = "nirnay_guidance_v1";

export const DEFAULT_GUIDANCE_STATE: GuidanceState = {
  version: 1,
  dismissedWelcome: false,
  activeTourId: null,
  currentStepIndex: 0,
  completedTours: [],
  lastRoute: "/app",
  panelOpen: false,
};

export function getStoredGuidanceState(): GuidanceState {
  if (typeof window === "undefined") {
    return DEFAULT_GUIDANCE_STATE;
  }
  try {
    const raw = localStorage.getItem(GUIDANCE_STORAGE_KEY);
    if (!raw) return DEFAULT_GUIDANCE_STATE;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && parsed.version === 1) {
      return {
        ...DEFAULT_GUIDANCE_STATE,
        ...parsed,
      };
    }
    return DEFAULT_GUIDANCE_STATE;
  } catch {
    return DEFAULT_GUIDANCE_STATE;
  }
}

export function setStoredGuidanceState(state: GuidanceState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(GUIDANCE_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage quota errors
  }
}

export function clearStoredGuidanceState(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(GUIDANCE_STORAGE_KEY);
  } catch {
    // Ignore error
  }
}
