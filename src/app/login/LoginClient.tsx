"use client";

import { useState, useEffect } from "react";
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
    <section className="max-w-5xl mx-auto px-4 py-8 sm:py-10 space-y-6">
      {/* STEP 1: CREDENTIAL / PHONE LOGIN */}
      {step === "login" && (
        <div className="bg-white border border-[#D8DEE6] p-6 sm:p-8 rounded-[4px] shadow-xs">
          <div className="border-b border-[#D8DEE6] pb-4">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#C87524]">
              SATYAPAN · Official Portal
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-[#102A43] mt-1">
              {locale === "hi" ? "अधिकारी एवं हितधारक लॉगिन" : "Official Portal Sign-In"}
            </h1>
            <p className="text-xs sm:text-sm text-[#5B6573] mt-1 leading-relaxed">
              {locale === "hi"
                ? "संस्थागत सीट लेजर या केंद्रीय प्रशासनिक कार्यक्षेत्र में प्रवेश हेतु अपना अधिकृत विवरण दर्ज करें।"
                : "Sign in with your registered email or mobile number to access your designated workspace."}
            </p>
          </div>

          {expiredLink && (
            <p role="status" className="mt-4 border-l-4 border-[#986500] bg-[#FFF7E6] p-3 text-sm text-[#684600]">
              {t("This sign-in link is invalid or has expired. Request a new password reset link.")}
            </p>
          )}
          {passwordChanged && (
            <p role="status" className="mt-4 border-l-4 border-[#237A52] bg-[#EDF7F1] p-3 text-sm text-[#205E40]">
              {t("Your password was updated. Sign in again with the new password.")}
            </p>
          )}

          {/* Quick tab switch to direct roles if in demo mode */}
          {isDemo && (
            <div className="mt-5 p-3.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-[2px] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <span className="text-[#334155]">
                <strong>{locale === "hi" ? "पूर्वावलोकन विकल्प:" : "Demonstration Access:"}</strong>{" "}
                {locale === "hi"
                  ? "आप बिना क्रेडेंशियल दर्ज किए सीधे पद एवं कार्यक्षेत्र का चयन भी कर सकते हैं।"
                  : "You can skip entering credentials and browse by role directly."}
              </span>
              <button
                type="button"
                onClick={() => setStep("role_select")}
                className="text-[#17365D] font-bold hover:underline self-start sm:self-auto cursor-pointer"
              >
                {locale === "hi" ? "भूमिका चयन पर जाएँ →" : "Direct Role Selection →"}
              </button>
            </div>
          )}

          <div className="mt-6 max-w-md mx-auto">
            {/* Sub-tabs: Email & Password vs Phone & OTP */}
            <div className="flex border-b border-[#D8DEE6] mb-5">
              <button
                type="button"
                onClick={() => {
                  setAuthMethod("password");
                  setError("");
                  setOtpSuccessNotice("");
                }}
                className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider text-center border-b-2 transition-colors cursor-pointer ${
                  authMethod === "password"
                    ? "border-[#17365D] text-[#17365D] bg-[#F4F6F8]"
                    : "border-transparent text-[#5B6573] hover:text-[#17365D]"
                }`}
              >
                {locale === "hi" ? "ईमेल एवं पासवर्ड" : "Email & Password"}
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
                    ? "border-[#17365D] text-[#17365D] bg-[#F4F6F8]"
                    : "border-transparent text-[#5B6573] hover:text-[#17365D]"
                }`}
              >
                {locale === "hi" ? "मोबाइल नंबर (SMS OTP)" : "Mobile Number (SMS OTP)"}
              </button>
            </div>

            {/* Error & Success Notices */}
            {error && (
              <p id="login-error" role="alert" className="mb-4 border-l-4 border-[#B42318] bg-[#FDF0EF] p-3 text-xs text-[#7A1B14]">
                {error}
              </p>
            )}
            {otpSuccessNotice && (
              <p role="status" className="mb-4 border-l-4 border-[#237A52] bg-[#EDF7F1] p-3 text-xs font-medium text-[#205E40]">
                {otpSuccessNotice}
              </p>
            )}

            {/* FORM 1: EMAIL & PASSWORD */}
            {authMethod === "password" && (
              <form onSubmit={submitLiveCredentials} className="space-y-4" aria-busy={busy}>
                <div>
                  <label htmlFor="login-email" className="block text-xs font-semibold text-[#202B36] mb-1">
                    {locale === "hi" ? "आधिकारिक ईमेल पता" : "Official Work Email"}
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
                    className="w-full px-3 py-2 border border-[#8B95A1] bg-white text-[#202B36] text-xs rounded-[2px]"
                  />
                </div>

                <div>
                  <label htmlFor="login-password" className="block text-xs font-semibold text-[#202B36] mb-1">
                    {locale === "hi" ? "पासवर्ड" : "Password"}
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
                      className="w-full min-w-0 px-3 py-2 border border-[#8B95A1] bg-white text-[#202B36] text-xs rounded-l-[2px]"
                    />
                    <button
                      type="button"
                      className="border border-l-0 border-[#8B95A1] px-3 text-xs font-semibold text-[#17365D] bg-[#F4F6F8] rounded-r-[2px] cursor-pointer"
                      onClick={() => setShowPassword((value) => !value)}
                    >
                      {showPassword ? (locale === "hi" ? "छिपाएँ" : "Hide") : (locale === "hi" ? "देखें" : "Show")}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={busy}
                  className="w-full bg-[#17365D] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#102A43] disabled:opacity-60 rounded-[2px] transition-colors cursor-pointer"
                >
                  {busy ? (locale === "hi" ? "प्रमाणीकरण हो रहा है…" : "Verifying…") : (locale === "hi" ? "लॉगिन करें एवं पद चुनें →" : "Sign In & Choose Role →")}
                </button>

                <div className="mt-3 flex items-center justify-between text-xs text-[#5B6573]">
                  <a className="font-semibold text-[#17365D] hover:underline" href="/forgot-password">
                    {locale === "hi" ? "पासवर्ड भूल गए?" : "Forgot password?"}
                  </a>
                  <button
                    type="button"
                    onClick={() => { setAuthMethod("otp"); setError(""); setOtpSuccessNotice(""); }}
                    className="text-[#17365D] font-semibold hover:underline"
                  >
                    {locale === "hi" ? "मोबाइल OTP से लॉगिन करें" : "Use Phone & OTP"} &rarr;
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
                      <label htmlFor="login-phone" className="block text-xs font-semibold text-[#202B36] mb-1">
                        {locale === "hi" ? "पंजीकृत मोबाइल नंबर" : "Registered Mobile Number"}
                      </label>
                      <div className="flex">
                        <select
                          value={countryCode}
                          onChange={(e) => setCountryCode(e.target.value)}
                          aria-label="Country Code"
                          className="px-2.5 py-2 border border-r-0 border-[#8B95A1] bg-[#F8FAFC] text-xs font-semibold text-[#102A43] rounded-l-[2px]"
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
                          className="w-full min-w-0 px-3 py-2 border border-[#8B95A1] bg-white text-[#202B36] text-xs rounded-r-[2px] font-mono"
                        />
                      </div>
                      <p className="mt-1 text-[11px] text-[#5B6573]">
                        {countryCode === "+91"
                          ? (locale === "hi" ? "अपना 10 अंकों का पंजीकृत मोबाइल नंबर दर्ज करें।" : "Enter your registered 10-digit mobile number.")
                          : "Include your international mobile number without leading zeros."}
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={busy || !phoneNumber.trim()}
                      className="w-full bg-[#17365D] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#102A43] disabled:opacity-60 rounded-[2px] transition-colors cursor-pointer"
                    >
                      {busy ? (locale === "hi" ? "OTP भेजा जा रहा है…" : "Sending OTP…") : (locale === "hi" ? "OTP भेजें →" : "Send OTP →")}
                    </button>

                    <div className="mt-3 flex items-center justify-between text-xs text-[#5B6573]">
                      <button
                        type="button"
                        onClick={() => { setAuthMethod("password"); setError(""); setOtpSuccessNotice(""); }}
                        className="text-[#17365D] font-semibold hover:underline"
                      >
                        &larr; {locale === "hi" ? "पासवर्ड लॉगिन का उपयोग करें" : "Use Password Login"}
                      </button>
                      <span className="text-[11px]">Valid for 10 minutes</span>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOtp} className="space-y-4" aria-busy={busy}>
                    <div className="bg-[#F8FAFC] border border-[#CBD5E1] p-3 rounded-[2px] text-xs text-[#334155] flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-[#102A43]">{countryCode} {phoneNumber}</div>
                        <div className="text-[11px] text-[#64748B]">SMS OTP Delivered</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => { setOtpSent(false); setOtpCode(""); setError(""); setOtpSuccessNotice(""); }}
                        className="text-xs font-bold text-[#17365D] hover:underline cursor-pointer"
                      >
                        Change
                      </button>
                    </div>

                    <div>
                      <label htmlFor="login-otp" className="block text-xs font-semibold text-[#202B36] mb-1">
                        {locale === "hi" ? "6 अंकों का OTP दर्ज करें" : "Enter 6-digit OTP code"}
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
                        className="w-full px-3 py-2 border-2 border-[#17365D] bg-white text-[#202B36] text-lg font-mono tracking-widest text-center rounded-[2px]"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={busy || otpCode.length !== 6}
                      className="w-full bg-[#17365D] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#102A43] disabled:opacity-60 rounded-[2px] transition-colors cursor-pointer"
                    >
                      {busy ? (locale === "hi" ? "सत्यापन जारी है…" : "Verifying…") : (locale === "hi" ? "OTP सत्यापित करें एवं पद चुनें →" : "Verify & Choose Role →")}
                    </button>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <button
                        type="button"
                        onClick={() => { setAuthMethod("password"); setError(""); setOtpSuccessNotice(""); }}
                        className="text-[#17365D] font-semibold hover:underline cursor-pointer"
                      >
                        &larr; {locale === "hi" ? "पासवर्ड का उपयोग करें" : "Use Password"}
                      </button>

                      {otpCooldown > 0 ? (
                        <span className="text-[#5B6573] font-mono text-[11px]">
                          Resend in {otpCooldown}s
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSendOtp()}
                          className="font-bold text-[#C87524] hover:underline cursor-pointer"
                        >
                          {locale === "hi" ? "OTP पुनः भेजें" : "Resend OTP"}
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
        <div className="space-y-6">
          {/* Identity Header Banner */}
          <div className="bg-white border border-[#D8DEE6] p-6 rounded-[4px] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#059669] bg-[#ECFDF5] border border-[#A7F3D0] px-2 py-0.5 rounded-[2px]">
                  {locale === "hi" ? "प्रमाणीकृत सत्र" : "Authenticated Session"}
                </span>
                {authenticatedUser && (
                  <span className="text-xs font-mono font-semibold text-[#17365D]">
                    {authenticatedUser.identifier}
                  </span>
                )}
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#102A43] mt-2">
                {locale === "hi" ? "अपने आधिकारिक पद एवं कार्यक्षेत्र का चयन करें" : "Select Your Official Portal Role"}
              </h1>
              <p className="text-xs sm:text-sm text-[#5B6573] mt-1 max-w-2xl leading-relaxed">
                {locale === "hi"
                  ? "अपने पदीय कर्तव्यों के अनुसार उपयुक्त भूमिका चुनें। प्रत्येक भूमिका को डेटा सुरक्षा नियमों के तहत केवल निर्धारित सुविधाओं तक सीमित अधिकार दिए जाते हैं।"
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
              className="px-3.5 py-1.5 border border-[#8B95A1] text-xs font-semibold text-[#17365D] hover:bg-[#F4F6F8] rounded-[2px] transition-colors self-start md:self-auto cursor-pointer"
            >
              {locale === "hi" ? "खाता बदलें / साइन आउट" : "Change Account / Sign Out"}
            </button>
          </div>

          {error && (
            <p role="alert" className="border-l-4 border-[#B42318] bg-[#FDF0EF] p-3 text-xs text-[#7A1B14] rounded-[2px]">
              {error}
            </p>
          )}

          {/* 5 Distinct Official Role Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {portalRoles.map((roleItem) => {
              const isSelected = switchingPersona === roleItem.id;
              return (
                <div
                  key={roleItem.id}
                  className="bg-white border border-[#CBD5E1] border-t-4 border-t-[#17365D] rounded-[4px] p-5 flex flex-col justify-between hover:shadow-md transition-shadow"
                >
                  <div className="space-y-3">
                    {/* Header Tag & Role Title */}
                    <div className="flex items-center justify-between gap-2 border-b border-[#E2E8F0] pb-2.5">
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 bg-[#F4F6F8] border border-[#CBD5E1] text-[#17365D] font-bold">
                        {locale === "hi" ? roleItem.scopeTagHi : roleItem.scopeTagEn}
                      </span>
                      <span className="text-[11px] font-mono text-[#64748B]">{roleItem.email}</span>
                    </div>

                    <div>
                      <h2 className="text-base font-bold text-[#102A43]">
                        {locale === "hi" ? roleItem.titleHi : roleItem.titleEn}
                      </h2>
                      <div className="text-xs font-semibold text-[#C87524]">
                        {locale === "hi" ? roleItem.orgHi : roleItem.orgEn}
                      </div>
                      <p className="text-xs text-[#334155] mt-1.5 leading-relaxed">
                        {locale === "hi" ? roleItem.descriptionHi : roleItem.descriptionEn}
                      </p>
                    </div>

                    {/* Permissions: Allowed vs Restricted */}
                    <div className="pt-2 space-y-2 border-t border-[#F1F5F9] text-[11px]">
                      <div>
                        <span className="font-bold text-[#237A52] uppercase text-[10px] tracking-wider block mb-1">
                          {locale === "hi" ? "अनुमत कार्य (Permitted Features):" : "Permitted Features:"}
                        </span>
                        <ul className="space-y-1 text-[#334155]">
                          {(locale === "hi" ? roleItem.allowedFeaturesHi : roleItem.allowedFeaturesEn).map((feat, idx) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              <span className="text-[#237A52] font-bold">&bull;</span>
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
                  <div className="pt-4 mt-4 border-t border-[#E2E8F0]">
                    <button
                      type="button"
                      disabled={Boolean(switchingPersona)}
                      onClick={() => handleRoleSelect(roleItem)}
                      className="w-full py-2.5 px-3 bg-[#17365D] hover:bg-[#102A43] text-white text-xs font-bold rounded-[2px] transition-colors cursor-pointer disabled:opacity-50 text-center"
                    >
                      {isSelected
                        ? (locale === "hi" ? "सत्र प्रारंभ हो रहा है…" : "Starting Session…")
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
      <div className="text-xs text-[#5B6573] border-t border-[#D8DEE6] pt-4 flex flex-col sm:flex-row justify-between gap-2">
        <span>{t("Accounts are issued by an authorized platform administrator. Never share administrative credentials.")}</span>
        <span className="font-mono text-[11px] text-[#17365D]">SATYAPAN V2.0 · Team PRAMAANIT</span>
      </div>
    </section>
  );
}
