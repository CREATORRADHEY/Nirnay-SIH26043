"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { AppShell } from "@/components/AppShell";

export default function AccountPage() {
  const { user } = useAuth();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!user) {
    return (
      <AppShell>
        <div className="p-8 text-center text-stone-600">Please sign in to view account settings.</div>
      </AppShell>
    );
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"}/api/v1/auth/change-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            old_password: oldPassword,
            new_password: newPassword,
          }),
        }
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to update password");
      }
      setOldPassword("");
      setNewPassword("");
      setMsg("Password updated successfully!");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-3xl space-y-6">
        <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm">
          <h1 className="text-2xl font-bold text-stone-900">User Account Settings</h1>
          <p className="text-sm text-stone-600 mt-1">Manage profile, authentication credentials, and platform roles.</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-stone-500 uppercase tracking-widest">Account Profile</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-stone-500 block text-xs">Display Name</span>
              <span className="font-semibold text-stone-900">{user.display_name}</span>
            </div>
            <div>
              <span className="text-stone-500 block text-xs">Email Address</span>
              <span className="font-semibold text-stone-900">{user.email || "Not specified"}</span>
            </div>
            <div>
              <span className="text-stone-500 block text-xs">Platform Role</span>
              <span className="font-semibold text-amber-700">{user.platform_role}</span>
            </div>
            <div>
              <span className="text-stone-500 block text-xs">Account Status</span>
              <span className="font-semibold text-emerald-700">Active</span>
            </div>
          </div>
        </div>

        {/* Organizations & Memberships */}
        <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-stone-500 uppercase tracking-widest">Organization Memberships</h2>
          {user.memberships.length === 0 ? (
            <p className="text-sm text-stone-500">Not currently assigned to any organization.</p>
          ) : (
            <div className="divide-y divide-stone-100">
              {user.memberships.map((m) => (
                <div key={m.id} className="py-3 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-stone-900 text-sm">{m.organization_name}</span>
                    <span className="ml-2 text-xs bg-stone-100 text-stone-700 px-2 py-0.5 rounded">
                      {m.organization_type}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-stone-600">
                    Role: {m.role} {m.is_primary && <span className="text-amber-600 font-bold">(Primary)</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Change Password Form */}
        <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-stone-500 uppercase tracking-widest">Security Credentials</h2>

          {msg && <div className="p-3 bg-emerald-50 text-emerald-800 text-sm font-medium rounded-md">{msg}</div>}
          {error && <div className="p-3 bg-red-50 text-red-800 text-sm font-medium rounded-md">{error}</div>}

          <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase">Current Password</label>
              <input
                type="password"
                required
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-stone-300 rounded-md text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase">New Password</label>
              <input
                type="password"
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-stone-300 rounded-md text-sm"
              />
            </div>
            <div>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-amber-600 text-white font-semibold text-xs rounded-md hover:bg-amber-700 disabled:opacity-50"
              >
                {submitting ? "Updating..." : "Change Password"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppShell>
  );
}
