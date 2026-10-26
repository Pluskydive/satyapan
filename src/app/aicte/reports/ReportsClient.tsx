"use client";

import { useState } from "react";
import Link from "next/link";
import { InstitutionSummary, NationalSummary, StateSummary } from "@/lib/types";

interface Props {
  national: NationalSummary;
  states: StateSummary[];
  institutions: InstitutionSummary[];
}

export default function ReportsClient({ national, states, institutions }: Props) {
  const [activeReport, setActiveReport] = useState<"NIRF" | "CAPACITY" | "VIGILANCE">("NIRF");

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const handleDownloadCsv = (reportName: string, dataRows: any[], headers: string[]) => {
    const csvContent = [
      headers.join(","),
      ...dataRows.map((row) => headers.map((h) => `"${row[h] ?? ""}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${reportName}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-[#D8DEE6] p-5 rounded-[2px] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[10px] tracking-wider uppercase font-semibold text-[#5B6573]">
            Regulatory Analytics & Accreditation
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#17365D] mt-0.5">
            National Enrolment Regulatory & Accreditation Report Generator
          </h1>
          <p className="text-xs text-[#5B6573] mt-1 max-w-2xl leading-relaxed">
            Statutory report generation for AICTE Executive Committee reviews, NIRF rankings, NAAC/NBA accreditation audits, and State Technical Education Boards (Requirement 9).
          </p>
        </div>

        <div className="flex items-center space-x-2 self-start sm:self-auto print:hidden">
          <button
            onClick={handlePrint}
            className="px-3 py-1.5 bg-white border border-[#D8DEE6] hover:bg-[#F4F6F8] text-[#17365D] text-xs font-semibold rounded-[2px] transition-colors cursor-pointer"
          >
            Print Official Report
          </button>
        </div>
      </div>

      {/* Report Selector Tabs */}
      <div className="flex border-b border-[#D8DEE6] bg-white print:hidden">
        <button
          onClick={() => setActiveReport("NIRF")}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
            activeReport === "NIRF"
              ? "border-[#C87524] text-[#17365D] bg-[#F4F6F8]"
              : "border-transparent text-[#5B6573] hover:text-[#202B36]"
          }`}
        >
          1. NIRF / NAAC Certified Student Census
        </button>

        <button
          onClick={() => setActiveReport("CAPACITY")}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
            activeReport === "CAPACITY"
              ? "border-[#C87524] text-[#17365D] bg-[#F4F6F8]"
              : "border-transparent text-[#5B6573] hover:text-[#202B36]"
          }`}
        >
          2. Sanctioned Intake vs Actual Admissions Audit
        </button>

        <button
          onClick={() => setActiveReport("VIGILANCE")}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
            activeReport === "VIGILANCE"
              ? "border-[#C87524] text-[#17365D] bg-[#F4F6F8]"
              : "border-transparent text-[#5B6573] hover:text-[#202B36]"
          }`}
        >
          3. Dual Enrolment & Scholarship Vigilance Ledger
        </button>
      </div>

      {/* REPORT 1: NIRF / NAAC Certified Student Census */}
      {activeReport === "NIRF" && (
        <div className="bg-white border border-[#D8DEE6] rounded-[2px] p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#D8DEE6] gap-2">
            <div>
              <div className="text-[10px] font-mono text-[#5B6573] uppercase">
                FORM: NIRF-AICTE-FSR-2026
              </div>
              <h2 className="text-base font-bold text-[#17365D]">
                NIRF / NAAC Certified Enrolment Census & Faculty-Student Ratio (FSR) Base
              </h2>
              <p className="text-xs text-[#5B6573]">
                Deduplicated headcount anchored to national APAAR IDs to prevent FSR inflation.
              </p>
            </div>

            <button
              onClick={() =>
                handleDownloadCsv(
                  "nirf_naac_certified_census",
                  institutions.map((i) => ({
                    aicte_code: i.aicte_code,
                    institution_name: i.name,
                    state: i.state,
                    approved_intake: i.approved_intake,
                    certified_headcount: i.actual_enrolment - i.flagged_students,
                    flagged_excluded: i.flagged_students,
                    avg_integrity_score: i.avg_integrity_score,
                  })),
                  [
                    "aicte_code",
                    "institution_name",
                    "state",
                    "approved_intake",
                    "certified_headcount",
                    "flagged_excluded",
                    "avg_integrity_score",
                  ]
                )
              }
              className="px-3 py-1 bg-[#17365D] hover:bg-[#102A43] text-white text-xs font-semibold rounded-[2px] transition-colors self-start sm:self-auto cursor-pointer print:hidden"
            >
              Export NIRF CSV Data
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#F4F6F8] text-[#5B6573] uppercase text-[10px] tracking-wider font-semibold border-b border-[#D8DEE6]">
                <tr>
                  <th className="py-2.5 px-4 font-mono">AICTE Code</th>
                  <th className="py-2.5 px-4">Institution Name</th>
                  <th className="py-2.5 px-4">State</th>
                  <th className="py-2.5 px-4 text-right">Approved Intake</th>
                  <th className="py-2.5 px-4 text-right font-bold text-[#237A52]">Certified Census</th>
                  <th className="py-2.5 px-4 text-right text-[#B42318]">Excluded (Flagged)</th>
                  <th className="py-2.5 px-4 text-center">Integrity Index</th>
                  <th className="py-2.5 px-4 text-right">Certification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D8DEE6] text-[#202B36]">
                {institutions.map((inst) => {
                  const certifiedCount = inst.actual_enrolment - inst.flagged_students;
                  return (
                    <tr key={inst.id} className="hover:bg-slate-50 font-mono text-[11px]">
                      <td className="py-2.5 px-4 font-bold text-[#17365D]">{inst.aicte_code}</td>
                      <td className="py-2.5 px-4 font-sans text-xs font-semibold">{inst.name}</td>
                      <td className="py-2.5 px-4 font-sans text-xs text-[#5B6573]">{inst.state}</td>
                      <td className="py-2.5 px-4 text-right">{inst.approved_intake}</td>
                      <td className="py-2.5 px-4 text-right font-bold text-[#237A52]">{certifiedCount}</td>
                      <td className="py-2.5 px-4 text-right text-[#B42318]">{inst.flagged_students}</td>
                      <td className="py-2.5 px-4 text-center font-bold text-[#17365D]">
                        {inst.avg_integrity_score}
                      </td>
                      <td className="py-2.5 px-4 text-right font-sans text-[10px] text-[#237A52] font-semibold">
                        AICTE Certified Valid
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-[#F4F6F8] border border-[#D8DEE6] text-xs text-[#5B6573] space-y-1">
            <div className="font-bold text-[#17365D] uppercase text-[10px] tracking-wider">
              Statutory Certification Note
            </div>
            <p className="text-[11px] leading-relaxed">
              This census excludes all unverified or duplicate enrolments currently flagged under Section 10 regulatory rules. Data is certified for submission to National Board of Accreditation (NBA) and National Institutional Ranking Framework (NIRF).
            </p>
          </div>
        </div>
      )}

      {/* REPORT 2: Capacity & Supernumerary Quota Audit */}
      {activeReport === "CAPACITY" && (
        <div className="bg-white border border-[#D8DEE6] rounded-[2px] p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#D8DEE6] gap-2">
            <div>
              <div className="text-[10px] font-mono text-[#5B6573] uppercase">
                FORM: AICTE-CAPACITY-AUDIT-2026
              </div>
              <h2 className="text-base font-bold text-[#17365D]">
                Sanctioned Intake Capacity & Supernumerary Quota Audit
              </h2>
              <p className="text-xs text-[#5B6573]">
                Verification of approved intake caps and supernumerary quotas (NRI, OCI, Foreign Nationals).
              </p>
            </div>

            <button
              onClick={() =>
                handleDownloadCsv(
                  "intake_capacity_audit",
                  institutions.map((i) => ({
                    aicte_code: i.aicte_code,
                    institution_name: i.name,
                    approved_intake: i.approved_intake,
                    supernumerary_cap: i.supernumerary_capacity,
                    total_ceiling: i.approved_intake + i.supernumerary_capacity,
                    actual_enrolment: i.actual_enrolment,
                    status: i.actual_enrolment > i.approved_intake + i.supernumerary_capacity ? "BREACH" : "COMPLIANT",
                  })),
                  [
                    "aicte_code",
                    "institution_name",
                    "approved_intake",
                    "supernumerary_cap",
                    "total_ceiling",
                    "actual_enrolment",
                    "status",
                  ]
                )
              }
              className="px-3 py-1 bg-[#17365D] hover:bg-[#102A43] text-white text-xs font-semibold rounded-[2px] transition-colors self-start sm:self-auto cursor-pointer print:hidden"
            >
              Export Audit CSV
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#F4F6F8] text-[#5B6573] uppercase text-[10px] tracking-wider font-semibold border-b border-[#D8DEE6]">
                <tr>
                  <th className="py-2.5 px-4 font-mono">AICTE Code</th>
                  <th className="py-2.5 px-4">Institution Name</th>
                  <th className="py-2.5 px-4 text-right">Sanctioned Intake</th>
                  <th className="py-2.5 px-4 text-right">Supernumerary Cap</th>
                  <th className="py-2.5 px-4 text-right">Total Ceiling</th>
                  <th className="py-2.5 px-4 text-right font-bold">Actual Admissions</th>
                  <th className="py-2.5 px-4 text-right">Quota Compliance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D8DEE6] text-[#202B36] font-mono text-[11px]">
                {institutions.map((inst) => {
                  const ceiling = inst.approved_intake + inst.supernumerary_capacity;
                  const isBreach = inst.actual_enrolment > ceiling;
                  return (
                    <tr key={inst.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-4 font-bold text-[#17365D]">{inst.aicte_code}</td>
                      <td className="py-2.5 px-4 font-sans text-xs font-semibold">{inst.name}</td>
                      <td className="py-2.5 px-4 text-right">{inst.approved_intake}</td>
                      <td className="py-2.5 px-4 text-right">+{inst.supernumerary_capacity}</td>
                      <td className="py-2.5 px-4 text-right font-semibold">{ceiling}</td>
                      <td
                        className={`py-2.5 px-4 text-right font-bold ${
                          isBreach ? "text-[#B42318]" : "text-[#237A52]"
                        }`}
                      >
                        {inst.actual_enrolment}
                      </td>
                      <td className="py-2.5 px-4 text-right font-sans text-xs">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded-[2px] border ${
                            isBreach
                              ? "bg-white text-[#B42318] border-[#B42318]"
                              : "bg-white text-[#237A52] border-[#237A52]"
                          }`}
                        >
                          {isBreach ? "Capacity Exceeded" : "Compliant"}
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

      {/* REPORT 3: Dual Enrolment & Scholarship Vigilance */}
      {activeReport === "VIGILANCE" && (
        <div className="bg-white border border-[#D8DEE6] rounded-[2px] p-6 space-y-4">
          <div className="pb-4 border-b border-[#D8DEE6]">
            <div className="text-[10px] font-mono text-[#5B6573] uppercase">
              FORM: AICTE-VIGILANCE-SCHOLARSHIP-2026
            </div>
            <h2 className="text-base font-bold text-[#17365D]">
              Inter-State Dual Enrolment & Scholarship Clawback Risk Ledger
            </h2>
            <p className="text-xs text-[#5B6573]">
              Detection of identical APAAR identifiers claiming admissions across multiple institutions concurrently.
            </p>
          </div>

          <div className="border border-[#B42318] p-4 bg-[#F4F6F8] space-y-2">
            <div className="text-xs font-bold text-[#B42318] uppercase tracking-wider">
              Vigilance Case Summary: Active Cross-Institution Overlap Detected
            </div>
            <p className="text-xs text-[#202B36] leading-relaxed">
              Student ID <strong>STU-20</strong> (APAAR: <strong>XXXX-XXXX-0020</strong>) is simultaneously registered at:
            </p>
            <ul className="list-disc list-inside text-xs font-mono text-[#17365D] pl-2 space-y-1">
              <li>Sunrise Institute of Technology (AICTE-1001, Maharashtra) - B.Tech CSE</li>
              <li>Nova Engineering College (AICTE-1002, Karnataka) - B.Tech AI-ML</li>
            </ul>
            <div className="pt-2 text-[11px] text-[#5B6573]">
              Enforcement Protocol: Direct notification transmitted to National Scholarship Portal (NSP) to hold disbursement pending physical verification.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
