"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { AppShell } from "@/components/AppShell";

interface DashboardSummary {
  actor_id: string;
  display_name: string;
  role: string;
  primary_organization: {
    id: string;
    name: string;
    type: string;
  } | null;
  metrics: Record<string, number>;
  action_items: Array<{
    title: string;
    count: number;
    description: string;
    link: string;
  }>;
}

export default function ProductionDashboardPage() {
  const { user, loading } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (user) {
      fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"}/api/v1/dashboard/summary`, {
        credentials: "include",
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => setSummary(data))
        .catch(() => setSummary(null))
        .finally(() => setFetching(false));
    }
  }, [user]);

  if (loading || fetching) {
    return (
      <AppShell>
        <div className="flex items-center justify-center py-20">
          <div className="flex items-center space-x-3 text-stone-600 font-medium">
            <div className="w-5 h-5 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
            <span>Loading dashboard...</span>
          </div>
        </div>
      </AppShell>
    );
  }

  if (!user) {
    return (
      <AppShell>
        <div className="max-w-md mx-auto py-12 text-center">
          <h2 className="text-xl font-bold text-stone-900">Authentication Required</h2>
          <p className="mt-2 text-sm text-stone-600">Please sign in to access your role-specific dashboard.</p>
          <div className="mt-6">
            <Link
              href="/login"
              className="inline-flex items-center px-4 py-2 bg-amber-600 text-white rounded-md font-semibold text-sm hover:bg-amber-700"
            >
              Sign In
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  const roleTitle = user.platform_role.replace("_", " ");

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-stone-900">{user.display_name}</h1>
              <span className="bg-amber-100 text-amber-900 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                {roleTitle}
              </span>
            </div>
            <p className="text-sm text-stone-600 mt-1">
              Production Dashboard • Logged in as <span className="font-semibold">{user.email}</span>
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Link
              href="/challenges"
              className="px-4 py-2 bg-stone-900 text-white text-sm font-semibold rounded-lg hover:bg-stone-800 transition-colors"
            >
              Explore Challenges
            </Link>
            <Link
              href="/app/organizations"
              className="px-4 py-2 bg-stone-100 text-stone-800 text-sm font-semibold rounded-lg hover:bg-stone-200 border border-stone-300 transition-colors"
            >
              Manage Organizations
            </Link>
          </div>
        </div>

        {/* Role Metrics Grid */}
        {summary && summary.metrics && (
          <div>
            <h2 className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-3">
              Key Performance Metrics
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(summary.metrics).map(([key, val]) => (
                <div key={key} className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm">
                  <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                    {key.replace(/_/g, " ")}
                  </div>
                  <div className="text-3xl font-extrabold text-stone-900 mt-2">{val}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Priority Action Items */}
        {summary && summary.action_items && (
          <div>
            <h2 className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-3">
              Role Workflows & Priority Tasks
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {summary.action_items.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm flex flex-col justify-between hover:border-amber-500/50 transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-stone-900 text-base">{item.title}</h3>
                      {item.count > 0 && (
                        <span className="bg-amber-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                          {item.count}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-stone-600 mt-2">{item.description}</p>
                  </div>
                  <div className="mt-4 pt-4 border-t border-stone-100">
                    <Link
                      href={item.link}
                      className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center space-x-1"
                    >
                      <span>Open Workflow</span>
                      <span>→</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
