import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full bg-[#102A43] text-slate-300 text-xs border-t border-[#17365D] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-6 border-b border-slate-700/60">
          <div className="md:col-span-2 space-y-2">
            <div className="font-semibold text-white tracking-wide uppercase text-[11px]">
              All India Council for Technical Education (AICTE)
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px] max-w-lg">
              Satyapan is the central technical education regulatory ledger for continuous student
              enrolment integrity, sanctioned seat quota compliance, and APAAR ID validation.
              Developed for the Smart India Hackathon 2026.
            </p>
            <div className="text-[10px] text-slate-400 pt-1 font-mono">
              Statutory Mandate: Section 10 of the AICTE Act, 1987 | DPDP Act, 2023 Compliant
            </div>
          </div>

          <div>
            <div className="font-semibold text-white tracking-wide uppercase text-[11px] mb-2">
              Administrative Portals
            </div>
            <ul className="space-y-1.5 text-[11px] text-slate-300">
              <li>
                <Link href="/aicte" className="hover:text-white hover:underline">
                  National Control Tower
                </Link>
              </li>
              <li>
                <Link href="/institution" className="hover:text-white hover:underline">
                  Institution Seat Ledgers
                </Link>
              </li>
              <li>
                <Link href="/institution/upload" className="hover:text-white hover:underline">
                  CSV Data Ingestion
                </Link>
              </li>
              <li>
                <Link href="/verify" className="hover:text-white hover:underline">
                  Employer Verification Portal
                </Link>
              </li>
              <li>
                <Link href="/audit" className="hover:text-white hover:underline">
                  System Audit Ledger
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <div className="font-semibold text-white tracking-wide uppercase text-[11px] mb-2">
              Compliance & Standards
            </div>
            <ul className="space-y-1.5 text-[11px] text-slate-400">
              <li>AICTE Approval Process Handbook (APH)</li>
              <li>Automated Permanent Academic Account Registry (APAAR)</li>
              <li>Academic Bank of Credits (ABC) Framework</li>
              <li>CWE-1236 Spreadsheet Security Standard</li>
            </ul>
          </div>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-400 gap-2">
          <div>
            Copyright 2026 All India Council for Technical Education. All rights reserved.
          </div>
          <div className="font-mono">
            System Environment: Production (Node.js / Next.js / PostgreSQL)
          </div>
        </div>
      </div>
    </footer>
  );
}
