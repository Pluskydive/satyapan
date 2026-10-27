"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLanguage } from "@/components/LanguageProvider";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function PasswordClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [sessionWarning, setSessionWarning] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (password.length < 12) {
      setError(t("Use at least 12 characters."));
      return;
    }
    if (password !== confirmPassword) {
      setError(t("Passwords do not match."));
      return;
    }

    setBusy(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        setError(t("This link is invalid or has expired. Request a new one."));
        return;
      }
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        setError(t("An unexpected issue occurred. Please try again."));
        return;
      }
      // Revoke all refresh sessions after a credential change. Supabase access
      // tokens are short-lived JWTs and remain valid only until their expiry.
      const { error: revokeError } = await supabase.auth.signOut({ scope: "global" });
      if (revokeError) {
        const { error: localSignOutError } = await supabase.auth.signOut({ scope: "local" });
        setSessionWarning(true);
        setDone(true);
        if (localSignOutError) return;
      } else {
        setDone(true);
      }
      window.setTimeout(() => {
        router.replace("/login?notice=password-updated");
        router.refresh();
      }, 900);
    } catch {
      setError(t("This link is invalid or has expired. Request a new one."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="max-w-md mx-auto px-4 py-10 sm:py-16">
      <div className="bg-white border border-[#D8DEE6] p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-[#17365D]">{t("Set a new password")}</h1>
        <p className="text-sm text-[#5B6573] mt-2">
          {t(searchParams.get("recovery") === "1" ? "Choose a new password for your account." : "Choose a password to finish setting up your account.")}
        </p>
        {done ? (
          <p role="status" className={`mt-5 border-l-4 p-3 text-sm ${sessionWarning ? "border-[#986500] bg-[#FFF7E6] text-[#684600]" : "border-[#237A52] bg-[#EDF7F1] text-[#205E40]"}`}>
            {sessionWarning ? t("Your password was updated, but we could not confirm that other sessions ended. Sign out on other devices and contact your administrator if you need help.") : t("Your password was updated. Sign in again with the new password.")}
          </p>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-4" aria-busy={busy}>
            <label htmlFor="new-password" className="block text-sm font-semibold text-[#202B36]">
              {t("New password")}
              <input id="new-password" type="password" autoComplete="new-password" required minLength={12} value={password} onChange={(event) => setPassword(event.target.value)} aria-invalid={Boolean(error)} aria-describedby={error ? "password-error" : undefined} className="mt-1 block w-full px-3 py-2.5 border border-[#8B95A1]" />
            </label>
            <label htmlFor="confirm-password" className="block text-sm font-semibold text-[#202B36]">
              {t("Confirm new password")}
              <input id="confirm-password" type="password" autoComplete="new-password" required minLength={12} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} aria-invalid={Boolean(error)} aria-describedby={error ? "password-error" : undefined} className="mt-1 block w-full px-3 py-2.5 border border-[#8B95A1]" />
            </label>
            {error && <p id="password-error" role="alert" className="text-sm text-[#B42318]">{error}</p>}
            <button type="submit" disabled={busy} className="w-full bg-[#17365D] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
              {busy ? t("Updating…") : t("Update password")}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
