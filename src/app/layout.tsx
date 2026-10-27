import type { Metadata } from "next";
import { Suspense } from "react";
import { Public_Sans } from "next/font/google";
import { connection } from "next/server";
import { cookies } from "next/headers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { LanguageProvider } from "@/components/LanguageProvider";
import { getCurrentUserContext, type UserProfile } from "@/lib/authz";
import { getRuntimeMode } from "@/lib/runtime-mode";
import { getServerLocale } from "@/lib/i18n-server";
import "./globals.css";

const publicSans = Public_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-public-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SATYAPAN (सत्यापन) | AICTE National Enrolment Integrity & APAAR Registry",
  description: "Official National Student Enrolment Integrity and APAAR Registry System. Designed and engineered by Team PRAMAANIT for All India Council for Technical Education (AICTE).",
  robots: { index: false, follow: false },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Nonce-based script policy requires request-time rendering.
  await connection();
  const locale = await getServerLocale();
  const mode = getRuntimeMode();
  let viewer: UserProfile | null = null;
  if (mode === "live") {
    try {
      viewer = (await getCurrentUserContext()).profile;
    } catch {
      // Public authentication screens are rendered without a profile.
    }
  } else if (mode === "demo") {
    const cookieStore = await cookies();
    const demoRoleRaw = cookieStore.get("satyapan_demo_role")?.value;
    if (demoRoleRaw === "public_verifier") {
      viewer = null;
    } else {
      const demoRole = (demoRoleRaw || "platform_admin") as UserProfile["role"];
      const demoEmail = cookieStore.get("satyapan_demo_email")?.value || "admin@aicte.gov.in";
      const demoInstId = cookieStore.get("satyapan_demo_institution")?.value || "inst-1001";
      viewer = {
        user_id: "demo-user-id",
        email: demoEmail,
        role: demoRole,
        institution_id: (demoRole === "institution_admin" || demoRole === "institution_staff") ? demoInstId : null,
        is_active: true,
      };
    }
  }

  return (
    <html lang={locale} className={`${publicSans.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-[#F4F6F8] text-[#202B36] font-sans">
        <LanguageProvider initialLocale={locale}>
          <Suspense fallback={<div className="h-28 bg-[#17365D]" />}>
            <Navbar mode={mode} viewer={viewer ? { email: viewer.email, role: viewer.role } : null} />
          </Suspense>
          <main className="flex-1 w-full">{children}</main>
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  );
}
