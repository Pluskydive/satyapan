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
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4">
      {/* Maharashtra.gov.in Official Breadcrumb */}
      <div className="bg-[#EAEFF5] border border-[#CBD5E1] px-4 py-1.5 rounded-[2px] text-xs text-[#334155] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-[11px]">
          <Link href="/" className="text-[#205081] font-semibold hover:underline">
            मुख्य पृष्ठ / Home
          </Link>
          <span className="text-[#94A3B8]">&gt;</span>
          <Link href="/institution" className="text-[#205081] font-semibold hover:underline">
            महाविद्यालयीन प्रशासन / College Administration
          </Link>
          <span className="text-[#94A3B8]">&gt;</span>
          <span className="text-[#102A43] font-bold">
            सॉफ्टवेअर इंटिग्रेशन / API Integration
          </span>
        </div>
        <div className="hidden sm:block text-[10px] font-mono text-[#64748B]">
          RESTful v1 | Mutual TLS Supported
        </div>
      </div>

      {/* 1. Maharashtra.gov.in Department Header Block */}
      <section className="bg-white border-l-4 border-l-[#FF9933] border-y border-r border-[#CBD5E1] p-4 sm:p-5 rounded-[2px] shadow-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" aria-hidden="true" />
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#205081]">
            महाराष्ट्र शासन • तंत्रशिक्षण संचालनालय • System Interoperability
          </span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#102A43] mt-1">
          महाविद्यालयीन सॉफ्टवेअर जोडणी / College Software Connection (API)
        </h1>
        <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
          आपल्या महाविद्यालयाच्या ईआरपी (ERP) किंवा विद्यार्थी डेटाबेस प्रणालीशी थेट सुरक्षित जोडणी स्थापित करण्यासाठी अधिकृत कळी वापरा.
        </p>

        {/* API Credentials Box */}
        <div className="mt-4 p-3.5 bg-[#F4F6F9] border border-[#CBD5E1] rounded-[2px] space-y-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#205081] block">संस्था API गुप्त कळी / Institutional Secret Key</span>
              <div className="font-mono text-xs text-[#102A43] mt-1 select-all bg-white px-3 py-1.5 border border-[#CBD5E1] rounded-[2px] inline-block font-bold">
                {apiKey}
              </div>
            </div>
            <button
              type="button"
              onClick={handleCopy}
              className="px-3.5 py-1.5 bg-[#205081] hover:bg-[#112D4E] text-white text-xs font-bold rounded-[2px] transition-colors cursor-pointer self-start sm:self-auto shadow-xs"
            >
              {copied ? "प्रत तयार झाली! / Copied!" : "कळी कॉपी करा / Copy Key"}
            </button>
          </div>
          <div className="text-[11px] text-[#64748B]">
            अधिकृत API URL: <code className="font-mono text-[#205081] font-bold">https://api.satyapan.gov.in/v1</code>
          </div>
        </div>
      </section>

      {/* Available Endpoints (Maharashtra GR Style Table) */}
      <section className="bg-white border border-[#CBD5E1] rounded-[2px] overflow-hidden shadow-xs">
        <div className="p-3 sm:p-4 border-b border-[#CBD5E1] bg-[#EAEFF5]">
          <h2 className="text-xs sm:text-sm font-bold text-[#205081] uppercase tracking-wider">
            मान्यताप्राप्त इंटिग्रेशन एंडपॉइंट्स / Supported Integration Endpoints
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#205081] text-white uppercase text-[10px] font-bold">
              <tr>
                <th scope="col" className="w-20 py-2.5 px-3 border-r border-[#112D4E] text-center">पद्धत</th>
                <th scope="col" className="py-2.5 px-3 border-r border-[#112D4E] font-mono">एंडपॉइंट / Endpoint</th>
                <th scope="col" className="py-2.5 px-3 border-r border-[#112D4E]">वर्णन / Description</th>
                <th scope="col" className="w-24 py-2.5 px-3 text-center">स्थिती / Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#CBD5E1] text-[#102A43]">
              <tr className="bg-white hover:bg-[#EAEFF5]">
                <td className="py-2.5 px-3 text-center border-r border-[#CBD5E1]">
                  <span className="font-mono text-[10px] font-bold bg-[#059669] text-white px-2 py-0.5 rounded-[2px]">POST</span>
                </td>
                <td className="py-2.5 px-3 font-mono font-bold text-[#205081] border-r border-[#CBD5E1]">/v1/students/sync</td>
                <td className="py-2.5 px-3 text-[#334155] border-r border-[#CBD5E1]">
                  महाविद्यालयाच्या सॉफ्टवेअरमधून थेट नवीन विद्यार्थी प्रवेशांची नोंदणी व तात्काळ पडताळणी.
                </td>
                <td className="py-2.5 px-3 text-center">
                  <span className="text-[10px] font-bold text-[#059669] bg-[#ECFDF5] border border-[#A7F3D0] px-2 py-0.5 rounded-[2px]">सक्रिय</span>
                </td>
              </tr>
              <tr className="bg-[#F4F6F9] hover:bg-[#EAEFF5]">
                <td className="py-2.5 px-3 text-center border-r border-[#CBD5E1]">
                  <span className="font-mono text-[10px] font-bold bg-[#205081] text-white px-2 py-0.5 rounded-[2px]">GET</span>
                </td>
                <td className="py-2.5 px-3 font-mono font-bold text-[#205081] border-r border-[#CBD5E1]">/v1/intake/status</td>
                <td className="py-2.5 px-3 text-[#334155] border-r border-[#CBD5E1]">
                  संस्थेच्या मंजूर जागा, शिल्लक कोटा आणि प्रत्यक्ष प्रवेश सद्यस्थिती तपासणे.
                </td>
                <td className="py-2.5 px-3 text-center">
                  <span className="text-[10px] font-bold text-[#059669] bg-[#ECFDF5] border border-[#A7F3D0] px-2 py-0.5 rounded-[2px]">सक्रिय</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
