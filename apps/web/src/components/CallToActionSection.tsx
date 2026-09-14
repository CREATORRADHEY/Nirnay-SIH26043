"use client";

import Link from "next/link";
import { ArrowRight, Compass } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export function CallToActionSection() {
  const { user } = useAuth();

  return (
    <section className="py-20 bg-[#1C1917] text-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#EA580C]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 text-center relative z-10 space-y-6">
        <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-xs font-mono font-semibold uppercase tracking-wider">
          NIRNAY PLATFORM • SIH26043
        </span>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-serif tracking-tight leading-tight max-w-3xl mx-auto text-stone-100">
          Turn public challenges into proven outcomes.
        </h2>

        <p className="text-stone-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed font-normal">
          Join state governments, higher education institutions, and ecosystem partners on NIRNAY to qualify problems, match capabilities, and verify public impact.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link
            href={user ? "/app" : "/login"}
            className="px-7 py-3.5 rounded-xl bg-[#EA580C] text-white font-semibold text-sm hover:bg-[#C2410C] transition-all duration-200 shadow-md inline-flex items-center gap-2 cursor-pointer"
          >
            Start Review Now <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/challenges"
            className="px-7 py-3.5 rounded-xl bg-stone-800 text-stone-200 border border-stone-700 font-semibold text-sm hover:bg-stone-700 transition-all duration-200 inline-flex items-center gap-2 cursor-pointer"
          >
            <Compass className="w-4 h-4 text-amber-400" /> Explore Public Challenges
          </Link>
        </div>
      </div>
    </section>
  );
}
