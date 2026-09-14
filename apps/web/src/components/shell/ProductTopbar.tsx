"use client";

import { useState } from "react";
import { Search, Menu, ShieldAlert, ArrowLeft, LogOut, User } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";

interface ProductTopbarProps {
  onToggleMobileMenu?: () => void;
  isDemo?: boolean;
}

export function ProductTopbar({ onToggleMobileMenu, isDemo = true }: ProductTopbarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    try {
      await logout();
    } catch {
      // ignore
    } finally {
      router.push("/login");
      window.location.href = "/login";
    }
  };

  return (
    <header className="h-16 border-b border-[var(--border)] bg-[var(--background)] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="p-1.5 rounded text-[var(--text-primary)] hover:bg-[#F2EFE9] lg:hidden focus:outline-none cursor-pointer"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <Link
          href="/"
          className="hidden sm:inline-flex items-center gap-1 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mr-2 font-medium"
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
          <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#F2EFE9] border border-[var(--border)] text-[11px] font-mono text-[var(--text-secondary)]">
            <ShieldAlert className="w-3.5 h-3.5 text-[var(--primary)]" />
            <span>DEMO MODE</span>
          </div>
        )}

        {user ? (
          <div className="flex items-center gap-3 border-l border-[var(--border)] pl-3">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-xs font-bold text-stone-900 leading-none">{user.display_name}</span>
              <span className="text-[10px] font-mono text-amber-700 mt-0.5">{user.platform_role.replace(/_/g, " ")}</span>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-lg transition-colors cursor-pointer"
              title="Sign Out of NIRNAY"
            >
              <LogOut className="w-3.5 h-3.5 text-stone-600" />
              <span>Sign Out</span>
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="inline-flex items-center gap-1 px-3.5 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors cursor-pointer"
          >
            <User className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </Link>
        )}
      </div>
    </header>
  );
}
