"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { fetchAdminAIOperations, AdminAIOperationsResponse } from "@/lib/api";
import { HowNIRNAYUsesAI } from "@/components/HowNIRNAYUsesAI";
import {
  Cpu,
  Zap,
  Sparkles,
  CheckCircle,
  XCircle,
  Clock,
  ShieldAlert,
  RefreshCw,
  Activity,
  Check,
  X,
  AlertOctagon,
} from "lucide-react";
import Link from "next/link";

export default function AdminAIOperationsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [telemetry, setTelemetry] = useState<AdminAIOperationsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTelemetry = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminAIOperations();
      setTelemetry(data);
    } catch (err: any) {
      setError(err.message || "Failed to load AI operational telemetry");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);
  useEffect(() => {
    if (!authLoading && user?.platform_role === "PLATFORM_ADMIN") {
      void loadTelemetry();
    }
  }, [user, authLoading]);

  if (authLoading || (loading && !telemetry && !error)) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3 text-[var(--text-secondary)] font-medium">
          <RefreshCw className="w-5 h-5 animate-spin text-[var(--primary)]" />
          <span>Loading AI assistance infrastructure telemetry...</span>
        </div>
      </div>
    );
  }

  if (user?.platform_role !== "PLATFORM_ADMIN") {
    return (
      <div className="p-8 bg-[#FFF5F5] border border-[#FEB2B2] rounded-xl text-center max-w-xl mx-auto my-12">
        <ShieldAlert className="w-12 h-12 text-[#E53E3E] mx-auto mb-3" />
        <h2 className="text-lg font-bold text-[#9B2C2C] mb-2">Access Denied</h2>
        <p className="text-sm text-[#742A2A]">PLATFORM_ADMIN authorization required.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border)]">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/app/admin" className="text-xs text-[var(--text-secondary)] hover:underline">
              Admin Overview
            </Link>
            <span className="text-xs text-[var(--text-secondary)]">/</span>
            <span className="text-xs font-semibold text-[var(--primary)]">AI Operations</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[var(--text-primary)] mt-1">
            AI Operations & Safety Telemetry
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">
            Monitor bounded AI assistance requests, circuit breaker status, latency, and schema execution metrics.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/app/evaluation/ai"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-lg bg-amber-600 text-white hover:bg-amber-700 shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Evaluation Workspace</span>
          </Link>
          <button
            onClick={loadTelemetry}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] hover:bg-[#F4F1EA]"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh Telemetry</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-[#FFF5F5] border border-[#FEB2B2] rounded-lg text-xs font-medium text-[#C53030]">
          {error}
        </div>
      )}

      {/* Canonical AI Capability Model & Safety Component */}
      <HowNIRNAYUsesAI />

      {/* Operational Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Status */}
        <div className="p-5 bg-[var(--surface)] border border-[var(--border)] rounded-xl space-y-2">
          <div className="text-xs font-medium text-[var(--text-secondary)]">AI Module Status</div>
          <div className="flex items-center gap-2">
            {telemetry?.ai_enabled ? (
              <span className="inline-flex items-center gap-1 text-sm font-bold text-[#166534] bg-[#EBF5EE] px-2.5 py-0.5 rounded border border-[#C6E7D0]">
                <Check className="w-4 h-4" /> ENABLED
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-sm font-bold text-[#C53030] bg-[#FFF5F5] px-2.5 py-0.5 rounded border border-[#FEB2B2]">
                <X className="w-4 h-4" /> DISABLED
              </span>
            )}
          </div>
          <p className="text-[11px] text-[var(--text-secondary)]">
            Provider: <strong className="font-mono text-[var(--text-primary)]">{telemetry?.provider}</strong> ({telemetry?.model})
          </p>
        </div>

        {/* Total Requests */}
        <div className="p-5 bg-[var(--surface)] border border-[var(--border)] rounded-xl space-y-2">
          <div className="text-xs font-medium text-[var(--text-secondary)]">Total AI Requests</div>
          <div className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
            {telemetry?.total_requests ?? 0}
          </div>
          <p className="text-[11px] text-[var(--text-secondary)]">
            Success: {telemetry?.success_count ?? 0} | Failures: {telemetry?.failure_count ?? 0}
          </p>
        </div>

        {/* Avg Latency */}
        <div className="p-5 bg-[var(--surface)] border border-[var(--border)] rounded-xl space-y-2">
          <div className="text-xs font-medium text-[var(--text-secondary)]">Average Latency</div>
          <div className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight font-mono">
            {telemetry?.avg_latency_ms ?? 0} ms
          </div>
          <p className="text-[11px] text-[var(--text-secondary)]">Execution response time</p>
        </div>

        {/* Circuit Breaker Status */}
        <div className="p-5 bg-[var(--surface)] border border-[var(--border)] rounded-xl space-y-2">
          <div className="text-xs font-medium text-[var(--text-secondary)]">Circuit Breaker</div>
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 text-sm font-mono font-bold px-2.5 py-0.5 rounded border ${
                telemetry?.circuit_breaker_status === "CLOSED"
                  ? "bg-[#EBF5EE] text-[#166534] border-[#C6E7D0]"
                  : "bg-[#FFF5F5] text-[#C53030] border-[#FEB2B2]"
              }`}
            >
              <Activity className="w-4 h-4" /> {telemetry?.circuit_breaker_status}
            </span>
          </div>
          <p className="text-[11px] text-[var(--text-secondary)]">Automatic failure protection</p>
        </div>
      </div>

      {/* Task Breakdown */}
      <div className="p-5 bg-[var(--surface)] border border-[var(--border)] rounded-xl space-y-3">
        <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
          Task Type Breakdown
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {Object.entries(telemetry?.task_breakdown || {}).map(([task, count]) => (
            <div key={task} className="p-3 bg-[#FAF8F5] border border-[var(--border)] rounded-lg flex items-center justify-between">
              <span className="text-xs font-mono font-semibold text-[var(--text-primary)]">{task}</span>
              <span className="text-xs font-bold px-2 py-0.5 bg-[var(--surface)] border border-[var(--border)] rounded">{count}</span>
            </div>
          ))}
          {Object.keys(telemetry?.task_breakdown || {}).length === 0 && (
            <div className="text-xs text-[var(--text-secondary)] italic col-span-3">No tasks executed yet.</div>
          )}
        </div>
      </div>

      {/* Recent AI Audit Log */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-[var(--border)] bg-[#FAF8F5]">
          <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
            Recent AI Execution Telemetry
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FAF8F5] border-b border-[var(--border)] text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Task Type</th>
                <th className="py-3 px-4">Provider / Model</th>
                <th className="py-3 px-4">Latency</th>
                <th className="py-3 px-4">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)] text-xs font-mono">
              {(!telemetry?.recent_entries || telemetry.recent_entries.length === 0) ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-[var(--text-secondary)] font-sans">
                    No recent AI execution log entries found.
                  </td>
                </tr>
              ) : (
                telemetry.recent_entries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-[#FBF9F5] transition-colors">
                    <td className="py-3 px-4 text-[11px] text-[var(--text-secondary)]">
                      {new Date(entry.created_at).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-bold text-[var(--text-primary)]">{entry.task_type}</td>
                    <td className="py-3 px-4 text-[var(--text-secondary)]">
                      {entry.provider} / {entry.model} (v{entry.prompt_version})
                    </td>
                    <td className="py-3 px-4 text-[var(--text-secondary)]">{entry.latency_ms} ms</td>
                    <td className="py-3 px-4">
                      {entry.success ? (
                        <span className="text-[#166534] bg-[#EBF5EE] px-2 py-0.5 rounded font-sans font-bold text-[10px]">
                          SUCCESS
                        </span>
                      ) : (
                        <span className="text-[#C53030] bg-[#FFF5F5] px-2 py-0.5 rounded font-sans font-bold text-[10px]">
                          FAILED
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
