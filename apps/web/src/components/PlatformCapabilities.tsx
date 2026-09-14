"use client";

import Link from "next/link";
import {
  ShieldAlert,
  Layers,
  Scale,
  Users2,
  FileCheck2,
  Compass,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export function PlatformCapabilities() {
  const { user } = useAuth();

  const capabilities = [
    {
      icon: Sparkles,
      tag: "SAFETY LAYER",
      title: "Bounded AI Assistance",
      description:
        "AI is strictly advisory and non-authoritative. Schema-constrained inference and prompt injection defense protect human authority over qualification and pilot readiness.",
      highlight: "AI Advisory Only",
      href: "/challenges",
    },
    {
      icon: Layers,
      tag: "DEPENDENCY INTEGRITY",
      title: "Automated Re-evaluation",
      description:
        "When an underlying institutional commitment is withdrawn, NIRNAY preserves historical audit logs but automatically invalidates readiness and reopens human review.",
      highlight: "v2 REVIEW_REQUIRED",
      href: "/challenges",
    },
    {
      icon: Scale,
      tag: "EVIDENCE RIGOR",
      title: "Execution vs Outcome Separation",
      description:
        "Operational pilot completion is kept strictly separate from outcome evaluation. Completed pilots cannot auto-generate impact claims without human review.",
      highlight: "INCONCLUSIVE Guard",
      href: "/challenges",
    },
    {
      icon: Users2,
      tag: "GOVERNANCE",
      title: "Multi-Role Collaboration",
      description:
        "Role-based workbenches tailored for Government Officials, HEI Directors, MSME Partners, and Citizen Reporters with strict permission boundaries.",
      highlight: "RBAC Workbenches",
      href: "/app",
    },
    {
      icon: FileCheck2,
      tag: "AUDITABILITY",
      title: "Immutable Decision History",
      description:
        "Every qualification, readiness decision, and institutional commitment is versioned with structured audit logs and explicit actor attribution.",
      highlight: "Traceable Audit Logs",
      href: "/app/challenges",
    },
    {
      icon: Compass,
      tag: "PASSPORT REGISTRY",
      title: "Public Challenge Passports",
      description:
        "Standardized challenge intake with pre-declared baseline metrics, population estimates, and structured evidence dossiers accessible to ecosystem partners.",
      highlight: "Public Challenge Directory",
      href: "/challenges",
    },
  ];

  return (
    <section className="py-20 bg-white border-b border-stone-200">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        {/* Section Header */}
        <div className="max-w-3xl mb-14">
          <div className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-[#EA580C] uppercase font-mono mb-2">
            <span className="w-4 h-0.5 bg-[#EA580C]" />
            BUILT FOR INTEGRITY & PUBLIC TRUST
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1C1917] tracking-tight font-serif leading-tight">
            Architected for real-world governance, non-authoritative AI, and evidence rigor.
          </h2>
          <p className="text-base text-stone-600 mt-3 leading-relaxed font-normal">
            NIRNAY replaces unverified assumptions with deterministic state transitions, multi-tenant RBAC, and human decision authority.
          </p>
        </div>

        {/* 6 Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {capabilities.map((cap, idx) => {
            const Icon = cap.icon;
            const targetUrl = cap.href.startsWith("/app") ? (user ? cap.href : "/login") : cap.href;
            return (
              <Link
                key={idx}
                href={targetUrl}
                className="group rounded-2xl border border-stone-200/90 bg-[#FAF8F5]/60 p-7 flex flex-col justify-between hover:border-[#EA580C] transition-all duration-300 shadow-xs hover:shadow-md cursor-pointer block"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-xl bg-white border border-stone-200 text-[#EA580C] flex items-center justify-center shadow-xs group-hover:bg-[#FFF4EE] transition-colors">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200">
                      {cap.highlight}
                    </span>
                  </div>

                  <span className="text-[10px] font-mono font-bold tracking-wider text-stone-400 uppercase">
                    {cap.tag}
                  </span>

                  <h3 className="text-lg font-bold text-[#1C1917] mt-1 mb-2 font-serif group-hover:text-[#EA580C] transition-colors">
                    {cap.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-normal">
                    {cap.description}
                  </p>
                </div>

                <div className="pt-5 mt-5 border-t border-stone-200/80">
                  <span
                    className="inline-flex items-center text-xs font-bold text-[#EA580C] group-hover:text-[#C2410C] transition-colors gap-1.5"
                  >
                    Learn More <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
