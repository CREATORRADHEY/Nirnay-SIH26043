"use client";

import { useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  FileText,
  FileCheck2,
  Users,
  ShieldCheck,
  TrendingUp,
  BarChart2,
  Bell,
  Settings,
  Search,
  ChevronDown,
  ArrowLeft,
  MapPin,
  Flame,
  Users2,
  ChevronLeft,
  Shield,
  Sparkles,
  CheckCircle2,
  Award,
  Zap,
  AlertTriangle,
  FileSpreadsheet,
  Check,
  ExternalLink,
} from "lucide-react";

export function ProductPreview() {
  const [activeTab, setActiveTab] = useState("Overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSidebar, setActiveSidebar] = useState("Dashboard");

  const sidebarNav = [
    { id: "Dashboard", label: "Dashboard", icon: LayoutDashboard, tab: "Overview" },
    { id: "Challenges", label: "Challenges", icon: FileText, tab: "Overview" },
    { id: "Evidence", label: "Evidence", icon: FileCheck2, tab: "Evidence" },
    { id: "HEI Matching", label: "HEI Matching", icon: Users, tab: "HEI Match" },
    { id: "Pilot Readiness", label: "Pilot Readiness", icon: ShieldCheck, tab: "Pilot Plan" },
    { id: "Monitoring", label: "Monitoring", icon: TrendingUp, tab: "Outcomes" },
    { id: "Reports", label: "Reports", icon: BarChart2, tab: "Outcomes" },
  ];

  const tabs = [
    "Overview",
    "Evidence",
    "Qualification",
    "HEI Match",
    "Pilot Plan",
    "Outcomes",
  ];

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    const matched = sidebarNav.find((s) => s.tab === tab);
    if (matched) setActiveSidebar(matched.id);
  };

  const handleSidebarClick = (item: (typeof sidebarNav)[0]) => {
    setActiveSidebar(item.id);
    setActiveTab(item.tab);
  };

  const matchSearch = (text: string) => {
    if (!searchQuery.trim()) return true;
    return text.toLowerCase().includes(searchQuery.toLowerCase().trim());
  };

  return (
    <div className="relative group">
      {/* Floating Accent Badges around Frame (POP EFFECT) */}
      <div className="absolute -top-3.5 left-8 z-30 hidden sm:flex items-center gap-1.5 px-3 py-1 bg-[#1C1917] text-white text-[11px] font-mono font-semibold rounded-full shadow-lg border border-stone-700">
        <Shield className="w-3.5 h-3.5 text-amber-500" />
        <span>Human Sign-off Authoritative</span>
      </div>

      <div className="absolute -bottom-3 right-8 z-30 hidden sm:flex items-center gap-1.5 px-3 py-1 bg-white text-emerald-800 text-[11px] font-mono font-semibold rounded-full shadow-lg border border-emerald-200">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
        <span>100% Traceable Evidence Dossier</span>
      </div>

      <div className="absolute top-1/2 -right-3 z-30 hidden xl:flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-900 text-[10px] font-mono font-bold rounded-full shadow-md border border-amber-300 rotate-90 origin-right">
        <Sparkles className="w-3 h-3 text-amber-600" />
        <span>AI ADVISORY ONLY</span>
      </div>

      {/* Main 3D Tilted Card Shell */}
      <div className="w-full bg-white rounded-2xl border-2 border-stone-200/90 shadow-2xl shadow-stone-900/15 overflow-hidden text-[#1C1917] transform lg:-rotate-1 group-hover:rotate-0 transition-all duration-500 ease-out font-sans">
        <div className="flex min-h-[500px]">
          {/* Left Sidebar */}
          <div className="w-40 sm:w-44 bg-[#FAF8F5] border-r border-stone-200 p-3 flex flex-col justify-between shrink-0">
            <div>
              {/* Top Logo & Title */}
              <div className="flex items-center justify-between px-1 mb-4">
                <div className="flex items-center gap-1.5">
                  <img src="/logo-icon.png" alt="NIRNAY" className="w-5 h-5 object-contain shrink-0 rounded-md" />
                  <span className="font-serif font-bold text-xs text-[#1C1917]">NIRNAY</span>
                </div>
                <button className="text-stone-400 hover:text-stone-700 p-0.5">
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Navigation Items */}
              <nav className="space-y-1">
                {sidebarNav.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSidebar === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSidebarClick(item)}
                      className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        isActive
                          ? "bg-[#FFF4EE] text-[#EA580C] shadow-xs"
                          : "text-stone-600 hover:bg-stone-200/50 hover:text-stone-900"
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-[#EA580C]" : "text-stone-500"}`} />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Bottom Sidebar Controls */}
            <div className="pt-3 border-t border-stone-200 space-y-1">
              <button className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-medium text-stone-600 hover:bg-stone-200/50 transition-colors">
                <div className="flex items-center gap-2 truncate">
                  <Bell className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                  <span className="truncate">Notifications</span>
                </div>
                <span className="w-4 h-4 rounded-full bg-[#EA580C] text-white font-mono text-[9px] font-bold flex items-center justify-center shrink-0">
                  3
                </span>
              </button>

              <button className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-medium text-stone-600 hover:bg-stone-200/50 transition-colors">
                <Settings className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                <span>Settings</span>
              </button>
            </div>
          </div>

          {/* Main Workspace Frame */}
          <div className="flex-1 flex flex-col bg-white overflow-x-hidden min-w-0">
            {/* Top Navigation & Search Header */}
            <div className="border-b border-stone-200 px-3.5 py-2.5 flex items-center justify-between gap-3 bg-[#FAF8F5]/80 backdrop-blur-xs">
              {/* Search Input */}
              <div className="flex items-center gap-2 bg-white px-2.5 py-1.5 rounded-lg border border-stone-200 text-xs w-52 sm:w-60 focus-within:border-[#EA580C] shadow-2xs">
                <Search className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Ranchi, Water, BIT Mesra..."
                  className="w-full bg-transparent border-none outline-none text-xs text-stone-800 placeholder-stone-400 p-0"
                />
              </div>

              {/* Right User Status */}
              <div className="flex items-center gap-2.5">
                <button className="relative p-1 rounded-full text-stone-500 hover:bg-stone-100">
                  <Bell className="w-4 h-4" />
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-500" />
                </button>

                <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-xl border border-stone-200 shadow-2xs">
                  <div className="w-6 h-6 rounded-full bg-[#F2EFE9] text-stone-700 font-bold text-[11px] flex items-center justify-center font-mono shrink-0">
                    AS
                  </div>
                  <div className="text-left hidden sm:block">
                    <div className="text-[11px] font-bold text-stone-900 leading-none">Ananya Singh</div>
                    <div className="text-[9px] text-stone-500 font-medium leading-tight mt-0.5">Government of Jharkhand</div>
                  </div>
                  <ChevronDown className="w-3 h-3 text-stone-400 shrink-0" />
                </div>
              </div>
            </div>

            {/* Main Content Workspace */}
            <div className="p-4 space-y-3.5 overflow-x-hidden flex-1 bg-white">
              {/* Breadcrumb Link */}
              <div className="flex items-center justify-between">
                <Link
                  href="/app/challenges"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-stone-500 hover:text-[#EA580C] transition-colors"
                >
                  <ArrowLeft className="w-3 h-3" /> Back to Challenges
                </Link>

                {searchQuery.trim() && (
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 bg-amber-100 text-amber-900 rounded border border-amber-300">
                    🔍 Filtered by: &quot;{searchQuery}&quot;
                  </span>
                )}
              </div>

              {/* Challenge Header Row */}
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h2 className="font-serif text-lg sm:text-xl font-bold text-[#1C1917] tracking-tight leading-snug">
                    Sustainable Water Management for Semi-Urban Towns
                  </h2>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-2 py-0.5 text-[10px] font-mono font-semibold text-stone-500">
                    CHG-2026-0042
                  </span>
                  <span className="px-2.5 py-0.5 text-[11px] font-medium rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1">
                    Under Review <ChevronDown className="w-3 h-3 text-emerald-600" />
                  </span>
                </div>
              </div>

              {/* Location & Tag Pills */}
              <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                <span className={`px-2.5 py-0.5 rounded-md text-stone-700 border border-stone-200 font-medium inline-flex items-center gap-1 ${matchSearch("Ranchi") ? "bg-amber-100 text-amber-900 border-amber-300 font-bold" : "bg-[#FAF8F5]"}`}>
                  <MapPin className="w-3 h-3 text-[#EA580C]" /> Ranchi, Jharkhand
                </span>
                <span className={`px-2 py-0.5 rounded-full border text-emerald-800 border-emerald-200 font-medium ${matchSearch("Environment") ? "bg-emerald-200 font-bold" : "bg-emerald-50"}`}>
                  Environment
                </span>
                <span className={`px-2 py-0.5 rounded-full border text-sky-800 border-sky-200 font-medium ${matchSearch("Urban") ? "bg-sky-200 font-bold" : "bg-sky-50"}`}>
                  Urban Development
                </span>
                <span className={`px-2 py-0.5 rounded-full border text-amber-800 border-amber-200 font-medium ${matchSearch("Water") ? "bg-amber-200 font-bold" : "bg-amber-50"}`}>
                  Sustainability
                </span>
                <span className="px-2 py-0.5 rounded-full bg-orange-50 text-orange-800 border border-orange-200 font-medium">
                  Citizen Reported
                </span>
              </div>

              {/* Navigation Tabs */}
              <div className="border-b border-stone-200 flex gap-4 overflow-x-auto pb-0 scrollbar-none">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => handleTabChange(tab)}
                    className={`pb-2 text-xs font-medium whitespace-nowrap transition-colors border-b-2 -mb-px cursor-pointer ${
                      activeTab === tab
                        ? "border-[#EA580C] text-[#EA580C] font-semibold"
                        : "border-transparent text-stone-500 hover:text-stone-800"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* DYNAMIC CONTENT PANELS (Updates based on activeTab & searchQuery) */}

              {/* TAB 1: OVERVIEW */}
              {activeTab === "Overview" && (
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-3.5 animate-fadeIn">
                  {/* Left Column */}
                  <div className="xl:col-span-4 p-3.5 rounded-xl border border-stone-200/90 bg-[#FAF8F5]/70 shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-stone-900 mb-2">
                        <FileText className="w-3.5 h-3.5 text-[#EA580C]" /> Challenge Summary
                      </div>
                      <p className="text-[11px] text-stone-600 leading-relaxed font-normal">
                        Growing water stress in semi-urban towns due to increasing demand, inefficient usage and lack of decentralized management systems. Need scalable, low-cost solutions for water conservation and reuse in Ranchi.
                      </p>
                    </div>

                    <div className="pt-3 mt-3 border-t border-stone-200/80 space-y-1.5 text-[10px] text-stone-500 font-medium">
                      <div className="flex items-center justify-between">
                        <span>Reported by:</span>
                        <strong className="text-stone-800 font-semibold">State Department / Citizen</strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Date:</span>
                        <strong className="text-stone-800 font-semibold">12 Aug 2025</strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Location:</span>
                        <strong className="text-stone-800 font-semibold">Ranchi, Jharkhand</strong>
                      </div>
                    </div>
                  </div>

                  {/* Middle Column */}
                  <div className="xl:col-span-5 p-3.5 rounded-xl border border-stone-200/90 bg-white shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-xs font-bold text-stone-900 mb-2">
                        <span>Progress to Pilot</span>
                        <span className="text-[10px] font-mono font-normal text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          4 of 6 complete
                        </span>
                      </div>

                      {/* Stepper */}
                      <div className="grid grid-cols-6 gap-1 text-center my-3">
                        <div className="flex flex-col items-center">
                          <div className="w-3.5 h-3.5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[8px] font-bold">✓</div>
                          <span className="text-[9px] font-bold text-stone-800 mt-1 leading-tight">Submitted</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="w-3.5 h-3.5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[8px] font-bold">✓</div>
                          <span className="text-[9px] font-bold text-stone-800 mt-1 leading-tight">Evidence</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="w-3.5 h-3.5 rounded-full bg-[#EA580C] text-white flex items-center justify-center text-[8px] font-bold">•</div>
                          <span className="text-[9px] font-bold text-[#EA580C] mt-1 leading-tight">Qualified</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="w-3.5 h-3.5 rounded-full bg-stone-200 mt-0.5" />
                          <span className="text-[9px] font-medium text-stone-400 mt-1 leading-tight">HEI Match</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="w-3.5 h-3.5 rounded-full bg-stone-200 mt-0.5" />
                          <span className="text-[9px] font-medium text-stone-400 mt-1 leading-tight">Pilot Plan</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="w-3.5 h-3.5 rounded-full bg-stone-200 mt-0.5" />
                          <span className="text-[9px] font-medium text-stone-400 mt-1 leading-tight">Outcome</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200 flex items-center justify-between gap-2.5 mt-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                          <Users className="w-3 h-3" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-[10px] font-bold text-stone-900 leading-tight truncate">2 HEIs interested in collaborating</div>
                          <div className="text-[8px] text-stone-600 leading-tight truncate">BIT Mesra & NIT Jamshedpur</div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleTabChange("HEI Match")}
                        className="px-2.5 py-1 text-[9px] font-bold text-[#EA580C] border border-[#EA580C] bg-white rounded-full hover:bg-[#EA580C] hover:text-white transition-colors shrink-0 whitespace-nowrap cursor-pointer"
                      >
                        View Matches
                      </button>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="xl:col-span-3 p-3.5 rounded-xl border border-stone-200/90 bg-[#FAF8F5]/70 shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="text-xs font-bold text-stone-900 mb-2.5 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#EA580C]" /> Key Details
                      </div>

                      <div className="space-y-2 text-[11px]">
                        <div className="flex items-center justify-between gap-2 pb-1 border-b border-stone-200/60">
                          <span className="text-stone-500 font-medium">Category</span>
                          <span className="font-bold text-stone-800">Environment</span>
                        </div>
                        <div className="flex items-center justify-between gap-2 pb-1 border-b border-stone-200/60">
                          <span className="text-stone-500 font-medium">Geography</span>
                          <span className="font-bold text-stone-800">Semi-Urban</span>
                        </div>
                        <div className="flex items-center justify-between gap-2 pb-1 border-b border-stone-200/60">
                          <span className="text-stone-500 font-medium">Priority</span>
                          <span className="font-bold text-amber-700 inline-flex items-center gap-1">
                            <Flame className="w-3 h-3 text-amber-600 fill-current shrink-0" /> High
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-2 pb-1 border-b border-stone-200/60">
                          <span className="text-stone-500 font-medium">People Affected</span>
                          <span className="font-bold text-stone-800 inline-flex items-center gap-1">
                            <Users2 className="w-3 h-3 text-stone-500 shrink-0" /> ~125,000
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: EVIDENCE */}
              {activeTab === "Evidence" && (
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-3.5 animate-fadeIn">
                  <div className="xl:col-span-5 p-3.5 rounded-xl border border-stone-200 bg-white shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                        <FileCheck2 className="w-4 h-4 text-emerald-600" /> Evidence Dossier (3 Records)
                      </span>
                      <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">100% VERIFIED</span>
                    </div>
                    <div className="space-y-2 text-[11px]">
                      <div className="p-2 bg-stone-50 rounded-lg border border-stone-200 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-stone-800">Hydro-geological Survey PDF</div>
                          <div className="text-[10px] text-stone-500">Ranchi Municipal Board • 3.2 MB</div>
                        </div>
                        <span className="text-emerald-700 font-bold text-[10px]">HASH VERIFIED</span>
                      </div>
                      <div className="p-2 bg-stone-50 rounded-lg border border-stone-200 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-stone-800">Fluoride Lab Test Results</div>
                          <div className="text-[10px] text-stone-500">BIT Mesra Water Lab • 1.1 MB</div>
                        </div>
                        <span className="text-emerald-700 font-bold text-[10px]">HASH VERIFIED</span>
                      </div>
                    </div>
                  </div>

                  <div className="xl:col-span-7 p-3.5 rounded-xl border border-stone-200 bg-[#FAF8F5] shadow-xs space-y-2.5">
                    <div className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                      <Shield className="w-4 h-4 text-amber-600" /> Empirical Baseline Data
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                      <div className="p-2 bg-white rounded-lg border border-stone-200">
                        <span className="block text-stone-500 text-[10px]">Fluoride Level</span>
                        <span className="text-base font-extrabold text-stone-900 font-mono">3.2 mg/L</span>
                      </div>
                      <div className="p-2 bg-white rounded-lg border border-stone-200">
                        <span className="block text-stone-500 text-[10px]">Baseline Affected</span>
                        <span className="text-base font-extrabold text-stone-900 font-mono">41%</span>
                      </div>
                      <div className="p-2 bg-white rounded-lg border border-stone-200">
                        <span className="block text-stone-500 text-[10px]">Sample Size</span>
                        <span className="text-base font-extrabold text-stone-900 font-mono">240 Wells</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: QUALIFICATION */}
              {activeTab === "Qualification" && (
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-3.5 animate-fadeIn">
                  <div className="xl:col-span-6 p-3.5 rounded-xl border border-amber-200 bg-amber-50/50 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-amber-600" /> Problem Qualification Assessment
                      </span>
                      <span className="text-xs font-bold text-amber-800 bg-amber-200 px-2.5 py-0.5 rounded-full font-mono">SCORE: 88/100</span>
                    </div>
                    <div className="space-y-2 text-[11px] text-stone-700">
                      <div className="flex justify-between border-b border-amber-200/60 pb-1">
                        <span>Qualification Route:</span>
                        <strong className="text-stone-900">INNOVATION_CHALLENGE</strong>
                      </div>
                      <div className="flex justify-between border-b border-amber-200/60 pb-1">
                        <span>Evaluated by:</span>
                        <strong className="text-stone-900">Ananya Singh (State Nodal Reviewer)</strong>
                      </div>
                      <div className="flex justify-between border-b border-amber-200/60 pb-1">
                        <span>Decision Date:</span>
                        <strong className="text-stone-900">14 Aug 2025</strong>
                      </div>
                      <p className="text-[10px] text-stone-600 italic mt-2">
                        &quot;Qualified for state-supported pilot testing under Urban Water Sanitation Initiative.&quot;
                      </p>
                    </div>
                  </div>

                  <div className="xl:col-span-6 p-3.5 rounded-xl border border-stone-200 bg-white shadow-xs space-y-2.5">
                    <div className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-[#EA580C]" /> Strategic Alignment & Feasibility
                    </div>
                    <div className="space-y-1.5 text-[11px]">
                      <div className="p-2 bg-stone-50 rounded border border-stone-200 flex justify-between">
                        <span>Public Impact Potential</span>
                        <span className="font-bold text-emerald-700">High (125k citizens)</span>
                      </div>
                      <div className="p-2 bg-stone-50 rounded border border-stone-200 flex justify-between">
                        <span>Policy Mandate</span>
                        <span className="font-bold text-stone-800">State Water Mission 2026</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: HEI MATCH */}
              {activeTab === "HEI Match" && (
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-3.5 animate-fadeIn">
                  <div className="xl:col-span-7 p-3.5 rounded-xl border border-stone-200 bg-white shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-[#EA580C]" /> Matched Higher Education Institutions
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">2 MATCHES FOUND</span>
                    </div>

                    <div className="space-y-2 text-[11px]">
                      <div className="p-2.5 rounded-xl border border-emerald-300 bg-emerald-50/40 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-stone-900 flex items-center gap-1.5">
                            Birla Institute of Technology, Mesra (BIT Mesra)
                            <span className="text-[9px] bg-emerald-600 text-white px-1.5 py-0.2 rounded font-mono font-bold">MATCH 96%</span>
                          </div>
                          <div className="text-[10px] text-stone-600 mt-0.5">Faculty: Prof. A. K. Roy • Hydro-geological Lab Facility</div>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-800 bg-white px-2 py-1 rounded border border-emerald-300">PLEDGED v1</span>
                      </div>

                      <div className="p-2.5 rounded-xl border border-stone-200 bg-stone-50 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-stone-800">NIT Jamshedpur (Environmental Eng. Dept)</div>
                          <div className="text-[10px] text-stone-500 mt-0.5">Specialized Water Distillation Testing Rig</div>
                        </div>
                        <span className="text-[10px] font-medium text-stone-600 bg-white px-2 py-1 rounded border border-stone-300">SHORTLISTED</span>
                      </div>
                    </div>
                  </div>

                  <div className="xl:col-span-5 p-3.5 rounded-xl border border-stone-200 bg-[#FAF8F5] shadow-xs space-y-2.5">
                    <div className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                      <FileSpreadsheet className="w-4 h-4 text-amber-600" /> Institutional Commitment Pledges
                    </div>
                    <div className="p-2.5 bg-white rounded-lg border border-stone-200 space-y-1.5 text-[11px]">
                      <div className="font-bold text-stone-800">BIT Mesra Resource Pledge:</div>
                      <div className="text-[10px] text-stone-600">Pledges Water Quality Testing Rig + 2 Research Scholars for 6-month pilot duration.</div>
                      <div className="text-[9px] font-mono text-emerald-700 font-semibold pt-1 border-t border-stone-100 flex items-center justify-between">
                        <span>Status: ACCEPTED (v1)</span>
                        <span className="text-stone-400">Dr. Ramesh Sharma</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: PILOT PLAN */}
              {activeTab === "Pilot Plan" && (
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-3.5 animate-fadeIn">
                  <div className="xl:col-span-6 p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/40 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" /> Pilot Authorization & Readiness
                      </span>
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-200 px-2.5 py-0.5 rounded-full font-mono">PILOT_READY v1</span>
                    </div>

                    <div className="space-y-2 text-[11px] text-stone-700">
                      <div className="flex justify-between border-b border-emerald-200 pb-1">
                        <span>Environmental Safety Clearance:</span>
                        <strong className="text-emerald-800 font-bold">APPROVED</strong>
                      </div>
                      <div className="flex justify-between border-b border-emerald-200 pb-1">
                        <span>Municipal Field Access:</span>
                        <strong className="text-emerald-800 font-bold">GRANTED</strong>
                      </div>
                      <div className="flex justify-between border-b border-emerald-200 pb-1">
                        <span>Institutional Commitment:</span>
                        <strong className="text-emerald-800 font-bold">BIT Mesra (ACTIVE)</strong>
                      </div>
                    </div>
                  </div>

                  <div className="xl:col-span-6 p-3.5 rounded-xl border border-stone-200 bg-white shadow-xs space-y-2.5">
                    <div className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-amber-600" /> 60-Day Field Pilot Execution Plan
                    </div>
                    <div className="space-y-1.5 text-[11px]">
                      <div className="p-2 bg-stone-50 rounded border border-stone-200 flex justify-between items-center">
                        <div>
                          <div className="font-bold text-stone-800">Phase 1: Distillation Rig Setup</div>
                          <div className="text-[10px] text-stone-500">Days 1–15 • Ward 12 Ranchi</div>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-700">COMPLETE ✓</span>
                      </div>
                      <div className="p-2 bg-stone-50 rounded border border-stone-200 flex justify-between items-center">
                        <div>
                          <div className="font-bold text-stone-800">Phase 2: Water Quality Monitoring</div>
                          <div className="text-[10px] text-stone-500">Days 16–45 • 240 Household Wells</div>
                        </div>
                        <span className="text-[10px] font-bold text-amber-700">IN PROGRESS</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: OUTCOMES */}
              {activeTab === "Outcomes" && (
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-3.5 animate-fadeIn">
                  <div className="xl:col-span-6 p-3.5 rounded-xl border border-stone-200 bg-white shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                        <BarChart2 className="w-4 h-4 text-[#EA580C]" /> Outcome Evaluation Report
                      </span>
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded font-mono">VALIDATED</span>
                    </div>

                    <div className="space-y-2 text-[11px]">
                      <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-200 space-y-1">
                        <div className="font-bold text-emerald-900">Fluoride Reduction Results:</div>
                        <div className="text-[10px] text-emerald-800">
                          Baseline Fluoride: <strong>3.2 mg/L</strong> $\rightarrow$ Post-Pilot Fluoride: <strong>0.8 mg/L</strong> (Target: &lt; 1.5 mg/L achieved).
                        </div>
                      </div>

                      <div className="p-2 bg-stone-50 rounded border border-stone-200 text-[10px] space-y-1">
                        <div className="font-bold text-stone-800">Integrity Principle Enforced:</div>
                        <div className="text-stone-600">
                          Execution Completion (`COMPLETED`) is strictly separated from Impact Verification (`VALIDATED`). Human sign-off completed by State Nodal Reviewer.
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="xl:col-span-6 p-3.5 rounded-xl border border-stone-200 bg-[#FAF8F5] shadow-xs space-y-2.5">
                    <div className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-emerald-600" /> Scalability & Public Passport
                    </div>
                    <div className="p-2.5 bg-white rounded-lg border border-stone-200 space-y-2 text-[11px]">
                      <div className="flex items-center justify-between">
                        <span>State Deployment Recommendation:</span>
                        <strong className="text-emerald-700 font-bold">APPROVED FOR SCALING</strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Public Passport ID:</span>
                        <strong className="font-mono text-stone-800">NIRNAY-PASSPORT-0042</strong>
                      </div>
                      <div className="pt-2 border-t border-stone-100 flex justify-end">
                        <Link
                          href="/app/outcomes"
                          className="px-3 py-1 bg-[#EA580C] text-white font-bold text-[10px] rounded-lg hover:bg-[#C2410C] transition-colors inline-flex items-center gap-1"
                        >
                          <span>View Full Passport</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
