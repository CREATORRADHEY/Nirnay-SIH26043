"use client";

import { Landmark, GraduationCap, Microscope, Handshake, Sprout } from "lucide-react";

export function EcosystemStrip() {
  const categories = [
    { label: "State Governments", icon: Landmark },
    { label: "Higher Education Institutions", icon: GraduationCap },
    { label: "Research Organisations", icon: Microscope },
    { label: "Development Partners", icon: Handshake },
    { label: "Civil Society Organisations", icon: Sprout },
  ];

  return (
    <section id="ecosystem" className="py-8 md:py-10 bg-[#FAF8F5] border-b border-stone-200">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 flex flex-col lg:flex-row items-center justify-between gap-6">
        {/* Left Eyebrow */}
        <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-stone-500 uppercase font-mono shrink-0">
          <span className="w-4 h-0.5 bg-stone-400" />
          TRUSTED BY INNOVATORS ACROSS INDIA
        </div>

        {/* Center Icons List - Single Row Alignment */}
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 lg:gap-10">
          {categories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <div
                key={idx}
                className="flex items-center gap-2 text-xs font-semibold text-stone-700 hover:text-[#EA580C] transition-colors cursor-pointer whitespace-nowrap"
              >
                <Icon className="w-4 h-4 text-stone-600 stroke-[1.75] shrink-0" />
                <span>{cat.label}</span>
              </div>
            );
          })}
        </div>

        {/* Right Margin Text */}
        <div className="text-[10px] font-mono tracking-widest text-stone-400 uppercase shrink-0 text-center lg:text-right">
          PEOPLE • IDEAS • INSTITUTIONS • A STRONGER BHARAT
        </div>
      </div>
    </section>
  );
}
