"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { AppShell } from "@/components/AppShell";

interface Organization {
  id: string;
  name: string;
  type: string;
  state: string;
  district: string;
  sub_type: string | null;
  code: string | null;
  created_at: string;
}

export default function OrganizationsPage() {
  const { user, refreshUser } = useAuth();

  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loadingOrgs, setLoadingOrgs] = useState(true);

  // Form states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [name, setName] = useState("");
  const [orgType, setOrgType] = useState("GOVERNMENT");
  const [state, setState] = useState("Jharkhand");
  const [district, setDistrict] = useState("Ranchi");
  const [creating, setCreating] = useState(false);

  // Invite states
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("MEMBER");
  const [inviting, setInviting] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const fetchOrgs = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"}/api/v1/organizations`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setOrganizations(data);
      }
    } catch {
      // ignore
    } finally {
      setLoadingOrgs(false);
    }
  };

  useEffect(() => {
    fetchOrgs();
  }, []);

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setMsg(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"}/api/v1/organizations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name,
          type: orgType,
          state,
          district,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to create organization");
      }
      setName("");
      setShowCreateModal(false);
      await fetchOrgs();
      await refreshUser();
      setMsg("Organization created successfully!");
    } catch (err: any) {
      setMsg(`Error: ${err.message}`);
    } finally {
      setCreating(false);
    }
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrgId) return;
    setInviting(true);
    setMsg(null);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"}/api/v1/organizations/${selectedOrgId}/invites`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            email: inviteEmail,
            role: inviteRole,
          }),
        }
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to send invitation");
      }
      setInviteEmail("");
      setSelectedOrgId(null);
      setMsg("Invitation sent successfully!");
    } catch (err: any) {
      setMsg(`Error: ${err.message}`);
    } finally {
      setInviting(false);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between bg-white p-6 rounded-xl border border-stone-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-stone-900">Organization Management</h1>
            <p className="text-sm text-stone-600 mt-1">
              Onboard government departments, HEIs, industry partners, or community groups.
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-amber-600 text-white font-semibold text-sm rounded-lg hover:bg-amber-700 transition-colors"
          >
            + Onboard New Organization
          </button>
        </div>

        {msg && (
          <div className="p-4 bg-amber-50 border-l-4 border-amber-500 text-amber-900 text-sm font-medium rounded-r-md">
            {msg}
          </div>
        )}

        {/* Organizations List */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-stone-200 font-bold text-stone-800 text-sm">
            Registered Platform Organizations ({organizations.length})
          </div>
          {loadingOrgs ? (
            <div className="p-8 text-center text-stone-500 text-sm">Loading organizations...</div>
          ) : organizations.length === 0 ? (
            <div className="p-8 text-center text-stone-500 text-sm">No organizations registered yet.</div>
          ) : (
            <div className="divide-y divide-stone-100">
              {organizations.map((org) => (
                <div key={org.id} className="p-6 flex items-center justify-between hover:bg-stone-50">
                  <div>
                    <div className="flex items-center space-x-3">
                      <span className="font-bold text-stone-900">{org.name}</span>
                      <span className="text-xs bg-stone-100 text-stone-800 font-semibold px-2 py-0.5 rounded border border-stone-200">
                        {org.type}
                      </span>
                    </div>
                    <div className="text-xs text-stone-500 mt-1">
                      {org.district}, {org.state} • Created {new Date(org.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedOrgId(org.id)}
                    className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded border border-stone-300 transition-colors"
                  >
                    Invite Member
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Create Org Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-stone-900/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white max-w-md w-full rounded-xl p-6 shadow-xl border border-stone-200 space-y-4">
              <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                <h3 className="font-bold text-stone-900">Onboard Organization</h3>
                <button onClick={() => setShowCreateModal(false)} className="text-stone-400 hover:text-stone-600">
                  ✕
                </button>
              </div>
              <form onSubmit={handleCreateOrg} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase">Organization Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 w-full px-3 py-2 border border-stone-300 rounded-md text-sm"
                    placeholder="Department of Agriculture, Jharkhand"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase">Organization Type</label>
                  <select
                    value={orgType}
                    onChange={(e) => setOrgType(e.target.value)}
                    className="mt-1 w-full px-3 py-2 border border-stone-300 rounded-md text-sm"
                  >
                    <option value="GOVERNMENT">Government Department</option>
                    <option value="HEI">Higher Education Institution (HEI)</option>
                    <option value="INDUSTRY">Industry Partner</option>
                    <option value="COMMUNITY">Community Organization</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 uppercase">State</label>
                    <input
                      type="text"
                      required
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="mt-1 w-full px-3 py-2 border border-stone-300 rounded-md text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 uppercase">District</label>
                    <input
                      type="text"
                      required
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="mt-1 w-full px-3 py-2 border border-stone-300 rounded-md text-sm"
                    />
                  </div>
                </div>
                <div className="pt-2 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 border border-stone-300 rounded-md text-xs font-semibold text-stone-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="px-4 py-2 bg-amber-600 text-white rounded-md text-xs font-semibold hover:bg-amber-700"
                  >
                    {creating ? "Creating..." : "Create Organization"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Invite Member Modal */}
        {selectedOrgId && (
          <div className="fixed inset-0 bg-stone-900/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white max-w-md w-full rounded-xl p-6 shadow-xl border border-stone-200 space-y-4">
              <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                <h3 className="font-bold text-stone-900">Invite Member to Organization</h3>
                <button onClick={() => setSelectedOrgId(null)} className="text-stone-400 hover:text-stone-600">
                  ✕
                </button>
              </div>
              <form onSubmit={handleSendInvite} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase">Member Email</label>
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="mt-1 w-full px-3 py-2 border border-stone-300 rounded-md text-sm"
                    placeholder="colleague@domain.org"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase">Organization Role</label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="mt-1 w-full px-3 py-2 border border-stone-300 rounded-md text-sm"
                  >
                    <option value="MEMBER">Member</option>
                    <option value="ADMIN">Organization Admin</option>
                  </select>
                </div>
                <div className="pt-2 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setSelectedOrgId(null)}
                    className="px-4 py-2 border border-stone-300 rounded-md text-xs font-semibold text-stone-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={inviting}
                    className="px-4 py-2 bg-amber-600 text-white rounded-md text-xs font-semibold hover:bg-amber-700"
                  >
                    {inviting ? "Sending..." : "Send Invitation"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
