import ForgotPasswordClient from "./ForgotPasswordClient";
import { getRuntimeMode } from "@/lib/runtime-mode";
import Link from "next/link";
import { getServerLocale, serverTranslate } from "@/lib/i18n-server";

export default async function ForgotPasswordPage() {
  const locale = await getServerLocale();
  const t = (text: string) => serverTranslate(locale, text);
  if (getRuntimeMode() !== "live") {
    return <section className="max-w-md mx-auto px-4 py-12 bg-white border border-[#D8DEE6] mt-10">
      <h1 className="text-xl font-bold text-[#17365D]">{t("Password recovery is unavailable")}</h1>
      <p className="mt-2 text-sm text-[#5B6573]">{t("This demonstration has no accounts.")}</p>
      <Link href="/" className="inline-block mt-4 text-sm font-semibold text-[#17365D] underline">{t("Return to demonstration")}</Link>
    </section>;
  }
  return <ForgotPasswordClient />;
}
