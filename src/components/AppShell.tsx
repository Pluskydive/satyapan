"use client";

import { usePathname } from "next/navigation";
import SubpageSidebar from "@/components/SubpageSidebar";

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  // Homepage renders full width
  if (isHome) {
    return <>{children}</>;
  }

  // All subpages and sections render with the tabular navigation column on the side
  return (
    <div className="w-full max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-6">
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Tabular side navigation column */}
        <aside className="w-full lg:w-60 xl:w-64 shrink-0 lg:sticky lg:top-4 z-10">
          <SubpageSidebar />
        </aside>

        {/* Subpage main content */}
        <div className="flex-1 min-w-0 w-full subpage-content-wrapper">
          {children}
        </div>
      </div>
    </div>
  );
}
