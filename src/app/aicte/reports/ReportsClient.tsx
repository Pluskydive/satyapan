"use client";

import { useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import type { InstitutionSummary } from "@/lib/types";

type Report = "records" | "capacity" | "vigilance";

interface Props {
  institutions: InstitutionSummary[];
  mode: "demo" | "live";
}

function csvCell(value: unknown) {
  let text = String(value ?? "");
  if (/^[\s]*[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

function downloadCsv(fileName: string, rows: Array<Record<string, unknown>>, columns: string[]) {
  const csv = [
    columns.map(csvCell).join(","),
    ...rows.map((row) => columns.map((key) => csvCell(row[key])).join(",")),
  ].join("\r\n");
  const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${fileName}_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function ReportsClient({ institutions, mode }: Props) {
  const { t } = useLanguage();
  const [activeReport, setActiveReport] = useState<Report>("records");
  const tabs: Array<{ id: Report; label: string }> = [
    { id: "records", label: t("Institution records") },
    { id: "capacity", label: t("Intake reference") },
    { id: "vigilance", label: t("Cross-institution review") },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-8 py-6 space-y-6">
      <header className="bg-white border-2 border-[#1E3A5F] p-5 rounded-[4px] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <p className="text-[10px] tracking-wider uppercase font-bold text-[#5B6573]">{t("Administrative summaries")}</p>
            <span className="text-[9px] px-1.5 py-0.2 bg-[#FEF3C7] text-[#92400E] font-bold border border-[#F59E0B] rounded-[2px] uppercase">
              Team PRAMAANIT
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#102A43] mt-1">
            संस्थागत विनियामक रिपोर्ट <span className="text-base sm:text-lg font-bold text-[#17365D]">| Institutional Compliance Reports</span>
          </h1>
          <p className="text-sm text-[#5B6573] mt-2 max-w-3xl">
            {t("Certified enrolment summaries formatted for NIRF, NAAC, NBA audits, and parliamentary intake reconciliation.")}
          </p>
          <p className="text-xs font-semibold text-[#5B6573] mt-3" role="status">
            {mode === "demo" ? "SATYAPAN Active Sandbox Records" : t("Configured database records")}
          </p>
        </div>
        <button type="button" onClick={() => window.print()} className="px-3 py-2 bg-white border border-[#8B95A1] text-[#17365D] text-sm font-semibold rounded-[2px] self-start print:hidden cursor-pointer hover:bg-[#F4F6F8]">
          {t("Print this summary")}
        </button>
      </header>

      <div className="flex flex-wrap border-b border-[#D8DEE6] bg-white print:hidden" role="tablist" aria-label={t("Report views")}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`report-tab-${tab.id}`}
            aria-selected={activeReport === tab.id}
            aria-controls={`report-panel-${tab.id}`}
            onClick={() => setActiveReport(tab.id)}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 ${activeReport === tab.id ? "border-[#C87524] text-[#17365D] bg-[#F4F6F8]" : "border-transparent text-[#5B6573] hover:text-[#202B36]"}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeReport === "records" && (
        <section id="report-panel-records" role="tabpanel" aria-labelledby="report-tab-records" className="bg-white border border-[#D8DEE6] rounded-[2px] p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#D8DEE6] gap-3">
            <div>
              <h2 className="text-base font-bold text-[#17365D]">{t("Records by institution")}</h2>
              <p className="text-xs text-[#5B6573] mt-1">{t("Counts reflect database status labels. They do not confirm identity or enrolment.")}</p>
            </div>
            <button type="button" onClick={() => downloadCsv("institution_records", institutions.map((item) => ({
              institution_code: item.aicte_code,
              institution_name: item.name,
              state: item.state,
              approved_intake_reference: item.approved_intake,
              records_marked_verified_or_flagged: item.actual_enrolment,
              flagged_records: item.flagged_students,
            })), ["institution_code", "institution_name", "state", "approved_intake_reference", "records_marked_verified_or_flagged", "flagged_records"])} className="px-3 py-2 bg-[#17365D] text-white text-sm font-semibold rounded-[2px] self-start print:hidden">
              {t("Download CSV")}
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-[#F4F6F8] text-[#5B6573] text-xs border-b border-[#D8DEE6]">
                <tr>
                  <th scope="col" className="py-2.5 px-3">{t("Institution code")}</th>
                  <th scope="col" className="py-2.5 px-3">{t("Institution")}</th>
                  <th scope="col" className="py-2.5 px-3">{t("State")}</th>
                  <th scope="col" className="py-2.5 px-3 text-right">{t("Intake reference")}</th>
                  <th scope="col" className="py-2.5 px-3 text-right">{t("Records marked verified or flagged")}</th>
                  <th scope="col" className="py-2.5 px-3 text-right">{t("Flagged records")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D8DEE6] text-[#202B36]">
                {institutions.map((item) => (
                  <tr key={item.id}>
                    <td className="py-2.5 px-3 font-mono text-xs">{item.aicte_code}</td>
                    <td className="py-2.5 px-3 font-semibold">{item.name}</td>
                    <td className="py-2.5 px-3">{item.state}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums">{item.approved_intake}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums">{item.actual_enrolment}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums">{item.flagged_students}</td>
                  </tr>
                ))}
                {institutions.length === 0 && <tr><td colSpan={6} className="p-5 text-center text-sm text-[#5B6573]">{t("No institution records are available for this account.")}</td></tr>}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {activeReport === "capacity" && (
        <section id="report-panel-capacity" role="tabpanel" aria-labelledby="report-tab-capacity" className="bg-white border border-[#D8DEE6] rounded-[2px] p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#D8DEE6] gap-3">
            <div>
              <h2 className="text-base font-bold text-[#17365D]">{t("Recorded counts and intake references")}</h2>
              <p className="text-xs text-[#5B6573] mt-1">{t("This comparison is for review only. Confirm current intake figures with the appropriate authority before taking action.")}</p>
            </div>
            <button type="button" onClick={() => downloadCsv("intake_reference", institutions.map((item) => ({
              institution_code: item.aicte_code,
              institution_name: item.name,
              approved_intake_reference: item.approved_intake,
              additional_capacity_reference: item.supernumerary_capacity,
              total_capacity_reference: item.approved_intake + item.supernumerary_capacity,
              records_marked_verified_or_flagged: item.actual_enrolment,
              difference_from_capacity_reference: item.actual_enrolment - item.approved_intake - item.supernumerary_capacity,
            })), ["institution_code", "institution_name", "approved_intake_reference", "additional_capacity_reference", "total_capacity_reference", "records_marked_verified_or_flagged", "difference_from_capacity_reference"])} className="px-3 py-2 bg-[#17365D] text-white text-sm font-semibold rounded-[2px] self-start print:hidden">
              {t("Download CSV")}
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-[#F4F6F8] text-[#5B6573] text-xs border-b border-[#D8DEE6]">
                <tr>
                  <th scope="col" className="py-2.5 px-3">{t("Institution")}</th>
                  <th scope="col" className="py-2.5 px-3 text-right">{t("Approved intake reference")}</th>
                  <th scope="col" className="py-2.5 px-3 text-right">{t("Additional capacity reference")}</th>
                  <th scope="col" className="py-2.5 px-3 text-right">{t("Total capacity reference")}</th>
                  <th scope="col" className="py-2.5 px-3 text-right">{t("Records in database")}</th>
                  <th scope="col" className="py-2.5 px-3 text-right">{t("Difference")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D8DEE6] text-[#202B36]">
                {institutions.map((item) => {
                  const totalCapacity = item.approved_intake + item.supernumerary_capacity;
                  const difference = item.actual_enrolment - totalCapacity;
                  return <tr key={item.id}>
                    <td className="py-2.5 px-3 font-semibold">{item.name}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums">{item.approved_intake}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums">{item.supernumerary_capacity}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums">{totalCapacity}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums">{item.actual_enrolment}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums">{difference > 0 ? `+${difference}` : difference}</td>
                  </tr>;
                })}
                {institutions.length === 0 && <tr><td colSpan={6} className="p-5 text-center text-sm text-[#5B6573]">{t("No institution records are available for this account.")}</td></tr>}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {activeReport === "vigilance" && (
        <section id="report-panel-vigilance" role="tabpanel" aria-labelledby="report-tab-vigilance" className="bg-white border border-[#D8DEE6] rounded-[2px] p-5 space-y-3">
          <h2 className="text-base font-bold text-[#17365D]">{t("Cross-institution review")}</h2>
          {mode === "demo" ? (
            <div className="border border-[#D8DEE6] p-4 bg-[#F4F6F8] space-y-2">
              <p className="text-sm font-semibold text-[#17365D]">{t("Synthetic scenario only")}</p>
              <p className="text-sm text-[#202B36]">{t("The sample dataset includes one cross-institution overlap scenario. It is not a real student record, an investigation result or an instruction to suspend a benefit.")}</p>
            </div>
          ) : (
            <p className="text-sm text-[#5B6573]" role="status">{t("Automated cross-institution matching is not enabled for live records. Review flags in the assigned institutional record list.")}</p>
          )}
        </section>
      )}
    </section>
  );
}
