import { redirect } from "next/navigation";
import { dataProvider } from "@/lib/supabase";
import ReportsClient from "./ReportsClient";
import { getRuntimeMode } from "@/lib/runtime-mode";
import { requireRole, AuthorizationError } from "@/lib/authz";

export default async function ReportsPage() {
  if (getRuntimeMode() === "live") {
    try {
      await requireRole("platform_admin", "institution_admin", "institution_staff", "reviewer");
    } catch (error) {
      if (error instanceof AuthorizationError && error.status === 401) {
        redirect("/login?next=%2Faicte%2Freports");
      }
      redirect("/access-pending");
    }
  }

  const instRes = await dataProvider.getInstitutionSummary();

  return (
    <ReportsClient
      institutions={instRes.data || []}
      mode={instRes.mode}
    />
  );
}
