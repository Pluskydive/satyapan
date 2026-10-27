"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import type { AppRole } from "@/lib/authz";
import type { RuntimeMode } from "@/lib/runtime-mode";

interface Props {
  mode: RuntimeMode;
  viewer: { email: string; role: AppRole } | null;
}

export default function Navbar({ mode, viewer }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const { locale, setLocale, t } = useLanguage();
  const [isRunning, setIsRunning] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notice, setNotice] = useState("");

  const isDemo = mode === "demo";
  const isLive = mode === "live";
  const isAuthScreen = ["/login", "/forgot-password", "/account/password", "/access-pending"].some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  const navLinks = [
    { href: "/aicte", label: "Control Tower", roles: ["platform_admin", "institution_admin", "institution_staff", "reviewer"] },
    { href: "/aicte/reports", label: "NIRF/NAAC Reports", roles: ["platform_admin", "institution_admin", "institution_staff", "reviewer"] },
    { href: "/institution", label: "Seat Ledgers", roles: ["platform_admin", "institution_admin", "institution_staff", "reviewer"] },
    { href: "/institution/upload", label: "CSV Ingestion", roles: ["institution_admin", "institution_staff"] },
    { href: "/institution/api", label: "System connections", roles: ["platform_admin", "institution_admin"] },
    { href: "/verify", label: "Employer Verification", roles: [] },
    { href: "/audit", label: "Audit Ledger", roles: ["platform_admin", "reviewer"] },
    ...(viewer?.role === "platform_admin" ? [{ href: "/admin/users", label: "User accounts", roles: ["platform_admin"] }] : []),
  ].filter((link) => link.roles.length === 0 || (!!viewer && link.roles.includes(viewer.role)));

  const handleRunIntegrity = async () => {
    setIsRunning(true);
    setNotice("");
    try {
      const response = await fetch("/api/integrity/run", { method: "POST" });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error("not-complete");
      setNotice("Sample records were checked. Changes exist only in temporary demo memory.");
      window.dispatchEvent(new CustomEvent("satyapan:refresh"));
    } catch {
      setNotice("We couldn't complete the sample check. Please try again.");
    } finally {
      setIsRunning(false);
      window.setTimeout(() => setNotice(""), 6000);
    }
  };

  const handleSignOut = async () => {
    setNotice("");
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) throw new Error("logout");
      router.replace("/login");
      router.refresh();
    } catch {
      setNotice("We couldn't end this session. Please try again.");
    }
  };

  return (
    <>
      <header className="w-full bg-white border-b border-[#D8DEE6]">
        <div className="bg-[#102A43] text-white text-[11px] px-4 sm:px-8 py-1.5 border-b border-[#17365D] flex flex-wrap items-center justify-between gap-1">
          <div className="flex items-center space-x-3">
            <span className="font-semibold text-slate-200">{t("SATYAPAN · SIH 2026 PROTOTYPE")}</span>
            <span className="text-slate-500" aria-hidden="true">|</span>
            <span className="text-slate-300">
              {isDemo
                ? t("Synthetic demonstration data only")
                : isLive
                  ? t("Authenticated access · institution-scoped records")
                  : t("Administrative access unavailable in this environment")}
            </span>
          </div>
          <div className="flex items-center space-x-3 text-slate-300">
            <span>{t("Not an official AICTE service")}</span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-[10px] tracking-wider uppercase font-semibold text-[#5B6573]">{t("SIH 2026 · Demonstration project")}</div>
            <Link href="/" className="inline-block">
              <span className="text-xl sm:text-2xl font-bold tracking-tight text-[#17365D]">SATYAPAN</span>
              <span className="hidden sm:inline text-sm font-medium text-[#5B6573] ml-2">{t("Enrolment integrity workflow prototype")}</span>
            </Link>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            {isDemo && !isAuthScreen && (
              <div className="flex items-center gap-1.5 bg-[#F4F6F8] border border-[#D8DEE6] px-2.5 py-1 text-xs">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#5B6573]">{t("Role")}:</span>
                <span className="font-bold text-[#17365D]">
                  {viewer?.role === "platform_admin" && t("AICTE Administrator")}
                  {viewer?.role === "institution_admin" && t("Institutional Registrar")}
                  {viewer?.role === "institution_staff" && t("Institutional Staff")}
                  {viewer?.role === "reviewer" && t("Accreditation Auditor")}
                  {!viewer && t("Employer Verifier")}
                </span>
                <Link href="/login" className="ml-1 text-[11px] font-semibold text-[#C87524] hover:underline">
                  ({t("Switch")})
                </Link>
              </div>
            )}
            {isDemo && !isAuthScreen && (
              <button onClick={handleRunIntegrity} disabled={isRunning} className="px-3 py-1.5 text-xs font-semibold bg-[#C87524] hover:bg-[#a65f1a] text-white disabled:opacity-50">
                {isRunning ? t("Checking sample records…") : t("Run sample checks")}
              </button>
            )}
            {viewer && !isAuthScreen && mode === "live" && <span className="hidden lg:inline text-xs text-[#5B6573]">{viewer.email}</span>}
            <button
              type="button"
              onClick={() => setLocale(locale === "en" ? "hi" : "en")}
              aria-label={t("Language")}
              aria-pressed={locale === "hi"}
              className="border border-[#8B95A1] px-2.5 py-1.5 text-xs font-semibold text-[#17365D] hover:bg-[#F4F6F8]"
            >
              {locale === "en" ? "हिन्दी" : "English"}
            </button>
            {mode === "live" && !viewer && !isAuthScreen && (
              <Link href="/login" className="border border-[#17365D] px-3 py-1.5 text-xs font-semibold text-[#17365D] hover:bg-[#F4F6F8]">
                {t("Log in")}
              </Link>
            )}
            {((mode === "live" && viewer) || (mode === "demo" && viewer)) && !isAuthScreen && (
              <button type="button" onClick={handleSignOut} className="border border-[#8B95A1] px-2.5 py-1.5 text-xs font-semibold text-[#17365D] hover:bg-[#F4F6F8]">
                {t("Sign out")}
              </button>
            )}
            {!isAuthScreen && (
              <button
                type="button"
                className="md:hidden border border-[#8B95A1] px-3 py-2 text-xs font-semibold text-[#17365D]"
                aria-expanded={mobileOpen}
                aria-controls="primary-navigation"
                onClick={() => setMobileOpen((open) => !open)}
              >
                {mobileOpen ? t("Close menu") : t("Menu")}
              </button>
            )}
          </div>
        </div>

        {!isAuthScreen && <nav id="primary-navigation" aria-label="Primary navigation" className="bg-[#17365D] text-white">
          <div className={`max-w-7xl mx-auto px-4 sm:px-8 ${mobileOpen ? "flex flex-col" : "hidden"} md:flex md:flex-row md:overflow-x-auto`}>
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== "/aicte" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  aria-current={isActive ? "page" : undefined}
                  className={`px-4 py-3 md:py-2.5 text-xs sm:text-sm font-medium whitespace-nowrap border-b-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-white ${
                    isActive ? "text-white border-[#C87524] bg-[#102A43]/50 font-semibold" : "text-slate-200 border-transparent hover:text-white hover:bg-[#102A43]/30"
                  }`}
                >
                  {t(link.label)}
                </Link>
              );
            })}
          </div>
        </nav>}
      </header>

      {notice && <div role="status" aria-live="polite" className="fixed bottom-4 right-4 z-50 max-w-md bg-white border-l-4 border-[#237A52] p-3 shadow-md text-xs text-[#202B36]">{notice}</div>}
    </>
  );
}
