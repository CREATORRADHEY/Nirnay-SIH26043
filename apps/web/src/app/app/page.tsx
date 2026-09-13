"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { AppShell } from "@/components/AppShell";

interface CitizenChallengeItem {
  id: string;
  title: string;
  summary: string;
  domain: string;
  district: string;
  submitted_at: string;
  lifecycle_stage: string;
}

interface ReviewQueueStats {
  unreviewed: number;
  awaiting_clarification: number;
  innovation_challenges: number;
}

export default function ProductionDashboardPage() {
  const { user, loading } = useAuth();
  const [myChallenges, setMyChallenges] = useState<CitizenChallengeItem[]>([]);
  const [myTotal, setMyTotal] = useState(0);
  const [reviewStats, setReviewStats] = useState<ReviewQueueStats | null>(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!user) return;

    if (user.platform_role === "COMMUNITY_REPORTER") {
      fetch("/api/v1/me/challenges?limit=5", { credentials: "include" })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data) {
            setMyChallenges(data.items || []);
            setMyTotal(data.total || 0);
          }
        })
        .catch(() => {})
        .finally(() => setFetching(false));
    } else {
      fetch("/api/v1/government/review-queue?limit=1", { credentials: "include" })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && data.stats) {
            setReviewStats(data.stats);
          }
        })
        .catch(() => {})
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

  const isGov = user.platform_role.startsWith("GOVERNMENT_") || user.platform_role === "PLATFORM_ADMIN";
  const roleTitle = user.platform_role.replace(/_/g, " ");

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
              Production Operational Dashboard • Logged in as <span className="font-semibold">{user.email}</span>
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {!isGov ? (
              <>
                <Link
                  href="/app/challenges/new"
                  className="px-4 py-2 bg-amber-600 text-white text-sm font-semibold rounded-lg hover:bg-amber-700 transition-colors shadow-sm"
                >
                  Report a Societal Challenge
                </Link>
                <Link
                  href="/app/challenges"
                  className="px-4 py-2 bg-stone-100 text-stone-800 text-sm font-semibold rounded-lg hover:bg-stone-200 border border-stone-300 transition-colors"
                >
                  View My Challenges
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/app/review"
                  className="px-4 py-2 bg-stone-900 text-white text-sm font-semibold rounded-lg hover:bg-stone-800 transition-colors shadow-sm"
                >
                  Open Intake Queue
                </Link>
                <Link
                  href="/app/readiness"
                  className="px-4 py-2 bg-amber-600 text-white text-sm font-semibold rounded-lg hover:bg-amber-700 transition-colors shadow-sm"
                >
                  Readiness Workspace
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Citizen Specific Dashboard View */}
        {!isGov && (
          <div className="space-y-6">
            <h2 className="text-xs font-bold text-stone-500 uppercase tracking-widest">
              Community Submissions & Activity
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm">
                <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider">My Reported Challenges</div>
                <div className="text-3xl font-extrabold text-stone-900 mt-2">{myTotal}</div>
              </div>
              <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm">
                <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Under Active Review</div>
                <div className="text-3xl font-extrabold text-amber-600 mt-2">
                  {myChallenges.filter((c) => c.lifecycle_stage !== "SUBMITTED").length}
                </div>
              </div>
              <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm">
                <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Submitted Records</div>
                <div className="text-3xl font-extrabold text-emerald-600 mt-2">{myTotal}</div>
              </div>
              <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm">
                <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Geographic Scope</div>
                <div className="text-3xl font-extrabold text-stone-900 mt-2">Jharkhand</div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-stone-900 text-lg">Recent Submissions</h3>
                <Link href="/app/challenges" className="text-xs font-semibold text-amber-700 hover:underline">
                  View All ({myTotal}) →
                </Link>
              </div>

              {myChallenges.length === 0 ? (
                <div className="py-8 text-center text-stone-500 text-sm border-2 border-dashed border-stone-200 rounded-lg">
                  No societal challenges reported yet. Click &quot;Report a Societal Challenge&quot; to submit a new issue.
                </div>
              ) : (
                <div className="divide-y divide-stone-100">
                  {myChallenges.map((item) => (
                    <div key={item.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center space-x-2">
                          <Link href={`/app/challenges/${item.id}`} className="font-bold text-stone-900 hover:text-amber-700 text-base">
                            {item.title}
                          </Link>
                          <span className="bg-stone-100 text-stone-700 text-[10px] font-bold px-2 py-0.5 rounded border border-stone-200">
                            {item.domain}
                          </span>
                        </div>
                        <p className="text-xs text-stone-600 mt-1 line-clamp-1">{item.summary}</p>
                      </div>
                      <div className="flex items-center space-x-3 text-xs whitespace-nowrap">
                        <span className="bg-amber-50 text-amber-800 border border-amber-200 font-semibold px-2.5 py-1 rounded-md">
                          {item.lifecycle_stage.replace(/_/g, " ")}
                        </span>
                        <Link
                          href={`/app/challenges/${item.id}`}
                          className="px-3 py-1.5 bg-stone-900 text-white rounded font-medium text-xs hover:bg-stone-800"
                        >
                          Details
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Government Specific Dashboard View */}
        {isGov && (
          <div className="space-y-6">
            <h2 className="text-xs font-bold text-stone-500 uppercase tracking-widest">
              Government Intake & Review Queue Summary
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm">
                <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Unreviewed Intake</div>
                <div className="text-3xl font-extrabold text-amber-600 mt-2">{reviewStats?.unreviewed ?? 0}</div>
                <p className="text-xs text-stone-500 mt-1">Awaiting initial intake review</p>
              </div>
              <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm">
                <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Awaiting Clarification</div>
                <div className="text-3xl font-extrabold text-blue-600 mt-2">{reviewStats?.awaiting_clarification ?? 0}</div>
                <p className="text-xs text-stone-500 mt-1">Query sent to submitter</p>
              </div>
              <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm">
                <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Innovation Challenges</div>
                <div className="text-3xl font-extrabold text-emerald-600 mt-2">{reviewStats?.innovation_challenges ?? 0}</div>
                <p className="text-xs text-stone-500 mt-1">Qualified for HEI matching & pilots</p>
              </div>
            </div>

            <h2 className="text-xs font-bold text-stone-500 uppercase tracking-widest pt-2">
              Operational Workspaces
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                href="/app/review"
                className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm hover:border-amber-500 transition-all block"
              >
                <div className="font-bold text-stone-900 text-base flex items-center justify-between">
                  <span>Intake & Review Queue</span>
                  <span>→</span>
                </div>
                <p className="text-xs text-stone-600 mt-2">
                  Inspect incoming citizen challenges, examine evidence, request clarification, and record qualification decisions.
                </p>
              </Link>
              <Link
                href="/app/hei-matching"
                className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm hover:border-amber-500 transition-all block"
              >
                <div className="font-bold text-stone-900 text-base flex items-center justify-between">
                  <span>HEI Candidate Matching</span>
                  <span>→</span>
                </div>
                <p className="text-xs text-stone-600 mt-2">
                  Search institution capabilities directory and match higher educational institutional candidates to qualified challenges.
                </p>
              </Link>
              <Link
                href="/app/readiness"
                className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm hover:border-amber-500 transition-all block"
              >
                <div className="font-bold text-stone-900 text-base flex items-center justify-between">
                  <span>Readiness Authorization</span>
                  <span>→</span>
                </div>
                <p className="text-xs text-stone-600 mt-2">
                  Audit readiness conditions matrix, monitor commitment integrity events, and grant PILOT_READY human authorization.
                </p>
              </Link>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
