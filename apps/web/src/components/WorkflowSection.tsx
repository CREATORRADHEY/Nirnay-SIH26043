"use client";

import Link from "next/link";
import { FileText, Users, BarChart3, ChevronRight, ArrowRight } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export function WorkflowSection() {
  const { user } = useAuth();

  const modules = [
    {
      icon: FileText,
      title: "Challenge Passport",
      description:
        "Define real government challenges with structured templates, clear problem statements and measurable goals.",
      iconBg: "bg-[#FFF4EE]",
      iconColor: "text-[#EA580C]",
      href: "/app/challenges",
    },
    {
      icon: Users,
      title: "HEI Matching",
      description:
        "Get matched with the most relevant higher education institutions based on expertise, capacity and intent.",
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-700",
      href: "/app/hei-matching",
    },
    {
      icon: BarChart3,
      title: "Pilot Outcome",
      description:
        "Track pilot progress, measure outcomes and scale what works for greater public impact.",
      iconBg: "bg-[#FFF4EE]",
      iconColor: "text-[#EA580C]",
      href: "/app/readiness",
    },
  ];

  return (
    <section id="workflow" className="py-16 md:py-20 bg-[#FAF8F5] border-b border-[#E7E5E4]/80">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
        {/* Header Row */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-[#EA580C] uppercase font-mono mb-2">
              <span className="w-4 h-0.5 bg-[#EA580C]" />
              HOW NIRNAY WORKS
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1C1917] tracking-tight font-serif">
              From challenge to change, together.
            </h2>
          </div>

          <div className="max-w-md text-left md:text-right space-y-1.5">
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-normal">
              A structured, transparent and collaborative path from problem definition to real-world impact.
            </p>
            <Link
              href="/demo"
              className="inline-flex items-center text-xs font-bold text-[#EA580C] hover:underline gap-1 cursor-pointer"
            >
              Explore the Workflow <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* 3 Horizontal Module Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {modules.map((mod, idx) => {
            const Icon = mod.icon;
            const targetUrl = user ? mod.href : "/login";
            return (
              <Link
                key={idx}
                href={targetUrl}
                className="group rounded-2xl border border-stone-200 bg-white p-6 sm:p-7 flex items-start justify-between gap-4 hover:border-[#EA580C] transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer block"
              >
                <div className="space-y-3 flex-1">
                  <div className={`w-12 h-12 rounded-xl ${mod.iconBg} ${mod.iconColor} flex items-center justify-center shrink-0`}>
                    <Icon className="w-6 h-6" />
                  </div>

                  <h3 className="text-lg font-bold text-[#1C1917] tracking-tight group-hover:text-[#EA580C] transition-colors">
                    {mod.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                    {mod.description}
                  </p>
                </div>

                <div className="pt-2">
                  <div className="w-8 h-8 rounded-full border border-stone-200 flex items-center justify-center text-stone-400 group-hover:border-[#EA580C] group-hover:text-[#EA580C] transition-colors shrink-0">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
