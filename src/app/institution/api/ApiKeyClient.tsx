"use client";

import { useState } from "react";
import Link from "next/link";

export default function ApiKeyClient() {
  const [copied, setCopied] = useState(false);
  const apiKey = "satya_inst_1001_8f93a2e7c41b89d6e502";

  const handleCopy = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/institution" className="text-xs font-semibold text-[#17365D] hover:underline flex items-center gap-1">
          &larr; Back to College Seats
        </Link>
      </div>

      {/* Main Title */}
      <section className="bg-white border border-[#D8DEE6] p-6 rounded-[6px] shadow-xs">
        <h1 className="text-xl sm:text-2xl font-bold text-[#102A43]">
          College Software Connection (API)
        </h1>
        <p className="text-xs sm:text-sm text-[#5B6573] mt-1 leading-relaxed">
          Connect your college ERP or student database to automatically sync admission records with SATYAPAN.
        </p>

        {/* API Credentials Box */}
        <div className="mt-6 p-4 bg-[#F8FAFC] border border-[#CBD5E1] rounded-[4px] space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#475569]">Institution API Key</span>
              <div className="font-mono text-xs text-[#0F172A] mt-0.5 select-all bg-white px-3 py-1.5 border border-[#CBD5E1] rounded-[3px] inline-block">
                {apiKey}
              </div>
            </div>
            <button
              type="button"
              onClick={handleCopy}
              className="px-3 py-1.5 bg-[#17365D] hover:bg-[#102A43] text-white text-xs font-semibold rounded-[3px] transition-colors cursor-pointer self-start sm:self-auto"
            >
              {copied ? "Copied!" : "Copy Key"}
            </button>
          </div>
          <div className="text-[11px] text-[#64748B]">
            Base API URL: <code className="font-mono text-[#17365D]">https://api.satyapan.gov.in/v1</code>
          </div>
        </div>
      </section>

      {/* Available Endpoints */}
      <section className="bg-white border border-[#D8DEE6] p-6 rounded-[6px] space-y-4 shadow-xs">
        <h2 className="text-sm font-bold text-[#102A43] uppercase tracking-wider">
          Supported Integration Endpoints
        </h2>
        <div className="space-y-3">
          <div className="p-3.5 border border-[#E2E8F0] rounded-[4px] flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[#F8FAFC]">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] font-bold bg-[#10B981] text-white px-2 py-0.5 rounded-[2px]">POST</span>
                <span className="font-mono text-xs font-bold text-[#17365D]">/v1/students/sync</span>
              </div>
              <p className="text-xs text-[#64748B] mt-1">Sync new student admission rosters directly from your college admission software.</p>
            </div>
            <span className="text-[11px] font-semibold text-[#059669] bg-[#ECFDF5] px-2.5 py-1 rounded-[3px] border border-[#A7F3D0]">Active</span>
          </div>

          <div className="p-3.5 border border-[#E2E8F0] rounded-[4px] flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[#F8FAFC]">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] font-bold bg-[#3B82F6] text-white px-2 py-0.5 rounded-[2px]">GET</span>
                <span className="font-mono text-xs font-bold text-[#17365D]">/v1/intake/status</span>
              </div>
              <p className="text-xs text-[#64748B] mt-1">Check approved seat capacity and current admissions for your college.</p>
            </div>
            <span className="text-[11px] font-semibold text-[#059669] bg-[#ECFDF5] px-2.5 py-1 rounded-[3px] border border-[#A7F3D0]">Active</span>
          </div>
        </div>
      </section>
    </main>
  );
}
