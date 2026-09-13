"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ShieldCheck,
  MapPin,
  Tag,
  Calendar,
  FileCheck2,
  Building2,
  Sparkles,
  Info,
} from "lucide-react";

import { ProductShell } from "@/components/shell/ProductShell";
import {
  fetchChallengeDetail,
  fetchChallengeEvidence,
  fetchQualificationHistory,
} from "@/lib/api";
import {
  ChallengeResponse,
  EvidenceResponse,
  QualificationDecisionResponse,
} from "@/lib/types/challenge";

interface PassportPageProps {
  params: Promise<{ challengeId: string }>;
}

export default function ChallengePassportPage({ params }: PassportPageProps) {
  const resolvedParams = use(params);
  const challengeId = resolvedParams.challengeId;

  const [challenge, setChallenge] = useState<ChallengeResponse | null>(null);
  const [evidenceList, setEvidenceList] = useState<EvidenceResponse[]>([]);
  const [qualificationList, setQualificationList] = useState<
    QualificationDecisionResponse[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDemo, setIsDemo] = useState(false);

  const [activeTab, setActiveTab] = useState<
    | "Overview"
    | "Evidence"
    | "Qualification"
    | "HEI Match"
    | "Commitments"
    | "Pilot Readiness"
    | "Pilots"
    | "Outcomes"
  >("Overview");

  const tabs = [
    "Overview",
    "Evidence",
    "Qualification",
    "HEI Match",
    "Commitments",
    "Pilot Readiness",
    "Pilots",
    "Outcomes",
  ] as const;

  useEffect(() => {
    async function loadPassportData() {
      setLoading(true);
      setError(null);
      try {
        const [cRes, eRes, qRes] = await Promise.all([
          fetchChallengeDetail(challengeId),
          fetchChallengeEvidence(challengeId),
          fetchQualificationHistory(challengeId),
        ]);

        setChallenge(cRes.data);
        setEvidenceList(eRes.data.items);
        setQualificationList(qRes.data.items);
        setIsDemo(cRes.isDemo || eRes.isDemo || qRes.isDemo);
      } catch {
        setError("Could not load Challenge Passport.");
      } finally {
        setLoading(false);
      }
    }

    loadPassportData();
  }, [challengeId]);

  if (loading) {
    return (
      <ProductShell>
        <div className="p-8 space-y-4 animate-pulse">
          <div className="h-4 bg-[#E8E4D9] rounded w-1/4" />
          <div className="h-8 bg-[#E8E4D9] rounded w-2/3" />
          <div className="h-32 bg-[#E8E4D9] rounded w-full" />
        </div>
      </ProductShell>
    );
  }

  if (error || !challenge) {
    return (
      <ProductShell>
        <div className="p-12 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-center space-y-4">
          <Info className="w-8 h-8 text-amber-600 mx-auto" />
          <h2 className="text-lg font-bold text-[var(--text-primary)]">
            Challenge Passport Not Found
          </h2>
          <p className="text-xs text-[var(--text-secondary)]">
            {error || "The requested challenge record could not be retrieved."}
          </p>
          <Link
            href="/challenges"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded bg-[var(--primary)] text-white text-xs font-semibold hover:bg-[var(--primary-hover)] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Explorer
          </Link>
        </div>
      </ProductShell>
    );
  }

  // Journey progression steps
  const journeySteps = [
    { label: "Challenge", status: "complete", detail: "Factual Record" },
    {
      label: "Evidence",
      status: evidenceList.length > 0 ? "complete" : "neutral",
      detail: `${evidenceList.length} Attached`,
    },
    {
      label: "Qualification",
      status: qualificationList.length > 0 ? "complete" : "neutral",
      detail:
        qualificationList.length > 0
          ? qualificationList[0].route
          : "Pending Review",
    },
    { label: "HEI Match", status: "neutral", detail: "Future Phase" },
    { label: "Commitment", status: "neutral", detail: "Future Phase" },
    { label: "Readiness", status: "neutral", detail: "Future Phase" },
    { label: "Pilot", status: "neutral", detail: "Future Phase" },
    { label: "Outcome", status: "neutral", detail: "Future Phase" },
  ];

  return (
    <ProductShell isDemo={isDemo}>
      <div className="space-y-6">
        {/* Back Link */}
        <div className="flex items-center justify-between">
          <Link
            href="/challenges"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Challenges
          </Link>
          <span className="text-[10px] font-mono bg-[#F2EFE9] text-[var(--text-secondary)] px-2 py-0.5 rounded border border-[var(--border)] uppercase">
            FACTUAL RECORD
          </span>
        </div>

        {/* Demo Data Notice Banner */}
        {isDemo && (
          <div className="p-3 rounded-lg bg-[#FFF4EE] border border-[#FCD8C5] flex items-center justify-between text-xs text-[var(--text-primary)]">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[var(--primary)]" />
              <span>
                <strong className="font-semibold">DEMO PASSPORT:</strong> Displaying synthetic dataset details.
              </span>
            </div>
            <span className="font-mono text-[10px] bg-[#E8E4D9] px-2 py-0.5 rounded text-[var(--text-secondary)]">
              SAMPLE DATA
            </span>
          </div>
        )}

        {/* Passport Header Title Block */}
        <div className="p-6 sm:p-8 rounded-xl border border-[var(--border)] bg-[var(--surface)] space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-secondary)]">
            <span className="font-mono font-semibold text-[var(--primary)]">
              ID: {challenge.id}
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
              {challenge.district}, {challenge.state}
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
              Created:{" "}
              {new Date(challenge.created_at).toLocaleDateString("en-IN", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight leading-snug">
            {challenge.title}
          </h1>

          <div className="flex flex-wrap gap-2 pt-1">
            <span className="px-3 py-1 text-xs rounded-full bg-[#F4F1EA] text-[var(--text-primary)] border border-[var(--border)] font-medium inline-flex items-center gap-1">
              <Tag className="w-3 h-3 text-[var(--primary)]" /> {challenge.domain}
            </span>
            <span className="px-3 py-1 text-xs rounded-full bg-[#F4F1EA] text-[var(--text-secondary)] border border-[var(--border)] font-medium">
              Source: {challenge.source_type}
            </span>
          </div>
        </div>

        {/* Passport Journey Progression Strip */}
        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] space-y-2">
          <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
            <span>PASSPORT JOURNEY WORKFLOW</span>
            <span className="font-mono text-[var(--primary)]">INSPECTION VIEW</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 pt-1">
            {journeySteps.map((step, idx) => (
              <div
                key={idx}
                className={`p-2 rounded border text-center text-xs flex flex-col justify-between h-14 ${
                  step.status === "complete"
                    ? "bg-[#EBF5EE] border-[#C6E7D0] text-[#166534]"
                    : "bg-[#F9F7F2] border-[var(--border)] text-[var(--text-secondary)] opacity-80"
                }`}
              >
                <span className="font-bold truncate text-[11px]">{step.label}</span>
                <span className="text-[9px] font-mono truncate">{step.detail}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Passport Internal Tabs */}
        <div className="border-b border-[var(--border)] flex gap-1 overflow-x-auto pb-0">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-xs font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
                activeTab === tab
                  ? "border-[var(--primary)] text-[var(--primary)] font-semibold"
                  : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content Display */}
        {activeTab === "Overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Main Narrative Column */}
            <div className="lg:col-span-8 space-y-6">
              <div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--surface)] space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--primary)]">
                  Problem Summary
                </h3>
                <p className="text-sm text-[var(--text-primary)] leading-relaxed font-medium">
                  {challenge.summary}
                </p>
              </div>

              <div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--surface)] space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--text-primary)]">
                  Full Problem Description & Context
                </h3>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">
                  {challenge.description}
                </p>
              </div>
            </div>

            {/* Metadata Rail */}
            <div className="lg:col-span-4 space-y-4">
              <div className="p-5 rounded-xl border border-[var(--border)] bg-[var(--surface)] space-y-3 text-xs">
                <h3 className="font-bold text-[var(--text-primary)] uppercase tracking-wider border-b border-[var(--border)] pb-2">
                  Passport Metadata Rail
                </h3>

                <div className="space-y-2.5 text-[var(--text-secondary)]">
                  <div>
                    <span className="block font-medium text-[10px] uppercase text-[var(--text-secondary)]">
                      Challenge Record ID
                    </span>
                    <span className="font-mono text-xs text-[var(--text-primary)] font-bold">
                      {challenge.id}
                    </span>
                  </div>

                  <div>
                    <span className="block font-medium text-[10px] uppercase text-[var(--text-secondary)]">
                      Domain
                    </span>
                    <span className="text-xs text-[var(--text-primary)] font-medium">
                      {challenge.domain}
                    </span>
                  </div>

                  <div>
                    <span className="block font-medium text-[10px] uppercase text-[var(--text-secondary)]">
                      Source Type
                    </span>
                    <span className="text-xs text-[var(--text-primary)] font-medium">
                      {challenge.source_type}
                    </span>
                  </div>

                  <div>
                    <span className="block font-medium text-[10px] uppercase text-[var(--text-secondary)]">
                      District & State
                    </span>
                    <span className="text-xs text-[var(--text-primary)] font-medium">
                      {challenge.district}, {challenge.state}
                    </span>
                  </div>

                  <div>
                    <span className="block font-medium text-[10px] uppercase text-[var(--text-secondary)]">
                      Submitted By Actor ID
                    </span>
                    <span className="font-mono text-xs text-[var(--text-primary)]">
                      {challenge.submitted_by_actor_id || "Not provided"}
                    </span>
                  </div>

                  <div>
                    <span className="block font-medium text-[10px] uppercase text-[var(--text-secondary)]">
                      Source Organization ID
                    </span>
                    <span className="font-mono text-xs text-[var(--text-primary)]">
                      {challenge.source_organization_id || "Not provided"}
                    </span>
                  </div>

                  <div>
                    <span className="block font-medium text-[10px] uppercase text-[var(--text-secondary)]">
                      Created Timestamp
                    </span>
                    <span className="text-xs text-[var(--text-primary)]">
                      {new Date(challenge.created_at).toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div>
                    <span className="block font-medium text-[10px] uppercase text-[var(--text-secondary)]">
                      Updated Timestamp
                    </span>
                    <span className="text-xs text-[var(--text-primary)]">
                      {new Date(challenge.updated_at).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "Evidence" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--text-primary)]">
                Attached Evidence Records ({evidenceList.length})
              </h3>
            </div>

            {evidenceList.length === 0 ? (
              <div className="p-8 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-center space-y-2">
                <FileCheck2 className="w-8 h-8 text-[var(--text-secondary)] mx-auto opacity-50" />
                <p className="text-xs font-semibold text-[var(--text-primary)]">
                  No evidence metadata has been attached to this challenge yet.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {evidenceList.map((ev) => (
                  <div
                    key={ev.id}
                    className="p-5 rounded-xl border border-[var(--border)] bg-[var(--surface)] space-y-2"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 text-xs font-semibold rounded bg-[#F4F1EA] text-[var(--primary)] border border-[var(--border)]">
                          {ev.evidence_type}
                        </span>
                        <span className="text-xs font-mono text-[var(--text-secondary)]">
                          ID: {ev.id.slice(0, 13)}...
                        </span>
                      </div>
                      <span className="text-[11px] text-[var(--text-secondary)]">
                        Submitted: {new Date(ev.submitted_at).toLocaleDateString("en-IN")}
                      </span>
                    </div>

                    <p className="text-xs text-[var(--text-primary)] font-medium leading-relaxed">
                      {ev.description || "No description provided."}
                    </p>

                    <div className="pt-2 border-t border-[var(--border)] flex flex-wrap items-center justify-between text-[11px] text-[var(--text-secondary)]">
                      <span>
                        Evidence reference:{" "}
                        <code className="bg-[#F2EFE9] px-1.5 py-0.5 rounded font-mono text-[var(--text-primary)]">
                          {ev.storage_reference}
                        </code>
                      </span>
                      {ev.captured_at && (
                        <span>Captured: {new Date(ev.captured_at).toLocaleDateString("en-IN")}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "Qualification" && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--text-primary)]">
              Human Qualification Decision History ({qualificationList.length})
            </h3>

            {qualificationList.length === 0 ? (
              <div className="p-8 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-center space-y-2">
                <ShieldCheck className="w-8 h-8 text-[var(--text-secondary)] mx-auto opacity-50" />
                <p className="text-xs font-semibold text-[var(--text-primary)]">
                  Qualification review has not been recorded yet.
                </p>
                <p className="text-[11px] text-[var(--text-secondary)]">
                  Human qualification decision will classify this challenge into SERVICE, CLARIFY, RESEARCH_REVIEW, or INNOVATION_CHALLENGE.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {qualificationList.map((qual) => (
                  <div
                    key={qual.id}
                    className="p-5 rounded-xl border border-[var(--border)] bg-[var(--surface)] space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 text-xs font-mono font-bold rounded bg-[#FFF4EE] text-[var(--primary)] border border-[#FCD8C5]">
                          Route: {qual.route}
                        </span>
                        <span className="text-xs font-mono text-[var(--text-secondary)]">
                          Version {qual.version}
                        </span>
                      </div>
                      <span className="text-[11px] text-[var(--text-secondary)]">
                        Decided: {new Date(qual.decided_at).toLocaleString("en-IN")}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase text-[var(--text-secondary)]">
                        Human Qualification Rationale
                      </span>
                      <p className="text-xs text-[var(--text-primary)] leading-relaxed">
                        {qual.rationale}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-[var(--border)] flex flex-wrap items-center justify-between text-[11px] font-mono text-[var(--text-secondary)]">
                      <span>Decided by Actor: {qual.decided_by_actor_id}</span>
                      <span>Evidence count: {qual.evidence_ids.length}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Structured Future Tab Placeholders */}
        {["HEI Match", "Commitments", "Pilot Readiness", "Pilots", "Outcomes"].includes(
          activeTab
        ) && (
          <div className="p-10 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-center space-y-3">
            <Building2 className="w-8 h-8 text-[var(--text-secondary)] mx-auto opacity-50" />
            <h3 className="text-sm font-bold text-[var(--text-primary)]">
              {activeTab} Workflow Phase
            </h3>
            <p className="text-xs text-[var(--text-secondary)] max-w-md mx-auto leading-relaxed">
              This workflow stage will activate automatically as human qualification decisions, HEI candidate matching, and readiness sign-offs progress.
            </p>
            <span className="inline-block text-[10px] font-mono bg-[#F2EFE9] text-[var(--text-secondary)] px-2.5 py-1 rounded border border-[var(--border)]">
              FUTURE WORKFLOW STAGE
            </span>
          </div>
        )}
      </div>
    </ProductShell>
  );
}
