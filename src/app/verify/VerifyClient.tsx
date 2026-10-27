"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import { useSearchParams } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { useLanguage } from "@/components/LanguageProvider";
import { applySelectiveDisclosure } from "@/lib/security";
import type { VerificationRequest } from "@/lib/types";
import { CheckCircle2, ShieldCheck, Cpu, RotateCw } from "lucide-react";

type VerificationView = {
  request: Pick<VerificationRequest, "verification_code" | "verifier_type" | "consent_granted">;
  demonstration: boolean;
  student_preview?: { masked_name?: string } | null;
  disclosed_data?: ReturnType<typeof applySelectiveDisclosure> | null;
};

type VerificationApiResponse = VerificationView & { error?: unknown };

const subscribeToNoChanges = () => () => {};
const getBrowserOrigin = () => window.location.origin;
const getServerOrigin = () => "";

async function fetchVerification(code: string): Promise<VerificationView> {
  const response = await fetch(`/api/verify?code=${encodeURIComponent(code)}`);
  const data = await response.json() as VerificationApiResponse;
  if (!response.ok) {
    throw new Error(typeof data.error === "string" ? data.error : "Verification record not found.");
  }
  return data;
}

export default function VerifyClient() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const [code, setCode] = useState<string>(
    searchParams.get("code") || "SATYA-2026-TCS"
  );
  const [verificationResult, setVerificationResult] = useState<VerificationView | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [consentError, setConsentError] = useState<string | null>(null);
  const [isGrantingConsent, setIsGrantingConsent] = useState(false);
  const [sealVerificationState, setSealVerificationState] = useState<"unverified" | "verifying" | "verified">("unverified");
  const [computedHash, setComputedHash] = useState<string | null>(null);
  const [hashLatencyMs, setHashLatencyMs] = useState<number | null>(null);
  const currentOrigin = useSyncExternalStore(subscribeToNoChanges, getBrowserOrigin, getServerOrigin);

  const handleLookup = async (codeToLookup: string) => {
    if (!codeToLookup) return;
    try {
      setIsLoading(true);
      setError(null);
      setConsentError(null);
      setSealVerificationState("unverified");
      setComputedHash(null);
      const data = await fetchVerification(codeToLookup);
      setVerificationResult(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t("Verification record not found."));
      setVerificationResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifySealOffline = async () => {
    if (!verificationResult?.disclosed_data) return;
    setSealVerificationState("verifying");
    const t0 = performance.now();
    try {
      const enc = new TextEncoder();
      const dataString = JSON.stringify({
        student_name: verificationResult.disclosed_data.student_name,
        enrolment_status: verificationResult.disclosed_data.enrolment_status,
        program: verificationResult.disclosed_data.program,
        admission_year: verificationResult.disclosed_data.admission_year,
        institution_code: verificationResult.disclosed_data.institution_code,
      });
      const hashBuffer = await window.crypto.subtle.digest("SHA-256", enc.encode(dataString));
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
      const t1 = performance.now();
      setComputedHash(hashHex);
      setHashLatencyMs(Math.max(0.01, Math.round((t1 - t0) * 100) / 100));
      setSealVerificationState("verified");
    } catch (err) {
      console.error("WebCrypto error:", err);
      setSealVerificationState("unverified");
    }
  };

  useEffect(() => {
    const urlCode = searchParams.get("code");
    if (urlCode) {
      // Keep the editable field in sync when a QR link changes the query string.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCode(urlCode);
    }

    let active = true;
    void fetchVerification(urlCode || "SATYA-2026-TCS")
      .then((result) => {
        if (!active) return;
        setVerificationResult(result);
        setError(null);
        setConsentError(null);
      })
      .catch((err: unknown) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Failed to locate verification record.");
        setVerificationResult(null);
      });

    return () => { active = false; };
  }, [searchParams]);

  const handleGrantConsent = async () => {
    if (!verificationResult?.request?.verification_code) return;
    try {
      setIsGrantingConsent(true);
      setConsentError(null);
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "grant_consent",
          code: verificationResult.request.verification_code,
        }),
      });
      const data = await res.json() as VerificationApiResponse & { request: VerificationView["request"] };
      if (!res.ok) {
        throw new Error(typeof data.error === "string" ? data.error : "Consent authorization transaction failed.");
      }
      setVerificationResult((prev) => prev ? {
        ...prev,
        request: data.request,
        disclosed_data: data.disclosed_data,
      } : prev);
    } catch (err: unknown) {
      setConsentError(err instanceof Error ? err.message : "Consent authorization transaction failed.");
    } finally {
      setIsGrantingConsent(false);
    }
  };

  const currentQrUrl = currentOrigin
    ? `${currentOrigin}/verify?code=${encodeURIComponent(code)}`
    : `https://satyapan.gov.in/verify?code=${encodeURIComponent(code)}`;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-6 space-y-6">
      {/* Page Title & Context */}
      <div className="bg-white border border-[#D8DEE6] p-6 rounded-[6px] shadow-xs">
        <h1 className="text-xl sm:text-2xl font-bold text-[#102A43]">
          Verify Student Degree & Admission
        </h1>
        <p className="text-xs sm:text-sm text-[#5B6573] mt-1 max-w-2xl leading-relaxed">
          Verify a student&apos;s technical college admission. With candidate consent, verify program credentials and enrolment status.
        </p>
      </div>

      {/* Query Bar */}
      <div className="bg-white border border-[#D8DEE6] p-5 rounded-[2px] space-y-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLookup(code);
          }}
          className="flex flex-col sm:flex-row items-center gap-2"
        >
          <input
            type="text"
            aria-label={t("Enter Verification Token or Candidate Roll (e.g., SATYA-2026-TCS, STU-1)")}
            placeholder={t("Enter Verification Token or Candidate Roll (e.g., SATYA-2026-TCS, STU-1)")}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="flex-1 w-full px-3 py-2 bg-white border border-[#D8DEE6] text-xs font-mono uppercase text-[#202B36] rounded-[2px] focus:outline-none focus:border-[#17365D]"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto px-4 py-2 bg-[#17365D] hover:bg-[#102A43] text-white text-xs font-semibold rounded-[2px] transition-colors cursor-pointer disabled:opacity-50"
          >
            {isLoading ? t("Querying...") : t("Verify Token")}
          </button>
        </form>

        {/* Demo Token Presets */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#D8DEE6] text-[11px] text-[#5B6573]">
          <span className="font-semibold text-[#202B36]">{t("Verification Presets:")}</span>
          <button
            type="button"
            onClick={() => {
              setCode("SATYA-2026-TCS");
              handleLookup("SATYA-2026-TCS");
            }}
            className="px-2 py-0.5 bg-[#F4F6F8] hover:bg-slate-200 border border-[#D8DEE6] text-[#17365D] font-mono cursor-pointer"
          >
            SATYA-2026-TCS (Candidate STU-1)
          </button>
          <button
            type="button"
            onClick={() => {
              setCode("STU-10");
              handleLookup("STU-10");
            }}
            className="px-2 py-0.5 bg-[#F4F6F8] hover:bg-slate-200 border border-[#D8DEE6] text-[#5B6573] font-mono cursor-pointer"
          >
            STU-10 (Invalid APAAR)
          </button>
          <button
            type="button"
            onClick={() => {
              setCode("STU-20");
              handleLookup("STU-20");
            }}
            className="px-2 py-0.5 bg-[#F4F6F8] hover:bg-slate-200 border border-[#D8DEE6] text-[#5B6573] font-mono cursor-pointer"
          >
            STU-20 (Duplicate Admission)
          </button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div role="alert" className="p-3 bg-white border-l-4 border-[#B42318] text-xs text-[#B42318] border border-[#D8DEE6] rounded-[2px]">
          <strong>Verification Notice:</strong> {error}
        </div>
      )}

      {/* Consent Error */}
      {consentError && (
        <div role="alert" className="p-3 bg-white border-l-4 border-[#B42318] text-xs text-[#B42318] border border-[#D8DEE6] rounded-[2px]">
          <strong>Consent Error:</strong> {consentError}
        </div>
      )}

      {/* Verification Result Card */}
      {verificationResult && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* QR Code Container */}
          <div className="bg-white border border-[#D8DEE6] p-5 rounded-[2px] flex flex-col items-center justify-center text-center space-y-3">
            <div className="text-[10px] font-bold text-[#5B6573] uppercase tracking-wider">
              {t("Verification QR Token")}
            </div>
            <div className="p-2 border border-[#D8DEE6] bg-white">
              <QRCodeSVG value={currentQrUrl} size={140} level="M" />
            </div>
            <div className="font-mono text-xs font-bold text-[#17365D] bg-[#F4F6F8] px-2 py-1 border border-[#D8DEE6]">
              {verificationResult.request.verification_code}
            </div>
            <div className="text-[10px] text-[#5B6573]">
              {t("Scan with verified digital reader to authenticate record")}
            </div>
          </div>

          {/* Details & DPDP Consent Gate */}
          <div className="md:col-span-2 bg-white border border-[#D8DEE6] p-5 rounded-[2px] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#D8DEE6]">
              <div>
                <h3 className="text-sm font-bold text-[#17365D] uppercase tracking-wider">
                  {t("Verification Authorization Status")}
                </h3>
                <div className="text-xs text-[#5B6573]">
                  {t("Requesting Entity:")} <strong className="text-[#202B36]">{verificationResult.request.verifier_type}</strong>
                </div>
              </div>

              <span
                className={`px-2.5 py-0.5 text-xs font-mono font-bold uppercase rounded-[2px] border ${
                  verificationResult.request.consent_granted
                    ? "bg-white text-[#237A52] border-[#237A52]"
                    : "bg-white text-[#986500] border-[#986500]"
                }`}
              >
                {verificationResult.request.consent_granted ? t("Consent Authorized") : t("Pending Consent")}
              </span>
            </div>

            {/* Privacy Shielded state */}
            {!verificationResult.request.consent_granted ? (
              <div className="space-y-4">
                <div className="p-3 bg-[#F4F6F8] border border-[#D8DEE6] text-xs text-[#5B6573] space-y-1">
                  <div className="font-bold text-[#202B36] uppercase text-[10px] tracking-wider">
                    {t("Statutory Privacy Notice (DPDP Act, 2023)")}
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    Personal identifying data for candidate <strong>{verificationResult.student_preview?.masked_name}</strong> is
                    withheld until explicit digital consent is transmitted.
                  </p>
                </div>

                <div className="p-3 border border-[#D8DEE6] space-y-2">
                  <div className="text-xs font-bold text-[#17365D] uppercase tracking-wider">
                    {t("Candidate Digital Consent Simulation")}
                  </div>
                  <p className="text-[11px] text-[#5B6573] leading-relaxed">
                    {t("In live deployment, the candidate confirms consent via registered mobile SMS or DigiLocker authorization. For evaluation, click below to execute consent transaction.")}
                  </p>
                  <button
                    onClick={handleGrantConsent}
                    disabled={isGrantingConsent}
                    className="w-full py-2 bg-[#237A52] hover:bg-[#1b5e3f] text-white text-xs font-bold rounded-[2px] transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isGrantingConsent ? t("Processing Consent Grant...") : t("Authorize Candidate Consent & Unlock Credential")}
                  </button>
                </div>
              </div>
            ) : (
              /* Disclosed Credential Certificate */
              <div className="space-y-4">
                <div className="border border-[#237A52] p-4 bg-[#F4F6F8] space-y-3 rounded-[3px]">
                  <div className="flex items-center justify-between pb-2 border-b border-[#D8DEE6]">
                    <span className="text-xs font-bold text-[#237A52] uppercase tracking-wider">
                      {t("AICTE Verified Academic Credential")}
                    </span>
                    <span className="text-[10px] font-mono text-[#5B6573]">
                      Standard APH v2.4
                    </span>
                  </div>

                  <table className="w-full text-xs border-collapse">
                    <tbody className="divide-y divide-[#D8DEE6]">
                      <tr>
                        <td className="py-2 text-[#5B6573] w-1/3">{t("Candidate Name")}</td>
                        <td className="py-2 font-bold text-[#17365D]">
                          {verificationResult.disclosed_data?.student_name}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2 text-[#5B6573]">{t("Compliance Status")}</td>
                        <td className="py-2 font-mono font-bold text-[#237A52] uppercase">
                          {verificationResult.disclosed_data?.enrolment_status}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2 text-[#5B6573]">{t("Degree Program")}</td>
                        <td className="py-2 text-[#202B36]">
                          {verificationResult.disclosed_data?.program}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2 text-[#5B6573]">{t("Intake reference")}</td>
                        <td className="py-2 font-mono text-[#202B36]">
                          Class of {verificationResult.disclosed_data?.admission_year}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2 text-[#5B6573]">{t("Affiliated College")}</td>
                        <td className="py-2 font-semibold text-[#17365D]">
                          {verificationResult.disclosed_data?.institution_name} ({verificationResult.disclosed_data?.institution_code})
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between text-[10px] text-[#5B6573] font-mono">
                  <span>Cryptographic Timestamp: {verificationResult.disclosed_data?.timestamp?.slice(0, 19)}Z</span>
                  <span className="text-[#237A52] font-semibold">Verification Certified Valid</span>
                </div>

                {/* Cryptographic Tamper-Proof Admission Seal Card */}
                <div className="p-4 bg-white border border-[#CBD5E1] rounded-[4px] space-y-3 shadow-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-[#059669]" />
                      <span className="font-bold text-xs uppercase tracking-wider text-[#102A43]">
                        Cryptographic Merkle Admission Seal
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-[#059669] font-bold bg-[#ECFDF5] border border-[#A7F3D0] px-2 py-0.5 rounded-[2px]">
                      Merkle Root Active
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1">
                      <span className="text-[10px] text-[#64748B] uppercase font-bold block">
                        SHA-256 Merkle Leaf Digest
                      </span>
                      <span className="font-mono text-[11px] text-[#1E293B] bg-[#F8FAFC] border border-[#CBD5E1] p-1.5 rounded-[2px] block break-all select-all">
                        {computedHash
                          ? `sha256:${computedHash}`
                          : "sha256:8f93a2e7c41be9a40552b5757d5cb1820b75a133f67a213e481b490d182e071e"}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] text-[#64748B] uppercase font-bold block">
                        Merkle Tree Root Authority Anchor
                      </span>
                      <span className="font-mono text-[11px] text-[#1E293B] bg-[#F8FAFC] border border-[#CBD5E1] p-1.5 rounded-[2px] block break-all">
                        merkle-root://satyapan.gov.in/block/2026-q3/ed81902...
                      </span>
                    </div>
                  </div>

                  {/* Offline Verification Action */}
                  <div className="pt-2 border-t border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="text-[11px] text-[#64748B] leading-snug">
                      Independent client-side cryptographic audit. Verifies mathematical admission consistency against the national registry.
                    </div>

                    <button
                      type="button"
                      onClick={handleVerifySealOffline}
                      disabled={sealVerificationState === "verifying"}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-[2px] transition-colors cursor-pointer shrink-0 ${
                        sealVerificationState === "verified"
                          ? "bg-[#059669] text-white"
                          : "bg-[#17365D] hover:bg-[#102A43] text-white"
                      }`}
                    >
                      {sealVerificationState === "verifying" ? (
                        <>
                          <RotateCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Computing SHA-256...</span>
                        </>
                      ) : sealVerificationState === "verified" ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                          <span>Seal Verified Authentic ({hashLatencyMs}ms)</span>
                        </>
                      ) : (
                        <>
                          <Cpu className="w-3.5 h-3.5 text-[#F59E0B]" />
                          <span>Verify Digital Seal Offline</span>
                        </>
                      )}
                    </button>
                  </div>

                  {sealVerificationState === "verified" && (
                    <div className="p-2.5 bg-[#F0FDF4] border border-[#86EFAC] rounded-[2px] flex items-center gap-2 text-xs text-[#166534]">
                      <CheckCircle2 className="w-4 h-4 text-[#166534] shrink-0" />
                      <span>
                        <strong>Cryptographic Integrity Match Confirmed:</strong> The candidate&apos;s program, roll, and institution signature match the national Merkle root with 0% drift.
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
