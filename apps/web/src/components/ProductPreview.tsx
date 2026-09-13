"use client";

import { useState } from "react";
import {
  Building2,
  MapPin,
  Tag,
  ShieldCheck,
  FileCheck2,
  ArrowUpRight,
  UserCheck,
  Sparkles,
} from "lucide-react";

export function ProductPreview() {
  const [activeTab, setActiveTab] = useState("HEI Match");

  const tabs = [
    "Overview",
    "Evidence",
    "Qualification",
    "HEI Match",
    "Commitments",
    "Pilot Readiness",
    "Outcomes",
  ];

  const steps = [
    { label: "Submitted", status: "complete" },
    { label: "Evidence", status: "complete" },
    { label: "Qualified", status: "complete" },
    { label: "HEI Match", status: "active" },
    { label: "Pilot Plan", status: "pending" },
    { label: "Outcome", status: "pending" },
  ];

  return (
    <div className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm overflow-hidden text-sm text-[var(--text-primary)]">
      {/* App Window Title Bar */}
      <div className="px-4 py-2.5 bg-[#F2EFE9] border-b border-[var(--border)] flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 rounded-full bg-[#E5B5A1]"></span>
          <span className="w-3 h-3 rounded-full bg-[#E5D2A1]"></span>
          <span className="w-3 h-3 rounded-full bg-[#BBE5A1]"></span>
          <span className="ml-3 text-xs font-mono text-[var(--text-secondary)]">
            nirnay.gov.in / passport / CHAL-2026-JH-042
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase bg-[#E8E4D9] text-[var(--text-secondary)] rounded border border-[var(--border)]">
            DEMO DATA
          </span>
        </div>
      </div>

      {/* Main Container */}
      <div className="p-5 space-y-5">
        {/* Header Metadata */}
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-secondary)] mb-1.5">
            <span className="inline-flex items-center gap-1 font-medium text-[var(--primary)]">
              <ShieldCheck className="w-3.5 h-3.5" /> Qualified Problem
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[var(--text-secondary)]" /> Ranchi, Jharkhand
            </span>
            <span>•</span>
            <span className="font-mono">ID: CHAL-2026-JH-042</span>
          </div>

          <h3 className="text-lg font-bold tracking-tight text-[var(--text-primary)]">
            Sustainable Water Management for Semi-Urban Towns
          </h3>

          <div className="flex flex-wrap gap-1.5 mt-2.5">
            <span className="px-2.5 py-0.5 text-xs rounded-full bg-[#F4F1EA] text-[var(--text-secondary)] border border-[var(--border)] font-medium inline-flex items-center gap-1">
              <Tag className="w-3 h-3 text-[var(--primary)]" /> Environment
            </span>
            <span className="px-2.5 py-0.5 text-xs rounded-full bg-[#F4F1EA] text-[var(--text-secondary)] border border-[var(--border)] font-medium">
              Urban Development
            </span>
            <span className="px-2.5 py-0.5 text-xs rounded-full bg-[#F4F1EA] text-[var(--text-secondary)] border border-[var(--border)] font-medium">
              Citizen Reported
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-[var(--border)] flex gap-1 overflow-x-auto pb-0">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-2 text-xs font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
                activeTab === tab
                  ? "border-[var(--primary)] text-[var(--primary)] font-semibold"
                  : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Workflow Progress Stepper */}
        <div className="bg-[#F9F7F2] p-3.5 rounded-lg border border-[var(--border)]">
          <div className="flex items-center justify-between text-[11px] font-medium text-[var(--text-secondary)] mb-2.5">
            <span className="uppercase tracking-wider font-semibold text-[var(--text-primary)]">
              Progress to Pilot
            </span>
            <span className="text-[var(--primary)] font-mono">Phase 4 of 6</span>
          </div>
          <div className="grid grid-cols-6 gap-1.5">
            {steps.map((step, idx) => (
              <div key={idx} className="flex flex-col gap-1">
                <div
                  className={`h-1.5 rounded-full ${
                    step.status === "complete"
                      ? "bg-[var(--success)]"
                      : step.status === "active"
                      ? "bg-[var(--primary)]"
                      : "bg-[#E2DFD6]"
                  }`}
                />
                <span
                  className={`text-[10px] truncate text-center font-medium ${
                    step.status === "active"
                      ? "text-[var(--primary)] font-bold"
                      : step.status === "complete"
                      ? "text-[var(--text-primary)]"
                      : "text-[var(--text-secondary)]"
                  }`}
                >
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Active Tab Content: Candidate HEI Matching Focus */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
              {activeTab === "HEI Match" ? "Candidate Matching Status" : activeTab}
            </span>
            <span className="text-xs font-medium text-[var(--primary)] inline-flex items-center gap-1 bg-[#FFF4EE] px-2 py-0.5 rounded border border-[#FCD8C5]">
              <Sparkles className="w-3 h-3" /> 2 HEIs identified as candidates
            </span>
          </div>

          {/* Candidate Card 1 */}
          <div className="p-3.5 rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] hover:border-[var(--primary)] transition-colors space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded bg-[#F4F1EA] text-[var(--primary)]">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[var(--text-primary)]">
                    Birla Institute of Technology, Mesra
                  </h4>
                  <p className="text-[11px] text-[var(--text-secondary)]">
                    Dept of Environmental Engineering • Ranchi
                  </p>
                </div>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-mono font-medium rounded bg-[#EBF5EE] text-[#166534] border border-[#C6E7D0]">
                Potential Match
              </span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Specialized expertise in decentralized water filtration & GIS aquifer mapping.
            </p>
            <div className="flex items-center justify-between pt-1 border-t border-[#F0EDF3] text-[11px]">
              <span className="text-[var(--text-secondary)] italic">
                Status: Under Review (No commitment binding)
              </span>
              <button className="text-[var(--primary)] font-medium inline-flex items-center gap-0.5 hover:underline">
                View Capability Profile <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Candidate Card 2 */}
          <div className="p-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--primary)] transition-colors space-y-2 opacity-90">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded bg-[#F4F1EA] text-[var(--text-secondary)]">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[var(--text-primary)]">
                    National Institute of Technology, Jamshedpur
                  </h4>
                  <p className="text-[11px] text-[var(--text-secondary)]">
                    Water Resources Research Group
                  </p>
                </div>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-mono font-medium rounded bg-[#EBF5EE] text-[var(--text-secondary)] border border-[var(--border)]">
                Potential Match
              </span>
            </div>
          </div>
        </div>

        {/* Small Key Details Panel */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[var(--border)] text-center">
          <div className="p-2 rounded bg-[#F9F7F2] border border-[var(--border)]">
            <span className="block text-[10px] text-[var(--text-secondary)] font-medium uppercase">
              Evidence Dossier
            </span>
            <span className="text-xs font-bold text-[var(--text-primary)] inline-flex items-center gap-1 mt-0.5">
              <FileCheck2 className="w-3 h-3 text-[var(--success)]" /> 4 Records
            </span>
          </div>
          <div className="p-2 rounded bg-[#F9F7F2] border border-[var(--border)]">
            <span className="block text-[10px] text-[var(--text-secondary)] font-medium uppercase">
              Qualification
            </span>
            <span className="text-xs font-bold text-[var(--text-primary)] inline-flex items-center gap-1 mt-0.5">
              <ShieldCheck className="w-3 h-3 text-[var(--primary)]" /> Verified
            </span>
          </div>
          <div className="p-2 rounded bg-[#F9F7F2] border border-[var(--border)]">
            <span className="block text-[10px] text-[var(--text-secondary)] font-medium uppercase">
              Pilot Readiness
            </span>
            <span className="text-xs font-bold text-[var(--text-primary)] inline-flex items-center gap-1 mt-0.5">
              <UserCheck className="w-3 h-3 text-[var(--text-secondary)]" /> Audit Pending
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
