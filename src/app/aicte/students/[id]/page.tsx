import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ShieldAlert,
  ShieldCheck,
  Building2,
  GraduationCap,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Lock,
  ExternalLink,
} from "lucide-react";
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Navigation Breadcrumb */}
      <div>
        <Link
          href="/aicte"
          className="inline-flex items-center space-x-1.5 text-xs text-slate-400 hover:text-amber-400 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to AICTE Control Tower</span>
        </Link>
      </div>

      {/* Top Profile Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl sm:text-3xl font-black text-white">{student.full_name}</h1>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  student.enrolment_status === "verified"
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                    : "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                }`}
              >
                {student.enrolment_status}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
              <span className="flex items-center space-x-1 font-mono bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                <Lock className="w-3.5 h-3.5 text-amber-400 mr-1" />
                <span>APAAR: {formatMaskedApaar(student.apaar_id)}</span>
              </span>
              <span className="font-mono text-slate-500">ID: {student.institutional_student_id}</span>
              <span>•</span>
              <span className="flex items-center space-x-1">
                <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
                <span>{student.program}</span>
              </span>
              <span>•</span>
              <span className="flex items-center space-x-1">
                <Building2 className="w-3.5 h-3.5 text-blue-400" />
                <span>{student.institutions?.name}</span>
              </span>
              <span>•</span>
              <span className="flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>Class of {student.admission_year}</span>
              </span>
            </div>
          </div>

          {/* Integrity Score Meter */}
          <div className="flex items-center space-x-4 bg-slate-950 p-4 rounded-2xl border border-slate-800 self-start md:self-auto">
            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                Integrity Score
              </span>
              <span className="text-xs text-slate-500">{scoreStyle.label}</span>
            </div>
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center font-mono text-2xl font-black border ${
                student.integrity_score >= 70
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                  : "bg-rose-500/10 text-rose-400 border-rose-500/30"
              }`}
            >
              {student.integrity_score}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Flags vs Metadata Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Triggered Anomaly Flags */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
              <span>Integrity Engine Flags ({flags.length})</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Automated heuristics triggered against national enrolment rules and capacity ledgers.
            </p>
          </div>

          {flags.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <p className="text-sm font-semibold text-slate-200">No Active Violations</p>
              <p className="text-xs text-slate-500">
                This student record matches all AICTE admission criteria and APAAR specifications.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {flags.map((flag: any) => {
                const sev = getSeverityStyle(flag.severity);
                return (
                  <div
                    key={flag.id}
                    className={`p-5 rounded-2xl border ${sev.border} ${sev.bg} space-y-3 transition-all`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${sev.badge}`}
                        >
                          {flag.severity}
                        </span>
                        <span className="font-mono text-xs font-semibold text-slate-300">
                          {flag.rule_code}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-mono">
                        Status: <strong className="text-amber-400 uppercase">{flag.status}</strong>
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-white">{flag.title}</h4>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        {flag.explanation}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs">
                      <span className="font-bold text-amber-400 uppercase text-[10px] tracking-wider block mb-1">
                        Recommended Regulatory Action:
                      </span>
                      <p className="text-slate-300 text-[11px] leading-relaxed">
                        {flag.recommended_action}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Institutional Details & Admission Ledger */}
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-[11px]">
              Enrolment Particulars
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-slate-400">Institutional Roll</span>
                <span className="font-mono font-semibold text-slate-200">
                  {student.institutional_student_id}
                </span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-slate-400">Nationality Type</span>
                <span className="font-semibold text-slate-200 uppercase font-mono">
                  {student.nationality_type}
                </span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-slate-400">Social Category</span>
                <span className="font-semibold text-slate-200 font-mono">
                  {student.social_category || "NOT SPECIFIED"}
                </span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-slate-400">Birth Year / Gender</span>
                <span className="font-semibold text-slate-200">
                  {student.dob_year || "—"} / {student.gender || "—"}
                </span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-slate-400">Admission Date</span>
                <span className="font-mono text-slate-200">
                  {student.admission_date || "—"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">College Sanction Code</span>
                <span className="font-mono text-amber-400 font-bold">
                  {student.institutions?.aicte_code}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Verifier Simulator */}
          <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-white">Employer Verification Link</h3>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Third-party employers can test verification of this student using their pre-generated
              QR / verification token.
            </p>
            <Link
              href={`/verify?code=SATYA-${student.institutional_student_id}`}
              className="inline-flex items-center justify-center space-x-1.5 w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
            >
              <span>Test Employer QR Verification</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
