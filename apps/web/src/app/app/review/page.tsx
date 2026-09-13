"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";

interface ReviewQueueItem {
  id: string;
  title: string;
  summary: string;
  domain: string;
  district: string;
  source_type: string;
  submitted_at: string;
  review_state: string;
  evidence_count: number;
  open_clarification_count: number;
  candidate_count: number;
  commitment_count: number;
}

export default function GovernmentReviewQueuePage() {
  const [items, setItems] = useState<ReviewQueueItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [districtFilter, setDistrictFilter] = useState("");
  const [domainFilter, setDomainFilter] = useState("");
  const [stateFilter, setStateFilter] = useState("");

  useEffect(() => {
    let isMounted = true;
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (districtFilter) params.append("district", districtFilter);
    if (domainFilter) params.append("domain", domainFilter);
    if (stateFilter) params.append("review_state", stateFilter);
    params.append("limit", "50");

    fetch(`/api/v1/government/review-queue?${params.toString()}`, { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (isMounted && data) {
          setItems(data.items || []);
          setTotal(data.total || 0);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [search, districtFilter, domainFilter, stateFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Queue Header */}
        <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-stone-900 tracking-tight">Government Review & Qualification Queue</h1>
            <p className="text-sm text-stone-600 mt-1">
              Audit societal challenges, examine citizen evidence, request clarifications, and route qualified innovation challenges.
            </p>
          </div>
          <div className="text-right text-xs font-semibold text-stone-500 bg-stone-50 p-3 rounded-lg border border-stone-200">
            Total Records in Queue: <span className="text-stone-900 font-bold text-base block">{total}</span>
          </div>
        </div>

        {/* Filters & Search Toolbar */}
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm space-y-3">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by challenge title or summary..."
                className="w-full px-3.5 py-2 bg-stone-50 border border-stone-300 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-stone-900 text-white rounded-lg text-xs font-bold hover:bg-stone-800 transition-colors"
            >
              Search
            </button>
          </form>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-stone-100 text-xs">
            <div>
              <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">District Filter</label>
              <select
                value={districtFilter}
                onChange={(e) => setDistrictFilter(e.target.value)}
                className="w-full p-2 bg-stone-50 border border-stone-300 rounded-md"
              >
                <option value="">All Districts</option>
                <option value="Ranchi">Ranchi</option>
                <option value="Dhanbad">Dhanbad</option>
                <option value="East Singhbhum">East Singhbhum</option>
                <option value="Hazaribagh">Hazaribagh</option>
                <option value="Bokaro">Bokaro</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">Domain Category</label>
              <select
                value={domainFilter}
                onChange={(e) => setDomainFilter(e.target.value)}
                className="w-full p-2 bg-stone-50 border border-stone-300 rounded-md"
              >
                <option value="">All Domains</option>
                <option value="WATER">WATER</option>
                <option value="ENERGY">ENERGY</option>
                <option value="HEALTHCARE">HEALTHCARE</option>
                <option value="AGRICULTURE">AGRICULTURE</option>
                <option value="INFRASTRUCTURE">INFRASTRUCTURE</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">Review Lifecycle State</label>
              <select
                value={stateFilter}
                onChange={(e) => setStateFilter(e.target.value)}
                className="w-full p-2 bg-stone-50 border border-stone-300 rounded-md"
              >
                <option value="">All States</option>
                <option value="UNREVIEWED">UNREVIEWED</option>
                <option value="AWAITING_CLARIFICATION">AWAITING_CLARIFICATION</option>
                <option value="INNOVATION_CHALLENGE">INNOVATION_CHALLENGE</option>
                <option value="SERVICE">SERVICE ROUTE</option>
                <option value="RESEARCH_REVIEW">RESEARCH REVIEW</option>
              </select>
            </div>
          </div>
        </div>

        {/* Queue Data Table */}
        {loading ? (
          <div className="flex justify-center py-16 text-stone-500 text-sm font-medium">
            <div className="w-5 h-5 border-2 border-amber-600 border-t-transparent rounded-full animate-spin mr-2"></div>
            Loading queue...
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-xl border border-stone-200 p-12 text-center text-stone-500 text-sm">
            No challenges found in queue matching criteria.
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-stone-100 text-stone-700 border-b border-stone-200 text-xs font-bold uppercase tracking-wider">
                    <th className="p-4">Challenge</th>
                    <th className="p-4">District & Domain</th>
                    <th className="p-4">Evidence</th>
                    <th className="p-4">Review State</th>
                    <th className="p-4">Submitted</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-stone-50/60 transition-colors">
                      <td className="p-4 max-w-sm">
                        <div className="font-bold text-stone-900 line-clamp-1">{item.title}</div>
                        <p className="text-xs text-stone-600 line-clamp-1 mt-0.5">{item.summary}</p>
                      </td>
                      <td className="p-4 text-xs font-medium text-stone-700 whitespace-nowrap">
                        <span className="font-semibold block">{item.district}</span>
                        <span className="text-amber-800 font-bold text-[10px] uppercase bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 inline-block mt-0.5">
                          {item.domain}
                        </span>
                      </td>
                      <td className="p-4 text-xs whitespace-nowrap">
                        <span className="font-semibold text-stone-800 block">{item.evidence_count} file(s)</span>
                        {item.open_clarification_count > 0 && (
                          <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 block mt-0.5">
                            {item.open_clarification_count} open query
                          </span>
                        )}
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <span className="bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold px-2.5 py-1 rounded-md">
                          {item.review_state.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="p-4 text-xs text-stone-500 whitespace-nowrap">
                        {new Date(item.submitted_at).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-right whitespace-nowrap">
                        <Link
                          href={`/app/review/${item.id}`}
                          className="px-3.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded text-xs font-bold transition-colors inline-block"
                        >
                          Review Workbench →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
