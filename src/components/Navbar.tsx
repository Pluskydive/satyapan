"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  ShieldCheck,
  Building2,
  UploadCloud,
  QrCode,
  Activity,
  RefreshCw,
  FileText,
  Lock,
  CheckCircle,
} from "lucide-react";

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
        setLastRunResult("Integrity rules verified successfully across all institutions!");
        // Refresh page data if on AICTE or Institution dashboard
        window.dispatchEvent(new CustomEvent("satyapan:refresh"));
      } else {
        setLastRunResult("Error executing integrity checks: " + (data.error || "Unknown"));
      }
    } catch {
      setLastRunResult("Failed to reach Integrity Engine API");
    } finally {
      setIsRunning(false);
      setTimeout(() => setLastRunResult(null), 5000);
    }
  };

  const navLinks = [
    { href: "/aicte", label: "AICTE Control Tower", icon: Activity },
    { href: "/institution", label: "Institution Seat Ledger", icon: Building2 },
    { href: "/institution/upload", label: "CSV Ingestion", icon: UploadCloud },
    { href: "/verify", label: "Employer QR Verify", icon: QrCode },
    { href: "/audit", label: "Security & Audit Trail", icon: FileText },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
        {/* Top official banner */}
        <div className="bg-gradient-to-r from-amber-600/20 via-slate-900 to-emerald-600/20 px-4 py-1 text-xs text-slate-300 border-b border-slate-800/60 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-amber-400">SIH 2026 Submission</span>
            <span className="text-slate-600">|</span>
            <span className="hidden sm:inline">All India Council for Technical Education (AICTE) & APAAR Registry</span>
          </div>
          <div className="flex items-center space-x-3 text-xs">
            <span className="flex items-center space-x-1 text-emerald-400">
              <Lock className="w-3 h-3" />
              <span>DPDP Act 2023 Compliant</span>
            </span>
            <span className="hidden md:inline px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-mono border border-emerald-500/20">
              Zero-Trust Architecture
            </span>
          </div>
        </div>

        {/* Main Navbar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <Link href="/" className="flex items-center space-x-3 group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-600 to-indigo-600 p-[2px] shadow-lg shadow-amber-500/10">
                  <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-lg font-black tracking-tight text-white">SATYAPAN</span>
                    <span className="text-xs px-1.5 py-0.2 rounded font-semibold bg-amber-400/15 text-amber-400 border border-amber-400/30">
                      सत्यापन
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">
                    Enrolment Integrity Engine
                  </p>
                </div>
              </Link>
            </div>

            {/* Navigation tabs */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? "bg-slate-800 text-amber-400 border border-slate-700 shadow-sm"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Quick Run Integrity Engine Action */}
            <div className="flex items-center space-x-2">
              <button
                onClick={handleRunIntegrity}
                disabled={isRunning}
                className="flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 transition-all active:scale-95 disabled:opacity-60 cursor-pointer"
                title="Execute all 6 validation rules across the national student dataset"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRunning ? "animate-spin" : ""}`} />
                <span>{isRunning ? "Running Rules..." : "Run Integrity Engine"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="lg:hidden border-t border-slate-800/80 bg-slate-900/90 px-2 py-1.5 flex items-center justify-around overflow-x-auto text-[11px]">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex flex-col items-center px-2 py-1 rounded whitespace-nowrap ${
                  isActive ? "text-amber-400 font-semibold" : "text-slate-400"
                }`}
              >
                <Icon className="w-4 h-4 mb-0.5" />
                <span>{link.label.split(" ")[0]}</span>
              </Link>
            );
          })}
        </div>
      </header>

      {/* Toast Notification when Integrity Check completes */}
      {lastRunResult && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div className="bg-slate-900 text-slate-100 border border-emerald-500/40 px-4 py-3 rounded-xl shadow-2xl flex items-center space-x-3 text-xs max-w-md">
            <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <div>
              <p className="font-semibold text-emerald-300">Integrity Engine Executed</p>
              <p className="text-slate-300 text-[11px] mt-0.5">{lastRunResult}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
