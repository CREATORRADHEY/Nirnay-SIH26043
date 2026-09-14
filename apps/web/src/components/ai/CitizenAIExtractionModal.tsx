"use client";

import React, { useState } from "react";
import { extractChallengeWithAI } from "@/lib/api/ai";
import { ChallengeExtractionResponse } from "@/lib/types/ai";

interface CitizenAIExtractionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (extracted: {
    title: string;
    summary: string;
    description: string;
    domain?: string;
  }) => void;
}

export function CitizenAIExtractionModal({
  isOpen,
  onClose,
  onApply,
}: CitizenAIExtractionModalProps) {
  const [rawText, setRawText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ChallengeExtractionResponse | null>(null);

  if (!isOpen) return null;

  const handleExtract = async () => {
    if (!rawText.trim()) {
      setError("Please enter a description of the problem.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await extractChallengeWithAI(rawText);
      setResult(res.data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "AI assistance unavailable";
      setError(msg || "AI assistance temporarily unavailable. You can continue manually.");
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (!result) return;
    const combinedDescription = `${result.suggested_summary}

Affected Groups: ${result.affected_group_notes || "Not specified"}
Frequency: ${result.frequency_notes || "Not specified"}
Duration: ${result.duration_notes || "Not specified"}
Current Situation: ${result.current_situation_notes || "Not specified"}`;

    onApply({
      title: result.suggested_title,
      summary: result.suggested_summary,
      description: combinedDescription,
      domain: result.suggested_domain || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-stone-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-stone-200 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-stone-200 pb-3">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-amber-500 animate-pulse"></div>
            <h3 className="text-lg font-bold text-stone-900 tracking-tight">
              Structure Problem Report with AI
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 text-lg font-bold"
          >
            ✕
          </button>
        </div>

        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900">
          <span className="font-bold uppercase tracking-wider block mb-0.5">
            Advisory Notice:
          </span>
          AI helps structure your natural language input into a standard format.
          You retain full authority and can edit all fields before submitting.
        </div>

        {!result ? (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Describe the problem in your own words (English, Hindi, or Hinglish)
              </label>
              <textarea
                rows={5}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="Example: Hamare village me pichle 6 mahine se drinking water supply nahi aa rahi hai, 500 family water tanker par depend hain aur paani ki quality bhi kharab hai..."
                className="w-full p-3 bg-stone-50 border border-stone-300 rounded-lg text-sm text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-xs font-semibold">
                {error}
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-stone-500 font-mono">
                Source Language: Auto-detect (English/Hindi/Hinglish)
              </span>
              <button
                type="button"
                onClick={handleExtract}
                disabled={loading}
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg shadow transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Analyzing Input...</span>
                  </>
                ) : (
                  <span>✨ Structure with AI</span>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 text-xs">
            <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-3">
              <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                <span className="font-bold text-stone-700 uppercase tracking-wider">
                  Extracted AI Suggestions
                </span>
                <span className="text-[10px] font-mono bg-stone-200 px-2 py-0.5 rounded text-stone-800">
                  Detected: {result.source_language}
                </span>
              </div>

              <div>
                <span className="font-bold text-stone-700 block uppercase">Suggested Title:</span>
                <span className="text-stone-900 font-bold text-sm">{result.suggested_title}</span>
              </div>

              {result.suggested_domain && (
                <div>
                  <span className="font-bold text-stone-700 block uppercase">Suggested Domain:</span>
                  <span className="text-amber-800 font-bold bg-amber-100 border border-amber-200 px-2 py-0.5 rounded inline-block mt-0.5">
                    {result.suggested_domain}
                  </span>
                </div>
              )}

              <div>
                <span className="font-bold text-stone-700 block uppercase">Summary:</span>
                <p className="text-stone-800">{result.suggested_summary}</p>
              </div>

              {result.missing_information?.length > 0 && (
                <div className="p-2.5 bg-amber-50/70 border border-amber-200 rounded-lg">
                  <span className="font-bold text-amber-900 block uppercase mb-1">
                    Missing Information Checklist:
                  </span>
                  <ul className="list-disc list-inside space-y-0.5 text-amber-900">
                    {result.missing_information.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setResult(null)}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold rounded-lg text-xs"
              >
                ← Re-enter Description
              </button>
              <button
                type="button"
                onClick={handleApply}
                className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs shadow transition-colors"
              >
                ✓ Apply Suggestions to Form
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
