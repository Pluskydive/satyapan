"use client";

import JudgeTour from "@/components/JudgeTour";

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  return (
    <>
      {children}
      <JudgeTour />
    </>
  );
}
