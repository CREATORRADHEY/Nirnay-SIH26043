"use client";

import { Building2, Sparkles, ArrowUpRight } from "lucide-react";
import { HEICandidateResponse, HEIOrganization } from "@/lib/types/challenge";

interface CandidateListProps {
  candidates: HEICandidateResponse[];
  organizations: HEIOrganization[];
  onInspectCapabilities: (orgId: string) => void;
}

export function CandidateList({
  candidates,
  organizations,
  onInspectCapabilities,
}: CandidateListProps) {
  if (candidates.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[var(--primary)]" />
          <span>Candidate HEIs ({candidates.length})</span>
        </h3>
        <span className="text-[10px] font-mono text-[var(--primary)] bg-[#FFF4EE] px-2 py-0.5 rounded border border-[#FCD8C5]">
          NON-BINDING CANDIDATE MATCHES
        </span>
      </div>

      <div className="space-y-3">
        {candidates.map((cand) => {
          const org = organizations.find((o) => o.organization_id === cand.organization_id);
          const orgName = org ? org.name : `Organization ${cand.organization_id.slice(0, 8)}...`;
          const location = org ? `${org.district || ""}, ${org.state}` : "Jharkhand";

          return (
            <div
              key={cand.id}
              className="p-4 rounded-xl border border-[#C6E7D0] bg-[#F4F9F5] space-y-2.5 shadow-xs"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded bg-[#EBF5EE] text-[#166534]">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">
                      {orgName}
                    </h4>
                    <p className="text-[11px] text-[var(--text-secondary)]">{location}</p>
                  </div>
                </div>

                <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold rounded-full bg-[#EBF5EE] text-[#166534] border border-[#C6E7D0]">
                  Potential Match
                </span>
              </div>

              <p className="text-xs text-[var(--text-primary)] leading-relaxed">
                <span className="font-bold text-[var(--text-secondary)]">Rationale:</span> {cand.rationale}
              </p>

              <div className="pt-2 border-t border-[#D5EAD9] flex flex-wrap items-center justify-between text-[11px] text-[var(--text-secondary)]">
                <span className="font-mono">Method: {cand.match_method}</span>
                <span>Identified: {new Date(cand.created_at).toLocaleDateString("en-IN")}</span>
                <button
                  onClick={() => onInspectCapabilities(cand.organization_id)}
                  className="text-[var(--primary)] font-semibold inline-flex items-center gap-0.5 hover:underline"
                >
                  View Capabilities <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
