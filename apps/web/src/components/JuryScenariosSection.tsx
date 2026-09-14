"use client";

import Link from "next/link";
import { ArrowRight, Shield, Scale, Play } from "lucide-react";

export function JuryScenariosSection() {
  return (
    <section className="py-20 bg-[#FAF8F5] border-b border-stone-200">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-14">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-[#EA580C] uppercase font-mono mb-2">
              <span className="w-4 h-0.5 bg-[#EA580C]" />
              GOLDEN JURY DEMONSTRATIONS
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1C1917] tracking-tight font-serif leading-tight">
              Two decisions that protect real-world innovation.
            </h2>
          </div>

          <div className="max-w-md">
            <p className="text-sm text-stone-600 leading-relaxed font-normal">
              NIRNAY prevents weak assumptions from silently becoming pilot approvals or false impact claims.
            </p>
          </div>
        </div>

        {/* 2 Scenario Showcase Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Scenario A Card */}
          <div className="bg-white rounded-2xl border border-stone-200 p-8 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between relative overflow-hidden">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono font-bold text-xs uppercase tracking-widest text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                  01 DEPENDENCY INTEGRITY
                </span>
                <span className="text-xs text-stone-400 font-mono">Jharkhand Urban Challenge</span>
              </div>

              <h3 className="font-serif text-2xl font-bold text-[#1C1917] mb-3">
                Ready can become not ready.
              </h3>

              <p className="text-stone-600 text-sm leading-relaxed mb-6 font-normal">
                If an institutional commitment that pilot readiness relied upon is withdrawn, NIRNAY preserves historical audit logs but automatically invalidates readiness for human review.
              </p>

              {/* Workflow Stepper Diagram */}
              <div className="bg-[#FAF8F5] rounded-xl p-4 border border-stone-200 font-mono text-xs space-y-2 mb-6">
                <div className="flex items-center justify-between text-stone-700">
                  <span>ACCEPTED COMMITMENT</span>
                  <span className="text-emerald-700 font-bold">v1 ACCEPTED</span>
                </div>
                <div className="flex items-center justify-between text-stone-700">
                  <span>READINESS DECISION</span>
                  <span className="text-emerald-700 font-bold">v1 PILOT_READY</span>
                </div>
                <div className="border-t border-dashed border-stone-300 pt-2 flex items-center justify-between text-amber-800 font-medium">
                  <span>COMMITMENT WITHDRAWN</span>
                  <span className="text-amber-700 font-bold">v2 WITHDRAWN</span>
                </div>
                <div className="flex items-center justify-between text-amber-900 font-bold bg-amber-100/70 p-2 rounded border border-amber-200">
                  <span>AUTOMATIC RE-EVALUATION</span>
                  <span className="text-amber-800">v2 REVIEW_REQUIRED</span>
                </div>
              </div>
            </div>

            <div>
              <div className="text-xs text-stone-500 mb-4 flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#EA580C]" />
                Live Scenario Interaction: ~60 Seconds
              </div>
              <Link
                href="/challenges/c0a80001-0000-4000-8000-000000000001"
                className="inline-flex items-center justify-center w-full gap-2 px-5 py-3.5 rounded-xl bg-[#1C1917] text-white font-semibold text-sm hover:bg-stone-800 transition-colors shadow-sm cursor-pointer"
              >
                Launch Scenario A (Ward 12 Waste Challenge) <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Scenario B Card */}
          <div className="bg-white rounded-2xl border border-stone-200 p-8 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between relative overflow-hidden">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono font-bold text-xs uppercase tracking-widest text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  02 EVIDENCE INTEGRITY
                </span>
                <span className="text-xs text-stone-400 font-mono">Hazaribagh Vendor Pilot</span>
              </div>

              <h3 className="font-serif text-2xl font-bold text-[#1C1917] mb-3">
                Completed does not mean proven.
              </h3>

              <p className="text-stone-600 text-sm leading-relaxed mb-6 font-normal">
                NIRNAY keeps operational completion status separate from evidence outcome conclusions. A finished pilot cannot automatically become an impact claim.
              </p>

              {/* Workflow Stepper Diagram */}
              <div className="bg-[#FAF8F5] rounded-xl p-4 border border-stone-200 font-mono text-xs space-y-2 mb-6">
                <div className="flex items-center justify-between text-stone-700">
                  <span>OPERATIONAL STATE</span>
                  <span className="text-sky-700 font-bold">v2 ACTIVE</span>
                </div>
                <div className="flex items-center justify-between text-stone-700">
                  <span>PRE-DECLARED PLAN</span>
                  <span className="text-stone-700 font-medium">Baseline 41% / Denominator 240</span>
                </div>
                <div className="border-t border-dashed border-stone-300 pt-2 flex items-center justify-between text-stone-800 font-medium">
                  <span>UPDATE LIFECYCLE</span>
                  <span className="text-emerald-700 font-bold">v3 COMPLETED</span>
                </div>
                <div className="flex items-center justify-between text-amber-900 font-bold bg-amber-100/70 p-2 rounded border border-amber-200">
                  <span>HUMAN OUTCOME EVALUATION</span>
                  <span className="text-amber-800">INCONCLUSIVE</span>
                </div>
              </div>
            </div>

            <div>
              <div className="text-xs text-stone-500 mb-4 flex items-center gap-2">
                <Scale className="w-4 h-4 text-emerald-600" />
                Live Scenario Interaction: ~75 Seconds
              </div>
              <Link
                href="/pilots/b0a80002-0000-4000-8000-000000000006"
                className="inline-flex items-center justify-center w-full gap-2 px-5 py-3.5 rounded-xl bg-[#EA580C] text-white font-semibold text-sm hover:bg-[#C2410C] transition-colors shadow-sm cursor-pointer"
              >
                Launch Scenario B (Cold Chain Pilot Workspace) <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
