import Link from "next/link";
import { dataProvider } from "@/lib/supabase";

export default async function HomePage() {
  const [nationalRes, flagsRes] = await Promise.all([
    dataProvider.getNationalSummary(),
    dataProvider.getOpenFlags(),
  ]);

  const stats = nationalRes.data || {
    institutions_reporting: 5,
    total_students: 301,
    verified_students: 297,
    flagged_students: 4,
    avg_integrity_score: 98.4,
  };

  const openFlags = flagsRes.data || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 space-y-6">
      {/* Official Page Banner */}
      <div className="bg-white border border-[#D8DEE6] p-5 rounded-[2px]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-[11px] font-semibold text-[#5B6573] uppercase tracking-wider">
              Executive Dashboard
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#17365D] mt-0.5">
              National Technical Education Enrolment Overview
            </h1>
            <p className="text-xs text-[#5B6573] mt-1 max-w-3xl leading-relaxed">
              Automated continuous verification system linking institutional admissions to national APAAR identifiers,
              tracking sanctioned seat capacities, and resolving enrolment anomalies in technical institutions.
            </p>
          </div>

          <div className="flex items-center space-x-2 self-start sm:self-auto">
            <Link
              href="/aicte"
              className="px-4 py-2 bg-[#17365D] hover:bg-[#102A43] text-white text-xs font-semibold rounded-[2px] transition-colors"
            >
              Open Control Tower
            </Link>
          </div>
        </div>
      </div>

      {/* Primary Operational Metric Ledger */}
      <div className="bg-white border border-[#D8DEE6] rounded-[2px] overflow-hidden">
        <div className="bg-[#F4F6F8] px-4 py-2.5 border-b border-[#D8DEE6] flex items-center justify-between">
          <span className="text-xs font-bold text-[#17365D] uppercase tracking-wider">
            National Operational Metrics (Academic Year 2026-27)
          </span>
          <span className="text-[11px] font-mono text-[#5B6573]">
            Status: All Systems Verified
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-[#D8DEE6]">
          <div className="p-4">
            <div className="text-[11px] font-semibold text-[#5B6573] uppercase">
              Reporting Institutions
            </div>
            <div className="text-2xl font-bold text-[#17365D] mt-1">
              {stats.institutions_reporting}
            </div>
            <div className="text-[11px] text-[#5B6573] mt-0.5">
              Accredited Technical Colleges
            </div>
          </div>

          <div className="p-4">
            <div className="text-[11px] font-semibold text-[#5B6573] uppercase">
              Total Admissions Logged
            </div>
            <div className="text-2xl font-bold text-[#17365D] mt-1">
              {stats.total_students}
            </div>
            <div className="text-[11px] text-[#5B6573] mt-0.5">
              Student Records Synchronized
            </div>
          </div>

          <div className="p-4">
            <div className="text-[11px] font-semibold text-[#5B6573] uppercase">
              Verified Compliant
            </div>
            <div className="text-2xl font-bold text-[#237A52] mt-1">
              {stats.verified_students}
            </div>
            <div className="text-[11px] text-[#237A52] mt-0.5">
              {Math.round((stats.verified_students / (stats.total_students || 1)) * 100)}% Verified Valid
            </div>
          </div>

          <div className="p-4">
            <div className="text-[11px] font-semibold text-[#5B6573] uppercase">
              Regulatory Discrepancies
            </div>
            <div className="text-2xl font-bold text-[#B42318] mt-1">
              {openFlags.length}
            </div>
            <div className="text-[11px] text-[#B42318] mt-0.5">
              Action Required
            </div>
          </div>

          <div className="p-4 col-span-2 md:col-span-1">
            <div className="text-[11px] font-semibold text-[#5B6573] uppercase">
              National Integrity Index
            </div>
            <div className="text-2xl font-bold text-[#17365D] mt-1">
              {stats.avg_integrity_score} / 100
            </div>
            <div className="text-[11px] text-[#5B6573] mt-0.5">
              Council Benchmark Average
            </div>
          </div>
        </div>
      </div>

      {/* Directory of Administrative Modules */}
      <div className="bg-white border border-[#D8DEE6] rounded-[2px] overflow-hidden">
        <div className="bg-[#F4F6F8] px-4 py-2.5 border-b border-[#D8DEE6]">
          <span className="text-xs font-bold text-[#17365D] uppercase tracking-wider">
            Administrative Modules & Stakeholder Terminals
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="border-b border-[#D8DEE6] bg-slate-50 text-[#5B6573] uppercase text-[10px] tracking-wider font-semibold">
              <tr>
                <th className="py-2.5 px-4 w-1/4">Module Name</th>
                <th className="py-2.5 px-4 w-1/4">Primary Stakeholder</th>
                <th className="py-2.5 px-4 w-1/3">Statutory Scope & Purpose</th>
                <th className="py-2.5 px-4 text-right">Access</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D8DEE6] text-[#202B36]">
              <tr className="hover:bg-slate-50">
                <td className="py-3 px-4 font-semibold text-[#17365D]">
                  National Control Tower
                </td>
                <td className="py-3 px-4 text-[#5B6573]">
                  AICTE Central Secretariat / Regulators
                </td>
                <td className="py-3 px-4 text-[#5B6573]">
                  Real-time monitoring of duplicate cross-institutional enrolments, regional capacity compliance, and active flag queue.
                </td>
                <td className="py-3 px-4 text-right">
                  <Link href="/aicte" className="text-[#17365D] font-semibold hover:underline">
                    Open Terminal &rarr;
                  </Link>
                </td>
              </tr>

              <tr className="hover:bg-slate-50">
                <td className="py-3 px-4 font-semibold text-[#17365D]">
                  Institution Seat Ledgers
                </td>
                <td className="py-3 px-4 text-[#5B6573]">
                  College Registrars & Admissions Deans
                </td>
                <td className="py-3 px-4 text-[#5B6573]">
                  Tracking sanctioned vs. actual admissions intake, supernumerary quotas (FW/NRI), and institutional student rosters.
                </td>
                <td className="py-3 px-4 text-right">
                  <Link href="/institution" className="text-[#17365D] font-semibold hover:underline">
                    Open Terminal &rarr;
                  </Link>
                </td>
              </tr>

              <tr className="hover:bg-slate-50">
                <td className="py-3 px-4 font-semibold text-[#17365D]">
                  CSV Batch Ingestion Center
                </td>
                <td className="py-3 px-4 text-[#5B6573]">
                  College Data Operators & Registrars
                </td>
                <td className="py-3 px-4 text-[#5B6573]">
                  Bulk upload of student admission rosters with CWE-1236 formula sanitization and instant APAAR syntax validation.
                </td>
                <td className="py-3 px-4 text-right">
                  <Link href="/institution/upload" className="text-[#17365D] font-semibold hover:underline">
                    Open Terminal &rarr;
                  </Link>
                </td>
              </tr>

              <tr className="hover:bg-slate-50">
                <td className="py-3 px-4 font-semibold text-[#17365D]">
                  Employer Credential Verification
                </td>
                <td className="py-3 px-4 text-[#5B6573]">
                  Industry Employers & Verifiers
                </td>
                <td className="py-3 px-4 text-[#5B6573]">
                  DPDP Act 2023 compliant background verification with digital student consent gate and selective attribute disclosure.
                </td>
                <td className="py-3 px-4 text-right">
                  <Link href="/verify" className="text-[#17365D] font-semibold hover:underline">
                    Open Terminal &rarr;
                  </Link>
                </td>
              </tr>

              <tr className="hover:bg-slate-50">
                <td className="py-3 px-4 font-semibold text-[#17365D]">
                  Regulatory Audit Ledger
                </td>
                <td className="py-3 px-4 text-[#5B6573]">
                  Internal Audit & Vigilance Officers
                </td>
                <td className="py-3 px-4 text-[#5B6573]">
                  Cryptographic, immutable audit log of all admissions, flag modifications, rule executions, and verifier queries.
                </td>
                <td className="py-3 px-4 text-right">
                  <Link href="/audit" className="text-[#17365D] font-semibold hover:underline">
                    Open Terminal &rarr;
                  </Link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Autonomous Integrity Rules Specification */}
      <div className="bg-white border border-[#D8DEE6] rounded-[2px] overflow-hidden">
        <div className="bg-[#F4F6F8] px-4 py-2.5 border-b border-[#D8DEE6]">
          <span className="text-xs font-bold text-[#17365D] uppercase tracking-wider">
            Autonomous Integrity Engine: Detection Heuristics Matrix
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="border-b border-[#D8DEE6] bg-slate-50 text-[#5B6573] uppercase text-[10px] tracking-wider font-semibold">
              <tr>
                <th className="py-2.5 px-4">Rule Code</th>
                <th className="py-2.5 px-4">Severity Penalty</th>
                <th className="py-2.5 px-4">Violation Definition</th>
                <th className="py-2.5 px-4">Council Recommended Enforcement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D8DEE6] text-[#202B36] font-mono text-[11px]">
              <tr>
                <td className="py-2.5 px-4 font-bold text-[#B42318]">CROSS_INSTITUTION_OVERLAP</td>
                <td className="py-2.5 px-4 font-semibold text-[#B42318]">CRITICAL (-50)</td>
                <td className="py-2.5 px-4 font-sans text-xs">Identical APAAR ID active across multiple institutions concurrently</td>
                <td className="py-2.5 px-4 font-sans text-xs">Classify as Allowed, Review, or Violation after physical verification</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-bold text-[#B42318]">EXCESS_ENROLMENT</td>
                <td className="py-2.5 px-4 font-semibold text-[#B42318]">CRITICAL (-50)</td>
                <td className="py-2.5 px-4 font-sans text-xs">Active admissions exceed approved intake + supernumerary capacity</td>
                <td className="py-2.5 px-4 font-sans text-xs">Seat freeze: Institution must justify excess intake before AICTE Executive Committee</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-bold text-[#B42318]">INVALID_APAAR</td>
                <td className="py-2.5 px-4 font-semibold text-[#B42318]">HIGH (-30)</td>
                <td className="py-2.5 px-4 font-sans text-xs">APAAR ID missing or does not conform to 12-digit numeric standard</td>
                <td className="py-2.5 px-4 font-sans text-xs">Institution must correct APAAR or initiate creation via APAAR Portal</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-bold text-[#B42318]">DUPLICATE_APAAR_IN_INSTITUTION</td>
                <td className="py-2.5 px-4 font-semibold text-[#B42318]">HIGH (-30)</td>
                <td className="py-2.5 px-4 font-sans text-xs">Same APAAR ID entered multiple times within the same institution roster</td>
                <td className="py-2.5 px-4 font-sans text-xs">Merge duplicate records after institutional identity verification</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-bold text-[#986500]">NATIONALITY_INCONSISTENCY</td>
                <td className="py-2.5 px-4 font-semibold text-[#986500]">MEDIUM (-15)</td>
                <td className="py-2.5 px-4 font-sans text-xs">Student marked as NRI/OCI/FN without valid category documentation</td>
                <td className="py-2.5 px-4 font-sans text-xs">Request corrected category and quota documentation from registrar</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-bold text-[#986500]">LATE_ADMISSION</td>
                <td className="py-2.5 px-4 font-semibold text-[#986500]">MEDIUM (-15)</td>
                <td className="py-2.5 px-4 font-sans text-xs">Admission date recorded after October 15 cutoff deadline</td>
                <td className="py-2.5 px-4 font-sans text-xs">Institution must provide approved late admission sanction or correction</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
