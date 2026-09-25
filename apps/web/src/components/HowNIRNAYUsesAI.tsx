"use client";

import React from "react";
import { Sparkles, ShieldAlert, CheckCircle2, Zap } from "lucide-react";

export function HowNIRNAYUsesAI() {
  return (
    <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 text-stone-100 rounded-xl p-6 border border-stone-700 shadow-xl space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-stone-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg border border-amber-500/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-wide uppercase">How NIRNAY Uses AI</h2>
            <p className="text-xs text-stone-400">Canonical 4-Capability Governance & Non-Authoritative Boundary Model</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-stone-800 text-stone-300 rounded-full text-[11px] font-mono border border-stone-700">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>Core Workflow Works Without AI</span>
        </div>
      </div>

      {/* 4 Canonical Capabilities */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="p-3 bg-stone-800/80 rounded-lg border border-stone-700 space-y-1">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>1. Structure</span>
          </div>
          <p className="text-[11px] text-stone-300 leading-snug">
            Structures raw, messy Hinglish/English text into draft challenge fields & extracts missing fields.
          </p>
        </div>

        <div className="p-3 bg-stone-800/80 rounded-lg border border-stone-700 space-y-1">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>2. Summarize</span>
          </div>
          <p className="text-[11px] text-stone-300 leading-snug">
            Summarizes evidence metadata, uploaded reports, and multi-party clarification histories.
          </p>
        </div>

        <div className="p-3 bg-stone-800/80 rounded-lg border border-stone-700 space-y-1">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>3. Suggest</span>
          </div>
          <p className="text-[11px] text-stone-300 leading-snug">
            Suggests advisory qualification routes & matches candidates from authorized HEI capability sets.
          </p>
        </div>

        <div className="p-3 bg-stone-800/80 rounded-lg border border-stone-700 space-y-1">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>4. Find Patterns</span>
          </div>
          <p className="text-[11px] text-stone-300 leading-snug">
            Detects potential duplicate submissions & highlights recurring issue patterns across districts.
          </p>
        </div>
      </div>

      {/* Strict Prohibition Box */}
      <div className="p-4 bg-rose-950/40 rounded-lg border border-rose-800/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-rose-200 uppercase tracking-wide">
              Strict AI Prohibition Boundary — What AI Cannot Do
            </h4>
            <p className="text-[11px] text-rose-300 leading-relaxed">
              AI cannot approve/reject challenges, declare citizen genuineness, record qualification routes,
              accept commitments, authorize readiness, resolve reviewer disagreement, decide appeals, or declare outcome impact.
            </p>
          </div>
        </div>
        <div className="px-3 py-1.5 bg-rose-900/60 text-rose-100 rounded text-xs font-mono font-bold whitespace-nowrap border border-rose-700">
          AI = Advisory Only
        </div>
      </div>
    </div>
  );
}
