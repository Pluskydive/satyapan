"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/components/LanguageProvider";
import { InstitutionSummary, StudentRosterRecord } from "@/lib/types";

interface Props {
  initialInstitutions: InstitutionSummary[];
  initialStudents: StudentRosterRecord[];
  initialTotal: number;
}

export default function InstitutionClient({
  initialInstitutions,
  initialStudents,
  initialTotal,
}: Props) {
  const { locale, t } = useLanguage();
  const isHi = locale === "hi";
  const [selectedInstId, setSelectedInstId] = useState<string>(
    initialInstitutions[0]?.id || "inst-1001"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [students, setStudents] = useState<StudentRosterRecord[]>(initialStudents);
  const [totalStudents, setTotalStudents] = useState(initialTotal);
  const [page, setPage] = useState(0);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const hasMounted = useRef(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedSearch(searchQuery.trim().slice(0, 80)), 250);
    return () => window.clearTimeout(timeout);
  }, [searchQuery]);

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }
    const controller = new AbortController();
    const params = new URLSearchParams({
      institution_id: selectedInstId,
      limit: "50",
      offset: String(page * 50),
      q: debouncedSearch,
      status: statusFilter,
    });
    setIsLoading(true);
    setLoadError("");
    fetch(`/api/students?${params}`, { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || "load");
        return payload;
      })
      .then((payload) => {
        setStudents(payload.students);
        setTotalStudents(payload.total);
      })
      .catch((error) => {
        if (error.name !== "AbortError") setLoadError(t("We couldn't load these records. Please try again."));
      })
      .finally(() => setIsLoading(false));
    return () => controller.abort();
  }, [selectedInstId, page, debouncedSearch, statusFilter, t]);

  const currentInst =
    initialInstitutions.find((i) => i.id === selectedInstId) || initialInstitutions[0];

  const totalCap = currentInst.approved_intake + currentInst.supernumerary_capacity;
  const enrolmentPct = Math.round((currentInst.actual_enrolment / (totalCap || 1)) * 100);
  const isOverCapacity = currentInst.actual_enrolment > totalCap;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4">
      {/* Official Government Breadcrumb */}
      <div className="bg-[#EAEFF5] border border-[#CBD5E1] px-4 py-1.5 rounded-[2px] text-xs text-[#334155] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-[11px]">
          <Link href="/" className="text-[#205081] font-semibold hover:underline">
            {isHi ? "मुख्य पृष्ठ" : "Home"}
          </Link>
          <span className="text-[#94A3B8]">&gt;</span>
          <span className="text-[#205081] font-semibold">
            {isHi ? "संस्थान प्रशासन" : "College Administration"}
          </span>
          <span className="text-[#94A3B8]">&gt;</span>
          <span className="text-[#102A43] font-bold">
            {isHi ? "सीट एवं प्रवेश नियंत्रण" : "Seats & Enrolment"}
          </span>
        </div>
        <div className="hidden sm:block text-[10px] font-mono text-[#64748B]">
          {isHi ? "सत्र २०२६-२७ • GIGW अनुपालन" : "AY 2026-27 | GIGW Compliant"}
        </div>
      </div>

      {/* 1. Department Header Block */}
      <div className="bg-white border-l-4 border-l-[#FF9933] border-y border-r border-[#CBD5E1] p-4 sm:p-5 rounded-[2px] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" aria-hidden="true" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#205081]">
              {isHi
                ? "भारत सरकार • तकनीकी शिक्षा नियामक प्राधिकरण • राज्य निदेशालय"
                : "GOVERNMENT OF INDIA • TECHNICAL EDUCATION REGULATORY AUTHORITY"}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#102A43] mt-1">
            {isHi ? "महाविद्यालयीन सीट एवं प्रवेश नियंत्रण" : "College Seats & Enrolment"}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center space-x-2">
            <label htmlFor="inst-select" className="text-xs font-semibold text-[#64748B]">
              {isHi ? "कॉलेज चुनें:" : "College:"}
            </label>
            <select
              id="inst-select"
              aria-label={t("Select Institution:")}
              value={selectedInstId}
              onChange={(e) => { setSelectedInstId(e.target.value); setPage(0); }}
              className="px-3 py-1.5 bg-white border border-[#CBD5E1] text-xs font-semibold text-[#205081] rounded-[2px] focus:outline-none focus:border-[#205081] cursor-pointer"
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
            className="px-3.5 py-1.5 bg-[#205081] hover:bg-[#112D4E] text-white text-xs font-bold rounded-[2px] transition-colors shadow-xs"
          >
            {isHi ? "छात्र सूची अपलोड करें" : "Upload Enrolment CSV"}
          </Link>
        </div>
      </div>

      {/* Official Government Notice Bar */}
      <div className="bg-[#FFFBEB] border-l-4 border-l-[#FF9933] border-y border-r border-[#CBD5E1] px-4 py-2.5 rounded-[2px] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#334155]">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[#102A43]">{isHi ? "सूचना:" : "Notice:"}</span>
          <span>
            {isHi
              ? "संस्थान की सक्रिय प्रवेश नामावली नीचे प्रदर्शित है। नए प्रवेश अद्यतन करने हेतु CSV अपलोड करें।"
              : "Active institution enrolment roster is displayed below. Upload a CSV to synchronize new admissions."}
          </span>
        </div>
        <Link
          href={`/institution/upload?instId=${currentInst.id}`}
          className="text-[#205081] font-bold hover:underline whitespace-nowrap self-start sm:self-auto"
        >
          {isHi ? "नया CSV अपलोड करें →" : "Upload New CSV →"}
        </Link>
      </div>

      {/* College Seat Capacity Ledger (Government Grid Format) */}
      <div className="bg-white border border-[#CBD5E1] rounded-[2px] p-4 sm:p-5 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#CBD5E1] gap-2">
          <div>
            <div className="text-xs font-mono font-bold text-[#205081]">
              {isHi ? `एआईसीटीई कोड: ${currentInst.aicte_code}` : `AICTE CODE: ${currentInst.aicte_code}`}
            </div>
            <h2 className="text-base font-bold text-[#102A43]">{currentInst.name}</h2>
            <div className="text-xs text-[#64748B]">
              {isHi ? `${currentInst.state} राज्य तकनीकी शिक्षा बोर्ड` : `${currentInst.state} State Technical Education Board`}
            </div>
          </div>

          <div className="text-left sm:text-right font-mono">
            <div className="text-[10px] text-[#64748B] uppercase font-bold">
              {isHi ? "सीट उपयोग दर" : "Seat Utilization"}
            </div>
            <div
              className={`text-xl font-bold ${
                isOverCapacity ? "text-[#B42318]" : "text-[#059669]"
              }`}
            >
              {currentInst.actual_enrolment} / {totalCap} {isHi ? "सीटें" : "Seats"} ({enrolmentPct}%)
            </div>
          </div>
        </div>

        {/* Linear Progress Bar */}
        <div className="space-y-1">
          <div className="h-2.5 w-full bg-[#EAEFF5] border border-[#CBD5E1] rounded-[2px] overflow-hidden">
            <div
              className={`h-full transition-all ${
                isOverCapacity
                  ? "bg-[#B42318]"
                  : enrolmentPct > 90
                  ? "bg-[#D97706]"
                  : "bg-[#059669]"
              }`}
              style={{ width: `${Math.min(enrolmentPct, 100)}%` }}
            />
          </div>
          <div className="flex flex-wrap justify-between gap-1 text-[11px] text-[#64748B] font-mono">
            <span>{isHi ? `स्वीकृत सीटें: ${currentInst.approved_intake}` : `Sanctioned: ${currentInst.approved_intake}`}</span>
            <span>{isHi ? `अतिरिक्त कोटा: +${currentInst.supernumerary_capacity}` : `Supernumerary: +${currentInst.supernumerary_capacity}`}</span>
            <span>{isHi ? `कुल सीमा: ${totalCap}` : `Total Ceiling: ${totalCap}`}</span>
          </div>
        </div>

        {/* Unified Institutional Audit Breakdown (Administrative Grid) */}
        <div className="bg-[#F8FAFC] border border-[#CBD5E1] rounded-[2px] p-3 divide-y sm:divide-y-0 sm:divide-x divide-[#CBD5E1] grid grid-cols-2 sm:grid-cols-4 text-xs">
          <div className="px-3 py-1">
            <span className="text-[#64748B] text-[10px] font-bold uppercase block">
              {isHi ? "स्वीकृत सीटें" : "Sanctioned Intake"}
            </span>
            <span className="text-base font-bold text-[#102A43] font-mono">{currentInst.approved_intake}</span>
          </div>
          <div className="px-3 py-1">
            <span className="text-[#64748B] text-[10px] font-bold uppercase block">
              {isHi ? "नामांकित छात्र" : "Enrolled"}
            </span>
            <span className="text-base font-bold text-[#102A43] font-mono">{currentInst.actual_enrolment}</span>
          </div>
          <div className="px-3 py-1">
            <span className="text-[#64748B] text-[10px] font-bold uppercase block">
              {isHi ? "समीक्षा कतार" : "Flagged"}
            </span>
            <span className="text-base font-bold text-[#B42318] font-mono">{currentInst.flagged_students}</span>
          </div>
          <div className="px-3 py-1">
            <span className="text-[#64748B] text-[10px] font-bold uppercase block">
              {isHi ? "सत्यनिष्ठा स्कोर" : "Integrity Score"}
            </span>
            <span className="text-base font-bold text-[#059669] font-mono">{currentInst.avg_integrity_score} / 100</span>
          </div>
        </div>
      </div>

      {/* Student Admission Roster Table */}
      <div className="bg-white border border-[#CBD5E1] rounded-[2px] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#CBD5E1] flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#EAEFF5]">
          <div>
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#205081]">
              {isHi ? "महाविद्यालयीन छात्र प्रवेश नामावली" : "College Enrolment Roster"}
            </div>
            <h3 className="text-sm sm:text-base font-bold text-[#102A43] mt-0.5">
              {isHi ? `प्रवेशित छात्र सूची (${totalStudents})` : `Student Admission List (${totalStudents})`}
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              aria-label={isHi ? "छात्र का नाम या रोल नंबर खोजें..." : "Search name or roll no..."}
              placeholder={isHi ? "नाम या रोल नंबर खोजें..." : "Search name or roll no..."}
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(0); }}
              className="px-3 py-1.5 bg-white border border-[#CBD5E1] text-xs text-[#102A43] rounded-[2px] focus:outline-none focus:border-[#205081] w-full sm:w-64"
            />

            <select
              aria-label={isHi ? "स्थिति" : "Status"}
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
              className="px-3 py-1.5 bg-white border border-[#CBD5E1] text-xs text-[#102A43] font-semibold rounded-[2px] focus:outline-none focus:border-[#205081] cursor-pointer"
            >
              <option value="ALL">{isHi ? "सभी स्थितियां" : "All Statuses"}</option>
              <option value="VERIFIED">{isHi ? "प्रमाणित रिकॉर्ड" : "Verified Records"}</option>
              <option value="FLAGGED">{isHi ? "फ्लैग किए गए रिकॉर्ड" : "Flagged Records"}</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[850px]">
            <thead className="bg-[#205081] text-white uppercase text-[10px] font-bold">
              <tr>
                <th scope="col" className="w-12 py-2.5 px-3 border-r border-[#112D4E] text-center">{isHi ? "क्र." : "Sr."}</th>
                <th scope="col" className="py-2.5 px-3 border-r border-[#112D4E] font-mono">{isHi ? "रोल नंबर" : "Roll No."}</th>
                <th scope="col" className="py-2.5 px-3 border-r border-[#112D4E]">{isHi ? "छात्र का नाम" : "Full Name"}</th>
                <th scope="col" className="py-2.5 px-3 border-r border-[#112D4E] font-mono">{isHi ? "अपार आईडी" : "APAAR ID"}</th>
                <th scope="col" className="py-2.5 px-3 border-r border-[#112D4E]">{isHi ? "पाठ्यक्रम" : "Program"}</th>
                <th scope="col" className="py-2.5 px-3 border-r border-[#112D4E]">{isHi ? "कोटा" : "Quota"}</th>
                <th scope="col" className="py-2.5 px-3 border-r border-[#112D4E] font-mono text-center">{isHi ? "अंक" : "Score"}</th>
                <th scope="col" className="py-2.5 px-3 border-r border-[#112D4E] text-center">{isHi ? "स्थिति" : "Status"}</th>
                <th scope="col" className="py-2.5 px-3 text-center w-24">{isHi ? "कार्रवाई" : "Action"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#CBD5E1] text-[#102A43]">
              {students.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-xs text-[#64748B]">
                    {loadError || (isLoading ? (isHi ? "डेटा लोड हो रहा है…" : "Loading…") : (isHi ? "कोई रिकॉर्ड नहीं मिला।" : "No records match criteria."))}
                  </td>
                </tr>
              ) : (
                students.map((stu, idx) => (
                  <tr
                    key={stu.id}
                    className={`transition-colors ${
                      idx % 2 === 0
                        ? "bg-white hover:bg-[#EAEFF5]"
                        : "bg-[#F4F6F9] hover:bg-[#EAEFF5]"
                    }`}
                  >
                    <td className="py-2.5 px-3 text-center font-bold text-[#64748B] border-r border-[#CBD5E1]">
                      {page * 50 + idx + 1}
                    </td>

                    <td className="py-2.5 px-3 font-mono font-bold text-[#205081] border-r border-[#CBD5E1]">
                      {stu.institutional_student_id}
                    </td>

                    <td className="py-2.5 px-3 font-bold text-[#102A43] border-r border-[#CBD5E1]">
                      {stu.full_name}
                    </td>

                    <td className="py-2.5 px-3 font-mono text-[#334155] border-r border-[#CBD5E1]">
                      {stu.masked_apaar}
                    </td>

                    <td className="py-2.5 px-3 text-[#334155] border-r border-[#CBD5E1]">
                      {stu.program}
                    </td>

                    <td className="py-2.5 px-3 whitespace-nowrap uppercase font-mono text-[10px] text-[#475569] border-r border-[#CBD5E1]">
                      {stu.nationality_type} / {stu.social_category || "GEN"}
                    </td>

                    <td className="py-2.5 px-3 font-mono font-bold text-center border-r border-[#CBD5E1]">
                      <span
                        className={
                          stu.integrity_score >= 90
                            ? "text-[#059669]"
                            : stu.integrity_score >= 70
                            ? "text-[#D97706]"
                            : "text-[#B42318]"
                        }
                      >
                        {stu.integrity_score}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 whitespace-nowrap text-center border-r border-[#CBD5E1]">
                      <span
                        className={`inline-block px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase rounded-[2px] border ${
                          stu.enrolment_status === "verified"
                            ? "bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]"
                            : "bg-[#FEF2F2] text-[#B42318] border-[#FECDCA]"
                        }`}
                      >
                        {stu.enrolment_status === "verified" ? (isHi ? "प्रमाणित" : "VERIFIED") : (isHi ? "विसंगत" : "FLAGGED")}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      <Link
                        href={`/aicte/students/${stu.id}`}
                        className="inline-flex items-center gap-1 bg-[#205081] text-white hover:bg-[#112D4E] px-2.5 py-1 text-xs font-bold rounded-[2px] transition-colors"
                      >
                        <span>{isHi ? "देखें" : "Inspect"}</span>
                        <span aria-hidden="true">&rarr;</span>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="p-3 bg-[#EAEFF5] border-t border-[#CBD5E1] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-[11px] text-[#64748B]">
          <span aria-live="polite">
            {isLoading
              ? (isHi ? "डेटा लोड हो रहा है…" : "Loading…")
              : (isHi
                  ? `पृष्ठ ${page + 1} (${totalStudents === 0 ? 0 : page * 50 + 1}–${Math.min((page + 1) * 50, totalStudents)} / कुल ${totalStudents})`
                  : `Page ${page + 1} (${totalStudents === 0 ? 0 : page * 50 + 1}–${Math.min((page + 1) * 50, totalStudents)} of ${totalStudents})`)}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page === 0 || isLoading}
              onClick={() => setPage((value) => Math.max(0, value - 1))}
              className="border border-[#205081] px-3 py-1 font-bold text-xs text-[#205081] bg-white hover:bg-[#F4F6F9] disabled:opacity-50 rounded-[2px] cursor-pointer"
            >
              {isHi ? "पिछला" : "Previous"}
            </button>
            <button
              type="button"
              disabled={(page + 1) * 50 >= totalStudents || isLoading}
              onClick={() => setPage((value) => value + 1)}
              className="border border-[#205081] px-3 py-1 font-bold text-xs text-[#205081] bg-white hover:bg-[#F4F6F9] disabled:opacity-50 rounded-[2px] cursor-pointer"
            >
              {isHi ? "अगला" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
