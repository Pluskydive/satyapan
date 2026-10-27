"use client";

import Link from "next/link";
import type { RuntimeMode } from "@/lib/runtime-mode";
import { useLanguage } from "@/components/LanguageProvider";

export default function Footer({ mode }: { mode: RuntimeMode }) {
  const { t } = useLanguage();
  const isDemo = mode === "demo";

  return (
    <footer className="w-full bg-[#102A43] text-slate-300 text-xs border-t border-[#17365D] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-6 border-b border-slate-700/60">
          <div className="md:col-span-2 space-y-2">
            <div className="font-semibold text-white tracking-wide uppercase text-[11px]">{t("Satyapan · SIH 2026 prototype")}</div>
            <p className="text-slate-300 leading-relaxed text-[11px] max-w-lg">
              {isDemo
                ? t("A demonstration of enrolment review and consent-based verification workflows. All displayed records are synthetic. This is not an official AICTE or government service and must not be used to submit real student information.")
                : t("An institutional enrolment review prototype using authenticated accounts. This is not an official AICTE or government service; use only under your organization’s approved data governance process.")}
            </p>
            <div className="text-[10px] text-slate-400 pt-1">{isDemo ? t("Demonstration environment · Data is held in temporary application memory only") : t("Live mode · Access is controlled by assigned account permissions")}</div>
          </div>

          <div>
            <div className="font-semibold text-white tracking-wide uppercase text-[11px] mb-2">{t("Project areas")}</div>
            <ul className="space-y-1.5 text-[11px] text-slate-300">
              <li><Link href="/aicte" className="hover:text-white hover:underline">{t("National overview")}</Link></li>
              <li><Link href="/institution" className="hover:text-white hover:underline">{t("Institution records")}</Link></li>
              <li><Link href="/institution/upload" className="hover:text-white hover:underline">{t("Sample CSV upload")}</Link></li>
              {isDemo && <li><Link href="/verify" className="hover:text-white hover:underline">{t("Verification demonstration")}</Link></li>}
              <li><Link href="/audit" className="hover:text-white hover:underline">{t("Activity history")}</Link></li>
            </ul>
          </div>

          <div>
            <div className="font-semibold text-white tracking-wide uppercase text-[11px] mb-2">{t("Prototype notes")}</div>
            <ul className="space-y-1.5 text-[11px] text-slate-400">
              {isDemo ? <>
                <li>{t("Uses synthetic records for demonstration")}</li>
                <li>{t("No live institution integrations are enabled")}</li>
                <li>{t("No real consent is collected or stored")}</li>
                <li>{t("Authentication and production data access are not implemented")}</li>
              </> : <>
                <li>{t("Users are provisioned by a platform administrator")}</li>
                <li>{t("Database access is limited by account role and institution")}</li>
                <li>{t("Credential verification is disabled in live mode")}</li>
              </>}
            </ul>
          </div>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-400 gap-2">
          <div>{t("Student Innovation · Smart India Hackathon 2026 prototype")}</div>
          <div>{isDemo ? t("Demo mode · Sample data is not durable") : t("Live mode · Keep account credentials private")}</div>
        </div>
      </div>
    </footer>
  );
}
