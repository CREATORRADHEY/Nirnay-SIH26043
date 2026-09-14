"use client";

import { X, Building2 } from "lucide-react";
import { HEIOrganization } from "@/lib/types/challenge";

interface CapabilityInspectionSheetProps {
  organization: HEIOrganization | null;
  onClose: () => void;
}

export function CapabilityInspectionSheet({
  organization,
  onClose,
}: CapabilityInspectionSheetProps) {
  if (!organization) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/30 backdrop-blur-xs p-0 sm:p-4">
      <div className="w-full max-w-lg h-full sm:h-auto max-h-[90vh] bg-[var(--surface)] border border-[var(--border)] rounded-none sm:rounded-xl shadow-xl flex flex-col overflow-hidden text-xs text-[var(--text-primary)]">
        {/* Sheet Header */}
        <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between bg-[#F9F7F2]">
          <div className="flex items-center gap-2.5">
            <Building2 className="w-5 h-5 text-[var(--primary)]" />
            <div>
              <h3 className="font-extrabold text-sm text-[var(--text-primary)]">
                HEI Capability Dossier
              </h3>
              <p className="text-[11px] text-[var(--text-secondary)]">
                {organization.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-[#E8E4D9] text-[var(--text-secondary)] focus:outline-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="p-3.5 rounded-lg bg-[#F4F1EA] border border-[var(--border)] space-y-1 text-xs">
            <span className="font-bold text-[var(--text-primary)]">Location & Type:</span>
            <p className="text-[var(--text-secondary)]">
              {organization.organization_type} • {organization.district ? `${organization.district}, ${organization.state}` : organization.state}
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold uppercase tracking-wider text-[10px] text-[var(--text-secondary)]">
              Active Institutional Capabilities ({organization.active_capabilities.length})
            </h4>

            {organization.active_capabilities.map((cap) => (
              <div
                key={cap.id}
                className="p-4 rounded-lg border border-[var(--border)] bg-[var(--background)] space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-[#FFF4EE] text-[var(--primary)] border border-[#FCD8C5]">
                    {cap.capability_type}
                  </span>
                  {cap.discipline && (
                    <span className="text-[11px] text-[var(--text-secondary)] font-medium">
                      {cap.discipline}
                    </span>
                  )}
                </div>

                <h5 className="font-bold text-xs text-[var(--text-primary)]">{cap.name}</h5>

                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {cap.description || "No specific capability description provided."}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Sheet Footer */}
        <div className="px-6 py-3 border-t border-[var(--border)] bg-[#F9F7F2] text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-[var(--primary)] text-white text-xs font-semibold hover:bg-[var(--primary-hover)] transition-colors"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
}
