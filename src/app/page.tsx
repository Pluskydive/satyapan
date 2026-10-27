import Link from "next/link";
import Image from "next/image";
import { getServerLocale } from "@/lib/i18n-server";

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
            {/* Top Tag */}
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" aria-hidden="true" />
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
                  className="w-full sm:w-auto bg-[#F59E0B] hover:bg-[#D97706] text-[#102A43] text-xs font-bold px-4 py-2 rounded-[3px] transition-colors cursor-pointer shadow-sm whitespace-nowrap"
                >
                  {isHi ? "सत्यापन करें" : "Verify Student"} &rarr;
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

      {/* 2. Structured Institutional Services and National Verification (Government Portal Grid) */}
      <section aria-labelledby="main-sections" className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* COLUMN 1: COLLEGE WORKSPACE */}
          <div className="space-y-4">
            <div className="border-b-2 border-[#102A43] pb-2 flex items-center justify-between">
              <h2 className="text-sm sm:text-base font-bold text-[#102A43] uppercase tracking-wide">
                {isHi ? "कॉलेज प्रवेश एवं सीट प्रबंधन" : "College Admissions & Seats"}
              </h2>
              <span className="text-xs font-semibold text-[#5B6573]">
                {isHi ? "संस्थान सेवाएँ" : "Institutional Services"}
              </span>
            </div>

            <div className="space-y-4">
              {/* Card 1: College Seats */}
              <article className="border border-[#CBD5E1] border-t-4 border-t-[#17365D] bg-white p-5 rounded-[4px] hover:border-[#17365D] transition-colors shadow-xs">
                <div>
                  <h3 className="text-base font-bold text-[#102A43]">
                    {isHi ? "कॉलेज सीटें और छात्र सूची" : "College Seats & Student List"}
                  </h3>
                  <p className="text-xs text-[#5B6573] mt-1.5 leading-relaxed">
                    {isHi
                      ? "स्वीकृत सीटें, भरे हुए प्रवेश और खाली सीटों की जाँच करें।"
                      : "Check approved seat limits, admitted students, and quota status."}
                  </p>
                  <div className="mt-4 pt-3 border-t border-[#E2E8F0] flex items-center justify-between">
                    <span className="text-[11px] text-[#64748B]">
                      {isHi ? "सीट रजिस्टर एवं कोटा" : "Seat register & quota"}
                    </span>
                    <Link
                      href="/institution"
                      className="text-xs font-bold text-[#17365D] hover:underline inline-flex items-center gap-1"
                    >
                      <span>{isHi ? "सीटें देखें" : "Open College Seats"}</span>
                      <span>&rarr;</span>
                    </Link>
                  </div>
                </div>
              </article>

              {/* Card 2: Upload Student List */}
              <article className="border border-[#CBD5E1] border-t-4 border-t-[#B42318] bg-white p-5 rounded-[4px] hover:border-[#B42318] transition-colors shadow-xs">
                <div>
                  <h3 className="text-base font-bold text-[#102A43]">
                    {isHi ? "छात्र सूची अपलोड करें" : "Upload Student Admission List"}
                  </h3>
                  <p className="text-xs text-[#5B6573] mt-1.5 leading-relaxed">
                    {isHi
                      ? "Excel या CSV फ़ाइल द्वारा छात्रों के प्रवेश की सूची अपलोड करें।"
                      : "Upload student admissions list using a standard Excel or CSV file."}
                  </p>
                  <div className="mt-4 pt-3 border-t border-[#E2E8F0] flex items-center justify-between">
                    <span className="text-[11px] text-[#64748B]">
                      {isHi ? "CSV फ़ाइल अपलोड" : "CSV Batch Ingestion"}
                    </span>
                    <Link
                      href="/institution/upload"
                      className="text-xs font-bold text-[#B42318] hover:underline inline-flex items-center gap-1"
                    >
                      <span>{isHi ? "फ़ाइल अपलोड करें" : "Upload CSV"}</span>
                      <span>&rarr;</span>
                    </Link>
                  </div>
                </div>
              </article>

              {/* Card 3: Connect Software */}
              <article className="border border-[#CBD5E1] border-t-4 border-t-[#C87524] bg-white p-5 rounded-[4px] hover:border-[#C87524] transition-colors shadow-xs">
                <div>
                  <h3 className="text-base font-bold text-[#102A43]">
                    {isHi ? "कॉलेज सॉफ्टवेयर जोड़ें" : "Connect College Software"}
                  </h3>
                  <p className="text-xs text-[#5B6573] mt-1.5 leading-relaxed">
                    {isHi
                      ? "कॉलेज के ERP या एडमिशन सिस्टम को सीधे API द्वारा जोड़ें।"
                      : "Link your college ERP or student database directly via API."}
                  </p>
                  <div className="mt-4 pt-3 border-t border-[#E2E8F0] flex items-center justify-between">
                    <span className="text-[11px] text-[#64748B]">
                      {isHi ? "सिस्टम एकीकरण" : "System Integration"}
                    </span>
                    <Link
                      href="/institution/api"
                      className="text-xs font-bold text-[#C87524] hover:underline inline-flex items-center gap-1"
                    >
                      <span>{isHi ? "सॉफ्टवेयर लिंक देखें" : "Connect Software"}</span>
                      <span>&rarr;</span>
                    </Link>
                  </div>
                </div>
              </article>
            </div>
          </div>

          {/* COLUMN 2: SERVICES & OVERSIGHT */}
          <div className="space-y-4">
            <div className="border-b-2 border-[#102A43] pb-2 flex items-center justify-between">
              <h2 className="text-sm sm:text-base font-bold text-[#102A43] uppercase tracking-wide">
                {isHi ? "राष्ट्रीय निरीक्षण एवं सत्यापन" : "National Oversight & Verification"}
              </h2>
              <span className="text-xs font-semibold text-[#5B6573]">
                {isHi ? "सार्वजनिक एवं नियामक सेवाएँ" : "Public & Regulatory Services"}
              </span>
            </div>

            <div className="space-y-4">
              {/* Card 4: National Overview */}
              <article className="border border-[#CBD5E1] border-t-4 border-t-[#102A43] bg-white p-5 rounded-[4px] hover:border-[#102A43] transition-colors shadow-xs">
                <div>
                  <h3 className="text-base font-bold text-[#102A43]">
                    {isHi ? "अखिल भारतीय विवरण" : "National Overview"}
                  </h3>
                  <p className="text-xs text-[#5B6573] mt-1.5 leading-relaxed">
                    {isHi
                      ? "देश भर के राज्यों की सीटें, प्रवेश आंकड़े और दोहरे दाखिले देखें।"
                      : "View nationwide seat numbers, state-wise admissions, and duplicate student flags."}
                  </p>
                  <div className="mt-4 pt-3 border-t border-[#E2E8F0] flex items-center justify-between">
                    <span className="text-[11px] text-[#64748B]">
                      {isHi ? "राज्यवार आंकड़े एवं विश्लेषण" : "State breakdown & analytics"}
                    </span>
                    <Link
                      href="/aicte"
                      className="text-xs font-bold text-[#102A43] hover:underline inline-flex items-center gap-1"
                    >
                      <span>{isHi ? "डैशबोर्ड खोलें" : "Open Dashboard"}</span>
                      <span>&rarr;</span>
                    </Link>
                  </div>
                </div>
              </article>

              {/* Card 5: Verify Student Degree */}
              <article className="border border-[#CBD5E1] border-t-4 border-t-[#237A52] bg-white p-5 rounded-[4px] hover:border-[#237A52] transition-colors shadow-xs">
                <div>
                  <h3 className="text-base font-bold text-[#102A43]">
                    {isHi ? "छात्र प्रमाणपत्र सत्यापन" : "Verify Student Degree"}
                  </h3>
                  <p className="text-xs text-[#5B6573] mt-1.5 leading-relaxed">
                    {isHi
                      ? "नियोक्ता छात्र की सहमति से उनके शैक्षणिक रिकॉर्ड की जाँच कर सकते हैं।"
                      : "Verify candidate academic records with candidate digital consent."}
                  </p>
                  <div className="mt-4 pt-3 border-t border-[#E2E8F0] flex items-center justify-between">
                    <span className="text-[11px] text-[#64748B]">
                      {isHi ? "डिजिटल सत्यापन" : "Digital Verification"}
                    </span>
                    <Link
                      href="/verify"
                      className="text-xs font-bold text-[#237A52] hover:underline inline-flex items-center gap-1"
                    >
                      <span>{isHi ? "सत्यापित करें" : "Verify Degree"}</span>
                      <span>&rarr;</span>
                    </Link>
                  </div>
                </div>
              </article>

              {/* Card 6: College Reports */}
              <article className="border border-[#CBD5E1] border-t-4 border-t-[#4F46E5] bg-white p-5 rounded-[4px] hover:border-[#4F46E5] transition-colors shadow-xs">
                <div>
                  <h3 className="text-base font-bold text-[#102A43]">
                    {isHi ? "कॉलेज रिपोर्ट और रैंकिंग" : "College Reports & Ranking"}
                  </h3>
                  <p className="text-xs text-[#5B6573] mt-1.5 leading-relaxed">
                    {isHi
                      ? "NIRF और NAAC प्रत्यायन के लिए प्रमाणित रिपोर्ट डाउनलोड करें।"
                      : "Download certified admission summaries for NIRF and NAAC accreditation."}
                  </p>
                  <div className="mt-4 pt-3 border-t border-[#E2E8F0] flex items-center justify-between">
                    <span className="text-[11px] text-[#64748B]">
                      {isHi ? "प्रत्यायन डेटा डाउनलोड" : "NIRF / NAAC Export"}
                    </span>
                    <Link
                      href="/aicte/reports"
                      className="text-xs font-bold text-[#4F46E5] hover:underline inline-flex items-center gap-1"
                    >
                      <span>{isHi ? "रिपोर्ट देखें" : "View Reports"}</span>
                      <span>&rarr;</span>
                    </Link>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </div>

        {/* 3. Bottom Row: Quick Utilities (Clean 3-card strip without emojis) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          {/* Card 7: Sample Certificate */}
          <Link
            href="/verify/certificate/stu-1"
            className="p-4 bg-white border border-[#CBD5E1] rounded-[4px] hover:border-[#102A43] hover:shadow-xs transition-all group flex items-center justify-between"
          >
            <div>
              <div className="text-xs font-bold text-[#102A43] group-hover:text-[#17365D]">
                {isHi ? "नमूना प्रमाणपत्र देखें" : "Sample QR Certificate"}
              </div>
              <div className="text-[11px] text-[#64748B] mt-0.5">
                {isHi ? "डिजिटल क्यूआर कोड युक्त प्रमाणपत्र" : "Printable verified certificate"}
              </div>
            </div>
            <span className="text-xs text-slate-400 group-hover:text-[#102A43] font-bold">&rarr;</span>
          </Link>

          {/* Card 8: Activity Log */}
          <Link
            href="/audit"
            className="p-4 bg-white border border-[#CBD5E1] rounded-[4px] hover:border-[#102A43] hover:shadow-xs transition-all group flex items-center justify-between"
          >
            <div>
              <div className="text-xs font-bold text-[#102A43] group-hover:text-[#17365D]">
                {isHi ? "गतिविधि लॉग" : "Activity Log"}
              </div>
              <div className="text-[11px] text-[#64748B] mt-0.5">
                {isHi ? "डेटा बदलावों का पूरा रिकॉर्ड" : "Timestamped system history"}
              </div>
            </div>
            <span className="text-xs text-slate-400 group-hover:text-[#102A43] font-bold">&rarr;</span>
          </Link>

          {/* Card 9: Login */}
          <Link
            href="/login"
            className="p-4 bg-white border border-[#CBD5E1] rounded-[4px] hover:border-[#102A43] hover:shadow-xs transition-all group flex items-center justify-between"
          >
            <div>
              <div className="text-xs font-bold text-[#102A43] group-hover:text-[#17365D]">
                {isHi ? "लॉगिन पोर्टल" : "Login Portal"}
              </div>
              <div className="text-[11px] text-[#64748B] mt-0.5">
                {isHi ? "अपने आधिकारिक खाते में जाएँ" : "Access your account"}
              </div>
            </div>
            <span className="text-xs text-slate-400 group-hover:text-[#102A43] font-bold">&rarr;</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
