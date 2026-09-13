"use client";

import { FileText, Cpu, CheckCircle2, ArrowRight } from "lucide-react";

export function WorkflowSection() {
  const modules = [
    {
      step: "01",
      icon: FileText,
      title: "Challenge Passport",
      description:
        "Capture structured societal challenges with evidence, context and traceable qualification history.",
      actionText: "Explore Intake Pipeline",
      href: "#intake",
    },
    {
      step: "02",
      icon: Cpu,
      title: "HEI Matching",
      description:
        "Identify relevant higher-education partners based on capability without treating matching as commitment.",
      actionText: "View Matching Criteria",
      href: "#matching",
    },
    {
      step: "03",
      icon: CheckCircle2,
      title: "Pilot Outcome",
      description:
        "Track readiness, pilot execution and evidence-backed outcomes without confusing completion with impact.",
      actionText: "Audit Readiness Framework",
      href: "#readiness",
    },
  ];

  return (
    <section id="workflow" className="py-20 bg-[var(--background)] border-b border-[var(--border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-2xl mb-14">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--primary)]">
            HOW NIRNAY WORKS
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] tracking-tight mt-2">
            From challenge to change, together.
          </h2>
          <p className="text-base text-[var(--text-secondary)] mt-3 leading-relaxed">
            A rigorous multi-phase workflow connecting public challenge intake, academic capability matching, and human-verified readiness before pilot deployment.
          </p>
        </div>

        {/* 3 Horizontal Feature Modules */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {modules.map((mod, idx) => {
            const Icon = mod.icon;
            return (
              <div
                key={idx}
                className="group relative rounded-xl border border-[var(--border)] bg-[var(--surface)] p-7 flex flex-col justify-between hover:border-[var(--primary)] transition-all duration-300 shadow-none hover:shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="p-3 rounded-lg bg-[#F4F1EA] text-[var(--primary)] group-hover:bg-[#FFF4EE] transition-colors">
                      <Icon className="w-6 h-6 stroke-[1.75]" />
                    </div>
                    <span className="font-mono text-xs font-semibold text-[var(--text-secondary)] bg-[#F2EFE9] px-2 py-1 rounded">
                      {mod.step}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-[var(--text-primary)] mb-3">
                    {mod.title}
                  </h3>

                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-6">
                    {mod.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-[var(--border)]">
                  <a
                    href={mod.href}
                    className="inline-flex items-center text-xs font-semibold text-[var(--text-primary)] group-hover:text-[var(--primary)] transition-colors gap-1.5"
                  >
                    {mod.actionText}
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-[var(--primary)]" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
