import { redirect } from "next/navigation";
import { getRuntimeMode } from "@/lib/runtime-mode";
import { requireRole, AuthorizationError } from "@/lib/authz";
import ApiKeyClient from "./ApiKeyClient";

export default async function ApiKeyPage() {
  if (getRuntimeMode() === "live") {
    try {
      await requireRole("platform_admin", "institution_admin");
    } catch (error) {
      if (error instanceof AuthorizationError && error.status === 401) {
        redirect("/login?next=%2Finstitution%2Fapi");
      }
      redirect("/institution");
    }
  }

  return <ApiKeyClient />;
}
