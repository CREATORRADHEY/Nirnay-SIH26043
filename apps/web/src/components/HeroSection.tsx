"use client";

import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";
import { ProductPreview } from "./ProductPreview";
import { useAuth } from "@/lib/auth-context";

export function HeroSection() {
  const { user } = useAuth();

  return (
    <section className="relative overflow-hidden bg-[#FAF8F5] pt-6 pb-16 md:pt-10 md:pb-20 border-b border-[#E7E5E4]/80">
      {/* Landscape Background Vector Graphics */}
      <div className="absolute inset-0 pointer-events-none opacity-10 overflow-hidden flex items-end justify-center">
        <svg
          className="w-full h-[500px] text-stone-700"
          viewBox="0 0 1440 500"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M 0 350 Q 300 200 650 320 T 1440 280"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
          <path
            d="M 0 420 Q 400 280 800 380 T 1440 360"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M 0 480 Q 250 360 550 450 T 1440 400"
            stroke="currentColor"
            strokeWidth="1.2"
          />
        </svg>
      </div>

      {/* Top Bar for Motto (Non-Overlapping) */}
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 flex justify-end mb-4 relative z-20">
        <div className="hidden md:flex flex-col items-end pointer-events-none">
          <span className="font-serif italic text-xl sm:text-2xl text-stone-700 tracking-wide font-bold rotate-[-2deg]">
            Ideas for a Stronger Bharat
          </span>
          <div className="flex h-1 w-32 rounded-full overflow-hidden mt-1 shadow-xs">
            <div className="w-1/3 bg-[#FF9933]" />
            <div className="w-1/3 bg-white" />
            <div className="w-1/3 bg-[#138808]" />
          </div>
        </div>
      </div>

      {/* Vertical Margin Text (Left & Right) */}
      <div className="hidden 2xl:flex absolute left-2 top-1/2 -translate-y-1/2 flex-col gap-6 text-[10px] font-mono tracking-widest text-stone-400 uppercase rotate-180 select-none [writing-mode:vertical-lr]">
        <span>PEOPLE • KNOWLEDGE • PARTNERSHIPS • PROGRESS</span>
      </div>
      <div className="hidden 2xl:flex absolute right-2 top-1/2 -translate-y-1/2 flex-col gap-6 text-[10px] font-mono tracking-widest text-stone-400 uppercase select-none [writing-mode:vertical-lr]">
        <span>JHARKHAND • STRONGER • COMMUNITIES • BRIGHTER FUTURES</span>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Left Editorial Copy Column */}
          <div className="lg:col-span-5 space-y-6">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-[#EA580C] uppercase font-mono">
              <span className="w-4 h-0.5 bg-[#EA580C]" />
              FROM PUBLIC CHALLENGES TO A BRIGHTER TOMORROW
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[52px] font-extrabold text-[#1C1917] tracking-tight leading-[1.12] font-serif">
              Right Problem. <br />
              <span className="text-[#EA580C]">Ready Pilot.</span> <br />
              Proven Outcome.
            </h1>

            {/* Supporting Copy */}
            <p className="text-base text-stone-600 leading-relaxed max-w-lg font-normal">
              NIRNAY helps governments, HEIs and partners define real-world
              challenges, find the right higher education partners, and turn
              ideas into measurable public impact.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-1">
              <Link
                href={user ? "/app" : "/login"}
                className="px-6 py-3.5 rounded-xl bg-[#EA580C] text-white font-semibold text-sm hover:bg-[#C2410C] transition-all duration-200 shadow-md inline-flex items-center gap-2 group cursor-pointer"
              >
                Start Review
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/challenges"
                className="px-6 py-3 rounded-xl bg-white text-[#1C1917] border border-stone-300 font-semibold text-sm hover:bg-stone-50 transition-all duration-200 inline-flex items-center gap-2.5 shadow-xs cursor-pointer"
              >
                <div className="w-6 h-6 rounded-full border border-stone-300 flex items-center justify-center">
                  <Play className="w-3 h-3 text-[#1C1917] fill-current ml-0.5" />
                </div>
                Explore Challenges
              </Link>
            </div>
          </div>

          {/* Right Product Preview Column */}
          <div className="lg:col-span-7">
            <ProductPreview />
          </div>
        </div>
      </div>
    </section>
  );
}
