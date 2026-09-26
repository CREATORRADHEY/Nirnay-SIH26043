"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { NirnayLogo } from "./NirnayLogo";
import {
  GuidanceProvider,
  GuidedModeButton,
  GuidedModePanel,
  GuidanceWelcome,
  GuidanceOverlay,
  MissionNavigator,
  PageContext,
  WhyStageDialog,
} from "./guidance";

const getNavTourAttribute = (href: string) => {
  switch (href) {
    case "/app":
      return "dashboard-nav";
    case "/app/challenges":
      return "challenges-list";
    case "/app/challenges/new":
      return "report-challenge-nav";
    case "/app/review":
      return "review-queue-nav";
    case "/app/qualification":
      return "qualification-nav";
    case "/app/hei-matching":
      return "hei-matching-nav";
    case "/app/readiness":
      return "readiness-nav";
    case "/app/pilots":
      return "pilots-nav";
    case "/app/outcomes":
      return "outcomes-nav";
    case "/app/commitments":
      return "commitments-nav";
    case "/app/organizations":
      return "organizations-nav";
    case "/app/admin/users":
      return "users-nav";
    case "/app/admin/audit":
      return "audit-nav";
    case "/app/admin/ai":
      return "ai-nav";
    default:
      return undefined;
  }
};

export const AppShellContent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading, logout } = useAuth();
  const { t } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    if (!user) return;
    fetch("/api/v1/notifications?limit=1", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && typeof data.unread_count === "number") {
          setUnreadCount(data.unread_count);
        }
      })
      .catch(() => {});
  }, [user, pathname]);

  useEffect(() => {
    if (!loading && !user) {
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      } else {
        router.push("/login");
      }
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <div className="flex items-center space-x-3 text-stone-600 font-medium">
          <div className="w-5 h-5 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading session...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const role = user.platform_role;
  const primaryOrg = user.memberships.find((m) => m.is_primary) || user.memberships[0];

  const handleLogout = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    try {
      await logout();
    } catch {
      // ignore
    } finally {
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      } else {
        router.push("/login");
      }
    }
  };

  let navItems = [
    { label: t("dashboard", "Dashboard"), href: "/app" },
    { label: t("my_challenges", "My Challenges"), href: "/app/challenges" },
    { label: t("report_challenge", "Report Challenge"), href: "/app/challenges/new" },
    { label: t("notifications", "Notifications"), href: "/app/notifications", badge: unreadCount },
    { label: t("security", "Security"), href: "/app/account/security" },
  ];

  if (role.startsWith("GOVERNMENT_")) {
    navItems = [
      { label: t("dashboard", "Dashboard"), href: "/app" },
      { label: t("review_challenges", "Review Challenges"), href: "/app/review" },
      { label: t("qualification", "Qualification"), href: "/app/qualification" },
      { label: t("hei_matching", "Institution Matching"), href: "/app/hei-matching" },
      { label: t("readiness", "Pilot Readiness"), href: "/app/readiness" },
      { label: t("pilots", "Pilots"), href: "/app/pilots" },
      { label: t("outcomes", "Outcomes"), href: "/app/outcomes" },
      { label: t("notifications", "Notifications"), href: "/app/notifications", badge: unreadCount },
    ];
  } else if (role === "PLATFORM_ADMIN") {
    navItems = [
      { label: t("dashboard", "Dashboard"), href: "/app" },
      { label: "Organizations", href: "/app/organizations" },
      { label: "Users", href: "/app/admin/users" },
      { label: "Audit", href: "/app/admin/audit" },
      { label: "AI Operations", href: "/app/admin/ai" },
      { label: t("review_challenges", "Review Queue"), href: "/app/review" },
      { label: t("notifications", "Notifications"), href: "/app/notifications", badge: unreadCount },
    ];
  } else if (role.startsWith("HEI_")) {
    navItems = [
      { label: t("dashboard", "Dashboard"), href: "/app" },
      { label: t("hei_matching", "Matched Challenges"), href: "/app/hei-matching" },
      { label: "Commitments", href: "/app/commitments" },
      { label: t("pilots", "Active Pilots"), href: "/app/pilots" },
      { label: t("notifications", "Notifications"), href: "/app/notifications", badge: unreadCount },
    ];
    if (role === "HEI_ADMIN") {
      navItems.push({ label: "Organization", href: "/app/organizations" });
    }
  } else if (role.startsWith("INDUSTRY_")) {
    navItems = [
      { label: t("dashboard", "Dashboard"), href: "/app" },
      { label: t("hei_matching", "Opportunities"), href: "/app/hei-matching" },
      { label: "Commitments", href: "/app/commitments" },
      { label: t("pilots", "Supported Pilots"), href: "/app/pilots" },
      { label: t("notifications", "Notifications"), href: "/app/notifications", badge: unreadCount },
    ];
    if (role === "INDUSTRY_ADMIN") {
      navItems.push({ label: "Organization", href: "/app/organizations" });
    }
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-stone-900 flex flex-col font-sans relative">
      <header className="bg-stone-900 text-stone-100 border-b border-stone-800 px-3 xl:px-6 py-2 flex items-center justify-between shadow-sm relative z-40 w-full overflow-hidden">
        <div className="flex items-center gap-3 xl:gap-6 min-w-0 flex-1">
          <Link href="/app" className="flex items-center gap-2 text-stone-100 group shrink-0">
            <NirnayLogo variant="dark" size="md" subtitle="Civic Platform" />
          </Link>

          <div className="h-6 w-px bg-stone-800 hidden md:block shrink-0" />

          <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {navItems.map((item) => {
              const active = pathname === item.href || (item.href !== "/app" && pathname?.startsWith(item.href));
              const tourAttr = getNavTourAttribute(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  data-tour={tourAttr}
                  className={
                    active
                      ? "px-2.5 xl:px-3 py-1.5 text-xs font-bold rounded-lg transition-all relative flex items-center gap-1 bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-xs whitespace-nowrap shrink-0"
                      : "px-2.5 xl:px-3 py-1.5 text-xs font-semibold rounded-lg transition-all relative flex items-center gap-1 text-stone-300 hover:text-white hover:bg-stone-800/80 whitespace-nowrap shrink-0"
                  }
                >
                  <span className="whitespace-nowrap">{item.label}</span>
                  {item.badge && item.badge > 0 ? (
                    <span className="bg-amber-500 text-stone-950 font-bold text-[10px] px-1.5 py-0.2 rounded-full leading-none shrink-0">
                      {item.badge}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 xl:gap-2.5 shrink-0 ml-1 sm:ml-2">
          <LanguageSwitcher variant="dark" />
          <GuidedModeButton />

          <div className="h-5 w-px bg-stone-800 hidden xl:block shrink-0" />

          <div className="text-right hidden xl:flex flex-col shrink-0 px-2 py-0.5 bg-stone-800/80 rounded-md border border-stone-700/80 max-w-[150px]">
            <div className="text-xs font-semibold text-stone-200 leading-tight truncate">{user.display_name}</div>
            <div className="text-[10px] text-amber-500 font-mono tracking-tight flex items-center justify-end gap-1 mt-0.5 truncate">
              <span className="truncate">{user.platform_role.replace(/_/g, " ")}</span>
            </div>
          </div>

          <Link
            href="/app/evaluation"
            data-tour="jury-evaluation-btn"
            className="text-xs px-2 sm:px-2.5 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-lg border border-amber-500/40 font-bold transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0 min-h-[38px] sm:min-h-[44px]"
          >
            <span className="hidden xs:inline">Jury Evaluation</span>
            <span className="xs:hidden">Jury</span>
          </Link>
          <button
            onClick={handleLogout}
            className="text-xs px-2 sm:px-2.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white rounded-lg border border-stone-700 transition-colors cursor-pointer whitespace-nowrap shrink-0 min-h-[38px] sm:min-h-[44px]"
          >
            {t("sign_out", "Sign Out")}
          </button>
        </div>

        <GuidedModePanel />
      </header>

      <div className="md:hidden bg-stone-900 border-b border-stone-800 px-4 py-2 flex items-center gap-2 overflow-x-auto">
        {navItems.map((item) => {
          const active = pathname === item.href;
          const tourAttr = getNavTourAttribute(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              data-tour={tourAttr}
              className={
                active
                  ? "px-3 py-1 text-xs font-bold rounded-lg whitespace-nowrap flex items-center gap-1.5 bg-amber-500/15 text-amber-400 border border-amber-500/30"
                  : "px-3 py-1 text-xs font-medium rounded-lg whitespace-nowrap flex items-center gap-1.5 text-stone-300 hover:text-white hover:bg-stone-800"
              }
            >
              <span>{item.label}</span>
              {item.badge && item.badge > 0 ? (
                <span className="bg-amber-500 text-stone-950 font-bold text-[10px] px-1.5 rounded-full">
                  {item.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 min-w-0 overflow-x-hidden">
        <PageContext />
        <MissionNavigator />
        {children}
      </main>

      <GuidanceWelcome />
      <GuidanceOverlay />
      <WhyStageDialog />
    </div>
  );
};

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <GuidanceProvider>
      <AppShellContent>{children}</AppShellContent>
    </GuidanceProvider>
  );
};
