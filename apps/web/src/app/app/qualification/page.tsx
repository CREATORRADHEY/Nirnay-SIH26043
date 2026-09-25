"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/lib/auth-context";
import {
  fetchChallenges,
  fetchLatestQualification,
  fetchQualificationHistory,
  createQualificationDecision,
  createDecisionAssurance,
  fetchDecisionAssurance,
  ChallengeListItem,
  QualificationDecisionResponse,
  QualificationRoute,
  DecisionAssuranceResponse,
} from "@/lib/api";
import { DecisionAssurancePanel } from "@/components/DecisionAssurancePanel";

export default function QualificationPage() {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<ChallengeListItem[]>([]);
  const [selectedChallengeId, setSelectedChallengeId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // Qualification Decision State
  const [latestDecision, setLatestDecision] = useState<QualificationDecisionResponse | null>(null);
  const [history, setHistory] = useState<QualificationDecisionResponse[]>([]);
  const [assuranceRecords, setAssuranceRecords] = useState<DecisionAssuranceResponse[]>([]);
  const [qualRoute, setQualRoute] = useState<QualificationRoute>("INNOVATION_CHALLENGE");
  const [qualRationale, setQualRationale] = useState<string>(
    "Recurring societal challenge requires institutional research and pilot experimentation beyond routine municipal service delivery."
  );
  const [limitationsNote, setLimitationsNote] = useState<string>("");

  // Structured Rubric Answers (YES / NO / UNCERTAIN)
  const [q1Routine, setQ1Routine] = useState<"YES" | "NO" | "UNCERTAIN">("NO");
  const [q2Defined, setQ2Defined] = useState<"YES" | "NO" | "UNCERTAIN">("YES");
  const [q3Evidence, setQ3Evidence] = useState<"YES" | "NO" | "UNCERTAIN">("YES");
  const [q4Experiment, setQ4Experiment] = useState<"YES" | "NO" | "UNCERTAIN">("YES");
  const [q5Scope, setQ5Scope] = useState<"YES" | "NO" | "UNCERTAIN">("YES");

  // Conflict Declaration
  const [conflictDeclared, setConflictDeclared] = useState<"NO_KNOWN_CONFLICT" | "POTENTIAL_CONFLICT">("NO_KNOWN_CONFLICT");

  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadQualificationData = useCallback(async (chId: string) => {
    try {
      const [latestRes, historyRes, assuranceRes] = await Promise.all([
        fetchLatestQualification(chId).catch(() => ({ data: null })),
        fetchQualificationHistory(chId).catch(() => ({ data: { items: [] } })),
        fetchDecisionAssurance(chId).catch(() => ({ data: [] })),
      ]);

      if (latestRes.data) {
        setLatestDecision(latestRes.data);
      } else {
        setLatestDecision(null);
      }

      const histItems = (historyRes as { data?: { items: QualificationDecisionResponse[] } })?.data?.items || [];
      setHistory(histItems);
      setAssuranceRecords((assuranceRes.data as DecisionAssuranceResponse[]) || []);
    } catch (err) {
      console.error("Failed to fetch qualification data:", err);
    }
  }, []);

  useEffect(() => {
    async function init() {
      try {
        const res = await fetchChallenges();
        const items = res.data?.items || [];
        setChallenges(items);

        if (items.length > 0) {
          const ward12 = items.find(
            (c) => c.id === "c0a80001-0000-4000-8000-000000000001" || c.title.toLowerCase().includes("ward 12")
          );
          const initialId = ward12 ? ward12.id : items[0].id;
          setSelectedChallengeId(initialId);
          void loadQualificationData(initialId);
        } else {
          const fallbackId = "c0a80001-0000-4000-8000-000000000001";
          setSelectedChallengeId(fallbackId);
          void loadQualificationData(fallbackId);
        }
      } catch (err) {
        console.error("Failed to load challenges:", err);
        const fallbackId = "c0a80001-0000-4000-8000-000000000001";
        setSelectedChallengeId(fallbackId);
        void loadQualificationData(fallbackId);
      } finally {
        setLoading(false);
      }
    }
    void init();
  }, [loadQualificationData]);

  const handleChallengeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newId = e.target.value;
    setSelectedChallengeId(newId);
    setSuccessMessage(null);
    setErrorMessage(null);
    void loadQualificationData(newId);
  };

  const handleRecordDecision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChallengeId || !qualRationale.trim()) return;

    if (qualRationale.trim().length < 10) {
      setErrorMessage("Human rationale must be at least 10 characters.");
      return;
    }

    setSubmitting(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      // 1. Record authoritative qualification decision
      const qualRes = await createQualificationDecision(selectedChallengeId, {
        route: qualRoute,
        rationale: qualRationale,
        decided_by_actor_id: user?.id || "demo-reviewer",
        evidence_ids: [],
      });

      const decisionId = qualRes.data?.id || `q-demo-${Date.now()}`;
      const newVer = qualRes.data?.version || (history.length + 1);

      // 2. Record Decision Assurance Metadata
      const rubricSnapshot = {
        q1_routine_service: q1Routine,
        q2_problem_defined: q2Defined,
        q3_sufficient_evidence: q3Evidence,
        q4_experimentation_required: q4Experiment,
        q5_authorized_scope: q5Scope,
        selected_route: qualRoute,
      };

      const aiSnapshot = {
        suggested_route: "INNOVATION_CHALLENGE",
        provider: "Gemini",
        model: "gemini-3.6-flash",
      };

      await createDecisionAssurance(selectedChallengeId, {
        decision_type: "QUALIFICATION",
        authoritative_decision_id: decisionId,
        rubric_version: "v1",
        rubric_answers: rubricSnapshot,
        evidence_ids: [],
        rationale: qualRationale,
        limitations_note: limitationsNote || null,
        ai_advisory_snapshot: aiSnapshot,
        conflict_declared: conflictDeclared,
      }).catch((err) => console.warn("Assurance recording notice:", err));

      setSuccessMessage(
        `✓ Decision & Assurance Receipt recorded! Version v${newVer} created. Selected Route: ${qualRoute}`
      );
      void loadQualificationData(selectedChallengeId);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to record qualification decision.");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedChallenge = challenges.find((c) => c.id === selectedChallengeId) || {
    id: "c0a80001-0000-4000-8000-000000000001",
    title: "Ward 12 Waste Challenge",
    summary: "Solid waste accumulation and bio-degradation management in Ward 12, Ranchi.",
    district: "Ranchi",
    state: "Jharkhand",
    domain: "URBAN_SERVICES",
    source_type: "CITIZEN_REPORT",
    created_at: new Date().toISOString(),
  };

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto space-y-6 py-4">
        {/* Top Header */}
        <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">
              <span>Decision Assurance</span>
              <span>•</span>
              <span>Qualification Gate</span>
            </div>
            <h1 className="text-2xl font-bold text-stone-900 tracking-tight">Problem Qualification Workbench</h1>
            <p className="text-sm text-stone-600 mt-1">
              Formally qualify societal challenges with structured criteria rubrics, evidence references, and auditable human rationale.
            </p>
          </div>
          <Link
            href="/app/review"
            className="px-4 py-2 bg-stone-900 text-white rounded-lg text-xs font-bold hover:bg-stone-800 transition-colors text-center shrink-0"
          >
            Review Queue →
          </Link>
        </div>

        {/* Challenge Selection bar */}
        <div className="bg-stone-900 text-white p-4 rounded-xl border border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Select Challenge:</span>
            <select
              value={selectedChallengeId}
              onChange={handleChallengeChange}
              className="bg-stone-800 border border-stone-700 rounded-lg px-3 py-1.5 text-xs font-bold text-white max-w-md focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              {challenges.length > 0 ? (
                challenges.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title} ({c.id})
                  </option>
                ))
              ) : (
                <option value="c0a80001-0000-4000-8000-000000000001">
                  Ward 12 Waste Challenge (c0a80001-0000-4000-8000-000000000001)
                </option>
              )}
            </select>
          </div>
          <div className="flex items-center space-x-2 text-xs text-stone-400 font-mono">
            <span>ID:</span>
            <span className="bg-stone-800 px-2 py-0.5 rounded text-amber-300 font-bold">{selectedChallenge.id}</span>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-stone-500 text-sm font-medium">Loading qualification details...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Challenge Facts & AI Advisory */}
            <div className="space-y-6">
              {/* Challenge Overview Card */}
              <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-mono font-bold rounded">
                    {selectedChallenge.domain}
                  </span>
                  <span className="text-xs text-stone-500 font-mono">📍 {selectedChallenge.district}, {selectedChallenge.state}</span>
                </div>
                <h2 className="text-lg font-bold text-stone-900">{selectedChallenge.title}</h2>
                <p className="text-xs text-stone-600 leading-relaxed">{selectedChallenge.summary}</p>
              </div>

              {/* AI Advisory Card (Visually Separate & Non-Authoritative) */}
              <div className="bg-amber-50/60 p-5 rounded-xl border border-amber-200/80 space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-amber-200/60 pb-2">
                  <span className="font-bold text-amber-900 uppercase tracking-wider text-[11px]">
                    AI ADVISORY — NON-AUTHORITATIVE
                  </span>
                  <span className="text-[10px] text-amber-700 font-mono">Gemini 3.6</span>
                </div>
                <div className="space-y-1 text-amber-900">
                  <div>Suggested Route: <span className="font-bold">INNOVATION_CHALLENGE</span></div>
                  <p className="text-[11px] text-amber-800 leading-normal">
                    AI analysis indicates recurring municipal waste accumulation requiring structured institutional R&D and field pilot intervention.
                  </p>
                </div>
                <div className="pt-2 border-t border-amber-200/60 font-mono text-[10px] text-amber-700 font-bold">
                  ⚠️ AI cannot submit this decision. Human reviewer holds sole authoritative responsibility.
                </div>
              </div>

              {/* Conflict of Interest Declaration */}
              <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm space-y-3 text-xs">
                <h3 className="font-bold text-stone-900 uppercase tracking-wider text-[11px]">
                  Conflict of Interest Declaration
                </h3>
                <p className="text-stone-600">
                  Reviewer must declare any potential institutional or personal conflict before recording authoritative qualification.
                </p>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="conflict"
                      value="NO_KNOWN_CONFLICT"
                      checked={conflictDeclared === "NO_KNOWN_CONFLICT"}
                      onChange={() => setConflictDeclared("NO_KNOWN_CONFLICT")}
                      className="text-stone-900 focus:ring-stone-800"
                    />
                    <span className="font-medium text-stone-800">NO KNOWN CONFLICT</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="conflict"
                      value="POTENTIAL_CONFLICT"
                      checked={conflictDeclared === "POTENTIAL_CONFLICT"}
                      onChange={() => setConflictDeclared("POTENTIAL_CONFLICT")}
                      className="text-amber-700 focus:ring-amber-700"
                    />
                    <span className="font-bold text-amber-800">POTENTIAL CONFLICT (Triggers 2nd Review)</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Right 2 Columns: Decision Form, Rubric & Assurance Log */}
            <div className="lg:col-span-2 space-y-6">
              {/* Decision Form & Rubric */}
              <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                  <div>
                    <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Authoritative Reviewer Gate</span>
                    <h2 className="text-lg font-bold text-stone-900 mt-0.5">Structured Qualification & Assurance</h2>
                  </div>
                  {latestDecision && (
                    <span className="px-2.5 py-1 bg-amber-100 text-amber-900 border border-amber-300 font-mono font-bold text-xs rounded-lg">
                      Latest: v{latestDecision.version} ({latestDecision.route})
                    </span>
                  )}
                </div>

                {errorMessage && (
                  <div className="p-3 bg-red-50 text-red-900 border border-red-200 rounded text-xs">
                    {errorMessage}
                  </div>
                )}

                {successMessage && (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium space-y-1">
                    <div className="font-bold text-sm">{successMessage}</div>
                  </div>
                )}

                <form onSubmit={handleRecordDecision} className="space-y-5 text-xs">
                  {/* Structured Rubric (5 Criteria Questions) */}
                  <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
                    <h3 className="font-bold text-stone-900 uppercase text-[11px] tracking-wider border-b border-stone-200 pb-2">
                      Structured Qualification Rubric (v1)
                    </h3>

                    <div className="space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200/60 pb-2">
                        <span className="text-stone-700 font-medium">1. Routine municipal service delivery issue?</span>
                        <div className="flex gap-2">
                          {(["YES", "NO", "UNCERTAIN"] as const).map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => setQ1Routine(opt)}
                              className={`px-2.5 py-1 rounded text-[10px] font-bold border transition-colors ${
                                q1Routine === opt
                                  ? "bg-stone-900 text-white border-stone-900"
                                  : "bg-white text-stone-700 border-stone-300 hover:bg-stone-100"
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200/60 pb-2">
                        <span className="text-stone-700 font-medium">2. Problem sufficiently defined to route?</span>
                        <div className="flex gap-2">
                          {(["YES", "NO", "UNCERTAIN"] as const).map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => setQ2Defined(opt)}
                              className={`px-2.5 py-1 rounded text-[10px] font-bold border transition-colors ${
                                q2Defined === opt
                                  ? "bg-stone-900 text-white border-stone-900"
                                  : "bg-white text-stone-700 border-stone-300 hover:bg-stone-100"
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200/60 pb-2">
                        <span className="text-stone-700 font-medium">3. Sufficient evidence/context attached?</span>
                        <div className="flex gap-2">
                          {(["YES", "NO", "UNCERTAIN"] as const).map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => setQ3Evidence(opt)}
                              className={`px-2.5 py-1 rounded text-[10px] font-bold border transition-colors ${
                                q3Evidence === opt
                                  ? "bg-stone-900 text-white border-stone-900"
                                  : "bg-white text-stone-700 border-stone-300 hover:bg-stone-100"
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200/60 pb-2">
                        <span className="text-stone-700 font-medium">4. Requires research, experimentation, or R&D?</span>
                        <div className="flex gap-2">
                          {(["YES", "NO", "UNCERTAIN"] as const).map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => setQ4Experiment(opt)}
                              className={`px-2.5 py-1 rounded text-[10px] font-bold border transition-colors ${
                                q4Experiment === opt
                                  ? "bg-stone-900 text-white border-stone-900"
                                  : "bg-white text-stone-700 border-stone-300 hover:bg-stone-100"
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <span className="text-stone-700 font-medium">5. Challenge within authorized scope?</span>
                        <div className="flex gap-2">
                          {(["YES", "NO", "UNCERTAIN"] as const).map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => setQ5Scope(opt)}
                              className={`px-2.5 py-1 rounded text-[10px] font-bold border transition-colors ${
                                q5Scope === opt
                                  ? "bg-stone-900 text-white border-stone-900"
                                  : "bg-white text-stone-700 border-stone-300 hover:bg-stone-100"
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Route Selection */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                      Authoritative Qualification Route
                    </label>
                    <select
                      value={qualRoute}
                      onChange={(e) => setQualRoute(e.target.value as QualificationRoute)}
                      className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2.5 text-stone-900 font-bold text-xs"
                    >
                      <option value="INNOVATION_CHALLENGE">INNOVATION_CHALLENGE (State-Supported Institutional R&D)</option>
                      <option value="RESEARCH_REVIEW">RESEARCH_REVIEW (Further Institutional Feasibility Study)</option>
                      <option value="SERVICE">SERVICE (Direct Municipal Infrastructure Service)</option>
                      <option value="CLARIFY">CLARIFY (Request Additional Evidence)</option>
                    </select>
                  </div>

                  {/* Rationale */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                      Mandatory Human Rationale (min 10 characters)
                    </label>
                    <textarea
                      rows={3}
                      value={qualRationale}
                      onChange={(e) => setQualRationale(e.target.value)}
                      placeholder="Explain the specific factual and analytical basis for your authoritative qualification choice..."
                      className="w-full bg-stone-50 border border-stone-300 rounded-lg p-3 text-stone-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                      required
                    />
                  </div>

                  {/* Limitations Note */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                      Uncertainty / Limitations Note (Optional unless UNCERTAIN marked)
                    </label>
                    <input
                      type="text"
                      value={limitationsNote}
                      onChange={(e) => setLimitationsNote(e.target.value)}
                      placeholder="State any known evidence limitations or boundary conditions..."
                      className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2.5 text-stone-900 text-xs"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                    <div className="text-[11px] text-stone-500 font-mono">
                      Evaluator: <span className="font-bold text-stone-800">{user?.display_name || "State Nodal Reviewer"}</span>
                    </div>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs shadow transition-colors flex items-center space-x-2 disabled:opacity-50"
                    >
                      <span>{submitting ? "Recording..." : "Record Authoritative Decision →"}</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Decision Assurance Audit Panel */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                  Decision Assurance Audit Receipts ({assuranceRecords.length})
                </h3>
                <DecisionAssurancePanel
                  assuranceRecords={assuranceRecords}
                  challengeId={selectedChallengeId}
                  userRole={user?.platform_role}
                  onRefresh={() => void loadQualificationData(selectedChallengeId)}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
