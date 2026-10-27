"use client";

import Link from "next/link";
import { useLanguage } from "@/components/LanguageProvider";

export default function Footer() {
  const { locale } = useLanguage();

  return (
    <footer className="w-full bg-[#102A43] text-slate-300 text-xs border-t border-[#1E3A5F] mt-auto">
      {/* Top Accent Strip */}
      <div className="h-1 w-full bg-gradient-to-r from-[#FF9933] via-[#FFFFFF] to-[#138808]" aria-hidden="true" />

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-slate-700/60">
          {/* Column 1: Product & Team PRAMAANIT */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <span className="font-black text-white text-base tracking-tight">SATYAPAN</span>
              <span className="text-[10px] px-1.5 py-0.5 bg-[#FEF3C7] text-[#92400E] font-bold border border-[#F59E0B] rounded-[2px] uppercase">
                Team PRAMAANIT
              </span>
            </div>
            <div className="text-[11px] text-slate-300 leading-snug">
              <strong className="text-white block">राष्ट्रीय छात्र नामांकन सत्यनिष्ठा एवं अपार रजिस्ट्री</strong>
              <span>National Student Enrolment Integrity &amp; APAAR Registry Platform</span>
              <span className="block text-slate-400 mt-1">Enrolment Verification &amp; Institutional Reconciliation</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
              {locale === "hi"
                ? "तकनीकी शिक्षा में छात्र नामांकन की सत्यनिष्ठा सुनिश्चित करने एवं अपार (APAAR) पहचानकर्ताओं के माध्यम से सीट मुद्रास्फीति रोकने हेतु केंद्रीकृत समाधान।"
                : "Centralized framework for technical student admission integrity, sanctioned intake reconciliation, and consent-gated APAAR verification."}
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <div className="font-bold text-white uppercase text-[11px] tracking-wider mb-3 text-[#FBBF24]">
              {locale === "hi" ? "त्वरित लिंक" : "Quick Links"}
            </div>
            <ul className="space-y-2 text-[11px] text-slate-300">
              <li>
                <Link href="/aicte" className="hover:text-white hover:underline flex items-center gap-1.5">
                  <span className="text-slate-500">&rsaquo;</span> {locale === "hi" ? "राष्ट्रीय विवरण" : "National Overview"}
                </Link>
              </li>
              <li>
                <Link href="/institution" className="hover:text-white hover:underline flex items-center gap-1.5">
                  <span className="text-slate-500">&rsaquo;</span> {locale === "hi" ? "कॉलेज सीटें" : "College Seats"}
                </Link>
              </li>
              <li>
                <Link href="/institution/upload" className="hover:text-white hover:underline flex items-center gap-1.5">
                  <span className="text-slate-500">&rsaquo;</span> {locale === "hi" ? "छात्र अपलोड" : "Upload Students"}
                </Link>
              </li>
              <li>
                <Link href="/verify" className="hover:text-white hover:underline flex items-center gap-1.5">
                  <span className="text-slate-500">&rsaquo;</span> {locale === "hi" ? "प्रमाणपत्र सत्यापन" : "Verify Degree"}
                </Link>
              </li>
              <li>
                <Link href="/aicte/reports" className="hover:text-white hover:underline flex items-center gap-1.5">
                  <span className="text-slate-500">&rsaquo;</span> {locale === "hi" ? "रिपोर्ट" : "Reports"}
                </Link>
              </li>
              <li>
                <Link href="/audit" className="hover:text-white hover:underline flex items-center gap-1.5">
                  <span className="text-slate-500">&rsaquo;</span> {locale === "hi" ? "गतिविधि लॉग" : "Activity Log"}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Framework & Portals */}
          <div>
            <div className="font-bold text-white uppercase text-[11px] tracking-wider mb-3 text-[#FBBF24]">
              {locale === "hi" ? "राष्ट्रीय पहल" : "National Initiatives"}
            </div>
            <ul className="space-y-2 text-[11px] text-slate-300">
              <li>
                <span className="text-slate-500">&rsaquo;</span> All India Council for Technical Education (AICTE)
              </li>
              <li>
                <span className="text-slate-500">&rsaquo;</span> APAAR / ABC National Student Registry
              </li>
              <li>
                <span className="text-slate-500">&rsaquo;</span> Ministry of Education, Govt. of India
              </li>
              <li>
                <span className="text-slate-500">&rsaquo;</span> National Institutional Ranking Framework (NIRF)
              </li>
              <li>
                <span className="text-slate-500">&rsaquo;</span> National Board of Accreditation (NBA)
              </li>
            </ul>
          </div>

          {/* Column 4: Policies & Help */}
          <div>
            <div className="font-bold text-white uppercase text-[11px] tracking-wider mb-3 text-[#FBBF24]">
              {locale === "hi" ? "नीतियाँ एवं सहायता" : "Policies & Help"}
            </div>
            <ul className="space-y-2 text-[11px] text-slate-400">
              <li className="flex items-center gap-1.5 hover:text-white cursor-pointer">
                <span className="text-slate-500">&rsaquo;</span> Website Policies &amp; Terms
              </li>
              <li className="flex items-center gap-1.5 hover:text-white cursor-pointer">
                <span className="text-slate-500">&rsaquo;</span> Privacy &amp; Data Protection
              </li>
              <li className="flex items-center gap-1.5 hover:text-white cursor-pointer">
                <span className="text-slate-500">&rsaquo;</span> Helpdesk &amp; Technical Support
              </li>
              <li className="flex items-center gap-1.5 hover:text-white cursor-pointer">
                <span className="text-slate-500">&rsaquo;</span> Frequently Asked Questions (FAQ)
              </li>
              <li className="flex items-center gap-1.5 hover:text-white cursor-pointer">
                <span className="text-slate-500">&rsaquo;</span> System Documentation
              </li>
            </ul>
            <div className="mt-4 pt-3 border-t border-slate-700/60 text-[10px] text-slate-400">
              Designed & Developed by <strong className="text-slate-200">Team PRAMAANIT</strong>.
            </div>
          </div>
        </div>

        {/* Bottom Legal & Attribution */}
        <div className="pt-6 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-400">
          <div>
            &copy; 2026 SATYAPAN. All rights reserved.
          </div>
          <div className="flex items-center space-x-4 text-[10px]">
            <span>Developed by <strong className="text-slate-200">Team PRAMAANIT</strong></span>
            <span className="text-slate-600">|</span>
            <span>Version 2026.1</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
