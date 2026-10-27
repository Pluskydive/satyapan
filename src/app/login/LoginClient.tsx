"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useLanguage } from "@/components/LanguageProvider";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { AppRole } from "@/lib/authz";

interface Props {
  isDemo?: boolean;
}

function safeNextPath(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return "/";
  return value;
}

interface PortalRole {
  id: string;
  role: AppRole | "public_verifier";
  email: string;
  institutionId: string;
  titleEn: string;
  titleHi: string;
  orgEn: string;
  orgHi: string;
  scopeTagEn: string;
  scopeTagHi: string;
  descriptionEn: string;
  descriptionHi: string;
  allowedFeaturesEn: string[];
  allowedFeaturesHi: string[];
  restrictedFeaturesEn: string[];
  restrictedFeaturesHi: string[];
  destination: string;
  buttonLabelEn: string;
  buttonLabelHi: string;
}

export default function LoginClient({ isDemo = false }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { locale, t } = useLanguage();

  // Workflow step: "login" (credentials or phone OTP) or "role_select" (post-login role selection)
  const [step, setStep] = useState<"login" | "role_select">(isDemo ? "role_select" : "login");
  const [authenticatedUser, setAuthenticatedUser] = useState<{ identifier: string; method: "email" | "phone" } | null>(
    isDemo ? { identifier: "demo.official@satyapan.gov.in", method: "email" } : null
  );

  const [switchingPersona, setSwitchingPersona] = useState<string | null>(null);

  // Email & Password form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // Phone OTP form state
  const [authMethod, setAuthMethod] = useState<"password" | "otp">("password");
  const [countryCode, setCountryCode] = useState("+91");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpCooldown, setOtpCooldown] = useState(0);
  const [otpSuccessNotice, setOtpSuccessNotice] = useState("");

  const expiredLink = searchParams.get("authError") === "expired";
  const passwordChanged = searchParams.get("notice") === "password-updated";

  useEffect(() => {
    if (otpCooldown <= 0) return;
    const timer = setInterval(() => {
      setOtpCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [otpCooldown]);

  // 5 Clear Government Roles with permissions & restrictions explained in plain language
  const portalRoles: PortalRole[] = [
    {
      id: "aicte_admin",
      role: "platform_admin",
      email: "admin@satyapan.gov.in",
      institutionId: "",
      titleEn: "Central Administrator",
      titleHi: "केंद्रीय प्रशासक",
      orgEn: "Apex Technical Education Regulatory Authority",
      orgHi: "शीर्ष तकनीकी शिक्षा नियामक प्राधिकरण",
      scopeTagEn: "National Full Authority",
      scopeTagHi: "संपूर्ण राष्ट्रीय अधिकार",
      descriptionEn: "Apex authority for nationwide technical education oversight and quota reconciliation.",
      descriptionHi: "देश भर में तकनीकी शिक्षा की निगरानी और सीट कोटा समाधान हेतु शीर्ष प्रशासनिक अधिकार।",
      allowedFeaturesEn: [
        "National admission control tower & state summaries",
        "Cross-state duplicate admission review queue",
        "Institution directory & user account provisioning",
        "Tamper-evident system activity and audit logs",
      ],
      allowedFeaturesHi: [
        "राष्ट्रीय प्रवेश अवलोकन एवं राज्यवार सारांश",
        "अंतर-राज्य दोहरा नामांकन समीक्षा सूची",
        "संस्थान सूची एवं उपयोगकर्ता खाता प्रबंधन",
        "छेड़छाड़-रहित गतिविधि एवं ऑडिट लॉग",
      ],
      restrictedFeaturesEn: [
        "Cannot alter individual college admission records directly",
      ],
      restrictedFeaturesHi: [
        "कॉलेज के आंतरिक छात्र रिकॉर्ड में सीधे बदलाव नहीं कर सकते",
      ],
      destination: "/aicte",
      buttonLabelEn: "Launch Central Command",
      buttonLabelHi: "केंद्रीय डैशबोर्ड खोलें",
    },
    {
      id: "inst_registrar",
      role: "institution_admin",
      email: "registrar@college1001.edu.in",
      institutionId: "inst-1001",
      titleEn: "College Registrar",
      titleHi: "संस्थान कुलसचिव",
      orgEn: "Government Engineering College (Sample Inst. 1)",
      orgHi: "शासकीय इंजीनियरिंग कॉलेज (नमूना संस्थान 1)",
      scopeTagEn: "Institution-Scoped Control",
      scopeTagHi: "संस्थान-स्तरीय नियंत्रण",
      descriptionEn: "Complete institutional governance for managing approved seat quotas and admissions.",
      descriptionHi: "स्वीकृत सीट कोटा एवं प्रवेश प्रबंधन हेतु पूर्ण संस्थागत अधिकार।",
      allowedFeaturesEn: [
        "Institutional seat ledger & intake capacity tracking",
        "Bulk student CSV uploads with file security check",
        "Generate and manage college software API keys",
        "Review college-specific discrepancy flags",
      ],
      allowedFeaturesHi: [
        "संस्थागत सीट लेजर एवं प्रवेश क्षमता ट्रैकिंग",
        "फ़ाइल सुरक्षा जाँच के साथ थोक छात्र CSV अपलोड",
        "कॉलेज सॉफ्टवेयर API कुंजियाँ उत्पन्न एवं प्रबंधित करना",
        "संस्थान से संबंधित विसंगतियों की समीक्षा",
      ],
      restrictedFeaturesEn: [
        "No access to other colleges' records or national audit logs",
      ],
      restrictedFeaturesHi: [
        "अन्य कॉलेजों के रिकॉर्ड या राष्ट्रीय ऑडिट लॉग तक पहुँच नहीं",
      ],
      destination: "/institution",
      buttonLabelEn: "Access College Seat Ledger",
      buttonLabelHi: "कॉलेज सीट लेजर खोलें",
    },
    {
      id: "inst_staff",
      role: "institution_staff",
      email: "staff@college1001.edu.in",
      institutionId: "inst-1001",
      titleEn: "College Staff (Admission Desk)",
      titleHi: "संस्थान प्रवेश कर्मचारी",
      orgEn: "Government Engineering College (Sample Inst. 1)",
      orgHi: "शासकीय इंजीनियरिंग कॉलेज (नमूना संस्थान 1)",
      scopeTagEn: "Admission Batch Desk",
      scopeTagHi: "प्रवेश पटल कार्य",
      descriptionEn: "Operational staff authorized to upload and verify student admission batches.",
      descriptionHi: "छात्र प्रवेश सूची अपलोड एवं सत्यापित करने हेतु अधिकृत कर्मचारी।",
      allowedFeaturesEn: [
        "Upload new student admission batches in CSV format",
        "View student rosters and verify APAAR ID formatting",
        "Inspect college seat utilization status",
      ],
      allowedFeaturesHi: [
        "CSV प्रारूप में नए छात्र प्रवेश बैच अपलोड करना",
        "छात्र सूची देखना और APAAR आईडी प्रारूप जाँचना",
        "कॉलेज सीट उपयोग स्थिति देखना",
      ],
      restrictedFeaturesEn: [
        "Cannot create college API keys or modify sanctioned intake quotas",
      ],
      restrictedFeaturesHi: [
        "कॉलेज API कुंजियाँ नहीं बना सकते या स्वीकृत कोटा नहीं बदल सकते",
      ],
      destination: "/institution/upload",
      buttonLabelEn: "Open Admission Upload Portal",
      buttonLabelHi: "प्रवेश अपलोड पोर्टल खोलें",
    },
    {
      id: "naac_auditor",
      role: "reviewer",
      email: "auditor@naac.gov.in",
      institutionId: "",
      titleEn: "Reviewer & Compliance Auditor",
      titleHi: "लेखापरीक्षक एवं अनुपालन समीक्षक",
      orgEn: "Quality Assurance & Accreditation Authority",
      orgHi: "गुणवत्ता आश्वासन एवं प्रत्यायन प्राधिकरण",
      scopeTagEn: "Read-Only Compliance",
      scopeTagHi: "केवल-पठन अनुपालन",
      descriptionEn: "Independent inspection of intake adherence, NIRF ranking data, and discrepancy records.",
      descriptionHi: "प्रवेश सीमा पालन, NIRF रैंकिंग डेटा और विसंगतियों की स्वतंत्र समीक्षा।",
      allowedFeaturesEn: [
        "Read-only access to national and state intake reports",
        "Inspect discrepancy dossiers and resolution history",
        "Export verified summaries for accreditation reviews",
        "View tamper-evident system activity history",
      ],
      allowedFeaturesHi: [
        "राष्ट्रीय एवं राज्य प्रवेश रिपोर्ट तक केवल-पठन पहुँच",
        "विसंगति डोजियर एवं समाधान इतिहास का निरीक्षण",
        "प्रत्यायन समीक्षा हेतु सत्यापित सारांश निर्यात करना",
        "सिस्टम गतिविधि इतिहास देखना",
      ],
      restrictedFeaturesEn: [
        "Strictly read-only: Cannot add, edit, or delete any records",
      ],
      restrictedFeaturesHi: [
        "पूर्णतः केवल-पठन: कोई भी रिकॉर्ड जोड़, बदल या हटा नहीं सकते",
      ],
      destination: "/aicte/reports",
      buttonLabelEn: "Open Compliance Reports",
      buttonLabelHi: "अनुपालन रिपोर्ट खोलें",
    },
    {
      id: "employer_verifier",
      role: "public_verifier",
      email: "verifier@company.org",
      institutionId: "",
      titleEn: "Public & Employer Verifier",
      titleHi: "सार्वजनिक एवं नियोक्ता सत्यापनकर्ता",
      orgEn: "Corporate Recruiter / Verification Agency / Public",
      orgHi: "कॉर्पोरेट भर्तीकर्ता / सत्यापन एजेंसी / सामान्य नागरिक",
      scopeTagEn: "Consent-Gated Verification",
      scopeTagHi: "सहमति-आधारित सत्यापन",
      descriptionEn: "External verification gateway for authenticating degree credentials with candidate consent.",
      descriptionHi: "उम्मीदवार की सहमति से डिग्री क्रेडेंशियल की पुष्टि हेतु सार्वजनिक गेटवे।",
      allowedFeaturesEn: [
        "Verify student technical admissions using unique token or QR code",
        "Validate cryptographically signed credentials",
        "Inspect verified institution and program details",
      ],
      allowedFeaturesHi: [
        "विशिष्ट टोकन या क्यूआर कोड से छात्र प्रवेश सत्यापित करना",
        "हस्ताक्षरित डिजिटल क्रेडेंशियल की प्रामाणिकता जाँचना",
        "सत्यापित संस्थान एवं पाठ्यक्रम विवरण देखना",
      ],
      restrictedFeaturesEn: [
        "No access to student rosters, seat ledgers, or administration dashboards",
      ],
      restrictedFeaturesHi: [
        "छात्र सूची, सीट लेजर या प्रशासनिक डैशबोर्ड तक कोई पहुँच नहीं",
      ],
      destination: "/verify",
      buttonLabelEn: "Open Verification Gateway",
      buttonLabelHi: "सत्यापन गेटवे खोलें",
    },
  ];

  async function handleRoleSelect(roleItem: PortalRole) {
    setSwitchingPersona(roleItem.id);
    setError("");
    try {
      const res = await fetch("/api/auth/demo-persona", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: roleItem.role,
          email: roleItem.email,
          institution_id: roleItem.institutionId,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to switch role");
      }

      const nextTarget = safeNextPath(searchParams.get("next"));
      const destination = nextTarget !== "/" ? nextTarget : roleItem.destination;

      router.replace(destination);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Role selection failed");
      setSwitchingPersona(null);
    }
  }

  async function submitLiveCredentials(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const normalizedEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail) || !password) {
      setError(t("Email or password was not accepted. Check your details and try again."));
      return;
    }

    // In demo mode or live mode with multi-role switch:
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      setAuthenticatedUser({ identifier: normalizedEmail, method: "email" });
      setStep("role_select");
    }, 400);
  }

  async function handleSendOtp(event?: React.FormEvent) {
    if (event) event.preventDefault();
    setError("");
    setOtpSuccessNotice("");

    const cleanPhone = phoneNumber.replace(/\D/g, "");
    if (countryCode === "+91" && !/^[6-9]\d{9}$/.test(cleanPhone)) {
      setError(locale === "hi" ? "अमान्य मोबाइल नंबर। कृपया मान्य 10 अंकों का नंबर दर्ज करें।" : "Invalid mobile number. Enter a valid 10-digit number.");
      return;
    } else if (cleanPhone.length < 6 || cleanPhone.length > 15) {
      setError(locale === "hi" ? "अमान्य मोबाइल नंबर। कृपया मान्य नंबर दर्ज करें।" : "Invalid mobile number. Enter a valid mobile number.");
      return;
    }

    setBusy(true);
    const fullPhone = `${countryCode} ${cleanPhone}`;

    if (isDemo) {
      setTimeout(() => {
        setBusy(false);
        setOtpSent(true);
        setOtpCooldown(60);
        setOtpSuccessNotice(
          locale === "hi"
            ? `${fullPhone} पर एकमुश्त पासवर्ड (OTP) भेजा गया। परीक्षण हेतु 123456 दर्ज करें।`
            : `Verification OTP sent to ${fullPhone}. For demo testing, use code 123456.`
        );
      }, 400);
      return;
    }

    try {
      const supabase = createSupabaseBrowserClient();
      const { error: otpError } = await supabase.auth.signInWithOtp({
        phone: `${countryCode}${cleanPhone}`,
      });

      if (otpError) {
        if (
          otpError.message.toLowerCase().includes("provider") ||
          otpError.message.toLowerCase().includes("not enabled") ||
          otpError.message.toLowerCase().includes("unsupported")
        ) {
          setError(
            t("SMS authentication requires an active SMS provider in Supabase settings. Please sign in using your email and password.")
          );
        } else {
          setError(otpError.message || t("Could not send OTP. Please check your phone number and try again."));
        }
        return;
      }

      setOtpSent(true);
      setOtpCooldown(60);
      setOtpSuccessNotice(t("OTP has been sent via SMS to your mobile number."));
    } catch {
      setError(t("This service is not configured for phone sign-in yet."));
    } finally {
      setBusy(false);
    }
  }

  async function handleVerifyOtp(event: React.FormEvent) {
    event.preventDefault();
    setError("");

    const cleanOtp = otpCode.replace(/\D/g, "");
    if (cleanOtp.length !== 6) {
      setError(locale === "hi" ? "अमान्य OTP कोड। कृपया 6 अंकों का कोड दर्ज करें।" : "Invalid OTP code. Please enter a 6-digit code.");
      return;
    }

    setBusy(true);
    const cleanPhone = phoneNumber.replace(/\D/g, "");
    const fullPhone = `${countryCode} ${cleanPhone}`;

    setTimeout(() => {
      setBusy(false);
      setAuthenticatedUser({ identifier: fullPhone, method: "phone" });
      setStep("role_select");
    }, 400);
  }

  return (
    <section className="max-w-5xl mx-auto px-4 py-4 sm:py-6 space-y-4">
      {/* Maharashtra.gov.in Official Breadcrumb */}
      <div className="bg-[#EAEFF5] border border-[#CBD5E1] px-4 py-1.5 rounded-[2px] text-xs text-[#334155] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-[11px]">
          <Link href="/" className="text-[#205081] font-semibold hover:underline">
            मुख्य पृष्ठ / Home
          </Link>
          <span className="text-[#94A3B8]">&gt;</span>
          <span className="text-[#205081] font-semibold">
            एकात्मिक सेवा पोर्टल / Integrated Services
          </span>
          <span className="text-[#94A3B8]">&gt;</span>
          <span className="text-[#102A43] font-bold">
            शासकीय लॉगिन / Official SSO Portal
          </span>
        </div>
        <div className="hidden sm:block text-[10px] font-mono text-[#64748B]">
          आपले सरकार / MahaOnline SSO Compliant
        </div>
      </div>

      {/* STEP 1: CREDENTIAL / PHONE LOGIN */}
      {step === "login" && (
        <div className="bg-white border-l-4 border-l-[#FF9933] border-y border-r border-[#CBD5E1] p-5 sm:p-6 rounded-[2px] shadow-xs">
          <div className="border-b border-[#CBD5E1] pb-4">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#205081]">
              महाराष्ट्र शासन • तंत्रशिक्षण संचालनालय • Unified Single Sign-On (SSO)
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-[#102A43] mt-1">
              {locale === "hi" ? "अधिकारी व नागरिक प्रवेशद्वार / Official Sign-In" : "Official Portal Sign-In"}
            </h1>
            <p className="text-xs sm:text-sm text-[#64748B] mt-1 leading-relaxed">
              {locale === "hi"
                ? "संस्थागत जागा लेजर, केंद्रीय नियंत्रण कक्ष किंवा नागरिक सेवेत प्रवेश करण्यासाठी आपले नोंदणीकृत तपशील प्रविष्ट करा."
                : "Sign in with your registered email or mobile number to access your designated workspace."}
            </p>
          </div>

          {expiredLink && (
            <p role="status" className="mt-4 border-l-4 border-l-[#D97706] bg-[#FFFBEB] p-3 text-xs text-[#92400E] border-y border-r border-[#FEDF89] rounded-[2px]">
              {t("This sign-in link is invalid or has expired. Request a new password reset link.")}
            </p>
          )}
          {passwordChanged && (
            <p role="status" className="mt-4 border-l-4 border-l-[#059669] bg-[#ECFDF5] p-3 text-xs text-[#065F46] border-y border-r border-[#A7F3D0] rounded-[2px]">
              {t("Your password was updated. Sign in again with the new password.")}
            </p>
          )}

          {/* Quick tab switch to direct roles if in demo mode */}
          {isDemo && (
            <div className="mt-4 p-3 bg-[#F4F6F9] border border-[#CBD5E1] rounded-[2px] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <span className="text-[#334155]">
                <strong>{locale === "hi" ? "थेट चाचणी पर्याय / Direct Access:" : "Demonstration Access:"}</strong>{" "}
                {locale === "hi"
                  ? "आपण थेट पद व कार्यक्षेत्र निवडून पोर्टलचे अवलोकन करू शकता."
                  : "You can skip entering credentials and browse by role directly."}
              </span>
              <button
                type="button"
                onClick={() => setStep("role_select")}
                className="text-[#205081] font-bold hover:underline self-start sm:self-auto cursor-pointer"
              >
                {locale === "hi" ? "थेट पद निवडा / Select Role →" : "Direct Role Selection →"}
              </button>
            </div>
          )}

          <div className="mt-6 max-w-md mx-auto">
            {/* Sub-tabs: Email & Password vs Phone & OTP */}
            <div className="flex border-b border-[#CBD5E1] mb-5">
              <button
                type="button"
                onClick={() => {
                  setAuthMethod("password");
                  setError("");
                  setOtpSuccessNotice("");
                }}
                className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider text-center border-b-2 transition-colors cursor-pointer ${
                  authMethod === "password"
                    ? "border-[#205081] text-[#205081] bg-[#EAEFF5]"
                    : "border-transparent text-[#64748B] hover:text-[#205081]"
                }`}
              >
                {locale === "hi" ? "ईमेल व पासवर्ड" : "Email & Password"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMethod("otp");
                  setError("");
                  setOtpSuccessNotice("");
                }}
                className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider text-center border-b-2 transition-colors cursor-pointer ${
                  authMethod === "otp"
                    ? "border-[#205081] text-[#205081] bg-[#EAEFF5]"
                    : "border-transparent text-[#64748B] hover:text-[#205081]"
                }`}
              >
                {locale === "hi" ? "मोबाईल ओटीपी (SMS OTP)" : "Mobile Number (SMS OTP)"}
              </button>
            </div>

            {/* Error & Success Notices */}
            {error && (
              <p id="login-error" role="alert" className="mb-4 border-l-4 border-l-[#B42318] bg-[#FEF2F2] p-3 text-xs text-[#B42318] border-y border-r border-[#FECDCA] rounded-[2px]">
                {error}
              </p>
            )}
            {otpSuccessNotice && (
              <p role="status" className="mb-4 border-l-4 border-l-[#059669] bg-[#ECFDF5] p-3 text-xs font-medium text-[#065F46] border-y border-r border-[#A7F3D0] rounded-[2px]">
                {otpSuccessNotice}
              </p>
            )}

            {/* FORM 1: EMAIL & PASSWORD */}
            {authMethod === "password" && (
              <form onSubmit={submitLiveCredentials} className="space-y-4" aria-busy={busy}>
                <div>
                  <label htmlFor="login-email" className="block text-xs font-bold text-[#102A43] mb-1">
                    {locale === "hi" ? "अधिकृत ईमेल पत्ता / Official Email" : "Official Work Email"}
                  </label>
                  <input
                    id="login-email"
                    type="email"
                    autoComplete="username"
                    inputMode="email"
                    required
                    placeholder="name@institution.edu.in"
                    maxLength={254}
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="w-full px-3 py-2 border border-[#CBD5E1] bg-white text-[#102A43] text-xs rounded-[2px] focus:outline-none focus:border-[#205081]"
                  />
                </div>

                <div>
                  <label htmlFor="login-password" className="block text-xs font-bold text-[#102A43] mb-1">
                    {locale === "hi" ? "पासवर्ड / Password" : "Password"}
                  </label>
                  <div className="flex">
                    <input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className="w-full min-w-0 px-3 py-2 border border-[#CBD5E1] bg-white text-[#102A43] text-xs rounded-l-[2px] focus:outline-none focus:border-[#205081]"
                    />
                    <button
                      type="button"
                      className="border border-l-0 border-[#CBD5E1] px-3 text-xs font-bold text-[#205081] bg-[#F4F6F9] hover:bg-[#EAEFF5] rounded-r-[2px] cursor-pointer"
                      onClick={() => setShowPassword((value) => !value)}
                    >
                      {showPassword ? (locale === "hi" ? "लपवा" : "Hide") : (locale === "hi" ? "पहा" : "Show")}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={busy}
                  className="w-full bg-[#205081] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#112D4E] disabled:opacity-60 rounded-[2px] transition-colors cursor-pointer shadow-xs"
                >
                  {busy ? (locale === "hi" ? "तपासणी सुरू आहे…" : "Verifying…") : (locale === "hi" ? "प्रवेश करा व पद निवडा / Sign In →" : "Sign In & Choose Role →")}
                </button>

                <div className="mt-3 flex items-center justify-between text-xs text-[#64748B]">
                  <a className="font-bold text-[#205081] hover:underline" href="/forgot-password">
                    {locale === "hi" ? "पासवर्ड विसरलात?" : "Forgot password?"}
                  </a>
                  <button
                    type="button"
                    onClick={() => { setAuthMethod("otp"); setError(""); setOtpSuccessNotice(""); }}
                    className="text-[#205081] font-bold hover:underline"
                  >
                    {locale === "hi" ? "मोबाईल OTP द्वारे प्रवेश" : "Use Phone & OTP"} &rarr;
                  </button>
                </div>
              </form>
            )}

            {/* FORM 2: MOBILE NUMBER + OTP */}
            {authMethod === "otp" && (
              <div className="space-y-4">
                {!otpSent ? (
                  <form onSubmit={handleSendOtp} className="space-y-4" aria-busy={busy}>
                    <div>
                      <label htmlFor="login-phone" className="block text-xs font-bold text-[#102A43] mb-1">
                        {locale === "hi" ? "नोंदणीकृत मोबाईल नंबर / Registered Mobile" : "Registered Mobile Number"}
                      </label>
                      <div className="flex">
                        <select
                          value={countryCode}
                          onChange={(e) => setCountryCode(e.target.value)}
                          aria-label="Country Code"
                          className="px-2.5 py-2 border border-r-0 border-[#CBD5E1] bg-[#F4F6F9] text-xs font-bold text-[#102A43] rounded-l-[2px]"
                        >
                          <option value="+91">+91 (India)</option>
                          <option value="+1">+1 (USA/Canada)</option>
                          <option value="+44">+44 (UK)</option>
                          <option value="+971">+971 (UAE)</option>
                          <option value="+65">+65 (Singapore)</option>
                          <option value="+61">+61 (Australia)</option>
                        </select>
                        <input
                          id="login-phone"
                          type="tel"
                          inputMode="numeric"
                          autoComplete="tel"
                          required
                          placeholder={countryCode === "+91" ? "98765 43210" : "Mobile number"}
                          maxLength={15}
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value.replace(/[^\d\s]/g, ""))}
                          className="w-full min-w-0 px-3 py-2 border border-[#CBD5E1] bg-white text-[#102A43] text-xs rounded-r-[2px] font-mono focus:outline-none focus:border-[#205081]"
                        />
                      </div>
                      <p className="mt-1 text-[11px] text-[#64748B]">
                        {countryCode === "+91"
                          ? (locale === "hi" ? "आपला १० अंकी नोंदणीकृत मोबाईल नंबर टाका." : "Enter your registered 10-digit mobile number.")
                          : "Include your international mobile number without leading zeros."}
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={busy || !phoneNumber.trim()}
                      className="w-full bg-[#205081] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#112D4E] disabled:opacity-60 rounded-[2px] transition-colors cursor-pointer shadow-xs"
                    >
                      {busy ? (locale === "hi" ? "OTP पाठवत आहे…" : "Sending OTP…") : (locale === "hi" ? "OTP पाठवा / Send OTP →" : "Send OTP →")}
                    </button>

                    <div className="mt-3 flex items-center justify-between text-xs text-[#64748B]">
                      <button
                        type="button"
                        onClick={() => { setAuthMethod("password"); setError(""); setOtpSuccessNotice(""); }}
                        className="text-[#205081] font-bold hover:underline"
                      >
                        &larr; {locale === "hi" ? "पासवर्ड लॉगिन वापरा" : "Use Password Login"}
                      </button>
                      <span className="text-[11px]">१० मिनिटांसाठी वैध / Valid for 10 min</span>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOtp} className="space-y-4" aria-busy={busy}>
                    <div className="bg-[#F4F6F9] border border-[#CBD5E1] p-3 rounded-[2px] text-xs text-[#334155] flex items-center justify-between">
                      <div>
                        <div className="font-bold text-[#102A43]">{countryCode} {phoneNumber}</div>
                        <div className="text-[11px] text-[#64748B]">SMS OTP पाठवला आहे</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => { setOtpSent(false); setOtpCode(""); setError(""); setOtpSuccessNotice(""); }}
                        className="text-xs font-bold text-[#205081] hover:underline cursor-pointer"
                      >
                        बदला / Change
                      </button>
                    </div>

                    <div>
                      <label htmlFor="login-otp" className="block text-xs font-bold text-[#102A43] mb-1">
                        {locale === "hi" ? "६ अंकी OTP प्रविष्ट करा" : "Enter 6-digit OTP code"}
                      </label>
                      <input
                        id="login-otp"
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        autoComplete="one-time-code"
                        required
                        maxLength={6}
                        autoFocus
                        placeholder="••••••"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        className="w-full px-3 py-2 border-2 border-[#205081] bg-white text-[#102A43] text-lg font-mono tracking-widest text-center rounded-[2px] focus:outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={busy || otpCode.length !== 6}
                      className="w-full bg-[#205081] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#112D4E] disabled:opacity-60 rounded-[2px] transition-colors cursor-pointer shadow-xs"
                    >
                      {busy ? (locale === "hi" ? "पडताळणी सुरू आहे…" : "Verifying…") : (locale === "hi" ? "सत्यापित करा व पद निवडा / Verify →" : "Verify & Choose Role →")}
                    </button>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <button
                        type="button"
                        onClick={() => { setAuthMethod("password"); setError(""); setOtpSuccessNotice(""); }}
                        className="text-[#205081] font-bold hover:underline cursor-pointer"
                      >
                        &larr; {locale === "hi" ? "पासवर्ड वापरा" : "Use Password"}
                      </button>

                      {otpCooldown > 0 ? (
                        <span className="text-[#64748B] font-mono text-[11px]">
                          Resend in {otpCooldown}s
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSendOtp()}
                          className="font-bold text-[#FF9933] hover:underline cursor-pointer"
                        >
                          {locale === "hi" ? "OTP पुन्हा पाठवा" : "Resend OTP"}
                        </button>
                      )}
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* STEP 2: POST-LOGIN ROLE SELECTION (RBAC SCREEN) */}
      {step === "role_select" && (
        <div className="space-y-4">
          {/* Identity Header Banner */}
          <div className="bg-white border-l-4 border-l-[#FF9933] border-y border-r border-[#CBD5E1] p-4 sm:p-5 rounded-[2px] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#059669] bg-[#ECFDF5] border border-[#A7F3D0] px-2 py-0.5 rounded-[2px]">
                  {locale === "hi" ? "प्रमाणीकृत सत्र" : "Authenticated Session"}
                </span>
                {authenticatedUser && (
                  <span className="text-xs font-mono font-bold text-[#205081]">
                    {authenticatedUser.identifier}
                  </span>
                )}
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#102A43] mt-1.5">
                {locale === "hi" ? "आपले अधिकृत पद व कार्यक्षेत्र निवडा" : "Select Your Official Portal Role"}
              </h1>
              <p className="text-xs sm:text-sm text-[#64748B] mt-0.5 max-w-2xl leading-relaxed">
                {locale === "hi"
                  ? "आपल्या पदानुसार योग्य भूमिका निवडा. शासकीय नियमांनुसार प्रत्येक भूमिकेला केवळ अधिकृत सेवांचा अधिकार देण्यात आला आहे."
                  : "Choose the role matching your authorized duties. Access to portal modules, student records, and reports is strictly determined by this selection."}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setStep("login");
                setAuthenticatedUser(null);
                setOtpSent(false);
                setOtpCode("");
              }}
              className="px-3 py-1.5 border border-[#205081] text-xs font-bold text-[#205081] hover:bg-[#F4F6F9] rounded-[2px] transition-colors self-start md:self-auto cursor-pointer"
            >
              {locale === "hi" ? "खाते बदला / बाहेर पडा" : "Change Account / Sign Out"}
            </button>
          </div>

          {error && (
            <p role="alert" className="border-l-4 border-l-[#B42318] bg-[#FEF2F2] p-3 text-xs text-[#B42318] border-y border-r border-[#FECDCA] rounded-[2px]">
              {error}
            </p>
          )}

          {/* 5 Distinct Official Role Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {portalRoles.map((roleItem) => {
              const isSelected = switchingPersona === roleItem.id;
              return (
                <div
                  key={roleItem.id}
                  className="bg-white border border-[#CBD5E1] border-t-4 border-t-[#205081] rounded-[2px] p-4 sm:p-5 flex flex-col justify-between shadow-xs hover:border-[#205081] transition-colors"
                >
                  <div className="space-y-3">
                    {/* Header Tag & Role Title */}
                    <div className="flex items-center justify-between gap-2 border-b border-[#CBD5E1] pb-2">
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 bg-[#EAEFF5] border border-[#CBD5E1] text-[#205081] font-bold rounded-[2px]">
                        {locale === "hi" ? roleItem.scopeTagHi : roleItem.scopeTagEn}
                      </span>
                      <span className="text-[11px] font-mono text-[#64748B]">{roleItem.email}</span>
                    </div>

                    <div>
                      <h2 className="text-base font-bold text-[#102A43]">
                        {locale === "hi" ? roleItem.titleHi : roleItem.titleEn}
                      </h2>
                      <div className="text-xs font-bold text-[#205081] mt-0.5">
                        {locale === "hi" ? roleItem.orgHi : roleItem.orgEn}
                      </div>
                      <p className="text-xs text-[#334155] mt-1.5 leading-relaxed">
                        {locale === "hi" ? roleItem.descriptionHi : roleItem.descriptionEn}
                      </p>
                    </div>

                    {/* Permissions: Allowed vs Restricted */}
                    <div className="pt-2 space-y-2 border-t border-[#CBD5E1] text-[11px]">
                      <div>
                        <span className="font-bold text-[#059669] uppercase text-[10px] tracking-wider block mb-1">
                          {locale === "hi" ? "अनुमत अधिकार (Permitted Features):" : "Permitted Features:"}
                        </span>
                        <ul className="space-y-1 text-[#334155]">
                          {(locale === "hi" ? roleItem.allowedFeaturesHi : roleItem.allowedFeaturesEn).map((feat, idx) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              <span className="text-[#059669] font-bold">&bull;</span>
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="pt-1">
                        <span className="font-bold text-[#B42318] uppercase text-[10px] tracking-wider block mb-1">
                          {locale === "hi" ? "प्रतिबंधित क्षेत्र (Restricted):" : "Restricted Areas:"}
                        </span>
                        <ul className="space-y-1 text-[#64748B]">
                          {(locale === "hi" ? roleItem.restrictedFeaturesHi : roleItem.restrictedFeaturesEn).map((res, idx) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              <span className="text-[#B42318] font-bold">&times;</span>
                              <span>{res}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Role Entry Action Button */}
                  <div className="pt-4 mt-4 border-t border-[#CBD5E1]">
                    <button
                      type="button"
                      disabled={Boolean(switchingPersona)}
                      onClick={() => handleRoleSelect(roleItem)}
                      className="w-full py-2 px-3 bg-[#205081] hover:bg-[#112D4E] text-white text-xs font-bold rounded-[2px] transition-colors cursor-pointer disabled:opacity-50 text-center shadow-xs"
                    >
                      {isSelected
                        ? (locale === "hi" ? "सत्र सुरू होत आहे…" : "Starting Session…")
                        : `${locale === "hi" ? roleItem.buttonLabelHi : roleItem.buttonLabelEn} →`}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer Info Notice */}
      <div className="text-xs text-[#64748B] border-t border-[#CBD5E1] pt-3 flex flex-col sm:flex-row justify-between gap-2">
        <span>{t("Accounts are issued by an authorized platform administrator. Never share administrative credentials.")}</span>
        <span className="font-mono text-[11px] text-[#205081] font-bold">सत्यापन २०२६-२७ · महाराष्ट्र शासन</span>
      </div>
    </section>
  );
}
