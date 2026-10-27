import { Suspense } from "react";
import LoginClient from "./LoginClient";
import { getRuntimeMode } from "@/lib/runtime-mode";
import { getServerLocale, serverTranslate } from "@/lib/i18n-server";

export default async function LoginPage() {
  const locale = await getServerLocale();
  const t = (text: string) => serverTranslate(locale, text);
  const isDemo = getRuntimeMode() === "demo";

  return (
    <Suspense fallback={<p className="p-8 text-center text-xs text-[#5B6573]">{t("Loading…")}</p>}>
      <LoginClient isDemo={isDemo} />
    </Suspense>
  );
}
