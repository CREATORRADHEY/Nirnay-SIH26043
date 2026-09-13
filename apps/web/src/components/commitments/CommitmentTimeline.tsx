import React from "react";
import { History, Calendar, UserCheck } from "lucide-react";
import { CommitmentStatusBadge } from "./CommitmentStatusBadge";
import type { CommitmentResponse, HEIOrganization } from "@/lib/types/challenge";

interface Props {
  commitments: CommitmentResponse[];
  organizations: HEIOrganization[];
}

export function CommitmentTimeline({ commitments, organizations }: Props) {
  if (commitments.length === 0) {
    return (
      <div className="bg-white border border-stone-200 rounded-lg p-8 text-center my-6">
        <History className="w-8 h-8 text-stone-400 mx-auto mb-2" />
        <h4 className="text-sm font-serif font-bold text-stone-800">No Commitments Recorded Yet</h4>
        <p className="text-xs text-stone-500 mt-1">
          Record commitments for candidate HEIs above to track explicit agreements and scope.
        </p>
      </div>
    );
  }

  // Sort descending by created_at or version
  const sorted = [...commitments].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const getOrgName = (orgId: string) => {
    const org = organizations.find((o) => o.organization_id === orgId);
    return org ? org.name : `Organization ${orgId.slice(0, 8)}...`;
  };

  return (
    <div className="bg-white border border-stone-200 rounded-lg p-6 my-6">
      <div className="flex items-center justify-between pb-4 border-b border-stone-200 mb-6">
        <div>
          <h3 className="text-sm font-serif font-bold text-stone-900 flex items-center gap-2">
            <History className="w-4 h-4 text-[#F95700]" />
            Commitment Version History & Audit Trail
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Full immutable history of organization commitments over time.
          </p>
        </div>
        <span className="text-xs font-mono bg-stone-100 text-stone-600 px-2.5 py-1 rounded border border-stone-200">
          {sorted.length} Record{sorted.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="relative pl-6 border-l-2 border-stone-200 space-y-6">
        {sorted.map((comm) => (
          <div key={comm.id} className="relative group">
            {/* Timeline bullet */}
            <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-white border-2 border-[#F95700] flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-[#F95700]" />
            </div>

            <div className="bg-[#FAF8F5] border border-stone-200 rounded-lg p-4 transition-all hover:border-stone-300">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-stone-900 bg-white px-2 py-0.5 rounded border border-stone-300">
                    v{comm.version}
                  </span>
                  <CommitmentStatusBadge status={comm.status} size="sm" />
                  <span className="text-xs font-mono font-semibold text-stone-700">
                    {comm.commitment_type}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-stone-500 font-mono">
                  <span className="flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-stone-400" />
                    Actor: {comm.recorded_by_actor_id ? `${comm.recorded_by_actor_id.slice(0, 8)}...` : "System"}
                  </span>
                  <span>{new Date(comm.created_at).toLocaleString()}</span>
                </div>
              </div>

              <div className="mb-2">
                <p className="text-sm font-semibold text-stone-900">
                  {getOrgName(comm.organization_id)}
                </p>
                <p className="text-xs text-stone-700 mt-1 whitespace-pre-line leading-relaxed">
                  {comm.scope_description}
                </p>
              </div>

              {(comm.valid_from || comm.valid_until) && (
                <div className="flex items-center gap-2 text-xs font-mono text-stone-500 mt-3 pt-2 border-t border-stone-200/60">
                  <Calendar className="w-3.5 h-3.5 text-stone-400" />
                  <span>
                    Valid: {comm.valid_from ? new Date(comm.valid_from).toLocaleDateString() : "Immediate"}
                    {" → "}
                    {comm.valid_until ? new Date(comm.valid_until).toLocaleDateString() : "Indefinite"}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
