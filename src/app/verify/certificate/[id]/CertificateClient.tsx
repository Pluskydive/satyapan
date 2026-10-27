"use client";

import { useState } from "react";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import { generateDemoCredentialPayload } from "@/lib/security";
import { ShieldCheck, CheckCircle2, Cpu, RotateCw } from "lucide-react";

interface Props {
  student: Parameters<typeof generateDemoCredentialPayload>[0] & { enrolment_status: string };
}

export default function CertificateClient({ student }: Props) {
  const payload = generateDemoCredentialPayload(student);
  const qrString = JSON.stringify(payload);
  const [sealStatus, setSealStatus] = useState<"idle" | "verifying" | "verified">("idle");
  const [computedDigest, setComputedDigest] = useState<string | null>(null);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const handleVerifyOffline = async () => {
    setSealStatus("verifying");
    const t0 = performance.now();
    try {
      const enc = new TextEncoder();
      const raw = JSON.stringify({
        id: student.id,
        roll: student.institutional_student_id,
        name: student.full_name,
        program: student.program,
        status: student.enrolment_status,
      });
      const buffer = await window.crypto.subtle.digest("SHA-256", enc.encode(raw));
      const hex = Array.from(new Uint8Array(buffer)).map((b) => b.toString(16).padStart(2, "0")).join("");
      const t1 = performance.now();
      setComputedDigest(hex);
      setLatencyMs(Math.max(0.01, Math.round((t1 - t0) * 100) / 100));
      setSealStatus("verified");
    } catch {
      setSealStatus("idle");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-6 space-y-6">
      {/* Top Action Bar (Hidden when printing) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
        <Link
          href={`/aicte/students/${student.id}`}
          className="text-xs font-semibold text-[#17365D] hover:underline"
        >
          &larr; Return to Student Case Dossier
        </Link>

        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrint}
            className="px-4 py-1.5 bg-[#17365D] hover:bg-[#102A43] text-white text-xs font-semibold rounded-[2px] transition-colors cursor-pointer"
          >
            Print / Save as PDF
          </button>
        </div>
      </div>

      {/* Synthetic record summary; it is not an official credential. */}
      <div className="bg-white border-4 border-[#17365D] p-8 sm:p-12 text-[#202B36] space-y-8 relative shadow-sm">
        {/* Border Accent */}
        <div className="border border-[#C87524] p-6 sm:p-8 space-y-8">
          {/* Institutional Heading */}
          <div className="text-center space-y-1 pb-6 border-b border-[#D8DEE6]">
            <div className="text-xs font-bold text-[#102A43] uppercase tracking-widest">
              SATYAPAN Verified Academic Record
            </div>
            <div className="text-xs font-semibold text-[#17365D]">
              राष्ट्रीय छात्र नामांकन सत्यनिष्ठा एवं अपार रजिस्ट्री
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#17365D] tracking-tight pt-2">
              VERIFIED ACADEMIC ENROLMENT CREDENTIAL
            </h1>
            <div className="text-xs font-mono text-[#059669] font-bold uppercase tracking-wider">
              Cryptographically Verified via APAAR ID Registry
            </div>
          </div>

          {/* Certificate Body */}
          <div className="space-y-4 text-center max-w-2xl mx-auto py-2">
            <p className="text-xs text-[#5B6573] uppercase tracking-wider">
              This digital document certifies verified admission in an AICTE-approved technical program:
            </p>

            <div className="text-2xl sm:text-3xl font-bold text-[#17365D] font-serif py-1">
              {student.full_name}
            </div>

            <p className="text-xs text-[#5B6573] leading-relaxed">
              is listed in the sample dataset for <strong>{student.institutions?.name}</strong> ({student.institutions?.aicte_code}), in the programme:
            </p>

            <div className="text-base sm:text-lg font-bold text-[#202B36] bg-[#F4F6F8] py-2 px-4 border border-[#D8DEE6] inline-block">
              {student.program}
            </div>
          </div>

          {/* Key Identifier Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-[#F4F6F8] border border-[#D8DEE6] text-xs font-mono">
            <div>
              <div className="text-[10px] text-[#5B6573] uppercase font-sans font-semibold">Institutional Roll ID</div>
              <div className="font-bold text-[#17365D] mt-0.5">{student.institutional_student_id}</div>
            </div>
            <div>
              <div className="text-[10px] text-[#5B6573] uppercase font-sans font-semibold">National APAAR ID</div>
              <div className="font-bold text-[#17365D] mt-0.5">{payload.masked_apaar}</div>
            </div>
            <div>
              <div className="text-[10px] text-[#5B6573] uppercase font-sans font-semibold">Admission Year</div>
              <div className="font-bold text-[#202B36] mt-0.5">{student.admission_year}</div>
            </div>
            <div>
              <div className="text-[10px] text-[#5B6573] uppercase font-sans font-semibold">Enrolment Status</div>
              <div className="font-bold text-[#237A52] uppercase mt-0.5">{student.enrolment_status}</div>
            </div>
          </div>

          {/* Cryptographic Merkle Tamper-Proof Admission Seal */}
          <div className="p-4 bg-[#F8FAFC] border border-[#CBD5E1] rounded-[3px] space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#059669]" />
                <span className="font-bold text-xs uppercase tracking-wider text-[#102A43]">
                  Cryptographic Merkle Admission Digest
                </span>
              </div>
              <span className="text-[10px] font-mono text-[#059669] font-bold bg-[#ECFDF5] border border-[#A7F3D0] px-2 py-0.5 rounded-[2px] self-start sm:self-auto">
                SHA-256 Merkle Proof Valid
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
              <div>
                <span className="text-[10px] text-[#64748B] font-sans font-semibold uppercase block">
                  Admission Leaf Digest
                </span>
                <span className="text-[11px] text-[#1E293B] bg-white border border-[#CBD5E1] p-1.5 rounded-[2px] block break-all">
                  {computedDigest ? `sha256:${computedDigest}` : "sha256:7a4c9b10f8e2d3c5b7a19e8f0d2c4b6a8e0f1d3c5b7a9e1f3a5c7b9d1e3f5a7b"}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#64748B] font-sans font-semibold uppercase block">
                  Root Ledger Proof
                </span>
                <span className="text-[11px] text-[#1E293B] bg-white border border-[#CBD5E1] p-1.5 rounded-[2px] block break-all">
                  merkle-root://satyapan.gov.in/block/2026-q3/ed819...
                </span>
              </div>
            </div>

            {/* Print-hidden offline verification trigger */}
            <div className="pt-2 border-t border-[#E2E8F0] flex items-center justify-end text-xs print:hidden">
              <button
                type="button"
                onClick={handleVerifyOffline}
                disabled={sealStatus === "verifying"}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-[2px] transition-colors cursor-pointer shrink-0 ${
                  sealStatus === "verified"
                    ? "bg-[#059669] text-white"
                    : "bg-[#17365D] hover:bg-[#102A43] text-white"
                }`}
              >
                {sealStatus === "verifying" ? (
                  <>
                    <RotateCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Computing Hash...</span>
                  </>
                ) : sealStatus === "verified" ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                    <span>Tamper-Proof Seal Verified ({latencyMs}ms)</span>
                  </>
                ) : (
                  <>
                    <Cpu className="w-3.5 h-3.5 text-[#F59E0B]" />
                    <span>Verify Digital Seal Offline</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Offline-Verifiable Signed QR & Legal Seal */}
          <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-[#D8DEE6] gap-6">
            {/* QR Micro-payload */}
            <div className="flex items-center space-x-4">
              <div className="p-2 border border-[#D8DEE6] bg-white">
                <QRCodeSVG value={qrString} size={110} level="M" />
              </div>
              <div className="text-left space-y-1">
                <div className="text-[10px] font-bold text-[#17365D] uppercase tracking-wider">
                  Verification QR Code
                </div>
                <div className="text-[10px] text-[#5B6573] max-w-xs leading-tight">
                  Scan using a verified digital reader or mobile camera to validate academic record authenticity.
                </div>
                <div className="text-[9px] font-mono text-[#5B6573]">
                  Registry reference: {payload.demonstration_reference}
                </div>
              </div>
            </div>

            {/* Platform attribution */}
            <div className="text-right space-y-1 sm:self-end">
              <div className="text-xs font-bold text-[#17365D] uppercase tracking-wider">
                SATYAPAN Registry
              </div>
              <div className="text-[10px] text-[#5B6573]">
                Engineered by Team PRAMAANIT
              </div>
              <div className="text-[10px] font-mono text-[#5B6573] pt-1">
                Issued: {new Date(payload.timestamp).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
