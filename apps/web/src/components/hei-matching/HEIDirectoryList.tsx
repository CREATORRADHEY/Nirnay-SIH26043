"use client";

import { ArrowUpRight, Plus, MapPin, Tag } from "lucide-react";
import { HEIOrganization } from "@/lib/types/challenge";

interface HEIDirectoryListProps {
  organizations: HEIOrganization[];
  candidateOrgIds: string[];
  onInspectCapabilities: (org: HEIOrganization) => void;
  onAddCandidate: (org: HEIOrganization) => void;
}

export function HEIDirectoryList({
  organizations,
  candidateOrgIds,
  onInspectCapabilities,
  onAddCandidate,
}: HEIDirectoryListProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
          Eligible HEI Directory ({organizations.length})
        </h3>
        <span className="text-[11px] text-[var(--text-secondary)]">
          Institutions with active capabilities
        </span>
      </div>

      <div className="divide-y divide-[var(--border)] rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
        {organizations.map((org) => {
          const isCandidate = candidateOrgIds.includes(org.organization_id);

          return (
            <div
              key={org.organization_id}
              className="p-5 hover:bg-[#FDFBF7] transition-colors space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                    <span className="font-mono text-[11px] px-2 py-0.2 bg-[#F2EFE9] rounded border border-[var(--border)] font-semibold">
                      {org.organization_type}
                    </span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
                      {org.district ? `${org.district}, ${org.state}` : org.state}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-[var(--text-primary)]">
                    {org.name}
                  </h4>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onInspectCapabilities(org)}
                    className="px-3 py-1.5 rounded border border-[var(--border)] bg-[var(--background)] text-xs font-semibold text-[var(--text-primary)] hover:bg-[#E8E4D9] transition-colors inline-flex items-center gap-1"
                  >
                    View Capabilities <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>

                  {isCandidate ? (
                    <span className="px-3 py-1.5 rounded bg-[#EBF5EE] text-[#166534] border border-[#C6E7D0] text-xs font-bold">
                      Already Candidate
                    </span>
                  ) : (
                    <button
                      onClick={() => onAddCandidate(org)}
                      className="px-3 py-1.5 rounded bg-[var(--primary)] text-white text-xs font-semibold hover:bg-[var(--primary-hover)] transition-colors inline-flex items-center gap-1 shadow-xs cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add as Candidate
                    </button>
                  )}
                </div>
              </div>

              {/* Capability Chips */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {org.active_capabilities.map((cap) => (
                  <span
                    key={cap.id}
                    className="px-2.5 py-0.5 text-xs rounded bg-[#F4F1EA] text-[var(--text-primary)] border border-[var(--border)] font-medium inline-flex items-center gap-1"
                  >
                    <Tag className="w-3 h-3 text-[var(--primary)]" />
                    {cap.name} {cap.discipline ? `(${cap.discipline})` : ""}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
