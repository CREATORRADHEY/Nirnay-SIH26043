"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  fetchAdminOrganizations,
  updateAdminOrganizationStatus,
  AdminOrganizationItem,
} from "@/lib/api";
import {
  Building2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Search,
  Filter,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  Info,
} from "lucide-react";
import Link from "next/link";

export default function AdminOrganizationsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [orgs, setOrgs] = useState<AdminOrganizationItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Rationale Modal state
  const [modalOrg, setModalOrg] = useState<AdminOrganizationItem | null>(null);
  const [targetStatus, setTargetStatus] = useState<string>("");
  const [rationale, setRationale] = useState("");
  const [isPending, startTransition] = useTransition();

  const loadOrganizations = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchAdminOrganizations(
        statusFilter || undefined,
        typeFilter || undefined,
        page,
        20
      );
      setOrgs(res.items);
      setTotal(res.total);
    } catch (err: any) {
      setError(err.message || "Failed to load organizations");
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
      void loadOrganizations();
    }
  }, [user, authLoading, page, statusFilter, typeFilter]);

  const openStatusModal = (org: AdminOrganizationItem, newStatus: string) => {
    setModalOrg(org);
    setTargetStatus(newStatus);
    setRationale("");
  };

  const handleStatusSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalOrg || !targetStatus) return;

    if ((targetStatus === "REJECTED" || targetStatus === "SUSPENDED") && !rationale.trim()) {
      setError("A explicit rationale is required when rejecting or suspending an organization.");
      return;
    }

    startTransition(async () => {
      try {
        await updateAdminOrganizationStatus(modalOrg.id, targetStatus, rationale.trim());
        setSuccessMsg(
          `Organization '${modalOrg.name}' status updated to ${targetStatus}. Audit log recorded.`
        );
        setModalOrg(null);
        void loadOrganizations();
      } catch (err: any) {
        setError(err.message || "Failed to update organization status");
      }
    });
  };

  if (authLoading || (loading && orgs.length === 0 && !error)) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3 text-[var(--text-secondary)] font-medium">
          <RefreshCw className="w-5 h-5 animate-spin text-[var(--primary)]" />
          <span>Loading organization console...</span>
        </div>
      </div>
    );
  }

  if (user?.platform_role !== "PLATFORM_ADMIN") {
    return (
      <div className="p-8 bg-[#FFF5F5] border border-[#FEB2B2] rounded-xl text-center max-w-xl mx-auto my-12">
        <ShieldAlert className="w-12 h-12 text-[#E53E3E] mx-auto mb-3" />
        <h2 className="text-lg font-bold text-[#9B2C2C] mb-2">Access Restricted</h2>
        <p className="text-sm text-[#742A2A]">PLATFORM_ADMIN privileges required.</p>
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
            <span className="text-xs font-semibold text-[var(--primary)]">Organizations</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[var(--text-primary)] mt-1">
            Organization Approval & Governance Console
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">
            Review registration requests, activate verified institutions, and manage operational suspensions.
          </p>
        </div>
        <button
          onClick={loadOrganizations}
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
      {successMsg && (
        <div className="p-4 bg-[#EBF5EE] border border-[#C6E7D0] rounded-lg text-xs font-medium text-[#166534]">
          {successMsg}
        </div>
      )}

      {/* Controls & Filters */}
      <div className="flex flex-wrap items-center gap-3 p-4 bg-[var(--surface)] border border-[var(--border)] rounded-xl">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[var(--text-secondary)]" />
          <span className="text-xs font-semibold text-[var(--text-primary)]">Filter By:</span>
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="text-xs border border-[var(--border)] bg-[var(--background)] rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
        >
          <option value="">All Statuses</option>
          <option value="PENDING">PENDING Approvals</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="REJECTED">REJECTED</option>
          <option value="SUSPENDED">SUSPENDED</option>
        </select>

        {/* Type Filter */}
        <select
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value);
            setPage(1);
          }}
          className="text-xs border border-[var(--border)] bg-[var(--background)] rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
        >
          <option value="">All Types</option>
          <option value="GOVERNMENT">Government Department</option>
          <option value="HEI">Higher Education Institution (HEI)</option>
          <option value="INDUSTRY">Industry / MSME</option>
          <option value="COMMUNITY">Community Org</option>
        </select>
      </div>

      {/* Organizations Table */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FAF8F5] border-b border-[var(--border)] text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                <th className="py-3 px-4">Organization Name</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">District / State</th>
                <th className="py-3 px-4">Members</th>
                <th className="py-3 px-4">Capabilities</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)] text-xs">
              {orgs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[var(--text-secondary)]">
                    No organizations match the selected criteria.
                  </td>
                </tr>
              ) : (
                orgs.map((org) => {
                  const statusColors: Record<string, string> = {
                    PENDING: "bg-[#FFF4EE] text-[var(--primary)] border-[#FCD8C5]",
                    ACTIVE: "bg-[#EBF5EE] text-[#166534] border-[#C6E7D0]",
                    REJECTED: "bg-[#FFF5F5] text-[#C53030] border-[#FEB2B2]",
                    SUSPENDED: "bg-[#FEFCBF] text-[#744210] border-[#F6E05E]",
                  };

                  return (
                    <tr key={org.id} className="hover:bg-[#FBF9F5] transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-[var(--text-primary)]">
                        <div>{org.name}</div>
                        <div className="text-[10px] text-[var(--text-secondary)] font-mono">ID: {org.id}</div>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-[var(--text-secondary)]">
                        {org.organization_type}
                      </td>
                      <td className="py-3.5 px-4 text-[var(--text-secondary)]">
                        {org.district ? `${org.district}, ${org.state}` : "National / Unspecified"}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[var(--text-secondary)]">
                        {org.members_count}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[var(--text-secondary)]">
                        {org.capabilities_count}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${
                            statusColors[org.status] || "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {org.status}
                        </span>
                        {org.status_rationale && (
                          <div className="text-[10px] text-[var(--text-secondary)] italic mt-1 max-w-xs truncate" title={org.status_rationale}>
                            "{org.status_rationale}"
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {org.status === "PENDING" && (
                            <>
                              <button
                                onClick={() => openStatusModal(org, "ACTIVE")}
                                className="px-2.5 py-1 text-[11px] font-semibold bg-[#166534] text-white rounded hover:bg-[#14532d] transition-colors"
                              >
                                Activate
                              </button>
                              <button
                                onClick={() => openStatusModal(org, "REJECTED")}
                                className="px-2.5 py-1 text-[11px] font-semibold bg-[#C53030] text-white rounded hover:bg-[#9B2C2C] transition-colors"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {org.status === "ACTIVE" && (
                            <button
                              onClick={() => openStatusModal(org, "SUSPENDED")}
                              className="px-2.5 py-1 text-[11px] font-semibold bg-[#D69E2E] text-white rounded hover:bg-[#B7791F] transition-colors"
                            >
                              Suspend
                            </button>
                          )}
                          {(org.status === "SUSPENDED" || org.status === "REJECTED") && (
                            <button
                              onClick={() => openStatusModal(org, "ACTIVE")}
                              className="px-2.5 py-1 text-[11px] font-semibold bg-[#2B6CB0] text-white rounded hover:bg-[#2C5282] transition-colors"
                            >
                              Restore / Activate
                            </button>
                          )}
                        </div>
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
            Showing {orgs.length} of {total} organizations
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

      {/* Rationale Modal */}
      {modalOrg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                Confirm Status Transition to {targetStatus}
              </h3>
              <button
                onClick={() => setModalOrg(null)}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs text-[var(--text-secondary)]">
              <p>
                <strong>Organization:</strong> {modalOrg.name} ({modalOrg.organization_type})
              </p>
              <p>
                <strong>Current Status:</strong> {modalOrg.status} → <strong>New Status:</strong> {targetStatus}
              </p>
            </div>

            <form onSubmit={handleStatusSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                  Governance Rationale / Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rationale}
                  onChange={(e) => setRationale(e.target.value)}
                  placeholder="Provide audit-verifiable reason for this state change..."
                  required={targetStatus === "REJECTED" || targetStatus === "SUSPENDED"}
                  rows={3}
                  className="w-full text-xs p-2.5 border border-[var(--border)] rounded-md bg-[var(--background)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOrg(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-md border border-[var(--border)] hover:bg-[#F4F1EA]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[var(--primary)] rounded-md hover:bg-[#D44700] disabled:opacity-50"
                >
                  {isPending ? "Recording Audit & Updating..." : `Confirm ${targetStatus}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
