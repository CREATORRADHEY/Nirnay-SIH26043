import { ROLE_JOURNEYS } from "./roleJourneys";
import { PAGE_GUIDANCE_MAP } from "./pageGuidance";
import { GuidanceJourney, PageGuidance } from "./types";

export function getJourneyForRole(role: string): GuidanceJourney {
  if (!role) {
    return ROLE_JOURNEYS["citizen-journey"];
  }

  if (role.startsWith("GOVERNMENT_")) {
    return ROLE_JOURNEYS["government-journey"];
  }

  if (role.startsWith("HEI_")) {
    return ROLE_JOURNEYS["hei-journey"];
  }

  if (role.startsWith("INDUSTRY_")) {
    return ROLE_JOURNEYS["hei-journey"];
  }

  if (role === "PLATFORM_ADMIN") {
    return ROLE_JOURNEYS["admin-journey"];
  }

  return ROLE_JOURNEYS["citizen-journey"];
}

export function getJourneyById(id: string): GuidanceJourney | undefined {
  return ROLE_JOURNEYS[id];
}

export function getPageGuidance(route: string): PageGuidance | undefined {
  if (!route) return undefined;
  
  // Exact match
  if (PAGE_GUIDANCE_MAP[route]) {
    return PAGE_GUIDANCE_MAP[route];
  }

  // Prefix matching for dynamic routes (e.g., /app/review/123 -> /app/review)
  if (route.startsWith("/app/review/")) {
    return PAGE_GUIDANCE_MAP["/app/review"];
  }
  if (route.startsWith("/app/challenges/")) {
    return PAGE_GUIDANCE_MAP["/app/challenges"];
  }
  if (route.startsWith("/app/pilots/")) {
    return PAGE_GUIDANCE_MAP["/app/pilots"];
  }

  return undefined;
}
