"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/components/LanguageProvider";

interface NavItem {
  href: string;
  enLabel: string;
  hiLabel: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/", enLabel: "Home", hiLabel: "मुख्यपृष्ठ", icon: "🏠" },
  { href: "/aicte", enLabel: "National Overview", hiLabel: "राष्ट्रीय विवरण", icon: "📊" },
  { href: "/institution", enLabel: "College Seats", hiLabel: "कॉलेज सीटें", icon: "🎓" },
  { href: "/institution/upload", enLabel: "Upload Students", hiLabel: "छात्र अपलोड", icon: "📥" },
  { href: "/verify", enLabel: "Verify Degree", hiLabel: "प्रमाणपत्र सत्यापन", icon: "🔍" },
  { href: "/aicte/reports", enLabel: "Reports", hiLabel: "रिपोर्ट", icon: "📑" },
  { href: "/audit", enLabel: "Activity Log", hiLabel: "गतिविधि लॉग", icon: "🔒" },
  { href: "/institution/api", enLabel: "Connect Software", hiLabel: "सॉफ्टवेयर लिंक", icon: "🔌" },
  { href: "/login", enLabel: "Account Login", hiLabel: "लॉगिन पोर्टल", icon: "🔑" },
];

export default function SubpageSidebar() {
  const pathname = usePathname();
  const { locale } = useLanguage();
  const isHi = locale === "hi";

  const isLinkActive = (href: string) => {
    if (href === "/") return pathname === "/";
    if (href === "/aicte") return pathname === "/aicte";
    if (href === "/institution") return pathname === "/institution";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <nav
      aria-label={isHi ? "साइड नेविगेशन" : "Side Navigation"}
      className="w-full bg-white border border-[#CBD5E1] rounded-[6px] overflow-hidden shadow-xs"
    >
      {/* Tabular Header */}
      <div className="bg-[#102A43] text-white px-4 py-3 border-b border-[#1E3A5F]">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-200">
          {isHi ? "पोर्टल पृष्ठ सूची" : "Page Navigation"}
        </div>
        <div className="text-[10px] text-slate-300">
          {isHi ? "वापस जाने के लिए लिंक पर क्लिक करें" : "Click to navigate between pages"}
        </div>
      </div>

      {/* Tabular Links Table */}
      <table className="w-full text-left text-xs border-collapse">
        <tbody className="divide-y divide-[#E2E8F0]">
          {NAV_ITEMS.map((item) => {
            const isActive = isLinkActive(item.href);

            return (
              <tr key={item.href} className="group">
                <td className="p-0">
                  <Link
                    href={item.href}
                    className={`flex items-center justify-between px-3.5 py-2.5 transition-colors cursor-pointer ${
                      isActive
                        ? "bg-[#EFF6FF] border-l-4 border-l-[#F59E0B] font-bold text-[#102A43]"
                        : "border-l-4 border-l-transparent text-[#334155] hover:bg-[#F8FAFC] hover:text-[#102A43]"
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <span className="text-sm shrink-0" aria-hidden="true">
                        {item.icon}
                      </span>
                      <span className="leading-snug">
                        {isHi ? item.hiLabel : item.enLabel}
                      </span>
                    </span>
                    <span
                      className={`text-xs ${
                        isActive
                          ? "text-[#F59E0B] font-bold"
                          : "text-slate-400 group-hover:text-slate-600"
                      }`}
                      aria-hidden="true"
                    >
                      &rarr;
                    </span>
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Return to Home Footer Button */}
      <div className="p-3 bg-[#F8FAFC] border-t border-[#CBD5E1]">
        <Link
          href="/"
          className="w-full flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold text-[#102A43] bg-white border border-[#CBD5E1] rounded-[3px] hover:bg-[#F1F5F9] transition-colors shadow-xs"
        >
          <span>&larr;</span>
          <span>{isHi ? "मुख्यपृष्ठ पर वापस जाएँ" : "Back to Home"}</span>
        </Link>
      </div>
    </nav>
  );
}
