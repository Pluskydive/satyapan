"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const [isRunning, setIsRunning] = useState(false);
  const [lastRunResult, setLastRunResult] = useState<string | null>(null);

  const handleRunIntegrity = async () => {
    try {
      setIsRunning(true);
      setLastRunResult(null);
      const res = await fetch("/api/integrity/run", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setLastRunResult("Integrity Engine executed: Validation rules processed across all institution rosters.");
        window.dispatchEvent(new CustomEvent("satyapan:refresh"));
      } else {
        setLastRunResult("Execution error: " + (data.error || "Unknown error"));
      }
    } catch {
      setLastRunResult("Failed to reach Integrity Engine endpoint.");
    } finally {
      setIsRunning(false);
      setTimeout(() => setLastRunResult(null), 6000);
    }
  };

  const navLinks = [
    { href: "/aicte", label: "National Control Tower" },
    { href: "/institution", label: "Institution Seat Ledgers" },
    { href: "/institution/upload", label: "CSV Data Ingestion" },
    { href: "/verify", label: "Employer Verification" },
    { href: "/audit", label: "Audit Ledger" },
  ];

  return (
    <>
      <header className="w-full bg-white border-b border-[#D8DEE6]">
        {/* Tier 1: Government of India Top Utility Bar */}
        <div className="bg-[#102A43] text-white text-[11px] px-4 sm:px-8 py-1.5 border-b border-[#17365D] flex flex-wrap items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="font-semibold text-slate-200">भारत सरकार | Government of India</span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-300">अखिल भारतीय तकनीकी शिक्षा परिषद</span>
          </div>
          <div className="flex items-center space-x-4 text-slate-300">
            <span className="hidden sm:inline">Screen Reader Access</span>
            <span className="hidden sm:inline text-slate-500">|</span>
            <span>DPDP Act 2023 Compliant</span>
            <span className="text-slate-500">|</span>
            <span className="font-mono text-slate-200">Role: Central Admin</span>
          </div>
        </div>

        {/* Tier 2: Institutional Brand Header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-[10px] tracking-wider uppercase font-semibold text-[#5B6573]">
              All India Council for Technical Education
            </div>
            <Link href="/" className="inline-block">
              <span className="text-xl sm:text-2xl font-bold tracking-tight text-[#17365D]">
                SATYAPAN
              </span>
              <span className="text-sm font-medium text-[#5B6573] ml-2">
                National Enrolment Integrity & APAAR Registry System
              </span>
            </Link>
          </div>

          <div className="flex items-center space-x-3 self-start sm:self-auto">
            <button
              onClick={handleRunIntegrity}
              disabled={isRunning}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-[2px] bg-[#C87524] hover:bg-[#a65f1a] text-white transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isRunning ? "Executing Integrity Engine..." : "Run Integrity Engine"}
            </button>
          </div>
        </div>

        {/* Tier 3: Primary Navigation Bar */}
        <nav className="bg-[#17365D] text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 flex overflow-x-auto">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2.5 text-xs font-medium whitespace-nowrap transition-colors border-b-3 ${
                    isActive
                      ? "text-white border-[#C87524] bg-[#102A43]/50 font-semibold"
                      : "text-slate-200 border-transparent hover:text-white hover:bg-[#102A43]/30"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </header>

      {/* Execution Feedback Notification */}
      {lastRunResult && (
        <div className="fixed bottom-4 right-4 z-50 max-w-md bg-white border-l-4 border-[#237A52] p-3 shadow-md text-xs text-[#202B36]">
          <div className="font-semibold text-[#237A52]">System Notice</div>
          <div className="mt-0.5 text-[#5B6573]">{lastRunResult}</div>
        </div>
      )}
    </>
  );
}
