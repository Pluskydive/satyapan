import Link from "next/link";
import Image from "next/image";
import { getServerLocale } from "@/lib/i18n-server";
import {
  GraduationCap,
  Upload,
  Plug,
  BarChart3,
  CheckCircle,
  FileText,
  Scroll,
  Lock,
  Key,
  Building2,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

export default async function HomePage() {
  const locale = await getServerLocale();
  const isHi = locale === "hi";

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-8 space-y-8" id="main-content">
      {/* 1. Indian Portal Hero Banner with Photograph (Maharashtra & UIDAI Style) */}
      <section className="relative overflow-hidden rounded-[6px] border border-[#CBD5E1] bg-[#102A43] text-white shadow-sm">
        {/* Background Image with Government-style Dark Gradient Overlay */}
        <div className="relative h-64 sm:h-80 w-full overflow-hidden">
          <Image
            src="/hero-banner.jpg"
            alt="Indian Technical University Students"
            fill
            priority
            className="object-cover object-center brightness-90"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#102A43] via-[#102A43]/85 to-transparent" />

          {/* Banner Content Overlay */}
          <div className="absolute inset-0 p-6 sm:p-10 flex flex-col justify-between max-w-2xl">
            {/* Top Tag & Team Logo */}
            <div className="flex items-center space-x-3">
              <img
                src="/pramaanit-logo.jpg"
                alt="PRAMAANIT Logo"
                className="h-7 w-auto rounded-[3px] bg-white p-0.5 object-contain shadow-xs"
              />
              <span className="w-2 h-2 rounded-full bg-[#10B981]" aria-hidden="true" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-200">
                {isHi ? "छात्र नामांकन सत्यनिष्ठा एवं अपार पोर्टल" : "Student Admission Integrity & APAAR Portal"}
              </span>
            </div>

            {/* Headline */}
            <div>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white drop-shadow-sm">
                {isHi ? "सत्यापन पोर्टल में आपका स्वागत है" : "Welcome to SATYAPAN"}
              </h1>
              <p className="mt-2 text-sm sm:text-base font-medium text-slate-200 leading-snug">
                {isHi
                  ? "कॉलेजों में छात्रों के प्रवेश और स्वीकृत सीटों की सीधी ऑनलाइन जाँच।"
                  : "Verify college student admissions, approved intake seats, and APAAR IDs."}
              </p>
            </div>

            {/* Quick Search Bar (ECI & UIDAI Search Style) */}
            <div className="pt-2">
              <form action="/verify" method="GET" className="flex flex-col sm:flex-row items-center gap-2 max-w-lg">
                <input
                  type="text"
                  name="code"
                  defaultValue="SATYA-2026-TCS"
                  placeholder={isHi ? "छात्र APAAR आईडी या टोकन दर्ज करें..." : "Enter APAAR ID, Roll No, or Token..."}
                  className="w-full sm:flex-1 bg-white/95 text-[#0F172A] px-3.5 py-2 text-xs font-semibold rounded-[3px] border border-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
                />
                <button
                  type="submit"
                  className="w-full sm:w-auto bg-[#F59E0B] hover:bg-[#D97706] text-[#102A43] text-xs font-bold px-4 py-2 rounded-[3px] transition-colors cursor-pointer shadow-sm whitespace-nowrap flex items-center justify-center gap-1.5"
                >
                  <span>{isHi ? "सत्यापन करें" : "Verify Student"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Sub-strip */}
        <div className="bg-[#0B1E32] px-6 py-2.5 border-t border-[#1E3A5F] flex flex-wrap items-center justify-between text-[11px] text-slate-300">
          <div>
            {isHi
              ? "तकनीकी शिक्षा संस्थानों और विश्वविद्यालयों के लिए केंद्रीय पोर्टल।"
              : "Central Enrolment Platform for Technical Institutions & Universities"}
          </div>
          <div className="text-[11px] text-slate-300">
            {isHi ? "डिजिटल भारत पहल" : "National Academic Governance"}
          </div>
        </div>
      </section>

      {/* 2. Vibrant Option Boxes (Exact voters.eci.gov.in Color-Coded Style) */}
      <section aria-labelledby="main-sections" className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* COLUMN 1: COLLEGE WORKSPACE */}
          <div className="space-y-4">
            {/* Bold Pill Section Banner */}
            <div className="inline-flex items-center gap-2 bg-[#17365D] text-white text-xs font-black uppercase tracking-wider px-4 py-2 rounded-[4px] shadow-xs">
              <Building2 className="w-4 h-4 text-[#F59E0B]" />
              <span>{isHi ? "कॉलेज सेवाएँ" : "COLLEGE SERVICES"}</span>
            </div>

            <div className="space-y-4">
              {/* Card 1: College Seats (Royal Blue Card) */}
              <article className="border-2 border-[#2563EB] bg-[#EFF6FF] p-5 rounded-[6px] hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-full bg-[#2563EB] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-base font-extrabold text-[#1E3A8A]">
                      {isHi ? "कॉलेज सीटें और छात्र सूची" : "College Seats & Student List"}
                    </h2>
                    <p className="text-xs text-[#334155] mt-1 leading-relaxed">
                      {isHi
                        ? "स्वीकृत सीटें, भरे हुए प्रवेश और खाली सीटों की जाँच करें।"
                        : "Check approved seat limits, admitted students, and quota status."}
                    </p>
                    <div className="mt-3.5 pt-3 border-t border-[#BFDBFE]">
                      <Link
                        href="/institution"
                        className="inline-flex items-center gap-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold py-2 px-4 rounded-[3px] transition-colors"
                      >
                        <span>{isHi ? "सीटें देखें" : "Open College Seats"}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </article>

              {/* Card 2: Upload Student List (Magenta / Rose Card) */}
              <article className="border-2 border-[#E11D48] bg-[#FFF1F2] p-5 rounded-[6px] hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-full bg-[#E11D48] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-base font-extrabold text-[#9F1239]">
                      {isHi ? "छात्र सूची अपलोड करें" : "Upload Student Admission List"}
                    </h2>
                    <p className="text-xs text-[#334155] mt-1 leading-relaxed">
                      {isHi
                        ? "Excel या CSV फ़ाइल द्वारा छात्रों के प्रवेश की सूची अपलोड करें।"
                        : "Upload student admissions list using a standard Excel or CSV file."}
                    </p>
                    <div className="mt-3.5 pt-3 border-t border-[#FECDD3]">
                      <Link
                        href="/institution/upload"
                        className="inline-flex items-center gap-1.5 bg-[#E11D48] hover:bg-[#BE123C] text-white text-xs font-bold py-2 px-4 rounded-[3px] transition-colors"
                      >
                        <span>{isHi ? "फ़ाइल अपलोड करें" : "Upload CSV"}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </article>

              {/* Card 3: Connect Software (Amber / Yellow Card) */}
              <article className="border-2 border-[#D97706] bg-[#FFFBEB] p-5 rounded-[6px] hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-full bg-[#D97706] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Plug className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-base font-extrabold text-[#92400E]">
                      {isHi ? "कॉलेज सॉफ्टवेयर जोड़ें" : "Connect College Software"}
                    </h2>
                    <p className="text-xs text-[#334155] mt-1 leading-relaxed">
                      {isHi
                        ? "कॉलेज के ERP या एडमिशन सिस्टम को सीधे API द्वारा जोड़ें।"
                        : "Link your college ERP or student database directly via API."}
                    </p>
                    <div className="mt-3.5 pt-3 border-t border-[#FDE68A]">
                      <Link
                        href="/institution/api"
                        className="inline-flex items-center gap-1.5 bg-[#D97706] hover:bg-[#B45309] text-white text-xs font-bold py-2 px-4 rounded-[3px] transition-colors"
                      >
                        <span>{isHi ? "सॉफ्टवेयर लिंक देखें" : "Connect Software"}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            </div>
          </div>

          {/* COLUMN 2: SERVICES & OVERSIGHT */}
          <div className="space-y-4">
            {/* Bold Pill Section Banner */}
            <div className="inline-flex items-center gap-2 bg-[#4338CA] text-white text-xs font-black uppercase tracking-wider px-4 py-2 rounded-[4px] shadow-xs">
              <ShieldCheck className="w-4 h-4 text-[#F59E0B]" />
              <span>{isHi ? "नागरिक एवं विनियामक सेवाएँ" : "SERVICES & OVERSIGHT"}</span>
            </div>

            <div className="space-y-4">
              {/* Card 4: All India Overview (Indigo Card) */}
              <article className="border-2 border-[#4F46E5] bg-[#EEF2FF] p-5 rounded-[6px] hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-full bg-[#4F46E5] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-base font-extrabold text-[#312E81]">
                      {isHi ? "अखिल भारतीय विवरण" : "National Overview"}
                    </h2>
                    <p className="text-xs text-[#334155] mt-1 leading-relaxed">
                      {isHi
                        ? "देश भर के राज्यों की सीटें, प्रवेश आंकड़े और दोहरे दाखिले देखें।"
                        : "View nationwide seat numbers, state-wise admissions, and duplicate student flags."}
                    </p>
                    <div className="mt-3.5 pt-3 border-t border-[#C7D2FE]">
                      <Link
                        href="/aicte"
                        className="inline-flex items-center gap-1.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold py-2 px-4 rounded-[3px] transition-colors"
                      >
                        <span>{isHi ? "डैशबोर्ड खोलें" : "Open Dashboard"}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </article>

              {/* Card 5: Verify Student Degree (Emerald Green Card) */}
              <article className="border-2 border-[#059669] bg-[#ECFDF5] p-5 rounded-[6px] hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-full bg-[#059669] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-base font-extrabold text-[#064E3B]">
                      {isHi ? "छात्र प्रमाणपत्र सत्यापन" : "Verify Student Degree"}
                    </h2>
                    <p className="text-xs text-[#334155] mt-1 leading-relaxed">
                      {isHi
                        ? "नियोक्ता छात्र की सहमति से उनके शैक्षणिक रिकॉर्ड की जाँच कर सकते हैं।"
                        : "Verify candidate academic records with candidate digital consent."}
                    </p>
                    <div className="mt-3.5 pt-3 border-t border-[#A7F3D0]">
                      <Link
                        href="/verify"
                        className="inline-flex items-center gap-1.5 bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold py-2 px-4 rounded-[3px] transition-colors"
                      >
                        <span>{isHi ? "सत्यापित करें" : "Verify Degree"}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </article>

              {/* Card 6: College Reports (Purple / Violet Card) */}
              <article className="border-2 border-[#7C3AED] bg-[#F5F3FF] p-5 rounded-[6px] hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-full bg-[#7C3AED] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-base font-extrabold text-[#4C1D95]">
                      {isHi ? "कॉलेज रिपोर्ट और रैंकिंग" : "College Reports & Ranking"}
                    </h2>
                    <p className="text-xs text-[#334155] mt-1 leading-relaxed">
                      {isHi
                        ? "NIRF और NAAC प्रत्यायन के लिए प्रमाणित रिपोर्ट डाउनलोड करें।"
                        : "Download certified admission summaries for NIRF and NAAC accreditation."}
                    </p>
                    <div className="mt-3.5 pt-3 border-t border-[#DDD6FE]">
                      <Link
                        href="/aicte/reports"
                        className="inline-flex items-center gap-1.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold py-2 px-4 rounded-[3px] transition-colors"
                      >
                        <span>{isHi ? "रिपोर्ट देखें" : "View Reports"}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </div>

        {/* 3. Bottom Row: Quick Utilities (Clean 3-card strip) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          {/* Card 7: Sample Certificate */}
          <Link
            href="/verify/certificate/stu-1"
            className="p-4 bg-white border border-[#CBD5E1] rounded-[6px] hover:border-[#0D9488] hover:shadow-sm transition-all group flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-full bg-[#F0FDFA] border border-[#0D9488] text-[#0D9488] flex items-center justify-center shrink-0">
                <Scroll className="w-4 h-4" />
              </span>
              <div>
                <div className="text-xs font-bold text-[#102A43] group-hover:text-[#0D9488]">
                  {isHi ? "नमूना प्रमाणपत्र देखें" : "Sample QR Certificate"}
                </div>
                <div className="text-[11px] text-[#64748B]">
                  {isHi ? "डिजिटल क्यूआर कोड युक्त प्रमाणपत्र" : "Printable verified certificate"}
                </div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#0D9488] transition-transform group-hover:translate-x-0.5" />
          </Link>

          {/* Card 8: Activity Log */}
          <Link
            href="/audit"
            className="p-4 bg-white border border-[#CBD5E1] rounded-[6px] hover:border-[#475569] hover:shadow-sm transition-all group flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-full bg-[#F8FAFC] border border-[#475569] text-[#475569] flex items-center justify-center shrink-0">
                <Lock className="w-4 h-4" />
              </span>
              <div>
                <div className="text-xs font-bold text-[#102A43] group-hover:text-[#475569]">
                  {isHi ? "गतिविधि लॉग" : "Activity Log"}
                </div>
                <div className="text-[11px] text-[#64748B]">
                  {isHi ? "डेटा बदलावों का पूरा रिकॉर्ड" : "Timestamped system history"}
                </div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#475569] transition-transform group-hover:translate-x-0.5" />
          </Link>

          {/* Card 9: Login */}
          <Link
            href="/login"
            className="p-4 bg-white border border-[#CBD5E1] rounded-[6px] hover:border-[#1E293B] hover:shadow-sm transition-all group flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-full bg-[#F1F5F9] border border-[#1E293B] text-[#1E293B] flex items-center justify-center shrink-0">
                <Key className="w-4 h-4" />
              </span>
              <div>
                <div className="text-xs font-bold text-[#102A43] group-hover:text-[#1E293B]">
                  {isHi ? "लॉगिन पोर्टल" : "Login Portal"}
                </div>
                <div className="text-[11px] text-[#64748B]">
                  {isHi ? "अपने आधिकारिक खाते में जाएँ" : "Access your account"}
                </div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#1E293B] transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
