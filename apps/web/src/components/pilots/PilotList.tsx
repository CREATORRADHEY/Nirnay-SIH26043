import React from "react";
import Link from "next/link";
import { Rocket, ArrowRight, Calendar, Building2 } from "lucide-react";
import { OperationalStatusBadge, EvidenceConclusionBadge } from "./PilotBadges";
import type {
  PilotResponse,
  HEIOrganization,
  OperationalStatus,
  EvidenceConclusion,
} from "@/lib/types/challenge";

interface PilotItemWithStates extends PilotResponse {
  latestOperationalStatus?: OperationalStatus;
  latestConclusion?: EvidenceConclusion;
}

interface Props {
  pilots: PilotItemWithStates[];
  organizations: HEIOrganization[];
  onOpenCreateSheet: () => void;
  isPilotReady: boolean;
}

export function PilotList({
  pilots,
  organizations,
  onOpenCreateSheet,
  isPilotReady,
}: Props) {
  const getOrgName = (orgId?: string | null) => {
    if (!orgId) return null;
    const org = organizations.find((o) => o.organization_id === orgId);
    return org ? org.name : `Host HEI ${orgId.slice(0, 8)}...`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h3 className="text-sm font-serif font-bold text-stone-900 flex items-center gap-2">
            <Rocket className="w-4 h-4 text-[#F95700]" />
            Authorized Field Pilots ({pilots.length})
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Controlled field learning deployments authorized from human PILOT_READY decisions.
          </p>
        </div>
        <button
          onClick={onOpenCreateSheet}
          disabled={!isPilotReady}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-[#F95700] text-white rounded-md hover:bg-[#d84b00] disabled:opacity-50 disabled:cursor-not-allowed shadow-xs transition-colors cursor-pointer"
        >
          <Rocket className="w-4 h-4" />
          Create Pilot
        </button>
      </div>

      {pilots.length === 0 ? (
        <div className="bg-white border border-stone-200 rounded-lg p-8 text-center space-y-3">
          <Rocket className="w-8 h-8 text-stone-400 mx-auto opacity-50" />
          <h4 className="text-sm font-serif font-bold text-stone-800">No Field Pilots Created Yet</h4>
          <p className="text-xs text-stone-500 max-w-md mx-auto">
            Once human PILOT_READY authorization is recorded under Pilot Readiness, click &quot;Create Pilot&quot; above to initiate a field deployment.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {pilots.map((pilot) => {
            const hostName = getOrgName(pilot.host_organization_id);
            const opStatus = pilot.latestOperationalStatus || "PLANNED";
            const conc = pilot.latestConclusion || "NOT_REVIEWED";

            return (
              <div
                key={pilot.id}
                className="bg-white border border-stone-200 rounded-lg p-5 shadow-2xs hover:border-stone-300 transition-all space-y-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#F95700] bg-[#FAF8F5] px-2 py-0.5 rounded border border-stone-200">
                        PILOT #{pilot.id.slice(0, 8)}
                      </span>
                      {hostName && (
                        <span className="text-xs font-mono font-semibold text-stone-700 flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-stone-400" />
                          {hostName}
                        </span>
                      )}
                    </div>
                    <h4 className="text-base font-serif font-bold text-stone-900 mt-1">
                      {pilot.name}
                    </h4>
                  </div>

                  <div className="flex items-center gap-2">
                    <OperationalStatusBadge status={opStatus} size="sm" />
                    <EvidenceConclusionBadge conclusion={conc} size="sm" />
                  </div>
                </div>

                {pilot.site_description && (
                  <p className="text-xs text-stone-700 font-sans leading-relaxed">
                    {pilot.site_description}
                  </p>
                )}

                <div className="pt-3 border-t border-stone-200 flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-stone-500">
                  <div className="flex items-center gap-4">
                    {(pilot.planned_start || pilot.planned_end) && (
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-stone-400" />
                        {pilot.planned_start ? new Date(pilot.planned_start).toLocaleDateString() : "Immediate"}
                        {" → "}
                        {pilot.planned_end ? new Date(pilot.planned_end).toLocaleDateString() : "TBD"}
                      </span>
                    )}
                    <span>Created {new Date(pilot.created_at).toLocaleDateString()}</span>
                  </div>

                  <Link
                    href={`/pilots/${pilot.id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#F95700] hover:underline"
                  >
                    Open Pilot Workspace <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
