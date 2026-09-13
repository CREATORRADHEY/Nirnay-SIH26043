"use client";

import { Landmark, GraduationCap, Microscope, Building, Users2, UserCheck } from "lucide-react";

export function EcosystemStrip() {
  const categories = [
    { label: "Government", icon: Landmark },
    { label: "Higher Education Institutions", icon: GraduationCap },
    { label: "Research Organisations", icon: Microscope },
    { label: "Industry / MSMEs", icon: Building },
    { label: "Civil Society", icon: Users2 },
    { label: "Communities", icon: UserCheck },
  ];

  return (
    <section className="py-12 bg-[#F2EFE9] border-b border-[var(--border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--text-secondary)] mb-6">
          BUILT FOR THE COLLABORATION ECOSYSTEM
        </p>

        <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-4">
          {categories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <div
                key={idx}
                className="px-4 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-xs font-medium text-[var(--text-primary)] inline-flex items-center gap-2 hover:border-[var(--primary)] transition-colors shadow-none"
              >
                <Icon className="w-4 h-4 text-[var(--primary)] stroke-[1.75]" />
                <span>{cat.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
