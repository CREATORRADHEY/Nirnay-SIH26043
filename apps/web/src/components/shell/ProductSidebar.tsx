"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { NirnayLogo } from "@/components/NirnayLogo";
import {
  Layers,
  FileText,
  FileCheck2,
  Cpu,
  Handshake,
  UserCheck,
  Rocket,
  Award,
  ChevronRight,
  ShieldCheck,
  Building2,
  Users,
  ScrollText,
  Bot,
} from "lucide-react";

interface ProductSidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function ProductSidebar({ mobileOpen = false, onCloseMobile }: ProductSidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  const isPlatformAdmin = user?.platform_role === "PLATFORM_ADMIN";

  const navItems = [
    {
      label: "Overview",
      href: "/",
      icon: Layers,
      active: pathname === "/",
      enabled: true,
    },
    {
      label: "Challenges",
      href: "/challenges",
      icon: FileText,
      active: pathname.startsWith("/challenges"),
      enabled: true,
    },
    {
      label: "Evidence",
      href: "/challenges",
      icon: FileCheck2,
      active: false,
      enabled: true,
    },
    {
      label: "HEI Matching",
      href: "/challenges",
      icon: Cpu,
      active: false,
      enabled: true,
    },
    {
      label: "Commitments",
      href: "/challenges",
      icon: Handshake,
      active: false,
      enabled: true,
    },
    {
      label: "Pilot Readiness",
      href: "/challenges",
      icon: UserCheck,
      active: false,
      enabled: true,
    },
    {
      label: "Pilots",
      href: "/challenges",
      icon: Rocket,
      active: pathname.startsWith("/pilots"),
      enabled: true,
    },
    {
      label: "Outcomes",
      href: "/challenges",
      icon: Award,
      active: false,
      enabled: true,
    },
  ];

  const adminNavItems = [
    {
      label: "Admin Overview",
      href: "/app/admin",
      icon: ShieldCheck,
      active: pathname === "/app/admin",
    },
    {
      label: "Organizations",
      href: "/app/admin/organizations",
      icon: Building2,
      active: pathname.startsWith("/app/admin/organizations"),
    },
    {
      label: "Users & Roles",
      href: "/app/admin/users",
      icon: Users,
      active: pathname.startsWith("/app/admin/users"),
    },
    {
      label: "System Audit",
      href: "/app/admin/audit",
      icon: ScrollText,
      active: pathname.startsWith("/app/admin/audit"),
    },
    {
      label: "AI Operations",
      href: "/app/admin/ai",
      icon: Bot,
      active: pathname.startsWith("/app/admin/ai"),
    },
  ];

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 w-64 bg-[var(--surface)] border-r border-[var(--border)] flex flex-col transition-transform duration-200 lg:static lg:translate-x-0 ${
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 px-4 border-b border-[var(--border)] flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <NirnayLogo size="sm" variant="light" subtitle="SIH26043" />
        </Link>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
        {/* Main Workspaces */}
        <div className="space-y-1">
          <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
            Platform Workspace
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            if (!item.enabled) return null;

            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={onCloseMobile}
                className={`flex items-center justify-between px-3 py-2 text-xs font-medium rounded transition-colors ${
                  item.active
                    ? "bg-[#FFF4EE] text-[var(--primary)] font-semibold border border-[#FCD8C5]"
                    : "text-[var(--text-primary)] hover:bg-[#F4F1EA]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 stroke-[1.75] ${item.active ? "text-[var(--primary)]" : "text-[var(--text-secondary)]"}`} />
                  <span>{item.label}</span>
                </div>
                {item.active && <ChevronRight className="w-3.5 h-3.5 text-[var(--primary)]" />}
              </Link>
            );
          })}
        </div>

        {/* Platform Admin Console (Only visible to PLATFORM_ADMIN) */}
        {isPlatformAdmin && (
          <div className="space-y-1 pt-2 border-t border-[var(--border)]">
            <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--primary)] flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Platform Governance</span>
            </div>

            {adminNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={onCloseMobile}
                  className={`flex items-center justify-between px-3 py-2 text-xs font-medium rounded transition-colors ${
                    item.active
                      ? "bg-[#FFF4EE] text-[var(--primary)] font-semibold border border-[#FCD8C5]"
                      : "text-[var(--text-primary)] hover:bg-[#F4F1EA]"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 stroke-[1.75] ${item.active ? "text-[var(--primary)]" : "text-[var(--text-secondary)]"}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.active && <ChevronRight className="w-3.5 h-3.5 text-[var(--primary)]" />}
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Discreet Shell Footer */}
      <div className="p-4 border-t border-[var(--border)] bg-[#F9F7F2]">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-semibold text-[var(--text-primary)]">System State</span>
          <span className="inline-flex items-center gap-1 font-mono text-[10px] text-[#166534] bg-[#EBF5EE] px-2 py-0.5 rounded border border-[#C6E7D0]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#166534] animate-pulse" />
            P4B Production
          </span>
        </div>
      </div>
    </aside>
  );
}
