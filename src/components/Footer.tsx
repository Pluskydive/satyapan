"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/components/LanguageProvider";

type ModalType = "terms" | "privacy" | "helpdesk" | "faq" | "docs" | null;

export default function Footer() {
  const { locale } = useLanguage();
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveModal(null);
      }
    };
    if (activeModal) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [activeModal]);

  return (
    <>
      <footer className="w-full bg-[#102A43] text-slate-300 text-xs border-t border-[#1E3A5F] mt-auto">
        {/* Top Accent Strip */}
        <div className="h-1 w-full bg-gradient-to-r from-[#FF9933] via-[#FFFFFF] to-[#138808]" aria-hidden="true" />

        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-slate-700/60">
            {/* Column 1: Product & Team PRAMAANIT */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <img
                  src="/pramaanit-logo.jpg"
                  alt="Team PRAMAANIT"
                  className="h-9 w-auto bg-white p-0.5 rounded-[3px] border border-slate-600 shadow-xs"
                />
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

            {/* Column 4: Policies & Help (Interactive Dialog Triggers) */}
            <div>
              <div className="font-bold text-white uppercase text-[11px] tracking-wider mb-3 text-[#FBBF24]">
                {locale === "hi" ? "नीतियाँ एवं सहायता" : "Policies & Help"}
              </div>
              <ul className="space-y-2 text-[11px] text-slate-300">
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveModal("terms")}
                    className="flex items-center gap-1.5 hover:text-white hover:underline text-left cursor-pointer transition-colors"
                  >
                    <span className="text-slate-500">&rsaquo;</span>
                    <span>{locale === "hi" ? "वेबसाइट नीतियां एवं शर्तें" : "Website Policies & Terms"}</span>
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveModal("privacy")}
                    className="flex items-center gap-1.5 hover:text-white hover:underline text-left cursor-pointer transition-colors"
                  >
                    <span className="text-slate-500">&rsaquo;</span>
                    <span>{locale === "hi" ? "गोपनीयता एवं डेटा सुरक्षा" : "Privacy & Data Protection"}</span>
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveModal("helpdesk")}
                    className="flex items-center gap-1.5 hover:text-white hover:underline text-left cursor-pointer transition-colors"
                  >
                    <span className="text-slate-500">&rsaquo;</span>
                    <span>{locale === "hi" ? "सहायता केंद्र एवं तकनीकी सहायता" : "Helpdesk & Technical Support"}</span>
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveModal("faq")}
                    className="flex items-center gap-1.5 hover:text-white hover:underline text-left cursor-pointer transition-colors"
                  >
                    <span className="text-slate-500">&rsaquo;</span>
                    <span>{locale === "hi" ? "सामान्य प्रश्न (FAQ)" : "Frequently Asked Questions (FAQ)"}</span>
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveModal("docs")}
                    className="flex items-center gap-1.5 hover:text-white hover:underline text-left cursor-pointer transition-colors"
                  >
                    <span className="text-slate-500">&rsaquo;</span>
                    <span>{locale === "hi" ? "प्रणाली प्रलेखन" : "System Documentation"}</span>
                  </button>
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

      {/* Accessible Policy & Support Modals */}
      {activeModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="footer-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto"
          onClick={() => setActiveModal(null)}
        >
          <div
            className="relative w-full max-w-2xl bg-white border border-[#CBD5E1] border-t-4 border-t-[#17365D] rounded-[4px] shadow-2xl p-6 sm:p-8 space-y-5 my-8 max-h-[85vh] overflow-y-auto text-[#202B36]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-[#E2E8F0] pb-4">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#C87524]">
                  SATYAPAN · Team PRAMAANIT
                </span>
                <h3 id="footer-modal-title" className="text-lg sm:text-xl font-bold text-[#102A43] mt-1">
                  {activeModal === "terms" && (locale === "hi" ? "वेबसाइट नीतियां एवं उपयोग शर्तें" : "Website Policies & Terms of Use")}
                  {activeModal === "privacy" && (locale === "hi" ? "गोपनीयता एवं डेटा सुरक्षा नीति (DPDP 2023)" : "Privacy & Data Protection Policy (DPDP 2023)")}
                  {activeModal === "helpdesk" && (locale === "hi" ? "सहायता केंद्र एवं राष्ट्रीय हेल्पलाइन" : "Helpdesk & National Support Directory")}
                  {activeModal === "faq" && (locale === "hi" ? "सामान्य प्रश्न (Frequently Asked Questions)" : "Frequently Asked Questions (FAQ)")}
                  {activeModal === "docs" && (locale === "hi" ? "प्रणाली प्रलेखन एवं तकनीकी विनिर्देश" : "System Documentation & Technical Specs")}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                aria-label="Close dialog"
                className="p-1.5 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-[2px] cursor-pointer transition-colors text-xs font-bold font-mono"
              >
                X
              </button>
            </div>

            {/* Modal Content Panels */}
            {activeModal === "terms" && (
              <div className="space-y-4 text-xs leading-relaxed text-[#334155]">
                <section>
                  <h4 className="font-bold text-[#102A43] text-sm mb-1">1. Authorized Institutional Access</h4>
                  <p>
                    SATYAPAN is designed exclusively for authorized registrars, college administration staff, and regulatory authorities to manage and reconcile sanctioned student admission quotas. Unauthorized access, automated credential attacks, or bulk scraping are strictly prohibited.
                  </p>
                </section>
                <section>
                  <h4 className="font-bold text-[#102A43] text-sm mb-1">2. Data Governance & Integrity Standards</h4>
                  <p>
                    Admissions reported through the portal must correspond to genuine student enrolments compliant with AICTE Approval Process Handbook (APH) norms. Reporting fraudulent APAAR identifiers or intentional seat inflation is subject to statutory regulatory review.
                  </p>
                </section>
                <section>
                  <h4 className="font-bold text-[#102A43] text-sm mb-1">3. System Availability & Service Levels</h4>
                  <p>
                    The platform maintains a target availability of 99.9% uptime. Routine maintenance windows are communicated in advance. Team PRAMAANIT ensures continuous monitoring for audit logging and cryptographic certificate integrity.
                  </p>
                </section>
                <section>
                  <h4 className="font-bold text-[#102A43] text-sm mb-1">4. Intellectual Property & Attribution</h4>
                  <p>
                    © 2026 SATYAPAN. Developed by Team PRAMAANIT. All design systems, reconciliation algorithms, and cryptographic verification modules remain protected under applicable open governance frameworks.
                  </p>
                </section>
              </div>
            )}

            {activeModal === "privacy" && (
              <div className="space-y-4 text-xs leading-relaxed text-[#334155]">
                <section>
                  <h4 className="font-bold text-[#102A43] text-sm mb-1">1. Digital Personal Data Protection (DPDP) Act 2023 Alignment</h4>
                  <p>
                    SATYAPAN processes student admission data strictly for specified lawful educational verification purposes. Student data is processed solely to prevent duplicate admissions and verify approved seat capacities.
                  </p>
                </section>
                <section>
                  <h4 className="font-bold text-[#102A43] text-sm mb-1">2. Raw APAAR Masking & Tokenization</h4>
                  <p>
                    In accordance with national data privacy mandates, raw 12-digit APAAR identifiers are never displayed in full on public surfaces. They are systematically masked as <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">XXXXXXXX1234</code>. Public queries use single-use cryptographic tokens.
                  </p>
                </section>
                <section>
                  <h4 className="font-bold text-[#102A43] text-sm mb-1">3. Candidate Consent-Gated Disclosure</h4>
                  <p>
                    External verifiers (such as corporate employers or background screening agencies) cannot access student academic details without explicit, timestamped candidate authorization.
                  </p>
                </section>
                <section>
                  <h4 className="font-bold text-[#102A43] text-sm mb-1">4. Tamper-Evident Audit Trails</h4>
                  <p>
                    Every database modification, admission batch upload, and status change is immutably logged with actor role, IP address, and cryptographic timestamp for institutional accountability.
                  </p>
                </section>
              </div>
            )}

            {activeModal === "helpdesk" && (
              <div className="space-y-4 text-xs leading-relaxed text-[#334155]">
                <section className="bg-[#F8FAFC] border border-[#CBD5E1] p-3.5 rounded-[4px] space-y-2">
                  <div className="font-bold text-[#102A43] text-sm">National Central Support Desk</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Toll-Free Helpline</span>
                      <span className="font-mono text-sm font-bold text-[#17365D]">1800-11-2026</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Support Email</span>
                      <span className="font-mono text-sm font-bold text-[#17365D]">support@satyapan.gov.in</span>
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-600 pt-1 border-t border-slate-200">
                    Operating Hours: Monday – Friday | 09:30 AM to 05:30 PM (IST)
                  </div>
                </section>

                <section>
                  <h4 className="font-bold text-[#102A43] text-sm mb-1">Institutional Onboarding & Grievance Redressal</h4>
                  <p>
                    For institutional credential inquiries, API access requests, or unresolved seat discrepancy disputes, contact your assigned regional Directorate of Technical Education or submit an escalation ticket to <code className="font-mono text-[#17365D]">helpdesk@satyapan.gov.in</code>.
                  </p>
                </section>
              </div>
            )}

            {activeModal === "faq" && (
              <div className="space-y-3.5 text-xs leading-relaxed text-[#334155]">
                <div className="border-b border-slate-200 pb-3">
                  <h5 className="font-bold text-[#102A43] text-xs">Q1: How does SATYAPAN prevent seat inflation?</h5>
                  <p className="mt-1 text-slate-600">
                    Institutions are bound to their statutory intake ceiling. When admissions are uploaded, the automated reconciliation engine checks enrolled counts against sanctioned quota limits (including EWS, TFWS, and supernumerary caps). Over-capacity enrolments are flagged immediately.
                  </p>
                </div>

                <div className="border-b border-slate-200 pb-3">
                  <h5 className="font-bold text-[#102A43] text-xs">Q2: What happens if a duplicate admission is detected across two states?</h5>
                  <p className="mt-1 text-slate-600">
                    If the same APAAR ID is enrolled concurrently in two full-time technical programs, both colleges receive a high-severity cross-state discrepancy alert. The registrar can review the student&apos;s admission date and resolve the status prior to final enrollment lock.
                  </p>
                </div>

                <div className="border-b border-slate-200 pb-3">
                  <h5 className="font-bold text-[#102A43] text-xs">Q3: How do employers verify a student&apos;s degree?</h5>
                  <p className="mt-1 text-slate-600">
                    Employers can enter the student&apos;s unique verification token or scan the QR code printed on their credential. Once the candidate grants consent, the verified student details and institution details are displayed.
                  </p>
                </div>

                <div>
                  <h5 className="font-bold text-[#102A43] text-xs">Q4: Is the sample data replaceable with real institution data?</h5>
                  <p className="mt-1 text-slate-600">
                    Yes. The initial records shown in the portal are placeholder records for demonstration. Colleges can upload their official student admission CSV at any time through the Upload Students portal to populate their live ledger.
                  </p>
                </div>
              </div>
            )}

            {activeModal === "docs" && (
              <div className="space-y-4 text-xs leading-relaxed text-[#334155]">
                <section>
                  <h4 className="font-bold text-[#102A43] text-sm mb-1">Standard Admission CSV Format</h4>
                  <p className="mb-2">
                    College admissions can be ingested via standard UTF-8 CSV files matching the schema below:
                  </p>
                  <div className="p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded font-mono text-[10px] text-slate-700 overflow-x-auto">
                    apaar_id,institutional_student_id,full_name,dob_year,gender,social_category,nationality_type,program,admission_year,admission_date
                  </div>
                </section>

                <section>
                  <h4 className="font-bold text-[#102A43] text-sm mb-1">College ERP Integration API</h4>
                  <p className="mb-2">
                    Direct software integration is supported via secure API keys:
                  </p>
                  <ul className="list-disc pl-4 space-y-1 text-slate-600">
                    <li><code className="font-mono text-[#17365D]">POST /api/v1/students/sync</code>: Automated batch upload from college software.</li>
                    <li><code className="font-mono text-[#17365D]">GET /api/v1/intake/status</code>: Real-time query of sanctioned vs actual seat utilization.</li>
                    <li><code className="font-mono text-[#17365D]">GET /api/verify</code>: Verification lookup with consent token validation.</li>
                  </ul>
                </section>

                <section>
                  <h4 className="font-bold text-[#102A43] text-sm mb-1">Cryptographic Integrity Engine</h4>
                  <p className="text-slate-600">
                    Verification tokens and digital credentials utilize SHA-256 HMAC digital signatures. Any unauthorized alterations to student admission records invalidate the cryptographic checksum immediately.
                  </p>
                </section>
              </div>
            )}

            {/* Modal Footer */}
            <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-between">
              <span className="text-[11px] text-[#64748B]">Press ESC or click outside to close</span>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-1.5 bg-[#17365D] hover:bg-[#102A43] text-white text-xs font-semibold rounded-[2px] transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
