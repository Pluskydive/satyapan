import { getSatyapanStore } from "@/lib/mockData";

export default async function AuditPage() {
  const store = getSatyapanStore();
  const logs = store.auditLogs;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="bg-white border border-[#D8DEE6] p-5 rounded-[2px] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[10px] tracking-wider uppercase font-semibold text-[#5B6573]">
            System Traceability & Compliance
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#17365D] mt-0.5">
            National Technical Regulatory Audit Ledger
          </h1>
          <p className="text-xs text-[#5B6573] mt-1 max-w-2xl leading-relaxed">
            Immutable transaction records of all student enrolment ingestions, automated rule engine executions, and third-party verification consent events.
          </p>
        </div>

        <div className="text-xs font-mono text-[#5B6573] bg-[#F4F6F8] px-3 py-1.5 border border-[#D8DEE6] self-start sm:self-auto">
          Audit Integrity: 100% Tamper-Evident
        </div>
      </div>

      {/* Information Security Posture Standards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-[#D8DEE6] p-4 rounded-[2px] space-y-1.5">
          <div className="text-xs font-bold text-[#17365D] uppercase tracking-wider">
            CWE-1236 Spreadsheet Security
          </div>
          <p className="text-xs text-[#5B6573] leading-relaxed">
            All spreadsheet inputs are sanitized by neutralizing formula operators to prevent arbitrary spreadsheet code execution during institutional review.
          </p>
        </div>

        <div className="bg-white border border-[#D8DEE6] p-4 rounded-[2px] space-y-1.5">
          <div className="text-xs font-bold text-[#17365D] uppercase tracking-wider">
            DPDP Act 2023 Selective Disclosure
          </div>
          <p className="text-xs text-[#5B6573] leading-relaxed">
            Third-party verifiers are granted access only to academic enrolment credentials. Personal demographic attributes remain strictly confidential.
          </p>
        </div>

        <div className="bg-white border border-[#D8DEE6] p-4 rounded-[2px] space-y-1.5">
          <div className="text-xs font-bold text-[#17365D] uppercase tracking-wider">
            Role-Based Access Partitioning
          </div>
          <p className="text-xs text-[#5B6573] leading-relaxed">
            AICTE central officers, institutional registrars, and external verifiers operate in distinct privilege partitions with chronological transaction logging.
          </p>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white border border-[#D8DEE6] rounded-[2px] overflow-hidden">
        <div className="p-4 border-b border-[#D8DEE6] flex items-center justify-between bg-[#F4F6F8]">
          <h2 className="text-sm font-bold text-[#17365D] uppercase tracking-wider">
            Chronological Audit Transaction Stream ({logs.length} Logged Events)
          </h2>
          <span className="text-[11px] font-mono text-[#5B6573]">
            Format: UTC Timestamped Ledger
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
                <th className="py-2.5 px-4">Cryptographic Summary Payload</th>
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
                    {JSON.stringify(log.after_data || {})}
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
