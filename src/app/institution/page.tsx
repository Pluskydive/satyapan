import { redirect } from "next/navigation";
import { dataProvider } from "@/lib/supabase";
import InstitutionClient from "./InstitutionClient";
import { getRuntimeMode } from "@/lib/runtime-mode";
import { requireRole, AuthorizationError } from "@/lib/authz";

export default async function InstitutionPage() {
  if (getRuntimeMode() === "live") {
    try {
      await requireRole("platform_admin", "institution_admin", "institution_staff", "reviewer");
    } catch (error) {
      if (error instanceof AuthorizationError && error.status === 401) {
        redirect("/login?next=%2Finstitution");
      }
      redirect("/access-pending");
    }
  }

  const [instRes] = await Promise.all([
    dataProvider.getInstitutionSummary(),
  ]);

  const firstInstitutionId = instRes.data?.[0]?.id;
  const rosterRes = await dataProvider.getInstitutionStudents(firstInstitutionId, 50, 0);

  return (
    <InstitutionClient
      initialInstitutions={instRes.data || []}
      initialStudents={rosterRes.data}
      initialTotal={rosterRes.total}
    />
  );
}
