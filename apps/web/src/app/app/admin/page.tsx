"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { fetchAdminOverview, AdminOverviewResponse } from "@/lib/api";
import {
  Users,
  Building2,
  Clock,
  ShieldAlert,
  HelpCircle,
  FileText,
  Rocket,
  CheckCircle2,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";

export default function AdminOverviewPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<AdminOverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  const loadOverview = async () => {
    setLoading(true);
    setError(null);
    try {
      const overviewData = await fetchAdminOverview();
      setData(overviewData);
    } catch (err: any) {
      setError(err.message || "Failed to load operational metrics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user?.platform_role === "PLATFORM_ADMIN") {
      void loadOverview();
    }
  }, [user, authLoading]);

  if (authLoading || (!user && !authLoading) || (loading && !data && !error)) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3 text-[var(--text-secondary)] font-medium">
          <RefreshCw className="w-5 h-5 animate-spin text-[var(--primary)]" />
          <span>Loading platform administration telemetry...</span>
        </div>
      </div>
    );
  }

  if (user?.platform_role !== "PLATFORM_ADMIN") {
    return (
      <div className="p-8 bg-[#FFF5F5] border border-[#FEB2B2] rounded-xl text-center max-w-xl mx-auto my-12">
        <ShieldAlert className="w-12 h-12 text-[#E53E3E] mx-auto mb-3" />
        <h2 className="text-lg font-bold text-[#9B2C2C] mb-2">Access Denied</h2>
        <p className="text-sm text-[#742A2A]">
          Platform Administration console is restricted strictly to PLATFORM_ADMIN authorization level.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--border)]">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#EBF5EE] text-[#166534] border border-[#C6E7D0]">
              System Governance
            </span>
            <span className="text-xs text-[var(--text-secondary)] font-mono">/app/admin</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[var(--text-primary)] mt-1">
            Platform Administration Overview
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">
            Operational summaries, user memberships, organization approvals, and infrastructure telemetry.
          </p>
        </div>
        <button
          onClick={loadOverview}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] hover:bg-[#F4F1EA] transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-[#FFF5F5] border border-[#FEB2B2] rounded-lg text-xs font-medium text-[#C53030]">
          {error}
        </div>
      )}

      {/* Aggregate Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Accounts */}
        <div className="p-5 bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--text-secondary)]">Active Accounts</span>
            <div className="p-2 rounded-lg bg-[#F0F5FF] text-[#2B6CB0]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
            {data?.active_accounts ?? 0}
          </div>
          <p className="text-[11px] text-[var(--text-secondary)]">Registered platform users</p>
        </div>

        {/* Active Organizations */}
        <div className="p-5 bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--text-secondary)]">Active Organizations</span>
            <div className="p-2 rounded-lg bg-[#EBF5EE] text-[#166534]">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
            {data?.active_organizations ?? 0}
          </div>
          <p className="text-[11px] text-[var(--text-secondary)]">Approved HEIs, Government, Industry</p>
        </div>

        {/* Pending Approvals */}
        <Link href="/app/admin/organizations?status=PENDING" className="block">
          <div className="p-5 bg-[var(--surface)] border border-[#FCD8C5] rounded-xl shadow-xs space-y-3 hover:border-[var(--primary)] transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[var(--text-secondary)]">Pending Approvals</span>
              <div className="p-2 rounded-lg bg-[#FFF4EE] text-[var(--primary)]">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-[var(--primary)] tracking-tight">
              {data?.pending_organizations ?? 0}
            </div>
            <p className="text-[11px] text-[var(--primary)] font-medium">Organizations awaiting admin review →</p>
          </div>
        </Link>

        {/* Suspended Orgs */}
        <div className="p-5 bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--text-secondary)]">Suspended Orgs</span>
            <div className="p-2 rounded-lg bg-[#FFF5F5] text-[#C53030]">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
            {data?.suspended_organizations ?? 0}
          </div>
          <p className="text-[11px] text-[var(--text-secondary)]">Access restricted by policy</p>
        </div>
      </div>

      {/* Operational Workflows Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-[var(--surface)] border border-[var(--border)] rounded-xl space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-secondary)]">
            <FileText className="w-4 h-4 text-[#2B6CB0]" />
            <span>Innovation Challenges</span>
          </div>
          <div className="text-2xl font-bold text-[var(--text-primary)]">{data?.total_challenges ?? 0}</div>
          <p className="text-[11px] text-[var(--text-secondary)]">Citizen & Government challenges registered</p>
        </div>

        <div className="p-5 bg-[var(--surface)] border border-[var(--border)] rounded-xl space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-secondary)]">
            <HelpCircle className="w-4 h-4 text-[#D69E2E]" />
            <span>Open Clarifications</span>
          </div>
          <div className="text-2xl font-bold text-[var(--text-primary)]">{data?.open_clarifications ?? 0}</div>
          <p className="text-[11px] text-[var(--text-secondary)]">Pending factual evidence clarifications</p>
        </div>

        <div className="p-5 bg-[var(--surface)] border border-[var(--border)] rounded-xl space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-secondary)]">
            <CheckCircle2 className="w-4 h-4 text-[#DD6B20]" />
            <span>Readiness Reviews</span>
          </div>
          <div className="text-2xl font-bold text-[var(--text-primary)]">{data?.readiness_review_required ?? 0}</div>
          <p className="text-[11px] text-[var(--text-secondary)]">Government readiness check pending</p>
        </div>

        <div className="p-5 bg-[var(--surface)] border border-[var(--border)] rounded-xl space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-secondary)]">
            <Rocket className="w-4 h-4 text-[#319795]" />
            <span>Active Pilots</span>
          </div>
          <div className="text-2xl font-bold text-[var(--text-primary)]">{data?.active_pilots ?? 0}</div>
          <p className="text-[11px] text-[var(--text-secondary)]">Pilots authorized for execution</p>
        </div>
      </div>

      {/* Admin Quick Action Shortcuts */}
      <div className="p-6 bg-[var(--surface)] border border-[var(--border)] rounded-xl space-y-4">
        <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[var(--primary)]" />
          Governance Shortcuts
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <Link
            href="/app/admin/organizations"
            className="p-3 bg-[#FAF8F5] border border-[var(--border)] rounded-lg hover:border-[var(--primary)] transition-colors text-xs font-semibold text-[var(--text-primary)] block"
          >
            🏢 Organization Approval Console →
          </Link>
          <Link
            href="/app/admin/users"
            className="p-3 bg-[#FAF8F5] border border-[var(--border)] rounded-lg hover:border-[var(--primary)] transition-colors text-xs font-semibold text-[var(--text-primary)] block"
          >
            👥 Users & Memberships →
          </Link>
          <Link
            href="/app/admin/audit"
            className="p-3 bg-[#FAF8F5] border border-[var(--border)] rounded-lg hover:border-[var(--primary)] transition-colors text-xs font-semibold text-[var(--text-primary)] block"
          >
            📜 Security Audit Console →
          </Link>
          <Link
            href="/app/admin/ai"
            className="p-3 bg-[#FAF8F5] border border-[var(--border)] rounded-lg hover:border-[var(--primary)] transition-colors text-xs font-semibold text-[var(--text-primary)] block"
          >
            🤖 AI Operations Telemetry →
          </Link>
        </div>
      </div>
    </div>
  );
}
