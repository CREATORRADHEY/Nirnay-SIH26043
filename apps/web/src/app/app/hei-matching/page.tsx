'use client';

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/lib/auth-context";
import {
  fetchHEIOrganizations,
  fetchHEICandidates,
  createHEICandidate,
  fetchChallenges,
  Challenge,
  HEICandidateResponse,
  HEIOrganizationResponse,
} from "@/lib/api";

export default function HEIMatchingPage() {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [selectedChallengeId, setSelectedChallengeId] = useState<string>("");
  const [candidates, setCandidates] = useState<HEICandidateResponse[]>([]);
  const [heiOrgs, setHeiOrgs] = useState<HEIOrganizationResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"candidates" | "directory">("candidates");

  // Candidate Match modal
  const [showCandidateModal, setShowCandidateModal] = useState<boolean>(false);
  const [candOrgId, setCandOrgId] = useState<string>("");
  const [candMatchMethod, setCandMatchMethod] = useState<string>("MANUAL");
  const [candRationale, setCandRationale] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [matchSuccess, setMatchSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    async function init() {
      try {
        const [chRes, orgsRes] = await Promise.all([
          fetchChallenges().catch(() => ({ items: [], total: 0 })),
          fetchHEIOrganizations().catch(() => ({ data: { items: [], total: 0 } })),
        ]);
        const chList = (chRes as any).items || (chRes as any).data?.items || [];
        setChallenges(chList);
        const heiList = (orgsRes as any).data?.items || (orgsRes as any).items || [];
        setHeiOrgs(heiList);

        if (chList.length > 0) {
          const firstId = chList[0].id;
          setSelectedChallengeId(firstId);
          await loadCandidatesForChallenge(firstId);
        } else {
          setLoading(false);
        }
      } catch (err) {
        setLoading(false);
      }
    }
    init();
  }, [user]);

  const loadCandidatesForChallenge = async (challengeId: string) => {
    setLoading(true);
    try {
      const res = await fetchHEICandidates(challengeId);
      const items = (res as any).data?.items || (res as any).items || [];
      setCandidates(items);
    } catch (err) {
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChallengeChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cid = e.target.value;
    setSelectedChallengeId(cid);
    if (cid) {
      await loadCandidatesForChallenge(cid);
    }
  };

  const openMatchModal = () => {
    if (heiOrgs.length > 0) {
      setCandOrgId(heiOrgs[0].organization_id);
    }
    setCandMatchMethod("MANUAL");
    setCandRationale("");
    setMatchSuccess(null);
    setShowCandidateModal(true);
  };

  const handleCreateCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChallengeId || !candOrgId || !candRationale.trim()) {
      alert("Please select an HEI organization and enter match rationale.");
      return;
    }
    setSubmitting(true);
    setMatchSuccess(null);
    try {
      await createHEICandidate(selectedChallengeId, {
        organization_id: candOrgId,
        match_method: candMatchMethod,
        rationale: candRationale.trim(),
        created_by_actor_id: user?.id,
      });
      setMatchSuccess("Candidate match proposed successfully!");
      setTimeout(() => {
        setShowCandidateModal(false);
        loadCandidatesForChallenge(selectedChallengeId);
      }, 1000);
    } catch (err: any) {
      alert(err.message || "Error proposing candidate match");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Top Header */}
        <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="bg-amber-600 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded tracking-wider">
                HEI Research Matching
              </span>
              <h1 className="text-2xl font-bold text-stone-900">HEI Directory & Candidate Matching Workspace</h1>
            </div>
            <p className="text-sm text-stone-600 mt-1">
              Match qualified innovation challenges with relevant Higher Education Institutions (HEIs) & research labs.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Link
              href="/app/review"
              className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-bold transition-colors"
            >
              Review Queue →
            </Link>
            <button
              onClick={openMatchModal}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
            >
              + Propose HEI Match
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center space-x-2 border-b border-stone-200 pb-2">
          <button
            onClick={() => setActiveTab("candidates")}
            className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${
              activeTab === "candidates"
                ? "bg-stone-900 text-amber-400"
                : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
            }`}
          >
            Candidate Matches by Challenge
          </button>
          <button
            onClick={() => setActiveTab("directory")}
            className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${
              activeTab === "directory"
                ? "bg-stone-900 text-amber-400"
                : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
            }`}
          >
            Active HEI Capabilities Directory ({heiOrgs.length})
          </button>
        </div>

        {activeTab === "candidates" && (
          <div className="space-y-4">
            {/* Filter */}
            <div className="bg-stone-900 text-stone-100 p-4 rounded-xl flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <label className="text-xs font-bold text-stone-300 uppercase tracking-wider">
                  Select Challenge:
                </label>
                <select
                  value={selectedChallengeId}
                  onChange={handleChallengeChange}
                  className="bg-stone-800 border border-stone-700 text-stone-100 text-sm rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-amber-500 min-w-[280px]"
                >
                  {challenges.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="text-xs text-stone-400 font-mono">
                Total Matches: <span className="text-amber-400 font-bold">{candidates.length}</span>
              </div>
            </div>

            {loading ? (
              <div className="py-12 text-center text-stone-500 text-sm font-medium">Loading candidate matches...</div>
            ) : candidates.length === 0 ? (
              <div className="bg-white rounded-xl border border-stone-200 p-12 text-center space-y-3">
                <div className="text-stone-500 text-sm font-medium">No candidate matches for this challenge yet.</div>
                <button
                  onClick={openMatchModal}
                  className="text-xs text-amber-700 font-bold underline hover:text-amber-800"
                >
                  Click here to propose a candidate HEI match →
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {candidates.map((cand) => (
                  <div key={cand.id} className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-stone-900 text-base">HEI Candidate</h3>
                        <span className="inline-block mt-1 px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-mono font-bold rounded">
                          Method: {cand.match_method}
                        </span>
                      </div>
                      <Link
                        href="/app/commitments"
                        className="text-xs font-bold text-amber-700 hover:text-amber-900 underline"
                      >
                        Record Commitment →
                      </Link>
                    </div>

                    <div className="bg-stone-50 p-3 rounded-lg border border-stone-200 text-xs text-stone-700">
                      <span className="font-bold text-stone-900 block mb-1">Match Rationale:</span>
                      {cand.rationale}
                    </div>

                    <div className="text-[11px] text-stone-400 font-mono">
                      Matched on {new Date(cand.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "directory" && (
          <div className="space-y-4">
            {heiOrgs.length === 0 ? (
              <div className="bg-white rounded-xl border border-stone-200 p-12 text-center text-stone-500 text-sm">
                No active HEI capabilities found.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {heiOrgs.map((org) => (
                  <div key={org.organization_id} className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-stone-900 text-base">{org.name}</h3>
                      <span className="text-xs text-stone-500 font-mono">{org.district}, {org.state}</span>
                    </div>

                    <div className="space-y-2">
                      <div className="text-xs font-bold text-stone-700 uppercase tracking-wider">Active Capabilities:</div>
                      <div className="space-y-1.5">
                        {org.active_capabilities?.map((cap) => (
                          <div key={cap.id} className="bg-stone-50 p-2.5 rounded-lg border border-stone-200 text-xs">
                            <div className="font-bold text-stone-900">{cap.name}</div>
                            <div className="text-stone-600 mt-0.5">{cap.description}</div>
                            <div className="text-[10px] text-amber-700 font-mono mt-1">
                              Type: {cap.capability_type} | Discipline: {cap.discipline}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Propose Candidate Modal */}
      {showCandidateModal && (
        <div className="fixed inset-0 bg-stone-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h3 className="text-lg font-bold text-stone-900">Propose HEI Candidate Match</h3>
              <button
                onClick={() => setShowCandidateModal(false)}
                className="text-stone-400 hover:text-stone-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {matchSuccess ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg font-medium text-sm text-center">
                ✓ {matchSuccess}
              </div>
            ) : (
              <form onSubmit={handleCreateCandidate} className="space-y-4 text-sm">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Target HEI Organization</label>
                  <select
                    value={candOrgId}
                    onChange={(e) => setCandOrgId(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2.5 text-stone-900"
                  >
                    {heiOrgs.map((o) => (
                      <option key={o.organization_id} value={o.organization_id}>
                        {o.name} ({o.district})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Match Method</label>
                  <select
                    value={candMatchMethod}
                    onChange={(e) => setCandMatchMethod(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2 text-stone-900 text-xs font-mono"
                  >
                    <option value="MANUAL">MANUAL</option>
                    <option value="AI_HYBRID">AI_HYBRID</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Match Rationale</label>
                  <textarea
                    rows={3}
                    value={candRationale}
                    onChange={(e) => setCandRationale(e.target.value)}
                    placeholder="Describe R&D alignment, lab facility fit, or domain expert relevance..."
                    className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2.5 text-stone-900 text-xs"
                    required
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCandidateModal(false)}
                    className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium rounded-lg text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs shadow transition-colors"
                  >
                    {submitting ? "Proposing..." : "Propose Candidate Match"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </AppShell>
  );
}
