"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/lib/auth-context";

interface ChallengeDetail {
  id: string;
  title: string;
  summary: string;
  description: string;
  domain: string;
  district: string;
  state: string;
  source_type: string;
  created_at: string;
}

interface EvidenceItem {
  id: string;
  evidence_type: string;
  storage_reference: string;
  description: string;
  created_at: string;
}

interface ClarificationItem {
  id: string;
  question: string;
  status: string;
  requested_at: string;
  responses: Array<{
    id: string;
    response: string;
    responded_at: string;
  }>;
}

export default function GovernmentWorkbenchPage({ params }: { params: Promise<{ challengeId: string }> }) {
  const { challengeId } = use(params);

  const [challenge, setChallenge] = useState<ChallengeDetail | null>(null);
  const [evidenceList, setEvidenceList] = useState<EvidenceItem[]>([]);
  const [clarifications, setClarifications] = useState<ClarificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Qualification form state
  const [qualRoute, setQualRoute] = useState("INNOVATION_CHALLENGE");
  const [qualRationale, setQualRationale] = useState("");
  const [submittingQual, setSubmittingQual] = useState(false);
  const [qualSuccess, setQualSuccess] = useState("");

  // Clarification form state
  const [clarQuestion, setClarQuestion] = useState("");
  const [submittingClar, setSubmittingClar] = useState(false);

  // HEI Matching state
  const [heiList, setHeiList] = useState<Array<{ organization_id: string; institution_name: string; city: string }>>([]);
  const [selectedHei, setSelectedHei] = useState("");
  const [heiRationale, setHeiRationale] = useState("");
  const [submittingHei, setSubmittingHei] = useState(false);
  const [heiSuccess, setHeiSuccess] = useState("");

  // Readiness state
  const [readinessStatus, setReadinessStatus] = useState("PILOT_READY");
  const [readinessRationale, setReadinessRationale] = useState("");
  const [submittingReadiness, setSubmittingReadiness] = useState(false);
  const [readinessSuccess, setReadinessSuccess] = useState("");

  const loadData = () => {
    Promise.all([
      fetch(`/api/v1/challenges/${challengeId}`).then((r) => (r.ok ? r.json() : null)),
      fetch(`/api/v1/challenges/${challengeId}/evidence`).then((r) => (r.ok ? r.json() : null)),
      fetch(`/api/v1/challenges/${challengeId}/clarifications`).then((r) => (r.ok ? r.json() : null)),
      fetch("/api/v1/hei/capabilities").then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([cData, eData, clData, hData]) => {
        if (cData) setChallenge(cData);
        if (eData) setEvidenceList(eData.items || []);
        if (clData) setClarifications(clData || []);
        if (hData && Array.isArray(hData.items)) {
          setHeiList(hData.items);
          if (hData.items.length > 0) setSelectedHei(hData.items[0].organization_id);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [challengeId]);

  const handleRecordQualification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qualRationale.trim()) return;
    setSubmittingQual(true);
    setQualSuccess("");
    try {
      const res = await fetch("/api/v1/qualification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          challenge_id: challengeId,
          route: qualRoute,
          rationale: qualRationale,
          evidence_ids: evidenceList.map((ev) => ev.id),
        }),
      });
      if (res.ok) {
        setQualSuccess(`Qualification decision recorded as ${qualRoute}`);
        setQualRationale("");
        loadData();
      }
    } catch {
    } finally {
      setSubmittingQual(false);
    }
  };

  const handleRequestClarification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clarQuestion.trim()) return;
    setSubmittingClar(true);
    try {
      const res = await fetch(`/api/v1/challenges/${challengeId}/clarifications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ question: clarQuestion }),
      });
      if (res.ok) {
        setClarQuestion("");
        loadData();
      }
    } catch {
    } finally {
      setSubmittingClar(false);
    }
  };

  const handleAddHEICandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHei || !heiRationale.trim()) return;
    setSubmittingHei(true);
    setHeiSuccess("");
    try {
      const res = await fetch("/api/v1/hei-matching/candidates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          challenge_id: challengeId,
          hei_organization_id: selectedHei,
          rationale: heiRationale,
        }),
      });
      if (res.ok) {
        setHeiSuccess("HEI candidate institution successfully matched.");
        setHeiRationale("");
        loadData();
      }
    } catch {
    } finally {
      setSubmittingHei(false);
    }
  };

  const handleAuthorizeReadiness = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!readinessRationale.trim()) return;
    setSubmittingReadiness(true);
    setReadinessSuccess("");
    try {
      const res = await fetch("/api/v1/readiness/decisions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          challenge_id: challengeId,
          status: readinessStatus,
          rationale: readinessRationale,
        }),
      });
      if (res.ok) {
        setReadinessSuccess(`Readiness decision updated to ${readinessStatus}`);
        setReadinessRationale("");
        loadData();
      }
    } catch {
    } finally {
      setSubmittingReadiness(false);
    }
  };

  if (loading) {
    return (
      <AppShell>
        <div className="flex justify-center py-20 text-stone-600 text-sm font-medium">
          <div className="w-5 h-5 border-2 border-amber-600 border-t-transparent rounded-full animate-spin mr-2"></div>
          Loading Workbench...
        </div>
      </AppShell>
    );
  }

  if (!challenge) {
    return (
      <AppShell>
        <div className="max-w-md mx-auto py-12 text-center">
          <h2 className="text-xl font-bold text-stone-900">Record Not Found</h2>
          <Link href="/app/review" className="mt-4 inline-block text-xs font-bold text-amber-700 hover:underline">
            ← Back to Review Queue
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header Bar */}
        <div className="bg-stone-900 text-white p-6 rounded-xl border border-stone-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs text-amber-400 font-bold uppercase tracking-wider mb-1">
              <span>Government Decision Workbench</span>
              <span>•</span>
              <span>{challenge.domain}</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-stone-100">{challenge.title}</h1>
            <p className="text-xs text-stone-300 mt-1">
              District: <span className="font-semibold text-white">{challenge.district}, {challenge.state}</span> • Submitted: {new Date(challenge.created_at).toLocaleDateString()}
            </p>
          </div>
          <Link
            href="/app/review"
            className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg text-xs font-semibold border border-stone-700 transition-colors text-center"
          >
            ← Review Queue
          </Link>
        </div>

        {/* Workbench Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left / Main Column (Narrative, Evidence, Clarification) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Challenge Facts */}
            <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm space-y-3">
              <h2 className="text-xs font-bold text-stone-500 uppercase tracking-widest">Factual Challenge Narrative</h2>
              <div className="p-3.5 bg-stone-50 rounded-lg border border-stone-200 text-sm font-medium text-stone-900">
                {challenge.summary}
              </div>
              <div className="text-sm text-stone-800 leading-relaxed whitespace-pre-line border-t border-stone-100 pt-3">
                {challenge.description}
              </div>
            </div>

            {/* Evidence Inspection */}
            <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm space-y-4">
              <h2 className="text-xs font-bold text-stone-500 uppercase tracking-widest">
                Submitted Evidence Materials ({evidenceList.length})
              </h2>

              {evidenceList.length === 0 ? (
                <p className="text-xs text-stone-500 py-3 italic">No evidence files uploaded for this record.</p>
              ) : (
                <div className="space-y-2">
                  {evidenceList.map((ev) => (
                    <div key={ev.id} className="p-3.5 bg-stone-50 rounded-lg border border-stone-200 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-stone-900 block">{ev.evidence_type}</span>
                        <span className="text-stone-600 font-medium block mt-0.5">{ev.description}</span>
                      </div>
                      {ev.storage_reference?.startsWith("local://") && (
                        <a
                          href={`/api/v1/evidence/${ev.id}/file`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 bg-stone-900 text-white rounded font-bold hover:bg-stone-800"
                        >
                          View File ↗
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Clarification Queries */}
            <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm space-y-4">
              <h2 className="text-xs font-bold text-stone-500 uppercase tracking-widest">
                Clarification Queries & Responses ({clarifications.length})
              </h2>

              <form onSubmit={handleRequestClarification} className="space-y-3 bg-stone-50 p-4 rounded-lg border border-stone-200">
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                  Request Clarification from Submitter
                </label>
                <textarea
                  rows={2}
                  value={clarQuestion}
                  onChange={(e) => setClarQuestion(e.target.value)}
                  placeholder="Enter specific question or detail required from the citizen submitter..."
                  className="w-full p-2.5 bg-white border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={submittingClar || !clarQuestion.trim()}
                    className="px-4 py-2 bg-stone-900 text-white text-xs font-bold rounded-lg hover:bg-stone-800 disabled:opacity-50"
                  >
                    Send Clarification Query
                  </button>
                </div>
              </form>

              {clarifications.length > 0 && (
                <div className="space-y-3 divide-y divide-stone-100 pt-2">
                  {clarifications.map((cl) => (
                    <div key={cl.id} className="pt-3 space-y-2 text-xs">
                      <div className="font-semibold text-stone-900 bg-amber-50/70 p-3 rounded-lg border border-amber-200">
                        <div className="text-[10px] font-bold text-amber-900 uppercase">Query ({cl.status}):</div>
                        <p className="mt-1 text-stone-900">{cl.question}</p>
                      </div>
                      {cl.responses && cl.responses.length > 0 && (
                        <div className="ml-4 space-y-1.5">
                          {cl.responses.map((resp) => (
                            <div key={resp.id} className="bg-emerald-50 p-3 rounded-lg border border-emerald-200 text-stone-900">
                              <span className="text-[10px] font-bold text-emerald-900 block uppercase">Citizen Response:</span>
                              <p className="mt-1">{resp.response}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right / Action Column (Qualification, HEI Candidate, Readiness) */}
          <div className="lg:col-span-5 space-y-6">
            {/* 1. Qualification Decision Form */}
            <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm space-y-4">
              <h2 className="text-xs font-bold text-stone-500 uppercase tracking-widest">
                1. Record Qualification Decision
              </h2>

              {qualSuccess && (
                <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold">
                  ✓ {qualSuccess}
                </div>
              )}

              <form onSubmit={handleRecordQualification} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Qualification Route *
                  </label>
                  <select
                    value={qualRoute}
                    onChange={(e) => setQualRoute(e.target.value)}
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg text-xs font-bold text-stone-900"
                  >
                    <option value="INNOVATION_CHALLENGE">INNOVATION CHALLENGE (HEI/Industry Pipeline)</option>
                    <option value="SERVICE">SERVICE ROUTE (Administrative Handling)</option>
                    <option value="RESEARCH_REVIEW">RESEARCH REVIEW (Academia Evaluation)</option>
                    <option value="CLARIFY">CLARIFY (Awaiting Submitter Information)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Qualification Rationale *
                  </label>
                  <textarea
                    rows={3}
                    value={qualRationale}
                    onChange={(e) => setQualRationale(e.target.value)}
                    placeholder="State factual justification for the selected qualification route..."
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingQual || !qualRationale.trim()}
                  className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg transition-colors disabled:opacity-50"
                >
                  Record Qualification Decision
                </button>
              </form>
            </div>

            {/* 2. HEI Candidate Selection Form */}
            <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm space-y-4">
              <h2 className="text-xs font-bold text-stone-500 uppercase tracking-widest">
                2. Match HEI Candidate Institution
              </h2>

              {heiSuccess && (
                <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold">
                  ✓ {heiSuccess}
                </div>
              )}

              <form onSubmit={handleAddHEICandidate} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Higher Educational Institution *
                  </label>
                  <select
                    value={selectedHei}
                    onChange={(e) => setSelectedHei(e.target.value)}
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg text-xs font-bold text-stone-900"
                  >
                    {heiList.length === 0 ? (
                      <option value="">No HEI Directory Records</option>
                    ) : (
                      heiList.map((h) => (
                        <option key={h.organization_id} value={h.organization_id}>
                          {h.institution_name} ({h.city})
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Candidate Matching Rationale *
                  </label>
                  <textarea
                    rows={2}
                    value={heiRationale}
                    onChange={(e) => setHeiRationale(e.target.value)}
                    placeholder="Justification for candidate selection..."
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingHei || !heiRationale.trim() || !selectedHei}
                  className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-lg transition-colors disabled:opacity-50"
                >
                  Add HEI Candidate Record
                </button>
              </form>
            </div>

            {/* 3. Readiness Decision Authorization */}
            <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm space-y-4">
              <h2 className="text-xs font-bold text-stone-500 uppercase tracking-widest">
                3. Authorize Pilot Readiness
              </h2>

              {readinessSuccess && (
                <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold">
                  ✓ {readinessSuccess}
                </div>
              )}

              <form onSubmit={handleAuthorizeReadiness} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Readiness Decision *
                  </label>
                  <select
                    value={readinessStatus}
                    onChange={(e) => setReadinessStatus(e.target.value)}
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg text-xs font-bold text-stone-900"
                  >
                    <option value="PILOT_READY">PILOT READY (Authorized for Pilot Launch)</option>
                    <option value="REVIEW_REQUIRED">REVIEW REQUIRED (Conditions Reopened)</option>
                    <option value="NOT_READY">NOT READY (Deficiencies Outstanding)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Human Sign-off Rationale *
                  </label>
                  <textarea
                    rows={2}
                    value={readinessRationale}
                    onChange={(e) => setReadinessRationale(e.target.value)}
                    placeholder="Human reviewer authorization rationale..."
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingReadiness || !readinessRationale.trim()}
                  className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg transition-colors disabled:opacity-50"
                >
                  Grant Readiness Authorization
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
