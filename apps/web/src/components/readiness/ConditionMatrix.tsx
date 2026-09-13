import React from "react";
import { CheckCircle2, Plus, Calendar, Link as LinkIcon } from "lucide-react";
import { ConditionStatusBadge } from "./ReadinessStatusBadge";
import type {
  ReadinessConditionResponse,
  CommitmentResponse,
  HEIOrganization,
} from "@/lib/types/challenge";

interface Props {
  latestConditions: ReadinessConditionResponse[];
  commitments: CommitmentResponse[];
  organizations: HEIOrganization[];
  onOpenAssessSheet: () => void;
}

export function ConditionMatrix({
  latestConditions,
  commitments,
  organizations,
  onOpenAssessSheet,
}: Props) {
  const getCommitmentLabel = (commId: string) => {
    const comm = commitments.find((c) => c.id === commId);
    if (!comm) return `Commitment ${commId.slice(0, 8)}...`;
    const org = organizations.find((o) => o.organization_id === comm.organization_id);
    const orgName = org ? org.name : "HEI";
    return `${orgName} • ${comm.commitment_type} • Commitment v${comm.version} (${comm.status})`;
  };

  return (
    <div className="bg-white border border-stone-200 rounded-lg p-6 my-6">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-stone-200 mb-6">
        <div>
          <h3 className="text-sm font-serif font-bold text-stone-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#F95700]" />
            Readiness Condition Matrix
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Traceable conditions required before pilot authorization.
          </p>
        </div>
        <button
          onClick={onOpenAssessSheet}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-stone-900 text-white rounded-md hover:bg-stone-800 transition-colors shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          Assess Condition
        </button>
      </div>

      {latestConditions.length === 0 ? (
        <div className="p-8 text-center bg-[#FAF8F5] rounded-lg border border-dashed border-stone-300">
          <p className="text-sm font-serif font-bold text-stone-800">No Conditions Assessed Yet</p>
          <p className="text-xs text-stone-500 mt-1 max-w-md mx-auto">
            Click &quot;Assess Condition&quot; to record permission, mentoring, or capability conditions before pilot authorization.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-stone-200">
          {latestConditions.map((cond) => (
            <div key={cond.id} className="py-4 first:pt-0 last:pb-0 space-y-2">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-stone-900 bg-stone-100 px-2.5 py-1 rounded border border-stone-300">
                    {cond.condition_key}
                  </span>
                  <ConditionStatusBadge status={cond.status} size="sm" />
                  <span className="text-xs font-mono text-stone-500">v{cond.version}</span>
                </div>
                <span className="text-xs font-mono text-stone-400">
                  Assessed {new Date(cond.assessed_at).toLocaleDateString()}
                </span>
              </div>

              <p className="text-xs text-stone-700 leading-relaxed font-sans">
                {cond.rationale}
              </p>

              {/* Exact Commitment Dependency Block */}
              {cond.commitment_dependency_ids && cond.commitment_dependency_ids.length > 0 && (
                <div className="mt-2 bg-[#FAF8F5] border border-stone-200 rounded p-2.5 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-stone-500 font-mono text-[11px] font-semibold uppercase tracking-wider">
                    <LinkIcon className="w-3 h-3 text-[#F95700]" />
                    Depends on ({cond.commitment_dependency_ids.length}):
                  </div>
                  {cond.commitment_dependency_ids.map((depId) => (
                    <div key={depId} className="font-mono text-xs font-semibold text-stone-800 bg-white px-2 py-1 rounded border border-stone-200 inline-block mr-2 mt-1">
                      {getCommitmentLabel(depId)}
                    </div>
                  ))}
                </div>
              )}

              {cond.valid_until && (
                <div className="flex items-center gap-1.5 text-[11px] font-mono text-stone-500">
                  <Calendar className="w-3 h-3 text-stone-400" />
                  <span>Valid until: {new Date(cond.valid_until).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
