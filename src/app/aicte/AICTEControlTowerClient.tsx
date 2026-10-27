"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  CartesianGrid,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { NationalSummary, StateSummary, ValidationFlag } from "@/lib/types";
import { formatMaskedApaar } from "@/lib/security";
import { useLanguage } from "@/components/LanguageProvider";

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
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-8 sm:py-8">
      {/* Top Context & Action Bar */}
      <div className="flex flex-col gap-4 border border-[#D8DEE6] bg-white p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6 rounded-[6px] shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#102A43]">
            National Admission Overview
          </h1>
          <p className="mt-1 max-w-3xl text-xs sm:text-sm text-[#5B6573]">
            Track student enrolment numbers across states, verify college intake quotas, and review duplicate admissions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRunning}
            className="min-h-9 border border-[#CBD5E1] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#17365D] transition-colors hover:bg-[#F4F6F8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#17365D] disabled:opacity-50 rounded-[4px] cursor-pointer"
          >
            {isRunning ? t("Refreshing…") : "Refresh"}
          </button>
          <button
            type="button"
            onClick={handleRunIntegrity}
            disabled={isRunning}
            className="min-h-9 bg-[#17365D] hover:bg-[#102A43] px-4 py-1.5 text-xs font-bold text-white transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#17365D] disabled:opacity-50 rounded-[4px] cursor-pointer shadow-xs"
          >
            {isRunning ? "Checking Records…" : "Run Record Check"}
          </button>
        </div>
      </div>

      {/* Unified National Admission Statistics Ribbon */}
      <div className="bg-white border border-[#CBD5E1] rounded-[6px] shadow-xs overflow-hidden">
        <div className="bg-[#102A43] text-white px-5 py-2.5 flex flex-wrap items-center justify-between text-xs">
          <span className="font-bold uppercase tracking-wider text-[11px] text-[#F59E0B]">
            {t("National Enrolment Summary Ledger")}
          </span>
          <span className="text-slate-300 text-[11px]">
            {t("Central Technical Education Registry")}
          </span>
        </div>

        <div className="p-4 sm:p-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-4 divide-y sm:divide-y-0 sm:divide-x divide-[#E2E8F0]">
          {/* Metric 1 */}
          <div className="sm:px-3">
            <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider block">
              {t("Enrolment records")}
            </span>
            <div className="mt-1.5 font-mono text-2xl sm:text-3xl font-extrabold text-[#102A43]">
              {national.total_students.toLocaleString()}
            </div>
            <p className="mt-1 text-[11px] text-[#64748B]">
              {t("Total reported admissions")}
            </p>
          </div>

          {/* Metric 2 */}
          <div className="sm:px-4 pt-3 sm:pt-0">
            <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider block">
              {t("Verified records")}
            </span>
            <div className="mt-1.5 font-mono text-2xl sm:text-3xl font-extrabold text-[#102A43]">
              {national.verified_students.toLocaleString()}
            </div>
            <p className="mt-1 text-[11px] text-[#64748B]">
              {Math.round((national.verified_students / (national.total_students || 1)) * 100)}% {t("adherence rate")}
            </p>
          </div>

          {/* Metric 3 */}
          <div className="sm:px-4 pt-3 sm:pt-0">
            <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider block">
              {t("Flagged records")}
            </span>
            <div className="mt-1.5 font-mono text-2xl sm:text-3xl font-extrabold text-[#102A43]">
              {national.flagged_students.toLocaleString()}
            </div>
            <p className="mt-1 text-[11px] text-[#64748B]">
              {t("Pending review queue")}
            </p>
          </div>

          {/* Metric 4 */}
          <div className="sm:px-4 pt-3 sm:pt-0">
            <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider block">
              {t("Institutions represented")}
            </span>
            <div className="mt-1.5 font-mono text-2xl sm:text-3xl font-extrabold text-[#102A43]">
              {national.institutions_reporting.toLocaleString()}
            </div>
            <p className="mt-1 text-[11px] text-[#64748B]">
              {t("Participating colleges")}
            </p>
          </div>

          {/* Metric 5 */}
          <div className="col-span-2 sm:col-span-1 sm:px-4 pt-3 sm:pt-0">
            <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider block">
              {t("Average integrity score")}
            </span>
            <div className="mt-1.5 font-mono text-2xl sm:text-3xl font-extrabold text-[#102A43]">
              {national.avg_integrity_score} / 100
            </div>
            <p className="mt-1 text-[11px] text-[#64748B]">
              {t("National index rating")}
            </p>
          </div>
        </div>
      </div>

      {/* State Distribution & Category Ledgers */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* State Admissions Chart */}
        <div className="space-y-4 border border-[#D8DEE6] bg-white p-5 lg:col-span-2 sm:p-6 rounded-[2px]">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#D8DEE6] pb-3">
            <div>
              <h2 className="text-base font-bold text-[#17365D]">
                {t("Enrolments by state or territory")}
              </h2>
              <p className="mt-0.5 text-xs text-[#5B6573]">
                {t("Number of records in each listed state or territory")}
              </p>
            </div>
            <span className="border border-[#D8DEE6] bg-[#F4F6F8] px-2.5 py-1 text-xs font-mono font-semibold text-[#17365D]">
              {states.length} {t("jurisdictions")}
            </span>
          </div>

          <div className="h-80 w-full" role="img" aria-label={t("Bar chart of enrolment records by state or territory")}>
            {states.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={states} layout="vertical" margin={{ top: 10, right: 24, left: 4, bottom: 10 }}>
                  <CartesianGrid stroke="#E8EDF2" strokeDasharray="3 3" horizontal={false} />
                  <XAxis
                    type="number"
                    stroke="#5B6573"
                    tick={{ fontSize: 11, fill: "#5B6573" }}
                    tickLine={false}
                    axisLine={{ stroke: "#D8DEE6" }}
                    tickFormatter={(value) => Number(value).toLocaleString()}
                    label={{ value: t("Enrolments"), position: "insideBottomRight", offset: -4, style: { fill: "#5B6573", fontSize: 10 } }}
                  />
                  <YAxis
                    type="category"
                    dataKey="state"
                    width={116}
                    stroke="#5B6573"
                    tick={{ fontSize: 12, fill: "#202B36", fontWeight: 600 }}
                    tickLine={false}
                    axisLine={false}
                    interval={0}
                  />
                  <Tooltip
                    formatter={(value) => [Number(value ?? 0).toLocaleString(), t("Enrolments")]}
                    labelFormatter={(label) => String(label)}
                    contentStyle={{
                      backgroundColor: "#FFFFFF",
                      border: "1px solid #D8DEE6",
                      borderRadius: "2px",
                      fontSize: "12px",
                      color: "#202B36",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Bar dataKey="students" fill="#17365D" radius={[0, 2, 2, 0]} name={t("Enrolments")} barSize={22} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-[#5B6573]">
                {t("No state or territory summary is available.")}
              </div>
            )}
          </div>

          {/* Screen reader table summary */}
          <div className="sr-only">
            <table>
              <caption>{t("Enrolments by state or territory")}</caption>
              <thead>
                <tr>
                  <th scope="col">{t("State")}</th>
                  <th scope="col">{t("Enrolments")}</th>
                </tr>
              </thead>
              <tbody>
                {states.map((s) => (
                  <tr key={s.state}>
                    <td>{s.state}</td>
                    <td>{s.students}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quota & Nationality Table */}
        <div className="space-y-4 border border-[#D8DEE6] bg-white p-5 sm:p-6 rounded-[2px] flex flex-col justify-between">
          <div>
            <div className="pb-3 border-b border-[#D8DEE6]">
              <h2 className="text-base font-bold text-[#17365D]">
                {t("Enrolment category breakdown")}
              </h2>
              <p className="mt-0.5 text-xs text-[#5B6573]">
                {t("Records by the nationality categories in the dataset")}
              </p>
            </div>

            <div className="overflow-x-auto mt-3">
              <table className="w-full border-collapse text-left text-xs">
                <thead className="border-b border-[#D8DEE6] bg-[#F4F6F8] text-[10px] font-bold uppercase tracking-wider text-[#5B6573]">
                  <tr>
                    <th scope="col" className="px-3 py-2.5">{t("Category")}</th>
                    <th scope="col" className="px-3 py-2.5 text-right">{t("Records")}</th>
                    <th scope="col" className="px-3 py-2.5 text-right">{t("Share")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D8DEE6]">
                  <tr>
                    <td className="px-3 py-3 font-medium text-[#202B36]">{t("Indian domestic")}</td>
                    <td className="px-3 py-3 text-right font-mono font-bold text-[#17365D]">
                      {(national.total_students - (national.nri_students + national.oci_students + national.fn_students)).toLocaleString()}
                    </td>
                    <td className="px-3 py-3 text-right font-mono text-[#5B6573]">
                      {Math.round(((national.total_students - (national.nri_students + national.oci_students + national.fn_students)) / (national.total_students || 1)) * 100)}%
                    </td>
                  </tr>
                  <tr>
                    <td className="px-3 py-3 font-medium text-[#202B36]">{t("NRI")}</td>
                    <td className="px-3 py-3 text-right font-mono font-bold text-[#17365D]">
                      {national.nri_students.toLocaleString()}
                    </td>
                    <td className="px-3 py-3 text-right font-mono text-[#5B6573]">
                      {((national.nri_students / (national.total_students || 1)) * 100).toFixed(1)}%
                    </td>
                  </tr>
                  <tr>
                    <td className="px-3 py-3 font-medium text-[#202B36]">{t("OCI")}</td>
                    <td className="px-3 py-3 text-right font-mono font-bold text-[#17365D]">
                      {national.oci_students.toLocaleString()}
                    </td>
                    <td className="px-3 py-3 text-right font-mono text-[#5B6573]">
                      {((national.oci_students / (national.total_students || 1)) * 100).toFixed(1)}%
                    </td>
                  </tr>
                  <tr>
                    <td className="px-3 py-3 font-medium text-[#202B36]">{t("Foreign nationals")}</td>
                    <td className="px-3 py-3 text-right font-mono font-bold text-[#17365D]">
                      {national.fn_students.toLocaleString()}
                    </td>
                    <td className="px-3 py-3 text-right font-mono text-[#5B6573]">
                      {((national.fn_students / (national.total_students || 1)) * 100).toFixed(1)}%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-3 border-t border-[#D8DEE6] text-[10px] text-[#5B6573] leading-relaxed">
            Supernumerary quota allotments are governed under AICTE Approval Process Handbook (APH) regulations.
          </div>
        </div>
      </div>

      {/* Active Flag Discrepancy Queue */}
      <div className="overflow-hidden border border-[#D8DEE6] bg-white rounded-[2px]">
        {/* Table Header & Search Controls */}
        <div className="flex flex-col justify-between gap-4 border-b border-[#D8DEE6] bg-[#F4F6F8] p-5 md:flex-row md:items-center">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#5B6573]">
              Automated Record Verification
            </div>
            <h2 className="text-base font-bold text-[#17365D]">
              {t("Discrepancy queue")} <span className="font-normal text-[#5B6573]">({flags.length} {t("Records") || "records"})</span>
            </h2>
            <p className="mt-0.5 text-xs text-[#5B6573]">
              {t("Records surfaced by configured checks for further review.")}
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <label htmlFor="flag-search-input" className="sr-only">
              {t("Search discrepancy records")}
            </label>
            <input
              id="flag-search-input"
              type="text"
              placeholder={t("Search name, APAAR, institution, or rule")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="min-h-10 w-full sm:w-72 border border-[#8B95A1] bg-white px-3 py-1.5 text-xs text-[#202B36] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#17365D] rounded-[2px]"
            />

            <label htmlFor="severity-filter-select" className="sr-only">
              {t("Filter by severity")}
            </label>
            <select
              id="severity-filter-select"
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="min-h-10 border border-[#8B95A1] bg-white px-3 py-1.5 text-xs font-semibold text-[#17365D] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#17365D] rounded-[2px] cursor-pointer"
            >
              <option value="ALL">{t("All severities")}</option>
              <option value="CRITICAL">{t("Critical")}</option>
              <option value="HIGH">{t("High")}</option>
              <option value="MEDIUM">{t("Medium")}</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] border-collapse text-left text-xs">
            <thead className="border-b border-[#D8DEE6] bg-[#F4F6F8] text-[10px] font-bold uppercase tracking-wider text-[#5B6573]">
              <tr>
                <th scope="col" className="w-28 px-4 py-3">{t("Severity")}</th>
                <th scope="col" className="px-4 py-3">{t("Rule")}</th>
                <th scope="col" className="px-4 py-3">{t("Student and roll")}</th>
                <th scope="col" className="px-4 py-3 font-mono">{t("Masked APAAR ID")}</th>
                <th scope="col" className="px-4 py-3">{t("Institution")}</th>
                <th scope="col" className="px-4 py-3 text-center">{t("Score")}</th>
                <th scope="col" className="px-4 py-3 text-right">{t("Review")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D8DEE6] text-[#202B36]">
              {filteredFlags.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-xs text-[#5B6573]">
                    {t("No discrepancy records match these filters.")}
                  </td>
                </tr>
              ) : (
                filteredFlags.map((flag) => {
                  const isCrit = flag.severity.toUpperCase() === "CRITICAL";
                  const isHigh = flag.severity.toUpperCase() === "HIGH";

                  return (
                    <tr key={flag.id} className="transition-colors hover:bg-slate-50">
                      <td className="whitespace-nowrap px-4 py-3.5">
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

                      <td className="px-4 py-3.5">
                        <div className="font-bold text-[#17365D]">{flag.title}</div>
                        <div className="font-mono text-[10px] text-[#5B6573] mt-0.5">
                          {flag.rule_code}
                        </div>
                      </td>

                      <td className="whitespace-nowrap px-4 py-3.5">
                        <div className="font-semibold text-[#202B36]">
                          {flag.students?.full_name || t("Name unavailable")}
                        </div>
                        <div className="font-mono text-[11px] text-[#5B6573] mt-0.5">
                          {t("Roll")}: {flag.students?.institutional_student_id || flag.student_id}
                        </div>
                      </td>

                      <td className="whitespace-nowrap px-4 py-3.5 font-mono text-xs text-[#5B6573]">
                        {formatMaskedApaar(flag.students?.apaar_id)}
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="font-medium text-[#202B36]">
                          {flag.institutions?.name || t("Institution unavailable")}
                        </div>
                        <div className="text-[11px] text-[#5B6573] mt-0.5">
                          {flag.institutions?.state || t("State unavailable")}
                        </div>
                      </td>

                      <td className="whitespace-nowrap px-4 py-3.5 text-center font-mono font-bold">
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

                      <td className="whitespace-nowrap px-4 py-3.5 text-right">
                        <Link
                          href={`/aicte/students/${flag.student_id}`}
                          className="inline-flex min-h-8 items-center border border-[#17365D] bg-white px-3 py-1.5 text-xs font-bold text-[#17365D] transition-colors hover:bg-[#17365D] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#17365D] rounded-[2px]"
                        >
                          {t("Review record")} &rarr;
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
