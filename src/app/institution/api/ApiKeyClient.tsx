import Link from "next/link";

export default function ApiKeyClient() {
  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-8 py-6 space-y-6">
      <Link href="/institution" className="text-xs font-semibold text-[#17365D] hover:underline">
        &larr; Return to institution records
      </Link>

      <section className="bg-white border-2 border-[#1E3A5F] p-5 rounded-[4px] shadow-xs">
        <div className="flex items-center space-x-2">
          <p className="text-[10px] tracking-wider uppercase font-bold text-[#5B6573]">
            API Integration Status
          </p>
          <span className="text-[9px] px-1.5 py-0.2 bg-[#FEF3C7] text-[#92400E] font-bold border border-[#F59E0B] rounded-[2px] uppercase">
            Team PRAMAANIT
          </span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-[#102A43] mt-1">
          ईआरपी एपीआई गेटवे <span className="text-base sm:text-lg font-bold text-[#17365D]">| Institutional ERP System Connection</span>
        </h1>
        <p className="text-sm text-[#5B6573] mt-2 max-w-3xl leading-relaxed">
          The SATYAPAN REST API Gateway provides machine-to-machine synchronization for university Student Information Systems (SIS) and admission ERPs using HMAC-SHA256 authenticated payloads.
        </p>
      </section>

      <section className="bg-white border border-[#CBD5E1] p-5 rounded-[4px] space-y-3 shadow-xs" aria-labelledby="requirements-heading">
        <h2 id="requirements-heading" className="text-sm font-bold text-[#17365D]">
          Integration Security & Technical Specifications
        </h2>
        <ul className="list-disc pl-5 text-sm text-[#475569] space-y-2">
          <li><strong>Institutional Identity Binding:</strong> Each API key is bound to a verified AICTE institution code and designated registrar account.</li>
          <li><strong>Cryptographic Request Signing:</strong> All inbound admission batches must include an HMAC-SHA256 signature in the request headers.</li>
          <li><strong>Automated CWE-1236 Defense:</strong> Incoming student admission payloads are sanitized against spreadsheet formula injection vulnerabilities.</li>
          <li><strong>Multi-Tenant Database Scoping:</strong> PostgreSQL Row Level Security restricts record inserts and queries exclusively to the authorized institution.</li>
          <li><strong>Rate Limiting & Audit Trail:</strong> Synchronous batch calls are metered and permanently logged into the immutable audit ledger.</li>
        </ul>
        <div className="text-xs border-l-4 border-[#17365D] bg-[#F0F7FF] p-3 text-[#1E3A8A]">
          <strong>Sandbox Notice:</strong> For security evaluation, API credentials and test endpoints are provisioned through the platform administrator console.
        </div>
      </section>
    </main>
  );
}
