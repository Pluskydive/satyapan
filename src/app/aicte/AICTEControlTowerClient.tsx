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
  const { locale, t } = useLanguage();
  const isHi = locale === "hi";
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
    <div className="mx-auto max-w-7xl space-y-4 px-4 py-4 sm:px-6 sm:py-6">
      {/* Official Government Breadcrumb */}
      <div className="bg-[#EAEFF5] border border-[#CBD5E1] px-4 py-1.5 rounded-[2px] text-xs text-[#334155] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-[11px]">
          <Link href="/" className="text-[#205081] font-semibold hover:underline">
            {isHi ? "मुख्य पृष्ठ" : "Home"}
          </Link>
          <span className="text-[#94A3B8]">&gt;</span>
          <span className="text-[#205081] font-semibold">
            {isHi ? "अखिल भारतीय तकनीकी शिक्षा परिषद" : "AICTE Regulatory Command"}
          </span>
          <span className="text-[#94A3B8]">&gt;</span>
          <span className="text-[#102A43] font-bold">
            {isHi ? "राष्ट्रीय नामांकन नियंत्रण कक्ष" : "National Control Tower"}
          </span>
        </div>
        <div className="hidden sm:block text-[10px] font-mono text-[#64748B]">
          {isHi ? "शैक्षणिक सत्र २०२६-२७ • GIGW अनुपालन" : "Academic Year 2026-27 | GIGW Compliant"}
        </div>
      </div>

      {/* 1. Department Header Block */}
      <div className="bg-white border-l-4 border-l-[#FF9933] border-y border-r border-[#CBD5E1] p-4 sm:p-5 rounded-[2px] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" aria-hidden="true" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#205081]">
              {isHi
                ? "भारत सरकार • शिक्षा मंत्रालय • अखिल भारतीय तकनीकी शिक्षा परिषद (AICTE)"
                : "GOVERNMENT OF INDIA • MINISTRY OF EDUCATION • AICTE CENTRAL REGISTRY"}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#102A43] mt-1">
            {isHi ? "राष्ट्रीय छात्र प्रवेश समीक्षा एवं सत्यापन नियंत्रण कक्ष" : "National Admission Overview & Verification Control Tower"}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRunning}
            className="inline-flex items-center gap-1.5 border border-[#205081] bg-white px-3 py-1.5 text-xs font-semibold text-[#205081] hover:bg-[#F4F6F9] disabled:opacity-50 rounded-[2px] transition-colors cursor-pointer"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRunning ? "animate-spin" : ""}`} />
            <span>{isRunning ? (isHi ? "अद्यतन हो रहा है…" : "Refreshing…") : (isHi ? "डेटा रीफ्रेश करें" : "Refresh Data")}</span>
          </button>
          <button
            type="button"
            onClick={handleRunIntegrity}
            disabled={isRunning}
            className="inline-flex items-center gap-1.5 bg-[#205081] hover:bg-[#112D4E] px-3.5 py-1.5 text-xs font-bold text-white disabled:opacity-50 rounded-[2px] transition-colors cursor-pointer shadow-xs"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-[#FF9933]" />
            <span>{isRunning ? (isHi ? "जाँच चल रही है…" : "Verifying…") : (isHi ? "रिकॉर्ड सत्यापन चलाएं" : "Run Record Check")}</span>
          </button>
        </div>
      </div>

      {/* 2. Anomaly Simulation Bench */}
      <div className="bg-white border border-[#CBD5E1] border-t-2 border-t-[#FF9933] rounded-[2px] shadow-xs overflow-hidden">
        <div className="bg-[#205081] text-white px-4 py-2.5 flex flex-wrap items-center justify-between text-xs gap-3">
          <div className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-[#FF9933]" />
            <span className="font-bold uppercase tracking-wider text-[11px] text-white">
              {isHi ? "लाइव धोखाधड़ी एवं विसंगति सिम्युलेटर (SIH ग्रैंड फिनाले)" : "Real-Time Fraud & Anomaly Simulator (SIH Grand Finale)"}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleSimulateCrossState}
              disabled={isSimulating}
              className={`px-3 py-1 text-xs font-bold rounded-[2px] transition-colors cursor-pointer ${
                simulationMode === "cross_state"
                  ? "bg-[#B42318] text-white"
                  : "bg-[#FF9933] hover:bg-[#E67300] text-[#102A43]"
              } disabled:opacity-50`}
            >
              {isHi ? "दोहरा नामांकन टकराव (पुणे बनाम बेंगलुरु)" : "Cross-State Collision Test (Pune vs Bengaluru)"}
            </button>
            <button
              type="button"
              onClick={handleSimulateQuotaBreach}
              disabled={isSimulating}
              className={`px-3 py-1 text-xs font-bold rounded-[2px] transition-colors cursor-pointer ${
                simulationMode === "quota_breach"
                  ? "bg-[#B42318] text-white"
                  : "bg-white/10 hover:bg-white/20 text-white border border-white/30"
              } disabled:opacity-50`}
            >
              {isHi ? "सुपरन्यूमरेरी कोटा उल्लंघन परीक्षण" : "Supernumerary Quota Breach Test"}
            </button>
            {simulationMode !== "idle" && (
              <button
                type="button"
                onClick={handleResetSimulation}
                className="px-2.5 py-1 text-xs font-semibold bg-white/20 hover:bg-white/30 text-white rounded-[2px] transition-colors cursor-pointer"
              >
                {isHi ? "रीसेट करें" : "Reset"}
              </button>
            )}
          </div>
        </div>

        {/* Tabular Collision Finding (When Simulation Active) */}
        {simulationMode === "cross_state" && (
          <div className="p-3 bg-[#FFF7ED] border-t border-[#FED7AA]">
            <div className="overflow-x-auto">
              <table className="w-full text-xs border border-[#CBD5E1] bg-white">
                <thead>
                  <tr className="bg-[#205081] text-white text-[11px] font-bold">
                    <th className="py-2 px-3 text-center w-14 border border-[#112D4E]">{isHi ? "क्र." : "Sr."}</th>
                    <th className="py-2 px-3 text-left border border-[#112D4E]">{isHi ? "घटना विवरण" : "Incident"}</th>
                    <th className="py-2 px-3 text-left border border-[#112D4E]">{isHi ? "प्राथमिक आवंटन (पुणे)" : "Primary Allotment (Pune)"}</th>
                    <th className="py-2 px-3 text-left border border-[#112D4E]">{isHi ? "विरोधाभासी दावा (बेंगलुरु)" : "Conflicting Claim (Bengaluru)"}</th>
                    <th className="py-2 px-3 text-left border border-[#112D4E]">{isHi ? "नियामक निष्कर्ष" : "Regulatory Finding"}</th>
                    <th className="py-2 px-3 text-center border border-[#112D4E] w-24">{isHi ? "कार्रवाई" : "Action"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#CBD5E1] text-[#202B36]">
                  <tr className="bg-[#FFF5F5]">
                    <td className="py-2.5 px-3 text-center font-bold border border-[#CBD5E1]">1</td>
                    <td className="py-2.5 px-3 border border-[#CBD5E1]">
                      <span className="font-bold text-[#B42318] block font-mono">DUP_001 Collision</span>
                      <span className="text-[11px]">Rahul S. Verma (APAAR: 1000 0000 0020)</span>
                    </td>
                    <td className="py-2.5 px-3 border border-[#CBD5E1]">
                      <strong>COEP Pune (1-3327145)</strong> • B.Tech CSE<br />
                      <span className="font-mono text-[10px] text-[#64748B]">State CAP Round 1 • 14-Jul-2026 10:24 IST</span>
                    </td>
                    <td className="py-2.5 px-3 border border-[#CBD5E1]">
                      <strong>RVCE Bengaluru (1-4569123)</strong> • B.E. CS<br />
                      <span className="font-mono text-[10px] text-[#B42318]">KEA Quota • 18-Jul-2026 15:42 IST (+96h)</span>
                    </td>
                    <td className="py-2.5 px-3 border border-[#CBD5E1]">
                      <span className="font-bold text-[#B42318] block">AICTE APH Clause 12.4 Breach</span>
                      <span className="text-[10px] text-[#64748B]">Automated Vacancy Re-allocation Triggered</span>
                    </td>
                    <td className="py-2.5 px-3 text-center border border-[#CBD5E1]">
                      <button
                        type="button"
                        onClick={() => {
                          const el = document.getElementById("flag-search-input");
                          if (el) el.scrollIntoView({ behavior: "smooth" });
                        }}
                        className="px-2.5 py-1 bg-[#205081] hover:bg-[#112D4E] text-white text-xs font-bold rounded-[2px] transition-colors cursor-pointer"
                      >
                        {isHi ? "देखें ↓" : "View ↓"}
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {simulationMode === "quota_breach" && (
          <div className="p-3 bg-[#FFF7ED] border-t border-[#FED7AA]">
            <div className="overflow-x-auto">
              <table className="w-full text-xs border border-[#CBD5E1] bg-white">
                <thead>
                  <tr className="bg-[#205081] text-white text-[11px] font-bold">
                    <th className="py-2 px-3 text-center w-14 border border-[#112D4E]">{isHi ? "क्र." : "Sr."}</th>
                    <th className="py-2 px-3 text-left border border-[#112D4E]">{isHi ? "रिपोर्टिंग संस्थान" : "Reporting Institution"}</th>
                    <th className="py-2 px-3 text-left border border-[#112D4E]">{isHi ? "कोटा प्रवर्ग" : "Quota Category"}</th>
                    <th className="py-2 px-3 text-center border border-[#112D4E]">{isHi ? "स्वीकृत सीमा" : "Ceiling"}</th>
                    <th className="py-2 px-3 text-center border border-[#112D4E]">{isHi ? "नामांकित छात्र" : "Enrolled"}</th>
                    <th className="py-2 px-3 text-left border border-[#112D4E]">{isHi ? "नियामक स्थिति" : "Regulatory Status"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#CBD5E1] text-[#202B36]">
                  <tr>
                    <td className="py-2.5 px-3 text-center font-bold border border-[#CBD5E1]">1</td>
                    <td className="py-2.5 px-3 font-bold border border-[#CBD5E1]">Apex Institute of Technology, Mumbai (1-1003921)</td>
                    <td className="py-2.5 px-3 border border-[#CBD5E1]">Non-Resident Indian (NRI Quota)</td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold border border-[#CBD5E1]">15 Seats</td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-[#B42318] border border-[#CBD5E1]">19 Admissions (+4)</td>
                    <td className="py-2.5 px-3 border border-[#CBD5E1]">
                      <span className="px-2 py-0.5 bg-[#FEF2F2] border border-[#FECDCA] text-[#B42318] text-[10px] font-bold uppercase rounded-[2px]">
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

      {/* 3. Official Executive Status Ledger */}
      <div className="bg-white border border-[#CBD5E1] rounded-[2px] shadow-xs overflow-hidden">
        <div className="bg-[#205081] text-white px-4 py-2 flex items-center justify-between text-xs">
          <span className="font-bold uppercase tracking-wider text-[11px]">
            {isHi ? "राज्य एवं राष्ट्रीय प्रवेश स्थिति विवरण" : "State & National Enrolment Status Ledger"}
          </span>
          <span className="font-mono text-slate-200 text-[11px]">
            {isHi ? `रिपोर्टिंग राज्य: ${states.length} • लाइव अपडेटेड` : `Reporting States: ${states.length} • Updated Live`}
          </span>
        </div>

        {/* Flat horizontal government ledger */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 divide-y sm:divide-y-0 sm:divide-x divide-[#CBD5E1] text-xs">
          <div className="p-3.5 bg-[#F4F6F9]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block">
              {isHi ? "सत्यनिष्ठा स्कोर" : "Integrity Score"}
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
                  : "bg-[#FEF2F2] text-[#B42318]"
              }`}
            >
              {integrityScore >= 90 ? "High Compliance" : integrityScore >= 70 ? "Moderate" : "Reconciliation Active"}
            </span>
          </div>

          <div className="p-3.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block">
              {isHi ? "कुल प्रवेश" : "Total Admissions"}
            </span>
            <div className="font-mono text-2xl font-black text-[#102A43] mt-1">
              {totalStudents.toLocaleString()}
            </div>
            <span className="text-[10px] text-[#64748B]">Sanctioned Enrolment</span>
          </div>

          <div className="p-3.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block">
              {isHi ? "प्रमाणित प्रवेश" : "Verified"}
            </span>
            <div className="font-mono text-2xl font-black text-[#059669] mt-1">
              {verifiedCount.toLocaleString()}
            </div>
            <span className="text-[10px] font-mono font-bold text-[#059669]">{verifiedPct}% Compliant</span>
          </div>

          <div className="p-3.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block">
              {isHi ? "समीक्षा कतार" : "Review Queue"}
            </span>
            <div className="font-mono text-2xl font-black text-[#B42318] mt-1">
              {flaggedCount.toLocaleString()}
            </div>
            <span className="text-[10px] font-mono font-bold text-[#B42318]">{flaggedPct}% Discrepancies</span>
          </div>

          <div className="p-3.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block">
              {isHi ? "पंजीकृत कॉलेज" : "Colleges"}
            </span>
            <div className="font-mono text-2xl font-black text-[#102A43] mt-1">
              {national.institutions_reporting}
            </div>
            <span className="text-[10px] text-[#64748B]">Approved Institutions</span>
          </div>

          <div className="p-3.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block">
              {isHi ? "राज्य एवं संघ राज्य" : "States & UTs"}
            </span>
            <div className="font-mono text-2xl font-black text-[#102A43] mt-1">
              {states.length}
            </div>
            <span className="text-[10px] text-[#64748B]">Jurisdictions</span>
          </div>
        </div>
      </div>

      {/* 4. State & Quota Tables */}
      <div className="bg-white border border-[#CBD5E1] rounded-[2px] shadow-xs overflow-hidden">
        {/* Government Folder Navigation Tabs */}
        <div className="bg-[#EAEFF5] border-b border-[#CBD5E1] px-4 pt-2 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab("both")}
              className={`px-3.5 py-2 font-bold rounded-t-[2px] transition-colors cursor-pointer border-t border-x ${
                activeTab === "both"
                  ? "bg-white text-[#205081] border-t-2 border-t-[#FF9933] border-x-[#CBD5E1] -mb-[1px]"
                  : "bg-transparent text-[#475569] border-transparent hover:text-[#205081]"
              }`}
            >
              {isHi ? "संयुक्त दृश्य" : "Unified View"}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("states")}
              className={`px-3.5 py-2 font-bold rounded-t-[2px] transition-colors cursor-pointer border-t border-x ${
                activeTab === "states"
                  ? "bg-white text-[#205081] border-t-2 border-t-[#FF9933] border-x-[#CBD5E1] -mb-[1px]"
                  : "bg-transparent text-[#475569] border-transparent hover:text-[#205081]"
              }`}
            >
              {isHi ? "राज्यवार विवरण" : "State-Wise"}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("categories")}
              className={`px-3.5 py-2 font-bold rounded-t-[2px] transition-colors cursor-pointer border-t border-x ${
                activeTab === "categories"
                  ? "bg-white text-[#205081] border-t-2 border-t-[#FF9933] border-x-[#CBD5E1] -mb-[1px]"
                  : "bg-transparent text-[#475569] border-transparent hover:text-[#205081]"
              }`}
            >
              {isHi ? "कोटा वितरण" : "Quota Distribution"}
            </button>
          </div>

          <div className="text-[11px] font-mono text-[#64748B] pb-2 sm:pb-0">
            Directive: AICTE APH Regulations 2026-27
          </div>
        </div>

        <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-6 bg-white">
          {/* State Table */}
          {(activeTab === "both" || activeTab === "states") && (
            <div className={`space-y-2 ${activeTab === "states" ? "lg:col-span-2" : ""}`}>
              <div className="flex items-center justify-between pb-1">
                <span className="font-bold text-xs uppercase tracking-wider text-[#205081]">
                  {isHi ? "राज्य क्षेत्राधिकार अनुसार प्रवेश" : "Admissions by State Jurisdiction"}
                </span>
                {selectedStateFilter !== "ALL" && (
                  <button
                    type="button"
                    onClick={() => setSelectedStateFilter("ALL")}
                    className="text-[11px] font-bold text-[#205081] hover:underline cursor-pointer"
                  >
                    {isHi ? `फिल्टर हटाएं (${selectedStateFilter})` : `Clear Filter (${selectedStateFilter})`}
                  </button>
                )}
              </div>

              <div className="overflow-x-auto border border-[#CBD5E1]">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-[#205081] text-white uppercase text-[10px] font-bold">
                    <tr>
                      <th className="py-2 px-3 border-r border-[#112D4E] w-12 text-center">{isHi ? "क्र." : "Sr."}</th>
                      <th className="py-2 px-3 border-r border-[#112D4E]">{isHi ? "राज्य / केंद्रशासित प्रदेश" : "State or UT"}</th>
                      <th className="py-2 px-3 text-right border-r border-[#112D4E]">{isHi ? "प्रवेशित छात्र" : "Students"}</th>
                      <th className="py-2 px-3 text-right border-r border-[#112D4E]">{isHi ? "हिस्सा %" : "Share %"}</th>
                      <th className="py-2 px-3 text-center w-24">{isHi ? "कार्रवाई" : "Action"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#CBD5E1] text-[#202B36]">
                    {states.map((st, index) => {
                      const share = Math.round((st.students / totalStudents) * 100);
                      const isFiltered = selectedStateFilter === st.state;
                      return (
                        <tr
                          key={st.state}
                          onClick={() => setSelectedStateFilter(isFiltered ? "ALL" : st.state)}
                          className={`cursor-pointer transition-colors ${
                            isFiltered
                              ? "bg-[#EFF6FF] font-semibold"
                              : index % 2 === 0
                              ? "bg-white hover:bg-[#EAEFF5]"
                              : "bg-[#F4F6F9] hover:bg-[#EAEFF5]"
                          }`}
                        >
                          <td className="py-2.5 px-3 text-center font-bold text-[#64748B] border-r border-[#CBD5E1]">
                            {index + 1}
                          </td>
                          <td className="py-2.5 px-3 border-r border-[#CBD5E1]">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-[#102A43]">{st.state}</span>
                              {isFiltered && (
                                <span className="text-[9px] bg-[#205081] text-white px-1.5 py-0.2 rounded font-mono">
                                  {isHi ? "सक्रिय" : "ACTIVE"}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-[#102A43] border-r border-[#CBD5E1]">
                            {st.students.toLocaleString()}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-[#475569] border-r border-[#CBD5E1]">
                            {share}%
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span className="text-[11px] text-[#205081] font-bold hover:underline">
                              {isFiltered ? (isHi ? "हटाएं" : "Clear") : (isHi ? "फिल्टर" : "Filter")}
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
            <div className={`space-y-2 ${activeTab === "categories" ? "lg:col-span-2" : ""}`}>
              <div className="flex items-center justify-between pb-1">
                <span className="font-bold text-xs uppercase tracking-wider text-[#205081]">
                  {isHi ? "वैधानिक कोटा आवंटन" : "Statutory Quota Allocation"}
                </span>
                <span className="text-[10px] font-mono text-[#64748B]">AICTE APH Limits</span>
              </div>

              <div className="overflow-x-auto border border-[#CBD5E1]">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-[#205081] text-white uppercase text-[10px] font-bold">
                    <tr>
                      <th className="py-2 px-3 border-r border-[#112D4E] w-12 text-center">{isHi ? "क्र." : "Sr."}</th>
                      <th className="py-2 px-3 border-r border-[#112D4E]">{isHi ? "कोटा प्रवर्ग" : "Quota Category"}</th>
                      <th className="py-2 px-3 text-right border-r border-[#112D4E]">{isHi ? "छात्र" : "Count"}</th>
                      <th className="py-2 px-3 text-right border-r border-[#112D4E]">{isHi ? "हिस्सा %" : "Share %"}</th>
                      <th className="py-2 px-3 text-center w-28">{isHi ? "स्थिति" : "Status"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#CBD5E1] text-[#202B36]">
                    <tr className="bg-white hover:bg-[#EAEFF5]">
                      <td className="py-2.5 px-3 text-center font-bold text-[#64748B] border-r border-[#CBD5E1]">1</td>
                      <td className="py-2.5 px-3 font-semibold text-[#102A43] border-r border-[#CBD5E1]">
                        {isHi ? "भारतीय सामान्य एवं आरक्षित" : "Indian Domestic (General/Reserved)"}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold border-r border-[#CBD5E1]">{domesticCount.toLocaleString()}</td>
                      <td className="py-2.5 px-3 text-right font-mono border-r border-[#CBD5E1]">{domesticPct}%</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="px-1.5 py-0.5 bg-[#ECFDF5] text-[#059669] text-[9px] font-mono font-bold rounded-[2px] border border-[#A7F3D0]">
                          {isHi ? "वैध" : "VALID"}
                        </span>
                      </td>
                    </tr>
                    <tr className="bg-[#F4F6F9] hover:bg-[#EAEFF5]">
                      <td className="py-2.5 px-3 text-center font-bold text-[#64748B] border-r border-[#CBD5E1]">2</td>
                      <td className="py-2.5 px-3 font-semibold text-[#102A43] border-r border-[#CBD5E1]">
                        {isHi ? "अनिवासी भारतीय (NRI कोटा)" : "Non-Resident Indian (NRI Quota)"}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold border-r border-[#CBD5E1]">{effectiveNriStudents.toLocaleString()}</td>
                      <td className="py-2.5 px-3 text-right font-mono border-r border-[#CBD5E1]">{nriPct}%</td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`px-1.5 py-0.5 text-[9px] font-mono font-bold rounded-[2px] border ${
                            simulationMode === "quota_breach"
                              ? "bg-[#FEF2F2] text-[#B42318] border-[#FECDCA]"
                              : "bg-[#FFFBEB] text-[#D97706] border-[#FEDF89]"
                          }`}
                        >
                          {simulationMode === "quota_breach" ? (isHi ? "सीमा उल्लंघन (+४)" : "BREACH (+4)") : (isHi ? "सीमा में" : "IN LIMIT")}
                        </span>
                      </td>
                    </tr>
                    <tr className="bg-white hover:bg-[#EAEFF5]">
                      <td className="py-2.5 px-3 text-center font-bold text-[#64748B] border-r border-[#CBD5E1]">3</td>
                      <td className="py-2.5 px-3 font-semibold text-[#102A43] border-r border-[#CBD5E1]">
                        {isHi ? "भारतीय मूल के विदेशी नागरिक (OCI/PIO)" : "Overseas Citizen of India (OCI/PIO)"}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold border-r border-[#CBD5E1]">{national.oci_students.toLocaleString()}</td>
                      <td className="py-2.5 px-3 text-right font-mono border-r border-[#CBD5E1]">{ociPct}%</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="px-1.5 py-0.5 bg-[#F1F5F9] text-[#475569] text-[9px] font-mono font-bold rounded-[2px] border border-[#CBD5E1]">
                          {isHi ? "वैध" : "VALID"}
                        </span>
                      </td>
                    </tr>
                    <tr className="bg-[#F4F6F9] hover:bg-[#EAEFF5]">
                      <td className="py-2.5 px-3 text-center font-bold text-[#64748B] border-r border-[#CBD5E1]">4</td>
                      <td className="py-2.5 px-3 font-semibold text-[#102A43] border-r border-[#CBD5E1]">
                        {isHi ? "विदेशी नागरिक (अधि-संख्या)" : "Foreign Nationals (Supernumerary)"}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold border-r border-[#CBD5E1]">{national.fn_students.toLocaleString()}</td>
                      <td className="py-2.5 px-3 text-right font-mono border-r border-[#CBD5E1]">{fnPct}%</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="px-1.5 py-0.5 bg-[#F1F5F9] text-[#475569] text-[9px] font-mono font-bold rounded-[2px] border border-[#CBD5E1]">
                          {isHi ? "वैध" : "VALID"}
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

      {/* 5. Dynamic Flag Discrepancy Queue & Anomaly Inspector */}
      <div className="bg-white border border-[#CBD5E1] rounded-[2px] shadow-xs overflow-hidden">
        {/* Table Header & Interactive Filter Bar */}
        <div className="p-4 border-b border-[#CBD5E1] bg-[#EAEFF5] space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#205081]">
                {isHi ? "केंद्रीय सत्यापन एवं विसंगति रजिस्टर" : "Central Verification Register"}
              </div>
              <h2 className="text-sm sm:text-base font-bold text-[#102A43] mt-0.5">
                {isHi ? `विसंगति रिकॉर्ड (${filteredFlags.length} / ${flags.length})` : `Discrepancy Records (${filteredFlags.length} / ${flags.length})`}
              </h2>
            </div>

            {/* Quick Severity Filter Chips */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => setSelectedSeverity("ALL")}
                className={`px-2.5 py-1 rounded-[2px] font-bold text-xs transition-colors cursor-pointer border ${
                  selectedSeverity === "ALL"
                    ? "bg-[#205081] text-white border-[#205081]"
                    : "bg-white border-[#CBD5E1] text-[#475569] hover:bg-[#F4F6F9]"
                }`}
              >
                {isHi ? `सभी (${flags.length})` : `All (${flags.length})`}
              </button>
              <button
                type="button"
                onClick={() => setSelectedSeverity("CRITICAL")}
                className={`px-2.5 py-1 rounded-[2px] font-bold text-xs transition-colors cursor-pointer border ${
                  selectedSeverity === "CRITICAL"
                    ? "bg-[#B42318] text-white border-[#B42318]"
                    : "bg-white border-[#FECDCA] text-[#B42318] hover:bg-[#FEF2F2]"
                }`}
              >
                {isHi ? `अति-गंभीर (${criticalFlags})` : `Critical (${criticalFlags})`}
              </button>
              <button
                type="button"
                onClick={() => setSelectedSeverity("HIGH")}
                className={`px-2.5 py-1 rounded-[2px] font-bold text-xs transition-colors cursor-pointer border ${
                  selectedSeverity === "HIGH"
                    ? "bg-[#D97706] text-white border-[#D97706]"
                    : "bg-white border-[#FEDF89] text-[#D97706] hover:bg-[#FFFBEB]"
                }`}
              >
                {isHi ? `गंभीर (${highFlags})` : `High (${highFlags})`}
              </button>
              <button
                type="button"
                onClick={() => setSelectedSeverity("MEDIUM")}
                className={`px-2.5 py-1 rounded-[2px] font-bold text-xs transition-colors cursor-pointer border ${
                  selectedSeverity === "MEDIUM"
                    ? "bg-[#475569] text-white border-[#475569]"
                    : "bg-white border-[#CBD5E1] text-[#475569] hover:bg-[#F4F6F9]"
                }`}
              >
                {isHi ? `मध्यम (${mediumFlags})` : `Medium (${mediumFlags})`}
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
                placeholder={isHi ? "नाम, रोल नंबर, अपार आईडी, या कॉलेज का नाम खोजें..." : "Search by student name, roll no, APAAR ID, or college..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 border border-[#CBD5E1] bg-white text-xs text-[#102A43] rounded-[2px] focus:outline-none focus:border-[#205081]"
              />
            </div>

            <select
              value={selectedRuleCode}
              onChange={(e) => setSelectedRuleCode(e.target.value)}
              className="w-full sm:w-auto px-3 py-1.5 border border-[#CBD5E1] bg-white text-xs font-semibold text-[#102A43] rounded-[2px] focus:outline-none focus:border-[#205081] cursor-pointer"
            >
              <option value="ALL">{isHi ? "सभी निरीक्षण नियम" : "All Inspection Rules"}</option>
              <option value="DUPLICATE_ENROLMENT">{isHi ? "दोहरा नामांकन (अंतर-राज्य)" : "Duplicate Admission (Cross-State)"}</option>
              <option value="INTAKE_LIMIT_EXCEEDED">{isHi ? "स्वीकृत क्षमता से अधिक" : "Intake Over Capacity"}</option>
              <option value="INVALID_APAAR_FORMAT">{isHi ? "अमान्य अपार संरचना" : "Invalid APAAR Syntax"}</option>
            </select>
          </div>
        </div>

        {/* Dynamic Interactive Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px] border-collapse text-left text-xs">
            <thead className="bg-[#205081] text-white uppercase text-[10px] font-bold">
              <tr>
                <th scope="col" className="w-12 px-3 py-2.5 border-r border-[#112D4E] text-center">{isHi ? "क्र." : "Sr."}</th>
                <th scope="col" className="w-24 px-3 py-2.5 border-r border-[#112D4E]">{isHi ? "गंभीरता" : "Severity"}</th>
                <th scope="col" className="px-3 py-2.5 border-r border-[#112D4E]">{isHi ? "निरीक्षण नियम" : "Discrepancy Rule"}</th>
                <th scope="col" className="px-3 py-2.5 border-r border-[#112D4E]">{isHi ? "छात्र विवरण" : "Student Details"}</th>
                <th scope="col" className="px-3 py-2.5 border-r border-[#112D4E] font-mono">{isHi ? "अपार आईडी" : "APAAR ID"}</th>
                <th scope="col" className="px-3 py-2.5 border-r border-[#112D4E]">{isHi ? "पंजीकृत कॉलेज" : "College"}</th>
                <th scope="col" className="px-3 py-2.5 text-center border-r border-[#112D4E]">{isHi ? "अंक" : "Score"}</th>
                <th scope="col" className="px-3 py-2.5 text-center w-24">{isHi ? "कार्रवाई" : "Action"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#CBD5E1] text-[#102A43]">
              {filteredFlags.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-xs text-[#64748B]">
                    {isHi ? "खोज मानदंडों के अनुसार कोई विसंगति रिकॉर्ड नहीं मिला।" : "No records match criteria."}
                  </td>
                </tr>
              ) : (
                filteredFlags.map((flag, idx) => {
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
                            : idx % 2 === 0
                            ? "bg-white hover:bg-[#EAEFF5]"
                            : "bg-[#F4F6F9] hover:bg-[#EAEFF5]"
                        }`}
                      >
                        <td className="px-3 py-2.5 text-center font-bold text-[#64748B] border-r border-[#CBD5E1]">
                          {idx + 1}
                        </td>

                        <td className="whitespace-nowrap px-3 py-2.5 border-r border-[#CBD5E1]">
                          <span
                            className={`inline-block px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase rounded-[2px] border ${
                              isCrit
                                ? "bg-[#FDF0EF] border-[#FECDCA] text-[#B42318]"
                                : isHigh
                                ? "bg-[#FFF7E6] border-[#FEDF89] text-[#B54708]"
                                : "bg-[#F4F6F8] border-[#CBD5E1] text-[#344054]"
                            }`}
                          >
                            {isCrit ? (isHi ? "अति-गंभीर" : "Critical") : isHigh ? (isHi ? "गंभीर" : "High") : (isHi ? "मध्यम" : "Medium")}
                          </span>
                        </td>

                        <td className="px-3 py-2.5 border-r border-[#CBD5E1]">
                          <div className="font-bold text-[#102A43] flex flex-wrap items-center gap-1.5">
                            <span>{flag.title}</span>
                            {isSimFlag && (
                              <span className="inline-flex items-center gap-0.5 px-1 py-0.2 text-[9px] font-mono font-bold bg-[#FF9933] text-white rounded-[2px]">
                                <Zap className="w-2.5 h-2.5 fill-current" />
                                {isHi ? "लाइव टेस्ट" : "LIVE SIM"}
                              </span>
                            )}
                            {isExpanded ? (
                              <ChevronUp className="w-3.5 h-3.5 text-[#205081]" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5 text-[#64748B]" />
                            )}
                          </div>
                          <div className="font-mono text-[10px] text-[#64748B]">
                            {flag.rule_code}
                          </div>
                        </td>

                        <td className="whitespace-nowrap px-3 py-2.5 border-r border-[#CBD5E1]">
                          <div className="font-semibold text-[#102A43]">
                            {flag.students?.full_name || t("Name unavailable")}
                          </div>
                          <div className="font-mono text-[10px] text-[#64748B]">
                            {isHi ? "रोल: " : "Roll: "}{flag.students?.institutional_student_id || flag.student_id}
                          </div>
                        </td>

                        <td className="whitespace-nowrap px-3 py-2.5 font-mono text-xs text-[#334155] border-r border-[#CBD5E1]">
                          {formatMaskedApaar(flag.students?.apaar_id)}
                        </td>

                        <td className="px-3 py-2.5 border-r border-[#CBD5E1]">
                          <div className="font-medium text-[#102A43]">
                            {flag.institutions?.name || t("Institution unavailable")}
                          </div>
                          <div className="text-[10px] text-[#64748B]">
                            {flag.institutions?.state || t("State unavailable")}
                          </div>
                        </td>

                        <td className="whitespace-nowrap px-3 py-2.5 text-center font-mono font-bold border-r border-[#CBD5E1]">
                          <span
                            className={
                              (flag.students?.integrity_score || 0) < 70
                                ? "text-[#B42318]"
                                : "text-[#D97706]"
                            }
                          >
                            {flag.students?.integrity_score ?? 100}
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-3 py-2.5 text-center" onClick={(e) => e.stopPropagation()}>
                          <Link
                            href={`/aicte/students/${flag.student_id}`}
                            className="inline-flex items-center gap-1 bg-[#205081] text-white hover:bg-[#112D4E] px-2.5 py-1 text-xs font-bold rounded-[2px] transition-colors"
                          >
                            <span>{isHi ? "देखें" : "Inspect"}</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        </td>
                      </tr>

                      {/* Expandable Dossier Row Detail */}
                      {isExpanded && (
                        <tr className="bg-[#EAEFF5] border-b border-[#CBD5E1]">
                          <td colSpan={8} className="p-3 sm:p-4">
                            <div className="bg-white border border-[#CBD5E1] p-3 sm:p-4 rounded-[2px] space-y-2 text-xs">
                              <div className="flex items-center justify-between pb-2 border-b border-[#CBD5E1]">
                                <span className="font-bold text-[#102A43] text-xs flex items-center gap-1.5">
                                  <span>{isHi ? `केस डोजियर: ${flag.rule_code}` : `Case Dossier: ${flag.rule_code}`}</span>
                                  {isSimFlag && (
                                    <span className="text-[10px] font-mono text-[#FF9933] font-bold">
                                      [SIH-2026-LIVE-SCENARIO]
                                    </span>
                                  )}
                                </span>
                                <span className="text-[11px] font-mono text-[#64748B]">
                                  {isHi ? `प्रकरण क्र.: ${flag.id}` : `Flag ID: ${flag.id}`}
                                </span>
                              </div>
                              <p className="text-[#334155] leading-relaxed">
                                {flag.explanation || "Discrepancy flagged under AICTE Approval Process Handbook (APH) validation check."}
                              </p>
                              {flag.recommended_action && (
                                <p className="text-[11px] text-[#B42318] bg-[#FEF2F2] border border-[#FECDCA] p-2 rounded-[2px]">
                                  <strong>{isHi ? "सिफारिश की गई कार्रवाई: " : "Recommended Action: "}</strong> {flag.recommended_action}
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
                                  {isHi ? "रिपोर्टिंग कॉलेज: " : "Reporting College: "}<strong className="text-[#102A43]">{flag.institutions?.name}</strong>
                                </span>
                                <span className="text-slate-300">|</span>
                                <span className="text-[#64748B]">
                                  {isHi ? "क्षेत्राधिकार: " : "Jurisdiction: "}<strong className="text-[#102A43]">{flag.institutions?.state}</strong>
                                </span>
                                <span className="text-slate-300">|</span>
                                <Link
                                  href={`/aicte/students/${flag.student_id}`}
                                  className="text-[#2563EB] font-bold hover:underline"
                                >
                                  {isHi ? "पूरा डोजियर खोलें →" : "Open Full Dossier →"}
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
