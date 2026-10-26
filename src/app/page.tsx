import Link from "next/link";
import {
  ShieldCheck,
  Building2,
  UploadCloud,
  QrCode,
  Activity,
  FileText,
  AlertTriangle,
  Users,
  CheckCircle2,
  Lock,
  ArrowRight,
  Database,
  Cpu,
  Layers,
} from "lucide-react";
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
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 border-b border-slate-800/80 bg-gradient-to-b from-slate-900/60 via-slate-950 to-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(245,158,11,0.15),rgba(255,255,255,0))] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span>Smart India Hackathon 2026 • Official Platform Submission</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
              Continuous Enrolment <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-200 bg-clip-text text-transparent">
                Integrity & APAAR Verification
              </span>
            </h1>

            <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
              Moving technical education from claimed annual intake numbers to real-time,
              confirmed student-level integrity linked with national APAAR IDs, AICTE Seat Ledgers,
              and consent-gated employer credentials.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link
                href="/aicte"
                className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-lg shadow-amber-500/25 transition-all active:scale-95 text-sm"
              >
                <Activity className="w-4 h-4" />
                <span>Launch AICTE Control Tower</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
              <Link
                href="/institution"
                className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold transition-all text-sm"
              >
                <Building2 className="w-4 h-4 text-amber-400" />
                <span>Institution Seat Ledger</span>
              </Link>
              <Link
                href="/verify"
                className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 text-slate-300 border border-slate-800 font-semibold transition-all text-sm"
              >
                <QrCode className="w-4 h-4 text-emerald-400" />
                <span>Employer Verification</span>
              </Link>
            </div>
          </div>

          {/* Quick Metrics Ticker */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-14 max-w-5xl mx-auto">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Reporting Colleges</span>
                <Building2 className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-2xl font-black text-white mt-2">{stats.institutions_reporting}</p>
              <p className="text-[11px] text-slate-500 mt-1">Accredited institutes active</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Enrolments</span>
                <Users className="w-4 h-4 text-indigo-400" />
              </div>
              <p className="text-2xl font-black text-white mt-2">{stats.total_students}</p>
              <p className="text-[11px] text-emerald-400 mt-1">
                {stats.verified_students} Verified (
                {Math.round((stats.verified_students / (stats.total_students || 1)) * 100)}%)
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Flags</span>
                <AlertTriangle className="w-4 h-4 text-rose-400" />
              </div>
              <p className="text-2xl font-black text-rose-400 mt-2">{openFlags.length}</p>
              <p className="text-[11px] text-rose-400/80 mt-1">Requires immediate review</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Integrity Index</span>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-2xl font-black text-emerald-400 mt-2">{stats.avg_integrity_score} / 100</p>
              <p className="text-[11px] text-slate-500 mt-1">National average score</p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature & Portals Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Dedicated Regulatory & Stakeholder Portals</h2>
          <p className="text-slate-400 text-sm mt-2">
            Each role interacts through a hardened, zero-trust interface designed specifically for their mandate.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* AICTE Card */}
          <Link
            href="/aicte"
            className="group p-6 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-amber-500/50 transition-all hover:shadow-2xl hover:shadow-amber-500/10 flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-5 group-hover:scale-110 transition-transform">
                <Activity className="w-6 h-6" />
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Apex Authority</span>
              </div>
              <h3 className="text-xl font-bold text-white mt-1 group-hover:text-amber-300 transition-colors">
                AICTE Central Control Tower
              </h3>
              <p className="text-slate-400 text-xs leading-relaxed mt-2.5">
                Real-time national surveillance dashboard. Detects cross-institutional ghost enrolments,
                monitors state-wise student distributions, inspects quota compliance, and executes the
                Integrity Engine.
              </p>
            </div>
            <div className="pt-6 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-amber-400">
              <span>Inspect National Ledger</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Institution Card */}
          <Link
            href="/institution"
            className="group p-6 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-blue-500/50 transition-all hover:shadow-2xl hover:shadow-blue-500/10 flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-5 group-hover:scale-110 transition-transform">
                <Building2 className="w-6 h-6" />
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Colleges & Universities</span>
              </div>
              <h3 className="text-xl font-bold text-white mt-1 group-hover:text-blue-300 transition-colors">
                Institution Seat Ledger & Roster
              </h3>
              <p className="text-slate-400 text-xs leading-relaxed mt-2.5">
                Track sanctioned vs. actual intake in real-time. Manage supernumerary admissions (FW, NRI, EWS),
                view flagged student dossiers with recommended resolution steps, and upload admission batches.
              </p>
            </div>
            <div className="pt-6 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-blue-400">
              <span>Open Seat Ledger</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Employer Verification Card */}
          <Link
            href="/verify"
            className="group p-6 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-emerald-500/50 transition-all hover:shadow-2xl hover:shadow-emerald-500/10 flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-5 group-hover:scale-110 transition-transform">
                <QrCode className="w-6 h-6" />
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Employers & Industry</span>
              </div>
              <h3 className="text-xl font-bold text-white mt-1 group-hover:text-emerald-300 transition-colors">
                Consent-Gated QR Verification
              </h3>
              <p className="text-slate-400 text-xs leading-relaxed mt-2.5">
                DPDP Act 2023 compliant background checks. Verifiers scan a secure student QR code, but
                credentials are only disclosed when the student grants digital consent. Excludes sensitive PII.
              </p>
            </div>
            <div className="pt-6 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-emerald-400">
              <span>Verify Candidate</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </section>

      {/* SIH Hackathon Demo Pitch & Value Proposition */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-amber-950/30 border border-slate-800 shadow-2xl relative overflow-hidden">
          <div className="max-w-3xl">
            <div className="inline-flex items-center space-x-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-3">
              <ShieldCheck className="w-4 h-4" />
              <span>SIH 2026 Core Innovation</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-snug">
              &quot;AICTE currently receives claimed enrolment numbers. Satyapan converts them into confirmed,
              student-level records linked to APAAR ID.&quot;
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed mt-4">
              Colleges upload admission data via CSV or API. Our engine validates APAAR IDs, tracks approved
              intake through a Seat Ledger, and automatically flags duplicate enrolments, excess intake,
              category inconsistencies, and late admissions. Every student receives a dynamic Integrity Score
              with clear reasons and recommended actions.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-6 border-t border-slate-800/80">
              <div>
                <h4 className="text-xs font-bold text-slate-200">1. APAAR Integration</h4>
                <p className="text-[11px] text-slate-400 mt-1">
                  Integrates with APAAR, ABC, and DigiLocker rather than replacing them.
                </p>
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200">2. Real-Time Seat Ledger</h4>
                <p className="text-[11px] text-slate-400 mt-1">
                  Enforces sanctioned intake + supernumerary quota ceilings automatically.
                </p>
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200">3. DPDP Act Compliance</h4>
                <p className="text-[11px] text-slate-400 mt-1">
                  12-digit masking, consent gate, and selective field disclosure for privacy.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Integrity Rules Matrix */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl font-bold text-white">Autonomous Integrity Engine Rules</h2>
          <p className="text-slate-400 text-xs mt-1">
            Rules executed automatically upon admission submission or trigger by AICTE administrators.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-amber-400">INVALID_APAAR</span>
              <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 font-semibold border border-amber-500/30">
                HIGH (-30)
              </span>
            </div>
            <p className="font-semibold text-slate-200">Invalid or Missing APAAR ID</p>
            <p className="text-slate-400 text-[11px]">
              Verifies strict 12-digit regex (`^[0-9]&#123;12&#125;$`). Flags malformed or missing identifiers.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-amber-400">DUPLICATE_APAAR_IN_INSTITUTION</span>
              <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 font-semibold border border-amber-500/30">
                HIGH (-30)
              </span>
            </div>
            <p className="font-semibold text-slate-200">Duplicate APAAR within College</p>
            <p className="text-slate-400 text-[11px]">
              Detects identical APAAR assigned to multiple records within the same college roster.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-rose-400">CROSS_INSTITUTION_OVERLAP</span>
              <span className="px-2 py-0.5 rounded bg-rose-500/15 text-rose-400 font-semibold border border-rose-500/30">
                CRITICAL (-50)
              </span>
            </div>
            <p className="font-semibold text-slate-200">Multi-Institution Ghost Admission</p>
            <p className="text-slate-400 text-[11px]">
              Surfaces when a student is simultaneously enrolled across multiple active colleges.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-rose-400">EXCESS_ENROLMENT</span>
              <span className="px-2 py-0.5 rounded bg-rose-500/15 text-rose-400 font-semibold border border-rose-500/30">
                CRITICAL (-50)
              </span>
            </div>
            <p className="font-semibold text-slate-200">Sanctioned Intake Breach</p>
            <p className="text-slate-400 text-[11px]">
              Enrolment exceeds AICTE approved intake + supernumerary capacity. Triggers seat freeze.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-yellow-400">NATIONALITY_INCONSISTENCY</span>
              <span className="px-2 py-0.5 rounded bg-yellow-500/15 text-yellow-400 font-semibold border border-yellow-500/30">
                MEDIUM (-15)
              </span>
            </div>
            <p className="font-semibold text-slate-200">Category & Visa Discrepancy</p>
            <p className="text-slate-400 text-[11px]">
              Student marked as NRI, OCI, or Foreign National without valid category documentation.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-yellow-400">LATE_ADMISSION</span>
              <span className="px-2 py-0.5 rounded bg-yellow-500/15 text-yellow-400 font-semibold border border-yellow-500/30">
                MEDIUM (-15)
              </span>
            </div>
            <p className="font-semibold text-slate-200">Past AICTE Reporting Cutoff</p>
            <p className="text-slate-400 text-[11px]">
              Admission date logged after October 15 of admission year without AICTE waiver.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
