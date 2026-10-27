import Link from "next/link";
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4">
      {/* Maharashtra.gov.in Official Breadcrumb */}
      <div className="bg-[#EAEFF5] border border-[#CBD5E1] px-4 py-1.5 rounded-[2px] text-xs text-[#334155] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-[11px]">
          <Link href="/" className="text-[#205081] font-semibold hover:underline">
            मुख्य पृष्ठ / Home
          </Link>
          <span className="text-[#94A3B8]">&gt;</span>
          <span className="text-[#205081] font-semibold">
            प्रणाली प्रशासन / System Administration
          </span>
          <span className="text-[#94A3B8]">&gt;</span>
          <span className="text-[#102A43] font-bold">
            कार्यप्रणाली नोंदवही / System Activity Log
          </span>
        </div>
        <div className="hidden sm:block text-[10px] font-mono text-[#64748B]">
          Audit Trail: Immutable Append-Only
        </div>
      </div>

      {/* 1. Maharashtra.gov.in Department Header Block */}
      <div className="bg-white border-l-4 border-l-[#FF9933] border-y border-r border-[#CBD5E1] p-4 sm:p-5 rounded-[2px] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" aria-hidden="true" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#205081]">
              महाराष्ट्र शासन • माहिती तंत्रज्ञान कक्ष • System Security &amp; Audit Trail
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#102A43] mt-1">
            प्रणाली कार्यप्रणाली नोंदवही / System Activity Log
          </h1>
        </div>

        <div className="text-xs font-bold text-[#059669] bg-[#ECFDF5] border border-[#A7F3D0] px-3 py-1.5 rounded-[2px] self-start sm:self-auto font-mono">
          सक्रिय लॉगिंग / Active
        </div>
      </div>

      {/* System Audit Status Ledger Ribbon */}
      <div className="bg-white border border-[#CBD5E1] rounded-[2px] p-4 shadow-xs divide-y sm:divide-y-0 sm:divide-x divide-[#CBD5E1] grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-0">
        <div className="sm:px-4">
          <div className="text-[10px] text-[#64748B] font-bold uppercase tracking-wider">एकूण नोंदी / Total Logged Events</div>
          <div className="text-xl font-bold text-[#102A43] mt-0.5 font-mono">{logs.length} नोंदी / entries</div>
        </div>
        <div className="sm:px-4 pt-3 sm:pt-0">
          <div className="text-[10px] text-[#64748B] font-bold uppercase tracking-wider">सुरक्षा स्थिती / Security Standing</div>
          <div className="text-xl font-bold text-[#059669] mt-0.5 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#10B981]" aria-hidden="true" />
            <span>सुरक्षित व कार्यरत / Active</span>
          </div>
        </div>
        <div className="sm:px-4 pt-3 sm:pt-0">
          <div className="text-[10px] text-[#64748B] font-bold uppercase tracking-wider">सिंक्रोनाइझेशन वेळ / Sync Time</div>
          <div className="text-xl font-bold text-[#102A43] mt-0.5 font-mono">
            {new Date().toLocaleTimeString()} IST
          </div>
        </div>
      </div>

      {/* Audit Log Table (Maharashtra Portal GR Table Style) */}
      <div className="bg-white border border-[#CBD5E1] rounded-[2px] overflow-hidden shadow-xs">
        <div className="p-3 sm:p-4 border-b border-[#CBD5E1] flex items-center justify-between bg-[#EAEFF5]">
          <div>
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#205081]">
              अपरिवर्तनीय लेखापरीक्षण नोंदवही / Immutable Audit Trail
            </div>
            <h2 className="text-xs sm:text-sm font-bold text-[#102A43] mt-0.5">
              कार्यवाही इतिहास / Activity History ({logs.length} events)
            </h2>
          </div>
          <span className="text-[11px] font-mono text-[#64748B]">
            भारतीय प्रमाण वेळ (IST)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[850px]">
            <thead className="bg-[#205081] text-white uppercase text-[10px] font-bold">
              <tr>
                <th scope="col" className="w-12 py-2.5 px-3 border-r border-[#112D4E] text-center">क्र.</th>
                <th scope="col" className="py-2.5 px-3 font-mono border-r border-[#112D4E] w-28">इव्हेंट आयडी</th>
                <th scope="col" className="py-2.5 px-3 font-mono border-r border-[#112D4E] w-44">दिनांक व वेळ / Timestamp</th>
                <th scope="col" className="py-2.5 px-3 border-r border-[#112D4E] w-36">भूमिका / Role</th>
                <th scope="col" className="py-2.5 px-3 border-r border-[#112D4E] w-44">कृती / Action</th>
                <th scope="col" className="py-2.5 px-3 border-r border-[#112D4E] w-40">घटक / Entity</th>
                <th scope="col" className="py-2.5 px-3">तपशील / Summary</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#CBD5E1] text-[#102A43]">
              {logs.map((log, idx) => (
                <tr
                  key={log.id}
                  className={`font-mono text-[11px] transition-colors ${
                    idx % 2 === 0
                      ? "bg-white hover:bg-[#EAEFF5]"
                      : "bg-[#F4F6F9] hover:bg-[#EAEFF5]"
                  }`}
                >
                  <td className="py-2.5 px-3 text-center font-bold text-[#64748B] border-r border-[#CBD5E1]">
                    {idx + 1}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-[#205081] border-r border-[#CBD5E1]">
                    {log.id}
                  </td>
                  <td className="py-2.5 px-3 text-[#64748B] border-r border-[#CBD5E1]">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 font-sans text-xs border-r border-[#CBD5E1]">
                    <span className="px-2 py-0.5 bg-white border border-[#CBD5E1] text-[#205081] text-[10px] font-bold uppercase rounded-[2px]">
                      {log.actor_role}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-[#102A43] border-r border-[#CBD5E1]">
                    {log.action}
                  </td>
                  <td className="py-2.5 px-3 text-[#64748B] border-r border-[#CBD5E1]">
                    {log.entity}
                  </td>
                  <td className="py-2.5 px-3 text-[#334155] max-w-xs truncate text-[10px]">
                    {log.after_data ? JSON.stringify(log.after_data) : "प्रक्रिया पूर्ण"}
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
