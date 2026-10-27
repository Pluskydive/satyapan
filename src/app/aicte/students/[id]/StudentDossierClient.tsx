"use client";

import Link from "next/link";
import { useLanguage } from "@/components/LanguageProvider";
import { formatMaskedApaar, getScoreStyle, getSeverityStyle } from "@/lib/security";
import type { ValidationFlag } from "@/lib/types";

export interface StudentDossierData {
  id: string;
  institutional_student_id: string;
  institution_id: string;
  full_name: string;
  nationality_type: string;
  program: string;
  admission_year: number;
  admission_date?: string | null;
  enrolment_status: string;
  integrity_score: number;
  created_at: string;
  updated_at: string;
  masked_apaar?: string;
  apaar_id?: string | null;
  institutions?: {
    id?: string;
    name?: string;
    aicte_code?: string;
    state?: string;
    approved_intake?: number;
    supernumerary_capacity?: number;
  } | null;
  flags?: ValidationFlag[];
}

interface Props {
  student: StudentDossierData;
  mode: "demo" | "live";
}

export default function StudentDossierClient({ student, mode }: Props) {
  const { locale } = useLanguage();
  const isHi = locale === "hi";

  const scoreStyle = getScoreStyle(student.integrity_score);
  const flags = (student.flags || []) as ValidationFlag[];
  const maskedApaar = student.masked_apaar ?? formatMaskedApaar(student.apaar_id);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4">
      {/* Official Government Breadcrumb */}
      <div className="bg-[#EAEFF5] border border-[#CBD5E1] px-4 py-1.5 rounded-[2px] text-xs text-[#334155] flex flex-wrap items-center justify-between gap-2">
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
            {isHi ? "छात्र केस डोजियर" : "Student Case Dossier"}
          </span>
        </div>
        <div className="hidden sm:block text-[10px] font-mono text-[#64748B]">
          AICTE APH 2026-27 | GIGW Compliant
        </div>
      </div>

      {/* 1. Department Header Block */}
      <div className="bg-white border-l-4 border-l-[#FF9933] border-y border-r border-[#CBD5E1] p-4 sm:p-5 rounded-[2px] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-[10px] tracking-wider uppercase font-bold text-[#205081]">
              {isHi
                ? "भारत सरकार • अखिल भारतीय तकनीकी शिक्षा परिषद • छात्र सत्यापन डोजियर"
                : "GOVERNMENT OF INDIA • AICTE • STUDENT VERIFICATION DOSSIER"}
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#102A43] mt-1">
              {student.full_name}
            </h1>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-[#64748B] mt-1 font-mono">
              <span className="text-[#205081] font-bold">
                {isHi ? "रोल आईडी: " : "Roll ID: "}{student.institutional_student_id}
              </span>
              <span>|</span>
              <span>
                {isHi ? "अपार आईडी: " : "APAAR ID: "}{maskedApaar}
              </span>
              <span>|</span>
              <span className="text-[#102A43]">
                {isHi ? "पाठ्यक्रम: " : "Program: "}{student.program}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3 self-start sm:self-auto">
            <div className="text-right">
              <div className="text-[10px] font-bold text-[#64748B] uppercase">
                {isHi ? "सत्यनिष्ठा स्कोर" : "Integrity Score"}
              </div>
              <div className={`text-2xl font-black font-mono ${scoreStyle.color}`}>{student.integrity_score} / 100</div>
            </div>
            <span
              className={`px-2.5 py-1 text-xs font-bold uppercase rounded-[2px] border ${
                student.enrolment_status === "verified"
                  ? "bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]"
                  : "bg-[#FEF2F2] text-[#B42318] border-[#FECDCA]"
              }`}
            >
              {student.enrolment_status === "verified"
                ? (isHi ? "प्रमाणित" : "VERIFIED")
                : (isHi ? "विसंगत" : "FLAGGED")}
            </span>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Violations vs Institutional Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column: Triggered Integrity Violations */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-[#CBD5E1] rounded-[2px] overflow-hidden shadow-xs">
            <div className="bg-[#EAEFF5] px-4 py-2.5 border-b border-[#CBD5E1] flex items-center justify-between">
              <span className="text-xs font-bold text-[#205081] uppercase tracking-wider">
                {isHi ? `समीक्षा फ्लैग्स (${flags.length})` : `Review Flags (${flags.length})`}
              </span>
              <span className="text-[11px] font-mono text-[#64748B]">
                {mode === "demo" ? (isHi ? "सिमुलेशन नियम" : "Simulation Rules") : (isHi ? "सक्रिय फ्लैग्स" : "Active Flags")}
              </span>
            </div>

            {flags.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#059669] bg-[#ECFDF5]">
                {isHi
                  ? "कोई विसंगति नहीं पाई गई। छात्र प्रवेश पूरी तरह से वैध एवं प्रमाणित है।"
                  : "No discrepancy detected. Student enrolment is fully verified and compliant."}
              </div>
            ) : (
              <div className="divide-y divide-[#CBD5E1]">
                {flags.map((flag) => {
                  const sev = getSeverityStyle(flag.severity);
                  return (
                    <div key={flag.id} className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded-[2px] ${sev.badge}`}
                          >
                            {flag.severity === "critical"
                              ? (isHi ? "अति-गंभीर" : "CRITICAL")
                              : flag.severity === "high"
                              ? (isHi ? "गंभीर" : "HIGH")
                              : (isHi ? "मध्यम" : "MEDIUM")}
                          </span>
                          <span className="font-mono text-xs font-bold text-[#205081]">
                            {flag.rule_code}
                          </span>
                        </div>
                        <span className="text-[11px] font-mono text-[#64748B] uppercase">
                          {isHi ? "स्थिति: " : "Status: "}{flag.status}
                        </span>
                      </div>

                      <div className="text-sm font-bold text-[#102A43]">{flag.title}</div>
                      <p className="text-xs text-[#334155] leading-relaxed">
                        {flag.explanation}
                      </p>

                      <div className="p-3 bg-[#FFFBEB] border border-[#FEDF89] text-xs mt-2 rounded-[2px]">
                        <div className="font-bold text-[#B45309] uppercase text-[10px] tracking-wider mb-0.5">
                          {isHi ? "सिफारिश की गई कार्रवाई:" : "Recommended Action:"}
                        </div>
                        <div className="text-[#92400E] leading-relaxed text-[11px]">
                          {flag.recommended_action}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Record Particulars & Audit Summary */}
        <div className="space-y-4">
          <div className="bg-white border border-[#CBD5E1] rounded-[2px] overflow-hidden shadow-xs">
            <div className="bg-[#205081] text-white px-4 py-2 border-b border-[#112D4E]">
              <span className="text-xs font-bold uppercase tracking-wider">
                {isHi ? "प्रवेश विवरण" : "Enrolment Particulars"}
              </span>
            </div>

            <table className="w-full text-xs border-collapse">
              <tbody className="divide-y divide-[#CBD5E1]">
                <tr className="bg-white">
                  <td className="py-2.5 px-3 text-[#64748B] font-bold w-1/2 border-r border-[#CBD5E1] bg-[#F4F6F9]">
                    {isHi ? "महाविद्यालय" : "College"}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-[#102A43]">{student.institutions?.name}</td>
                </tr>
                <tr className="bg-[#F4F6F9]">
                  <td className="py-2.5 px-3 text-[#64748B] font-bold border-r border-[#CBD5E1] bg-[#F4F6F9]">
                    {isHi ? "AICTE कोड" : "AICTE Code"}
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold text-[#205081]">
                    {student.institutions?.aicte_code}
                  </td>
                </tr>
                <tr className="bg-white">
                  <td className="py-2.5 px-3 text-[#64748B] font-bold border-r border-[#CBD5E1] bg-[#F4F6F9]">
                    {isHi ? "राज्य" : "State"}
                  </td>
                  <td className="py-2.5 px-3 text-[#102A43] font-semibold">{student.institutions?.state}</td>
                </tr>
                <tr className="bg-[#F4F6F9]">
                  <td className="py-2.5 px-3 text-[#64748B] font-bold border-r border-[#CBD5E1] bg-[#F4F6F9]">
                    {isHi ? "कोटा" : "Quota"}
                  </td>
                  <td className="py-2.5 px-3 uppercase font-mono text-[#102A43] font-semibold">{student.nationality_type}</td>
                </tr>
                <tr className="bg-white">
                  <td className="py-2.5 px-3 text-[#64748B] font-bold border-r border-[#CBD5E1] bg-[#F4F6F9]">
                    {isHi ? "प्रवेश तिथि" : "Admission Date"}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[#102A43]">{student.admission_date || "—"}</td>
                </tr>
                <tr className="bg-[#F4F6F9]">
                  <td className="py-2.5 px-3 text-[#64748B] font-bold border-r border-[#CBD5E1] bg-[#F4F6F9]">
                    {isHi ? "प्रवेश वर्ष" : "Admission Year"}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[#102A43]">{student.admission_year}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-white border border-[#CBD5E1] p-4 rounded-[2px] space-y-2.5 text-xs shadow-xs">
            <div className="font-bold text-[#205081] uppercase text-[11px] tracking-wider">
              {isHi ? "सत्यापन एवं प्रमाण-पत्र" : "Credential Verification"}
            </div>
            <p className="text-[#64748B] text-[11px] leading-relaxed">
              {isHi
                ? "इस छात्र के शैक्षणिक रिकॉर्ड का डिजिटल प्रमाणपत्र देखें या नियोक्ता के लिए सत्यापन परीक्षण चलाएं।"
                : "Inspect the tamper-evident cryptographic digital credential or run a simulated employer verification query."}
            </p>
            <Link
              href={`/verify/certificate/${student.id}`}
              className="inline-block w-full py-2 text-center font-bold text-white bg-[#205081] hover:bg-[#112D4E] rounded-[2px] transition-colors text-xs shadow-xs"
            >
              {isHi ? "प्रमाणपत्र देखें →" : "View Certificate →"}
            </Link>
            <Link
              href={`/verify?code=SATYA-${student.institutional_student_id}`}
              className="inline-block w-full py-2 text-center font-bold text-[#205081] bg-[#F4F6F9] border border-[#CBD5E1] hover:bg-[#EAEFF5] rounded-[2px] transition-colors text-xs"
            >
              {isHi ? "सत्यापन परीक्षण चलाएं →" : "Run Verification Query →"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
