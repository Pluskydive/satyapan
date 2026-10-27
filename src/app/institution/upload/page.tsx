import { redirect } from "next/navigation";
import { getRuntimeMode } from "@/lib/runtime-mode";
import { requireRole, AuthorizationError } from "@/lib/authz";
import UploadClient from "./UploadClient";

export default async function UploadPage() {
  if (getRuntimeMode() === "live") {
    try {
      await requireRole("institution_admin", "institution_staff");
    } catch (error) {
      if (error instanceof AuthorizationError && error.status === 401) {
        redirect("/login?next=%2Finstitution%2Fupload");
      }
      redirect("/institution");
    }
  }

  return <UploadClient />;
}
