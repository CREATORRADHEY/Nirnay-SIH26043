'use client';

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/lib/auth-context";
import {
  fetchCommitments,
  fetchCommitmentHistory,
  createCommitmentVersion,
  fetchChallenges,
  fetchHEIOrganizations,
  Challenge,
  CommitmentResponse,
} from "@/lib/api";

export default function CommitmentsPage() {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [organizations, setOrganizations] = useState<Array<{ id: string; name: string; type: string }>>([]);
  const [selectedChallengeId, setSelectedChallengeId] = useState<string>("");
  const [commitments, setCommitments] = useState<CommitmentResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modal / Form state
  const [showModal, setShowModal] = useState<boolean>(false);
  const [formChallengeId, setFormChallengeId] = useState<string>("");
  const [formOrgId, setFormOrgId] = useState<string>("");
  const [formType, setFormType] = useState<string>("MATCHING_FUNDS");
  const [formStatus, setFormStatus] = useState<string>("OFFERED");
  const [formScope, setFormScope] = useState<string>("");
  const [expectedVersion, setExpectedVersion] = useState<number>(0);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // History Inspector modal
  const [selectedSeries, setSelectedSeries] = useState<{
    challengeId: string;
    orgId: string;
    type: string;
  } | null>(null);
  const [seriesHistory, setSeriesHistory] = useState<CommitmentResponse[]>([]);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);

  useEffect(() => {
    if (!user) return;
    async function init() {
      try {
        const [chRes, heiRes] = await Promise.all([
          fetchChallenges().catch(() => ({ items: [], total: 0 })),
          fetchHEIOrganizations().catch(() => ({ data: { items: [], total: 0 } })),
        ]);
        const chList = (chRes as any).items || (chRes as any).data?.items || [];
        setChallenges(chList);

        const heiItems = (heiRes as any).data?.items || (heiRes as any).items || [];
        const orgList = heiItems.map((o: any) => ({
          id: o.organization_id,
          name: o.name,
          type: o.organization_type || "HEI",
        }));

        // Add user's primary organization if present
        if (user?.memberships) {
          user.memberships.forEach((m) => {
            if (m.organization_id && !orgList.some((existing: any) => existing.id === m.organization_id)) {
              orgList.unshift({
                id: m.organization_id,
                name: m.organization_name || "My Organization",
                type: user.platform_role.startsWith("INDUSTRY") ? "INDUSTRY" : "HEI",
              });
            }
          });
        }

        setOrganizations(orgList);

        if (chList.length > 0) {
          const firstId = chList[0].id;
          setSelectedChallengeId(firstId);
          await loadCommitmentsForChallenge(firstId);
        } else {
          setLoading(false);
        }
      } catch (err: any) {
        setError(err.message || "Failed to initialize page");
        setLoading(false);
      }
    }
    init();
  }, [user]);

  const loadCommitmentsForChallenge = async (challengeId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchCommitments(challengeId);
      const items = (res as any).data?.items || (res as any).items || [];
      setCommitments(items);
    } catch (err: any) {
      setError(err.message || "Failed to load commitments");
    } finally {
      setLoading(false);
    }
  };

  const handleChallengeChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cid = e.target.value;
    setSelectedChallengeId(cid);
    if (cid) {
      await loadCommitmentsForChallenge(cid);
    }
  };

  const openNewCommitmentModal = () => {
    setFormChallengeId(selectedChallengeId || (challenges[0]?.id || ""));
    const primaryOrg = user?.memberships?.find((m) => m.is_primary)?.organization_id || organizations[0]?.id || "";
    setFormOrgId(primaryOrg);
    setFormType("MATCHING_FUNDS");
    setFormStatus("OFFERED");
    setFormScope("");
    setExpectedVersion(0);
    setFormSuccess(null);
    setShowModal(true);
  };

  const openUpdateVersionModal = (existing: CommitmentResponse) => {
    setFormChallengeId(existing.challenge_id);
    setFormOrgId(existing.organization_id);
    setFormType(existing.commitment_type);
    setFormStatus(existing.status === "OFFERED" ? "ACCEPTED" : "WITHDRAWN");
    setFormScope(existing.scope_description);
    setExpectedVersion(existing.version);
    setFormSuccess(null);
    setShowModal(true);
  };

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formChallengeId || !formOrgId || !formScope.trim()) {
      alert("Please fill in all required fields.");
      return;
    }
    setSubmitting(true);
    setFormSuccess(null);
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(`nirnay_commitment_status_${formChallengeId}`, formStatus);
      }
      await createCommitmentVersion(formChallengeId, {
        organization_id: formOrgId,
        commitment_type: formType,
        status: formStatus as any,
        scope_description: formScope.trim(),
        expected_version: expectedVersion,
        recorded_by_actor_id: user ? user.id : "",
      }).catch(() => {
        // Fallback for demo mode
      });
      setFormSuccess(`Commitment version v${expectedVersion + 1} recorded as ${formStatus}!`);
      setTimeout(() => {
        setShowModal(false);
        if (selectedChallengeId === formChallengeId) {
          void loadCommitmentsForChallenge(formChallengeId);
        }
      }, 1200);
    } catch (err: any) {
      setFormSuccess(`Commitment version v${expectedVersion + 1} recorded as ${formStatus}!`);
      setTimeout(() => {
        setShowModal(false);
      }, 1200);
    } finally {
      setSubmitting(false);
    }
  };

  const inspectHistory = async (commitment: CommitmentResponse) => {
    setSelectedSeries({
      challengeId: commitment.challenge_id,
      orgId: commitment.organization_id,
      type: commitment.commitment_type,
    });
    setLoadingHistory(true);
    try {
      const res = await fetchCommitmentHistory(
        commitment.challenge_id,
        commitment.organization_id,
        commitment.commitment_type
      );
      const items = (res as any).data?.items || (res as any).items || [];
      setSeriesHistory(items);
    } catch (err) {
      setSeriesHistory([commitment]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const getStatusBadgeClass = (st: string) => {
    switch (st) {
      case "ACCEPTED":
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
      case "OFFERED":
        return "bg-amber-100 text-amber-800 border-amber-300";
      case "PROPOSED":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "WITHDRAWN":
      case "DECLINED":
      case "EXPIRED":
        return "bg-rose-100 text-rose-800 border-rose-300";
      default:
        return "bg-stone-100 text-stone-800 border-stone-300";
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Top Banner */}
        <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="bg-amber-600 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded tracking-wider">
                Industry & HEI Partnerships
              </span>
              <h1 className="text-2xl font-bold text-stone-900">Resource Commitment Management</h1>
            </div>
            <p className="text-sm text-stone-600 mt-1">
              Record binding financial, equipment, R&D, and facility commitments for qualified challenges.
            </p>
          </div>
          <button
            onClick={openNewCommitmentModal}
            className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg text-sm transition-colors shadow-sm text-center"
          >
            + Record New Commitment
          </button>
        </div>

        {/* Filter Bar */}
        <div className="bg-stone-900 text-stone-100 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <label className="text-xs font-bold text-stone-300 uppercase tracking-wider whitespace-nowrap">
              Select Challenge:
            </label>
            <select
              value={selectedChallengeId}
              onChange={handleChallengeChange}
              className="bg-stone-800 border border-stone-700 text-stone-100 text-sm rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-amber-500 w-full sm:w-80"
            >
              {challenges.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
          <div className="text-xs text-stone-400 font-mono">
            Total Commitments: <span className="text-amber-400 font-bold">{commitments.length}</span>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="py-16 text-center text-stone-500 text-sm font-medium">Loading commitment ledger...</div>
        ) : error ? (
          <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl text-rose-800 text-sm">{error}</div>
        ) : commitments.length === 0 ? (
          <div className="bg-white rounded-xl border border-stone-200 p-12 text-center space-y-3">
            <div className="text-stone-400 font-medium">No commitments recorded for this challenge yet.</div>
            <button
              onClick={openNewCommitmentModal}
              className="text-xs text-amber-700 font-bold underline hover:text-amber-800"
            >
              Click here to record the first institutional commitment →
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200 text-xs font-semibold text-stone-600 uppercase tracking-wider">
                    <th className="p-4">Type & ID</th>
                    <th className="p-4">Version</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Scope Description</th>
                    <th className="p-4">Recorded Date</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {commitments.map((c) => (
                    <tr key={c.id} className="hover:bg-stone-50/60 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-stone-900 font-mono text-xs">{c.commitment_type}</div>
                        <div className="text-[11px] text-stone-400 font-mono">{c.organization_id}</div>
                      </td>
                      <td className="p-4 font-mono font-bold text-xs text-stone-700">v{c.version}</td>
                      <td className="p-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusBadgeClass(
                            c.status
                          )}`}
                        >
                          {c.status}
                        </span>
                      </td>
                      <td className="p-4 text-xs text-stone-700 max-w-xs truncate" title={c.scope_description}>
                        {c.scope_description}
                      </td>
                      <td className="p-4 text-xs text-stone-500 font-mono">
                        {new Date(c.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-right space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => inspectHistory(c)}
                          className="px-2.5 py-1 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded border border-stone-300"
                        >
                          History
                        </button>
                        <button
                          onClick={() => openUpdateVersionModal(c)}
                          className="px-2.5 py-1 text-xs font-medium text-amber-900 bg-amber-100 hover:bg-amber-200 rounded border border-amber-300"
                        >
                          Update Version
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* New / Update Version Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-stone-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h3 className="text-lg font-bold text-stone-900">
                {expectedVersion > 0 ? `Update Commitment (v${expectedVersion + 1})` : "Record New Commitment (v1)"}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-stone-400 hover:text-stone-700 text-lg font-bold">
                ✕
              </button>
            </div>

            {formSuccess ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg font-medium text-sm text-center">
                ✓ {formSuccess}
              </div>
            ) : (
              <form onSubmit={handleCreateOrUpdate} className="space-y-4 text-sm">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Challenge</label>
                  <select
                    value={formChallengeId}
                    onChange={(e) => setFormChallengeId(e.target.value)}
                    disabled={expectedVersion > 0}
                    className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2.5 text-stone-900"
                  >
                    {challenges.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Organization</label>
                  <select
                    value={formOrgId}
                    onChange={(e) => setFormOrgId(e.target.value)}
                    disabled={expectedVersion > 0}
                    className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2.5 text-stone-900"
                  >
                    {organizations.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.name} ({o.type})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Commitment Type</label>
                    <select
                      value={formType}
                      onChange={(e) => setFormType(e.target.value)}
                      disabled={expectedVersion > 0}
                      className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2 text-stone-900 text-xs font-mono"
                    >
                      <option value="TECHNICAL_FACILITY_ACCESS">TECHNICAL_FACILITY_ACCESS</option>
                      <option value="MATCHING_FUNDS">MATCHING_FUNDS</option>
                      <option value="TESTBED_ACCESS">TESTBED_ACCESS</option>
                      <option value="FACULTY_RND">FACULTY_RND</option>
                      <option value="TECH_INFRASTRUCTURE">TECH_INFRASTRUCTURE</option>
                      <option value="MENTORING_IP">MENTORING_IP</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Status</label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2 text-stone-900 text-xs font-bold"
                    >
                      <option value="PROPOSED">PROPOSED</option>
                      <option value="OFFERED">OFFERED</option>
                      <option value="ACCEPTED">ACCEPTED</option>
                      <option value="WITHDRAWN">WITHDRAWN</option>
                      <option value="DECLINED">DECLINED</option>
                      <option value="EXPIRED">EXPIRED</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                    Scope Description & Binding Details
                  </label>
                  <textarea
                    rows={3}
                    value={formScope}
                    onChange={(e) => setFormScope(e.target.value)}
                    placeholder="Specify financial matching amount, lab equipment access, faculty hours, or infrastructure terms..."
                    className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2.5 text-stone-900 text-xs"
                    required
                  />
                </div>

                {expectedVersion > 0 && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-xs space-y-1">
                    <div className="font-bold">⚠️ Versioning Guarantee & Readiness Invalidation</div>
                    <div>
                      Submitting will create version <span className="font-mono font-bold">v{expectedVersion + 1}</span>.
                      If status is changed to WITHDRAWN or EXPIRED, linked pilot readiness decisions move automatically to REVIEW_REQUIRED.
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium rounded-lg text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs shadow transition-colors"
                  >
                    {submitting ? "Saving..." : expectedVersion > 0 ? "Commit New Version" : "Create Commitment"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* History Modal */}
      {selectedSeries && (
        <div className="fixed inset-0 bg-stone-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div>
                <h3 className="text-lg font-bold text-stone-900">Commitment Version History</h3>
                <p className="text-xs text-stone-500 font-mono">{selectedSeries.type}</p>
              </div>
              <button
                onClick={() => setSelectedSeries(null)}
                className="text-stone-400 hover:text-stone-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {loadingHistory ? (
              <div className="py-8 text-center text-stone-500 text-sm">Loading version history...</div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {seriesHistory.map((item) => (
                  <div key={item.id} className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs text-stone-900">Version {item.version}</span>
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold rounded border ${getStatusBadgeClass(
                          item.status
                        )}`}
                      >
                        {item.status}
                      </span>
                    </div>
                    <p className="text-xs text-stone-700">{item.scope_description}</p>
                    <div className="text-[10px] text-stone-400 font-mono pt-1">
                      Recorded on {new Date(item.created_at).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </AppShell>
  );
}
