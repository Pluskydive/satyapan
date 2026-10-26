import Link from "next/link";
import { Shield, Lock, Database, Award, ArrowUpRight } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-slate-400 text-xs py-10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-black text-white tracking-wider">SATYAPAN (सत्यापन)</span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-400 font-semibold border border-amber-500/30">
                SIH 2026
              </span>
            </div>
            <p className="text-slate-400 leading-relaxed max-w-lg text-xs">
              AICTE Enrolment Integrity & APAAR Continuous Verification System. Developed for the
              Smart India Hackathon 2026 to eliminate ghost admissions, detect seat ceiling breaches,
              and empower employers with consent-based digital credential verification.
            </p>
            <div className="flex items-center space-x-4 pt-1 text-[11px] text-slate-500">
              <span className="flex items-center space-x-1">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>DPDP Act 2023 Gated</span>
              </span>
              <span>•</span>
              <span className="flex items-center space-x-1">
                <Shield className="w-3.5 h-3.5 text-indigo-400" />
                <span>Zero-Trust APAAR Verification</span>
              </span>
              <span>•</span>
              <span className="flex items-center space-x-1">
                <Database className="w-3.5 h-3.5 text-amber-400" />
                <span>Tamper-Evident Ledger</span>
              </span>
            </div>
          </div>

          {/* Quick Portals */}
          <div>
            <h4 className="text-slate-200 font-semibold mb-3 tracking-wide uppercase text-[11px]">System Portals</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/aicte" className="hover:text-amber-400 transition-colors flex items-center space-x-1">
                  <span>AICTE National Control Tower</span>
                  <ArrowUpRight className="w-3 h-3 opacity-60" />
                </Link>
              </li>
              <li>
                <Link href="/institution" className="hover:text-amber-400 transition-colors flex items-center space-x-1">
                  <span>Institution Seat Ledger</span>
                  <ArrowUpRight className="w-3 h-3 opacity-60" />
                </Link>
              </li>
              <li>
                <Link href="/institution/upload" className="hover:text-amber-400 transition-colors flex items-center space-x-1">
                  <span>Bulk CSV Data Ingestion</span>
                  <ArrowUpRight className="w-3 h-3 opacity-60" />
                </Link>
              </li>
              <li>
                <Link href="/verify" className="hover:text-amber-400 transition-colors flex items-center space-x-1">
                  <span>Employer QR Verification</span>
                  <ArrowUpRight className="w-3 h-3 opacity-60" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Compliance & Standards */}
          <div>
            <h4 className="text-slate-200 font-semibold mb-3 tracking-wide uppercase text-[11px]">Compliance & Stack</h4>
            <ul className="space-y-2 text-slate-400">
              <li className="flex items-center space-x-1.5">
                <Award className="w-3 h-3 text-amber-400" />
                <span>AICTE Approval Process Handbook</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <Shield className="w-3 h-3 text-emerald-400" />
                <span>APAAR / ABC / DigiLocker Standard</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <Database className="w-3 h-3 text-blue-400" />
                <span>PostgreSQL & PL/pgSQL Engine</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <Lock className="w-3 h-3 text-purple-400" />
                <span>CWE-1236 Formula Injection Shield</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-slate-500 text-[11px] gap-2">
          <p>© 2026 SATYAPAN — Smart India Hackathon Submission. All Rights Reserved.</p>
          <p className="font-mono text-slate-600">Built with Next.js 16, Supabase, TypeScript & Tailwind CSS</p>
        </div>
      </div>
    </footer>
  );
}
