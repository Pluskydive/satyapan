import { dataProvider } from "@/lib/supabase";
import { AuthorizationError } from "@/lib/authz";
import { redirect } from "next/navigation";
import { getRuntimeMode } from "@/lib/runtime-mode";

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
  const demoMode = getRuntimeMode() === "demo";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="bg-white border border-[#D8DEE6] p-5 rounded-[2px] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[10px] tracking-wider uppercase font-semibold text-[#5B6573]">
            System activity
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#17365D] mt-0.5">
            {demoMode ? "Sample activity history" : "Account activity history"}
          </h1>
          <p className="text-xs text-[#5B6573] mt-1 max-w-2xl leading-relaxed">
            {demoMode ? "This list is held in temporary demonstration memory and is not a tamper-proof audit log." : "Recent access and data-change events for authorized reviewers. Sensitive field values are not displayed here."}
          </p>
        </div>

        <div className="text-xs font-mono text-[#5B6573] bg-[#F4F6F8] px-3 py-1.5 border border-[#D8DEE6] self-start sm:self-auto">
          {demoMode ? "Demo activity · not tamper-proof" : "Authorized review access"}
        </div>
      </div>

      {/* Information Security Posture Standards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-[#D8DEE6] p-4 rounded-[2px] space-y-1.5">
          <div className="text-xs font-bold text-[#17365D] uppercase tracking-wider">
            Spreadsheet upload
          </div>
          <p className="text-xs text-[#5B6573] leading-relaxed">
            {demoMode ? "Formula-like cells are escaped before sample rows are processed. The in-memory demonstration does not persist uploaded files." : "CSV fields are length-checked and escaped. Review the upload format before submitting institution records."}
          </p>
        </div>

        <div className="bg-white border border-[#D8DEE6] p-4 rounded-[2px] space-y-1.5">
          <div className="text-xs font-bold text-[#17365D] uppercase tracking-wider">
            Credential verification
          </div>
          <p className="text-xs text-[#5B6573] leading-relaxed">
            {demoMode ? "The consent screen is a simulated workflow and is not legal consent." : "Credential verification is disabled in live mode until a secure consent flow is implemented."}
          </p>
        </div>

        <div className="bg-white border border-[#D8DEE6] p-4 rounded-[2px] space-y-1.5">
          <div className="text-xs font-bold text-[#17365D] uppercase tracking-wider">
            Account permissions
          </div>
          <p className="text-xs text-[#5B6573] leading-relaxed">
            {demoMode ? "This local sample uses no real accounts or role-based permissions." : "Live account access is checked on the server and by database row-level policies."}
          </p>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white border border-[#D8DEE6] rounded-[2px] overflow-hidden">
        <div className="p-4 border-b border-[#D8DEE6] flex items-center justify-between bg-[#F4F6F8]">
          <h2 className="text-sm font-bold text-[#17365D] uppercase tracking-wider">
            Recent activity ({logs.length} events)
          </h2>
          <span className="text-[11px] font-mono text-[#5B6573]">
            {demoMode ? "Temporary demonstration data" : "Times shown in UTC"}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#F4F6F8] text-[#5B6573] uppercase text-[10px] tracking-wider font-semibold border-b border-[#D8DEE6]">
              <tr>
                <th className="py-2.5 px-4 font-mono w-32">Event ID</th>
                <th className="py-2.5 px-4 font-mono w-44">Timestamp (UTC)</th>
                <th className="py-2.5 px-4 w-36">Actor Role</th>
                <th className="py-2.5 px-4 w-44">Action Executed</th>
                <th className="py-2.5 px-4 w-40">Target Entity</th>
                <th className="py-2.5 px-4">Summary</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D8DEE6] text-[#202B36]">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 font-mono text-[11px]">
                  <td className="py-2.5 px-4 font-bold text-[#17365D]">
                    {log.id}
                  </td>
                  <td className="py-2.5 px-4 text-[#5B6573]">
                    {new Date(log.created_at).toISOString().replace("T", " ").slice(0, 19)}
                  </td>
                  <td className="py-2.5 px-4 font-sans text-xs">
                    <span className="px-1.5 py-0.5 bg-[#F4F6F8] border border-[#D8DEE6] text-[#17365D] text-[10px] font-semibold uppercase">
                      {log.actor_role}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 font-semibold text-[#202B36]">
                    {log.action}
                  </td>
                  <td className="py-2.5 px-4 text-[#5B6573]">
                    {log.entity}
                  </td>
                  <td className="py-2.5 px-4 text-[#5B6573] max-w-xs truncate text-[10px]">
                    {log.after_data ? JSON.stringify(log.after_data) : "Details withheld in this view"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
