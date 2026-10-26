"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import {
  QrCode,
  ShieldCheck,
  Lock,
  CheckCircle2,
  AlertCircle,
  Building2,
  GraduationCap,
  Calendar,
  ExternalLink,
  RefreshCw,
  Search,
  UserCheck,
  EyeOff,
} from "lucide-react";

export default function VerifyClient() {
  const searchParams = useSearchParams();
  const [code, setCode] = useState<string>(
    searchParams.get("code") || "SATYA-2026-TCS"
  );
  const [verificationResult, setVerificationResult] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGrantingConsent, setIsGrantingConsent] = useState(false);
  const [currentOrigin, setCurrentOrigin] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentOrigin(window.location.origin);
    }
  }, []);

  const handleLookup = async (codeToLookup: string) => {
    if (!codeToLookup) return;
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch(`/api/verify?code=${encodeURIComponent(codeToLookup)}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Verification record not found");
      }
      setVerificationResult(data);
    } catch (err: any) {
      setError(err.message || "Failed to lookup verification record");
      setVerificationResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const urlCode = searchParams.get("code");
    if (urlCode) {
      setCode(urlCode);
      handleLookup(urlCode);
    } else {
      handleLookup("SATYA-2026-TCS");
    }
  }, [searchParams]);

  const handleGrantConsent = async () => {
    if (!verificationResult?.request?.verification_code) return;
    try {
      setIsGrantingConsent(true);
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "grant_consent",
          code: verificationResult.request.verification_code,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to grant consent");
      }
      setVerificationResult((prev: any) => ({
        ...prev,
        request: data.request,
        disclosed_data: data.disclosed_data,
      }));
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setIsGrantingConsent(false);
    }
  };

  const currentQrUrl = currentOrigin
    ? `${currentOrigin}/verify?code=${encodeURIComponent(code)}`
    : `https://satyapan.gov.in/verify?code=${encodeURIComponent(code)}`;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
          <Lock className="w-3.5 h-3.5" />
          <span>DPDP Act 2023 Consent-Gated Verification</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Third-Party Employer Credential Verification
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm">
          Privacy-preserving academic credentials verification. Students retain full ownership of
          personal data; sensitive PII is shielded from unconsented queries.
        </p>
      </div>

      {/* Verification Code Input Bar */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLookup(code);
          }}
          className="flex flex-col sm:flex-row items-center gap-3"
        >
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Enter Verification Token or Student Roll (e.g., SATYA-2026-TCS, STU-1)"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs sm:text-sm focus:outline-none focus:border-amber-500 transition-colors uppercase"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-60 flex items-center justify-center space-x-2 whitespace-nowrap"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            <span>Verify Token</span>
          </button>
        </form>

        {/* Quick Demo Pre-sets */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
          <span>Quick Demo Presets:</span>
          <button
            type="button"
            onClick={() => {
              setCode("SATYA-2026-TCS");
              handleLookup("SATYA-2026-TCS");
            }}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 font-mono font-semibold transition-colors cursor-pointer"
          >
            TCS Campus Token (STU-1)
          </button>
          <button
            type="button"
            onClick={() => {
              setCode("STU-10");
              handleLookup("STU-10");
            }}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono transition-colors cursor-pointer"
          >
            STU-10 (Invalid APAAR)
          </button>
          <button
            type="button"
            onClick={() => {
              setCode("STU-20");
              handleLookup("STU-20");
            }}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono transition-colors cursor-pointer"
          >
            STU-20 (Ghost Double Admission)
          </button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Verification Card & QR flow */}
      {verificationResult && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* QR Code Container */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col items-center justify-center text-center space-y-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Verification QR Token
            </span>
            <div className="p-3 bg-white rounded-2xl shadow-xl">
              <QRCodeSVG value={currentQrUrl} size={150} level="M" />
            </div>
            <p className="text-[11px] font-mono text-amber-400 bg-slate-950 px-3 py-1 rounded-lg border border-slate-800">
              {verificationResult.request.verification_code}
            </p>
            <p className="text-[10px] text-slate-500">
              Scan with phone camera or DigiLocker verifier app to authenticate
            </p>
          </div>

          {/* Verification Details & Consent Gate */}
          <div className="md:col-span-2 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-white">Verification Status</h3>
                <p className="text-xs text-slate-400">
                  Verifier: <strong className="text-slate-200">{verificationResult.request.verifier_type}</strong>
                </p>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  verificationResult.request.consent_granted
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                    : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                }`}
              >
                {verificationResult.request.consent_granted ? "Consent Granted" : "Awaiting Student Consent"}
              </span>
            </div>

            {/* If Consent Not Yet Granted: Show Privacy Masked Gate */}
            {!verificationResult.request.consent_granted ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center space-x-2 text-slate-400 text-xs">
                    <EyeOff className="w-4 h-4 text-amber-400" />
                    <span>Candidate PII Protected under DPDP Act 2023</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Preview: Candidate <strong className="text-white font-mono">{verificationResult.student_preview?.masked_name}</strong> has
                    applied for verification. Full academic validation is withheld until the student explicitly authorizes disclosure.
                  </p>
                </div>

                {/* Consent Simulator Button */}
                <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-3">
                  <div className="flex items-center space-x-2 text-xs font-bold text-amber-400">
                    <UserCheck className="w-4 h-4" />
                    <span>Candidate Digital Consent Simulator</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    In production, the student approves this consent request via their registered mobile DigiLocker or SMS OTP.
                    For SIH evaluation, click below to simulate the student granting digital consent.
                  </p>
                  <button
                    onClick={handleGrantConsent}
                    disabled={isGrantingConsent}
                    className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer active:scale-98 disabled:opacity-60 flex items-center justify-center space-x-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {isGrantingConsent
                        ? "Transacting Consent Grant..."
                        : "Grant Student Consent & Unlock Credentials"}
                    </span>
                  </button>
                </div>
              </div>
            ) : (
              /* If Consent Granted: Show Disclosed Selective Credential Card */
              <div className="space-y-4 animate-fadeIn">
                <div className="p-5 rounded-xl bg-emerald-500/5 border border-emerald-500/30 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center space-x-1.5">
                      <ShieldCheck className="w-4 h-4" />
                      <span>AICTE Verified Academic Credential</span>
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Selective Disclosure v2.4
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs pt-1">
                    <div>
                      <span className="text-slate-500 block">Candidate Name</span>
                      <span className="text-sm font-bold text-white">
                        {verificationResult.disclosed_data?.student_name}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-500 block">Enrolment Status</span>
                      <span className="text-sm font-bold text-emerald-400 uppercase font-mono">
                        {verificationResult.disclosed_data?.enrolment_status}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-500 block">Degree / Program</span>
                      <span className="text-sm font-semibold text-slate-200">
                        {verificationResult.disclosed_data?.program}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-500 block">Batch / Admission Year</span>
                      <span className="text-sm font-semibold text-slate-200">
                        Class of {verificationResult.disclosed_data?.admission_year}
                      </span>
                    </div>

                    <div className="col-span-2 pt-2 border-t border-slate-800">
                      <span className="text-slate-500 block">Affiliated Institution</span>
                      <span className="text-sm font-semibold text-amber-300">
                        {verificationResult.disclosed_data?.institution_name} (
                        {verificationResult.disclosed_data?.institution_code})
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                  <span>Cryptographic Timestamp: {verificationResult.disclosed_data?.timestamp?.slice(0, 19)}Z</span>
                  <span className="text-emerald-400 font-semibold">Verification Authenticated ✓</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
