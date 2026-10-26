import { Suspense } from "react";
import VerifyClient from "./VerifyClient";


export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400 text-xs">Loading Verification Engine...</div>}>
      <VerifyClient />
    </Suspense>
  );
}
