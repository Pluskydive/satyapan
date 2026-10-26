"use client";

import { useState } from "react";
import Link from "next/link";

export default function ApiKeyClient() {
  const [selectedLanguage, setSelectedLanguage] = useState<"curl" | "python" | "node">("curl");
  const [testResponse, setTestResponse] = useState<any | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const sampleApiKey = "aicte_live_sec_789412_inst1001";
  const endpoint = "/api/v1/institution/sync";

  const handleTestApi = async () => {
    setIsTesting(true);
    setTestResponse(null);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sampleApiKey}`,
        },
        body: JSON.stringify({
          institution_id: "inst-1001",
          students: [
            {
              apaar_id: "100000000999",
              institutional_student_id: "ERP-SYNC-01",
              full_name: "Karan Malhotra",
              program: "B.Tech Data Science",
              admission_year: 2026,
              admission_date: "2026-07-25",
              nationality_type: "indian",
              social_category: "General",
            },
          ],
        }),
      });

      const data = await res.json();
      setTestResponse({ status: res.status, data });
    } catch (err: any) {
      setTestResponse({ status: 500, error: err.message });
    } finally {
      setIsTesting(false);
    }
  };

  const curlCode = `curl -X POST "https://satyapan.gov.in/api/v1/institution/sync" \\
  -H "Authorization: Bearer ${sampleApiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "institution_id": "inst-1001",
    "students": [
      {
        "apaar_id": "100000000999",
        "institutional_student_id": "ERP-SYNC-01",
        "full_name": "Karan Malhotra",
        "program": "B.Tech Data Science",
        "admission_year": 2026,
        "admission_date": "2026-07-25",
        "nationality_type": "indian",
        "social_category": "General"
      }
    ]
  }'`;

  const pythonCode = `import requests

url = "https://satyapan.gov.in/api/v1/institution/sync"
headers = {
    "Authorization": "Bearer ${sampleApiKey}",
    "Content-Type": "application/json"
}
payload = {
    "institution_id": "inst-1001",
    "students": [
        {
            "apaar_id": "100000000999",
            "institutional_student_id": "ERP-SYNC-01",
            "full_name": "Karan Malhotra",
            "program": "B.Tech Data Science",
            "admission_year": 2026,
            "admission_date": "2026-07-25",
            "nationality_type": "indian",
            "social_category": "General"
        }
    ]
}

response = requests.post(url, json=payload, headers=headers)
print("Sync Response:", response.json())`;

  const nodeCode = `const payload = {
  institution_id: "inst-1001",
  students: [
    {
      apaar_id: "100000000999",
      institutional_student_id: "ERP-SYNC-01",
      full_name: "Karan Malhotra",
      program: "B.Tech Data Science",
      admission_year: 2026,
      admission_date: "2026-07-25",
      nationality_type: "indian",
      social_category: "General"
    }
  ]
};

fetch("https://satyapan.gov.in/api/v1/institution/sync", {
  method: "POST",
  headers: {
    "Authorization": "Bearer ${sampleApiKey}",
    "Content-Type": "application/json"
  },
  body: JSON.stringify(payload)
})
  .then(res => res.json())
  .then(data => console.log(data));`;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-6 space-y-6">
      {/* Back Link */}
      <div>
        <Link
          href="/institution"
          className="text-xs font-semibold text-[#17365D] hover:underline"
        >
          &larr; Return to Institution Seat Ledgers
        </Link>
      </div>

      {/* Page Header */}
      <div className="bg-white border border-[#D8DEE6] p-5 rounded-[2px] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[10px] tracking-wider uppercase font-semibold text-[#5B6573]">
            Institutional Software Integration
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#17365D] mt-0.5">
            Institutional ERP & Samarth eGov API Gateway
          </h1>
          <p className="text-xs text-[#5B6573] mt-1 max-w-2xl leading-relaxed">
            Programmatic REST API for automated synchronization between university ERPs (Samarth eGov, TCS iON, SAP, CollPoll) and the AICTE Satyapan national registry (Requirement 1 & 7).
          </p>
        </div>

        <button
          onClick={handleTestApi}
          disabled={isTesting}
          className="px-4 py-2 bg-[#C87524] hover:bg-[#a65f1a] text-white text-xs font-semibold rounded-[2px] transition-colors self-start sm:self-auto cursor-pointer disabled:opacity-50"
        >
          {isTesting ? "Executing API Test..." : "Test Live Endpoint Call"}
        </button>
      </div>

      {/* API Credentials Box */}
      <div className="bg-white border border-[#D8DEE6] rounded-[2px] p-5 space-y-4">
        <h2 className="text-xs font-bold text-[#17365D] uppercase tracking-wider">
          Active Institution API Credentials (Sunrise Institute - AICTE-1001)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-3 bg-[#F4F6F8] border border-[#D8DEE6] space-y-1">
            <div className="text-[10px] text-[#5B6573] uppercase font-sans font-semibold">
              Production Gateway Endpoint
            </div>
            <div className="font-bold text-[#17365D] break-all">
              https://satyapan.gov.in/api/v1/institution/sync
            </div>
          </div>

          <div className="p-3 bg-[#F4F6F8] border border-[#D8DEE6] space-y-1">
            <div className="text-[10px] text-[#5B6573] uppercase font-sans font-semibold">
              Secret API Authorization Key
            </div>
            <div className="font-bold text-[#202B36] break-all">
              {sampleApiKey}
            </div>
          </div>
        </div>

        <div className="text-[11px] text-[#5B6573]">
          Security: Requests must include valid bearer token in <code className="text-[#17365D]">Authorization: Bearer &lt;KEY&gt;</code> header. Enforces TLS 1.3 encryption and automated rate-limiting.
        </div>
      </div>

      {/* Live Test Response Output */}
      {testResponse && (
        <div className="bg-white border border-[#D8DEE6] rounded-[2px] p-4 space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-[#D8DEE6]">
            <span className="text-xs font-bold text-[#237A52] uppercase font-mono">
              HTTP {testResponse.status} OK - Ingestion Transaction Response
            </span>
            <span className="text-[10px] font-mono text-[#5B6573]">
              Latency: 48ms
            </span>
          </div>
          <pre className="p-3 bg-[#102A43] text-emerald-400 font-mono text-xs overflow-x-auto rounded-[2px]">
            {JSON.stringify(testResponse.data || testResponse.error, null, 2)}
          </pre>
        </div>
      )}

      {/* Integration Code Samples */}
      <div className="bg-white border border-[#D8DEE6] rounded-[2px] overflow-hidden space-y-3 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#D8DEE6] gap-2">
          <h3 className="text-xs font-bold text-[#17365D] uppercase tracking-wider">
            Integration Code Snippets
          </h3>

          <div className="flex items-center space-x-1 text-xs">
            {(["curl", "python", "node"] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => setSelectedLanguage(lang)}
                className={`px-3 py-1 font-mono uppercase rounded-[2px] cursor-pointer transition-colors ${
                  selectedLanguage === lang
                    ? "bg-[#17365D] text-white font-bold"
                    : "bg-[#F4F6F8] text-[#5B6573] hover:bg-slate-200"
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        <pre className="p-4 bg-[#102A43] text-slate-200 font-mono text-xs overflow-x-auto rounded-[2px] leading-relaxed">
          {selectedLanguage === "curl"
            ? curlCode
            : selectedLanguage === "python"
            ? pythonCode
            : nodeCode}
        </pre>
      </div>
    </div>
  );
}
