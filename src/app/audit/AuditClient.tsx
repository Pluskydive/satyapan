"use client";

import Link from "next/link";
import { useLanguage } from "@/components/LanguageProvider";
import type { AuditLog } from "@/lib/types";

interface Props {
  logs: AuditLog[];
}

export default function AuditClient({ logs }: Props) {
  const { locale } = useLanguage();
  const isHi = locale === "hi";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4">
      {/* Official Government Breadcrumb */}
      <div className="bg-[#EAEFF5] border border-[#CBD5E1] px-4 py-1.5 rounded-[2px] text-xs text-[#334155] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-[11px]">
          <Link href="/" className="text-[#205081] font-semibold hover:underline">
            {isHi ? "मुख्य पृष्ठ" : "Home"}
          </Link>
          <span className="text-[#94A3B8]">&gt;</span>
          <span className="text-[#205081] font-semibold">
            {isHi ? "प्रणाली प्रशासन" : "System Administration"}
          </span>
          <span className="text-[#94A3B8]">&gt;</span>
          <span className="text-[#102A43] font-bold">
            {isHi ? "सिस्टम ऑडिट एवं कार्यकलाप लॉग" : "System Activity Log"}
          </span>
        </div>
        <div className="hidden sm:block text-[10px] font-mono text-[#64748B]">
          Audit Trail: Immutable Append-Only
        </div>
      </div>

      {/* 1. Department Header Block */}
      <div className="bg-white border-l-4 border-l-[#FF9933] border-y border-r border-[#CBD5E1] p-4 sm:p-5 rounded-[2px] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" aria-hidden="true" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#205081]">
              {isHi
                ? "भारत सरकार • राष्ट्रीय सूचना विज्ञान सुरक्षा • अपरिवर्तनीय ऑडिट ट्रेल"
                : "GOVERNMENT OF INDIA • SYSTEM SECURITY & IMMUTABLE AUDIT TRAIL"}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#102A43] mt-1">
            {isHi ? "प्रणाली कार्यकलाप एवं ऑडिट लॉग" : "System Security & Activity Audit Log"}
          </h1>
        </div>

        <div className="text-xs font-bold text-[#059669] bg-[#ECFDF5] border border-[#A7F3D0] px-3 py-1.5 rounded-[2px] self-start sm:self-auto font-mono">
          {isHi ? "सक्रिय ऑडिटिंग" : "Active Audit Stream"}
        </div>
      </div>

      {/* System Audit Status Ledger Ribbon */}
      <div className="bg-white border border-[#CBD5E1] rounded-[2px] p-4 shadow-xs divide-y sm:divide-y-0 sm:divide-x divide-[#CBD5E1] grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-0">
        <div className="sm:px-4">
          <div className="text-[10px] text-[#64748B] font-bold uppercase tracking-wider">
            {isHi ? "कुल पंजीकृत घटनाएं" : "Total Logged Events"}
          </div>
          <div className="text-xl font-bold text-[#102A43] mt-0.5 font-mono">
            {logs.length} {isHi ? "प्रविष्टियां" : "entries"}
          </div>
        </div>
        <div className="sm:px-4 pt-3 sm:pt-0">
          <div className="text-[10px] text-[#64748B] font-bold uppercase tracking-wider">
            {isHi ? "सुरक्षा स्थिति" : "Security Standing"}
          </div>
          <div className="text-xl font-bold text-[#059669] mt-0.5 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#10B981]" aria-hidden="true" />
            <span>{isHi ? "छेड़छाड़-रहित एवं सक्रिय" : "Tamper-Evident & Active"}</span>
          </div>
        </div>
        <div className="sm:px-4 pt-3 sm:pt-0">
          <div className="text-[10px] text-[#64748B] font-bold uppercase tracking-wider">
            {isHi ? "सिंक्रनाइज़ेशन समय" : "Sync Time"}
          </div>
          <div className="text-xl font-bold text-[#102A43] mt-0.5 font-mono">
            {new Date().toLocaleTimeString()} IST
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white border border-[#CBD5E1] rounded-[2px] overflow-hidden shadow-xs">
        <div className="p-3 sm:p-4 border-b border-[#CBD5E1] flex items-center justify-between bg-[#EAEFF5]">
          <div>
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#205081]">
              {isHi ? "अपरिवर्तनीय लेखापरीक्षण लॉग" : "Immutable Regulatory Audit Ledger"}
            </div>
            <h2 className="text-xs sm:text-sm font-bold text-[#102A43] mt-0.5">
              {isHi ? `कार्यवाही इतिहास (${logs.length} घटनाएं)` : `Activity History (${logs.length} events)`}
            </h2>
          </div>
          <span className="text-[11px] font-mono text-[#64748B]">
            Indian Standard Time (IST)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[850px]">
            <thead className="bg-[#205081] text-white uppercase text-[10px] font-bold">
              <tr>
                <th scope="col" className="w-12 py-2.5 px-3 border-r border-[#112D4E] text-center">{isHi ? "क्र." : "Sr."}</th>
                <th scope="col" className="py-2.5 px-3 font-mono border-r border-[#112D4E] w-28">{isHi ? "इवेंट आईडी" : "Event ID"}</th>
                <th scope="col" className="py-2.5 px-3 font-mono border-r border-[#112D4E] w-44">{isHi ? "दिनांक व समय" : "Timestamp"}</th>
                <th scope="col" className="py-2.5 px-3 border-r border-[#112D4E] w-36">{isHi ? "भूमिका" : "Role"}</th>
                <th scope="col" className="py-2.5 px-3 border-r border-[#112D4E] w-44">{isHi ? "कार्रवाई" : "Action"}</th>
                <th scope="col" className="py-2.5 px-3 border-r border-[#112D4E] w-40">{isHi ? "इकाई" : "Entity"}</th>
                <th scope="col" className="py-2.5 px-3">{isHi ? "विवरण सारांश" : "Summary"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#CBD5E1] text-[#102A43]">
              {logs.map((log, idx) => (
                <tr
                  key={log.id}
                  className={`font-mono text-[11px] transition-colors ${
                    idx % 2 === 0
                      ? "bg-white hover:bg-[#EAEFF5]"
                      : "bg-[#F4F6F9] hover:bg-[#EAEFF5]"
                  }`}
                >
                  <td className="py-2.5 px-3 text-center font-bold text-[#64748B] border-r border-[#CBD5E1]">
                    {idx + 1}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-[#205081] border-r border-[#CBD5E1]">
                    {log.id}
                  </td>
                  <td className="py-2.5 px-3 text-[#64748B] border-r border-[#CBD5E1]">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 font-sans text-xs border-r border-[#CBD5E1]">
                    <span className="px-2 py-0.5 bg-white border border-[#CBD5E1] text-[#205081] text-[10px] font-bold uppercase rounded-[2px]">
                      {log.actor_role}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-[#102A43] border-r border-[#CBD5E1]">
                    {log.action}
                  </td>
                  <td className="py-2.5 px-3 text-[#64748B] border-r border-[#CBD5E1]">
                    {log.entity}
                  </td>
                  <td className="py-2.5 px-3 text-[#334155] max-w-xs truncate text-[10px]">
                    {log.after_data ? JSON.stringify(log.after_data) : (isHi ? "कार्रवाई पूर्ण" : "Operation completed")}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-xs text-[#64748B]">
                    {isHi ? "कोई ऑडिट लॉग उपलब्ध नहीं है।" : "No audit events logged yet."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
