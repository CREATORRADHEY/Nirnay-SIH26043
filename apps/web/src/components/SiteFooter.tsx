"use client";

import Link from "next/link";

export function SiteFooter() {
  return (
    <footer id="about" className="bg-[var(--background)] py-10 border-t border-[var(--border)] text-xs text-[var(--text-secondary)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <span className="font-bold text-[var(--text-primary)]">NIRNAY</span> — Societal Innovation Collaboration & Readiness Platform (SIH26043)
          <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
            Team CREATORZZZ • Hackathon Prototype (Synthetic Demo Data)
          </p>
        </div>
        <div className="flex items-center gap-6">
          <Link href="#workflow" className="hover:text-[var(--text-primary)] transition-colors">
            Workflow
          </Link>
          <Link href="#ecosystem" className="hover:text-[var(--text-primary)] transition-colors">
            Ecosystem
          </Link>
          <Link href="/demo" className="hover:text-[var(--text-primary)] transition-colors">
            Demo Architecture
          </Link>
        </div>
      </div>
    </footer>
  );
}
