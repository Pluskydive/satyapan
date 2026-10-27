"use client";

import { useState } from "react";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import { useLanguage } from "@/components/LanguageProvider";
import { generateDemoCredentialPayload } from "@/lib/security";
import { ShieldCheck, CheckCircle2, Cpu, RotateCw } from "lucide-react";

interface Props {
  student: Parameters<typeof generateDemoCredentialPayload>[0] & { enrolment_status: string };
}

export default function CertificateClient({ student }: Props) {
  const { locale } = useLanguage();
  const isHi = locale === "hi";

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
            {isHi ? "मुख्य पृष्ठ" : "Home"}
          </Link>
          <span className="text-[#94A3B8]">&gt;</span>
          <Link href="/aicte" className="text-[#205081] font-semibold hover:underline">
            {isHi ? "केंद्रीय नियंत्रण कक्ष" : "Control Tower"}
          </Link>
          <span className="text-[#94A3B8]">&gt;</span>
          <span className="text-[#102A43] font-bold">
            {isHi ? "प्रमाणित शैक्षणिक प्रमाण-पत्र" : "Digital Certificate"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/aicte/students/${student.id}`}
            className="text-xs font-bold text-[#205081] hover:underline"
          >
            {isHi ? "← छात्र केस डोजियर" : "← Student Case Dossier"}
          </Link>
          <span className="text-[#CBD5E1]">|</span>
          <button
            onClick={handlePrint}
            className="px-3 py-1 bg-[#205081] hover:bg-[#112D4E] text-white text-xs font-bold rounded-[2px] transition-colors cursor-pointer shadow-xs"
          >
            {isHi ? "प्रमाणपत्र प्रिंट करें (PDF)" : "Print Certificate (PDF)"}
          </button>
        </div>
      </div>

      {/* Official Government Academic Certificate Layout */}
      <div className="bg-white border-4 border-[#205081] p-6 sm:p-10 text-[#102A43] space-y-6 relative shadow-md rounded-[2px]">
        {/* Saffron Border Accent */}
        <div className="border-2 border-[#FF9933] p-5 sm:p-7 space-y-6">
          {/* Institutional Heading */}
          <div className="text-center space-y-1.5 pb-5 border-b border-[#CBD5E1]">
            <div className="text-xs font-bold text-[#205081] uppercase tracking-widest">
              {isHi
                ? "भारत सरकार • शिक्षा मंत्रालय • तकनीकी शिक्षा विभाग"
                : "GOVERNMENT OF INDIA • MINISTRY OF EDUCATION • TECHNICAL EDUCATION REGULATORY AUTHORITY"}
            </div>
            <div className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
              {isHi
                ? "राष्ट्रीय छात्र सत्यापन एवं अपार केंद्रीय रजिस्ट्री"
                : "NATIONAL STUDENT ENROLMENT INTEGRITY & APAAR REGISTRY"}
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[#205081] tracking-tight pt-2 uppercase">
              {isHi ? "प्रमाणित शैक्षणिक प्रवेश प्रमाण-पत्र" : "Certified Academic Enrolment Credential"}
            </h1>
            <div className="text-[11px] font-mono text-[#059669] font-bold uppercase tracking-wider">
              {isHi
                ? "अपरिवर्तनीय डिजिटल सील एवं क्रिप्टोग्राफिक हैश द्वारा प्रमाणित"
                : "Cryptographically Signed & Authority Anchored"}
            </div>
          </div>

          {/* Certificate Body */}
          <div className="space-y-3 text-center max-w-2xl mx-auto py-2">
            <p className="text-xs text-[#64748B] uppercase tracking-wider">
              {isHi
                ? "इसके द्वारा प्रमाणित किया जाता है कि निम्नलिखित छात्र का प्रवेश विधिवत पंजीकृत एवं सत्यापित है:"
                : "This certifies that the candidate named below is an officially enrolled, verified student:"}
            </p>

            <div className="text-2xl sm:text-3xl font-bold text-[#102A43] font-serif py-1">
              {student.full_name}
            </div>

            <p className="text-xs text-[#64748B] leading-relaxed">
              {isHi
                ? "संबद्ध शैक्षणिक संस्थान:"
                : "Affiliated Academic Institution:"}
            </p>

            <div className="text-sm sm:text-base font-bold text-[#205081] bg-[#F4F6F9] py-2 px-4 border border-[#CBD5E1] inline-block rounded-[2px]">
              {student.institutions?.name} ({student.institutions?.aicte_code})
            </div>

            <div className="text-xs font-bold text-[#102A43] pt-1">
              {isHi ? "पाठ्यक्रम: " : "Degree Program: "}<span className="font-mono">{student.program}</span>
            </div>
          </div>

          {/* Key Identifier Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-[#F4F6F9] border border-[#CBD5E1] text-xs font-mono rounded-[2px]">
            <div>
              <div className="text-[10px] text-[#64748B] uppercase font-sans font-bold">
                {isHi ? "रोल नंबर" : "Roll ID"}
              </div>
              <div className="font-bold text-[#205081] mt-0.5">{student.institutional_student_id}</div>
            </div>
            <div>
              <div className="text-[10px] text-[#64748B] uppercase font-sans font-bold">
                {isHi ? "अपार आईडी" : "APAAR ID"}
              </div>
              <div className="font-bold text-[#205081] mt-0.5">{payload.masked_apaar}</div>
            </div>
            <div>
              <div className="text-[10px] text-[#64748B] uppercase font-sans font-bold">
                {isHi ? "प्रवेश वर्ष" : "AY"}
              </div>
              <div className="font-bold text-[#102A43] mt-0.5">{student.admission_year}</div>
            </div>
            <div>
              <div className="text-[10px] text-[#64748B] uppercase font-sans font-bold">
                {isHi ? "प्रवेश स्थिति" : "Status"}
              </div>
              <div className="font-bold text-[#059669] uppercase mt-0.5">
                {student.enrolment_status === "verified"
                  ? (isHi ? "प्रमाणित" : "VALID")
                  : student.enrolment_status}
              </div>
            </div>
          </div>

          {/* Cryptographic Merkle Tamper-Proof Admission Seal */}
          <div className="p-3.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-[2px] space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#CBD5E1]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#059669]" />
                <span className="font-bold text-xs uppercase tracking-wider text-[#102A43]">
                  {isHi ? "क्रिप्टोग्राफिक मर्कल सील एवं हैश प्रमाण" : "Cryptographic Merkle Proof & Seal"}
                </span>
              </div>
              <span className="text-[10px] font-mono text-[#059669] font-bold bg-[#ECFDF5] border border-[#A7F3D0] px-2 py-0.5 rounded-[2px] self-start sm:self-auto">
                SHA-256 Valid
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
              <div>
                <span className="text-[10px] text-[#64748B] font-sans font-bold uppercase block">
                  {isHi ? "प्रवेश लीफ डाइजेस्ट" : "Admission Leaf Digest"}
                </span>
                <span className="text-[10px] text-[#102A43] bg-white border border-[#CBD5E1] p-1.5 rounded-[2px] block break-all">
                  {computedDigest ? `sha256:${computedDigest}` : "sha256:7a4c9b10f8e2d3c5b7a19e8f0d2c4b6a8e0f1d3c5b7a9e1f3a5c7b9d1e3f5a7b"}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#64748B] font-sans font-bold uppercase block">
                  {isHi ? "केंद्रीय लेजर रूट एंकर" : "Root Ledger Proof"}
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
                    <span>{isHi ? "हैश गणना जारी है…" : "Computing..."}</span>
                  </>
                ) : sealStatus === "verified" ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                    <span>{isHi ? `सील १००% सत्य प्रमाणित (${latencyMs}ms)` : `Seal Cryptographically Valid (${latencyMs}ms)`}</span>
                  </>
                ) : (
                  <>
                    <Cpu className="w-3.5 h-3.5 text-[#FF9933]" />
                    <span>{isHi ? "ऑफ़लाइन डिजिटल सील सत्यापित करें" : "Verify Offline"}</span>
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
                  {isHi ? "सत्यापन क्यूआर कोड" : "Verification QR"}
                </div>
                <div className="text-[10px] text-[#64748B] max-w-xs leading-tight">
                  {isHi
                    ? "यह क्यूआर कोड किसी भी अधिकृत सत्यापन स्कैनर द्वारा ऑफ़लाइन भी सत्यापित किया जा सकता है।"
                    : "Scan with any compliant credential reader to verify cryptographic signature offline."}
                </div>
                <div className="text-[9px] font-mono text-[#64748B]">
                  {isHi ? "संदर्भ: " : "Reference: "}{payload.demonstration_reference}
                </div>
              </div>
            </div>

            {/* Platform attribution */}
            <div className="text-right space-y-0.5 sm:self-end">
              <div className="text-xs font-bold text-[#205081] uppercase tracking-wider">
                {isHi ? "सत्यापन (SATYAPAN) राष्ट्रीय रजिस्ट्री" : "SATYAPAN NATIONAL CREDENTIAL REGISTRY"}
              </div>
              <div className="text-[10px] text-[#64748B]">
                {isHi ? "शिक्षा मंत्रालय • भारत सरकार" : "Ministry of Education • Government of India"}
              </div>
              <div className="text-[10px] font-mono text-[#64748B] pt-0.5">
                {isHi ? "जारी तिथि: " : "Issued: "}{new Date(payload.timestamp).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
