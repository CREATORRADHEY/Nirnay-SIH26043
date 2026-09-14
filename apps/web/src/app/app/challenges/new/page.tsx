"use client";

import { CitizenAIExtractionModal } from "@/components/ai/CitizenAIExtractionModal";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";

const DOMAIN_OPTIONS = [
  { value: "WATER", label: "Water Resources & Quality" },
  { value: "ENVIRONMENT_HEALTH", label: "Environment & Public Health" },
  { value: "ENERGY", label: "Clean Energy & Power" },
  { value: "HEALTHCARE", label: "Healthcare & Nutrition" },
  { value: "AGRICULTURE", label: "Agriculture & Farming" },
  { value: "INFRASTRUCTURE", label: "Civic Infrastructure & Housing" },
  { value: "EDUCATION", label: "Education & Skill Development" },
  { value: "SANITATION", label: "Sanitation & Waste Management" },
  { value: "ENVIRONMENT", label: "Environment & Pollution" },
  { value: "OTHER", label: "Other Societal Challenge" },
];

const DISTRICT_OPTIONS = [
  "Ranchi",
  "Dhanbad",
  "East Singhbhum (Jamshedpur)",
  "Hazaribagh",
  "Bokaro",
  "Giridih",
  "Deoghar",
  "Dumka",
  "Ramgarh",
  "Palamu",
  "West Singhbhum",
  "Latehar",
  "Koderma",
  "Gumla",
];

export default function NewChallengeWizardPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showAIModal, setShowAIModal] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [description, setDescription] = useState("");
  const [domain, setDomain] = useState("WATER");
  const [state, setState] = useState("Jharkhand");
  const [district, setDistrict] = useState("Ranchi");
  const [localArea, setLocalArea] = useState("");
  const [affectedPeople, setAffectedPeople] = useState("");
  const [severity, setSeverity] = useState("HIGH");
  const [occurrenceFrequency, setOccurrenceFrequency] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [evidenceType, setEvidenceType] = useState("DOCUMENT");
  const [evidenceDesc, setEvidenceDesc] = useState("");

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (step === 1) {
      if (!title.trim() || !summary.trim() || !description.trim()) {
        setError("Please fill in all required problem fields.");
        return;
      }
    }
    if (step === 2) {
      if (!district.trim()) {
        setError("Please select a district.");
        return;
      }
    }
    setStep((prev) => Math.min(prev + 1, 5));
  };

  const handleBack = () => {
    setError("");
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");

    try {
      // Step 1: Create Challenge
      const res = await fetch("/api/v1/challenges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title,
          summary,
          description: `${description}

Location Details: ${localArea}
Affected Population: ${affectedPeople}
Frequency: ${occurrenceFrequency}`,
          domain,
          source_type: "CITIZEN",
          district,
          state,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to submit challenge.");
      }

      const createdChallenge = await res.json();

      // Step 2: Upload file if provided
      if (selectedFile) {
        const formData = new FormData();
        formData.append("evidence_type", evidenceType);
        formData.append("description", evidenceDesc || "Initial evidence document");
        formData.append("source_type", "CITIZEN_SUBMISSION");
        formData.append("file", selectedFile);

        await fetch(`/api/v1/challenges/${createdChallenge.id}/evidence/upload`, {
          method: "POST",
          credentials: "include",
          body: formData,
        });
      }

      router.push(`/app/challenges/${createdChallenge.id}`);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage || "Submission failed. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto space-y-6 py-4">
        {/* Top Back Link */}
        <div>
          <button
            type="button"
            onClick={() => router.push("/app/challenges")}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors cursor-pointer"
          >
            <span>← Cancel & Return to My Challenges</span>
          </button>
        </div>

        {/* Wizard Progress Bar */}
        <div>
          <div className="flex items-center justify-between text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">
            <span>Report Societal Challenge</span>
            <span>Step {step} of 5</span>
          </div>
          <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden flex">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className={`flex-1 h-full border-r border-white transition-colors ${
                  i <= step ? "bg-amber-600" : "bg-stone-200"
                }`}
              ></div>
            ))}
          </div>
          <div className="flex justify-between text-[11px] font-semibold text-stone-500 mt-2">
            <span className={step >= 1 ? "text-amber-700 font-bold" : ""}>1. Problem</span>
            <span className={step >= 2 ? "text-amber-700 font-bold" : ""}>2. Location</span>
            <span className={step >= 3 ? "text-amber-700 font-bold" : ""}>3. Context</span>
            <span className={step >= 4 ? "text-amber-700 font-bold" : ""}>4. Evidence</span>
            <span className={step >= 5 ? "text-amber-700 font-bold" : ""}>5. Review</span>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-800 border border-red-200 rounded-lg text-sm font-medium">
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-6 sm:p-8">
          {/* STEP 1: PROBLEM */}
          {step === 1 && (
            <form onSubmit={handleNext} className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-stone-900">1. Describe the Problem</h2>
                <p className="text-sm text-stone-600 mt-1">
                  Provide clear, factual information about the societal issue you are reporting.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Challenge Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Contaminated Groundwater in Hatia Ward 14"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-sm text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Domain Category *
                  </label>
                  <select
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-sm text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    {DOMAIN_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Short Executive Summary *
                  </label>
                  <input
                    type="text"
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    placeholder="Brief 1-2 sentence overview of the issue."
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-sm text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Detailed Description & Observed Symptoms *
                  </label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide detailed facts: what happens, visible signs, affected facilities, lab tests if known."
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-sm text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-stone-100">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold rounded-lg transition-colors"
                >
                  Continue to Location →
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: LOCATION */}
          {step === 2 && (
            <form onSubmit={handleNext} className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-stone-900">2. Geographic Scope</h2>
                <p className="text-sm text-stone-600 mt-1">Specify where this problem occurs in Jharkhand.</p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                      State *
                    </label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-stone-100 border border-stone-300 rounded-lg text-sm text-stone-700 font-semibold cursor-not-allowed"
                      readOnly
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                      District *
                    </label>
                    <select
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-sm text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      {DISTRICT_OPTIONS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Local Area / Block / Ward / Village Details
                  </label>
                  <input
                    type="text"
                    value={localArea}
                    onChange={(e) => setLocalArea(e.target.value)}
                    placeholder="e.g. Ward No. 14, Near Primary Health Center, Hatia"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-sm text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-sm font-semibold rounded-lg"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold rounded-lg transition-colors"
                >
                  Continue to Context →
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: CONTEXT */}
          {step === 3 && (
            <form onSubmit={handleNext} className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-stone-900">3. Social Context & Impact</h2>
                <p className="text-sm text-stone-600 mt-1">
                  Provide context to help government reviewers evaluate qualification.
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                      Population Impacted (Count / Description)
                    </label>
                    <input
                      type="text"
                      value={affectedPeople}
                      onChange={(e) => setAffectedPeople(e.target.value)}
                      placeholder="e.g. 1,500 residents (~500 households)"
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-sm text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                      Perceived Severity *
                    </label>
                    <select
                      value={severity}
                      onChange={(e) => setSeverity(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-sm font-bold text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="CRITICAL">CRITICAL (Immediate Health/Life Risk)</option>
                      <option value="HIGH">HIGH (Severe Community Disruption)</option>
                      <option value="MEDIUM">MEDIUM (Moderate Impact)</option>
                      <option value="LOW">LOW (Minor Local Issue)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Frequency & Duration
                  </label>
                  <input
                    type="text"
                    value={occurrenceFrequency}
                    onChange={(e) => setOccurrenceFrequency(e.target.value)}
                    placeholder="e.g. Daily during monsoon season, ongoing for 2 years"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-sm text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-sm font-semibold rounded-lg"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold rounded-lg transition-colors"
                >
                  Continue to Evidence →
                </button>
              </div>
            </form>
          )}

          {/* STEP 4: EVIDENCE */}
          {step === 4 && (
            <form onSubmit={handleNext} className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-stone-900">4. Supporting Evidence File (Optional)</h2>
                <p className="text-sm text-stone-600 mt-1">
                  Upload photographs, documents, or lab reports to substantiate the reported challenge.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Select Evidence File (PDF, Image, DOC, TXT up to 10MB)
                  </label>
                  <input
                    type="file"
                    accept="image/*,.pdf,.doc,.docx,.txt"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className="w-full px-3.5 py-2 bg-stone-50 border border-stone-300 rounded-lg text-sm text-stone-900 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-stone-900 file:text-white hover:file:bg-stone-800"
                  />
                  {selectedFile && (
                    <p className="text-xs text-emerald-700 font-semibold mt-1.5">
                      Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                    </p>
                  )}
                </div>

                {selectedFile && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                        Evidence Category
                      </label>
                      <select
                        value={evidenceType}
                        onChange={(e) => setEvidenceType(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-sm text-stone-900"
                      >
                        <option value="DOCUMENT">Official Document / Report</option>
                        <option value="PHOTO">Field Photograph</option>
                        <option value="LAB_REPORT">Laboratory Analysis</option>
                        <option value="OTHER">Other Supporting Material</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                        Evidence Description
                      </label>
                      <input
                        type="text"
                        value={evidenceDesc}
                        onChange={(e) => setEvidenceDesc(e.target.value)}
                        placeholder="Brief note explaining what this file demonstrates"
                        className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-sm text-stone-900"
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-sm font-semibold rounded-lg"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold rounded-lg transition-colors"
                >
                  Review & Submit →
                </button>
              </div>
            </form>
          )}

          {/* STEP 5: REVIEW & SUBMIT */}
          {step === 5 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-stone-900">5. Review & Confirm Submission</h2>
                <p className="text-sm text-stone-600 mt-1">
                  Verify your submission details before sending for government review.
                </p>
              </div>

              <div className="bg-stone-50 p-4 rounded-lg border border-stone-200 space-y-3 text-sm">
                <div>
                  <span className="font-bold text-stone-700 block text-xs uppercase">Title:</span>
                  <span className="text-stone-900 font-semibold">{title}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="font-bold text-stone-700 block uppercase">Domain:</span>
                    <span className="text-stone-900 font-semibold">{domain}</span>
                  </div>
                  <div>
                    <span className="font-bold text-stone-700 block uppercase">District:</span>
                    <span className="text-stone-900 font-semibold">{district}, {state}</span>
                  </div>
                </div>
                <div>
                  <span className="font-bold text-stone-700 block text-xs uppercase">Summary:</span>
                  <span className="text-stone-800">{summary}</span>
                </div>
                <div>
                  <span className="font-bold text-stone-700 block text-xs uppercase">Detailed Description:</span>
                  <span className="text-stone-800 whitespace-pre-line">{description}</span>
                </div>
                {selectedFile && (
                  <div>
                    <span className="font-bold text-stone-700 block text-xs uppercase">Attached Evidence:</span>
                    <span className="text-emerald-700 font-semibold">{selectedFile.name} ({evidenceType})</span>
                  </div>
                )}
              </div>

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 space-y-1">
                <div className="font-bold uppercase tracking-wider">Notice & Disclaimer</div>
                <p>
                  Submitting a challenge does not mean it has been automatically accepted for an innovation project.
                  It will first be reviewed and qualified by authorized government reviewers.
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={submitting}
                  className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-sm font-semibold rounded-lg disabled:opacity-50"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="px-8 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <span>Submit Challenge</span>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <CitizenAIExtractionModal
        isOpen={showAIModal}
        onClose={() => setShowAIModal(false)}
        onApply={(extracted) => {
          if (extracted.title) setTitle(extracted.title);
          if (extracted.summary) setSummary(extracted.summary);
          if (extracted.description) setDescription(extracted.description);
          if (extracted.domain) setDomain(extracted.domain);
        }}
      />
    </AppShell>
  );
}
