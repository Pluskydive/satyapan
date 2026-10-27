"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { NationalSummary, StateSummary, ValidationFlag } from "@/lib/types";
import { formatMaskedApaar } from "@/lib/security";
import { useLanguage } from "@/components/LanguageProvider";
import {
  BarChart3,
  Search,
  RotateCw,
  ChevronDown,
  ChevronUp,
  Layers,
  Globe2,
  ExternalLink,
  ShieldAlert,
  Zap,
  AlertTriangle,
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

  // Circular gauge math: radius 38 -> circumference = 2 * PI * 38 ≈ 238.76
  const gaugeCircumference = 238.76;
  const gaugeOffset = gaugeCircumference - (integrityScore / 100) * gaugeCircumference;

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
      <div className="bg-white border border-[#CBD5E1] p-6 rounded-[6px] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-pulse" aria-hidden="true" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#10B981]">
              Live Multi-State Registry Connected
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#102A43] mt-1.5">
            National Admission Overview &amp; Verification
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#5B6573] max-w-2xl leading-relaxed">
            Real-time technical education admissions monitoring, state-level intake compliance, and cross-state duplicate reconciliation.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRunning}
            className="inline-flex items-center gap-1.5 border border-[#CBD5E1] bg-white px-3.5 py-2 text-xs font-semibold text-[#17365D] hover:bg-[#F8FAFC] disabled:opacity-50 rounded-[3px] transition-colors cursor-pointer"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRunning ? "animate-spin" : ""}`} />
            <span>{isRunning ? t("Refreshing…") : "Refresh"}</span>
          </button>
          <button
            type="button"
            onClick={handleRunIntegrity}
            disabled={isRunning}
            className="inline-flex items-center gap-1.5 bg-[#17365D] hover:bg-[#102A43] px-4 py-2 text-xs font-bold text-white disabled:opacity-50 rounded-[3px] transition-colors cursor-pointer shadow-xs"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>{isRunning ? "Checking Records…" : "Run Record Check"}</span>
          </button>
        </div>
      </div>

      {/* 2. SIH Live Collision Simulation Lab (The Jury Showstopper) */}
      <div className="bg-[#102A43] border border-[#1E3A8A] rounded-[6px] shadow-sm text-white overflow-hidden">
        <div className="p-5 sm:p-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 bg-[#F59E0B] text-[#102A43] text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded-[2px]">
                  <Zap className="w-3 h-3 fill-current" />
                  SIH Innovation Lab
                </span>
                <span className="text-slate-300 text-xs font-semibold">
                  Live Anomaly &amp; Fraud Collision Simulator
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-white">
                One-Click Multi-State Conflict &amp; Quota Breach Engine
              </h2>
              <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                Demonstrate SATYAPAN&apos;s real-time detection of concurrent seat allotments across state counseling bodies and statutory quota over-allocation without manual audits.
              </p>
            </div>

            {/* Simulation Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleSimulateCrossState}
                disabled={isSimulating}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-[3px] transition-all cursor-pointer shadow-xs ${
                  simulationMode === "cross_state"
                    ? "bg-[#E11D48] text-white ring-2 ring-white/50"
                    : "bg-[#2563EB] hover:bg-[#1D4ED8] text-white"
                } disabled:opacity-50`}
              >
                <Zap className={`w-3.5 h-3.5 ${isSimulating ? "animate-spin" : ""}`} />
                <span>Simulate Cross-State Collision (Pune vs Bengaluru)</span>
              </button>

              <button
                type="button"
                onClick={handleSimulateQuotaBreach}
                disabled={isSimulating}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-[3px] transition-all cursor-pointer shadow-xs ${
                  simulationMode === "quota_breach"
                    ? "bg-[#D97706] text-white ring-2 ring-white/50"
                    : "bg-[#334155] hover:bg-[#475569] text-white border border-slate-600"
                } disabled:opacity-50`}
              >
                <AlertTriangle className="w-3.5 h-3.5 text-[#F59E0B]" />
                <span>Simulate Quota Breach (NRI Quota)</span>
              </button>

              {simulationMode !== "idle" && (
                <button
                  type="button"
                  onClick={handleResetSimulation}
                  className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white px-3 py-2 text-xs font-semibold rounded-[3px] border border-white/20 transition-colors cursor-pointer"
                >
                  <RotateCw className="w-3 h-3" />
                  <span>Reset Simulation</span>
                </button>
              )}
            </div>
          </div>

          {/* Active Simulation Dossier Panel: Cross-State */}
          {simulationMode === "cross_state" && (
            <div className="p-4.5 bg-[#0B1E33] border-l-4 border-[#E11D48] border-y border-r border-[#1E3A8A] rounded-[4px] space-y-3.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-700/60 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#E11D48] animate-ping" />
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#FDA29B]">
                    Critical Concurrency Collision Active (Rule: DUP_001)
                  </span>
                </div>
                <div className="text-[11px] font-mono text-slate-300">
                  Candidate: <strong className="text-white">Rahul S. Verma</strong> | Masked APAAR: <strong className="text-[#F59E0B]">XXXX-XXXX-0020</strong>
                </div>
              </div>

              {/* Side-by-Side College Conflict Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* College A */}
                <div className="bg-[#102A43] p-3.5 border border-slate-700 rounded-[3px] space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-[#93C5FD] uppercase tracking-wider">Primary Allotment (Maharashtra)</span>
                    <span className="font-mono text-[10px] text-slate-400">Round 1 CAP</span>
                  </div>
                  <div className="font-bold text-white text-sm">
                    Government College of Engineering, Pune (COEP)
                  </div>
                  <div className="text-slate-300 text-[11px]">
                    Programme: <strong className="text-white">B.Tech Computer Engineering</strong>
                  </div>
                  <div className="text-[11px] font-mono text-slate-400">
                    Admission Timestamp: 14-Jul-2026 10:24 IST (State Quota Verified)
                  </div>
                </div>

                {/* College B */}
                <div className="bg-[#102A43] p-3.5 border border-[#E11D48]/50 rounded-[3px] space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-[#FDA29B] uppercase tracking-wider">Conflicting Claim (Karnataka)</span>
                    <span className="font-mono text-[10px] text-[#FDA29B]">Overlapping Quota</span>
                  </div>
                  <div className="font-bold text-white text-sm">
                    RV College of Engineering, Bengaluru (RVCE)
                  </div>
                  <div className="text-slate-300 text-[11px]">
                    Programme: <strong className="text-white">B.E. Computer Science &amp; Engineering</strong>
                  </div>
                  <div className="text-[11px] font-mono text-slate-400">
                    Admission Timestamp: 18-Jul-2026 15:42 IST (+96 Hrs Concurrency Delta)
                  </div>
                </div>
              </div>

              {/* Statutory Enforcement Resolution */}
              <div className="bg-slate-900/60 p-3 rounded-[3px] border border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#F59E0B] block">
                    Automated AICTE Regulatory Resolution Engine
                  </span>
                  <p className="text-slate-300 text-[11px] leading-snug">
                    AICTE Approval Process Handbook (APH) Clause 12.4 violation detected. Automatic seat reclamation notice generated for Maharashtra DTE and Karnataka KEA.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById("flag-search-input");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="shrink-0 bg-[#E11D48] hover:bg-[#BE123C] text-white px-3 py-1.5 text-xs font-bold rounded-[2px] transition-colors cursor-pointer"
                >
                  View Discrepancy Record &darr;
                </button>
              </div>
            </div>
          )}

          {/* Active Quota Breach Dossier Panel */}
          {simulationMode === "quota_breach" && (
            <div className="p-4.5 bg-[#0B1E33] border-l-4 border-[#D97706] border-y border-r border-[#1E3A8A] rounded-[4px] space-y-3.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-700/60 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#D97706] animate-ping" />
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#FDBA74]">
                    Supernumerary Quota Ceiling Exceeded (Rule: CAP_002)
                  </span>
                </div>
                <div className="text-[11px] font-mono text-slate-300">
                  Institution: <strong className="text-white">Apex Institute of Technology, Mumbai</strong> (AICTE Code: 1-1003921)
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="bg-[#102A43] p-3 rounded-[3px] border border-slate-700">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Sanctioned NRI Ceiling</span>
                  <span className="font-mono text-lg font-bold text-white mt-0.5 block">15 Seats</span>
                  <span className="text-[10px] text-slate-400">Statutory AICTE APH Limit</span>
                </div>
                <div className="bg-[#102A43] p-3 rounded-[3px] border border-[#D97706]/60">
                  <span className="text-[10px] text-[#FDBA74] uppercase font-bold block">Enrolled Candidates</span>
                  <span className="font-mono text-lg font-bold text-[#F59E0B] mt-0.5 block">19 Admissions</span>
                  <span className="text-[10px] text-[#FDA29B] font-bold">+4 Unauthorized Admissions (126.7%)</span>
                </div>
                <div className="bg-[#102A43] p-3 rounded-[3px] border border-slate-700">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Regulatory Action</span>
                  <span className="font-bold text-white mt-0.5 block">Section 10(k) Notice</span>
                  <span className="text-[10px] text-slate-400">Admissions Portal Frozen</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. Dynamic Executive Health Cockpit & Metrics (Replaces rigid boxes) */}
      <div className="bg-white border border-[#CBD5E1] rounded-[6px] shadow-xs overflow-hidden">
        {/* Cockpit Header Banner */}
        <div className="bg-[#102A43] text-white px-6 py-3 flex flex-wrap items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#F59E0B]" />
            <span className="font-bold uppercase tracking-wider text-[11px] text-[#F59E0B]">
              National Enrolment Command Ledger
            </span>
          </div>
          <div className="text-slate-300 text-[11px] font-mono">
            Reporting Jurisdictions: {states.length} States | Updated Live
          </div>
        </div>

        {/* Dynamic Interactive Analytics Bar */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Section A: Circular Integrity Health Dial (Cols 1-4) */}
          <div className="lg:col-span-4 flex items-center gap-5 pr-0 lg:pr-6 border-b lg:border-b-0 lg:border-r border-[#E2E8F0] pb-6 lg:pb-0">
            {/* SVG Ring Gauge */}
            <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#E2E8F0"
                  strokeWidth="8"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke={integrityScore >= 90 ? "#059669" : integrityScore >= 70 ? "#D97706" : "#E11D48"}
                  strokeWidth="8"
                  strokeDasharray={gaugeCircumference}
                  strokeDashoffset={gaugeOffset}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="font-mono text-xl font-black text-[#102A43] leading-none">
                  {integrityScore}
                </span>
                <span className="text-[9px] font-mono text-[#64748B] mt-0.5">/ 100</span>
              </div>
            </div>

            {/* Dial Legend & Description */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block">
                National Integrity Index
              </span>
              <div className="text-xs font-bold text-[#102A43]">
                {integrityScore >= 90
                  ? "High Compliance Standing"
                  : integrityScore >= 70
                  ? "Moderate Reconciliation State"
                  : "Audit Reconciliation Active"}
              </div>
              <p className="text-[11px] text-[#64748B] leading-snug">
                Computed across duplicate admissions, quota limits, and APAAR syntax.
              </p>
            </div>
          </div>

          {/* Section B: Dual Ratio Adherence Spectrum (Cols 5-8) */}
          <div className="lg:col-span-5 px-0 lg:px-4 space-y-3 border-b lg:border-b-0 lg:border-r border-[#E2E8F0] pb-6 lg:pb-0">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#102A43] text-xs">Admission Verification Status</span>
              <span className="text-[11px] font-mono font-semibold text-[#64748B]">
                {totalStudents.toLocaleString()} Total Records
              </span>
            </div>

            {/* Proportional Segmented Progress Track */}
            <div className="h-3.5 w-full bg-[#F1F5F9] rounded-full overflow-hidden flex border border-[#CBD5E1]">
              <div
                style={{ width: `${Math.max(verifiedPct, verifiedCount > 0 ? 3 : 0)}%` }}
                className="bg-[#059669] transition-all duration-500"
                title={`Verified: ${verifiedCount} (${verifiedPct}%)`}
              />
              <div
                style={{ width: `${Math.max(flaggedPct, flaggedCount > 0 ? 3 : 0)}%` }}
                className="bg-[#E11D48] transition-all duration-500"
                title={`Flagged: ${flaggedCount} (${flaggedPct}%)`}
              />
            </div>

            {/* Dual Legend */}
            <div className="flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#059669]" />
                <span className="text-[#334155] font-semibold">
                  Verified: <strong className="font-mono text-[#059669]">{verifiedCount}</strong> ({verifiedPct}%)
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E11D48]" />
                <span className="text-[#334155] font-semibold">
                  Review Queue: <strong className="font-mono text-[#E11D48]">{flaggedCount}</strong> ({flaggedPct}%)
                </span>
              </div>
            </div>
          </div>

          {/* Section C: Institutional Counters (Cols 9-12) */}
          <div className="lg:col-span-3 pl-0 lg:pl-4 grid grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-[#F8FAFC] border border-[#CBD5E1] rounded-[4px]">
              <span className="text-[10px] uppercase font-bold text-[#64748B] block">Colleges</span>
              <span className="font-mono text-xl font-black text-[#102A43] block mt-0.5">
                {national.institutions_reporting}
              </span>
              <span className="text-[10px] text-[#64748B]">Reporting data</span>
            </div>
            <div className="p-3 bg-[#F8FAFC] border border-[#CBD5E1] rounded-[4px]">
              <span className="text-[10px] uppercase font-bold text-[#64748B] block">States</span>
              <span className="font-mono text-xl font-black text-[#102A43] block mt-0.5">
                {states.length}
              </span>
              <span className="text-[10px] text-[#64748B]">Jurisdictions</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Interactive Analytics Suite (Replaces disjointed bar chart box and table box) */}
      <div className="bg-white border border-[#CBD5E1] rounded-[6px] shadow-xs overflow-hidden">
        {/* Navigation & Controls */}
        <div className="border-b border-[#E2E8F0] bg-[#F8FAFC] px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-[#102A43] uppercase tracking-wider">
              Enrolment Distribution &amp; Intake Metrics
            </h2>
            <p className="text-xs text-[#5B6573] mt-0.5">
              Interactive geographic breakdown and quota allocation analysis.
            </p>
          </div>

          <div className="flex items-center gap-1 bg-white border border-[#CBD5E1] p-0.5 rounded-[4px] self-start sm:self-auto text-xs">
            <button
              type="button"
              onClick={() => setActiveTab("both")}
              className={`px-3 py-1 font-semibold rounded-[3px] transition-colors cursor-pointer ${
                activeTab === "both"
                  ? "bg-[#17365D] text-white"
                  : "text-[#5B6573] hover:text-[#17365D]"
              }`}
            >
              Unified View
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("states")}
              className={`px-3 py-1 font-semibold rounded-[3px] transition-colors cursor-pointer ${
                activeTab === "states"
                  ? "bg-[#17365D] text-white"
                  : "text-[#5B6573] hover:text-[#17365D]"
              }`}
            >
              State-Wise
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("categories")}
              className={`px-3 py-1 font-semibold rounded-[3px] transition-colors cursor-pointer ${
                activeTab === "categories"
                  ? "bg-[#17365D] text-white"
                  : "text-[#5B6573] hover:text-[#17365D]"
              }`}
            >
              Quota Distribution
            </button>
          </div>
        </div>

        {/* Content Panels */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Panel 1: State & Geographic Intake Visualizer */}
          {(activeTab === "both" || activeTab === "states") && (
            <div className={`space-y-4 ${activeTab === "states" ? "lg:col-span-2" : ""}`}>
              <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
                <div className="flex items-center gap-2">
                  <Globe2 className="w-4 h-4 text-[#17365D]" />
                  <span className="font-bold text-xs uppercase tracking-wider text-[#102A43]">
                    Admissions by State or Territory
                  </span>
                </div>
                <span className="text-[11px] font-mono text-[#64748B]">
                  Click a state to filter review queue
                </span>
              </div>

              {/* Dynamic State Progress Rows */}
              <div className="space-y-3 pt-1">
                {states.map((st) => {
                  const stateShare = Math.round((st.students / totalStudents) * 100);
                  const isFiltered = selectedStateFilter === st.state;

                  return (
                    <div
                      key={st.state}
                      onClick={() => setSelectedStateFilter(isFiltered ? "ALL" : st.state)}
                      className={`p-3 rounded-[4px] border transition-all cursor-pointer ${
                        isFiltered
                          ? "bg-[#EFF6FF] border-[#2563EB] shadow-xs"
                          : "bg-[#F8FAFC] border-[#E2E8F0] hover:border-[#17365D] hover:bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#102A43]">{st.state}</span>
                          {isFiltered && (
                            <span className="text-[10px] bg-[#2563EB] text-white px-1.5 py-0.2 rounded font-semibold">
                              Active Filter
                            </span>
                          )}
                        </div>
                        <div className="font-mono text-xs font-bold text-[#17365D]">
                          {st.students.toLocaleString()} students ({stateShare}%)
                        </div>
                      </div>

                      {/* Dynamic Proportional Progress Bar */}
                      <div className="h-2 w-full bg-[#E2E8F0] rounded-full overflow-hidden">
                        <div
                          style={{ width: `${Math.max(stateShare, st.students > 0 ? 4 : 0)}%` }}
                          className={`h-full rounded-full transition-all duration-500 ${
                            isFiltered ? "bg-[#2563EB]" : "bg-[#17365D]"
                          }`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {selectedStateFilter !== "ALL" && (
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-[#2563EB] font-semibold">
                    Filtering table by: <strong>{selectedStateFilter}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedStateFilter("ALL")}
                    className="text-xs font-bold text-[#17365D] hover:underline"
                  >
                    Clear State Filter
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Panel 2: Quota & Category Breakdown Visualizer */}
          {(activeTab === "both" || activeTab === "categories") && (
            <div className={`space-y-4 ${activeTab === "categories" ? "lg:col-span-2" : ""}`}>
              <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-[#17365D]" />
                  <span className="font-bold text-xs uppercase tracking-wider text-[#102A43]">
                    Admission Quota &amp; Category Breakdown
                  </span>
                </div>
                <span className="text-[11px] font-mono text-[#64748B]">
                  Statutory Intake Limits
                </span>
              </div>

              {/* Visual Distribution Rows */}
              <div className="space-y-3 pt-1">
                {/* Domestic */}
                <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[4px]">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-bold text-[#102A43]">Indian Domestic General / Reserved</span>
                    <span className="font-mono text-xs font-bold text-[#17365D]">
                      {domesticCount.toLocaleString()} ({domesticPct}%)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-[#E2E8F0] rounded-full overflow-hidden">
                    <div style={{ width: `${domesticPct}%` }} className="h-full bg-[#102A43] rounded-full" />
                  </div>
                </div>

                {/* NRI */}
                <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[4px]">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-bold text-[#102A43]">Non-Resident Indian (NRI Quota)</span>
                    <span className="font-mono text-xs font-bold text-[#D97706]">
                      {national.nri_students.toLocaleString()} ({nriPct}%)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-[#E2E8F0] rounded-full overflow-hidden">
                    <div style={{ width: `${Math.max(Number(nriPct), national.nri_students > 0 ? 3 : 0)}%` }} className="h-full bg-[#D97706] rounded-full" />
                  </div>
                </div>

                {/* OCI */}
                <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[4px]">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-bold text-[#102A43]">Overseas Citizen of India (OCI / PIO)</span>
                    <span className="font-mono text-xs font-bold text-[#64748B]">
                      {national.oci_students.toLocaleString()} ({ociPct}%)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-[#E2E8F0] rounded-full overflow-hidden">
                    <div style={{ width: `${ociPct}%` }} className="h-full bg-[#64748B] rounded-full" />
                  </div>
                </div>

                {/* Foreign Nationals */}
                <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[4px]">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-bold text-[#102A43]">Foreign Nationals / Supernumerary</span>
                    <span className="font-mono text-xs font-bold text-[#64748B]">
                      {national.fn_students.toLocaleString()} ({fnPct}%)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-[#E2E8F0] rounded-full overflow-hidden">
                    <div style={{ width: `${fnPct}%` }} className="h-full bg-[#64748B] rounded-full" />
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-[#64748B] leading-relaxed pt-1">
                All supernumerary intake quotas are validated against AICTE Approval Process Handbook (APH) ceilings.
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
