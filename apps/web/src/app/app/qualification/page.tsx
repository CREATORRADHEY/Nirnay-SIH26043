"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";

export default function WorkflowPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/government/review-queue?limit=50", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) setItems(data.items || []);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-stone-900">Qualified Innovation Challenges</h1>
            <p className="text-sm text-stone-600 mt-1">Challenges formally qualified for institutional collaboration and pilot readiness.</p>
          </div>
          <Link
            href="/app/review"
            className="px-4 py-2 bg-stone-900 text-white rounded-lg text-xs font-bold hover:bg-stone-800 transition-colors text-center"
          >
            Review Queue →
          </Link>
        </div>

        {loading ? (
          <div className="py-12 text-center text-stone-500 text-sm font-medium">Loading records...</div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-xl border border-stone-200 p-12 text-center text-stone-500 text-sm">
            No records listed.
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden divide-y divide-stone-100">
            {items.map((item) => (
              <div key={item.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold text-stone-900 text-base">{item.title}</h3>
                    <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded">
                      {item.domain}
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 mt-1 line-clamp-2">{item.summary}</p>
                </div>
                <div className="flex items-center space-x-3 whitespace-nowrap">
                  <Link
                    href={`/app/review/${item.id}`}
                    className="px-3.5 py-1.5 bg-stone-900 text-white rounded text-xs font-bold hover:bg-stone-800"
                  >
                    Open Workbench →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
