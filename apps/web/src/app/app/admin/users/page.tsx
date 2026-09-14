"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  fetchAdminUsers,
  updateAdminUserStatus,
  updateAdminUserRole,
  AdminUserItem,
} from "@/lib/api";
import {
  Users,
  Search,
  Filter,
  ShieldCheck,
  ShieldAlert,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  UserX,
  Edit2,
  Building,
} from "lucide-react";
import Link from "next/link";

export default function AdminUsersPage() {
  const router = useRouter();
  const { user: currentUser, loading: authLoading } = useAuth();
  const [usersList, setUsersList] = useState<AdminUserItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [activeFilter, setActiveFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Role Edit Modal
  const [selectedUser, setSelectedUser] = useState<AdminUserItem | null>(null);
  const [newRole, setNewRole] = useState<string>("");
  const [roleRationale, setRoleRationale] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const is_active_val =
        activeFilter === "true" ? true : activeFilter === "false" ? false : undefined;
      const res = await fetchAdminUsers(
        roleFilter || undefined,
        is_active_val,
        searchQuery || undefined,
        page,
        20
      );
      setUsersList(res.items);
      setTotal(res.total);
    } catch (err: any) {
      setError(err.message || "Failed to load platform users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !currentUser) {
      router.push("/login");
    }
  }, [currentUser, authLoading, router]);

  useEffect(() => {
    if (!authLoading && currentUser?.platform_role === "PLATFORM_ADMIN") {
      void loadUsers();
    }
  }, [currentUser, authLoading, page, roleFilter, activeFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    void loadUsers();
  };

  const toggleUserStatus = async (targetUser: AdminUserItem) => {
    const nextStatus = !targetUser.is_active;
    const actionLabel = nextStatus ? "reactivate" : "deactivate";
    if (!confirm(`Are you sure you want to ${actionLabel} account '${targetUser.display_name}'?`)) {
      return;
    }

    try {
      await updateAdminUserStatus(
        targetUser.id,
        nextStatus,
        `Admin manual action to ${actionLabel} account.`
      );
      setSuccessMsg(`User '${targetUser.display_name}' has been ${actionLabel}d.`);
      void loadUsers();
    } catch (err: any) {
      setError(err.message || `Failed to ${actionLabel} user.`);
    }
  };

  const openRoleModal = (u: AdminUserItem) => {
    setSelectedUser(u);
    setNewRole(u.platform_role);
    setRoleRationale("");
  };

  const handleRoleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !newRole || !roleRationale.trim()) {
      setError("Please select a new role and provide a clear rationale.");
      return;
    }

    startTransition(async () => {
      try {
        await updateAdminUserRole(selectedUser.id, newRole, roleRationale.trim());
        setSuccessMsg(
          `User '${selectedUser.display_name}' role changed to ${newRole}. Security audit logged.`
        );
        setSelectedUser(null);
        void loadUsers();
      } catch (err: any) {
        setError(err.message || "Failed to update platform role.");
      }
    });
  };

  if (authLoading || (loading && usersList.length === 0 && !error)) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3 text-[var(--text-secondary)] font-medium">
          <RefreshCw className="w-5 h-5 animate-spin text-[var(--primary)]" />
          <span>Loading user registry...</span>
        </div>
      </div>
    );
  }

  if (currentUser?.platform_role !== "PLATFORM_ADMIN") {
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
            <span className="text-xs font-semibold text-[var(--primary)]">Users & Memberships</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[var(--text-primary)] mt-1">
            Users & Organization Memberships
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">
            Manage user platform roles, active account states, and view linked organization memberships.
          </p>
        </div>
        <button
          onClick={loadUsers}
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

      {/* Controls & Search */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-[var(--surface)] border border-[var(--border)] rounded-xl">
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 flex-1 min-w-[240px]">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-1.5 border border-[var(--border)] bg-[var(--background)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
            />
          </div>
          <button
            type="submit"
            className="px-3 py-1.5 text-xs font-semibold bg-[var(--primary)] text-white rounded-md hover:bg-[#D44700]"
          >
            Search
          </button>
        </form>

        <div className="flex items-center gap-2">
          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="text-xs border border-[var(--border)] bg-[var(--background)] rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
          >
            <option value="">All Platform Roles</option>
            <option value="COMMUNITY_REPORTER">COMMUNITY_REPORTER</option>
            <option value="GOVERNMENT_REVIEWER">GOVERNMENT_REVIEWER</option>
            <option value="HEI_ADMIN">HEI_ADMIN</option>
            <option value="INDUSTRY_ADMIN">INDUSTRY_ADMIN</option>
            <option value="PLATFORM_ADMIN">PLATFORM_ADMIN</option>
          </select>

          {/* Active Status Filter */}
          <select
            value={activeFilter}
            onChange={(e) => {
              setActiveFilter(e.target.value);
              setPage(1);
            }}
            className="text-xs border border-[var(--border)] bg-[var(--background)] rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
          >
            <option value="">All Account States</option>
            <option value="true">Active Only</option>
            <option value="false">Deactivated Only</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FAF8F5] border-b border-[var(--border)] text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Platform Role</th>
                <th className="py-3 px-4">Linked Organizations</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)] text-xs">
              {usersList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-[var(--text-secondary)]">
                    No platform users match the specified filters.
                  </td>
                </tr>
              ) : (
                usersList.map((u) => {
                  const roleBadgeColors: Record<string, string> = {
                    PLATFORM_ADMIN: "bg-[#7B2CBF] text-white",
                    GOVERNMENT_REVIEWER: "bg-[#2B6CB0] text-white",
                    HEI_ADMIN: "bg-[#166534] text-white",
                    INDUSTRY_ADMIN: "bg-[#DD6B20] text-white",
                    COMMUNITY_REPORTER: "bg-gray-700 text-white",
                  };

                  return (
                    <tr key={u.id} className="hover:bg-[#FBF9F5] transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-[var(--text-primary)]">{u.display_name}</div>
                        <div className="text-[11px] text-[var(--text-secondary)]">{u.email || "No email"}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                            roleBadgeColors[u.platform_role] || "bg-gray-500 text-white"
                          }`}
                        >
                          {u.platform_role}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-[var(--text-secondary)]">
                        {u.organizations && u.organizations.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {u.organizations.map((orgName, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#F4F1EA] text-[10px] text-[var(--text-primary)] border border-[var(--border)] font-medium"
                              >
                                <Building className="w-3 h-3 text-[var(--text-secondary)]" />
                                {orgName}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[11px] text-gray-400 italic">Unaffiliated</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        {u.is_active ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#166534] bg-[#EBF5EE] px-2 py-0.5 rounded border border-[#C6E7D0]">
                            <UserCheck className="w-3 h-3" /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#C53030] bg-[#FFF5F5] px-2 py-0.5 rounded border border-[#FEB2B2]">
                            <UserX className="w-3 h-3" /> Deactivated
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openRoleModal(u)}
                            className="px-2.5 py-1 text-[11px] font-semibold bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] rounded hover:bg-[#F4F1EA] flex items-center gap-1"
                          >
                            <Edit2 className="w-3 h-3" /> Role
                          </button>

                          <button
                            onClick={() => toggleUserStatus(u)}
                            className={`px-2.5 py-1 text-[11px] font-semibold text-white rounded transition-colors ${
                              u.is_active ? "bg-[#C53030] hover:bg-[#9B2C2C]" : "bg-[#166534] hover:bg-[#14532d]"
                            }`}
                          >
                            {u.is_active ? "Deactivate" : "Reactivate"}
                          </button>
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
            Showing {usersList.length} of {total} accounts
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

      {/* Role Change Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                Modify Platform Role: {selectedUser.display_name}
              </h3>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs text-[var(--text-secondary)]">
              <p>Current Role: <strong>{selectedUser.platform_role}</strong></p>
            </div>

            <form onSubmit={handleRoleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                  Target Platform Role
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full text-xs p-2.5 border border-[var(--border)] rounded-md bg-[var(--background)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                >
                  <option value="COMMUNITY_REPORTER">COMMUNITY_REPORTER</option>
                  <option value="GOVERNMENT_REVIEWER">GOVERNMENT_REVIEWER</option>
                  <option value="HEI_ADMIN">HEI_ADMIN</option>
                  <option value="INDUSTRY_ADMIN">INDUSTRY_ADMIN</option>
                  <option value="PLATFORM_ADMIN">PLATFORM_ADMIN</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                  Security Rationale <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={roleRationale}
                  onChange={(e) => setRoleRationale(e.target.value)}
                  placeholder="Explicit rationale for modifying platform privileges..."
                  required
                  rows={3}
                  className="w-full text-xs p-2.5 border border-[var(--border)] rounded-md bg-[var(--background)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-md border border-[var(--border)] hover:bg-[#F4F1EA]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[var(--primary)] rounded-md hover:bg-[#D44700] disabled:opacity-50"
                >
                  {isPending ? "Updating & Auditing..." : "Update Role"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
