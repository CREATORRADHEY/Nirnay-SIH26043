"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading, logout } = useAuth();
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
      router.push("/login");
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <div className="flex items-center space-x-3 text-stone-600 font-medium">
          <div className="w-5 h-5 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading session...</span>
        </div>
      </div>
    );
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
      router.push("/login");
    }
  };

  let navItems = [
    { label: "Dashboard", href: "/app" },
    { label: "My Challenges", href: "/app/challenges" },
    { label: "Report Challenge", href: "/app/challenges/new" },
    { label: "Notifications", href: "/app/notifications", badge: unreadCount },
    { label: "Security", href: "/app/account/security" },
  ];

  if (role.startsWith("GOVERNMENT_")) {
    navItems = [
      { label: "Dashboard", href: "/app" },
      { label: "Review Challenges", href: "/app/review" },
      { label: "Qualification", href: "/app/qualification" },
      { label: "Institution Matching", href: "/app/hei-matching" },
      { label: "Pilot Readiness", href: "/app/readiness" },
      { label: "Pilots", href: "/app/pilots" },
      { label: "Outcomes", href: "/app/outcomes" },
      { label: "Notifications", href: "/app/notifications", badge: unreadCount },
    ];
  } else if (role === "PLATFORM_ADMIN") {
    navItems = [
      { label: "Dashboard", href: "/app" },
      { label: "Organizations", href: "/app/organizations" },
      { label: "Users", href: "/app/admin/users" },
      { label: "Audit", href: "/app/admin/audit" },
      { label: "AI Operations", href: "/app/admin/ai" },
      { label: "Review Queue", href: "/app/review" },
      { label: "Notifications", href: "/app/notifications", badge: unreadCount },
    ];
  } else if (role.startsWith("HEI_")) {
    navItems = [
      { label: "Dashboard", href: "/app" },
      { label: "Matched Challenges", href: "/app/hei-matching" },
      { label: "Commitments", href: "/app/commitments" },
      { label: "Active Pilots", href: "/app/pilots" },
      { label: "Notifications", href: "/app/notifications", badge: unreadCount },
    ];
    if (role === "HEI_ADMIN") {
      navItems.push({ label: "Organization", href: "/app/organizations" });
    }
  } else if (role.startsWith("INDUSTRY_")) {
    navItems = [
      { label: "Dashboard", href: "/app" },
      { label: "Opportunities", href: "/app/hei-matching" },
      { label: "Commitments", href: "/app/commitments" },
      { label: "Supported Pilots", href: "/app/pilots" },
      { label: "Notifications", href: "/app/notifications", badge: unreadCount },
    ];
    if (role === "INDUSTRY_ADMIN") {
      navItems.push({ label: "Organization", href: "/app/organizations" });
    }
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-stone-900 flex flex-col font-sans">
      <header className="bg-stone-900 text-stone-100 border-b border-stone-800 px-6 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-6">
          <Link href="/app" className="font-bold text-lg tracking-tight flex items-center space-x-2 text-stone-100">
            <span className="font-serif font-bold text-lg text-white tracking-wide">NIRNAY</span>
            <span className="text-amber-500 font-mono text-xs px-2 py-0.5 bg-stone-800 rounded border border-stone-700 hidden sm:inline">
              Civic Platform
            </span>
          </Link>
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const active = pathname === item.href || (item.href !== "/app" && pathname?.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={
                    active
                      ? "px-3 py-1.5 text-sm font-medium rounded-md transition-colors relative flex items-center space-x-1.5 bg-stone-800 text-amber-400"
                      : "px-3 py-1.5 text-sm font-medium rounded-md transition-colors relative flex items-center space-x-1.5 text-stone-300 hover:text-white hover:bg-stone-800/60"
                  }
                >
                  <span>{item.label}</span>
                  {item.badge && item.badge > 0 ? (
                    <span className="bg-amber-500 text-stone-950 font-bold text-[10px] px-1.5 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-semibold text-stone-200">{user.display_name}</div>
            <div className="text-[11px] text-amber-500 font-mono tracking-tight flex items-center justify-end space-x-1">
              <span>{user.platform_role.replace(/_/g, " ")}</span>
              {primaryOrg && <span className="text-stone-400">({primaryOrg.organization_name})</span>}
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="text-xs px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white rounded border border-stone-700 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </header>

      <div className="md:hidden bg-stone-800 border-b border-stone-700 px-4 py-2 flex items-center space-x-2 overflow-x-auto">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={
                active
                  ? "px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap flex items-center space-x-1 bg-stone-900 text-amber-400"
                  : "px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap flex items-center space-x-1 text-stone-300 hover:text-white"
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

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
};
