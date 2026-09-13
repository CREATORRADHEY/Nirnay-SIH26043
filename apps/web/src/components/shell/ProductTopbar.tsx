"use client";

import { useState } from "react";
import { Search, Menu, ShieldAlert, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface ProductTopbarProps {
  onToggleMobileMenu?: () => void;
  isDemo?: boolean;
}

export function ProductTopbar({ onToggleMobileMenu, isDemo = true }: ProductTopbarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <header className="h-16 border-b border-[var(--border)] bg-[var(--background)] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="p-1.5 rounded text-[var(--text-primary)] hover:bg-[#F2EFE9] lg:hidden focus:outline-none"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <Link
          href="/"
          className="hidden sm:inline-flex items-center gap-1 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mr-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Site
        </Link>

        {/* Global Search Bar */}
        <div className="relative w-48 sm:w-64">
          <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-[var(--text-secondary)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search challenges, IDs..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-[var(--primary)] transition-colors"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Discreet DEMO MODE Indicator */}
        {isDemo && (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#F2EFE9] border border-[var(--border)] text-[11px] font-mono text-[var(--text-secondary)]">
            <ShieldAlert className="w-3.5 h-3.5 text-[var(--primary)]" />
            <span>DEMO MODE</span>
          </div>
        )}
        
      </div>
    </header>
  );
}
