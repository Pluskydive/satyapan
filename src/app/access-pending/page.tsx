import Link from "next/link";
import { getServerLocale, serverTranslate } from "@/lib/i18n-server";

export default async function AccessPendingPage() {
  const locale = await getServerLocale();
  return (
    <section className="max-w-lg mx-auto px-4 py-12">
      <div className="bg-white border border-[#D8DEE6] p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-[#17365D]">{serverTranslate(locale, "Access awaiting approval")}</h1>
        <p className="text-sm text-[#5B6573] mt-3">{serverTranslate(locale, "An administrator must activate your account before you can use this service.")}</p>
        <Link href="/login" className="inline-block mt-5 text-sm font-semibold text-[#17365D] underline">{serverTranslate(locale, "Return to sign in")}</Link>
      </div>
    </section>
  );
}
