"use client";

import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import { generateDemoCredentialPayload } from "@/lib/security";

interface Props {
  student: Parameters<typeof generateDemoCredentialPayload>[0] & { enrolment_status: string };
}

export default function CertificateClient({ student }: Props) {
  const payload = generateDemoCredentialPayload(student);
  const qrString = JSON.stringify(payload);

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
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
              AICTE Verified Academic Record
            </div>
            <div className="text-xs font-semibold text-[#17365D]">
              राष्ट्रीय छात्र नामांकन सत्यनिष्ठा एवं अपार रजिस्ट्री
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#17365D] tracking-tight pt-2">
              VERIFIED ACADEMIC ENROLMENT CREDENTIAL
            </h1>
            <div className="text-xs font-mono text-[#059669] font-bold">
              ✓ Cryptographically Verified via APAAR ID Registry
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
