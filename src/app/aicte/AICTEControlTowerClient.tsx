"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { NationalSummary, StateSummary, ValidationFlag } from "@/lib/types";
import { formatMaskedApaar, getSeverityStyle } from "@/lib/security";

interface Props {
  initialNational: NationalSummary;
  initialStates: StateSummary[];
  initialFlags: ValidationFlag[];
}

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
  const [, startTransition] = useTransition();

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 space-y-6">
      {/* Page Title & Action Bar */}
      <div className="bg-white border border-[#D8DEE6] p-5 rounded-[2px] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[10px] tracking-wider uppercase font-semibold text-[#5B6573]">
            Central Regulatory Oversight
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#17365D] mt-0.5">
            AICTE National Enrolment Control Tower
          </h1>
          <p className="text-xs text-[#5B6573] mt-1 max-w-2xl leading-relaxed">
            Real-time surveillance console for verifying multi-institution enrolment duplicates, sanctioned seat intake compliance, and APAAR identifiers.
          </p>
        </div>

        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <button
            onClick={handleRefresh}
            disabled={isRunning}
            className="px-3 py-1.5 bg-white border border-[#D8DEE6] hover:bg-[#F4F6F8] text-[#202B36] text-xs font-semibold rounded-[2px] transition-colors cursor-pointer"
          >
            {isRunning ? "Refreshing..." : "Refresh Data"}
          </button>
          <button
            onClick={handleRunIntegrity}
            disabled={isRunning}
            className="px-3.5 py-1.5 bg-[#C87524] hover:bg-[#a65f1a] text-white text-xs font-semibold rounded-[2px] transition-colors cursor-pointer disabled:opacity-50"
          >
            {isRunning ? "Executing..." : "Execute Integrity Engine"}
          </button>
        </div>
      </div>

      {/* Operational Metric Ledger Strip */}
      <div className="bg-white border border-[#D8DEE6] rounded-[2px] overflow-hidden">
        <div className="grid grid-cols-2 lg:grid-cols-5 divide-y lg:divide-y-0 lg:divide-x divide-[#D8DEE6]">
          <div className="p-4">
            <div className="text-[11px] font-semibold text-[#5B6573] uppercase tracking-wide">
              Total Enrolments
            </div>
            <div className="text-2xl font-bold text-[#17365D] mt-1 font-mono">
              {national.total_students}
            </div>
            <div className="text-[11px] text-[#5B6573] mt-0.5">
              Across all reporting technical institutes
            </div>
          </div>

          <div className="p-4">
            <div className="text-[11px] font-semibold text-[#5B6573] uppercase tracking-wide">
              Verified Compliant
            </div>
            <div className="text-2xl font-bold text-[#237A52] mt-1 font-mono">
              {national.verified_students}
            </div>
            <div className="text-[11px] text-[#237A52] mt-0.5">
              {Math.round((national.verified_students / (national.total_students || 1)) * 100)}% verified with APAAR
            </div>
          </div>

          <div className="p-4">
            <div className="text-[11px] font-semibold text-[#5B6573] uppercase tracking-wide">
              Flagged Discrepancies
            </div>
            <div className="text-2xl font-bold text-[#B42318] mt-1 font-mono">
              {national.flagged_students}
            </div>
            <div className="text-[11px] text-[#B42318] mt-0.5">
              Identified regulatory anomalies
            </div>
          </div>

          <div className="p-4">
            <div className="text-[11px] font-semibold text-[#5B6573] uppercase tracking-wide">
              Reporting Colleges
            </div>
            <div className="text-2xl font-bold text-[#17365D] mt-1 font-mono">
              {national.institutions_reporting}
            </div>
            <div className="text-[11px] text-[#5B6573] mt-0.5">
              Institutions with active data feed
            </div>
          </div>

          <div className="p-4 col-span-2 lg:col-span-1">
            <div className="text-[11px] font-semibold text-[#5B6573] uppercase tracking-wide">
              Council Integrity Score
            </div>
            <div className="text-2xl font-bold text-[#17365D] mt-1 font-mono">
              {national.avg_integrity_score} / 100
            </div>
            <div className="text-[11px] text-[#5B6573] mt-0.5">
              National statutory threshold: 70.0
            </div>
          </div>
        </div>
      </div>

      {/* State Distribution & Category Ledgers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* State Admissions Chart */}
        <div className="lg:col-span-2 bg-white border border-[#D8DEE6] rounded-[2px] p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#D8DEE6]">
            <div>
              <h2 className="text-sm font-bold text-[#17365D] uppercase tracking-wider">
                State-Wise Admission Distribution
              </h2>
              <p className="text-xs text-[#5B6573]">
                Total reporting student enrolments grouped by state jurisdiction
              </p>
            </div>
            <span className="text-[11px] font-mono text-[#5B6573] bg-[#F4F6F8] px-2 py-0.5 border border-[#D8DEE6]">
              {states.length} Jurisdictions
            </span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={states} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis
                  dataKey="state"
                  stroke="#5B6573"
                  fontSize={11}
                  tickLine={false}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis stroke="#5B6573" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #D8DEE6",
                    borderRadius: "2px",
                    fontSize: "12px",
                    color: "#202B36",
                  }}
                />
                <Bar dataKey="students" fill="#17365D" radius={[0, 0, 0, 0]} name="Students" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quota & Nationality Table */}
        <div className="bg-white border border-[#D8DEE6] rounded-[2px] p-5 space-y-4">
          <div className="pb-3 border-b border-[#D8DEE6]">
            <h2 className="text-sm font-bold text-[#17365D] uppercase tracking-wider">
              Enrolment Quota Breakdown
            </h2>
            <p className="text-xs text-[#5B6573]">
              Supernumerary and domestic category distribution
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#F4F6F8] text-[#5B6573] text-[10px] uppercase font-semibold border-b border-[#D8DEE6]">
                <tr>
                  <th className="py-2 px-3">Quota Category</th>
                  <th className="py-2 px-3 text-right">Admitted</th>
                  <th className="py-2 px-3 text-right">Ratio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D8DEE6] font-mono text-[11px]">
                <tr>
                  <td className="py-2.5 px-3 font-sans text-xs">Indian Domestic</td>
                  <td className="py-2.5 px-3 text-right font-bold text-[#17365D]">
                    {national.total_students - (national.nri_students + national.oci_students + national.fn_students)}
                  </td>
                  <td className="py-2.5 px-3 text-right text-[#5B6573]">
                    {Math.round(((national.total_students - (national.nri_students + national.oci_students + national.fn_students)) / (national.total_students || 1)) * 100)}%
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-sans text-xs">NRI Quota</td>
                  <td className="py-2.5 px-3 text-right font-bold text-[#17365D]">
                    {national.nri_students}
                  </td>
                  <td className="py-2.5 px-3 text-right text-[#5B6573]">
                    {((national.nri_students / (national.total_students || 1)) * 100).toFixed(1)}%
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-sans text-xs">OCI Enrolments</td>
                  <td className="py-2.5 px-3 text-right font-bold text-[#17365D]">
                    {national.oci_students}
                  </td>
                  <td className="py-2.5 px-3 text-right text-[#5B6573]">
                    {((national.oci_students / (national.total_students || 1)) * 100).toFixed(1)}%
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-sans text-xs">Foreign Nationals (FN)</td>
                  <td className="py-2.5 px-3 text-right font-bold text-[#17365D]">
                    {national.fn_students}
                  </td>
                  <td className="py-2.5 px-3 text-right text-[#5B6573]">
                    {((national.fn_students / (national.total_students || 1)) * 100).toFixed(1)}%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Active Flag Queue Table */}
      <div className="bg-white border border-[#D8DEE6] rounded-[2px] overflow-hidden">
        {/* Table Header & Controls */}
        <div className="p-4 border-b border-[#D8DEE6] flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#F4F6F8]">
          <div>
            <h2 className="text-sm font-bold text-[#17365D] uppercase tracking-wider">
              Regulatory Discrepancy Queue ({flags.length} Active Records)
            </h2>
            <p className="text-xs text-[#5B6573] mt-0.5">
              Enrolment cases requiring inquiry, institutional explanation, or AICTE administrative action
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              placeholder="Search by Student, APAAR, or College..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3 py-1.5 bg-white border border-[#D8DEE6] text-xs text-[#202B36] rounded-[2px] focus:outline-none focus:border-[#17365D] w-56 sm:w-64"
            />

            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="px-3 py-1.5 bg-white border border-[#D8DEE6] text-xs text-[#202B36] rounded-[2px] focus:outline-none focus:border-[#17365D] cursor-pointer"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical Severity</option>
              <option value="HIGH">High Severity</option>
              <option value="MEDIUM">Medium Severity</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#F4F6F8] text-[#5B6573] uppercase text-[10px] tracking-wider font-semibold border-b border-[#D8DEE6]">
              <tr>
                <th className="py-2.5 px-4 w-28">Severity</th>
                <th className="py-2.5 px-4">Violation Rule</th>
                <th className="py-2.5 px-4">Student Name & Roll</th>
                <th className="py-2.5 px-4">Masked APAAR ID</th>
                <th className="py-2.5 px-4">Reporting Institution</th>
                <th className="py-2.5 px-4 text-center">Score</th>
                <th className="py-2.5 px-4 text-right">Administrative Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D8DEE6] text-[#202B36]">
              {filteredFlags.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#5B6573]">
                    No discrepancy flags match the current filter parameters.
                  </td>
                </tr>
              ) : (
                filteredFlags.map((flag) => {
                  const sevStyle = getSeverityStyle(flag.severity);
                  return (
                    <tr key={flag.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded-[2px] ${sevStyle.badge}`}
                        >
                          {flag.severity}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-[#17365D]">{flag.title}</div>
                        <div className="text-[10px] font-mono text-[#5B6573] mt-0.5">
                          {flag.rule_code}
                        </div>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-semibold text-[#202B36]">
                          {flag.students?.full_name || "Unknown"}
                        </div>
                        <div className="text-[11px] font-mono text-[#5B6573]">
                          Roll: {flag.students?.institutional_student_id || flag.student_id}
                        </div>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap font-mono text-[#5B6573]">
                        {formatMaskedApaar(flag.students?.apaar_id)}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-medium text-[#202B36]">
                          {flag.institutions?.name || "AICTE Institution"}
                        </div>
                        <div className="text-[10px] text-[#5B6573]">
                          {flag.institutions?.state || "State Jurisdiction"}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-center whitespace-nowrap font-mono font-bold">
                        <span
                          className={
                            (flag.students?.integrity_score || 0) < 70
                              ? "text-[#B42318]"
                              : "text-[#986500]"
                          }
                        >
                          {flag.students?.integrity_score ?? 100}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <Link
                          href={`/aicte/students/${flag.student_id}`}
                          className="px-2.5 py-1 text-[11px] font-semibold text-[#17365D] bg-white border border-[#17365D] hover:bg-[#17365D] hover:text-white rounded-[2px] transition-colors"
                        >
                          Inspect Dossier &rarr;
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
