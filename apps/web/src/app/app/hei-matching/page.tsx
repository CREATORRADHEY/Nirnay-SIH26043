"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";

export default function HEIMatchingPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [heis, setHeis] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/hei/capabilities", { credentials: "include" })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data) setHeis(data.items || []);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-stone-900">HEI Directory & Candidate Matching Workspace</h1>
            <p className="text-sm text-stone-600 mt-1">
              Higher Educational Institutions directory, research capabilities, and candidate matching.
            </p>
          </div>
          <Link
            href="/app/review"
            className="px-4 py-2 bg-stone-900 text-white rounded-lg text-xs font-bold hover:bg-stone-800 transition-colors text-center"
          >
            Review Queue →
          </Link>
        </div>

        {loading ? (
          <div className="py-12 text-center text-stone-500 text-sm font-medium">Loading HEI records...</div>
        ) : heis.length === 0 ? (
          <div className="bg-white rounded-xl border border-stone-200 p-12 text-center text-stone-500 text-sm">
            No HEI capabilities records found.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {heis.map((hei) => (
              <div key={hei.organization_id} className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm space-y-2">
                <div className="font-bold text-stone-900 text-base">{hei.institution_name}</div>
                <div className="text-xs font-medium text-stone-600">Location: {hei.city}, {hei.state}</div>
                <div className="text-xs text-stone-700 bg-stone-50 p-2.5 rounded border border-stone-200 mt-2">
                  Capabilities: {hei.domain_focus}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
