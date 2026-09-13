"use client";

import { ArrowRight, Play, ShieldCheck, CheckCircle, FileText } from "lucide-react";
import { ProductPreview } from "./ProductPreview";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[var(--background)] pt-10 pb-16 md:pt-16 md:pb-24 border-b border-[var(--border)]">
      {/* Subtle Jharkhand terrain contour line geometry overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.035] flex items-center justify-center">
        <svg
          className="w-full h-full text-[#1A1A1A]"
          viewBox="0 0 1000 600"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M 0 400 Q 250 250 500 380 T 1000 300" />
          <path d="M 0 450 Q 300 320 600 420 T 1000 360" />
          <path d="M 0 500 Q 200 400 450 480 T 1000 420" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* Left Column: Asymmetric Editorial Hero Text */}
          <div className="lg:col-span-6 space-y-6">
            {/* Small Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F2EFE9] border border-[var(--border)] text-xs font-semibold tracking-wider text-[var(--text-secondary)] uppercase">
              <span className="w-2 h-2 rounded-full bg-[var(--primary)] animate-pulse" />
              FROM PUBLIC CHALLENGES TO A BRIGHTER TOMORROW
            </div>

            {/* Desktop Headline Concept (LOCKED COPY) */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[var(--text-primary)] tracking-tight leading-[1.15]">
              Right Problem. <br />
              <span className="text-[var(--primary)]">Ready Pilot.</span> <br />
              Proven Outcome.
            </h1>

            {/* Supporting Copy (LOCKED COPY) */}
            <p className="text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed max-w-xl">
              NIRNAY helps governments, HEIs and ecosystem partners turn
              real-world societal challenges into qualified problems,
              pilot-ready collaborations and evidence-backed outcomes.
            </p>

            {/* CTA Row */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <a
                href="#workflow"
                className="px-6 py-3.5 rounded-md bg-[var(--primary)] text-white font-medium text-sm hover:bg-[var(--primary-hover)] transition-all duration-200 shadow-sm inline-flex items-center gap-2 group cursor-pointer"
              >
                Start Review
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>

              <a
                href="#demo"
                className="px-6 py-3.5 rounded-md bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] font-medium text-sm hover:bg-[#F2EFE9] transition-all duration-200 inline-flex items-center gap-2 cursor-pointer"
              >
                <Play className="w-4 h-4 text-[var(--primary)] fill-current" />
                Watch Demo
              </a>
            </div>

            {/* Supporting Proof / Demo Information (NO FAKE ADOPTION STATS) */}
            <div className="pt-6 border-t border-[var(--border)] flex flex-wrap gap-x-6 gap-y-2 text-xs text-[var(--text-secondary)]">
              <span className="inline-flex items-center gap-1.5 font-medium">
                <CheckCircle className="w-4 h-4 text-[var(--success)]" /> Structured Qualification
              </span>
              <span className="inline-flex items-center gap-1.5 font-medium">
                <ShieldCheck className="w-4 h-4 text-[var(--primary)]" /> Human Pilot Sign-off
              </span>
              <span className="inline-flex items-center gap-1.5 font-medium">
                <FileText className="w-4 h-4 text-[var(--text-secondary)]" /> Evidence-linked Outcomes
              </span>
            </div>
          </div>

          {/* Right Column: Large Product UI Preview */}
          <div className="lg:col-span-6">
            <ProductPreview />
          </div>
        </div>
      </div>
    </section>
  );
}
