import "server-only";

import { cookies } from "next/headers";
import { translate, type Locale } from "@/lib/i18n";

export async function getServerLocale(): Promise<Locale> {
  const value = (await cookies()).get("satyapan_locale")?.value;
  return value === "hi" ? "hi" : "en";
}

export function serverTranslate(locale: Locale, text: string) {
  return translate(locale, text);
}
