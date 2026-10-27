import Link from "next/link";
import { getRuntimeMode } from "@/lib/runtime-mode";
import { getServerLocale } from "@/lib/i18n-server";

export default async function HomePage() {
  const [locale, mode] = await Promise.all([getServerLocale(), getRuntimeMode()]);

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-6 sm:px-8 sm:py-10" id="main-content">
      {/* 1. Indian Portal Hero Section (ECI / UIDAI Portal Style) */}
      <section className="relative overflow-hidden border-2 border-[#1E3A5F] bg-gradient-to-b from-[#FFFFFF] via-[#F8FAFC] to-[#EDF2F7] p-6 sm:p-10 rounded-[4px] shadow-sm">
        {/* Top Header Tag */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#CBD5E1] pb-3 mb-6">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" aria-hidden="true" />
            <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#102A43]">
              {locale === "hi"
                ? "AICTE छात्र नामांकन सत्यनिष्ठा एवं अपार रजिस्ट्री समाधान"
                : "AICTE STUDENT ENROLMENT INTEGRITY & APAAR REGISTRY SOLUTION"}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono px-2 py-0.5 bg-[#FEF3C7] border border-[#F59E0B] text-[#92400E] font-bold uppercase rounded-[2px]">
              Team PRAMAANIT
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 bg-[#17365D] text-white font-bold uppercase rounded-[2px]">
              {mode === "demo" ? "EVALUATION SANDBOX" : "ACTIVE LIVE RLS"}
            </span>
          </div>
        </div>

        {/* Hero Headline & Bilingual Descriptions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          <div className="lg:col-span-2">
            <h1 className="text-3xl font-black tracking-tight text-[#102A43] sm:text-4xl">
              सत्यापन <span className="font-extrabold text-[#17365D]">| SATYAPAN</span>
            </h1>
            <p className="mt-1 text-base sm:text-lg font-bold text-[#C87524]">
              {locale === "hi"
                ? "राष्ट्रीय छात्र नामांकन सत्यनिष्ठा एवं अपार रजिस्ट्री"
                : "National Student Enrolment Integrity & APAAR Registry Platform"}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-[#334155]">
              {locale === "hi"
                ? "एक केंद्रीकृत सत्यापन ढाँचा जो AICTE-आधारित संस्थानों को अपार (APAAR - ऑटोमेटेड परमानेंट एकेडमिक अकाउंट रजिस्ट्री) पहचानकर्ताओं से जुड़े प्रमाणित छात्र प्रवेश प्रबंधित करने, सीट क्षमता अतिक्रमण रोकने और अंतर-राज्यीय डुप्लिकेट नामांकन को समाप्त करने में सक्षम बनाता है।"
                : "A centralized verification framework enabling institutions to reconcile authenticated student admissions linked with APAAR identifiers, preventing sanctioned intake inflation and eliminating duplicate enrolments across states."}
            </p>

            {/* Quick Feature Badges */}
            <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
              <div className="bg-white border border-[#CBD5E1] p-2.5 rounded-[2px] shadow-xs">
                <div className="font-mono text-base font-black text-[#17365D]">100%</div>
                <div className="text-[10px] uppercase font-bold text-[#475569]">
                  {locale === "hi" ? "अपार लिंकेज" : "APAAR Linked"}
                </div>
              </div>
              <div className="bg-white border border-[#CBD5E1] p-2.5 rounded-[2px] shadow-xs">
                <div className="font-mono text-base font-black text-[#059669]">DPDP 2023</div>
                <div className="text-[10px] uppercase font-bold text-[#475569]">
                  {locale === "hi" ? "सहमति आधारित" : "Consent Gated"}
                </div>
              </div>
              <div className="bg-white border border-[#CBD5E1] p-2.5 rounded-[2px] shadow-xs">
                <div className="font-mono text-base font-black text-[#C87524]">CWE-1236</div>
                <div className="text-[10px] uppercase font-bold text-[#475569]">
                  {locale === "hi" ? "स्प्रेडशीट सुरक्षित" : "Formula Shielded"}
                </div>
              </div>
              <div className="bg-white border border-[#CBD5E1] p-2.5 rounded-[2px] shadow-xs">
                <div className="font-mono text-base font-black text-[#102A43]">PostgreSQL RLS</div>
                <div className="text-[10px] uppercase font-bold text-[#475569]">
                  {locale === "hi" ? "संस्थान अलगाव" : "Tenant Isolation"}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Registry Lookup Card (Inspired by ECI & UIDAI portal search cards) */}
          <div className="bg-white border-2 border-[#17365D] p-5 rounded-[4px] shadow-md">
            <div className="flex items-center space-x-2 border-b border-[#CBD5E1] pb-2 mb-3">
              <span className="w-6 h-6 rounded-full bg-[#17365D] text-white flex items-center justify-center text-xs font-bold">
                ✓
              </span>
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#102A43]">
                {locale === "hi" ? "त्वरित सत्यापन एवं रजिस्ट्री खोज" : "Quick Registry & Token Search"}
              </h2>
            </div>
            <p className="text-[11px] text-[#475569] leading-snug mb-3">
              {locale === "hi"
                ? "उम्मीदवार का 12-अंकीय APAAR आईडी, रोल नंबर या सत्यापन टोकन दर्ज करें:"
                : "Enter Candidate 12-digit APAAR ID, Student Roll, or Token:"}
            </p>
            <div className="space-y-2">
              <input
                type="text"
                readOnly
                value="SATYA-2026-TCS / STU-1"
                aria-label="Preset Query Token"
                className="w-full font-mono text-xs px-3 py-2 bg-[#F8FAFC] border border-[#94A3B8] text-[#0F172A] font-semibold rounded-[2px]"
              />
              <Link
                href="/verify"
                className="w-full inline-flex items-center justify-center bg-[#17365D] hover:bg-[#102A43] text-white text-xs font-bold py-2.5 px-3 rounded-[2px] transition-colors shadow-xs"
              >
                {locale === "hi" ? "सत्यापन गेटवे खोलें" : "Open Verification Terminal"} &rarr;
              </Link>
            </div>
            <div className="mt-2.5 pt-2 border-t border-[#E2E8F0] flex items-center justify-between text-[10px] text-[#64748B]">
              <span>Sample: STU-1 (CS)</span>
              <span className="text-[#059669] font-bold">✓ Authorized</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Color-Coded Service & Form Cards Grid (Directly copying voters.eci.gov.in style) */}
      <section aria-labelledby="services-section" className="space-y-8">
        <div>
          <h2 id="services-section" className="text-xl sm:text-2xl font-black text-[#102A43] flex items-center gap-2">
            <span className="h-5 w-1.5 bg-[#17365D] inline-block rounded-xs" />
            {locale === "hi" ? "सेवाएँ एवं मुख्य मॉड्यूल" : "Services & Core Modules"}
          </h2>
          <p className="text-xs text-[#5B6573] mt-1">
            {locale === "hi"
              ? "विभिन्न हितधारकों के लिए विशेष रूप से डिज़ाइन किए गए प्रशासनिक, विनियामक और सत्यापन उपकरण।"
              : "Institutional, regulatory, and verification portals designed for seamless academic enrolment governance."}
          </p>
        </div>

        {/* CATEGORY 1: INSTITUTIONAL SERVICES (Inspired by voters.eci pink/blue cards) */}
        <div>
          {/* Bold Pill Section Banner (Like "FORMS" in voters.eci) */}
          <div className="inline-flex items-center gap-2 bg-[#17365D] text-white text-xs font-black uppercase tracking-wider px-4 py-1.5 rounded-t-[4px]">
            <span>🏛️</span>
            <span>{locale === "hi" ? "संस्थागत सेवाएँ (INSTITUTIONAL SERVICES)" : "INSTITUTIONAL SERVICES"}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 border-2 border-[#17365D] bg-white p-5 rounded-b-[4px] rounded-tr-[4px] shadow-xs">
            {/* Card 1: Seat Ledger (Blue Theme like voters.eci) */}
            <article className="border-2 border-[#1D4ED8] bg-[#EFF6FF] p-5 rounded-[4px] flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-full bg-[#1D4ED8] text-white flex items-center justify-center font-bold text-lg shadow-xs">
                    📊
                  </div>
                  <span className="text-[10px] font-mono font-bold text-[#1D4ED8] bg-white px-2 py-0.5 border border-[#1D4ED8] rounded-[2px]">
                    APH COMPLIANCE
                  </span>
                </div>
                <h3 className="text-base font-extrabold text-[#1E3A8A]">
                  {locale === "hi" ? "स्वीकृत सीट लेजर एवं नामांकन सूची" : "Sanctioned Seat Ledger & Enrolment"}
                </h3>
                <p className="text-xs font-bold text-[#D97706] mt-0.5">
                  {locale === "hi" ? "स्वीकृत प्रवेश सीमा एवं छात्र रोस्टर" : "Approved Intake Compliance & Student Roster"}
                </p>
                <p className="text-xs text-[#334155] mt-2.5 leading-relaxed">
                  {locale === "hi"
                    ? "संस्थान की स्वीकृत प्रवेश क्षमता, अतिरिक्त कोटा (TFW/NRI) और छात्र नामांकन स्थिति की वास्तविक समय पर निगरानी करें।"
                    : "Track sanctioned technical intake thresholds, supernumerary quotas (TFW/NRI), and audit student admissions against approval ceilings."}
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-[#BFDBFE]">
                <Link
                  href="/institution"
                  className="w-full inline-flex items-center justify-center bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs font-bold py-2.5 px-3 rounded-[2px] transition-colors shadow-xs"
                >
                  {locale === "hi" ? "सीट लेजर खोलें" : "Access Seat Ledger"} &rarr;
                </Link>
              </div>
            </article>

            {/* Card 2: Bulk CSV Ingestion (Pink/Magenta Theme like voters.eci) */}
            <article className="border-2 border-[#BE185D] bg-[#FDF2F8] p-5 rounded-[4px] flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-full bg-[#BE185D] text-white flex items-center justify-center font-bold text-lg shadow-xs">
                    📥
                  </div>
                  <span className="text-[10px] font-mono font-bold text-[#BE185D] bg-white px-2 py-0.5 border border-[#BE185D] rounded-[2px]">
                    CWE-1236 SECURED
                  </span>
                </div>
                <h3 className="text-base font-extrabold text-[#831843]">
                  {locale === "hi" ? "थोक छात्र प्रवेश CSV डेटा अपलोड" : "Bulk Student CSV Ingestion"}
                </h3>
                <p className="text-xs font-bold text-[#BE185D] mt-0.5">
                  {locale === "hi" ? "स्वचालित फॉर्मूला निष्प्रभावीकरण" : "Automated Formula Neutralization"}
                </p>
                <p className="text-xs text-[#334155] mt-2.5 leading-relaxed">
                  {locale === "hi"
                    ? "संस्थागत प्रवेश डेटा को सीधे CSV द्वारा अपलोड करें। खतरनाक स्प्रेडशीट फॉर्मूला इंजेक्शन और अमान्य APAAR स्वरूपों को स्वतः रोकता है।"
                    : "Ingest technical admission rosters with pre-flight spreadsheet formula neutralization, APAAR syntax validation, and anomaly flagging."}
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-[#FBCFE8]">
                <Link
                  href="/institution/upload"
                  className="w-full inline-flex items-center justify-center bg-[#BE185D] hover:bg-[#9D174D] text-white text-xs font-bold py-2.5 px-3 rounded-[2px] transition-colors shadow-xs"
                >
                  {locale === "hi" ? "CSV अपलोड करें" : "Upload Admission CSV"} &rarr;
                </Link>
              </div>
            </article>

            {/* Card 3: ERP API Integration (Amber Theme like voters.eci) */}
            <article className="border-2 border-[#D97706] bg-[#FFFBEB] p-5 rounded-[4px] flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-full bg-[#D97706] text-white flex items-center justify-center font-bold text-lg shadow-xs">
                    🔌
                  </div>
                  <span className="text-[10px] font-mono font-bold text-[#D97706] bg-white px-2 py-0.5 border border-[#D97706] rounded-[2px]">
                    HMAC-SHA256
                  </span>
                </div>
                <h3 className="text-base font-extrabold text-[#78350F]">
                  {locale === "hi" ? "विश्वविद्यालय ईआरपी एपीआई गेटवे" : "Institutional ERP API Gateway"}
                </h3>
                <p className="text-xs font-bold text-[#D97706] mt-0.5">
                  {locale === "hi" ? "स्वचालित सिस्टम एकीकरण एवं सिंक" : "Automated System Integration & Sync"}
                </p>
                <p className="text-xs text-[#334155] mt-2.5 leading-relaxed">
                  {locale === "hi"
                    ? "संस्थान के छात्र सूचना तंत्र (SIS/ERP) को सुरक्षित क्रिप्टोग्राफिक API कुंजियों द्वारा SATYAPAN रजिस्ट्री से सीधे जोड़ें।"
                    : "Direct machine-to-machine synchronization with university ERPs and admissions software via signed REST endpoints."}
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-[#FDE68A]">
                <Link
                  href="/institution/api"
                  className="w-full inline-flex items-center justify-center bg-[#D97706] hover:bg-[#B45309] text-white text-xs font-bold py-2.5 px-3 rounded-[2px] transition-colors shadow-xs"
                >
                  {locale === "hi" ? "ईआरपी एपीआई कॉन्फ़िगर करें" : "Configure ERP API"} &rarr;
                </Link>
              </div>
            </article>
          </div>
        </div>

        {/* CATEGORY 2: REGULATORY OVERSIGHT (Purple & Indigo Theme) */}
        <div>
          {/* Bold Pill Section Banner */}
          <div className="inline-flex items-center gap-2 bg-[#4338CA] text-white text-xs font-black uppercase tracking-wider px-4 py-1.5 rounded-t-[4px]">
            <span>⚖️</span>
            <span>{locale === "hi" ? "नियामक एवं शीर्ष निगरानी (REGULATORY OVERSIGHT)" : "REGULATORY OVERSIGHT"}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 border-2 border-[#4338CA] bg-white p-5 rounded-b-[4px] rounded-tr-[4px] shadow-xs">
            {/* Card 4: Control Tower */}
            <article className="border-2 border-[#4F46E5] bg-[#EEF2FF] p-5 rounded-[4px] flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-full bg-[#4F46E5] text-white flex items-center justify-center font-bold text-lg shadow-xs">
                    🗼
                  </div>
                  <span className="text-[10px] font-mono font-bold text-[#4F46E5] bg-white px-2 py-0.5 border border-[#4F46E5] rounded-[2px]">
                    NATIONAL COMMAND
                  </span>
                </div>
                <h3 className="text-base font-extrabold text-[#1E1B4B]">
                  {locale === "hi" ? "AICTE राष्ट्रीय नियंत्रण कक्ष" : "AICTE National Control Tower"}
                </h3>
                <p className="text-xs font-bold text-[#4F46E5] mt-0.5">
                  {locale === "hi" ? "राष्ट्रीय निगरानी एवं विसंगति कतार" : "National Oversight & Integrity Monitoring"}
                </p>
                <p className="text-xs text-[#334155] mt-2.5 leading-relaxed">
                  {locale === "hi"
                    ? "राष्ट्रीय एवं राज्य-स्तरीय सीट उपयोग विश्लेषण, अंतर-राज्यीय डुप्लिकेट छात्र मिलान और विसंगति निवारण कतार की निगरानी करें।"
                    : "Cross-state seat utilization analytics, duplicate student admission detection across states, and AICTE discrepancy review queue."}
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-[#C7D2FE]">
                <Link
                  href="/aicte"
                  className="w-full inline-flex items-center justify-center bg-[#4F46E5] hover:bg-[#3730A3] text-white text-xs font-bold py-2.5 px-3 rounded-[2px] transition-colors shadow-xs"
                >
                  {locale === "hi" ? "नियंत्रण कक्ष खोलें" : "Open Control Tower"} &rarr;
                </Link>
              </div>
            </article>

            {/* Card 5: NIRF / NAAC Reports */}
            <article className="border-2 border-[#7C3AED] bg-[#F5F3FF] p-5 rounded-[4px] flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-full bg-[#7C3AED] text-white flex items-center justify-center font-bold text-lg shadow-xs">
                    📑
                  </div>
                  <span className="text-[10px] font-mono font-bold text-[#7C3AED] bg-white px-2 py-0.5 border border-[#7C3AED] rounded-[2px]">
                    NIRF · NAAC · NBA
                  </span>
                </div>
                <h3 className="text-base font-extrabold text-[#4C1D95]">
                  {locale === "hi" ? "प्रत्यायन एवं विनियामक रिपोर्ट" : "Accreditation & NIRF Reports"}
                </h3>
                <p className="text-xs font-bold text-[#7C3AED] mt-0.5">
                  {locale === "hi" ? "आधिकारिक सत्यापन डेटा सारांश" : "Certified Accreditation Summaries"}
                </p>
                <p className="text-xs text-[#334155] mt-2.5 leading-relaxed">
                  {locale === "hi"
                    ? "राष्ट्रीय संस्थागत रैंकिंग फ्रेमवर्क (NIRF) एवं NAAC प्रत्यायन के लिए संस्थागत प्रवेश संख्या और अनुपालन स्थिति निर्यात करें।"
                    : "Generate authoritative enrolment audit summaries formatted for NIRF scoring, NAAC peer reviews, and institutional compliance dossiers."}
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-[#DDD6FE]">
                <Link
                  href="/aicte/reports"
                  className="w-full inline-flex items-center justify-center bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold py-2.5 px-3 rounded-[2px] transition-colors shadow-xs"
                >
                  {locale === "hi" ? "रिपोर्ट तैयार करें" : "Generate Reports"} &rarr;
                </Link>
              </div>
            </article>

            {/* Card 6: Audit Trail Ledger */}
            <article className="border-2 border-[#475569] bg-[#F8FAFC] p-5 rounded-[4px] flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-full bg-[#475569] text-white flex items-center justify-center font-bold text-lg shadow-xs">
                    🔒
                  </div>
                  <span className="text-[10px] font-mono font-bold text-[#475569] bg-white px-2 py-0.5 border border-[#475569] rounded-[2px]">
                    IMMUTABLE LEDGER
                  </span>
                </div>
                <h3 className="text-base font-extrabold text-[#0F172A]">
                  {locale === "hi" ? "अपरिवर्तनीय ऑडिट ट्रेल लेजर" : "Tamper-Evident Audit Ledger"}
                </h3>
                <p className="text-xs font-bold text-[#475569] mt-0.5">
                  {locale === "hi" ? "कार्यकलाप एवं सुरक्षा लॉग" : "Comprehensive Activity & Transaction Log"}
                </p>
                <p className="text-xs text-[#334155] mt-2.5 leading-relaxed">
                  {locale === "hi"
                    ? "संस्थागत डेटा अपलोड, विसंगति फ्लैगिंग और प्रशासनिक परिवर्तनों का समय-मुद्रित, अपरिवर्तनीय डिजिटल रिकॉर्ड।"
                    : "Cryptographically verifiable timestamped audit log recording all admission entries, discrepancy resolutions, and security events."}
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-[#CBD5E1]">
                <Link
                  href="/audit"
                  className="w-full inline-flex items-center justify-center bg-[#475569] hover:bg-[#334155] text-white text-xs font-bold py-2.5 px-3 rounded-[2px] transition-colors shadow-xs"
                >
                  {locale === "hi" ? "ऑडिट लेजर देखें" : "View Audit Ledger"} &rarr;
                </Link>
              </div>
            </article>
          </div>
        </div>

        {/* CATEGORY 3: VERIFICATION SERVICES (Emerald Green Theme) */}
        <div>
          {/* Bold Pill Section Banner */}
          <div className="inline-flex items-center gap-2 bg-[#047857] text-white text-xs font-black uppercase tracking-wider px-4 py-1.5 rounded-t-[4px]">
            <span>🛡️</span>
            <span>{locale === "hi" ? "सत्यापन एवं नागरिक सेवाएँ (VERIFICATION SERVICES)" : "VERIFICATION SERVICES"}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 border-2 border-[#047857] bg-white p-5 rounded-b-[4px] rounded-tr-[4px] shadow-xs">
            {/* Card 7: DPDP Consent Verification */}
            <article className="border-2 border-[#059669] bg-[#ECFDF5] p-5 rounded-[4px] flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-full bg-[#059669] text-white flex items-center justify-center font-bold text-lg shadow-xs">
                    ✓
                  </div>
                  <span className="text-[10px] font-mono font-bold text-[#059669] bg-white px-2 py-0.5 border border-[#059669] rounded-[2px]">
                    DPDP ACT 2023
                  </span>
                </div>
                <h3 className="text-base font-extrabold text-[#064E3B]">
                  {locale === "hi" ? "सहमति-आधारित क्रेडेंशियल सत्यापन" : "Consent-Gated Verification"}
                </h3>
                <p className="text-xs font-bold text-[#059669] mt-0.5">
                  {locale === "hi" ? "उम्मीदवार डिजिटल सहमति प्राधिकरण" : "Candidate Digital Consent Authorization"}
                </p>
                <p className="text-xs text-[#334155] mt-2.5 leading-relaxed">
                  {locale === "hi"
                    ? "नियोक्ता एवं पृष्ठभूमि सत्यापन एजेंसियाँ उम्मीदवार की डिजिटल सहमति के उपरांत ही शैक्षणिक क्रेडेंशियल की सत्यता जाँच सकती हैं।"
                    : "Corporate recruiters and third-party verification agencies verify academic credentials subject to candidate digital consent authorization."}
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-[#A7F3D0]">
                <Link
                  href="/verify"
                  className="w-full inline-flex items-center justify-center bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold py-2.5 px-3 rounded-[2px] transition-colors shadow-xs"
                >
                  {locale === "hi" ? "क्रेडेंशियल सत्यापित करें" : "Verify Credential"} &rarr;
                </Link>
              </div>
            </article>

            {/* Card 8: Tamper-Evident QR Credential */}
            <article className="border-2 border-[#0D9488] bg-[#F0FDFA] p-5 rounded-[4px] flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-full bg-[#0D9488] text-white flex items-center justify-center font-bold text-lg shadow-xs">
                    📜
                  </div>
                  <span className="text-[10px] font-mono font-bold text-[#0D9488] bg-white px-2 py-0.5 border border-[#0D9488] rounded-[2px]">
                    SIGNED QR
                  </span>
                </div>
                <h3 className="text-base font-extrabold text-[#134E4A]">
                  {locale === "hi" ? "सत्यापन योग्य QR शैक्षणिक प्रमाणपत्र" : "Signed QR Academic Credential"}
                </h3>
                <p className="text-xs font-bold text-[#0D9488] mt-0.5">
                  {locale === "hi" ? "डिजिटल हस्ताक्षरित सत्यापन" : "Digitally Signed & Printable"}
                </p>
                <p className="text-xs text-[#334155] mt-2.5 leading-relaxed">
                  {locale === "hi"
                    ? "डिजिटल रीडर या मोबाइल कैमरे से तुरंत सत्यापन योग्य क्रिप्टोग्राफ़िक QR कोड युक्त आधिकारिक शैक्षणिक प्रमाणपत्र।"
                    : "Tamper-evident verifiable student admission credential with cryptographic payload validation and instant QR scanning."}
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-[#99F6E4]">
                <Link
                  href="/verify/certificate/stu-1"
                  className="w-full inline-flex items-center justify-center bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-bold py-2.5 px-3 rounded-[2px] transition-colors shadow-xs"
                >
                  {locale === "hi" ? "नमूना प्रमाणपत्र देखें" : "View Sample Certificate"} &rarr;
                </Link>
              </div>
            </article>

            {/* Card 9: Stakeholder Single Sign-On */}
            <article className="border-2 border-[#1E293B] bg-[#F1F5F9] p-5 rounded-[4px] flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-full bg-[#1E293B] text-white flex items-center justify-center font-bold text-lg shadow-xs">
                    🔑
                  </div>
                  <span className="text-[10px] font-mono font-bold text-[#1E293B] bg-white px-2 py-0.5 border border-[#1E293B] rounded-[2px]">
                    ROLE GATEWAY
                  </span>
                </div>
                <h3 className="text-base font-extrabold text-[#0F172A]">
                  {locale === "hi" ? "हितधारक लॉगिन गेटवे" : "Stakeholder Access Gateway"}
                </h3>
                <p className="text-xs font-bold text-[#475569] mt-0.5">
                  {locale === "hi" ? "भूमिका-आधारित प्रमाणीकरण" : "Role-Based Authentication"}
                </p>
                <p className="text-xs text-[#334155] mt-2.5 leading-relaxed">
                  {locale === "hi"
                    ? "AICTE प्रशासक, संस्थान कुलसचिव, गुणवत्ता ऑडिटर और नियोक्ता के लिए केंद्रीकृत भूमिका-आधारित लॉगिन।"
                    : "Unified role-based authentication portal providing institutional isolation and administrative rights governance."}
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-[#CBD5E1]">
                <Link
                  href="/login"
                  className="w-full inline-flex items-center justify-center bg-[#1E293B] hover:bg-[#0F172A] text-white text-xs font-bold py-2.5 px-3 rounded-[2px] transition-colors shadow-xs"
                >
                  {locale === "hi" ? "लॉगिन पोर्टल खोलें" : "Open Login Portal"} &rarr;
                </Link>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* 3. Architectural Pillars Section */}
      <section className="border border-[#CBD5E1] bg-white rounded-[4px] overflow-hidden shadow-xs">
        <div className="border-b border-[#CBD5E1] bg-[#102A43] text-white px-5 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
            <h2 className="text-xs font-bold uppercase tracking-wider">
              {locale === "hi"
                ? "SATYAPAN तकनीकी आधार एवं विनियामक स्तंभ"
                : "SATYAPAN Architectural Pillars & Engineering Framework"}
            </h2>
          </div>
          <span className="text-[11px] font-mono text-slate-300">Team PRAMAANIT</span>
        </div>

        <div className="grid grid-cols-1 divide-y divide-[#CBD5E1] sm:grid-cols-3 sm:divide-x sm:divide-y-0 bg-white">
          <div className="p-6">
            <div className="text-[11px] font-mono uppercase font-bold text-[#17365D] mb-1">
              {locale === "hi" ? "स्तंभ 1" : "Pillar 1"}
            </div>
            <h3 className="text-sm font-bold text-[#102A43]">
              {locale === "hi" ? "राष्ट्रीय नामांकन सत्यनिष्ठा" : "National Enrolment Integrity"}
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-[#475569]">
              {locale === "hi"
                ? "प्रत्येक छात्र प्रवेश को 12-अंकीय APAAR पहचानकर्ता से जोड़कर देशव्यापी स्तर पर डुप्लिकेट और फर्जी नामांकन को पूर्णतः समाप्त करना।"
                : "Cryptographic binding of student admissions with APAAR IDs, preventing phantom enrolments and multiple college registrations across states."}
            </p>
          </div>

          <div className="p-6">
            <div className="text-[11px] font-mono uppercase font-bold text-[#17365D] mb-1">
              {locale === "hi" ? "स्तंभ 2" : "Pillar 2"}
            </div>
            <h3 className="text-sm font-bold text-[#102A43]">
              {locale === "hi" ? "स्वीकृत सीट सीमा अनुपालन" : "Sanctioned Intake Adherence"}
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-[#475569]">
              {locale === "hi"
                ? "AICTE अप्रूवल प्रोसेस हैंडबुक (APH) के स्वीकृत सीट नियमों एवं अतिरिक्त कोटा सीमाओं (TFW/NRI) का स्वचालित डिजिटल सत्यापन।"
                : "Real-time mathematical validation against AICTE Sanctioned Intake ceilings, preventing unauthorized over-admissions."}
            </p>
          </div>

          <div className="p-6">
            <div className="text-[11px] font-mono uppercase font-bold text-[#17365D] mb-1">
              {locale === "hi" ? "स्तंभ 3" : "Pillar 3"}
            </div>
            <h3 className="text-sm font-bold text-[#102A43]">
              {locale === "hi" ? "DPDP अधिनियम 2023 गोपनीयता" : "DPDP Act 2023 Candidate Privacy"}
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-[#475569]">
              {locale === "hi"
                ? "डिजिटल व्यक्तिगत डेटा संरक्षण अधिनियम 2023 के तहत केवल उम्मीदवार की पूर्व डिजिटल सहमति से ही शैक्षणिक विवरणों का प्रकटीकरण।"
                : "Candidate-sovereign authorization token workflow, ensuring zero credential disclosure without explicit digital authorization."}
            </p>
          </div>
        </div>

        <div className="border-t border-[#CBD5E1] bg-[#F8FAFC] px-5 py-3 flex flex-wrap items-center justify-between text-xs text-[#475569]">
          <div>
            <strong>{locale === "hi" ? "परियोजना विनिर्देश:" : "Project Scope:"}</strong>{" "}
            {locale === "hi"
              ? "यह समाधान AICTE अनुमोदित संस्थानों, राज्य तकनीकी विश्वविद्यालयों और विनियामक परिषदों के लिए तैयार किया गया है।"
              : "Engineered for technical education institutions, state universities, and regulatory authorities across India."}
          </div>
          <div className="font-mono text-[10px] text-[#17365D] font-bold">
            PRAMAANIT · SATYAPAN-2026
          </div>
        </div>
      </section>
    </div>
  );
}
