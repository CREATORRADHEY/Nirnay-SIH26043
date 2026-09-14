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
  updated_at: string;
}

interface EvidenceItem {
  id: string;
  evidence_type: string;
  storage_reference: string;
  description: string;
  source_type: string;
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

export default function CitizenChallengeDetailPage({ params }: { params: Promise<{ challengeId: string }> }) {
  const { challengeId } = use(params);
  const { user } = useAuth();
  const [challenge, setChallenge] = useState<ChallengeDetail | null>(null);
  const [evidenceList, setEvidenceList] = useState<EvidenceItem[]>([]);
  const [clarifications, setClarifications] = useState<ClarificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [submittingReply, setSubmittingReply] = useState<Record<string, boolean>>({});

  useEffect(() => {
    Promise.all([
      fetch(`/api/v1/challenges/${challengeId}`).then((r) => (r.ok ? r.json() : null)),
      fetch(`/api/v1/challenges/${challengeId}/evidence`).then((r) => (r.ok ? r.json() : null)),
      fetch(`/api/v1/challenges/${challengeId}/clarifications`).then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([cData, eData, clData]) => {
        if (cData) setChallenge(cData);
        if (eData) setEvidenceList(eData.items || []);
        if (clData) setClarifications(clData || []);
      })
      .finally(() => setLoading(false));
  }, [challengeId]);

  const handleSendResponse = async (requestId: string) => {
    const text = replyText[requestId];
    if (!text || !text.trim()) return;

    setSubmittingReply((prev) => ({ ...prev, [requestId]: true }));
    try {
      const res = await fetch(`/api/v1/clarifications/${requestId}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ response: text }),
      });
      if (res.ok) {
        setReplyText((prev) => ({ ...prev, [requestId]: "" }));
        const clData = await fetch(`/api/v1/challenges/${challengeId}/clarifications`).then((r) => r.json());
        if (clData) setClarifications(clData);
      }
    } catch (e) {
    } finally {
      setSubmittingReply((prev) => ({ ...prev, [requestId]: false }));
    }
  };

  if (loading) {
    return (
      <AppShell>
        <div className="flex justify-center py-20 text-stone-600 text-sm font-medium">
          <div className="w-5 h-5 border-2 border-amber-600 border-t-transparent rounded-full animate-spin mr-2"></div>
          Loading challenge details...
        </div>
      </AppShell>
    );
  }

  if (!challenge) {
    return (
      <AppShell>
        <div className="max-w-md mx-auto py-12 text-center">
          <h2 className="text-xl font-bold text-stone-900">Challenge Not Found</h2>
          <p className="text-sm text-stone-600 mt-2">The requested record could not be found.</p>
          <Link href="/app/challenges" className="mt-4 inline-block text-xs font-bold text-amber-700 hover:underline">
            ← Return to My Challenges
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-8 py-2">
        {/* Navigation & Header */}
        <div className="space-y-3">
          <Link href="/app/challenges" className="text-xs font-bold text-stone-500 hover:text-stone-800 flex items-center space-x-1">
            <span>← Back to My Challenges</span>
          </Link>
          <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <span className="bg-amber-100 text-amber-900 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                  {challenge.domain}
                </span>
                <span className="text-xs font-semibold text-stone-500">
                  {challenge.district}, {challenge.state}
                </span>
              </div>
              <span className="text-xs font-mono text-stone-500">ID: {challenge.id.slice(0, 8)}...</span>
            </div>
            <h1 className="text-2xl font-bold text-stone-900 tracking-tight">{challenge.title}</h1>
            <p className="text-sm font-medium text-stone-700 bg-stone-50 p-3 rounded-lg border border-stone-200">
              {challenge.summary}
            </p>
          </div>
        </div>

        {/* Lifecycle Status Timeline */}
        <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm space-y-4">
          <h2 className="text-xs font-bold text-stone-500 uppercase tracking-widest">
            Government Lifecycle Timeline
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center text-xs font-bold">
            {[
              { label: "Submitted", active: true },
              { label: "Evidence Review", active: evidenceList.length > 0 },
              { label: "Qualification", active: clarifications.length > 0 },
              { label: "Collaboration", active: false },
              { label: "Pilot Ready", active: false },
              { label: "Outcome", active: false },
            ].map((step, idx) => (
              <div
                key={idx}
                className={`p-2.5 rounded-lg border ${
                  step.active
                    ? "bg-amber-50 text-amber-900 border-amber-300"
                    : "bg-stone-50 text-stone-400 border-stone-200"
                }`}
              >
                {step.label}
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Narrative */}
        <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm space-y-3">
          <h2 className="text-xs font-bold text-stone-500 uppercase tracking-widest">Full Description & Observed Facts</h2>
          <div className="text-sm text-stone-800 leading-relaxed whitespace-pre-line border-t border-stone-100 pt-3">
            {challenge.description}
          </div>
        </div>

        {/* Clarification Queries Section */}
        {clarifications.length > 0 && (
          <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-stone-500 uppercase tracking-widest">
                Government Reviewer Clarification Queries ({clarifications.length})
              </h2>
              <span className="bg-blue-100 text-blue-900 text-xs font-bold px-2 py-0.5 rounded-full">
                Active Thread
              </span>
            </div>

            <div className="space-y-4 divide-y divide-stone-100">
              {clarifications.map((req) => (
                <div key={req.id} className="pt-3 space-y-3">
                  <div className="bg-blue-50/70 p-4 rounded-lg border border-blue-200 text-sm space-y-1">
                    <div className="flex items-center justify-between text-xs text-blue-900 font-bold uppercase tracking-wider">
                      <span>Reviewer Question</span>
                      <span>Status: {req.status}</span>
                    </div>
                    <p className="text-stone-900 font-medium pt-1">{req.question}</p>
                    <span className="text-[10px] text-blue-700 block text-right">
                      {new Date(req.requested_at).toLocaleString()}
                    </span>
                  </div>

                  {/* Previous responses */}
                  {req.responses && req.responses.length > 0 && (
                    <div className="ml-4 space-y-2">
                      {req.responses.map((resp) => (
                        <div key={resp.id} className="bg-emerald-50 p-3.5 rounded-lg border border-emerald-200 text-sm">
                          <span className="text-xs font-bold text-emerald-900 block uppercase">Your Response:</span>
                          <p className="text-stone-800 mt-1">{resp.response}</p>
                          <span className="text-[10px] text-emerald-700 block text-right mt-1">
                            {new Date(resp.responded_at).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Response Input Form if OPEN or RESPONDED */}
                  {req.status !== "RESOLVED" && (
                    <div className="ml-4 pt-2 space-y-2">
                      <textarea
                        rows={2}
                        value={replyText[req.id] || ""}
                        onChange={(e) => setReplyText({ ...replyText, [req.id]: e.target.value })}
                        placeholder="Type your clarification response for the government reviewer..."
                        className="w-full p-3 bg-stone-50 border border-stone-300 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                      <div className="flex justify-end">
                        <button
                          onClick={() => handleSendResponse(req.id)}
                          disabled={submittingReply[req.id] || !replyText[req.id]?.trim()}
                          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg disabled:opacity-50 transition-colors"
                        >
                          Submit Response
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Evidence Records Section */}
        <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-stone-500 uppercase tracking-widest">
              Attached Evidence Materials ({evidenceList.length})
            </h2>
          </div>

          {evidenceList.length === 0 ? (
            <p className="text-xs text-stone-500 py-4 italic text-center">No evidence files uploaded for this record.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {evidenceList.map((ev) => (
                <div key={ev.id} className="p-4 bg-stone-50 rounded-lg border border-stone-200 flex flex-col justify-between space-y-2">
                  <div>
                    <span className="bg-stone-200 text-stone-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                      {ev.evidence_type}
                    </span>
                    <p className="text-xs text-stone-800 font-semibold mt-2 line-clamp-2">{ev.description}</p>
                  </div>
                  {ev.storage_reference?.startsWith("local://") && (
                    <a
                      href={`/api/v1/evidence/${ev.id}/file`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-amber-700 hover:underline flex items-center space-x-1 pt-2 border-t border-stone-200"
                    >
                      <span>Download / View File</span>
                      <span>↗</span>
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
