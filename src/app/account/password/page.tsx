import { Suspense } from "react";
import PasswordClient from "./PasswordClient";
import { getRuntimeMode } from "@/lib/runtime-mode";
import { getServerLocale, serverTranslate } from "@/lib/i18n-server";

export default async function AccountPasswordPage() {
  const locale = await getServerLocale();
  if (getRuntimeMode() !== "live") return <p className="p-8 text-center">{serverTranslate(locale, "Password management is available only in authenticated live mode.")}</p>;
  return <Suspense fallback={<p className="p-8 text-center">{serverTranslate(locale, "Loading…")}</p>}><PasswordClient /></Suspense>;
}
