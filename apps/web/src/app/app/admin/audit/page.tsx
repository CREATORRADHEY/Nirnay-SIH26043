"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { fetchAdminAuditLogs, AdminAuditLogItem } from "@/lib/api";
import {
  ShieldCheck,
  ShieldAlert,
  Search,
  Filter,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  FileText,
  Clock,
  User,
  Key,
} from "lucide-react";
import Link from "next/link";

export default function AdminAuditPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [logs, setLogs] = useState<AdminAuditLogItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [eventTypeFilter, setEventTypeFilter] = useState<string>("");
  const [actorIdFilter, setActorIdFilter] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAuditLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchAdminAuditLogs(
        eventTypeFilter || undefined,
        actorIdFilter || undefined,
        page,
        20
      );
      setLogs(res.items);
      setTotal(res.total);
    } catch (err: any) {
      setError(err.message || "Failed to load security audit logs");
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
      void loadAuditLogs();
    }
  }, [user, authLoading, page, eventTypeFilter]);

  const handleActorSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    void loadAuditLogs();
  };

  if (authLoading || (loading && logs.length === 0 && !error)) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3 text-[var(--text-secondary)] font-medium">
          <RefreshCw className="w-5 h-5 animate-spin text-[var(--primary)]" />
          <span>Loading security audit trail...</span>
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
            <span className="text-xs font-semibold text-[var(--primary)]">Security Audit</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[var(--text-primary)] mt-1">
            System Security Audit Log
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">
            Immutable audit record of security, lifecycle, and administrative events across NIRNAY.
          </p>
        </div>
        <button
          onClick={loadAuditLogs}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] hover:bg-[#F4F1EA]"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-[#FFF5F5] border border-[#FEB2B2] rounded-lg text-xs font-medium text-[#C53030]">
          {error}
        </div>
      )}

      {/* Controls & Filter */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-[var(--surface)] border border-[var(--border)] rounded-xl">
        <div className="flex items-center gap-3 flex-1 min-w-[280px]">
          <select
            value={eventTypeFilter}
            onChange={(e) => {
              setEventTypeFilter(e.target.value);
              setPage(1);
            }}
            className="text-xs border border-[var(--border)] bg-[var(--background)] rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
          >
            <option value="">All Event Types</option>
            <option value="USER_LOGIN">USER_LOGIN</option>
            <option value="USER_LOGOUT">USER_LOGOUT</option>
            <option value="USER_ROLE_CHANGED">USER_ROLE_CHANGED</option>
            <option value="USER_DEACTIVATED">USER_DEACTIVATED</option>
            <option value="USER_REACTIVATED">USER_REACTIVATED</option>
            <option value="ORG_ACTIVATED">ORG_ACTIVATED</option>
            <option value="ORG_REJECTED">ORG_REJECTED</option>
            <option value="ORG_SUSPENDED">ORG_SUSPENDED</option>
            <option value="PASSWORD_RESET">PASSWORD_RESET</option>
          </select>

          <form onSubmit={handleActorSearch} className="flex items-center gap-2 flex-1">
            <input
              type="text"
              placeholder="Filter by Actor UUID..."
              value={actorIdFilter}
              onChange={(e) => setActorIdFilter(e.target.value)}
              className="text-xs px-3 py-1.5 border border-[var(--border)] bg-[var(--background)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--primary)] w-full"
            />
            <button
              type="submit"
              className="px-3 py-1.5 text-xs font-semibold bg-[var(--surface)] border border-[var(--border)] rounded-md hover:bg-[#F4F1EA]"
            >
              Filter
            </button>
          </form>
        </div>

        <div className="text-xs text-[var(--text-secondary)] font-mono">
          Strict Privacy Guard Active (No credentials / secrets logged)
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FAF8F5] border-b border-[var(--border)] text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Event Type</th>
                <th className="py-3 px-4">Actor ID</th>
                <th className="py-3 px-4">IP Address</th>
                <th className="py-3 px-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)] text-xs">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-[var(--text-secondary)]">
                    No security audit records match the current filters.
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const isOrgEvent = log.event_type.startsWith("ORG_");
                  const isUserEvent = log.event_type.startsWith("USER_");

                  return (
                    <tr key={log.id} className="hover:bg-[#FBF9F5] transition-colors">
                      <td className="py-3 px-4 font-mono text-[11px] text-[var(--text-secondary)] whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                            isOrgEvent
                              ? "bg-[#FFF4EE] text-[var(--primary)] border border-[#FCD8C5]"
                              : isUserEvent
                              ? "bg-[#EBF5EE] text-[#166534] border border-[#C6E7D0]"
                              : "bg-gray-100 text-gray-800 border border-gray-200"
                          }`}
                        >
                          {log.event_type}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-[var(--text-secondary)]">
                        {log.actor_id ? log.actor_id.substring(0, 18) + "..." : "System"}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-[var(--text-secondary)]">
                        {log.ip_address || "N/A"}
                      </td>
                      <td className="py-3 px-4 text-[var(--text-primary)] max-w-md">
                        <p className="text-xs leading-relaxed">{log.details || "No details provided"}</p>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-3 bg-[#FAF8F5] border-t border-[var(--border)] flex items-center justify-between text-xs text-[var(--text-secondary)]">
          <span>
            Showing {logs.length} of {total} audit records
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1 rounded border border-[var(--border)] bg-[var(--surface)] disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono text-[11px]">Page {page}</span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page * 20 >= total}
              className="p-1 rounded border border-[var(--border)] bg-[var(--surface)] disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
