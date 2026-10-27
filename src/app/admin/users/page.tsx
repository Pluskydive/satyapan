import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import UserManagementClient from "./UserManagementClient";
import { AuthorizationError, requireRole } from "@/lib/authz";
import { getRuntimeMode } from "@/lib/runtime-mode";

export default async function AdminUsersPage() {
  if (getRuntimeMode() === "live") {
    try {
      await requireRole("platform_admin");
    } catch (error) {
      if (error instanceof AuthorizationError && error.status === 401) {
        redirect("/login?next=%2Fadmin%2Fusers");
      }
      redirect("/aicte");
    }
  } else if (getRuntimeMode() === "demo") {
    const cookieStore = await cookies();
    const demoRole = cookieStore.get("satyapan_demo_role")?.value || "platform_admin";
    if (demoRole !== "platform_admin") {
      redirect("/aicte");
    }
  }

  return <UserManagementClient />;
}
