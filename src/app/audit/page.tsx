import { dataProvider } from "@/lib/supabase";
import { AuthorizationError } from "@/lib/authz";
import { redirect } from "next/navigation";

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="bg-white border border-[#D8DEE6] p-6 rounded-[6px] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#102A43]">
            System Activity Log
          </h1>
          <p className="text-xs sm:text-sm text-[#5B6573] mt-1 max-w-2xl leading-relaxed">
            Record of student admission uploads, quota verifications, and system events.
          </p>
        </div>

        <div className="text-xs font-semibold text-[#059669] bg-[#ECFDF5] border border-[#A7F3D0] px-3 py-1.5 rounded-[4px] self-start sm:self-auto">
          ● System Logging Active
        </div>
      </div>

      {/* System Audit Status Bar */}
      <div className="bg-white border border-[#CBD5E1] rounded-[6px] p-4 shadow-xs divide-y sm:divide-y-0 sm:divide-x divide-[#CBD5E1] grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-0">
        <div className="sm:px-4">
          <div className="text-xs text-[#64748B] font-semibold">Total Logged Events</div>
          <div className="text-2xl font-bold text-[#102A43] mt-1 font-mono">{logs.length} entries</div>
        </div>
        <div className="sm:px-4 pt-3 sm:pt-0">
          <div className="text-xs text-[#64748B] font-semibold">Security Integrity State</div>
          <div className="text-2xl font-bold text-[#102A43] mt-1 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" aria-hidden="true" />
            <span>Normal & Active</span>
          </div>
        </div>
        <div className="sm:px-4 pt-3 sm:pt-0">
          <div className="text-xs text-[#64748B] font-semibold">System Synchronization Time</div>
          <div className="text-base font-bold text-[#102A43] mt-1 font-mono">
            {new Date().toLocaleTimeString()} IST
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white border border-[#D8DEE6] rounded-[6px] overflow-hidden shadow-xs">
        <div className="p-4 border-b border-[#D8DEE6] flex items-center justify-between bg-[#F8FAFC]">
          <h2 className="text-xs font-bold text-[#102A43] uppercase tracking-wider">
            Activity History ({logs.length} events)
          </h2>
          <span className="text-[11px] text-[#64748B]">
            Times shown in IST
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#F8FAFC] text-[#5B6573] uppercase text-[10px] tracking-wider font-semibold border-b border-[#D8DEE6]">
              <tr>
                <th className="py-2.5 px-4 font-mono w-32">Event ID</th>
                <th className="py-2.5 px-4 font-mono w-44">Timestamp</th>
                <th className="py-2.5 px-4 w-36">Role</th>
                <th className="py-2.5 px-4 w-44">Action</th>
                <th className="py-2.5 px-4 w-40">Target</th>
                <th className="py-2.5 px-4">Summary</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] text-[#1E293B]">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 font-mono text-[11px]">
                  <td className="py-2.5 px-4 font-bold text-[#17365D]">
                    {log.id}
                  </td>
                  <td className="py-2.5 px-4 text-[#5B6573]">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td className="py-2.5 px-4 font-sans text-xs">
                    <span className="px-2 py-0.5 bg-[#F1F5F9] border border-[#CBD5E1] text-[#334155] text-[10px] font-semibold uppercase rounded-[2px]">
                      {log.actor_role}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 font-semibold text-[#1E293B]">
                    {log.action}
                  </td>
                  <td className="py-2.5 px-4 text-[#5B6573]">
                    {log.entity}
                  </td>
                  <td className="py-2.5 px-4 text-[#5B6573] max-w-xs truncate text-[10px]">
                    {log.after_data ? JSON.stringify(log.after_data) : "Event completed"}
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
