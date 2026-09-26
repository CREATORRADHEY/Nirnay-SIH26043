export type RoleGroup = 
  | "CITIZEN_INNOVATOR"
  | "GOVERNMENT_NODAL"
  | "HEI"
  | "ADMIN"
  | "EVALUATION_JURY";

export interface GuidanceStep {
  id: string;
  title: string;
  description: string;
  whyItMatters: string;
  route: string;
  targetSelector: string;
  position?: "top" | "bottom" | "left" | "right" | "center";
  nextLabel?: string;
  previousLabel?: string;
  actionHint?: string;
}

export interface GuidanceJourney {
  id: string;
  roleGroup: RoleGroup;
  title: string;
  description: string;
  steps: GuidanceStep[];
}

export interface PageGuidance {
  route: string;
  stageName: string;
  stageIndex: number;
  totalStages: number;
  description: string;
  previousStage?: string;
  nextStage?: string;
  whoUsesIt: string;
  whatDecisionHappens: string;
  whatEvidenceMatters: string;
  whatHappensNext: string;
  whyThisStage: string;
}

export interface GuidanceState {
  version: number;
  dismissedWelcome: boolean;
  activeTourId: string | null;
  currentStepIndex: number;
  completedTours: string[];
  lastRoute: string;
  panelOpen: boolean;
}
