"use client";

import { useState } from "react";
import { ArrowRight, Menu, X, Compass } from "lucide-react";

export function SiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: "Product", href: "#product" },
    { label: "Workflow", href: "#workflow" },
    { label: "Stakeholders", href: "#stakeholders" },
    { label: "Evidence", href: "#evidence" },
    { label: "Pilot Readiness", href: "#readiness" },
    { label: "Resources", href: "#resources" },
    { label: "About", href: "#about" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#E7E5E4] bg-[#FAF9F6]/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left: Refined Brand Mark */}
          <a href="#" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 rounded-md bg-[#1C1917] text-[#FAF9F6] flex items-center justify-center font-serif text-sm font-bold shadow-xs transition-transform group-hover:scale-105">
              N
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-base font-extrabold tracking-tight text-[#1C1917] font-sans">
                  NIRNAY
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 bg-[#F2EFE9] text-stone-600 rounded border border-[#E7E5E4] font-medium">
                  SIH26043
                </span>
              </div>
              <span className="text-[10px] font-medium text-stone-500 tracking-tight leading-none">
                Societal Innovation Platform
              </span>
            </div>
          </a>

          {/* Center Navigation (Desktop) */}
          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-xs font-medium text-stone-600 hover:text-[#EA580C] transition-colors relative py-1 group"
              >
                {link.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#EA580C] transition-all duration-200 group-hover:w-full" />
              </a>
            ))}
          </nav>

          {/* Right Action CTAs */}
          <div className="hidden sm:flex items-center gap-3">
            <a
              href="/demo"
              className="px-3.5 py-2 text-xs font-semibold text-[#1C1917] hover:text-[#EA580C] transition-colors inline-flex items-center gap-1"
            >
              <Compass className="w-3.5 h-3.5 text-stone-500" />
              View Demo
            </a>
            <a
              href="#workflow"
              className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#EA580C] hover:bg-[#C2410C] transition-all duration-150 shadow-xs inline-flex items-center gap-1.5 cursor-pointer active:scale-98"
            >
              Start Review
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#1C1917] hover:text-[#EA580C] focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-[#E7E5E4] bg-[#FAF9F6] px-4 pt-2 pb-6 space-y-3">
          <div className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-[#1C1917] hover:text-[#EA580C] py-1.5"
              >
                {link.label}
              </a>
            ))}
          </div>
          <div className="pt-3 border-t border-[#E7E5E4] flex flex-col gap-2">
            <a
              href="/demo"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2 text-xs font-semibold text-[#1C1917] bg-[#F2EFE9] rounded-lg"
            >
              View Demo
            </a>
            <a
              href="#workflow"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2 text-xs font-semibold text-white bg-[#EA580C] rounded-lg inline-flex items-center justify-center gap-1.5"
            >
              Start Review <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
