"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
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
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [fontSize, setFontSize] = useState<"small" | "normal" | "large">("normal");

  const applyFontSize = (size: "small" | "normal" | "large") => {
    setFontSize(size);
    try {
      localStorage.setItem("satyapan_font_size", size);
    } catch {
      // Ignore
    }
    if (typeof document !== "undefined") {
      if (size === "small") {
        document.documentElement.style.fontSize = "14px";
      } else if (size === "large") {
        document.documentElement.style.fontSize = "18px";
      } else {
        document.documentElement.style.fontSize = "16px";
      }
    }
  };

  useEffect(() => {
    try {
      const saved = localStorage.getItem("satyapan_font_size");
      if (saved === "small") {
        document.documentElement.style.fontSize = "14px";
      } else if (saved === "large") {
        document.documentElement.style.fontSize = "18px";
      }
    } catch {
      // Ignore
    }
  }, []);

  const isDemo = mode === "demo";
  const isAuthScreen = ["/login", "/forgot-password", "/account/password", "/access-pending"].some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  const navLinks = [
    { href: "/", label: "Home", hiLabel: "मुख्यपृष्ठ", roles: [] },
    { href: "/aicte", label: "National Overview", hiLabel: "राष्ट्रीय विवरण", roles: ["platform_admin", "institution_admin", "institution_staff", "reviewer"] },
    { href: "/institution", label: "College Seats", hiLabel: "कॉलेज सीटें", roles: ["platform_admin", "institution_admin", "institution_staff", "reviewer"] },
    { href: "/institution/upload", label: "Upload Students", hiLabel: "छात्र अपलोड", roles: ["institution_admin", "institution_staff"] },
    { href: "/verify", label: "Verify Degree", hiLabel: "प्रमाणपत्र सत्यापन", roles: [] },
    { href: "/aicte/reports", label: "Reports", hiLabel: "रिपोर्ट", roles: ["platform_admin", "institution_admin", "institution_staff", "reviewer"] },
    { href: "/audit", label: "Activity Log", hiLabel: "गतिविधि लॉग", roles: ["platform_admin", "reviewer"] },
    { href: "/institution/api", label: "Connect Software", hiLabel: "सॉफ्टवेयर लिंक", roles: ["platform_admin", "institution_admin"] },
    ...(viewer?.role === "platform_admin" ? [{ href: "/admin/users", label: "User Accounts", hiLabel: "खाते", roles: ["platform_admin"] }] : []),
  ].filter((link) => link.roles.length === 0 || (!!viewer && link.roles.includes(viewer.role)));

  const handleSignOut = async () => {
    setNotice("");
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) throw new Error("logout");
      router.replace("/login");
      router.refresh();
    } catch {
      setNotice(t("We couldn't end this session. Please try again."));
    }
  };

  return (
    <>
      {/* 1. Portal Top Decorative Stripe (Indian Portal Aesthetic) */}
      <div className="h-1 w-full bg-gradient-to-r from-[#FF9933] via-[#FFFFFF] to-[#138808]" aria-hidden="true" />

      {/* 2. Top Utility & Accessibility Bar (ECI & UIDAI Style) */}
      <div className="w-full bg-[#102A43] text-white text-[11px] border-b border-[#1E3A5F]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-1.5 flex flex-wrap items-center justify-between gap-2">
          {/* Left: Product & Team Badge */}
          <div className="flex items-center space-x-2 text-slate-200">
            <span className="font-bold text-[#F59E0B]">TEAM PRAMAANIT</span>
            <span className="text-slate-500" aria-hidden="true">|</span>
            <span className="text-slate-300">
              {locale === "hi"
                ? "अखिल भारतीय तकनीकी शिक्षा परिषद (AICTE) आधारित समाधान"
                : "AICTE Student Enrolment Integrity Solution"}
            </span>
          </div>

          {/* Right: Date, Text Resizer, Language Switcher */}
          <div className="flex items-center space-x-3 text-slate-300">
            <a href="#main-content" className="sr-only focus:not-sr-only focus:text-white focus:underline focus:px-2">
              {locale === "hi" ? "मुख्य सामग्री पर जाएँ" : "Skip to main content"}
            </a>
            <span className="hidden sm:inline font-mono text-[10px] text-slate-400">
              {new Date().toLocaleDateString(locale === "hi" ? "hi-IN" : "en-IN", {
                weekday: "short",
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
            <span className="hidden sm:inline text-slate-500" aria-hidden="true">|</span>
            <div className="hidden md:flex items-center space-x-1 text-[11px] font-mono" title="Change Text Size">
              <button
                type="button"
                onClick={() => applyFontSize("small")}
                aria-label="Small font size"
                className={`px-1.5 py-0.5 border text-xs cursor-pointer transition-colors ${
                  fontSize === "small"
                    ? "bg-[#F59E0B] border-[#F59E0B] text-[#102A43] font-bold"
                    : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
                }`}
              >
                A-
              </button>
              <button
                type="button"
                onClick={() => applyFontSize("normal")}
                aria-label="Normal font size"
                className={`px-1.5 py-0.5 border text-xs cursor-pointer transition-colors ${
                  fontSize === "normal"
                    ? "bg-[#F59E0B] border-[#F59E0B] text-[#102A43] font-bold"
                    : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
                }`}
              >
                A
              </button>
              <button
                type="button"
                onClick={() => applyFontSize("large")}
                aria-label="Large font size"
                className={`px-1.5 py-0.5 border text-xs cursor-pointer transition-colors ${
                  fontSize === "large"
                    ? "bg-[#F59E0B] border-[#F59E0B] text-[#102A43] font-bold"
                    : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
                }`}
              >
                A+
              </button>
            </div>
            <span className="text-slate-500" aria-hidden="true">|</span>
            <button
              type="button"
              onClick={() => setLocale(locale === "en" ? "hi" : "en")}
              aria-label={t("Language")}
              className="px-2 py-0.5 bg-[#17365D] hover:bg-[#204a7a] border border-slate-600 text-white font-semibold text-[11px] rounded-[2px]"
            >
              {locale === "en" ? "हिन्दी" : "English"}
            </button>
          </div>
        </div>
      </div>

      {/* 3. Main Header with Bilingual Title (Styled like voters.eci.gov.in & UIDAI) */}
      <header className="w-full bg-white border-b border-[#D8DEE6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
          {/* Left: Modern App Logo & Bilingual Title */}
          <div className="flex items-center space-x-3.5">
            {/* Custom Modern Geometric Logo for SATYAPAN */}
            <div className="flex-shrink-0 w-11 h-11 bg-gradient-to-br from-[#102A43] to-[#17365D] rounded-[4px] border-2 border-[#1E3A5F] flex flex-col items-center justify-center text-white shadow-xs" aria-hidden="true">
              <span className="font-extrabold text-xs tracking-tighter text-[#F59E0B]">SATYA</span>
              <span className="text-[8px] font-mono font-bold leading-none text-slate-200">PAN</span>
            </div>

            {/* Titles */}
            <div className="leading-tight">
              <Link href="/" className="group inline-block">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#102A43] group-hover:text-[#17365D]">
                  सत्यापन <span className="text-base sm:text-lg font-bold text-[#17365D]">| SATYAPAN</span>
                </h1>
                <div className="text-[11px] font-bold text-[#17365D]">
                  अखिल भारतीय तकनीकी शिक्षा परिषद (AICTE)
                </div>
                <div className="text-[10px] font-medium text-[#5B6573]">
                  All India Council for Technical Education
                </div>
              </Link>
            </div>
          </div>

          {/* Right: Active Stakeholder Role & Actions */}
          <div className="flex items-center flex-wrap gap-2.5">
            {!isAuthScreen && (
              <div className="flex items-center gap-2 bg-[#F8FAFC] border border-[#CBD5E1] px-3 py-1.5 text-xs rounded-[4px]">
                <div className="w-2 h-2 rounded-full bg-[#10B981]" aria-hidden="true" />
                <span className="font-bold text-[#102A43]">
                  {viewer?.role === "platform_admin" && (locale === "hi" ? "AICTE केंद्रीय प्रशासक" : "AICTE Central Admin")}
                  {viewer?.role === "institution_admin" && (locale === "hi" ? "संस्थान कुलसचिव" : "College Registrar")}
                  {viewer?.role === "institution_staff" && (locale === "hi" ? "संस्थान कर्मचारी" : "College Staff")}
                  {viewer?.role === "reviewer" && (locale === "hi" ? "ऑडिटर" : "Auditor")}
                  {!viewer && (locale === "hi" ? "सत्यापनकर्ता" : "Public Verifier")}
                </span>
                {isDemo && (
                  <Link href="/login" className="ml-1 text-[11px] font-bold text-[#C87524] hover:underline">
                    [{locale === "hi" ? "बदलें" : "Switch"}]
                  </Link>
                )}
              </div>
            )}

            {/* Login / Sign Out Button */}
            {mode === "live" && !viewer && !isAuthScreen && (
              <Link href="/login" className="border border-[#17365D] bg-[#17365D] text-white px-3 py-1.5 text-xs font-bold hover:bg-[#102A43] rounded-[2px]">
                {locale === "hi" ? "लॉगिन करें" : "Login"}
              </Link>
            )}
            {viewer && !isAuthScreen && (
              <button
                type="button"
                onClick={handleSignOut}
                className="border border-[#8B95A1] px-2.5 py-1.5 text-xs font-semibold text-[#17365D] hover:bg-[#F4F6F8] rounded-[2px]"
              >
                {locale === "hi" ? "साइन आउट" : "Sign out"}
              </button>
            )}

            {/* Mobile Hamburger */}
            {!isAuthScreen && (
              <button
                type="button"
                className="md:hidden border border-[#8B95A1] px-3 py-2 text-xs font-semibold text-[#17365D] rounded-[2px]"
                aria-expanded={mobileOpen}
                aria-controls="primary-navigation"
                onClick={() => setMobileOpen((open) => !open)}
              >
                {mobileOpen ? (locale === "hi" ? "बंद करें" : "Close") : (locale === "hi" ? "मेनू" : "Menu")}
              </button>
            )}
          </div>
        </div>

        {/* 4. Primary Navigation Bar (Navy Blue with Amber Active Stripe, inspired by Voters ECI) */}
        {!isAuthScreen && (
          <nav id="primary-navigation" aria-label="Primary navigation" className="bg-[#102A43] text-white shadow-inner">
            <div className={`max-w-7xl mx-auto px-4 sm:px-8 ${mobileOpen ? "flex flex-col py-2" : "hidden"} md:flex md:flex-row md:overflow-x-auto`}>
              {navLinks.map((link) => {
                const isActive = link.href === "/" ? pathname === "/" : pathname === link.href || pathname.startsWith(`${link.href}/`);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    aria-current={isActive ? "page" : undefined}
                    className={`px-4 py-2.5 text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors border-b-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-white ${
                      isActive
                        ? "text-white border-[#F59E0B] bg-[#17365D] shadow-inner font-bold"
                        : "text-slate-200 border-transparent hover:text-white hover:bg-[#17365D]/60"
                    }`}
                  >
                    {locale === "hi" ? link.hiLabel : link.label}
                  </Link>
                );
              })}
            </div>
          </nav>
        )}
      </header>

      {notice && (
        <div role="status" aria-live="polite" className="fixed bottom-4 right-4 z-50 max-w-md bg-white border-l-4 border-[#237A52] p-3 shadow-lg text-xs text-[#202B36] rounded-[2px]">
          {notice}
        </div>
      )}
    </>
  );
}
