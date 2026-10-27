import { redirect } from "next/navigation";
import { dataProvider } from "@/lib/supabase";
import AICTEControlTowerClient from "./AICTEControlTowerClient";
import { getRuntimeMode } from "@/lib/runtime-mode";
import { requireRole, AuthorizationError } from "@/lib/authz";

export default async function AICTEPage() {
  if (getRuntimeMode() === "live") {
    try {
      await requireRole("platform_admin", "institution_admin", "institution_staff", "reviewer");
    } catch (error) {
      if (error instanceof AuthorizationError && error.status === 401) {
        redirect("/login?next=%2Faicte");
      }
      redirect("/access-pending");
    }
  }

  const [natRes, stateRes, flagsRes] = await Promise.all([
    dataProvider.getNationalSummary(),
    dataProvider.getStateSummary(),
    dataProvider.getOpenFlags(),
  ]);

  return (
    <AICTEControlTowerClient
      initialNational={natRes.data}
      initialStates={stateRes.data || []}
      initialFlags={flagsRes.data || []}
    />
  );
}
