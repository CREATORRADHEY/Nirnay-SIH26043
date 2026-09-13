"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

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
    return <>{children}</>;
  }

  const primaryOrg = user.memberships.find((m) => m.is_primary) || user.memberships[0];

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const navItems = [
    { label: "Dashboard", href: "/app" },
    { label: "Challenges", href: "/challenges" },
    { label: "Organizations", href: "/app/organizations" },
    { label: "Account", href: "/app/account" },
    { label: "Security", href: "/app/account/security" },
  ];

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-stone-900 flex flex-col font-sans">
      <header className="bg-stone-900 text-stone-100 border-b border-stone-800 px-6 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-6">
          <Link href="/" className="font-bold text-lg tracking-tight flex items-center space-x-2 text-stone-100">
            <span className="bg-amber-600 text-white text-xs font-black px-2 py-0.5 rounded tracking-widest">NIRNAY</span>
            <span className="text-stone-300 font-medium text-sm hidden sm:inline">Platform</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const active = pathname === item.href || (item.href !== "/app" && pathname?.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    active ? "bg-stone-800 text-amber-400" : "text-stone-300 hover:text-white hover:bg-stone-800/60"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-semibold text-stone-200">{user.display_name}</div>
            <div className="text-[11px] text-amber-500 font-mono tracking-tight flex items-center justify-end space-x-1">
              <span>{user.platform_role.replace("_", " ")}</span>
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
              className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap ${
                active ? "bg-stone-900 text-amber-400" : "text-stone-300 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
};
