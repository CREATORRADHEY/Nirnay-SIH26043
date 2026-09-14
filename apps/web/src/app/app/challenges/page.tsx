"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/lib/auth-context";

interface MyChallengeItem {
  id: string;
  title: string;
  summary: string;
  domain: string;
  district: string;
  state: string;
  submitted_at: string;
  updated_at: string;
  lifecycle_stage: string;
}

export default function MyChallengesPage() {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<MyChallengeItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("ALL");

  useEffect(() => {
    async function loadData() {
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
      let fetchedItems: MyChallengeItem[] = [];

      try {
        const res = await fetch(`${apiBase}/api/v1/me/challenges?limit=100`, { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          fetchedItems = data.items || [];
        }
      } catch {
        // Backend offline or unreachable
      }

      // Check localStorage items
      let localItems: MyChallengeItem[] = [];
      if (typeof window !== "undefined") {
        try {
          const stored = localStorage.getItem("nirnay_my_challenges");
          if (stored) {
            localItems = JSON.parse(stored);
          }
        } catch {
          // ignore
        }
      }

      // Default demo item if both empty
      const demoDefault: MyChallengeItem[] = [
        {
          id: "c0a80001-0000-4000-8000-000000000001",
          title: "Ward 12 Waste Challenge",
          summary: "Solid waste accumulation and bio-degradation management in Ward 12, Ranchi.",
          domain: "Waste Management & Sanitation",
          district: "Ranchi",
          state: "Jharkhand",
          submitted_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          lifecycle_stage: "SUBMITTED",
        },
      ];

      const combinedMap = new Map<string, MyChallengeItem>();
      [...localItems, ...fetchedItems].forEach((item) => {
        if (item && item.id) {
          combinedMap.set(item.id, {
            ...item,
            lifecycle_stage: item.lifecycle_stage || "SUBMITTED",
          });
        }
      });

      const finalItems = Array.from(combinedMap.values());
      if (finalItems.length === 0) {
        setChallenges(demoDefault);
        setTotal(demoDefault.length);
      } else {
        setChallenges(finalItems);
        setTotal(finalItems.length);
      }
      setLoading(false);
    }

    void loadData();
  }, []);

  const filtered = challenges.filter((c) => {
    if (activeTab === "ALL") return true;
    if (activeTab === "CLARIFICATION") return (c.lifecycle_stage || "").includes("CLARIFICATION");
    if (activeTab === "UNDER_REVIEW") return (c.lifecycle_stage || "") === "SUBMITTED";
    if (activeTab === "INNOVATION") return (c.lifecycle_stage || "").includes("INNOVATION");
    if (activeTab === "PILOT") return (c.lifecycle_stage || "").includes("PILOT");
    return true;
  });

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-stone-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-stone-900">My Societal Challenges</h1>
            <p className="text-sm text-stone-600 mt-1">
              Track status, evidence, and government review lifecycle for your submitted records.
            </p>
          </div>
          <Link
            href="/app/challenges/new"
            className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold rounded-lg transition-colors whitespace-nowrap text-center shadow-sm"
          >
            + Report New Challenge
          </Link>
        </div>

        {/* Filters & Tabs */}
        <div className="flex items-center space-x-2 border-b border-stone-200 overflow-x-auto pb-2 text-xs font-semibold text-stone-600">
          {[
            { id: "ALL", label: `All (${total})` },
            { id: "UNDER_REVIEW", label: "Under Review" },
            { id: "CLARIFICATION", label: "Needs Clarification" },
            { id: "INNOVATION", label: "Innovation Challenges" },
            { id: "PILOT", label: "Pilot Activity" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-2 rounded-lg font-bold transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-stone-900 text-amber-400"
                  : "hover:bg-stone-100 text-stone-600"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Challenge List Table */}
        {loading ? (
          <div className="flex justify-center py-12 text-stone-500 text-sm font-medium">
            <div className="w-5 h-5 border-2 border-amber-600 border-t-transparent rounded-full animate-spin mr-2"></div>
            Loading challenges...
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-stone-200 p-12 text-center text-stone-500 text-sm">
            No challenges match the selected filter criteria.
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden divide-y divide-stone-100">
            {filtered.map((item) => (
              <div key={item.id} className="p-5 hover:bg-stone-50/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5 max-w-3xl">
                  <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                    <Link
                      href={`/app/challenges/${item.id}`}
                      className="font-bold text-stone-900 hover:text-amber-700 text-base tracking-tight"
                    >
                      {item.title}
                    </Link>
                    <span className="bg-stone-100 text-stone-800 text-[10px] font-bold px-2 py-0.5 rounded border border-stone-200">
                      {item.domain}
                    </span>
                    <span className="text-xs text-stone-500 font-medium">
                      • {item.district}, {item.state}
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 line-clamp-2">{item.summary}</p>
                  <div className="text-[11px] text-stone-500 space-x-3 pt-1">
                    <span>Submitted: {new Date(item.submitted_at).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>Last Updated: {new Date(item.updated_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3 self-end md:self-center whitespace-nowrap">
                  <span className="bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold px-3 py-1 rounded-md">
                    {item.lifecycle_stage.replace(/_/g, " ")}
                  </span>
                  <Link
                    href={`/app/challenges/${item.id}`}
                    className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold transition-colors"
                  >
                    View Record →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
