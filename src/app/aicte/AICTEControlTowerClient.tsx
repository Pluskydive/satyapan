"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  Users,
  ShieldCheck,
  AlertTriangle,
  Building2,
  RefreshCw,
  Search,
  ExternalLink,
  ChevronRight,
  Filter,
  Globe,
  Award,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { NationalSummary, StateSummary, ValidationFlag } from "@/lib/types";
import { formatMaskedApaar, getSeverityStyle } from "@/lib/security";

interface Props {
  initialNational: NationalSummary;
  initialStates: StateSummary[];
  initialFlags: ValidationFlag[];
}

const PIE_COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ec4899"];

export default function AICTEControlTowerClient({
  initialNational,
  initialStates,
  initialFlags,
}: Props) {
  const [national, setNational] = useState(initialNational);
  const [states, setStates] = useState(initialStates);
  const [flags, setFlags] = useState(initialFlags);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSeverity, setSelectedSeverity] = useState<string>("ALL");
  const [isRunning, setIsRunning] = useState(false);
  const [isPending, startTransition] = useTransition();

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

  // Filter flags
  const filteredFlags = flags.filter((f) => {
    const matchesSeverity =
      selectedSeverity === "ALL" || f.severity.toUpperCase() === selectedSeverity;
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
    return matchesSeverity && matchesSearch;
  });

  const nationalityData = [
    { name: "Indian Domestic", value: national.total_students - (national.nri_students + national.oci_students + national.fn_students) },
    { name: "NRI Quota", value: national.nri_students },
    { name: "OCI Students", value: national.oci_students },
    { name: "Foreign Nationals", value: national.fn_students },
  ].filter((d) => d.value > 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              AICTE National Control Tower
            </h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
              LIVE SURVEILLANCE
            </span>
          </div>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Real-time cross-institutional enrolment monitoring & anomaly detection system.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            disabled={isRunning}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-semibold transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRunning ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleRunIntegrity}
            disabled={isRunning}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer active:scale-95 disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRunning ? "animate-spin" : ""}`} />
            <span>{isRunning ? "Verifying..." : "Run Integrity Checks"}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase">Total Students</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-black text-white mt-2">{national.total_students}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Across all institutions</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase">Verified</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-400 mt-2">{national.verified_students}</p>
          <p className="text-[11px] text-emerald-400/80 mt-0.5">
            {Math.round((national.verified_students / (national.total_students || 1)) * 100)}% Compliance
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase">Flagged</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-2xl font-black text-rose-400 mt-2">{national.flagged_students}</p>
          <p className="text-[11px] text-rose-400/80 mt-0.5">Under investigation</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase">Colleges</span>
            <Building2 className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-400 mt-2">{national.institutions_reporting}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Active data feeds</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase">Integrity Index</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-400 mt-2">{national.avg_integrity_score}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Out of 100 benchmark</p>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* State Wise Distribution */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Student Admissions by State</h3>
              <p className="text-slate-400 text-xs">Total reporting enrolments across regional jurisdictions</p>
            </div>
            <span className="text-xs font-mono text-slate-500">{states.length} States</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={states} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis
                  dataKey="state"
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  itemStyle={{ color: "#f8fafc" }}
                />
                <Bar dataKey="students" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Students" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Nationality / Quota Breakdown */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-xl space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white">Nationality & Quota Breakdown</h3>
            <p className="text-slate-400 text-xs">Domestic vs Supernumerary Quota Distribution</p>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={nationalityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={65}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {nationalityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                    fontSize: "11px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-800 text-xs">
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Indian Domestic</span>
              </span>
              <span className="font-semibold">
                {national.total_students - (national.nri_students + national.oci_students + national.fn_students)}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span>NRI Quota</span>
              </span>
              <span className="font-semibold">{national.nri_students}</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>OCI Students</span>
              </span>
              <span className="font-semibold">{national.oci_students}</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-pink-500" />
                <span>Foreign Nationals</span>
              </span>
              <span className="font-semibold">{national.fn_students}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Flag Queue */}
      <div className="rounded-2xl bg-slate-900/70 border border-slate-800 shadow-xl overflow-hidden space-y-4 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-bold text-white">Active Anomaly & Flag Queue</h3>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                {flags.length} Open
              </span>
            </div>
            <p className="text-slate-400 text-xs mt-0.5">
              Identified violations requiring administrative sanction, institutional inquiry, or remediation.
            </p>
          </div>

          {/* Controls: Search and Severity Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search student, APAAR, college..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-amber-500 transition-colors w-48 sm:w-64"
              />
            </div>

            <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px]">
              {["ALL", "CRITICAL", "HIGH", "MEDIUM"].map((sev) => (
                <button
                  key={sev}
                  onClick={() => setSelectedSeverity(sev)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                    selectedSeverity === sev
                      ? "bg-slate-800 text-amber-400 font-bold"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Flag Table */}
        <div className="overflow-x-auto border border-slate-800 rounded-xl">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Rule Violation</th>
                <th className="py-3 px-4">Student Details</th>
                <th className="py-3 px-4">Reporting College</th>
                <th className="py-3 px-4">Integrity Score</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredFlags.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No open flags match your search criteria.
                  </td>
                </tr>
              ) : (
                filteredFlags.map((flag) => {
                  const sevStyle = getSeverityStyle(flag.severity);
                  return (
                    <tr
                      key={flag.id}
                      className="hover:bg-slate-800/40 transition-colors group"
                    >
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${sevStyle.badge}`}
                        >
                          {flag.severity}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-slate-200">{flag.title}</p>
                        <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                          {flag.rule_code}
                        </p>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <p className="font-semibold text-white">
                          {flag.students?.full_name || "Unknown"}
                        </p>
                        <p className="text-[11px] text-slate-400 font-mono">
                          APAAR: {formatMaskedApaar(flag.students?.apaar_id)}
                        </p>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <p className="font-medium text-slate-200">
                          {flag.institutions?.name || "AICTE Institute"}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {flag.institutions?.state || "India"}
                        </p>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`font-mono font-bold ${
                              (flag.students?.integrity_score || 0) < 70
                                ? "text-rose-400"
                                : "text-amber-400"
                            }`}
                          >
                            {flag.students?.integrity_score ?? 100} / 100
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <Link
                          href={`/aicte/students/${flag.student_id}`}
                          className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[11px] font-semibold transition-all group-hover:bg-amber-500 group-hover:text-slate-950"
                        >
                          <span>Risk Dossier</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
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
