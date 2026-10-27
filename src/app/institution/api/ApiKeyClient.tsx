import Link from "next/link";

export default function ApiKeyClient() {
  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-8 py-6 space-y-6">
      <Link href="/institution" className="text-xs font-semibold text-[#17365D] hover:underline">
        &larr; Return to institution records
      </Link>

      <section className="bg-white border border-[#D8DEE6] p-5 rounded-[2px]">
        <p className="text-[10px] tracking-wider uppercase font-semibold text-[#5B6573]">
          Integration status
        </p>
        <h1 className="text-xl sm:text-2xl font-bold text-[#17365D] mt-1">
          Institution system connection
        </h1>
        <p className="text-sm text-[#5B6573] mt-2 max-w-3xl leading-relaxed">
          The institution API is not enabled in this SIH prototype. No API key has been issued, and submitted data will not be sent to an institution system.
        </p>
      </section>

      <section className="bg-white border border-[#D8DEE6] p-5 rounded-[2px] space-y-3" aria-labelledby="requirements-heading">
        <h2 id="requirements-heading" className="text-sm font-bold text-[#17365D]">
          Before a real connection can be enabled
        </h2>
        <ul className="list-disc pl-5 text-sm text-[#5B6573] space-y-2">
          <li>Confirm the institution’s identity and assign an authorized administrator.</li>
          <li>Issue revocable, institution-scoped credentials and rotate them securely.</li>
          <li>Apply and review database access policies before accepting student records.</li>
          <li>Agree on the data fields, retention period, audit process, and support owner.</li>
          <li>Add shared rate limiting, monitoring, and an integration test environment.</li>
        </ul>
        <p className="text-xs border-l-4 border-[#C87524] bg-[#F4F6F8] p-3 text-[#202B36]">
          Do not enter real student data or API secrets into this prototype.
        </p>
      </section>
    </main>
  );
}
