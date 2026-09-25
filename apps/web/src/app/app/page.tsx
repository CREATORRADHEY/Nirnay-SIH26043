"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { AppShell } from "@/components/AppShell";

interface DashboardChallengeItem {
  id: string;
  title: string;
  summary: string;
  domain: string;
  district: string;
  submitted_at: string;
  lifecycle_stage: string;
  review_state?: string;
  open_clarification_count?: number;
}

interface ReviewQueueStats {
  unreviewed: number;
  awaiting_clarification: number;
  innovation_challenges: number;
}

export default function RoleBasedHomePage() {
  const { user, loading } = useAuth();
  const [challenges, setChallenges] = useState<DashboardChallengeItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [reviewStats, setReviewStats] = useState<ReviewQueueStats | null>(null);
  const [adminOverview, setAdminOverview] = useState<Record<string, number> | null>(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!user) return;

    const role = user.platform_role;

    if (role === "COMMUNITY_REPORTER") {
      fetch("/api/v1/me/challenges?limit=50", { credentials: "include" })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data) {
            setChallenges(data.items || []);
            setTotalCount(data.total || 0);
          }
        })
        .catch(() => {})
        .finally(() => setFetching(false));
    } else if (role.startsWith("GOVERNMENT_")) {
      Promise.all([
        fetch("/api/v1/government/review-queue?limit=50", { credentials: "include" }).then((r) =>
          r.ok ? r.json() : null
        ),
      ])
        .then(([queueData]) => {
          if (queueData) {
            setChallenges(queueData.items || []);
            setTotalCount(queueData.total || 0);
            setReviewStats(queueData.stats || null);
          }
        })
        .catch(() => {})
        .finally(() => setFetching(false));
    } else if (role === "PLATFORM_ADMIN") {
      fetch("/api/v1/admin/overview", { credentials: "include" })
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data) setAdminOverview(data);
        })
        .catch(() => {})
        .finally(() => setFetching(false));
    } else {
      // HEI / INDUSTRY
      fetch("/api/v1/challenges?limit=50", { credentials: "include" })
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data) {
            setChallenges(data.items || []);
            setTotalCount(data.total || 0);
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
            <span>Loading workspace home...</span>
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
          <p className="mt-2 text-sm text-stone-600">Please sign in to access your role-specific task dashboard.</p>
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

  const role = user.platform_role;

  // ----------------------------------------------------
  // 1. CITIZEN / COMMUNITY HOME
  // ----------------------------------------------------
  if (role === "COMMUNITY_REPORTER") {
    const needsResponse = challenges.filter(
      (c) => c.lifecycle_stage === "CLARIFY" || (c.open_clarification_count && c.open_clarification_count > 0)
    );
    const underReview = challenges.filter(
      (c) => c.lifecycle_stage === "SUBMITTED" || c.lifecycle_stage === "UNREVIEWED"
    );
    const qualified = challenges.filter(
      (c) =>
        c.lifecycle_stage === "INNOVATION_CHALLENGE" ||
        c.lifecycle_stage === "SERVICE" ||
        c.lifecycle_stage === "RESEARCH_REVIEW"
    );

    return (
      <AppShell>
        <div className="space-y-8">
          <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl font-bold text-stone-900">Your Challenges</h1>
                <span className="bg-amber-100 text-amber-900 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                  Citizen Portal
                </span>
              </div>
              <p className="text-sm text-stone-600 mt-1">
                Track your reported societal challenges, answer government queries, and monitor qualification progress.
              </p>
            </div>
            <Link
              href="/app/challenges/new"
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg transition-colors shadow"
            >
              + Report a Challenge
            </Link>
          </div>

          {/* Section: Needs Your Response */}
          {needsResponse.length > 0 && (
            <div className="bg-amber-50 p-6 rounded-xl border border-amber-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold text-amber-950 uppercase tracking-widest flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse"></span>
                  <span>Needs Your Response ({needsResponse.length})</span>
                </h2>
                <span className="text-xs font-bold text-amber-900">ACTION REQUIRED</span>
              </div>

              <div className="space-y-3">
                {needsResponse.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 bg-white rounded-lg border border-amber-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
                  >
                    <div>
                      <div className="font-bold text-stone-900 text-sm">{item.title}</div>
                      <p className="text-xs text-stone-600 mt-1">{item.summary}</p>
                      <div className="text-[10px] text-amber-800 font-semibold mt-1">
                        Government reviewer requested clarification on this submission.
                      </div>
                    </div>
                    <Link
                      href={`/app/challenges/${item.id}`}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded text-xs font-bold whitespace-nowrap"
                    >
                      Respond to Query →
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section: Under Review */}
          <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm space-y-4">
            <h2 className="text-xs font-bold text-stone-500 uppercase tracking-widest">
              Under Review ({underReview.length})
            </h2>
            {underReview.length === 0 ? (
              <p className="text-xs text-stone-500 italic">No submissions currently in initial intake review.</p>
            ) : (
              <div className="divide-y divide-stone-100">
                {underReview.map((item) => (
                  <div key={item.id} className="py-3 flex items-center justify-between">
                    <div>
                      <Link href={`/app/challenges/${item.id}`} className="font-bold text-stone-900 hover:text-amber-700 text-sm">
                        {item.title}
                      </Link>
                      <p className="text-xs text-stone-500 mt-0.5">{item.district} • {item.domain}</p>
                    </div>
                    <span className="text-xs font-mono font-bold px-2.5 py-1 bg-stone-100 text-stone-700 rounded border border-stone-200">
                      SUBMITTED
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section: Qualified Challenges */}
          <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm space-y-4">
            <h2 className="text-xs font-bold text-stone-500 uppercase tracking-widest">
              Qualified Challenges ({qualified.length})
            </h2>
            {qualified.length === 0 ? (
              <p className="text-xs text-stone-500 italic">No submissions qualified yet.</p>
            ) : (
              <div className="divide-y divide-stone-100">
                {qualified.map((item) => (
                  <div key={item.id} className="py-3 flex items-center justify-between">
                    <div>
                      <Link href={`/app/challenges/${item.id}`} className="font-bold text-stone-900 hover:text-amber-700 text-sm">
                        {item.title}
                      </Link>
                      <p className="text-xs text-stone-500 mt-0.5">{item.district} • {item.domain}</p>
                    </div>
                    <span className="text-xs font-mono font-bold px-2.5 py-1 bg-emerald-100 text-emerald-900 rounded border border-emerald-300">
                      {item.lifecycle_stage}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section: Recent Activity */}
          <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm space-y-4">
            <h2 className="text-xs font-bold text-stone-500 uppercase tracking-widest">
              Recent Activity ({totalCount})
            </h2>
            {challenges.length === 0 ? (
              <div className="py-8 text-center text-stone-500 text-sm border-2 border-dashed border-stone-200 rounded-lg">
                No challenges reported yet. Click &quot;Report a Challenge&quot; to begin.
              </div>
            ) : (
              <div className="divide-y divide-stone-100">
                {challenges.map((item) => (
                  <div key={item.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <Link href={`/app/challenges/${item.id}`} className="font-bold text-stone-900 hover:text-amber-700 text-base">
                        {item.title}
                      </Link>
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
                        Passport →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </AppShell>
    );
  }

  // ----------------------------------------------------
  // 2. GOVERNMENT REVIEWER HOME
  // ----------------------------------------------------
  if (role.startsWith("GOVERNMENT_")) {
    const needsInitial = challenges.filter((c) => c.review_state === "UNREVIEWED");
    const clarReturned = challenges.filter((c) => c.review_state === "AWAITING_CLARIFICATION");
    const qualPending = challenges.filter((c) => c.review_state === "UNREVIEWED" || c.review_state === "AWAITING_CLARIFICATION");
    const commitmentPending = challenges.filter((c) => c.review_state === "INNOVATION_CHALLENGE");
    const readinessReview = challenges.filter((c) => c.review_state === "READINESS_REVIEW");
    const outcomeReview = challenges.filter((c) => c.review_state === "OUTCOME_REVIEW");

    return (
      <AppShell>
        <div className="space-y-8">
          <div className="bg-stone-900 text-white p-6 rounded-xl border border-stone-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl font-bold text-stone-100">Challenges Requiring Decision</h1>
                <span className="bg-amber-500 text-stone-950 text-xs font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
                  State Nodal Reviewer
                </span>
              </div>
              <p className="text-xs text-stone-300 mt-1">
                Intake queue, qualification decisions, candidate shortlisting, pilot readiness sign-offs, and outcome reviews.
              </p>
            </div>
            <Link
              href="/app/review"
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg transition-colors shadow text-center"
            >
              Open Review Queue →
            </Link>
          </div>

          {/* Stats Bar: What requires my decision now? */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm text-center">
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Initial Review</span>
              <span className="text-2xl font-extrabold text-stone-900 mt-1 block">{needsInitial.length}</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm text-center">
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Clarification Thread</span>
              <span className="text-2xl font-extrabold text-blue-600 mt-1 block">{clarReturned.length}</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm text-center">
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Qual. Pending</span>
              <span className="text-2xl font-extrabold text-amber-600 mt-1 block">{qualPending.length}</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm text-center">
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Commitment Pending</span>
              <span className="text-2xl font-extrabold text-purple-600 mt-1 block">{commitmentPending.length}</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm text-center">
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Readiness Review</span>
              <span className="text-2xl font-extrabold text-rose-600 mt-1 block">{readinessReview.length}</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm text-center">
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Outcome Review</span>
              <span className="text-2xl font-extrabold text-emerald-600 mt-1 block">{outcomeReview.length}</span>
            </div>
          </div>

          {/* Primary Task Table */}
          <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                Action Required Tasks ({challenges.length})
              </h2>
              <Link href="/app/review" className="text-xs font-bold text-amber-700 hover:underline">
                View Full Queue →
              </Link>
            </div>

            {challenges.length === 0 ? (
              <div className="py-8 text-center text-stone-500 text-sm border-2 border-dashed border-stone-200 rounded-lg">
                No challenges currently require qualification or review decision.
              </div>
            ) : (
              <div className="divide-y divide-stone-100">
                {challenges.slice(0, 10).map((item) => (
                  <div key={item.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center space-x-2">
                        <Link href={`/app/challenges/${item.id}`} className="font-bold text-stone-900 hover:text-amber-700 text-sm">
                          {item.title}
                        </Link>
                        <span className="bg-stone-100 text-stone-700 text-[10px] font-bold px-2 py-0.5 rounded border border-stone-200">
                          {item.domain}
                        </span>
                      </div>
                      <p className="text-xs text-stone-600 mt-1 line-clamp-1">{item.summary}</p>
                    </div>
                    <div className="flex items-center space-x-3 text-xs whitespace-nowrap">
                      <span className="bg-amber-100 text-amber-900 border border-amber-300 font-bold px-2.5 py-1 rounded-md">
                        {(item.review_state || item.lifecycle_stage).replace(/_/g, " ")}
                      </span>
                      <Link
                        href={`/app/review/${item.id}`}
                        className="px-3.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded text-xs font-bold"
                      >
                        Workbench →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </AppShell>
    );
  }

  // ----------------------------------------------------
  // 3. HEI / UNIVERSITY HOME
  // ----------------------------------------------------
  if (role.startsWith("HEI_")) {
    return (
      <AppShell>
        <div className="space-y-8">
          <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl font-bold text-stone-900">Institutional Opportunities</h1>
                <span className="bg-amber-100 text-amber-900 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                  HEI Workspace
                </span>
              </div>
              <p className="text-sm text-stone-600 mt-1">
                Review candidate challenge matches, submit institutional commitments, and track active field pilots.
              </p>
            </div>
            <Link
              href="/app/hei-matching"
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg transition-colors shadow"
            >
              Review Matches →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm">
              <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block">New Matches</span>
              <span className="text-3xl font-extrabold text-stone-900 mt-2 block">{challenges.length}</span>
            </div>
            <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm">
              <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block">Commitment Requested</span>
              <span className="text-3xl font-extrabold text-amber-600 mt-2 block">1</span>
            </div>
            <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm">
              <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block">Accepted Commitments</span>
              <span className="text-3xl font-extrabold text-emerald-600 mt-2 block">1</span>
            </div>
            <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm">
              <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block">Active Pilots</span>
              <span className="text-3xl font-extrabold text-blue-600 mt-2 block">1</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                Candidate Opportunities ({challenges.length})
              </h2>
              <Link href="/app/commitments" className="text-xs font-bold text-amber-700 hover:underline">
                Manage Commitments →
              </Link>
            </div>

            {challenges.length === 0 ? (
              <div className="py-8 text-center text-stone-500 text-sm border-2 border-dashed border-stone-200 rounded-lg">
                No commitment requests require your response.
              </div>
            ) : (
              <div className="divide-y divide-stone-100">
                {challenges.slice(0, 10).map((item) => (
                  <div key={item.id} className="py-3 flex items-center justify-between">
                    <div>
                      <Link href={`/app/challenges/${item.id}`} className="font-bold text-stone-900 hover:text-amber-700 text-sm">
                        {item.title}
                      </Link>
                      <p className="text-xs text-stone-500 mt-0.5">{item.district} • {item.domain}</p>
                    </div>
                    <Link
                      href={`/app/commitments?challenge_id=${item.id}`}
                      className="px-3.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded text-xs font-bold"
                    >
                      Record Commitment →
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </AppShell>
    );
  }

  // ----------------------------------------------------
  // 4. INDUSTRY / MSME HOME
  // ----------------------------------------------------
  if (role.startsWith("INDUSTRY_")) {
    return (
      <AppShell>
        <div className="space-y-8">
          <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-stone-900">Collaboration Opportunities</h1>
              <p className="text-sm text-stone-600 mt-1">
                Explore societal challenges suitable for industry co-investment, technology transfer, and pilot support.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm">
              <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block">Available Opportunities</span>
              <span className="text-3xl font-extrabold text-stone-900 mt-2 block">{challenges.length}</span>
            </div>
            <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm">
              <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block">Commitments</span>
              <span className="text-3xl font-extrabold text-amber-600 mt-2 block">0</span>
            </div>
            <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm">
              <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block">Supported Pilots</span>
              <span className="text-3xl font-extrabold text-emerald-600 mt-2 block">0</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider">Available Opportunities</h2>
            {challenges.length === 0 ? (
              <div className="py-8 text-center text-stone-500 text-sm border-2 border-dashed border-stone-200 rounded-lg">
                No industry collaboration opportunities available.
              </div>
            ) : (
              <div className="divide-y divide-stone-100">
                {challenges.slice(0, 10).map((item) => (
                  <div key={item.id} className="py-3 flex items-center justify-between">
                    <div>
                      <Link href={`/app/challenges/${item.id}`} className="font-bold text-stone-900 hover:text-amber-700 text-sm">
                        {item.title}
                      </Link>
                      <p className="text-xs text-stone-500 mt-0.5">{item.district} • {item.domain}</p>
                    </div>
                    <Link
                      href={`/app/challenges/${item.id}`}
                      className="px-3.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded text-xs font-bold"
                    >
                      View Details →
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </AppShell>
    );
  }

  // ----------------------------------------------------
  // 5. PLATFORM ADMIN HOME
  // ----------------------------------------------------
  return (
    <AppShell>
      <div className="space-y-8">
        <div className="bg-stone-900 text-white p-6 rounded-xl border border-stone-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-stone-100">Platform Operations</h1>
              <span className="bg-amber-500 text-stone-950 text-xs font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
                System Admin
              </span>
            </div>
            <p className="text-xs text-stone-300 mt-1">
              Organization onboarding, user access control, security audit logging, and AI system health.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Link
              href="/app/organizations"
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg transition-colors"
            >
              Organizations
            </Link>
            <Link
              href="/app/admin/users"
              className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold rounded-lg border border-stone-700 transition-colors"
            >
              Users
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block">Active Users</span>
            <span className="text-3xl font-extrabold text-stone-900 mt-2 block">{adminOverview?.active_accounts ?? 0}</span>
          </div>
          <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block">Active Orgs</span>
            <span className="text-3xl font-extrabold text-emerald-600 mt-2 block">{adminOverview?.active_organizations ?? 0}</span>
          </div>
          <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block">Pending Orgs</span>
            <span className="text-3xl font-extrabold text-amber-600 mt-2 block">{adminOverview?.pending_organizations ?? 0}</span>
          </div>
          <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block">Active Pilots</span>
            <span className="text-3xl font-extrabold text-blue-600 mt-2 block">{adminOverview?.active_pilots ?? 0}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link
            href="/app/organizations"
            className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm hover:border-amber-500 transition-all block"
          >
            <div className="font-bold text-stone-900 text-base">Organizations</div>
            <p className="text-xs text-stone-600 mt-1">Review onboarded universities, government departments, and industry partners.</p>
          </Link>
          <Link
            href="/app/admin/users"
            className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm hover:border-amber-500 transition-all block"
          >
            <div className="font-bold text-stone-900 text-base">Users</div>
            <p className="text-xs text-stone-600 mt-1">Manage platform role assignments, status activations, and security boundaries.</p>
          </Link>
          <Link
            href="/app/admin/audit"
            className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm hover:border-amber-500 transition-all block"
          >
            <div className="font-bold text-stone-900 text-base">Audit</div>
            <p className="text-xs text-stone-600 mt-1">Inspect security audit logs, authentication events, and administrative transitions.</p>
          </Link>
          <Link
            href="/app/admin/ai"
            className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm hover:border-amber-500 transition-all block"
          >
            <div className="font-bold text-stone-900 text-base">AI Operations</div>
            <p className="text-xs text-stone-600 mt-1">Monitor circuit breaker status, latency telemetry, and advisory audit logs.</p>
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
