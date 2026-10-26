"use client";

import { useState } from "react";
import Link from "next/link";
import { InstitutionSummary, Student } from "@/lib/types";
import { formatMaskedApaar } from "@/lib/security";

interface Props {
  initialInstitutions: InstitutionSummary[];
  initialStudents: Student[];
}

export default function InstitutionClient({
  initialInstitutions,
  initialStudents,
}: Props) {
  const [selectedInstId, setSelectedInstId] = useState<string>(
    initialInstitutions[0]?.id || "inst-1001"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const currentInst =
    initialInstitutions.find((i) => i.id === selectedInstId) || initialInstitutions[0];

  const collegeStudents = initialStudents.filter(
    (s) => s.institution_id === currentInst?.id
  );

  const filteredStudents = collegeStudents.filter((s) => {
    const matchesStatus =
      statusFilter === "ALL" || s.enrolment_status.toUpperCase() === statusFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      s.full_name.toLowerCase().includes(q) ||
      s.institutional_student_id.toLowerCase().includes(q) ||
      (s.apaar_id && s.apaar_id.includes(q)) ||
      s.program.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  const totalCap = currentInst.approved_intake + currentInst.supernumerary_capacity;
  const enrolmentPct = Math.round((currentInst.actual_enrolment / (totalCap || 1)) * 100);
  const isOverCapacity = currentInst.actual_enrolment > totalCap;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 space-y-6">
      {/* Page Title & Institution Switcher */}
      <div className="bg-white border border-[#D8DEE6] p-5 rounded-[2px] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-[10px] tracking-wider uppercase font-semibold text-[#5B6573]">
            Institutional Compliance Terminal
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#17365D] mt-0.5">
            Institution Sanctioned Seat Ledger & Enrolment Roster
          </h1>
          <p className="text-xs text-[#5B6573] mt-1 max-w-2xl leading-relaxed">
            Monitor approved intake thresholds, supernumerary quotas (FW/NRI), and address student admission flags.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2">
            <label className="text-xs font-semibold text-[#5B6573]">Select Institution:</label>
            <select
              value={selectedInstId}
              onChange={(e) => setSelectedInstId(e.target.value)}
              className="px-3 py-1.5 bg-white border border-[#D8DEE6] text-xs font-semibold text-[#17365D] rounded-[2px] focus:outline-none focus:border-[#17365D] cursor-pointer"
            >
              {initialInstitutions.map((inst) => (
                <option key={inst.id} value={inst.id}>
                  {inst.name} ({inst.aicte_code}) - {inst.state}
                </option>
              ))}
            </select>
          </div>

          <Link
            href={`/institution/upload?instId=${currentInst.id}`}
            className="px-3.5 py-1.5 bg-[#C87524] hover:bg-[#a65f1a] text-white text-xs font-semibold rounded-[2px] transition-colors"
          >
            Upload Admission CSV
          </Link>
        </div>
      </div>

      {/* College Seat Capacity Ledger */}
      <div className="bg-white border border-[#D8DEE6] rounded-[2px] p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#D8DEE6] gap-2">
          <div>
            <div className="text-xs font-mono font-bold text-[#C87524]">
              AICTE CODE: {currentInst.aicte_code}
            </div>
            <h2 className="text-base font-bold text-[#17365D]">{currentInst.name}</h2>
            <div className="text-xs text-[#5B6573]">{currentInst.state} Technical Education Board</div>
          </div>

          <div className="text-right font-mono">
            <div className="text-[10px] text-[#5B6573] uppercase">Seat Utilization Rate</div>
            <div
              className={`text-xl font-bold ${
                isOverCapacity ? "text-[#B42318]" : "text-[#237A52]"
              }`}
            >
              {currentInst.actual_enrolment} / {totalCap} Seats ({enrolmentPct}%)
            </div>
          </div>
        </div>

        {/* Linear Progress Bar */}
        <div className="space-y-1">
          <div className="h-2 w-full bg-[#F4F6F8] border border-[#D8DEE6] overflow-hidden">
            <div
              className={`h-full transition-all ${
                isOverCapacity
                  ? "bg-[#B42318]"
                  : enrolmentPct > 90
                  ? "bg-[#986500]"
                  : "bg-[#237A52]"
              }`}
              style={{ width: `${Math.min(enrolmentPct, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-[#5B6573] font-mono">
            <span>Sanctioned Intake: {currentInst.approved_intake}</span>
            <span>Supernumerary Capacity: +{currentInst.supernumerary_capacity}</span>
            <span>Total Ceiling: {totalCap}</span>
          </div>
        </div>

        {/* 4-Column Breakdown Table */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 text-xs">
          <div className="p-3 bg-[#F4F6F8] border border-[#D8DEE6]">
            <div className="text-[#5B6573] text-[10px] uppercase font-semibold">Approved Intake</div>
            <div className="text-lg font-bold font-mono text-[#17365D] mt-0.5">{currentInst.approved_intake}</div>
          </div>
          <div className="p-3 bg-[#F4F6F8] border border-[#D8DEE6]">
            <div className="text-[#5B6573] text-[10px] uppercase font-semibold">Actual Admissions</div>
            <div className="text-lg font-bold font-mono text-[#237A52] mt-0.5">{currentInst.actual_enrolment}</div>
          </div>
          <div className="p-3 bg-[#F4F6F8] border border-[#D8DEE6]">
            <div className="text-[#5B6573] text-[10px] uppercase font-semibold">Flagged Admissions</div>
            <div className="text-lg font-bold font-mono text-[#B42318] mt-0.5">{currentInst.flagged_students}</div>
          </div>
          <div className="p-3 bg-[#F4F6F8] border border-[#D8DEE6]">
            <div className="text-[#5B6573] text-[10px] uppercase font-semibold">Integrity Index</div>
            <div className="text-lg font-bold font-mono text-[#17365D] mt-0.5">{currentInst.avg_integrity_score} / 100</div>
          </div>
        </div>
      </div>

      {/* Student Admission Roster Table */}
      <div className="bg-white border border-[#D8DEE6] rounded-[2px] overflow-hidden">
        <div className="p-4 border-b border-[#D8DEE6] flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#F4F6F8]">
          <div>
            <h3 className="text-sm font-bold text-[#17365D] uppercase tracking-wider">
              Enrolment Admission Roster ({collegeStudents.length} Records)
            </h3>
            <p className="text-xs text-[#5B6573]">
              Active student admissions on file for {currentInst.name}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              placeholder="Filter by Student Name or Roll..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3 py-1.5 bg-white border border-[#D8DEE6] text-xs text-[#202B36] rounded-[2px] focus:outline-none focus:border-[#17365D] w-56 sm:w-64"
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 bg-white border border-[#D8DEE6] text-xs text-[#202B36] rounded-[2px] focus:outline-none focus:border-[#17365D] cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="VERIFIED">Verified Records</option>
              <option value="FLAGGED">Flagged Records</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#F4F6F8] text-[#5B6573] uppercase text-[10px] tracking-wider font-semibold border-b border-[#D8DEE6]">
              <tr>
                <th className="py-2.5 px-4 font-mono">Roll / Student ID</th>
                <th className="py-2.5 px-4">Student Name</th>
                <th className="py-2.5 px-4 font-mono">Masked APAAR ID</th>
                <th className="py-2.5 px-4">Degree Program</th>
                <th className="py-2.5 px-4">Quota / Category</th>
                <th className="py-2.5 px-4 font-mono text-center">Score</th>
                <th className="py-2.5 px-4">Compliance Status</th>
                <th className="py-2.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D8DEE6] text-[#202B36]">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-[#5B6573]">
                    No student records match the search criteria.
                  </td>
                </tr>
              ) : (
                filteredStudents.slice(0, 50).map((stu) => (
                  <tr key={stu.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-[#17365D]">
                      {stu.institutional_student_id}
                    </td>

                    <td className="py-3 px-4 font-medium text-[#202B36]">
                      {stu.full_name}
                    </td>

                    <td className="py-3 px-4 font-mono text-[#5B6573]">
                      {formatMaskedApaar(stu.apaar_id)}
                    </td>

                    <td className="py-3 px-4 text-[#5B6573]">
                      {stu.program}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap uppercase font-mono text-[10px] text-[#5B6573]">
                      {stu.nationality_type} / {stu.social_category || "GEN"}
                    </td>

                    <td className="py-3 px-4 font-mono font-bold text-center">
                      <span
                        className={
                          stu.integrity_score >= 90
                            ? "text-[#237A52]"
                            : stu.integrity_score >= 70
                            ? "text-[#986500]"
                            : "text-[#B42318]"
                        }
                      >
                        {stu.integrity_score}
                      </span>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded-[2px] border ${
                          stu.enrolment_status === "verified"
                            ? "bg-white text-[#237A52] border-[#237A52]"
                            : "bg-white text-[#B42318] border-[#B42318]"
                        }`}
                      >
                        {stu.enrolment_status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <Link
                        href={`/aicte/students/${stu.id}`}
                        className="text-xs font-semibold text-[#17365D] hover:underline"
                      >
                        Inspect &rarr;
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {collegeStudents.length > 50 && (
          <div className="p-3 bg-[#F4F6F8] border-t border-[#D8DEE6] text-[11px] text-[#5B6573] text-center">
            Displaying first 50 of {collegeStudents.length} enrolled records. Use filters to narrow results.
          </div>
        )}
      </div>
    </div>
  );
}
