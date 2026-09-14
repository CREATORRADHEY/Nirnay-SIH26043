"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Menu, X, Search } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export function SiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth();

  const navLinks = [
    { label: "Product", href: user ? "/app" : "/login" },
    { label: "Workflow", href: "#workflow" },
    { label: "Stakeholders", href: "#ecosystem" },
    { label: "Evidence", href: user ? "/app/challenges" : "/login" },
    { label: "Pilot Readiness", href: user ? "/app/readiness" : "/login" },
    { label: "Resources", href: "/demo" },
    { label: "About", href: "#about" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#E7E5E4]/80 bg-[#FAF8F5]/90 backdrop-blur-md">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        <div className="flex h-20 items-center justify-between">
          {/* Brand Logo & Subtitle */}
          <Link href="/" className="flex items-center gap-3 group">
            <img
              src="/logo-icon.png"
              alt="NIRNAY Logo"
              className="w-10 h-10 object-contain transition-transform group-hover:scale-105 shrink-0 rounded-xl"
            />
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight text-[#1C1917] font-serif leading-none">
                NIRNAY
              </span>
              <span className="text-[10px] font-bold text-stone-500 tracking-wider uppercase mt-1 leading-none font-mono">
                PEOPLE • IDEAS • IMPACT
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden xl:flex items-center gap-7">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-xs font-semibold text-stone-700 hover:text-[#EA580C] transition-colors relative py-1"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions: Search Button + View Demo + Start Review */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              className="w-9 h-9 rounded-full border border-stone-300 bg-white flex items-center justify-center text-stone-600 hover:border-stone-400 hover:text-[#EA580C] transition-colors cursor-pointer"
              title="Search NIRNAY Platform"
            >
              <Search className="w-4 h-4" />
            </button>
            <Link
              href="/demo"
              className="px-4 py-2.5 rounded-full text-xs font-semibold text-[#EA580C] border border-[#EA580C] hover:bg-[#EA580C]/5 transition-colors inline-flex items-center justify-center cursor-pointer"
            >
              View Demo
            </Link>
            <Link
              href={user ? "/app" : "/login"}
              className="px-5 py-2.5 rounded-full text-xs font-semibold text-white bg-[#EA580C] hover:bg-[#C2410C] transition-all duration-150 shadow-sm inline-flex items-center gap-1.5 cursor-pointer active:scale-98"
            >
              Start Review <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Mobile Toggle */}
          <div className="flex xl:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#1C1917] hover:text-[#EA580C] focus:outline-none cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-b border-[#E7E5E4] bg-[#FAF8F5] px-6 pt-3 pb-6 space-y-4">
          <div className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-semibold text-[#1C1917] hover:text-[#EA580C] py-1"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="pt-4 border-t border-[#E7E5E4] flex flex-col gap-2.5">
            <Link
              href="/demo"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 text-xs font-semibold text-[#EA580C] border border-[#EA580C] rounded-full"
            >
              View Demo
            </Link>
            <Link
              href={user ? "/app" : "/login"}
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 text-xs font-semibold text-white bg-[#EA580C] rounded-full inline-flex items-center justify-center gap-1.5"
            >
              Start Review <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
