import type { Metadata } from "next";
import { Suspense } from "react";
import { Public_Sans } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "./globals.css";

const publicSans = Public_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-public-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AICTE SATYAPAN | National Enrolment Integrity & APAAR Registry System",
  description:
    "All India Council for Technical Education (AICTE) portal for technical institution enrolment integrity, seat ledger monitoring, and APAAR credential verification.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${publicSans.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-[#F4F6F8] text-[#202B36] font-sans">
        <Suspense fallback={<div className="h-28 bg-[#17365D]" />}>
          <Navbar />
        </Suspense>
        <main className="flex-1 w-full">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
