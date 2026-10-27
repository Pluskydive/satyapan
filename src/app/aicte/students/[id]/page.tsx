import { notFound, redirect } from "next/navigation";
import { dataProvider } from "@/lib/supabase";
import { AuthorizationError, requireRole } from "@/lib/authz";
import { getRuntimeMode } from "@/lib/runtime-mode";
import StudentDossierClient from "./StudentDossierClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function StudentRiskPage({ params }: PageProps) {
  const { id } = await params;

  if (getRuntimeMode() === "live") {
    try {
      await requireRole("platform_admin", "institution_admin", "institution_staff", "reviewer");
    } catch (error) {
      if (error instanceof AuthorizationError && error.status === 401) {
        redirect(`/login?next=%2Faicte%2Fstudents%2F${encodeURIComponent(id)}`);
      }
      redirect("/aicte");
    }
  }

  const { data: student, mode } = await dataProvider.getStudentById(id);

  if (!student) {
    notFound();
  }

  return <StudentDossierClient student={student as unknown as import("./StudentDossierClient").StudentDossierData} mode={mode} />;
}
