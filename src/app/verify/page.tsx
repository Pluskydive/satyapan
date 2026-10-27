import { Suspense } from "react";
import VerifyClient from "./VerifyClient";
import { getRuntimeMode } from "@/lib/runtime-mode";


export default function VerifyPage() {
  if (getRuntimeMode() === "live") {
    return <div className="max-w-3xl mx-auto px-4 py-10"><section className="bg-white border border-[#D8DEE6] p-6"><h1 className="text-xl font-bold text-[#17365D]">Credential verification is unavailable</h1><p className="mt-2 text-sm text-[#5B6573]">The consent workflow in this prototype is simulated. Live verification remains disabled until a secure, one-time consent process is implemented.</p></section></div>;
  }
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400 text-xs">Loading Verification Engine...</div>}>
      <VerifyClient />
    </Suspense>
  );
}
