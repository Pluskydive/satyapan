"use client";

import { useState } from "react";
import Link from "next/link";
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
  const { locale } = useLanguage();
  const isHi = locale === "hi";
  const [activeReport, setActiveReport] = useState<Report>("records");

  const tabs: Array<{ id: Report; label: string }> = [
    { id: "records", label: isHi ? "संस्थान रिकॉर्ड" : "Institution Records" },
    { id: "capacity", label: isHi ? "सीट क्षमता विश्लेषण" : "Capacity Review" },
    { id: "vigilance", label: isHi ? "क्रॉस-संस्थान समीक्षा" : "Cross-Review" },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4">
      {/* Official Government Breadcrumb */}
      <div className="bg-[#EAEFF5] border border-[#CBD5E1] px-4 py-1.5 rounded-[2px] text-xs text-[#334155] flex flex-wrap items-center justify-between gap-2 print:hidden">
        <div className="flex items-center gap-1.5 text-[11px]">
          <Link href="/" className="text-[#205081] font-semibold hover:underline">
            {isHi ? "मुख्य पृष्ठ" : "Home"}
          </Link>
          <span className="text-[#94A3B8]">&gt;</span>
          <Link href="/aicte" className="text-[#205081] font-semibold hover:underline">
            {isHi ? "केंद्रीय नियंत्रण कक्ष" : "Control Tower"}
          </Link>
          <span className="text-[#94A3B8]">&gt;</span>
          <span className="text-[#102A43] font-bold">
            {isHi ? "रिपोर्ट्स एवं एनालिटिक्स" : "Reports & Analytics"}
          </span>
        </div>
        <div className="hidden sm:block text-[10px] font-mono text-[#64748B]">
          NIRF / NAAC Data Verification Compliant
        </div>
      </div>

      {/* 1. Department Header Block */}
      <header className="bg-white border-l-4 border-l-[#FF9933] border-y border-r border-[#CBD5E1] p-4 sm:p-5 rounded-[2px] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" aria-hidden="true" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#205081]">
              {isHi
                ? "भारत सरकार • अखिल भारतीय तकनीकी शिक्षा परिषद • राष्ट्रीय सांख्यिकी लेजर"
                : "GOVERNMENT OF INDIA • AICTE • NATIONAL STATISTICAL LEDGER"}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#102A43] mt-1">
            {isHi ? "संस्थान रिपोर्ट एवं प्रवेश सांख्यिकी" : "Institution Reports & Admission Analytics"}
          </h1>
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          className="px-3.5 py-1.5 bg-[#205081] hover:bg-[#112D4E] text-white text-xs font-bold rounded-[2px] self-start print:hidden cursor-pointer shadow-xs"
        >
          {isHi ? "रिपोर्ट प्रिंट करें" : "Print Report"}
        </button>
      </header>

      {/* Government Folder Navigation Tabs */}
      <div className="bg-[#EAEFF5] border-b border-[#CBD5E1] px-4 pt-2 flex flex-wrap items-center justify-between gap-2 print:hidden" role="tablist">
        <div className="flex items-center gap-1 text-xs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`report-tab-${tab.id}`}
              aria-selected={activeReport === tab.id}
              aria-controls={`report-panel-${tab.id}`}
              onClick={() => setActiveReport(tab.id)}
              className={`px-3.5 py-2 font-bold rounded-t-[2px] transition-colors cursor-pointer border-t border-x ${
                activeReport === tab.id
                  ? "bg-white text-[#205081] border-t-2 border-t-[#FF9933] border-x-[#CBD5E1] -mb-[1px]"
                  : "bg-transparent text-[#475569] border-transparent hover:text-[#205081]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeReport === "records" && (
        <section id="report-panel-records" role="tabpanel" aria-labelledby="report-tab-records" className="bg-white border border-[#CBD5E1] rounded-[2px] overflow-hidden shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b border-[#CBD5E1] bg-[#EAEFF5] gap-3">
            <div>
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#205081]">
                {isHi ? "संस्थानवार प्रवेश विवरण" : "Institutional Admission Records"}
              </div>
              <h2 className="text-sm sm:text-base font-bold text-[#102A43] mt-0.5">
                {isHi ? "संस्थान रिपोर्ट सूची" : "Records by Reporting Institution"}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => downloadCsv("institution_records", institutions.map((item) => ({
                institution_code: item.aicte_code,
                institution_name: item.name,
                state: item.state,
                approved_intake_reference: item.approved_intake,
                records_marked_verified_or_flagged: item.actual_enrolment,
                flagged_records: item.flagged_students,
              })), ["institution_code", "institution_name", "state", "approved_intake_reference", "records_marked_verified_or_flagged", "flagged_records"])}
              className="px-3.5 py-1.5 bg-[#205081] hover:bg-[#112D4E] text-white text-xs font-bold rounded-[2px] self-start print:hidden cursor-pointer shadow-xs"
            >
              {isHi ? "CSV डाउनलोड करें" : "Download CSV"}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[850px]">
              <thead className="bg-[#205081] text-white uppercase text-[10px] font-bold">
                <tr>
                  <th scope="col" className="w-12 py-2.5 px-3 border-r border-[#112D4E] text-center">{isHi ? "क्र." : "Sr."}</th>
                  <th scope="col" className="py-2.5 px-3 border-r border-[#112D4E] font-mono">{isHi ? "एआईसीटीई कोड" : "AICTE Code"}</th>
                  <th scope="col" className="py-2.5 px-3 border-r border-[#112D4E]">{isHi ? "संस्थान का नाम" : "Institution"}</th>
                  <th scope="col" className="py-2.5 px-3 border-r border-[#112D4E]">{isHi ? "राज्य" : "State"}</th>
                  <th scope="col" className="py-2.5 px-3 text-right border-r border-[#112D4E]">{isHi ? "स्वीकृत सीटें" : "Sanctioned Intake"}</th>
                  <th scope="col" className="py-2.5 px-3 text-right border-r border-[#112D4E]">{isHi ? "नामांकित छात्र" : "Enrolled"}</th>
                  <th scope="col" className="py-2.5 px-3 text-right">{isHi ? "समीक्षा कतार" : "Flagged"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#CBD5E1] text-[#102A43]">
                {institutions.map((item, idx) => (
                  <tr
                    key={item.id}
                    className={`transition-colors ${
                      idx % 2 === 0 ? "bg-white hover:bg-[#EAEFF5]" : "bg-[#F4F6F9] hover:bg-[#EAEFF5]"
                    }`}
                  >
                    <td className="py-2.5 px-3 text-center font-bold text-[#64748B] border-r border-[#CBD5E1]">{idx + 1}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-[#205081] border-r border-[#CBD5E1]">{item.aicte_code}</td>
                    <td className="py-2.5 px-3 font-bold text-[#102A43] border-r border-[#CBD5E1]">{item.name}</td>
                    <td className="py-2.5 px-3 border-r border-[#CBD5E1]">{item.state}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums font-mono border-r border-[#CBD5E1]">{item.approved_intake}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums font-mono font-bold text-[#205081] border-r border-[#CBD5E1]">{item.actual_enrolment}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums font-mono font-bold text-[#B42318]">{item.flagged_students}</td>
                  </tr>
                ))}
                {institutions.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-xs text-[#64748B]">
                      {isHi ? "कोई संस्थान रिकॉर्ड उपलब्ध नहीं है।" : "No institution records available."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {activeReport === "capacity" && (
        <section id="report-panel-capacity" role="tabpanel" aria-labelledby="report-tab-capacity" className="bg-white border border-[#CBD5E1] rounded-[2px] overflow-hidden shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b border-[#CBD5E1] bg-[#EAEFF5] gap-3">
            <div>
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#205081]">
                {isHi ? "सीट क्षमता एवं वास्तविक प्रवेश सत्यापन" : "Intake Ceiling vs Enrolment Review"}
              </div>
              <h2 className="text-sm sm:text-base font-bold text-[#102A43] mt-0.5">
                {isHi ? "सीट क्षमता विश्लेषण" : "Recorded Counts vs Approved Ceiling"}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => downloadCsv("intake_reference", institutions.map((item) => ({
                institution_code: item.aicte_code,
                institution_name: item.name,
                approved_intake_reference: item.approved_intake,
                additional_capacity_reference: item.supernumerary_capacity,
                total_capacity_reference: item.approved_intake + item.supernumerary_capacity,
                records_marked_verified_or_flagged: item.actual_enrolment,
                difference_from_capacity_reference: item.actual_enrolment - item.approved_intake - item.supernumerary_capacity,
              })), ["institution_code", "institution_name", "approved_intake_reference", "additional_capacity_reference", "total_capacity_reference", "records_marked_verified_or_flagged", "difference_from_capacity_reference"])}
              className="px-3.5 py-1.5 bg-[#205081] hover:bg-[#112D4E] text-white text-xs font-bold rounded-[2px] self-start print:hidden cursor-pointer shadow-xs"
            >
              {isHi ? "CSV डाउनलोड करें" : "Download CSV"}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[850px]">
              <thead className="bg-[#205081] text-white uppercase text-[10px] font-bold">
                <tr>
                  <th scope="col" className="w-12 py-2.5 px-3 border-r border-[#112D4E] text-center">{isHi ? "क्र." : "Sr."}</th>
                  <th scope="col" className="py-2.5 px-3 border-r border-[#112D4E]">{isHi ? "संस्थान का नाम" : "Institution"}</th>
                  <th scope="col" className="py-2.5 px-3 text-right border-r border-[#112D4E]">{isHi ? "स्वीकृत सीटें" : "Sanctioned Intake"}</th>
                  <th scope="col" className="py-2.5 px-3 text-right border-r border-[#112D4E]">{isHi ? "अतिरिक्त कोटा" : "Supernumerary"}</th>
                  <th scope="col" className="py-2.5 px-3 text-right border-r border-[#112D4E]">{isHi ? "कुल सीमा" : "Ceiling"}</th>
                  <th scope="col" className="py-2.5 px-3 text-right border-r border-[#112D4E]">{isHi ? "नामांकित छात्र" : "Enrolled"}</th>
                  <th scope="col" className="py-2.5 px-3 text-right">{isHi ? "तफावत (अंतर)" : "Difference"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#CBD5E1] text-[#102A43]">
                {institutions.map((item, idx) => {
                  const totalCapacity = item.approved_intake + item.supernumerary_capacity;
                  const difference = item.actual_enrolment - totalCapacity;
                  return (
                    <tr
                      key={item.id}
                      className={`transition-colors ${
                        idx % 2 === 0 ? "bg-white hover:bg-[#EAEFF5]" : "bg-[#F4F6F9] hover:bg-[#EAEFF5]"
                      }`}
                    >
                      <td className="py-2.5 px-3 text-center font-bold text-[#64748B] border-r border-[#CBD5E1]">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-bold text-[#102A43] border-r border-[#CBD5E1]">{item.name}</td>
                      <td className="py-2.5 px-3 text-right tabular-nums font-mono border-r border-[#CBD5E1]">{item.approved_intake}</td>
                      <td className="py-2.5 px-3 text-right tabular-nums font-mono border-r border-[#CBD5E1]">{item.supernumerary_capacity}</td>
                      <td className="py-2.5 px-3 text-right tabular-nums font-mono font-bold border-r border-[#CBD5E1]">{totalCapacity}</td>
                      <td className="py-2.5 px-3 text-right tabular-nums font-mono font-bold text-[#205081] border-r border-[#CBD5E1]">{item.actual_enrolment}</td>
                      <td className={`py-2.5 px-3 text-right tabular-nums font-mono font-bold ${difference > 0 ? "text-[#B42318]" : "text-[#059669]"}`}>
                        {difference > 0 ? `+${difference}` : difference}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {activeReport === "vigilance" && (
        <section id="report-panel-vigilance" role="tabpanel" aria-labelledby="report-tab-vigilance" className="bg-white border border-[#CBD5E1] rounded-[2px] p-5 space-y-3 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#205081]">
              {isHi ? "केंद्रीय सतर्कता निरीक्षण" : "Central Vigilance Oversight"}
            </span>
          </div>
          <h2 className="text-base font-bold text-[#102A43]">
            {isHi ? "अंतर-संस्थान समीक्षा" : "Cross-Institution Review"}
          </h2>
          {mode === "demo" ? (
            <div className="border border-[#FEDF89] p-4 bg-[#FFFBEB] space-y-2 rounded-[2px]">
              <p className="text-xs font-bold text-[#B45309]">
                {isHi ? "लाइव सिमुलेशन सक्रिय" : "Live Simulation Active"}
              </p>
              <p className="text-xs text-[#92400E] leading-relaxed">
                {isHi
                  ? "परीक्षण डेटासेट में १ अंतर-संस्थान दोहरा नामांकन टकराव (पुणे बनाम बेंगलुरु) सक्रिय है। राष्ट्रीय नियंत्रण कक्ष से इसका सीधा विश्लेषण एवं निवारण किया जा सकता है।"
                  : "Demonstration dataset contains 1 active cross-state duplicate admission collision (Pune vs Bengaluru). Navigate to the National Control Tower to execute automated reconciliation."}
              </p>
            </div>
          ) : (
            <p className="text-xs text-[#64748B]" role="status">
              {isHi
                ? "लाइव डेटा के लिए स्वचालित क्रॉस-मैचिंग सक्रिय है। विसंगति रजिस्टर में लंबित मामलों की जांच करें।"
                : "Automated cross-state matching is actively monitoring enrolment streams. Check the Discrepancy Register for pending cases."}
            </p>
          )}
        </section>
      )}
    </section>
  );
}
