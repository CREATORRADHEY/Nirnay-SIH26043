"use client";

import { useState } from "react";
import {
  Building2,
  CheckCircle2,
  FileCheck2,
  ShieldCheck,
  Tag,
  UserCheck,
  ArrowUpRight,
  Sparkles,
  LayoutDashboard,
  Compass,
  FileText,
  Users,
  CheckSquare,
  Activity,
  Award,
  Search,
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
    { label: "Intake", status: "complete" },
    { label: "Qualify", status: "complete" },
    { label: "Match", status: "active" },
    { label: "Commit", status: "pending" },
    { label: "Readiness", status: "pending" },
    { label: "Pilot", status: "pending" },
  ];

  return (
    <div className="w-full bg-white rounded-2xl border border-[#E7E5E4] shadow-xl shadow-stone-200/50 overflow-hidden text-[#1C1917] transition-all duration-300">
      {/* Top App Header & Search Bar (Real App Shell feel, minimal browser chrome) */}
      <div className="bg-[#FAF9F6] border-b border-[#E7E5E4] px-4 py-2.5 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          {/* Subtle NIRNAY App Badge */}
          <div className="w-5 h-5 rounded bg-[#1C1917] text-white flex items-center justify-center font-serif text-[10px] font-bold">
            N
          </div>
          <span className="font-semibold text-stone-800 tracking-tight">
            NIRNAY Passport
          </span>
          <span className="text-stone-300">|</span>
          <span className="text-stone-500 font-mono text-[11px]">Ranchi District</span>
        </div>

        {/* Search Input Mock */}
        <div className="hidden sm:flex items-center gap-2 bg-white px-2.5 py-1 rounded-md border border-[#E7E5E4] text-stone-400 text-[11px] w-48">
          <Search className="w-3 h-3 text-stone-400" />
          <span>Search passport records...</span>
        </div>

        {/* Discreet DEMO DATA label + Actor badge */}
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200/80 rounded font-mono text-[10px] font-semibold tracking-wide uppercase">
            DEMO DATA
          </span>
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-stone-600 bg-white px-2 py-0.5 rounded border border-[#E7E5E4]">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-medium">Aditi Verma</span>
          </div>
        </div>
      </div>

      {/* Main App Layout: Left Sidebar + Passport Main Content */}
      <div className="flex min-h-[440px]">
        {/* Small App Navigation Sidebar */}
        <div className="w-12 bg-[#FAF9F6] border-r border-[#E7E5E4] py-3 flex flex-col items-center gap-4 text-stone-500 shrink-0">
          <button className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 transition-colors" title="Explorer">
            <Compass className="w-4 h-4" />
          </button>
          <button className="p-1.5 rounded-lg bg-amber-500/10 text-[#EA580C] font-semibold" title="Passport">
            <FileText className="w-4 h-4" />
          </button>
          <button className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 transition-colors" title="HEI Matching">
            <Users className="w-4 h-4" />
          </button>
          <button className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 transition-colors" title="Commitments">
            <CheckSquare className="w-4 h-4" />
          </button>
          <button className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 transition-colors" title="Readiness">
            <ShieldCheck className="w-4 h-4" />
          </button>
          <button className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 transition-colors" title="Pilots">
            <Activity className="w-4 h-4" />
          </button>
          <button className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 transition-colors" title="Outcomes">
            <Award className="w-4 h-4" />
          </button>
        </div>

        {/* Passport Workspace Area */}
        <div className="flex-1 p-4 sm:p-5 space-y-4 overflow-x-hidden bg-white">
          {/* Passport Header */}
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2 py-0.5 text-[10px] font-mono font-semibold rounded bg-[#F2EFE9] text-stone-700 border border-[#E7E5E4]">
                ID: PASSPORT-2026-RN-04
              </span>
              <span className="px-2 py-0.5 text-[10px] font-mono font-semibold rounded bg-amber-50 text-amber-800 border border-amber-200">
                INNOVATION_CHALLENGE
              </span>
            </div>

            <h3 className="font-serif text-lg sm:text-xl font-bold text-[#1C1917] tracking-tight leading-snug">
              Sustainable Water Management for Semi-Urban Towns
            </h3>
            <p className="text-xs text-stone-500 font-medium mt-0.5">
              Ranchi, Jharkhand • Urban Infrastructure Domain
            </p>

            <div className="flex flex-wrap gap-1.5 mt-2.5">
              <span className="px-2.5 py-0.5 text-[11px] rounded-full bg-[#F4F1EA] text-stone-600 border border-[#E7E5E4] font-medium inline-flex items-center gap-1">
                <Tag className="w-3 h-3 text-[#EA580C]" /> Environment
              </span>
              <span className="px-2.5 py-0.5 text-[11px] rounded-full bg-[#F4F1EA] text-stone-600 border border-[#E7E5E4] font-medium">
                Urban Development
              </span>
              <span className="px-2.5 py-0.5 text-[11px] rounded-full bg-[#F4F1EA] text-stone-600 border border-[#E7E5E4] font-medium">
                Citizen Reported
              </span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="border-b border-[#E7E5E4] flex gap-1 overflow-x-auto pb-0 scrollbar-none">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-2 text-xs font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
                  activeTab === tab
                    ? "border-[#EA580C] text-[#EA580C] font-semibold"
                    : "border-transparent text-stone-500 hover:text-stone-800"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Workflow Progress Stepper */}
          <div className="bg-[#FAF9F6] p-3 rounded-xl border border-[#E7E5E4]">
            <div className="flex items-center justify-between text-[11px] font-medium text-stone-600 mb-2">
              <span className="uppercase tracking-wider font-semibold text-stone-800">
                Progress to Pilot
              </span>
              <span className="text-[#EA580C] font-mono text-[10px]">Phase 3 of 6 (Candidate Matching)</span>
            </div>
            <div className="grid grid-cols-6 gap-1.5">
              {steps.map((step, idx) => (
                <div key={idx} className="flex flex-col gap-1">
                  <div
                    className={`h-1.5 rounded-full ${
                      step.status === "complete"
                        ? "bg-emerald-600"
                        : step.status === "active"
                        ? "bg-[#EA580C]"
                        : "bg-stone-200"
                    }`}
                  />
                  <span
                    className={`text-[10px] truncate text-center font-medium ${
                      step.status === "active"
                        ? "text-[#EA580C] font-bold"
                        : step.status === "complete"
                        ? "text-stone-800"
                        : "text-stone-400"
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
              <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">
                HEI Candidate Matching (Candidate / Potential Match)
              </span>
              <span className="text-[11px] font-medium text-[#EA580C] inline-flex items-center gap-1 bg-[#FFF4EE] px-2 py-0.5 rounded border border-[#FCD8C5]">
                <Sparkles className="w-3 h-3" /> 2 HEIs identified as candidates
              </span>
            </div>

            {/* Candidate Card 1 */}
            <div className="p-3 rounded-xl border border-[#E7E5E4] bg-white hover:border-[#EA580C] transition-colors space-y-2 shadow-xs">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-[#F4F1EA] text-[#EA580C]">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#1C1917]">
                      Birla Institute of Technology, Mesra
                    </h4>
                    <p className="text-[11px] text-stone-500">
                      Dept of Environmental Engineering • Ranchi
                    </p>
                  </div>
                </div>
                <span className="px-2 py-0.5 text-[10px] font-mono font-medium rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Potential Match
                </span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                Specialized expertise in decentralized water filtration & GIS aquifer mapping.
              </p>
              <div className="flex items-center justify-between pt-1 border-t border-stone-100 text-[11px]">
                <span className="text-stone-500 italic text-[10px]">
                  Status: Candidate Only (Matching != Commitment)
                </span>
                <span className="text-[#EA580C] font-medium inline-flex items-center gap-0.5 text-[11px]">
                  View Capability Profile <ArrowUpRight className="w-3 h-3" />
                </span>
              </div>
            </div>

            {/* Candidate Card 2 */}
            <div className="p-2.5 rounded-xl border border-[#E7E5E4] bg-[#FAF9F6] space-y-1.5 opacity-90">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-white text-stone-500 border border-[#E7E5E4]">
                    <Building2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#1C1917]">
                      National Institute of Technology, Jamshedpur
                    </h4>
                    <p className="text-[10px] text-stone-500">
                      Water Resources Research Group
                    </p>
                  </div>
                </div>
                <span className="px-2 py-0.5 text-[10px] font-mono font-medium rounded bg-[#F4F1EA] text-stone-600 border border-[#E7E5E4]">
                  Potential Match
                </span>
              </div>
            </div>
          </div>

          {/* Small Key Details Panel */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#E7E5E4] text-center">
            <div className="p-2 rounded-lg bg-[#FAF9F6] border border-[#E7E5E4]">
              <span className="block text-[9px] text-stone-500 font-semibold uppercase tracking-wider">
                Evidence Dossier
              </span>
              <span className="text-xs font-bold text-[#1C1917] inline-flex items-center gap-1 mt-0.5">
                <FileCheck2 className="w-3 h-3 text-emerald-600" /> 4 Records
              </span>
            </div>
            <div className="p-2 rounded-lg bg-[#FAF9F6] border border-[#E7E5E4]">
              <span className="block text-[9px] text-stone-500 font-semibold uppercase tracking-wider">
                Qualification
              </span>
              <span className="text-xs font-bold text-[#1C1917] inline-flex items-center gap-1 mt-0.5">
                <ShieldCheck className="w-3 h-3 text-[#EA580C]" /> Verified
              </span>
            </div>
            <div className="p-2 rounded-lg bg-[#FAF9F6] border border-[#E7E5E4]">
              <span className="block text-[9px] text-stone-500 font-semibold uppercase tracking-wider">
                Pilot Readiness
              </span>
              <span className="text-xs font-bold text-[#1C1917] inline-flex items-center gap-1 mt-0.5">
                <UserCheck className="w-3 h-3 text-stone-500" /> Audit Pending
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
