"use client";

import { useState } from "react";
import { ArrowRight, Menu, X, Layers } from "lucide-react";

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
    <header className="sticky top-0 z-50 w-full border-b border-[var(--border)] bg-[var(--background)]/95 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left: Brand Identity */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded bg-[var(--primary)] text-white shadow-sm">
              <Layers className="w-5 h-5 stroke-[2]" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-tight text-[var(--text-primary)]">
                  NIRNAY
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 bg-[#F2EFE9] text-[var(--text-secondary)] rounded border border-[var(--border)]">
                  SIH26043
                </span>
              </div>
              <span className="text-[11px] font-medium text-[var(--text-secondary)] tracking-tight">
                Societal Innovation & Readiness Platform
              </span>
            </div>
          </div>

          {/* Center Navigation (Desktop) */}
          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors relative py-1 group"
              >
                {link.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[var(--primary)] transition-all duration-200 group-hover:w-full" />
              </a>
            ))}
          </nav>

          {/* Right Action CTAs */}
          <div className="hidden sm:flex items-center gap-3">
            <a
              href="#demo"
              className="px-3.5 py-2 text-xs font-semibold text-[var(--text-primary)] hover:text-[var(--primary)] transition-colors"
            >
              View Demo
            </a>
            <a
              href="#review"
              className="px-4 py-2 rounded text-xs font-semibold text-white bg-[var(--primary)] hover:bg-[var(--primary-hover)] transition-colors shadow-sm inline-flex items-center gap-1.5 cursor-pointer"
            >
              Start Review
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[var(--text-primary)] hover:text-[var(--primary)] focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-[var(--border)] bg-[var(--surface)] px-4 pt-2 pb-6 space-y-3">
          <div className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-[var(--text-primary)] hover:text-[var(--primary)] py-1.5"
              >
                {link.label}
              </a>
            ))}
          </div>
          <div className="pt-3 border-t border-[var(--border)] flex flex-col gap-2">
            <a
              href="#demo"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2 text-xs font-semibold text-[var(--text-primary)] bg-[#F4F1EA] rounded"
            >
              View Demo
            </a>
            <a
              href="#review"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2 text-xs font-semibold text-white bg-[var(--primary)] rounded inline-flex items-center justify-center gap-1.5"
            >
              Start Review <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
