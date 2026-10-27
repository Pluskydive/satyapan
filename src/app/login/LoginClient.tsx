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

export default function LoginClient({ isDemo = false }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState<"personas" | "credentials">(isDemo ? "personas" : "credentials");
  const [switchingPersona, setSwitchingPersona] = useState<string | null>(null);

  // Live Supabase form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [demoNotice, setDemoNotice] = useState("");

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

  const personas: Array<{
    id: string;
    role: AppRole | "public_verifier";
    email: string;
    institutionId: string;
    title: string;
    org: string;
    scopeTag: string;
    description: string;
    destination: string;
    buttonLabel: string;
  }> = [
    {
      id: "aicte_admin",
      role: "platform_admin",
      email: "admin@satyapan.gov.in",
      institutionId: "",
      title: "Central Administrator",
      org: "Apex Technical Education Regulatory Authority",
      scopeTag: "Full Platform Authority",
      description: "Full platform governance authority. Access National Overview, cross-state seat ledgers, NIRF/NAAC regulatory reports, tamper-evident audit logs, and user provisioning.",
      destination: "/aicte",
      buttonLabel: "Launch Central Command",
    },
    {
      id: "inst_registrar",
      role: "institution_admin",
      email: "registrar@sunrise.edu.in",
      institutionId: "inst-1001",
      title: "Institutional Registrar",
      org: "Sunrise Institute of Technology (AICTE Code: 1-1001)",
      scopeTag: "Institution-Scoped Control",
      description: "Institution-scoped access. Manage institutional seat ledger, perform automated CSV batch ingestion with CWE-1236 defense, review enrolment discrepancies, and configure ERP system API keys.",
      destination: "/institution",
      buttonLabel: "Access Sunrise Seat Ledger",
    },
    {
      id: "naac_auditor",
      role: "reviewer",
      email: "auditor@naac.gov.in",
      institutionId: "",
      title: "Accreditation Auditor",
      org: "Quality Assurance Council (NAAC / NBA / NIRF)",
      scopeTag: "Read-Only Compliance",
      description: "Read-only regulatory compliance oversight. Inspect national intake adherence, examine student discrepancy dossiers, export NIRF/NAAC accreditation summaries, and view system audit history.",
      destination: "/aicte/reports",
      buttonLabel: "Open Auditor Compliance Portal",
    },
    {
      id: "employer_verifier",
      role: "public_verifier",
      email: "hr.verify@tcs.com",
      institutionId: "",
      title: "Employer Verifier",
      org: "Corporate Recruiter / Verification Agency",
      scopeTag: "DPDP Consent Verification",
      description: "Public verification workflow. Test DPDP Act 2023 consent-gated APAAR record verification and validate tamper-evident signed student credentials.",
      destination: "/verify",
      buttonLabel: "Open Verification Gateway",
    },
  ];

  async function selectPersona(persona: typeof personas[0]) {
    setSwitchingPersona(persona.id);
    setError("");
    try {
      const res = await fetch("/api/auth/demo-persona", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: persona.role,
          email: persona.email,
          institution_id: persona.institutionId,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to switch persona");
      }

      const nextTarget = safeNextPath(searchParams.get("next"));
      const destination = nextTarget !== "/" ? nextTarget : persona.destination;

      router.replace(destination);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Persona selection failed");
      setSwitchingPersona(null);
    }
  }

  async function submitLiveCredentials(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setDemoNotice("");

    const normalizedEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail) || !password) {
      setError(t("Email or password was not accepted. Check your details and try again."));
      return;
    }

    if (isDemo) {
      setDemoNotice(
        t("Demonstration mode: To test live Supabase Auth, set SATYAPAN_MODE=live and configure Supabase environment variables. To preview dashboard roles now, use the Stakeholder Personas above.")
      );
      return;
    }

    setBusy(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });
      if (signInError || !data.user) {
        setError(t("Email or password was not accepted. Check your details and try again."));
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("user_profiles")
        .select("role,is_active")
        .eq("user_id", data.user.id)
        .maybeSingle();
      if (profileError || !profile?.is_active || profile.role === "pending") {
        await supabase.auth.signOut({ scope: "local" });
        setError(t("Your account is awaiting administrator approval."));
        return;
      }

      router.replace(safeNextPath(searchParams.get("next")));
      router.refresh();
    } catch {
      setError(t("This service is not configured for sign-in yet."));
    } finally {
      setBusy(false);
    }
  }

  async function handleSendOtp(event?: React.FormEvent) {
    if (event) event.preventDefault();
    setError("");
    setDemoNotice("");
    setOtpSuccessNotice("");

    const cleanPhone = phoneNumber.replace(/\D/g, "");
    if (countryCode === "+91" && !/^[6-9]\d{9}$/.test(cleanPhone)) {
      setError(t("Invalid mobile number. Enter a valid 10-digit number."));
      return;
    } else if (cleanPhone.length < 6 || cleanPhone.length > 15) {
      setError(t("Invalid mobile number. Enter a valid 10-digit number."));
      return;
    }

    setBusy(true);
    const fullPhone = `${countryCode}${cleanPhone}`;

    if (isDemo) {
      setTimeout(() => {
        setBusy(false);
        setOtpSent(true);
        setOtpCooldown(60);
        setOtpSuccessNotice(`Demo OTP simulated for ${fullPhone}. Use verification code 123456.`);
      }, 400);
      return;
    }

    try {
      const supabase = createSupabaseBrowserClient();
      const { error: otpError } = await supabase.auth.signInWithOtp({
        phone: fullPhone,
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
    setDemoNotice("");

    const cleanOtp = otpCode.replace(/\D/g, "");
    if (cleanOtp.length !== 6) {
      setError(t("Invalid OTP code. Please check and try again."));
      return;
    }

    setBusy(true);
    const cleanPhone = phoneNumber.replace(/\D/g, "");
    const fullPhone = `${countryCode}${cleanPhone}`;

    if (isDemo) {
      if (cleanOtp !== "123456") {
        setBusy(false);
        setError(t("OTP expired or invalid. Request a new code."));
        return;
      }

      let assignedPersona = personas[1]; // default registrar
      if (cleanPhone === "9999900001") {
        assignedPersona = personas[0];
      }

      try {
        const res = await fetch("/api/auth/demo-persona", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            role: assignedPersona.role,
            email: assignedPersona.email,
            institution_id: assignedPersona.institutionId,
          }),
        });
        if (!res.ok) throw new Error("Failed to authenticate session");

        const nextTarget = safeNextPath(searchParams.get("next"));
        const destination = nextTarget !== "/" ? nextTarget : assignedPersona.destination;
        router.replace(destination);
        router.refresh();
      } catch {
        setError(t("Session initialization failed. Please try again."));
      } finally {
        setBusy(false);
      }
      return;
    }

    try {
      const supabase = createSupabaseBrowserClient();
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        phone: fullPhone,
        token: cleanOtp,
        type: "sms",
      });

      if (verifyError || !data.user) {
        setError(t("Invalid OTP code. Please check and try again."));
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("user_profiles")
        .select("role,is_active")
        .eq("user_id", data.user.id)
        .maybeSingle();

      if (profileError || !profile?.is_active || profile.role === "pending") {
        await supabase.auth.signOut({ scope: "local" });
        setError(t("Your account is awaiting administrator approval."));
        return;
      }

      router.replace(safeNextPath(searchParams.get("next")));
      router.refresh();
    } catch {
      setError(t("Could not verify OTP. Please try again."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      {/* Institutional Breadcrumb & Header */}
      <div className="bg-white border border-[#D8DEE6] p-6 sm:p-8 rounded-[6px] shadow-sm">
        <div className="border-b border-[#D8DEE6] pb-4">
          <h1 className="text-xl sm:text-2xl font-bold text-[#102A43]">
            Account Login
          </h1>
          <p className="text-xs sm:text-sm text-[#5B6573] mt-1">
            Sign in to access your institutional or central administration workspace.
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

        {/* Tab Switcher for Demo Mode */}
        {isDemo && (
          <div className="mt-6 flex border-b border-[#D8DEE6]">
            <button
              type="button"
              onClick={() => setActiveTab("personas")}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors cursor-pointer ${
                activeTab === "personas"
                  ? "border-[#17365D] text-[#17365D] bg-[#F4F6F8]"
                  : "border-transparent text-[#5B6573] hover:text-[#17365D]"
              }`}
            >
              Direct Role Access
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("credentials")}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors cursor-pointer ${
                activeTab === "credentials"
                  ? "border-[#17365D] text-[#17365D] bg-[#F4F6F8]"
                  : "border-transparent text-[#5B6573] hover:text-[#17365D]"
              }`}
            >
              Credential Sign-In Form
            </button>
          </div>
        )}

        {/* Persona Switcher Section */}
        {isDemo && activeTab === "personas" && (
          <div className="mt-6 space-y-4">
            <p className="text-xs text-[#5B6573] leading-relaxed">
              Select an administrative or verifier role below to access the corresponding workspace and permission scope:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {personas.map((persona) => {
                const isSelected = switchingPersona === persona.id;
                return (
                  <div
                    key={persona.id}
                    className="border border-[#D8DEE6] bg-white p-5 rounded-[2px] flex flex-col justify-between hover:border-[#17365D] transition-colors"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 bg-[#F4F6F8] border border-[#D8DEE6] text-[#17365D] font-semibold">
                          {t(persona.scopeTag)}
                        </span>
                        <span className="text-[11px] font-mono text-[#5B6573]">{persona.email}</span>
                      </div>

                      <h2 className="text-base font-bold text-[#17365D] mt-2.5">
                        {t(persona.title)}
                      </h2>
                      <p className="text-xs font-semibold text-[#5B6573] mt-0.5">
                        {t(persona.org)}
                      </p>

                      <p className="text-xs text-[#202B36] mt-3 leading-relaxed">
                        {t(persona.description)}
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={Boolean(switchingPersona)}
                      onClick={() => selectPersona(persona)}
                      className="mt-5 w-full py-2.5 px-3 bg-[#17365D] hover:bg-[#102A43] text-white text-xs font-bold rounded-[2px] transition-colors cursor-pointer disabled:opacity-50 text-center"
                    >
                      {isSelected ? t("Loading…") : `${t(persona.buttonLabel)} →`}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Credentials Form (Email & Password OR Phone Number + OTP) */}
        {(activeTab === "credentials" || !isDemo) && (
          <div className="mt-6 max-w-md mx-auto">
            {isDemo && (
              <div className="mb-5 p-3 bg-[#F4F6F8] border border-[#D8DEE6] text-xs text-[#5B6573]">
                <strong>Technical Inspection:</strong> This interface validates live Supabase cookie-backed session authentication and Phone OTP. In demo mode, live Supabase keys are simulated with pre-configured personas.
              </div>
            )}

            {/* Sub-tabs: Email & Password vs Phone & OTP */}
            <div className="flex border-b border-[#D8DEE6] mb-5">
              <button
                type="button"
                onClick={() => {
                  setAuthMethod("password");
                  setError("");
                  setDemoNotice("");
                  setOtpSuccessNotice("");
                }}
                className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider text-center border-b-2 transition-colors cursor-pointer ${
                  authMethod === "password"
                    ? "border-[#17365D] text-[#17365D] bg-[#F4F6F8]"
                    : "border-transparent text-[#5B6573] hover:text-[#17365D]"
                }`}
              >
                {t("Email & Password")}
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMethod("otp");
                  setError("");
                  setDemoNotice("");
                  setOtpSuccessNotice("");
                }}
                className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider text-center border-b-2 transition-colors cursor-pointer ${
                  authMethod === "otp"
                    ? "border-[#17365D] text-[#17365D] bg-[#F4F6F8]"
                    : "border-transparent text-[#5B6573] hover:text-[#17365D]"
                }`}
              >
                {t("SMS OTP Login")}
              </button>
            </div>

            {/* Error & Success Messages */}
            {error && (
              <p id="login-error" role="alert" className="mb-4 border-l-4 border-[#B42318] bg-[#FDF0EF] p-3 text-sm text-[#7A1B14]">
                {error}
              </p>
            )}

            {otpSuccessNotice && (
              <p role="status" className="mb-4 border-l-4 border-[#237A52] bg-[#EDF7F1] p-3 text-xs font-medium text-[#205E40]">
                {otpSuccessNotice}
              </p>
            )}

            {demoNotice && (
              <p role="status" className="mb-4 border-l-4 border-[#C87524] bg-[#FFF7E6] p-3 text-xs text-[#684600]">
                {demoNotice}
              </p>
            )}

            {/* METHOD 1: EMAIL & PASSWORD FORM */}
            {authMethod === "password" && (
              <form onSubmit={submitLiveCredentials} className="space-y-4" aria-busy={busy}>
                <div>
                  <label htmlFor="login-email" className="block text-sm font-semibold text-[#202B36] mb-1">
                    {t("Work email")}
                  </label>
                  <input
                    id="login-email"
                    type="email"
                    autoComplete="username"
                    inputMode="email"
                    required
                    maxLength={254}
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? "login-error" : undefined}
                    className="w-full px-3 py-2 border border-[#8B95A1] bg-white text-[#202B36] text-sm rounded-[2px]"
                  />
                </div>

                <div>
                  <label htmlFor="login-password" className="block text-sm font-semibold text-[#202B36] mb-1">
                    {t("Password")}
                  </label>
                  <div className="flex">
                    <input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      aria-invalid={Boolean(error)}
                      aria-describedby={error ? "login-error" : undefined}
                      className="w-full min-w-0 px-3 py-2 border border-[#8B95A1] bg-white text-[#202B36] text-sm rounded-l-[2px]"
                    />
                    <button
                      type="button"
                      className="border border-l-0 border-[#8B95A1] px-3 text-xs font-semibold text-[#17365D] bg-[#F4F6F8] rounded-r-[2px]"
                      aria-label={t(showPassword ? "Hide password" : "Show password")}
                      aria-pressed={showPassword}
                      onClick={() => setShowPassword((value) => !value)}
                    >
                      {t(showPassword ? "Hide password" : "Show password")}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={busy}
                  className="w-full bg-[#17365D] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#102A43] disabled:opacity-60 rounded-[2px] transition-colors cursor-pointer"
                >
                  {busy ? t("Signing in…") : t("Sign in")}
                </button>

                <div className="mt-4 flex items-center justify-between text-xs">
                  <a className="font-semibold text-[#17365D] underline" href="/forgot-password">
                    {t("Forgot password?")}
                  </a>
                  <button
                    type="button"
                    onClick={() => { setAuthMethod("otp"); setError(""); setOtpSuccessNotice(""); }}
                    className="text-[#17365D] font-semibold hover:underline"
                  >
                    {t("Use Phone & OTP Login")} &rarr;
                  </button>
                </div>
              </form>
            )}

            {/* METHOD 2: PHONE NUMBER + OTP FORM */}
            {authMethod === "otp" && (
              <div className="space-y-4">
                {!otpSent ? (
                  <form onSubmit={handleSendOtp} className="space-y-4" aria-busy={busy}>
                    <div>
                      <label htmlFor="login-phone" className="block text-sm font-semibold text-[#202B36] mb-1">
                        {t("Mobile number")}
                      </label>
                      <div className="flex">
                        <select
                          value={countryCode}
                          onChange={(e) => setCountryCode(e.target.value)}
                          aria-label="Country Code"
                          className="px-2.5 py-2 border border-r-0 border-[#8B95A1] bg-[#F8FAFC] text-xs font-semibold text-[#102A43] rounded-l-[2px]"
                        >
                          <option value="+91">🇮🇳 +91 (IN)</option>
                          <option value="+1">🇺🇸 +1 (US)</option>
                          <option value="+44">🇬🇧 +44 (UK)</option>
                          <option value="+971">🇦🇪 +971 (AE)</option>
                          <option value="+65">🇸🇬 +65 (SG)</option>
                          <option value="+61">🇦🇺 +61 (AU)</option>
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
                          className="w-full min-w-0 px-3 py-2 border border-[#8B95A1] bg-white text-[#202B36] text-sm rounded-r-[2px] font-mono"
                        />
                      </div>
                      <p className="mt-1 text-[11px] text-[#5B6573]">
                        {countryCode === "+91"
                          ? "Enter your registered 10-digit mobile number."
                          : "Include your international mobile number without leading zero."}
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={busy || !phoneNumber.trim()}
                      className="w-full bg-[#17365D] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#102A43] disabled:opacity-60 rounded-[2px] transition-colors cursor-pointer"
                    >
                      {busy ? t("Sending OTP…") : t("Send OTP")}
                    </button>

                    <div className="mt-4 flex items-center justify-between text-xs">
                      <button
                        type="button"
                        onClick={() => { setAuthMethod("password"); setError(""); setOtpSuccessNotice(""); }}
                        className="text-[#17365D] font-semibold hover:underline"
                      >
                        &larr; {t("Use Password Login")}
                      </button>
                      <span className="text-[#5B6573] text-[11px]">Valid for 10 minutes</span>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOtp} className="space-y-4" aria-busy={busy}>
                    <div className="bg-[#F8FAFC] border border-[#CBD5E1] p-3 rounded-[4px] text-xs text-[#334155] flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-[#102A43]">{countryCode} {phoneNumber}</div>
                        <div className="text-[11px] text-[#64748B]">OTP sent via SMS</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => { setOtpSent(false); setOtpCode(""); setError(""); setOtpSuccessNotice(""); }}
                        className="text-xs font-bold text-[#17365D] hover:underline"
                      >
                        Change
                      </button>
                    </div>

                    <div>
                      <label htmlFor="login-otp" className="block text-sm font-semibold text-[#202B36] mb-1">
                        {t("Enter 6-digit OTP")}
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
                        className="w-full px-3 py-2.5 border-2 border-[#17365D] bg-white text-[#202B36] text-xl font-mono tracking-widest text-center rounded-[2px]"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={busy || otpCode.length !== 6}
                      className="w-full bg-[#17365D] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#102A43] disabled:opacity-60 rounded-[2px] transition-colors cursor-pointer"
                    >
                      {busy ? t("Verifying…") : t("Verify & Sign In")}
                    </button>

                    <div className="flex items-center justify-between text-xs pt-2">
                      <button
                        type="button"
                        onClick={() => { setAuthMethod("password"); setError(""); setOtpSuccessNotice(""); }}
                        className="text-[#17365D] font-semibold hover:underline"
                      >
                        &larr; {t("Use Password Login")}
                      </button>

                      {otpCooldown > 0 ? (
                        <span className="text-[#5B6573] font-mono text-[11px]">
                          {t("Resend OTP in")} {otpCooldown}s
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSendOtp()}
                          className="font-bold text-[#C87524] hover:underline cursor-pointer"
                        >
                          {t("Resend OTP")}
                        </button>
                      )}
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        )}

        <div className="text-xs text-[#5B6573] mt-8 border-t border-[#D8DEE6] pt-4 flex flex-col sm:flex-row justify-between gap-2">
          <span>{t("Accounts are issued by an authorized platform administrator. Never share administrative credentials.")}</span>
          <span className="font-mono text-[11px] text-[#17365D]">SATYAPAN V2.0 · Team PRAMAANIT</span>
        </div>
      </div>
    </section>
  );
}
