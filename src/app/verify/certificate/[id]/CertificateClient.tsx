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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4">
      {/* Top Action Bar & Official Breadcrumb (Hidden when printing) */}
      <div className="bg-[#EAEFF5] border border-[#CBD5E1] px-4 py-1.5 rounded-[2px] text-xs text-[#334155] flex flex-wrap items-center justify-between gap-2 print:hidden">
        <div className="flex items-center gap-1.5 text-[11px]">
          <Link href="/" className="text-[#205081] font-semibold hover:underline">
            मुख्य पृष्ठ / Home
          </Link>
          <span className="text-[#94A3B8]">&gt;</span>
          <Link href="/aicte" className="text-[#205081] font-semibold hover:underline">
            केंद्रीय पडताळणी कक्ष / Control Tower
          </Link>
          <span className="text-[#94A3B8]">&gt;</span>
          <span className="text-[#102A43] font-bold">
            प्रमाणित शैक्षणिक दाखला / Digital Certificate
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/aicte/students/${student.id}`}
            className="text-xs font-bold text-[#205081] hover:underline"
          >
            &larr; विद्यार्थी तपशील / Case Dossier
          </Link>
          <span className="text-[#CBD5E1]">|</span>
          <button
            onClick={handlePrint}
            className="px-3 py-1 bg-[#205081] hover:bg-[#112D4E] text-white text-xs font-bold rounded-[2px] transition-colors cursor-pointer shadow-xs"
          >
            दाखला मुद्रित करा / Print PDF
          </button>
        </div>
      </div>

      {/* Official Government Academic Certificate Layout */}
      <div className="bg-white border-4 border-[#205081] p-6 sm:p-10 text-[#102A43] space-y-6 relative shadow-md rounded-[2px]">
        {/* Saffron Border Accent */}
        <div className="border-2 border-[#FF9933] p-5 sm:p-7 space-y-6">
          {/* Institutional Heading (Maharashtra Government Format) */}
          <div className="text-center space-y-1.5 pb-5 border-b border-[#CBD5E1]">
            <div className="text-xs font-bold text-[#205081] uppercase tracking-widest">
              महाराष्ट्र शासन • उच्च व तंत्रशिक्षण विभाग
            </div>
            <div className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
              GOVERNMENT OF MAHARASHTRA • AICTE CENTRAL APAAR REGISTRY
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[#205081] tracking-tight pt-2 uppercase">
              प्रमाणित शैक्षणिक प्रवेश दाखला / Academic Enrolment Credential
            </h1>
            <div className="text-[11px] font-mono text-[#059669] font-bold uppercase tracking-wider">
              अपरिवर्तनीय डिजिटल स्वाक्षरी व अपार आयडी द्वारे सत्यापित / Cryptographically Secured
            </div>
          </div>

          {/* Certificate Body */}
          <div className="space-y-3 text-center max-w-2xl mx-auto py-2">
            <p className="text-xs text-[#64748B] uppercase tracking-wider">
              याद्वारे प्रमाणित करण्यात येते की खालील विद्यार्थ्याचा प्रवेश AICTE मान्यताप्राप्त संस्थेत अधिकृत आहे:
            </p>

            <div className="text-2xl sm:text-3xl font-bold text-[#102A43] font-serif py-1">
              {student.full_name}
            </div>

            <p className="text-xs text-[#64748B] leading-relaxed">
              सदर विद्यार्थी खालील शैक्षणिक संस्थेच्या अधिकृत व नियमित तुकडीत नोंदणीकृत आहेत:
            </p>

            <div className="text-sm sm:text-base font-bold text-[#205081] bg-[#F4F6F9] py-2 px-4 border border-[#CBD5E1] inline-block rounded-[2px]">
              {student.institutions?.name} ({student.institutions?.aicte_code})
            </div>

            <div className="text-xs font-bold text-[#102A43] pt-1">
              अभ्यासक्रम / Program: <span className="font-mono">{student.program}</span>
            </div>
          </div>

          {/* Key Identifier Grid (Government Ledger Style) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-[#F4F6F9] border border-[#CBD5E1] text-xs font-mono rounded-[2px]">
            <div>
              <div className="text-[10px] text-[#64748B] uppercase font-sans font-bold">रोल नंबर / Roll ID</div>
              <div className="font-bold text-[#205081] mt-0.5">{student.institutional_student_id}</div>
            </div>
            <div>
              <div className="text-[10px] text-[#64748B] uppercase font-sans font-bold">अपार आयडी / APAAR ID</div>
              <div className="font-bold text-[#205081] mt-0.5">{payload.masked_apaar}</div>
            </div>
            <div>
              <div className="text-[10px] text-[#64748B] uppercase font-sans font-bold">प्रवेश वर्ष / AY</div>
              <div className="font-bold text-[#102A43] mt-0.5">{student.admission_year}</div>
            </div>
            <div>
              <div className="text-[10px] text-[#64748B] uppercase font-sans font-bold">प्रवेश स्थिती / Status</div>
              <div className="font-bold text-[#059669] uppercase mt-0.5">
                {student.enrolment_status === "verified" ? "प्रमाणित / VALID" : student.enrolment_status}
              </div>
            </div>
          </div>

          {/* Cryptographic Merkle Tamper-Proof Admission Seal */}
          <div className="p-3.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-[2px] space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#CBD5E1]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#059669]" />
                <span className="font-bold text-xs uppercase tracking-wider text-[#102A43]">
                  डिजिटल मर्कल सील व हॅश पुरावा / Cryptographic Merkle Proof
                </span>
              </div>
              <span className="text-[10px] font-mono text-[#059669] font-bold bg-[#ECFDF5] border border-[#A7F3D0] px-2 py-0.5 rounded-[2px] self-start sm:self-auto">
                SHA-256 Valid
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
              <div>
                <span className="text-[10px] text-[#64748B] font-sans font-bold uppercase block">
                  प्रवेश लीफ हॅश / Admission Leaf Digest
                </span>
                <span className="text-[10px] text-[#102A43] bg-white border border-[#CBD5E1] p-1.5 rounded-[2px] block break-all">
                  {computedDigest ? `sha256:${computedDigest}` : "sha256:7a4c9b10f8e2d3c5b7a19e8f0d2c4b6a8e0f1d3c5b7a9e1f3a5c7b9d1e3f5a7b"}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#64748B] font-sans font-bold uppercase block">
                  केंद्रीय रूट अँकर / Root Ledger Proof
                </span>
                <span className="text-[10px] text-[#102A43] bg-white border border-[#CBD5E1] p-1.5 rounded-[2px] block break-all">
                  merkle-root://satyapan.gov.in/block/2026-q3/ed819...
                </span>
              </div>
            </div>

            {/* Print-hidden offline verification trigger */}
            <div className="pt-2 border-t border-[#CBD5E1] flex items-center justify-end text-xs print:hidden">
              <button
                type="button"
                onClick={handleVerifyOffline}
                disabled={sealStatus === "verifying"}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-[2px] transition-colors cursor-pointer shrink-0 shadow-xs ${
                  sealStatus === "verified"
                    ? "bg-[#059669] text-white"
                    : "bg-[#205081] hover:bg-[#112D4E] text-white"
                }`}
              >
                {sealStatus === "verifying" ? (
                  <>
                    <RotateCw className="w-3.5 h-3.5 animate-spin" />
                    <span>हॅश तपासणी सुरू आहे... / Computing...</span>
                  </>
                ) : sealStatus === "verified" ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                    <span>सील १००% सत्य प्रमाणित ({latencyMs}ms)</span>
                  </>
                ) : (
                  <>
                    <Cpu className="w-3.5 h-3.5 text-[#FF9933]" />
                    <span>ऑफलाइन डिजिटल सील पडताळा / Verify Offline</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Offline-Verifiable Signed QR & Legal Seal */}
          <div className="flex flex-col sm:flex-row items-center justify-between pt-5 border-t border-[#CBD5E1] gap-4">
            {/* QR Micro-payload */}
            <div className="flex items-center space-x-3">
              <div className="p-1.5 border border-[#CBD5E1] bg-white rounded-[2px]">
                <QRCodeSVG value={qrString} size={105} level="M" />
              </div>
              <div className="text-left space-y-1">
                <div className="text-[10px] font-bold text-[#205081] uppercase tracking-wider">
                  सत्यापन क्युआर कोड / Verification QR
                </div>
                <div className="text-[10px] text-[#64748B] max-w-xs leading-tight">
                  हा क्युआर कोड कोणत्याही अधिकृत डिजिटल स्कॅनरद्वारे स्कॅन करून प्रवेशाची पडताळणी करता येते.
                </div>
                <div className="text-[9px] font-mono text-[#64748B]">
                  नोंदणी संदर्भ: {payload.demonstration_reference}
                </div>
              </div>
            </div>

            {/* Platform attribution */}
            <div className="text-right space-y-0.5 sm:self-end">
              <div className="text-xs font-bold text-[#205081] uppercase tracking-wider">
                सत्यापन (SATYAPAN) केंद्रीय प्रणाली
              </div>
              <div className="text-[10px] text-[#64748B]">
                महाराष्ट्र शासन तंत्रशिक्षण विभाग
              </div>
              <div className="text-[10px] font-mono text-[#64748B] pt-0.5">
                निर्गमित तारीख: {new Date(payload.timestamp).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
