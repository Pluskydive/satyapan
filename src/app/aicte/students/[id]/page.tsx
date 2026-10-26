import Link from "next/link";
import { notFound } from "next/navigation";
import { dataProvider } from "@/lib/supabase";
import { formatMaskedApaar, getScoreStyle, getSeverityStyle } from "@/lib/security";

export async function generateStaticParams() {
  return [
    { id: "stu-1" },
    { id: "stu-10" },
    { id: "stu-20" },
    { id: "stu-30" },
    { id: "stu-40" },
  ];
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function StudentRiskPage({ params }: PageProps) {
  const { id } = await params;
  const { data: student } = await dataProvider.getStudentById(id);

  if (!student) {
    notFound();
  }

  const scoreStyle = getScoreStyle(student.integrity_score);
  const flags = student.flags || [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-6 space-y-6">
      {/* Back Link */}
      <div>
        <Link
          href="/aicte"
          className="text-xs font-semibold text-[#17365D] hover:underline"
        >
          &larr; Return to AICTE National Control Tower
        </Link>
      </div>

      {/* Case Header Card */}
      <div className="bg-white border border-[#D8DEE6] p-5 rounded-[2px]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-[10px] tracking-wider uppercase font-semibold text-[#5B6573]">
              Regulatory Case Record
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#17365D] mt-0.5">
              {student.full_name}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs text-[#5B6573] mt-1 font-mono">
              <span>Roll ID: {student.institutional_student_id}</span>
              <span>|</span>
              <span>APAAR ID: {formatMaskedApaar(student.apaar_id)}</span>
              <span>|</span>
              <span>Program: {student.program}</span>
            </div>
          </div>

          <div className="flex items-center space-x-3 self-start sm:self-auto">
            <div className="text-right">
              <div className="text-[10px] font-semibold text-[#5B6573] uppercase">
                Integrity Score
              </div>
              <div className={`text-2xl font-bold font-mono ${scoreStyle.color}`}>
                {student.integrity_score} / 100
              </div>
            </div>
            <span
              className={`px-2.5 py-1 text-xs font-bold uppercase rounded-[2px] border ${
                student.enrolment_status === "verified"
                  ? "bg-white text-[#237A52] border-[#237A52]"
                  : "bg-white text-[#B42318] border-[#B42318]"
              }`}
            >
              {student.enrolment_status}
            </span>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Violations vs Institutional Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Triggered Integrity Violations */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-[#D8DEE6] rounded-[2px] overflow-hidden">
            <div className="bg-[#F4F6F8] px-4 py-2.5 border-b border-[#D8DEE6] flex items-center justify-between">
              <span className="text-xs font-bold text-[#17365D] uppercase tracking-wider">
                Integrity Engine Violations ({flags.length} Open)
              </span>
              <span className="text-[11px] font-mono text-[#5B6573]">
                Section 10 AICTE Audit Matrix
              </span>
            </div>

            {flags.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#5B6573]">
                No active violations detected. This record conforms to all statutory admission requirements.
              </div>
            ) : (
              <div className="divide-y divide-[#D8DEE6]">
                {flags.map((flag: any) => {
                  const sev = getSeverityStyle(flag.severity);
                  return (
                    <div key={flag.id} className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded-[2px] ${sev.badge}`}
                          >
                            {flag.severity}
                          </span>
                          <span className="font-mono text-xs font-semibold text-[#17365D]">
                            {flag.rule_code}
                          </span>
                        </div>
                        <span className="text-[11px] font-mono text-[#5B6573] uppercase">
                          Status: {flag.status}
                        </span>
                      </div>

                      <div className="text-sm font-bold text-[#202B36]">{flag.title}</div>
                      <p className="text-xs text-[#5B6573] leading-relaxed">
                        {flag.explanation}
                      </p>

                      <div className="p-3 bg-[#F4F6F8] border border-[#D8DEE6] text-xs mt-2 rounded-[2px]">
                        <div className="font-semibold text-[#17365D] uppercase text-[10px] tracking-wider mb-0.5">
                          Recommended Council Enforcement Action:
                        </div>
                        <div className="text-[#202B36] leading-relaxed text-[11px]">
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
          <div className="bg-white border border-[#D8DEE6] rounded-[2px] overflow-hidden">
            <div className="bg-[#F4F6F8] px-4 py-2.5 border-b border-[#D8DEE6]">
              <span className="text-xs font-bold text-[#17365D] uppercase tracking-wider">
                Enrolment Particulars
              </span>
            </div>

            <table className="w-full text-xs border-collapse">
              <tbody className="divide-y divide-[#D8DEE6]">
                <tr>
                  <td className="py-2.5 px-4 text-[#5B6573] font-medium w-1/2">Institution Name</td>
                  <td className="py-2.5 px-4 font-semibold text-[#202B36]">{student.institutions?.name}</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 text-[#5B6573] font-medium">AICTE Code</td>
                  <td className="py-2.5 px-4 font-mono font-semibold text-[#17365D]">
                    {student.institutions?.aicte_code}
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 text-[#5B6573] font-medium">State Jurisdiction</td>
                  <td className="py-2.5 px-4 text-[#202B36]">{student.institutions?.state}</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 text-[#5B6573] font-medium">Nationality / Quota</td>
                  <td className="py-2.5 px-4 uppercase font-mono text-[#202B36]">{student.nationality_type}</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 text-[#5B6573] font-medium">Social Category</td>
                  <td className="py-2.5 px-4 font-mono text-[#202B36]">
                    {student.social_category || "NOT SPECIFIED"}
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 text-[#5B6573] font-medium">Date of Admission</td>
                  <td className="py-2.5 px-4 font-mono text-[#202B36]">{student.admission_date || "—"}</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 text-[#5B6573] font-medium">Reporting Year</td>
                  <td className="py-2.5 px-4 font-mono text-[#202B36]">{student.admission_year}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-white border border-[#D8DEE6] p-4 rounded-[2px] space-y-2 text-xs">
            <div className="font-bold text-[#17365D] uppercase text-[11px] tracking-wider">
              Third-Party Verification
            </div>
            <p className="text-[#5B6573] text-[11px] leading-relaxed">
              Employers verifying this student must query through the DPDP Act 2023 consent terminal using candidate token.
            </p>
            <Link
              href={`/verify?code=SATYA-${student.institutional_student_id}`}
              className="inline-block w-full py-2 text-center font-semibold text-[#17365D] bg-[#F4F6F8] border border-[#D8DEE6] hover:bg-slate-100 rounded-[2px] transition-colors text-xs"
            >
              Simulate Employer Verification &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
