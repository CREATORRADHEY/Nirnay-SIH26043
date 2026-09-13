import React from "react";
import Link from "next/link";
import { ArrowRight, Shield, Compass } from "lucide-react";
import { PresenterGuide } from "@/components/demo/PresenterGuide";
import { SystemCheck } from "@/components/demo/SystemCheck";

export const metadata = {
  title: "NIRNAY | Jury Demo Launchpad",
  description: "Two decisions that protect real-world innovation.",
};

export default function JuryDemoPage() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1C1917] px-6 py-10 max-w-6xl mx-auto font-sans">
      {/* Header */}
      <header className="mb-10 pb-8 border-b border-[#E7E5E4]">
        <div className="flex items-center gap-3 mb-4">
          <span className="px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300/60 rounded-full font-mono text-xs font-semibold uppercase tracking-wider">
            NIRNAY JURY DEMO
          </span>
          <span className="text-xs font-mono text-stone-500">SIH26043 — Team CREATORZZZ</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#1C1917] leading-tight mb-4">
          Two decisions that protect real-world innovation.
        </h1>
        <p className="text-stone-600 text-base sm:text-lg max-w-3xl leading-relaxed font-normal">
          NIRNAY prevents weak assumptions from silently becoming pilot approvals or impact claims.
          Demonstrate how automated dependency invalidation and execution/evidence separation protect societal outcomes.
        </p>
      </header>

      {/* Presenter Guide */}
      <PresenterGuide />

      {/* System Check */}
      <SystemCheck />

      {/* Golden Scenarios Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 my-10">
        {/* Scenario A */}
        <div className="bg-white rounded-2xl border border-[#E7E5E4] p-8 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono font-bold text-xs uppercase tracking-widest text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200/80">
                01 DEPENDENCY INTEGRITY
              </span>
              <span className="text-xs text-stone-400 font-mono">Jharkhand Urban Challenge</span>
            </div>

            <h2 className="font-serif text-2xl font-bold text-[#1C1917] mb-3 leading-snug">
              Ready can become not ready.
            </h2>

            <p className="text-stone-600 text-sm leading-relaxed mb-6">
              If a commitment that pilot readiness relied upon is withdrawn, NIRNAY preserves the old approval audit history but automatically reopens readiness for human review.
            </p>

            {/* Workflow Diagram */}
            <div className="bg-[#FAF9F6] rounded-xl p-4 border border-[#E7E5E4] mb-6 font-mono text-xs space-y-2">
              <div className="flex items-center justify-between text-stone-700">
                <span>ACCEPTED COMMITMENT</span>
                <span className="text-emerald-700 font-semibold">v1 ACCEPTED</span>
              </div>
              <div className="flex items-center justify-between text-stone-700">
                <span>READINESS DECISION</span>
                <span className="text-emerald-700 font-semibold">v1 PILOT_READY</span>
              </div>
              <div className="border-t border-dashed border-stone-300 pt-2 flex items-center justify-between text-amber-800 font-medium">
                <span>COMMITMENT WITHDRAWN</span>
                <span className="text-amber-700">v2 WITHDRAWN</span>
              </div>
              <div className="flex items-center justify-between text-amber-900 font-bold bg-amber-100/60 p-2 rounded border border-amber-200">
                <span>AUTOMATIC RE-EVALUATION</span>
                <span className="text-amber-800">v2 REVIEW_REQUIRED</span>
              </div>
            </div>
          </div>

          <div>
            <div className="text-xs text-stone-500 mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-600" />
              Target Live Interaction: ~60 Seconds
            </div>
            <Link
              href="/challenges/c0a80001-0000-4000-8000-000000000001"
              className="inline-flex items-center justify-center w-full gap-2 px-5 py-3 rounded-xl bg-[#1C1917] text-white font-medium text-sm hover:bg-stone-800 transition-colors shadow-sm"
            >
              Open Scenario A (Ward 12 Waste Challenge) <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Scenario B */}
        <div className="bg-white rounded-2xl border border-[#E7E5E4] p-8 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono font-bold text-xs uppercase tracking-widest text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200/80">
                02 EVIDENCE INTEGRITY
              </span>
              <span className="text-xs text-stone-400 font-mono">Hazaribagh Vendor Pilot</span>
            </div>

            <h2 className="font-serif text-2xl font-bold text-[#1C1917] mb-3 leading-snug">
              Completed does not mean proven.
            </h2>

            <p className="text-stone-600 text-sm leading-relaxed mb-6">
              NIRNAY keeps execution operational status separate from evidence outcome conclusions. A finished pilot cannot automatically become an impact claim.
            </p>

            {/* Workflow Diagram */}
            <div className="bg-[#FAF9F6] rounded-xl p-4 border border-[#E7E5E4] mb-6 font-mono text-xs space-y-2">
              <div className="flex items-center justify-between text-stone-700">
                <span>OPERATIONAL STATE</span>
                <span className="text-sky-700 font-semibold">v2 ACTIVE</span>
              </div>
              <div className="flex items-center justify-between text-stone-700">
                <span>PRE-DECLARED PLAN</span>
                <span className="text-stone-700 font-medium">Baseline 41% / Denominator 240</span>
              </div>
              <div className="border-t border-dashed border-stone-300 pt-2 flex items-center justify-between text-stone-800 font-medium">
                <span>UPDATE LIFECYCLE</span>
                <span className="text-emerald-700 font-semibold">v3 COMPLETED</span>
              </div>
              <div className="flex items-center justify-between text-amber-900 font-bold bg-amber-100/60 p-2 rounded border border-amber-200">
                <span>HUMAN OUTCOME EVALUATION</span>
                <span className="text-amber-800">INCONCLUSIVE</span>
              </div>
            </div>
          </div>

          <div>
            <div className="text-xs text-stone-500 mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-600" />
              Target Live Interaction: ~75 Seconds
            </div>
            <Link
              href="/pilots/b0a80002-0000-4000-8000-000000000006"
              className="inline-flex items-center justify-center w-full gap-2 px-5 py-3 rounded-xl bg-amber-600 text-white font-medium text-sm hover:bg-amber-700 transition-colors shadow-sm"
            >
              Open Scenario B (Cold Chain Pilot Workspace) <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Navigation Footer */}
      <footer className="mt-12 pt-8 border-t border-[#E7E5E4] flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
        <div className="flex items-center gap-4">
          <Link href="/challenges" className="hover:text-stone-900 font-medium flex items-center gap-1.5">
            <Compass className="w-4 h-4" /> Challenge Explorer
          </Link>
          <span>•</span>
          <Link href="/" className="hover:text-stone-900 font-medium">
            Landing Overview
          </Link>
        </div>
        <div className="font-mono text-stone-400">
          NIRNAY SIH26043 — Feature Freeze & Golden Jury Mode Active
        </div>
      </footer>
    </div>
  );
}
