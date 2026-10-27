"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { NationalSummary, StateSummary, ValidationFlag } from "@/lib/types";
import { formatMaskedApaar } from "@/lib/security";
import { useLanguage } from "@/components/LanguageProvider";
import {
  Search,
  RotateCw,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  ShieldAlert,
  Zap,
} from "lucide-react";

interface Props {
  isDemo: boolean;
  initialNational: NationalSummary;
  initialStates: StateSummary[];
  initialFlags: ValidationFlag[];
}

export default function AICTEControlTowerClient({
  initialNational,
  initialStates,
  initialFlags,
}: Props) {
  const { t } = useLanguage();
  const [national, setNational] = useState(initialNational);
  const [states, setStates] = useState(initialStates);
  const [flags, setFlags] = useState(initialFlags);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSeverity, setSelectedSeverity] = useState<string>("ALL");
  const [selectedRuleCode, setSelectedRuleCode] = useState<string>("ALL");
  const [selectedStateFilter, setSelectedStateFilter] = useState<string>("ALL");
  const [activeTab, setActiveTab] = useState<"states" | "categories" | "both">("both");
  const [expandedFlagId, setExpandedFlagId] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [, startTransition] = useTransition();

  // SIH 2026 Live Simulation State
  const [simulationMode, setSimulationMode] = useState<"idle" | "cross_state" | "quota_breach">("idle");
  const [isSimulating, setIsSimulating] = useState(false);

  const handleSimulateCrossState = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setSimulationMode("cross_state");
      setExpandedFlagId("sim-flag-dup");
      setIsSimulating(false);
    }, 350);
  };

  const handleSimulateQuotaBreach = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setSimulationMode("quota_breach");
      setExpandedFlagId("sim-flag-quota");
      setIsSimulating(false);
    }, 350);
  };

  const handleResetSimulation = () => {
    setSimulationMode("idle");
    setExpandedFlagId(null);
  };

  const handleRefresh = async () => {
    try {
      setIsRunning(true);
      const [resNat, resStates, resFlags] = await Promise.all([
        fetch("/api/dashboard/national").then((r) => r.json()),
        fetch("/api/dashboard/state").then((r) => r.json()),
        fetch("/api/flags").then((r) => r.json()),
      ]);

      startTransition(() => {
        setNational(resNat);
        setStates(resStates);
        setFlags(resFlags);
      });
    } catch (err) {
      console.error("Refresh failed:", err);
    } finally {
      setIsRunning(false);
    }
  };

  const handleRunIntegrity = async () => {
    setIsRunning(true);
    try {
      await fetch("/api/integrity/run", { method: "POST" });
      await handleRefresh();
    } finally {
      setIsRunning(false);
    }
  };

  // Simulated Flag Definitions for Live Hackathon Jury Testing
  const simulatedCrossStateFlag: ValidationFlag = {
    id: "sim-flag-dup",
    student_id: "stu-sim-020",
    institution_id: "inst-1001",
    rule_code: "DUPLICATE_ENROLMENT",
    severity: "critical",
    title: "Cross-State Concurrent Admission Detected",
    explanation:
      "APAAR ID 1000 0000 0020 concurrently claimed by COEP Pune (Maharashtra, CAP Round 1) and RVCE Bengaluru (Karnataka, KEA Quota) with overlapping enrolment timestamps.",
    recommended_action:
      "Execute AICTE APH Clause 12.4 notice. Reclaim double-allotted seat and notify Maharashtra DTE and Karnataka KEA counseling authorities.",
    status: "open",
    created_at: new Date().toISOString(),
    students: {
      id: "stu-sim-020",
      full_name: "Rahul S. Verma",
      institutional_student_id: "2026-COEP-CS-042",
      apaar_id: "100000000020",
      integrity_score: 32,
    },
    institutions: {
      id: "inst-1001",
      name: "Government College of Engineering, Pune (COEP)",
      state: "Maharashtra",
      aicte_code: "1-3327145",
    },
  };

  const simulatedQuotaFlag: ValidationFlag = {
    id: "sim-flag-quota",
    student_id: "stu-sim-nri",
    institution_id: "inst-1003",
    rule_code: "INTAKE_LIMIT_EXCEEDED",
    severity: "critical",
    title: "Supernumerary NRI Quota Exceeded (126.7% Capacity)",
    explanation:
      "Apex Institute of Technology, Mumbai has enrolled 19 NRI students against an approved statutory ceiling of 15 seats without Council extension approval.",
    recommended_action:
      "Issue immediate show-cause notice under AICTE Act Section 10(k); freeze candidate portal registration for excess admissions.",
    status: "open",
    created_at: new Date().toISOString(),
    students: {
      id: "stu-sim-nri",
      full_name: "Tanya M. Mehta (Batch Intake)",
      institutional_student_id: "2026-NRI-BATCH-019",
      apaar_id: "100000000099",
      integrity_score: 45,
    },
    institutions: {
      id: "inst-1003",
      name: "Apex Institute of Technology, Mumbai",
      state: "Maharashtra",
      aicte_code: "1-1003921",
    },
  };

  const activeFlags: ValidationFlag[] =
    simulationMode === "cross_state"
      ? [simulatedCrossStateFlag, ...flags.filter((f) => f.id !== "sim-flag-dup")]
      : simulationMode === "quota_breach"
      ? [simulatedQuotaFlag, ...flags.filter((f) => f.id !== "sim-flag-quota")]
      : flags;

  // Dynamic calculations for visualizations
  const totalStudents = national.total_students || 1;
  const verifiedCount =
    simulationMode === "cross_state"
      ? Math.max(0, (national.verified_students || 0) - 1)
      : national.verified_students || 0;
  const flaggedCount =
    simulationMode !== "idle"
      ? (national.flagged_students || 0) + 1
      : national.flagged_students || 0;
  const verifiedPct = Math.round((verifiedCount / totalStudents) * 100);
  const flaggedPct = Math.round((flaggedCount / totalStudents) * 100);

  const baseIntegrityScore = national.avg_integrity_score || 0;
  const integrityScore =
    simulationMode === "cross_state"
      ? Math.max(0, Math.round((baseIntegrityScore - 8.4) * 10) / 10)
      : simulationMode === "quota_breach"
      ? Math.max(0, Math.round((baseIntegrityScore - 6.2) * 10) / 10)
      : baseIntegrityScore;

  // Breakdown counts
  const effectiveNriStudents =
    simulationMode === "quota_breach" ? national.nri_students + 4 : national.nri_students;
  const domesticCount = Math.max(
    0,
    national.total_students - (effectiveNriStudents + national.oci_students + national.fn_students)
  );
  const domesticPct = ((domesticCount / totalStudents) * 100).toFixed(1);
  const nriPct = ((effectiveNriStudents / totalStudents) * 100).toFixed(1);
  const ociPct = ((national.oci_students / totalStudents) * 100).toFixed(1);
  const fnPct = ((national.fn_students / totalStudents) * 100).toFixed(1);

  // Severe flag counts
  const criticalFlags = activeFlags.filter((f) => f.severity.toUpperCase() === "CRITICAL").length;
  const highFlags = activeFlags.filter((f) => f.severity.toUpperCase() === "HIGH").length;
  const mediumFlags = activeFlags.filter((f) => f.severity.toUpperCase() === "MEDIUM").length;

  const filteredFlags = activeFlags.filter((f) => {
    const matchesSeverity =
      selectedSeverity === "ALL" || f.severity.toUpperCase() === selectedSeverity;
    const matchesRule =
      selectedRuleCode === "ALL" || f.rule_code === selectedRuleCode;
    const matchesState =
      selectedStateFilter === "ALL" || f.institutions?.state === selectedStateFilter;
    const q = searchQuery.toLowerCase();
    const stuName = f.students?.full_name?.toLowerCase() || "";
    const apaar = f.students?.apaar_id || "";
    const instName = f.institutions?.name?.toLowerCase() || "";
    const rule = f.rule_code.toLowerCase();
    const matchesSearch =
      !q ||
      stuName.includes(q) ||
      apaar.includes(q) ||
      instName.includes(q) ||
      rule.includes(q);
    return matchesSeverity && matchesRule && matchesState && matchesSearch;
  });

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-8 sm:py-8">
      {/* 1. Executive National Command Header */}
      <div className="bg-white border border-[#CBD5E1] p-5 rounded-[4px] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" aria-hidden="true" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#10B981]">
              Live Multi-State Registry Connected
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#102A43] mt-1">
            National Admission Overview &amp; Verification
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRunning}
            className="inline-flex items-center gap-1.5 border border-[#CBD5E1] bg-white px-3.5 py-2 text-xs font-semibold text-[#17365D] hover:bg-[#F8FAFC] disabled:opacity-50 rounded-[2px] transition-colors cursor-pointer"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRunning ? "animate-spin" : ""}`} />
            <span>{isRunning ? t("Refreshing…") : "Refresh"}</span>
          </button>
          <button
            type="button"
            onClick={handleRunIntegrity}
            disabled={isRunning}
            className="inline-flex items-center gap-1.5 bg-[#17365D] hover:bg-[#102A43] px-4 py-2 text-xs font-bold text-white disabled:opacity-50 rounded-[2px] transition-colors cursor-pointer shadow-xs"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>{isRunning ? "Checking Records…" : "Run Record Check"}</span>
          </button>
        </div>
      </div>

      {/* 2. SIH Live Collision Simulation Controls */}
      <div className="bg-white border border-[#CBD5E1] rounded-[4px] shadow-xs overflow-hidden">
        <div className="bg-[#102A43] text-white px-5 py-2.5 flex flex-wrap items-center justify-between text-xs gap-3">
          <div className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span className="font-bold uppercase tracking-wider text-[11px] text-white">
              Real-Time Fraud &amp; Anomaly Simulator
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleSimulateCrossState}
              disabled={isSimulating}
              className={`px-3 py-1.5 text-xs font-bold rounded-[2px] transition-colors cursor-pointer ${
                simulationMode === "cross_state"
                  ? "bg-[#E11D48] text-white"
                  : "bg-[#2563EB] hover:bg-[#1D4ED8] text-white"
              } disabled:opacity-50`}
            >
              Simulate Cross-State Collision (Pune vs Bengaluru)
            </button>
            <button
              type="button"
              onClick={handleSimulateQuotaBreach}
              disabled={isSimulating}
              className={`px-3 py-1.5 text-xs font-bold rounded-[2px] transition-colors cursor-pointer ${
                simulationMode === "quota_breach"
                  ? "bg-[#D97706] text-white"
                  : "bg-[#334155] hover:bg-[#475569] text-white border border-slate-600"
              } disabled:opacity-50`}
            >
              Simulate Quota Ceiling Breach
            </button>
            {simulationMode !== "idle" && (
              <button
                type="button"
                onClick={handleResetSimulation}
                className="px-2.5 py-1.5 text-xs font-semibold bg-white/10 hover:bg-white/20 text-white rounded-[2px] border border-white/30 transition-colors cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Tabular Collision Finding (When Simulation Active) */}
        {simulationMode === "cross_state" && (
          <div className="p-4 bg-[#FEF2F2] border-t border-[#FECDCA]">
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#FECDCA] text-[10px] font-bold uppercase text-[#991B1B]">
                    <th className="py-1.5 px-3 text-left">Incident Finding</th>
                    <th className="py-1.5 px-3 text-left">Primary Seat (Maharashtra)</th>
                    <th className="py-1.5 px-3 text-left">Conflicting Claim (Karnataka)</th>
                    <th className="py-1.5 px-3 text-left">Regulatory Finding</th>
                    <th className="py-1.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#FECDCA] text-[#7F1D1D]">
                  <tr>
                    <td className="py-2.5 px-3 font-bold font-mono">
                      Candidate: Rahul S. Verma<br />
                      <span className="text-[10px] font-mono text-[#991B1B]">APAAR: 1000 0000 0020</span>
                    </td>
                    <td className="py-2.5 px-3">
                      <strong>COEP Pune</strong> (1-3327145) • B.Tech CSE<br />
                      <span className="font-mono text-[10px] text-[#991B1B]">Allotted: 14-Jul-2026 10:24 IST (CAP Round 1)</span>
                    </td>
                    <td className="py-2.5 px-3">
                      <strong>RVCE Bengaluru</strong> (1-4569123) • B.E. CS<br />
                      <span className="font-mono text-[10px] text-[#991B1B]">Allotted: 18-Jul-2026 15:42 IST (+96h Concurrency)</span>
                    </td>
                    <td className="py-2.5 px-3">
                      AICTE APH Clause 12.4 Breach<br />
                      <span className="text-[10px] font-semibold text-[#991B1B]">Automated Vacancy Re-allocation Triggered</span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          const el = document.getElementById("flag-search-input");
                          if (el) el.scrollIntoView({ behavior: "smooth" });
                        }}
                        className="px-2.5 py-1 bg-[#B91C1C] hover:bg-[#991B1B] text-white text-xs font-bold rounded-[2px] transition-colors cursor-pointer"
                      >
                        Inspect Row &darr;
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {simulationMode === "quota_breach" && (
          <div className="p-4 bg-[#FFFBEB] border-t border-[#FEDF89]">
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#FEDF89] text-[10px] font-bold uppercase text-[#92400E]">
                    <th className="py-1.5 px-3 text-left">Reporting Institution</th>
                    <th className="py-1.5 px-3 text-left">Quota Category</th>
                    <th className="py-1.5 px-3 text-center">Approved Ceiling</th>
                    <th className="py-1.5 px-3 text-center">Enrolled Candidates</th>
                    <th className="py-1.5 px-3 text-left">Statutory Finding</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#FEDF89] text-[#78350F]">
                  <tr>
                    <td className="py-2.5 px-3 font-bold">Apex Institute of Technology, Mumbai (1-1003921)</td>
                    <td className="py-2.5 px-3">Non-Resident Indian (NRI Quota)</td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold">15 Seats</td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-[#B91C1C]">19 Admissions (+4)</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 bg-[#FEF2F2] border border-[#FECDCA] text-[#991B1B] text-[10px] font-bold uppercase rounded-[2px]">
                        AICTE Section 10(k) Notice Issued
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* 3. Unified Government National Executive Summary Ledger */}
      <div className="bg-white border border-[#CBD5E1] rounded-[4px] shadow-xs overflow-hidden">
        <div className="bg-[#102A43] text-white px-5 py-2.5 flex items-center justify-between text-xs">
          <span className="font-bold uppercase tracking-wider text-[11px] text-[#F59E0B]">
            National Admission Executive Status Ledger
          </span>
          <span className="font-mono text-slate-300 text-[11px]">
            Reporting Jurisdictions: {states.length} States • Updated Live
          </span>
        </div>

        {/* Flat horizontal government ledger */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 divide-y sm:divide-y-0 sm:divide-x divide-[#CBD5E1] text-xs">
          <div className="p-4 bg-[#F8FAFC]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block">
              Integrity Standing
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="font-mono text-2xl font-black text-[#102A43]">{integrityScore}</span>
              <span className="text-[10px] font-mono text-[#64748B]">/ 100</span>
            </div>
            <span
              className={`inline-block mt-1 text-[10px] font-mono font-bold uppercase px-1.5 py-0.2 rounded-[2px] ${
                integrityScore >= 90
                  ? "bg-[#ECFDF5] text-[#059669]"
                  : integrityScore >= 70
                  ? "bg-[#FFFBEB] text-[#D97706]"
                  : "bg-[#FEF2F2] text-[#E11D48]"
              }`}
            >
              {integrityScore >= 90 ? "High Compliance" : integrityScore >= 70 ? "Moderate" : "Reconciliation Active"}
            </span>
          </div>

          <div className="p-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block">
              Total Admissions
            </span>
            <div className="font-mono text-2xl font-black text-[#102A43] mt-1">
              {totalStudents.toLocaleString()}
            </div>
            <span className="text-[10px] text-[#64748B]">Sanctioned Enrolment</span>
          </div>

          <div className="p-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block">
              Verified Admissions
            </span>
            <div className="font-mono text-2xl font-black text-[#059669] mt-1">
              {verifiedCount.toLocaleString()}
            </div>
            <span className="text-[10px] font-mono font-bold text-[#059669]">{verifiedPct}% Compliant</span>
          </div>

          <div className="p-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block">
              Review Queue
            </span>
            <div className="font-mono text-2xl font-black text-[#E11D48] mt-1">
              {flaggedCount.toLocaleString()}
            </div>
            <span className="text-[10px] font-mono font-bold text-[#E11D48]">{flaggedPct}% Discrepancies</span>
          </div>

          <div className="p-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block">
              Reporting Colleges
            </span>
            <div className="font-mono text-2xl font-black text-[#102A43] mt-1">
              {national.institutions_reporting}
            </div>
            <span className="text-[10px] text-[#64748B]">Approved Institutions</span>
          </div>

          <div className="p-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block">
              States / UTs
            </span>
            <div className="font-mono text-2xl font-black text-[#102A43] mt-1">
              {states.length}
            </div>
            <span className="text-[10px] text-[#64748B]">Reporting Regions</span>
          </div>
        </div>
      </div>

      {/* 4. State Intake & Statutory Quota Ledgers (Pure Tabular Government Layout) */}
      <div className="bg-white border border-[#CBD5E1] rounded-[4px] shadow-xs overflow-hidden">
        <div className="bg-[#F8FAFC] border-b border-[#CBD5E1] px-5 py-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#102A43]">
            State Intake &amp; Statutory Quota Ledgers
          </h2>

          <div className="flex items-center gap-1 bg-white border border-[#CBD5E1] p-0.5 rounded-[2px] text-xs">
            <button
              type="button"
              onClick={() => setActiveTab("both")}
              className={`px-3 py-1 font-semibold rounded-[2px] transition-colors cursor-pointer ${
                activeTab === "both" ? "bg-[#17365D] text-white" : "text-[#5B6573] hover:text-[#17365D]"
              }`}
            >
              Unified View
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("states")}
              className={`px-3 py-1 font-semibold rounded-[2px] transition-colors cursor-pointer ${
                activeTab === "states" ? "bg-[#17365D] text-white" : "text-[#5B6573] hover:text-[#17365D]"
              }`}
            >
              State-Wise
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("categories")}
              className={`px-3 py-1 font-semibold rounded-[2px] transition-colors cursor-pointer ${
                activeTab === "categories" ? "bg-[#17365D] text-white" : "text-[#5B6573] hover:text-[#17365D]"
              }`}
            >
              Quota Distribution
            </button>
          </div>
        </div>

        <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* State Table */}
          {(activeTab === "both" || activeTab === "states") && (
            <div className={`space-y-3 ${activeTab === "states" ? "lg:col-span-2" : ""}`}>
              <div className="flex items-center justify-between pb-1.5 border-b border-[#CBD5E1]">
                <span className="font-bold text-xs uppercase tracking-wider text-[#102A43]">
                  Admissions by State Jurisdiction
                </span>
                {selectedStateFilter !== "ALL" && (
                  <button
                    type="button"
                    onClick={() => setSelectedStateFilter("ALL")}
                    className="text-[11px] font-bold text-[#2563EB] hover:underline cursor-pointer"
                  >
                    Clear Filter ({selectedStateFilter})
                  </button>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-[#F8FAFC] text-[#64748B] uppercase text-[10px] font-bold border-b border-[#CBD5E1]">
                    <tr>
                      <th className="py-2 px-3">State / UT</th>
                      <th className="py-2 px-3 text-right">Admitted Students</th>
                      <th className="py-2 px-3 text-right">National Share</th>
                      <th className="py-2 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0] text-[#1E293B]">
                    {states.map((st) => {
                      const share = Math.round((st.students / totalStudents) * 100);
                      const isFiltered = selectedStateFilter === st.state;
                      return (
                        <tr
                          key={st.state}
                          onClick={() => setSelectedStateFilter(isFiltered ? "ALL" : st.state)}
                          className={`cursor-pointer transition-colors ${
                            isFiltered ? "bg-[#EFF6FF] font-semibold" : "hover:bg-[#F8FAFC]"
                          }`}
                        >
                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-[#102A43]">{st.state}</span>
                              {isFiltered && (
                                <span className="text-[9px] bg-[#2563EB] text-white px-1.5 py-0.2 rounded font-mono">
                                  FILTERED
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-[#102A43]">
                            {st.students.toLocaleString()}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-[#475569]">
                            {share}%
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <span className="text-[11px] text-[#2563EB] font-bold hover:underline">
                              {isFiltered ? "Reset" : "Filter"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Quota Table */}
          {(activeTab === "both" || activeTab === "categories") && (
            <div className={`space-y-3 ${activeTab === "categories" ? "lg:col-span-2" : ""}`}>
              <div className="flex items-center justify-between pb-1.5 border-b border-[#CBD5E1]">
                <span className="font-bold text-xs uppercase tracking-wider text-[#102A43]">
                  Statutory Quota Allocation
                </span>
                <span className="text-[10px] font-mono text-[#64748B]">AICTE APH Limits</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-[#F8FAFC] text-[#64748B] uppercase text-[10px] font-bold border-b border-[#CBD5E1]">
                    <tr>
                      <th className="py-2 px-3">Quota Category</th>
                      <th className="py-2 px-3 text-right">Admitted</th>
                      <th className="py-2 px-3 text-right">Share %</th>
                      <th className="py-2 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0] text-[#1E293B]">
                    <tr>
                      <td className="py-2.5 px-3 font-semibold text-[#102A43]">Indian Domestic (General / Reserved)</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold">{domesticCount.toLocaleString()}</td>
                      <td className="py-2.5 px-3 text-right font-mono">{domesticPct}%</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="px-1.5 py-0.5 bg-[#ECFDF5] text-[#059669] text-[9px] font-mono font-bold rounded-[2px]">
                          NORMAL
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-semibold text-[#102A43]">Non-Resident Indian (NRI Quota)</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold">{effectiveNriStudents.toLocaleString()}</td>
                      <td className="py-2.5 px-3 text-right font-mono">{nriPct}%</td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`px-1.5 py-0.5 text-[9px] font-mono font-bold rounded-[2px] ${
                            simulationMode === "quota_breach"
                              ? "bg-[#FEF2F2] text-[#B91C1C]"
                              : "bg-[#FFFBEB] text-[#D97706]"
                          }`}
                        >
                          {simulationMode === "quota_breach" ? "OVER CEILING" : "WITHIN LIMIT"}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-semibold text-[#102A43]">Overseas Citizen of India (OCI / PIO)</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold">{national.oci_students.toLocaleString()}</td>
                      <td className="py-2.5 px-3 text-right font-mono">{ociPct}%</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="px-1.5 py-0.5 bg-[#F1F5F9] text-[#475569] text-[9px] font-mono font-bold rounded-[2px]">
                          COMPLIANT
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-semibold text-[#102A43]">Foreign Nationals / Supernumerary</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold">{national.fn_students.toLocaleString()}</td>
                      <td className="py-2.5 px-3 text-right font-mono">{fnPct}%</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="px-1.5 py-0.5 bg-[#F1F5F9] text-[#475569] text-[9px] font-mono font-bold rounded-[2px]">
                          COMPLIANT
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. Dynamic Flag Discrepancy Queue & Anomaly Inspector */}
      <div className="bg-white border border-[#CBD5E1] rounded-[6px] shadow-xs overflow-hidden">
        {/* Table Header & Interactive Filter Bar */}
        <div className="p-5 border-b border-[#E2E8F0] bg-[#F8FAFC] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#C87524]">
                Automated Verification Review Queue
              </div>
              <h2 className="text-base font-bold text-[#102A43] mt-0.5">
                Discrepancy Records ({filteredFlags.length} of {flags.length})
              </h2>
            </div>

            {/* Quick Severity Filter Chips */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => setSelectedSeverity("ALL")}
                className={`px-2.5 py-1 rounded-[3px] font-bold text-xs transition-colors cursor-pointer ${
                  selectedSeverity === "ALL"
                    ? "bg-[#102A43] text-white"
                    : "bg-white border border-[#CBD5E1] text-[#475569] hover:bg-slate-100"
                }`}
              >
                All ({flags.length})
              </button>
              <button
                type="button"
                onClick={() => setSelectedSeverity("CRITICAL")}
                className={`px-2.5 py-1 rounded-[3px] font-bold text-xs transition-colors cursor-pointer ${
                  selectedSeverity === "CRITICAL"
                    ? "bg-[#E11D48] text-white"
                    : "bg-white border border-[#CBD5E1] text-[#E11D48] hover:bg-rose-50"
                }`}
              >
                Critical ({criticalFlags})
              </button>
              <button
                type="button"
                onClick={() => setSelectedSeverity("HIGH")}
                className={`px-2.5 py-1 rounded-[3px] font-bold text-xs transition-colors cursor-pointer ${
                  selectedSeverity === "HIGH"
                    ? "bg-[#D97706] text-white"
                    : "bg-white border border-[#CBD5E1] text-[#D97706] hover:bg-amber-50"
                }`}
              >
                High ({highFlags})
              </button>
              <button
                type="button"
                onClick={() => setSelectedSeverity("MEDIUM")}
                className={`px-2.5 py-1 rounded-[3px] font-bold text-xs transition-colors cursor-pointer ${
                  selectedSeverity === "MEDIUM"
                    ? "bg-[#475569] text-white"
                    : "bg-white border border-[#CBD5E1] text-[#475569] hover:bg-slate-100"
                }`}
              >
                Medium ({mediumFlags})
              </button>
            </div>
          </div>

          {/* Search Input & Rule Selector */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#64748B]" />
              <input
                id="flag-search-input"
                type="text"
                placeholder="Search by student name, roll number, APAAR ID, college name, or rule code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-[#CBD5E1] bg-white text-xs text-[#1E293B] rounded-[3px] focus:outline-none focus:border-[#17365D]"
              />
            </div>

            <select
              value={selectedRuleCode}
              onChange={(e) => setSelectedRuleCode(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 border border-[#CBD5E1] bg-white text-xs font-semibold text-[#102A43] rounded-[3px] focus:outline-none focus:border-[#17365D] cursor-pointer"
            >
              <option value="ALL">All Inspection Rules</option>
              <option value="DUPLICATE_ENROLMENT">Duplicate Admission (Cross-State)</option>
              <option value="INTAKE_LIMIT_EXCEEDED">Intake Over Capacity</option>
              <option value="INVALID_APAAR_FORMAT">Invalid APAAR Syntax</option>
            </select>
          </div>
        </div>

        {/* Dynamic Interactive Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px] border-collapse text-left text-xs">
            <thead className="border-b border-[#CBD5E1] bg-[#F8FAFC] text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
              <tr>
                <th scope="col" className="w-24 px-4 py-3">Severity</th>
                <th scope="col" className="px-4 py-3">Discrepancy Rule</th>
                <th scope="col" className="px-4 py-3">Student &amp; Roll</th>
                <th scope="col" className="px-4 py-3 font-mono">Masked APAAR</th>
                <th scope="col" className="px-4 py-3">Reporting Institution</th>
                <th scope="col" className="px-4 py-3 text-center">Score</th>
                <th scope="col" className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] text-[#1E293B]">
              {filteredFlags.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-xs text-[#64748B]">
                    No discrepancy records match the active search filters.
                  </td>
                </tr>
              ) : (
                filteredFlags.map((flag) => {
                  const isCrit = flag.severity.toUpperCase() === "CRITICAL";
                  const isHigh = flag.severity.toUpperCase() === "HIGH";
                  const isExpanded = expandedFlagId === flag.id;
                  const isSimFlag = flag.id.startsWith("sim-flag-");

                  return (
                    <React.Fragment key={flag.id}>
                      <tr
                        onClick={() => setExpandedFlagId(isExpanded ? null : flag.id)}
                        className={`transition-colors cursor-pointer ${
                          isSimFlag
                            ? isExpanded
                              ? "bg-[#FEF3C7] border-l-4 border-[#F59E0B]"
                              : "bg-[#FFFBEB] hover:bg-[#FEF3C7]/60"
                            : isExpanded
                            ? "bg-[#EFF6FF]"
                            : "hover:bg-[#F8FAFC]"
                        }`}
                      >
                        <td className="whitespace-nowrap px-4 py-3">
                          <span
                            className={`inline-block px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded-[2px] border ${
                              isCrit
                                ? "bg-[#FDF0EF] border-[#FECDCA] text-[#B42318]"
                                : isHigh
                                ? "bg-[#FFF7E6] border-[#FEDF89] text-[#B54708]"
                                : "bg-[#F4F6F8] border-[#D8DEE6] text-[#344054]"
                            }`}
                          >
                            {flag.severity}
                          </span>
                        </td>

                        <td className="px-4 py-3">
                          <div className="font-bold text-[#102A43] flex flex-wrap items-center gap-1.5">
                            <span>{flag.title}</span>
                            {isSimFlag && (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 text-[9px] font-mono font-bold bg-[#F59E0B] text-[#102A43] rounded-[2px]">
                                <Zap className="w-2.5 h-2.5 fill-current" />
                                LIVE SIMULATION
                              </span>
                            )}
                            {isExpanded ? (
                              <ChevronUp className="w-3.5 h-3.5 text-[#2563EB]" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5 text-[#64748B]" />
                            )}
                          </div>
                          <div className="font-mono text-[10px] text-[#64748B]">
                            {flag.rule_code}
                          </div>
                        </td>

                        <td className="whitespace-nowrap px-4 py-3">
                          <div className="font-semibold text-[#102A43]">
                            {flag.students?.full_name || t("Name unavailable")}
                          </div>
                          <div className="font-mono text-[10px] text-[#64748B]">
                            Roll: {flag.students?.institutional_student_id || flag.student_id}
                          </div>
                        </td>

                        <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-[#334155]">
                          {formatMaskedApaar(flag.students?.apaar_id)}
                        </td>

                        <td className="px-4 py-3">
                          <div className="font-medium text-[#102A43]">
                            {flag.institutions?.name || t("Institution unavailable")}
                          </div>
                          <div className="text-[10px] text-[#64748B]">
                            {flag.institutions?.state || t("State unavailable")}
                          </div>
                        </td>

                        <td className="whitespace-nowrap px-4 py-3 text-center font-mono font-bold">
                          <span
                            className={
                              (flag.students?.integrity_score || 0) < 70
                                ? "text-[#E11D48]"
                                : "text-[#D97706]"
                            }
                          >
                            {flag.students?.integrity_score ?? 100}
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                          <Link
                            href={`/aicte/students/${flag.student_id}`}
                            className="inline-flex items-center gap-1 border border-[#17365D] bg-white px-2.5 py-1 text-xs font-bold text-[#17365D] hover:bg-[#17365D] hover:text-white rounded-[2px] transition-colors"
                          >
                            <span>Inspect</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        </td>
                      </tr>

                      {/* Expandable Dossier Row Detail */}
                      {isExpanded && (
                        <tr className="bg-[#F8FAFC] border-b border-[#CBD5E1]">
                          <td colSpan={7} className="p-4">
                            <div className="bg-white border border-[#CBD5E1] p-4 rounded-[4px] space-y-2 text-xs">
                              <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
                                <span className="font-bold text-[#102A43] text-xs flex items-center gap-1.5">
                                  <span>Dossier Detail: {flag.rule_code}</span>
                                  {isSimFlag && (
                                    <span className="text-[10px] font-mono text-[#F59E0B] font-bold">
                                      [SIH-2026-LIVE-SCENARIO]
                                    </span>
                                  )}
                                </span>
                                <span className="text-[11px] font-mono text-[#64748B]">
                                  Flag ID: {flag.id}
                                </span>
                              </div>
                              <p className="text-[#334155] leading-relaxed">
                                {flag.explanation || "Discrepancy flagged under AICTE Approval Process Handbook (APH) validation check."}
                              </p>
                              {flag.recommended_action && (
                                <p className="text-[11px] text-[#B54708] bg-[#FFF7E6] border border-[#FEDF89] p-2 rounded-[2px]">
                                  <strong>Recommended Action:</strong> {flag.recommended_action}
                                </p>
                              )}

                              {/* Special Cross-State Collision Side-by-Side Breakdown in Table */}
                              {flag.id === "sim-flag-dup" && (
                                <div className="mt-2 p-3 bg-[#F8FAFC] border border-[#CBD5E1] rounded-[3px] space-y-2">
                                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#102A43]">
                                    Cross-State Jurisdictional Overlap Audit
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="bg-white p-2.5 border border-[#CBD5E1] rounded-[2px] space-y-1">
                                      <div className="text-[10px] font-bold text-[#17365D]">Institution 1: COEP Pune (MH)</div>
                                      <div className="text-[11px] text-[#334155]">B.Tech Computer Engineering (CAP Round 1)</div>
                                      <div className="text-[10px] font-mono text-[#64748B]">Allotted: 14-Jul-2026 10:24 IST</div>
                                    </div>
                                    <div className="bg-white p-2.5 border border-[#E11D48]/40 rounded-[2px] space-y-1">
                                      <div className="text-[10px] font-bold text-[#E11D48]">Institution 2: RVCE Bengaluru (KA)</div>
                                      <div className="text-[11px] text-[#334155]">B.E. Computer Science (KEA Quota)</div>
                                      <div className="text-[10px] font-mono text-[#E11D48]">Allotted: 18-Jul-2026 15:42 IST (+96h)</div>
                                    </div>
                                  </div>
                                </div>
                              )}

                              <div className="flex flex-wrap items-center gap-3 pt-2 text-[11px]">
                                <span className="text-[#64748B]">
                                  Reporting College: <strong className="text-[#102A43]">{flag.institutions?.name}</strong>
                                </span>
                                <span className="text-slate-300">|</span>
                                <span className="text-[#64748B]">
                                  Jurisdiction: <strong className="text-[#102A43]">{flag.institutions?.state}</strong>
                                </span>
                                <span className="text-slate-300">|</span>
                                <Link
                                  href={`/aicte/students/${flag.student_id}`}
                                  className="text-[#2563EB] font-bold hover:underline"
                                >
                                  Open Full Dossier &rarr;
                                </Link>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
