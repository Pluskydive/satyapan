import { Shield, Lock, FileText, CheckCircle2, AlertOctagon, Terminal } from "lucide-react";
import { getSatyapanStore } from "@/lib/mockData";


export default async function AuditPage() {
  const store = getSatyapanStore();
  const logs = store.auditLogs;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Cybersecurity & Immutable Audit Ledger
            </h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
              TAMPER-EVIDENT LOG
            </span>
          </div>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Complete cryptographic traceability of all admission ingestions, rule engine runs, and DPDP consent events.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-mono">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>DPDP Act 2023 Compliant</span>
          </span>
        </div>
      </div>

      {/* Security Architecture Posture Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white">CWE-1236 CSV Injection Defense</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            All spreadsheet uploads are stripped and neutralized of formula operators (`=`, `+`, `-`, `@`, `\t`, `\r`)
            prior to database ingestion to stop spreadsheet remote execution attacks.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white">Selective Credential Disclosure</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Verifiers only receive academic status (program, institution, year). Personal Protected Identifiers
            like caste, gender, and full date of birth are excluded from third-party queries.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <Terminal className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white">Role-Based Integrity Verification</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            AICTE apex regulators, institutional registrars, employer verifiers, and students operate within
            strictly partitioned privilege domains with tamper-evident audit logging.
          </p>
        </div>
      </div>

      {/* Chronological Audit Events Ledger */}
      <div className="rounded-2xl bg-slate-900/70 border border-slate-800 shadow-xl overflow-hidden space-y-4 p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Cryptographic Audit Trail</h3>
            <p className="text-slate-400 text-xs mt-0.5">
              Live stream of database mutations, batch uploads, and integrity rule executions.
            </p>
          </div>
          <span className="font-mono text-xs text-slate-500">{logs.length} Logged Events</span>
        </div>

        <div className="overflow-x-auto border border-slate-800 rounded-xl">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Event ID</th>
                <th className="py-3 px-4">Timestamp (UTC)</th>
                <th className="py-3 px-4">Actor Role</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Target Entity</th>
                <th className="py-3 px-4">Payload Summary</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/30">
                  <td className="py-3 px-4 font-mono text-[11px] text-amber-400 font-bold">
                    {log.id}
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                    {new Date(log.created_at).toISOString().replace("T", " ").slice(0, 19)}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px] font-bold uppercase">
                      {log.actor_role}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-white">
                    {log.action}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-400">
                    {log.entity}
                  </td>
                  <td className="py-3 px-4 font-mono text-[10px] text-slate-400 max-w-xs truncate">
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
