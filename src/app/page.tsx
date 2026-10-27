import Link from "next/link";
import { getRuntimeMode } from "@/lib/runtime-mode";
import { getServerLocale, serverTranslate } from "@/lib/i18n-server";

export default async function HomePage() {
  const [locale, mode] = await Promise.all([getServerLocale(), getRuntimeMode()]);
  const t = (text: string) => serverTranslate(locale, text);

  const environmentNote =
    mode === "demo"
      ? "Demonstration mode uses synthetic records only. No live institution integrations or real consent collection are enabled."
      : mode === "live"
        ? "Live mode requires an assigned account for administrative areas. Public credential verification is disabled."
        : "Administrative workflows require a configured demonstration or authenticated live environment.";

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-8 sm:py-12">
      {/* Hero Banner: Institutional Header */}
      <section className="border border-[#D8DEE6] bg-white p-6 sm:p-10 rounded-[2px] shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#D8DEE6] pb-3 mb-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#5B6573]">
            {t("SMART INDIA HACKATHON 2026 · AICTE PROBLEM STATEMENT SOLVED")}
          </p>
          <span className="font-mono text-[11px] px-2.5 py-0.5 bg-[#F4F6F8] border border-[#D8DEE6] text-[#17365D] font-semibold">
            {mode === "demo" ? "DEMO MODE · SYNTHETIC REGISTRY" : "LIVE MODE · SUPABASE RLS"}
          </span>
        </div>

        <div className="max-w-4xl">
          <h1 className="text-3xl font-extrabold tracking-tight text-[#17365D] sm:text-4xl">
            SATYAPAN <span className="font-normal text-[#5B6573]">(सत्यापन)</span>
          </h1>
          <p className="mt-1 text-base sm:text-lg font-semibold text-[#C87524]">
            {t("National Student Enrolment Integrity & APAAR Registry Platform")}
          </p>
          <p className="mt-4 text-sm sm:text-base leading-relaxed text-[#384656]">
            {t("A centralized verification framework enabling AICTE-approved institutions to submit authenticated student-level admissions linked with APAAR (Automated Permanent Academic Account Registry) identifiers, preventing seat inflation and duplicate enrolments across states.")}
          </p>
          <div className="mt-5 border-l-4 border-[#C87524] bg-[#F4F6F8] p-3 text-xs sm:text-sm text-[#5B6573]">
            <strong>{t("SIH 2026 · Prototype")}:</strong> {t("This is a demonstration project, not an official AICTE or government service.")}
          </div>
        </div>
      </section>

      {/* Stakeholder Entry Portals Grid */}
      <section aria-labelledby="entry-points">
        <div className="mb-5">
          <h2 id="entry-points" className="text-xl font-bold text-[#17365D]">
            {t("Choose an entry point")}
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-[#5B6573]">
            {t("Administrative access follows the account roles and route permissions configured for the application.")}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Portal 1: Institutional Registrars */}
          <article className="flex min-h-full flex-col border border-[#D8DEE6] bg-white p-6 rounded-[2px] border-t-4 border-t-[#17365D] hover:border-[#17365D] transition-colors">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#5B6573]">
              {t("Institutional administrators")}
            </span>
            <h3 className="mt-2 text-lg font-bold text-[#17365D]">
              {t("Institution records")}
            </h3>
            <p className="text-xs font-semibold text-[#C87524] mt-0.5">
              {t("Approved Intake Compliance & Student Roster")}
            </p>
            <p className="mt-3 flex-1 text-xs leading-relaxed text-[#5B6573]">
              {t("Review institution-scoped enrolment records, intake references, and submitted data.")}
            </p>

            <div className="mt-6 space-y-3 pt-4 border-t border-[#D8DEE6]">
              <Link
                href="/institution"
                className="w-full inline-flex min-h-10 items-center justify-center border border-[#17365D] bg-[#17365D] px-4 py-2 text-xs font-bold text-white hover:bg-[#102A43] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#17365D] rounded-[2px] transition-colors"
              >
                {t("Open institution workspace")} &rarr;
              </Link>
              <div className="flex flex-col gap-1.5 text-xs">
                <Link href="/institution/upload" className="font-semibold text-[#17365D] hover:underline flex items-center justify-between">
                  <span>&bull; {t("CSV Ingestion")}</span>
                  <span className="text-[10px] text-[#5B6573]">CWE-1236 Defense</span>
                </Link>
                <Link href="/institution/api" className="font-semibold text-[#17365D] hover:underline flex items-center justify-between">
                  <span>&bull; {t("ERP System Connection")}</span>
                  <span className="text-[10px] text-[#5B6573]">API Sync</span>
                </Link>
              </div>
            </div>
          </article>

          {/* Portal 2: AICTE Regulatory Officials */}
          <article className="flex min-h-full flex-col border border-[#D8DEE6] bg-white p-6 rounded-[2px] border-t-4 border-t-[#C87524] hover:border-[#17365D] transition-colors">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#5B6573]">
              {t("AICTE officials")}
            </span>
            <h3 className="mt-2 text-lg font-bold text-[#17365D]">
              {t("Enrolment review dashboard")}
            </h3>
            <p className="text-xs font-semibold text-[#C87524] mt-0.5">
              {t("National Oversight & Integrity Monitoring")}
            </p>
            <p className="mt-3 flex-1 text-xs leading-relaxed text-[#5B6573]">
              {t("Review national and state summaries alongside the application’s enrolment discrepancy queue.")}
            </p>

            <div className="mt-6 space-y-3 pt-4 border-t border-[#D8DEE6]">
              <Link
                href="/aicte"
                className="w-full inline-flex min-h-10 items-center justify-center border border-[#C87524] bg-[#C87524] px-4 py-2 text-xs font-bold text-white hover:bg-[#a65f1a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C87524] rounded-[2px] transition-colors"
              >
                {t("Open AICTE dashboard")} &rarr;
              </Link>
              <div className="flex flex-col gap-1.5 text-xs">
                <Link href="/aicte/reports" className="font-semibold text-[#17365D] hover:underline flex items-center justify-between">
                  <span>&bull; {t("NIRF/NAAC Reports")}</span>
                  <span className="text-[10px] text-[#5B6573]">CSV & Print</span>
                </Link>
                <Link href="/audit" className="font-semibold text-[#17365D] hover:underline flex items-center justify-between">
                  <span>&bull; {t("Audit Trail Ledger")}</span>
                  <span className="text-[10px] text-[#5B6573]">System Log</span>
                </Link>
              </div>
            </div>
          </article>

          {/* Portal 3: Employers & Background Verifiers */}
          <article className="flex min-h-full flex-col border border-[#D8DEE6] bg-white p-6 rounded-[2px] border-t-4 border-t-[#237A52] hover:border-[#17365D] transition-colors">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#5B6573]">
              {t("Public and employer verification")}
            </span>
            <h3 className="mt-2 text-lg font-bold text-[#17365D]">
              {t("Verification workflow")}
            </h3>
            <p className="text-xs font-semibold text-[#237A52] mt-0.5">
              {t("DPDP Act 2023 Consent-Gated Verification")}
            </p>
            <p className="mt-3 flex-1 text-xs leading-relaxed text-[#5B6573]">
              {t("Explore the consent-based verification workflow. Demo interactions use synthetic data; live credential verification is disabled.")}
            </p>

            <div className="mt-6 space-y-3 pt-4 border-t border-[#D8DEE6]">
              <Link
                href="/verify"
                className="w-full inline-flex min-h-10 items-center justify-center border border-[#237A52] bg-[#237A52] px-4 py-2 text-xs font-bold text-white hover:bg-[#1b5e3f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#237A52] rounded-[2px] transition-colors"
              >
                {t("Open verification")} &rarr;
              </Link>
              <div className="flex flex-col gap-1.5 text-xs">
                <Link href="/verify/certificate/stu-1" className="font-semibold text-[#17365D] hover:underline flex items-center justify-between">
                  <span>&bull; {t("Printable Sample Credential")}</span>
                  <span className="text-[10px] text-[#5B6573]">Signed QR</span>
                </Link>
                <Link href="/login" className="font-semibold text-[#17365D] hover:underline flex items-center justify-between">
                  <span>&bull; {t("Simulated Role Switcher")}</span>
                  <span className="text-[10px] text-[#5B6573]">Evaluators</span>
                </Link>
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* Technical Architecture & Scope Section */}
      <section className="border border-[#D8DEE6] bg-white rounded-[2px] overflow-hidden">
        <div className="border-b border-[#D8DEE6] bg-[#F4F6F8] px-5 py-3.5 flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#17365D]">
            {t("Prototype scope")}
          </h2>
          <span className="font-mono text-xs text-[#5B6573]">SIH 2026 Core Pillars</span>
        </div>
        <div className="grid grid-cols-1 divide-y divide-[#D8DEE6] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <div className="p-5">
            <div className="text-[10px] font-mono uppercase font-bold text-[#17365D] mb-1">Pillar 1</div>
            <h3 className="text-sm font-bold text-[#202B36]">{t("Enrolment integrity")}</h3>
            <p className="mt-2 text-xs leading-relaxed text-[#5B6573]">
              {t("Apply configured checks to identify enrolment records that may need review.")} Automated detection of duplicate APAAR admissions and intake breaches.
            </p>
          </div>
          <div className="p-5">
            <div className="text-[10px] font-mono uppercase font-bold text-[#17365D] mb-1">Pillar 2</div>
            <h3 className="text-sm font-bold text-[#202B36]">{t("Institutional data reconciliation")}</h3>
            <p className="mt-2 text-xs leading-relaxed text-[#5B6573]">
              {t("Review institution-submitted records against the data and intake references held in the application.")} Row-Level Security ensures strict institutional privacy.
            </p>
          </div>
          <div className="p-5">
            <div className="text-[10px] font-mono uppercase font-bold text-[#17365D] mb-1">Pillar 3</div>
            <h3 className="text-sm font-bold text-[#202B36]">{t("Consent-based APAAR verification")}</h3>
            <p className="mt-2 text-xs leading-relaxed text-[#5B6573]">
              {t("The demo flow is simulated. Live credential verification is not enabled.")} DPDP Act 2023 compliant tokenized verification with offline verifiable QR payloads.
            </p>
          </div>
        </div>
        <p className="border-t border-[#D8DEE6] px-5 py-3.5 text-xs leading-relaxed text-[#5B6573] bg-[#F4F6F8]">
          <strong>Notice:</strong> {t(environmentNote)}
        </p>
      </section>
    </div>
  );
}
