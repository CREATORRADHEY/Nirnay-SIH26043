"use client";

import Link from "next/link";

export function SiteFooter() {
  return (
    <footer id="about" className="bg-[var(--background)] py-10 border-t border-[var(--border)] text-xs text-[var(--text-secondary)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <span className="font-bold text-[var(--text-primary)]">NIRNAY — SIH26043 | Team CREATORZZZ</span>
          <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
            Production-oriented MVP for proposed public-sector deployment.
          </p>
        </div>
        <div className="flex items-center gap-6">
          <Link href="#workflow" className="hover:text-[var(--text-primary)] transition-colors">
            Workflow
          </Link>
          <Link href="#ecosystem" className="hover:text-[var(--text-primary)] transition-colors">
            Ecosystem
          </Link>
          <Link href="/challenges" className="hover:text-[var(--text-primary)] transition-colors">
            Public Challenges
          </Link>
        </div>
      </div>
    </footer>
  );
}
