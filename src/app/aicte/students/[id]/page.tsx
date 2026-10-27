import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { dataProvider } from "@/lib/supabase";
import { AuthorizationError, requireRole } from "@/lib/authz";
import { getRuntimeMode } from "@/lib/runtime-mode";
import { formatMaskedApaar, getScoreStyle, getSeverityStyle } from "@/lib/security";
import type { ValidationFlag } from "@/lib/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function StudentRiskPage({ params }: PageProps) {
  const { id } = await params;

  if (getRuntimeMode() === "live") {
    try {
      await requireRole("platform_admin", "institution_admin", "institution_staff", "reviewer");
    } catch (error) {
      if (error instanceof AuthorizationError && error.status === 401) {
        redirect(`/login?next=%2Faicte%2Fstudents%2F${encodeURIComponent(id)}`);
      }
      redirect("/aicte");
    }
  }

  const { data: student, mode } = await dataProvider.getStudentById(id);

  if (!student) {
    notFound();
  }

  const scoreStyle = getScoreStyle(student.integrity_score);
  const flags = (student.flags || []) as ValidationFlag[];
  const maskedApaar = student.masked_apaar ?? formatMaskedApaar(student.apaar_id);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4">
      {/* Maharashtra.gov.in Official Breadcrumb */}
      <div className="bg-[#EAEFF5] border border-[#CBD5E1] px-4 py-1.5 rounded-[2px] text-xs text-[#334155] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-[11px]">
          <Link href="/" className="text-[#205081] font-semibold hover:underline">
            मुख्य पृष्ठ / Home
          </Link>
          <span className="text-[#94A3B8]">&gt;</span>
          <Link href="/aicte" className="text-[#205081] font-semibold hover:underline">
            केंद्रीय पडताळणी कक्ष / Control Tower
          </Link>
          <span className="text-[#94A3B8]">&gt;</span>
          <span className="text-[#102A43] font-bold">
            विद्यार्थी प्रकरण नोंद / Student Case Dossier
          </span>
        </div>
        <div className="hidden sm:block text-[10px] font-mono text-[#64748B]">
          AICTE APH 2026-27 | GIGW Compliant
        </div>
      </div>

      {/* 1. Maharashtra.gov.in Department Header Block */}
      <div className="bg-white border-l-4 border-l-[#FF9933] border-y border-r border-[#CBD5E1] p-4 sm:p-5 rounded-[2px] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-[10px] tracking-wider uppercase font-bold text-[#205081]">
              महाराष्ट्र शासन • तंत्रशिक्षण संचालनालय • Student Verification Dossier
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#102A43] mt-1">
              {student.full_name}
            </h1>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-[#64748B] mt-1 font-mono">
              <span className="text-[#205081] font-bold">रोल / Roll ID: {student.institutional_student_id}</span>
              <span>|</span>
              <span>अपार आयडी / APAAR: {maskedApaar}</span>
              <span>|</span>
              <span className="text-[#102A43]">अभ्यासक्रम / Program: {student.program}</span>
            </div>
          </div>

          <div className="flex items-center space-x-3 self-start sm:self-auto">
            <div className="text-right">
              <div className="text-[10px] font-bold text-[#64748B] uppercase">सत्यता निर्देशांक / Score</div>
              <div className={`text-2xl font-black font-mono ${scoreStyle.color}`}>{student.integrity_score} / 100</div>
            </div>
            <span
              className={`px-2.5 py-1 text-xs font-bold uppercase rounded-[2px] border ${
                student.enrolment_status === "verified"
                  ? "bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]"
                  : "bg-[#FEF2F2] text-[#B42318] border-[#FECDCA]"
              }`}
            >
              {student.enrolment_status === "verified" ? "प्रमाणित / VALID" : "विसंगत / FLAGGED"}
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
                तपासणी दोषारोप व विसंगती / Review Flags ({flags.length})
              </span>
              <span className="text-[11px] font-mono text-[#64748B]">
                {mode === "demo" ? "चाचणी नियम / Simulation Rules" : "सक्रिय नोंदी / Active Flags"}
              </span>
            </div>

            {flags.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#059669] bg-[#ECFDF5]">
                कोणतीही विसंगती आढळली नाही. विद्यार्थी प्रवेश पूर्णपणे वैध व प्रमाणित आहे.
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
                            {flag.severity === "critical" ? "अतिगंभीर / CRITICAL" : flag.severity === "high" ? "गंभीर / HIGH" : "मध्यम / MEDIUM"}
                          </span>
                          <span className="font-mono text-xs font-bold text-[#205081]">
                            {flag.rule_code}
                          </span>
                        </div>
                        <span className="text-[11px] font-mono text-[#64748B] uppercase">
                          स्थिती / Status: {flag.status}
                        </span>
                      </div>

                      <div className="text-sm font-bold text-[#102A43]">{flag.title}</div>
                      <p className="text-xs text-[#334155] leading-relaxed">
                        {flag.explanation}
                      </p>

                      <div className="p-3 bg-[#FFFBEB] border border-[#FEDF89] text-xs mt-2 rounded-[2px]">
                        <div className="font-bold text-[#B45309] uppercase text-[10px] tracking-wider mb-0.5">
                          शिफारस केलेली पुढील कारवाई / Recommended Action:
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
                प्रवेश तपशील / Enrolment Particulars
              </span>
            </div>

            <table className="w-full text-xs border-collapse">
              <tbody className="divide-y divide-[#CBD5E1]">
                <tr className="bg-white">
                  <td className="py-2.5 px-3 text-[#64748B] font-bold w-1/2 border-r border-[#CBD5E1] bg-[#F4F6F9]">महाविद्यालय / College</td>
                  <td className="py-2.5 px-3 font-bold text-[#102A43]">{student.institutions?.name}</td>
                </tr>
                <tr className="bg-[#F4F6F9]">
                  <td className="py-2.5 px-3 text-[#64748B] font-bold border-r border-[#CBD5E1] bg-[#F4F6F9]">AICTE संकेतांक / Code</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-[#205081]">
                    {student.institutions?.aicte_code}
                  </td>
                </tr>
                <tr className="bg-white">
                  <td className="py-2.5 px-3 text-[#64748B] font-bold border-r border-[#CBD5E1] bg-[#F4F6F9]">राज्य / State</td>
                  <td className="py-2.5 px-3 text-[#102A43] font-semibold">{student.institutions?.state}</td>
                </tr>
                <tr className="bg-[#F4F6F9]">
                  <td className="py-2.5 px-3 text-[#64748B] font-bold border-r border-[#CBD5E1] bg-[#F4F6F9]">प्रवर्ग / Quota</td>
                  <td className="py-2.5 px-3 uppercase font-mono text-[#102A43] font-semibold">{student.nationality_type}</td>
                </tr>
                <tr className="bg-white">
                  <td className="py-2.5 px-3 text-[#64748B] font-bold border-r border-[#CBD5E1] bg-[#F4F6F9]">प्रवेश दिनांक / Date</td>
                  <td className="py-2.5 px-3 font-mono text-[#102A43]">{student.admission_date || "—"}</td>
                </tr>
                <tr className="bg-[#F4F6F9]">
                  <td className="py-2.5 px-3 text-[#64748B] font-bold border-r border-[#CBD5E1] bg-[#F4F6F9]">नोंदणी वर्ष / Year</td>
                  <td className="py-2.5 px-3 font-mono text-[#102A43]">{student.admission_year}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-white border border-[#CBD5E1] p-4 rounded-[2px] space-y-2.5 text-xs shadow-xs">
            <div className="font-bold text-[#205081] uppercase text-[11px] tracking-wider">
              सत्यापन प्रमाणपत्र व पडताळणी / Verification
            </div>
            <p className="text-[#64748B] text-[11px] leading-relaxed">
              सदर विद्यार्थ्याच्या शैक्षणिक नोंदींचे डिजिटल प्रमाणपत्र पहा किंवा नियोक्त्यासाठी थेट पडताळणी चाचणी करा.
            </p>
            <Link
              href={`/verify/certificate/${student.id}`}
              className="inline-block w-full py-2 text-center font-bold text-white bg-[#205081] hover:bg-[#112D4E] rounded-[2px] transition-colors text-xs shadow-xs"
            >
              प्रमाणपत्र पहा / View Certificate &rarr;
            </Link>
            <Link
              href={`/verify?code=SATYA-${student.institutional_student_id}`}
              className="inline-block w-full py-2 text-center font-bold text-[#205081] bg-[#F4F6F9] border border-[#CBD5E1] hover:bg-[#EAEFF5] rounded-[2px] transition-colors text-xs"
            >
              नियोक्ता पडताळणी चाचणी / Employer Test &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
