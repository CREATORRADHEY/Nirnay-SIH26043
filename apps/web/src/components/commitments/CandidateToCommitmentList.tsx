import React from "react";
import { Building2, Plus } from "lucide-react";
import type { HEICandidateResponse, HEIOrganization, CommitmentResponse } from "@/lib/types/challenge";
import { CommitmentStatusBadge } from "./CommitmentStatusBadge";

interface Props {
  candidates: HEICandidateResponse[];
  organizations: HEIOrganization[];
  commitments: CommitmentResponse[];
  onRecordCommitment: (candidateOrg: { organization_id: string; name: string }) => void;
}

export function CandidateToCommitmentList({
  candidates,
  organizations,
  commitments,
  onRecordCommitment,
}: Props) {
  if (candidates.length === 0) {
    return (
      <div className="bg-white border border-stone-200 rounded-lg p-6 my-6 text-center">
        <Building2 className="w-8 h-8 text-stone-400 mx-auto mb-2" />
        <h4 className="text-sm font-serif font-bold text-stone-800">No Candidate HEIs Matched Yet</h4>
        <p className="text-xs text-stone-500 mt-1">
          Match HEI candidates under the HEI Match tab before recording formal commitments.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-stone-200 rounded-lg p-6 my-6">
      <div className="flex items-center justify-between pb-4 border-b border-stone-200 mb-4">
        <div>
          <h3 className="text-sm font-serif font-bold text-stone-900">
            Matched Candidate Institutions ({candidates.length})
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Record explicit institutional commitments for matched candidates.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {candidates.map((cand) => {
          const org = organizations.find((o) => o.organization_id === cand.organization_id);
          const orgName = org ? org.name : `HEI ${cand.organization_id.slice(0, 8)}...`;

          // Latest commitments for this candidate org
          const candidateCommitments = commitments
            .filter((c) => c.organization_id === cand.organization_id)
            .sort((a, b) => b.version - a.version);

          const latestCommitment = candidateCommitments[0];

          return (
            <div
              key={cand.id}
              className="bg-[#FAF8F5] border border-stone-200 rounded-lg p-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-sm font-serif font-bold text-stone-900">
                    {orgName}
                  </h4>
                  {latestCommitment && (
                    <CommitmentStatusBadge status={latestCommitment.status} size="sm" />
                  )}
                </div>

                <p className="text-xs text-stone-600 mt-1 font-sans">
                  <span className="font-semibold text-stone-700">Rationale:</span> {cand.rationale}
                </p>

                {org?.active_capabilities && org.active_capabilities.length > 0 && (
                  <div className="mt-2 text-[11px] text-stone-500 font-mono">
                    <span className="font-semibold text-stone-700">Capabilities:</span>{" "}
                    {org.active_capabilities.map((c) => c.name).join(", ")}
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-stone-200/80 flex items-center justify-between">
                <span className="text-xs font-mono text-stone-500">
                  {candidateCommitments.length > 0
                    ? `${candidateCommitments.length} Version(s)`
                    : "No Commitment Yet"}
                </span>
                <button
                  onClick={() => onRecordCommitment({ organization_id: cand.organization_id, name: orgName })}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#F95700] text-white rounded hover:bg-[#d84b00] transition-colors shadow-2xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Record Commitment
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
