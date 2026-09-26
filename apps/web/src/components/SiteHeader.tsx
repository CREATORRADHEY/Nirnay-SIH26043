"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Menu, X, Search } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import { NirnayLogo } from "@/components/NirnayLogo";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export function SiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth();
  const { t } = useLanguage();

  const navLinks = [
    { label: t("dashboard", "Product"), href: user ? "/app" : "/login" },
    { label: "Workflow", href: "#workflow" },
    { label: "Stakeholders", href: "#ecosystem" },
    { label: t("my_challenges", "Evidence"), href: user ? "/app/challenges" : "/login" },
    { label: t("readiness", "Pilot Readiness"), href: user ? "/app/readiness" : "/login" },
    { label: t("explore_challenges", "Public Directory"), href: "/challenges" },
    { label: "About", href: "#about" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#E7E5E4]/80 bg-[#FAF8F5]/90 backdrop-blur-md">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        <div className="flex h-20 items-center justify-between">
          {/* Brand Logo & Subtitle */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <NirnayLogo size="md" variant="light" showSubtitle={true} />
          </Link>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-5 xl:gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-xs font-bold text-stone-700 hover:text-[#EA580C] transition-colors whitespace-nowrap shrink-0 py-1.5"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions: Language Switcher + Public Directory + Start Review */}
          <div className="hidden sm:flex items-center gap-2.5 shrink-0">
            <LanguageSwitcher variant="light" />
            <button
              className="w-8 h-8 rounded-full border border-stone-300 bg-white flex items-center justify-center text-stone-600 hover:border-stone-400 hover:text-[#EA580C] transition-colors cursor-pointer shrink-0"
              title="Search NIRNAY Platform"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
            <Link
              href="/challenges"
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-[#EA580C] border border-[#EA580C] hover:bg-[#EA580C]/5 transition-colors inline-flex items-center justify-center cursor-pointer whitespace-nowrap shrink-0"
            >
              Public Challenges
            </Link>
            <Link
              href={user ? "/app" : "/login"}
              className="px-4 py-1.5 rounded-full text-xs font-bold text-white bg-[#EA580C] hover:bg-[#C2410C] transition-all duration-150 shadow-xs inline-flex items-center gap-1 cursor-pointer active:scale-98 whitespace-nowrap shrink-0"
            >
              <span>Start Review</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Mobile Toggle */}
          <div className="flex lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#1C1917] hover:text-[#EA580C] focus:outline-none cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-[#E7E5E4] bg-[#FAF8F5] px-6 pt-3 pb-6 space-y-4">
          <div className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-semibold text-[#1C1917] hover:text-[#EA580C] py-2 min-h-[44px] flex items-center"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="pt-4 border-t border-[#E7E5E4] flex flex-col gap-3">
            <div className="sm:hidden flex items-center justify-between pb-2 border-b border-[#E7E5E4]">
              <span className="text-xs font-semibold text-stone-600">Select Language:</span>
              <LanguageSwitcher variant="light" />
            </div>
            <Link
              href="/challenges"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-3 text-xs font-semibold text-[#EA580C] border border-[#EA580C] rounded-full min-h-[44px] flex items-center justify-center"
            >
              Public Challenges
            </Link>
            <Link
              href={user ? "/app" : "/login"}
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-3 text-xs font-semibold text-white bg-[#EA580C] rounded-full inline-flex items-center justify-center gap-1.5 min-h-[44px]"
            >
              Start Review <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
