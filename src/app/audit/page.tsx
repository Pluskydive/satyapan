import { dataProvider } from "@/lib/supabase";
import { AuthorizationError } from "@/lib/authz";
import { redirect } from "next/navigation";
import AuditClient from "./AuditClient";

export default async function AuditPage() {
  let logs;
  try {
    logs = (await dataProvider.getAuditLogs(200)).data;
  } catch (error) {
    if (error instanceof AuthorizationError) {
      if (error.status === 401) redirect("/login?next=%2Faudit");
      redirect("/aicte");
    }
    throw error;
  }

  return <AuditClient logs={logs || []} />;
}
