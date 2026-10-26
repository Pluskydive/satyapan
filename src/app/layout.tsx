import type { Metadata } from "next";
import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "SATYAPAN (सत्यापन) — AICTE Enrolment Integrity & APAAR Continuous Verification",
  description:
    "Smart India Hackathon 2026 Submission. Real-time enrolment integrity, ghost admission detection, sanctioned intake seat ledger, and DPDP-compliant verification.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100 font-sans selection:bg-amber-500/30 selection:text-amber-200">
        <Suspense fallback={<div className="h-16 bg-slate-950 border-b border-slate-800" />}>
          <Navbar />
        </Suspense>
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
