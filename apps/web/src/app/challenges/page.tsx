"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  FileText,
  Filter,
  RotateCcw,
  Plus,
  MapPin,
  Tag,
  Calendar,
  ArrowRight,
  Search,
  AlertCircle,
  Sparkles,
} from "lucide-react";

import { ProductShell } from "@/components/shell/ProductShell";
import { fetchChallenges } from "@/lib/api";
import { ChallengeListItem } from "@/lib/types/challenge";

export default function ChallengeExplorerPage() {
  const [challenges, setChallenges] = useState<ChallengeListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDemo, setIsDemo] = useState(false);

  // Filter states
  const [districtFilter, setDistrictFilter] = useState("");
  const [domainFilter, setDomainFilter] = useState("");
  const [sourceTypeFilter, setSourceTypeFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Submit modal placeholder state
  const [showSubmitNotice, setShowSubmitNotice] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchChallenges({
          district: districtFilter || undefined,
          domain: domainFilter || undefined,
          source_type: sourceTypeFilter || undefined,
        });
        if (isMounted) {
          setChallenges(res.data.items);
          setIsDemo(res.isDemo);
        }
      } catch {
        if (isMounted) {
          setError("Failed to connect to Challenge service.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [districtFilter, domainFilter, sourceTypeFilter]);

  // Client-side text search filtering
  const filteredChallenges = useMemo(() => {
    if (!searchQuery.trim()) return challenges;
    const q = searchQuery.toLowerCase();
    return challenges.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.summary.toLowerCase().includes(q) ||
        c.district.toLowerCase().includes(q) ||
        c.domain.toLowerCase().includes(q)
    );
  }, [challenges, searchQuery]);

  const handleResetFilters = () => {
    setDistrictFilter("");
    setDomainFilter("");
    setSourceTypeFilter("");
    setSearchQuery("");
  };

  const hasActiveFilters =
    districtFilter || domainFilter || sourceTypeFilter || searchQuery;

  return (
    <ProductShell isDemo={isDemo}>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[var(--border)] pb-6">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--primary)]">
              CHALLENGE EXPLORER
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight text-[var(--text-primary)] mt-1">
              Real problems. Structured for action.
            </h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1.5 max-w-2xl leading-relaxed">
              Explore societal challenges captured with evidence, context and
              traceable decision history.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSubmitNotice(true)}
              className="px-4 py-2.5 rounded bg-[var(--primary)] text-white text-xs font-semibold hover:bg-[var(--primary-hover)] transition-colors shadow-sm inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Submit Challenge
            </button>
          </div>
        </div>

        {/* Demo Data Notice Banner if Fallback Active */}
        {isDemo && (
          <div className="p-3 rounded-lg bg-[#FFF4EE] border border-[#FCD8C5] flex items-center justify-between text-xs text-[var(--text-primary)]">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[var(--primary)]" />
              <span>
                <strong className="font-semibold">DEMO DATA ACTIVE:</strong> Showing synthetic Jharkhand challenge records for evaluation.
              </span>
            </div>
            <span className="font-mono text-[10px] bg-[#E8E4D9] px-2 py-0.5 rounded text-[var(--text-secondary)]">
              API OFFLINE FALLBACK
            </span>
          </div>
        )}

        {/* Submit Challenge Modal Notice */}
        {showSubmitNotice && (
          <div className="p-4 rounded-lg bg-[var(--surface)] border border-[var(--primary)] shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[var(--primary)] uppercase tracking-wider">
                Intake Submission Wizard
              </span>
              <button
                onClick={() => setShowSubmitNotice(false)}
                className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                Close ✕
              </button>
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              The Challenge Intake & Evidence Upload Wizard will be enabled in the upcoming intake phase. Currently browsing structured factual records.
            </p>
          </div>
        )}

        {/* Filter Bar (Horizontal desktop row, stacked mobile) */}
        <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] space-y-3">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider">
              <Filter className="w-4 h-4 text-[var(--primary)]" />
              <span>Filters</span>
            </div>

            {/* Filter Dropdowns */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-1 lg:max-w-2xl">
              {/* District Filter */}
              <select
                value={districtFilter}
                onChange={(e) => setDistrictFilter(e.target.value)}
                className="px-3 py-1.5 text-xs rounded bg-[var(--background)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
              >
                <option value="">All Districts</option>
                <option value="Ranchi">Ranchi</option>
                <option value="East Singhbhum">East Singhbhum</option>
                <option value="West Singhbhum">West Singhbhum</option>
                <option value="Dhanbad">Dhanbad</option>
              </select>

              {/* Domain Filter */}
              <select
                value={domainFilter}
                onChange={(e) => setDomainFilter(e.target.value)}
                className="px-3 py-1.5 text-xs rounded bg-[var(--background)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
              >
                <option value="">All Domains</option>
                <option value="Environment">Environment</option>
                <option value="Agriculture">Agriculture</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Rural Economy">Rural Economy</option>
              </select>

              {/* Source Type Filter */}
              <select
                value={sourceTypeFilter}
                onChange={(e) => setSourceTypeFilter(e.target.value)}
                className="px-3 py-1.5 text-xs rounded bg-[var(--background)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
              >
                <option value="">All Source Types</option>
                <option value="Citizen Reported">Citizen Reported</option>
                <option value="Government Portal">Government Portal</option>
                <option value="NGO Survey">NGO Survey</option>
                <option value="Community Representation">Community Representation</option>
              </select>
            </div>

            {/* Text Search Box */}
            <div className="relative min-w-[200px]">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[var(--text-secondary)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search title/text..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded bg-[var(--background)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
              />
            </div>

            {/* Reset Button */}
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="px-3 py-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--primary)] inline-flex items-center gap-1 font-medium transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Content States */}
        {loading ? (
          /* Loading Skeleton State */
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="p-5 rounded-xl border border-[var(--border)] bg-[var(--surface)] animate-pulse space-y-3"
              >
                <div className="h-4 bg-[#E8E4D9] rounded w-1/3" />
                <div className="h-3 bg-[#E8E4D9] rounded w-3/4" />
                <div className="flex gap-2">
                  <div className="h-5 bg-[#E8E4D9] rounded w-16" />
                  <div className="h-5 bg-[#E8E4D9] rounded w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          /* Error State with Retry */
          <div className="p-8 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-center space-y-4">
            <AlertCircle className="w-8 h-8 text-amber-600 mx-auto" />
            <div>
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                Challenges could not be loaded
              </h3>
              <p className="text-xs text-[var(--text-secondary)] mt-1">{error}</p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded bg-[var(--primary)] text-white text-xs font-semibold hover:bg-[var(--primary-hover)] transition-colors"
            >
              Retry Connection
            </button>
          </div>
        ) : filteredChallenges.length === 0 ? (
          /* Empty Filter State */
          <div className="p-12 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-center space-y-3">
            <FileText className="w-10 h-10 text-[var(--text-secondary)] mx-auto opacity-50" />
            <h3 className="text-base font-bold text-[var(--text-primary)]">
              No challenges match these filters
            </h3>
            <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto">
              Try broadening your district, domain, or search query selection.
            </p>
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 rounded bg-[#F4F1EA] text-[var(--text-primary)] border border-[var(--border)] text-xs font-semibold hover:bg-[#E8E4D9] transition-colors"
              >
                Clear All Filters
              </button>
            )}
          </div>
        ) : (
          /* Editorial Challenge List */
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] px-1">
              <span>Showing {filteredChallenges.length} challenge records</span>
              <span className="font-mono">Sort: Latest First</span>
            </div>

            <div className="divide-y divide-[var(--border)] rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
              {filteredChallenges.map((challenge) => (
                <div
                  key={challenge.id}
                  className="p-5 sm:p-6 hover:bg-[#FDFBF7] transition-colors space-y-3 group"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-secondary)]">
                        <span className="font-mono text-[11px] font-semibold text-[var(--primary)]">
                          ID: {challenge.id.slice(0, 13)}...
                        </span>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
                          {challenge.district}, {challenge.state}
                        </span>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
                          {new Date(challenge.created_at).toLocaleDateString("en-IN", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>

                      <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)] group-hover:text-[var(--primary)] transition-colors">
                        <Link href={`/challenges/${challenge.id}`}>
                          {challenge.title}
                        </Link>
                      </h2>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="px-2.5 py-0.5 text-[10px] font-mono font-medium rounded-full bg-[#EBF5EE] text-[#166534] border border-[#C6E7D0]">
                        FACTUAL RECORD
                      </span>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                    {challenge.summary}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <div className="flex flex-wrap gap-1.5">
                      <span className="px-2.5 py-0.5 text-xs rounded bg-[#F4F1EA] text-[var(--text-secondary)] border border-[var(--border)] font-medium inline-flex items-center gap-1">
                        <Tag className="w-3 h-3 text-[var(--primary)]" />
                        {challenge.domain}
                      </span>
                      <span className="px-2.5 py-0.5 text-xs rounded bg-[#F4F1EA] text-[var(--text-secondary)] border border-[var(--border)] font-medium">
                        {challenge.source_type}
                      </span>
                    </div>

                    <Link
                      href={`/challenges/${challenge.id}`}
                      className="text-xs font-semibold text-[var(--primary)] hover:underline inline-flex items-center gap-1"
                    >
                      View Passport <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ProductShell>
  );
}
