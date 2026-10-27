"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import { useSearchParams } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { applySelectiveDisclosure } from "@/lib/security";
import type { VerificationRequest } from "@/lib/types";

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
  const searchParams = useSearchParams();
  const [code, setCode] = useState<string>(
    searchParams.get("code") || "SATYA-2026-TCS"
  );
  const [verificationResult, setVerificationResult] = useState<VerificationView | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGrantingConsent, setIsGrantingConsent] = useState(false);
  const currentOrigin = useSyncExternalStore(subscribeToNoChanges, getBrowserOrigin, getServerOrigin);

  const handleLookup = async (codeToLookup: string) => {
    if (!codeToLookup) return;
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchVerification(codeToLookup);
      setVerificationResult(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to locate verification record.");
      setVerificationResult(null);
    } finally {
      setIsLoading(false);
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
      alert("Error: " + (err instanceof Error ? err.message : "Consent authorization transaction failed."));
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
      <div className="bg-white border border-[#D8DEE6] p-5 rounded-[2px]">
        <div className="text-[10px] tracking-wider uppercase font-semibold text-[#5B6573]">
          Third-Party Background Check
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#17365D] mt-0.5">
          Employer Academic Credential Verification Terminal
        </h1>
        <p className="text-xs text-[#5B6573] mt-1 max-w-2xl leading-relaxed">
          In conformity with the Digital Personal Data Protection (DPDP) Act, 2023. Verification requests require candidate authorization before credential disclosure. Sensitive personal attributes are strictly withheld.
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
            placeholder="Enter Verification Token or Candidate Roll (e.g., SATYA-2026-TCS, STU-1)"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="flex-1 w-full px-3 py-2 bg-white border border-[#D8DEE6] text-xs font-mono uppercase text-[#202B36] rounded-[2px] focus:outline-none focus:border-[#17365D]"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto px-4 py-2 bg-[#17365D] hover:bg-[#102A43] text-white text-xs font-semibold rounded-[2px] transition-colors cursor-pointer disabled:opacity-50"
          >
            {isLoading ? "Querying..." : "Verify Token"}
          </button>
        </form>

        {/* Demo Token Presets */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#D8DEE6] text-[11px] text-[#5B6573]">
          <span className="font-semibold text-[#202B36]">Verification Presets:</span>
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
        <div className="p-3 bg-white border-l-4 border-[#B42318] text-xs text-[#B42318] border border-[#D8DEE6] rounded-[2px]">
          <strong>Verification Notice:</strong> {error}
        </div>
      )}

      {/* Verification Result Card */}
      {verificationResult && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* QR Code Container */}
          <div className="bg-white border border-[#D8DEE6] p-5 rounded-[2px] flex flex-col items-center justify-center text-center space-y-3">
            <div className="text-[10px] font-bold text-[#5B6573] uppercase tracking-wider">
              Verification QR Token
            </div>
            <div className="p-2 border border-[#D8DEE6] bg-white">
              <QRCodeSVG value={currentQrUrl} size={140} level="M" />
            </div>
            <div className="font-mono text-xs font-bold text-[#17365D] bg-[#F4F6F8] px-2 py-1 border border-[#D8DEE6]">
              {verificationResult.request.verification_code}
            </div>
            <div className="text-[10px] text-[#5B6573]">
              Scan with verified digital reader to authenticate record
            </div>
          </div>

          {/* Details & DPDP Consent Gate */}
          <div className="md:col-span-2 bg-white border border-[#D8DEE6] p-5 rounded-[2px] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#D8DEE6]">
              <div>
                <h3 className="text-sm font-bold text-[#17365D] uppercase tracking-wider">
                  Verification Authorization Status
                </h3>
                <div className="text-xs text-[#5B6573]">
                  Requesting Entity: <strong className="text-[#202B36]">{verificationResult.request.verifier_type}</strong>
                </div>
              </div>

              <span
                className={`px-2.5 py-0.5 text-xs font-mono font-bold uppercase rounded-[2px] border ${
                  verificationResult.request.consent_granted
                    ? "bg-white text-[#237A52] border-[#237A52]"
                    : "bg-white text-[#986500] border-[#986500]"
                }`}
              >
                {verificationResult.request.consent_granted ? "Consent Authorized" : "Pending Consent"}
              </span>
            </div>

            {/* Privacy Shielded state */}
            {!verificationResult.request.consent_granted ? (
              <div className="space-y-4">
                <div className="p-3 bg-[#F4F6F8] border border-[#D8DEE6] text-xs text-[#5B6573] space-y-1">
                  <div className="font-bold text-[#202B36] uppercase text-[10px] tracking-wider">
                    Statutory Privacy Notice (DPDP Act, 2023)
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    Personal identifying data for candidate <strong>{verificationResult.student_preview?.masked_name}</strong> is
                    withheld until explicit digital consent is transmitted.
                  </p>
                </div>

                <div className="p-3 border border-[#D8DEE6] space-y-2">
                  <div className="text-xs font-bold text-[#17365D] uppercase tracking-wider">
                    Candidate Digital Consent Simulation
                  </div>
                  <p className="text-[11px] text-[#5B6573] leading-relaxed">
                    In live deployment, the candidate confirms consent via registered mobile SMS or DigiLocker authorization. For evaluation, click below to execute consent transaction.
                  </p>
                  <button
                    onClick={handleGrantConsent}
                    disabled={isGrantingConsent}
                    className="w-full py-2 bg-[#237A52] hover:bg-[#1b5e3f] text-white text-xs font-bold rounded-[2px] transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isGrantingConsent ? "Processing Consent Grant..." : "Authorize Candidate Consent & Unlock Credential"}
                  </button>
                </div>
              </div>
            ) : (
              /* Disclosed Credential Certificate */
              <div className="space-y-3">
                <div className="border border-[#237A52] p-4 bg-[#F4F6F8] space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-[#D8DEE6]">
                    <span className="text-xs font-bold text-[#237A52] uppercase tracking-wider">
                      AICTE Verified Academic Credential
                    </span>
                    <span className="text-[10px] font-mono text-[#5B6573]">
                      Standard APH v2.4
                    </span>
                  </div>

                  <table className="w-full text-xs border-collapse">
                    <tbody className="divide-y divide-[#D8DEE6]">
                      <tr>
                        <td className="py-2 text-[#5B6573] w-1/3">Candidate Name</td>
                        <td className="py-2 font-bold text-[#17365D]">
                          {verificationResult.disclosed_data?.student_name}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2 text-[#5B6573]">Enrolment Status</td>
                        <td className="py-2 font-mono font-bold text-[#237A52] uppercase">
                          {verificationResult.disclosed_data?.enrolment_status}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2 text-[#5B6573]">Degree Program</td>
                        <td className="py-2 text-[#202B36]">
                          {verificationResult.disclosed_data?.program}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2 text-[#5B6573]">Admission Year</td>
                        <td className="py-2 font-mono text-[#202B36]">
                          Class of {verificationResult.disclosed_data?.admission_year}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2 text-[#5B6573]">Affiliated College</td>
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
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
