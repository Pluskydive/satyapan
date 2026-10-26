"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Building2,
  UploadCloud,
  Users,
  AlertTriangle,
  ShieldCheck,
  Search,
  ChevronRight,
  ExternalLink,
  Award,
} from "lucide-react";
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* College Switcher & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Institution Seat Ledger & Roster
            </h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30">
              COLLEGE PORTAL
            </span>
          </div>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Real-time sanctioned capacity compliance, enrolment quota management & student records.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Select College Dropdown */}
          <div className="flex items-center space-x-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
            <Building2 className="w-4 h-4 text-amber-400" />
            <select
              value={selectedInstId}
              onChange={(e) => setSelectedInstId(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-200 focus:outline-none cursor-pointer"
            >
              {initialInstitutions.map((inst) => (
                <option key={inst.id} value={inst.id} className="bg-slate-900 text-slate-200">
                  {inst.name} ({inst.aicte_code})
                </option>
              ))}
            </select>
          </div>

          {/* Upload CSV CTA */}
          <Link
            href={`/institution/upload?instId=${currentInst.id}`}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer active:scale-95"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Admission CSV</span>
          </Link>
        </div>
      </div>

      {/* College Highlight Banner */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-bold text-amber-400 uppercase">
                {currentInst.aicte_code}
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-xs text-slate-400">{currentInst.state}</span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1">{currentInst.name}</h2>
          </div>

          {/* Seat Capacity Progress Meter */}
          <div className="w-full md:w-80 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Seat Utilization</span>
              <span
                className={`font-mono font-bold ${
                  isOverCapacity ? "text-rose-400 animate-pulse" : "text-emerald-400"
                }`}
              >
                {currentInst.actual_enrolment} / {totalCap} ({enrolmentPct}%)
              </span>
            </div>
            <div className="h-2.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div
                className={`h-full transition-all duration-500 ${
                  isOverCapacity
                    ? "bg-rose-500"
                    : enrolmentPct > 90
                    ? "bg-amber-500"
                    : "bg-emerald-500"
                }`}
                style={{ width: `${Math.min(enrolmentPct, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>Sanctioned: {currentInst.approved_intake}</span>
              <span>Supernumerary Cap: +{currentInst.supernumerary_capacity}</span>
            </div>
          </div>
        </div>
      </div>

      {/* College Specific KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase">Approved Intake</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-black text-white mt-2">{currentInst.approved_intake}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Approved annual capacity</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase">Actual Enrolment</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-white mt-2">{currentInst.actual_enrolment}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Active verified students</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase">Flagged Students</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-2xl font-black text-rose-400 mt-2">{currentInst.flagged_students}</p>
          <p className="text-[11px] text-rose-400/80 mt-0.5">Discrepancies identified</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase">Avg Integrity</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-400 mt-2">{currentInst.avg_integrity_score}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Institutional score</p>
        </div>
      </div>

      {/* Student Roster Table */}
      <div className="rounded-2xl bg-slate-900/70 border border-slate-800 shadow-xl overflow-hidden space-y-4 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white">Student Admission Roster</h3>
            <p className="text-slate-400 text-xs mt-0.5">
              Showing enrolled students for {currentInst.name} ({collegeStudents.length} records)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by student name or roll..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-amber-500 transition-colors w-48 sm:w-64"
              />
            </div>

            <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px]">
              {["ALL", "VERIFIED", "FLAGGED"].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                    statusFilter === st
                      ? "bg-slate-800 text-amber-400 font-bold"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border border-slate-800 rounded-xl">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Student ID / Roll</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Masked APAAR ID</th>
                <th className="py-3 px-4">Program</th>
                <th className="py-3 px-4">Quota / Category</th>
                <th className="py-3 px-4">Integrity Score</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    No students match the criteria in this institution.
                  </td>
                </tr>
              ) : (
                filteredStudents.slice(0, 50).map((stu) => (
                  <tr key={stu.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-slate-200">
                      {stu.institutional_student_id}
                    </td>

                    <td className="py-3 px-4 font-medium text-white">
                      {stu.full_name}
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-400">
                      {formatMaskedApaar(stu.apaar_id)}
                    </td>

                    <td className="py-3 px-4 text-slate-300">
                      {stu.program}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="uppercase text-[11px] font-mono text-slate-400">
                        {stu.nationality_type} • {stu.social_category || "N/A"}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono font-bold">
                      <span
                        className={
                          stu.integrity_score >= 90
                            ? "text-emerald-400"
                            : stu.integrity_score >= 70
                            ? "text-amber-400"
                            : "text-rose-400"
                        }
                      >
                        {stu.integrity_score} / 100
                      </span>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          stu.enrolment_status === "verified"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                        }`}
                      >
                        {stu.enrolment_status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <Link
                        href={`/aicte/students/${stu.id}`}
                        className="inline-flex items-center space-x-1 text-xs text-amber-400 hover:text-amber-300 font-semibold"
                      >
                        <span>View</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {collegeStudents.length > 50 && (
          <p className="text-[11px] text-slate-500 text-center pt-2">
            Showing top 50 of {collegeStudents.length} students. Use search to filter specific records.
          </p>
        )}
      </div>
    </div>
  );
}
