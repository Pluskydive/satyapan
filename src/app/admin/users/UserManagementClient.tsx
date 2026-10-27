"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";

type Role = "platform_admin" | "institution_admin" | "institution_staff" | "reviewer";
type Institution = { id: string; name: string; aicte_code: string; state: string };
type Account = {
  user_id: string;
  email: string;
  is_email_verified: boolean;
  role: Role | "pending";
  institution_id: string | null;
  is_active: boolean;
  created_at: string;
  institutions?: { name: string } | null;
};
type AccountEdit = { role: Role; institution_id: string; is_active: boolean };
type AccountListResponse = { users: Account[]; has_more: boolean };

async function fetchAccounts(nextPage: number, query: string): Promise<AccountListResponse> {
  const response = await fetch(`/api/admin/users?page=${nextPage}&q=${encodeURIComponent(query)}`, { cache: "no-store" });
  if (!response.ok) throw new Error("ACCOUNT_LIST_FAILED");
  return response.json() as Promise<AccountListResponse>;
}

const roleOptions: Array<{ value: Role; label: string }> = [
  { value: "platform_admin", label: "Platform administrator" },
  { value: "institution_admin", label: "Institution administrator" },
  { value: "institution_staff", label: "Institution staff" },
  { value: "reviewer", label: "Reviewer" },
];

const knownAccountApiErrors = new Set([
  "Please sign in to continue.",
  "You don't have access to this record or action.",
  "We couldn't load the user list. Please try again.",
  "Enter a valid work email and choose an account type.",
  "Choose an institution for institution accounts. Other account types do not use one.",
  "The site address is not configured for account invitations.",
  "An account already uses this email address.",
  "Choose an institution that exists in the directory.",
  "We couldn't send this invitation. Check the address or contact support.",
  "We couldn't finish setting up this account. No access was granted.",
  "Ask another platform administrator to change your own access.",
  "Check the account details and try again.",
  "Choose an institution for institution accounts only.",
  "You don't have access to this action.",
  "Choose a permitted account type.",
  "That account could not be found.",
  "Keep at least one active platform administrator.",
  "We couldn't create this invitation. Please try again.",
  "We couldn't update this account. Please try again.",
]);

export default function UserManagementClient() {
  const { t } = useLanguage();
  const [users, setUsers] = useState<Account[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [edits, setEdits] = useState<Record<string, AccountEdit>>({});
  const [email, setEmail] = useState("");
  const [newRole, setNewRole] = useState<Role>("institution_staff");
  const [newInstitution, setNewInstitution] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async (nextPage: number, query: string) => {
    try {
      const result = await fetchAccounts(nextPage, query);
      setError("");
      setUsers(result.users);
      setHasMore(result.has_more);
      setEdits(Object.fromEntries(result.users.map((user: Account) => [user.user_id, {
        role: user.role === "pending" ? "institution_staff" : user.role,
        institution_id: user.institution_id || "",
        is_active: user.is_active,
      }])));
    } catch {
      setError(t("Could not load accounts. Try again."));
    }
  }, [t]);

  useEffect(() => {
    let cancelled = false;
    fetchAccounts(page, search)
      .then((result) => {
        if (cancelled) return;
        setError("");
        setUsers(result.users);
        setHasMore(result.has_more);
        setEdits(Object.fromEntries(result.users.map((user) => [user.user_id, {
          role: user.role === "pending" ? "institution_staff" : user.role,
          institution_id: user.institution_id || "",
          is_active: user.is_active,
        }])));
      })
      .catch(() => {
        if (!cancelled) setError(t("Could not load accounts. Try again."));
      });
    return () => { cancelled = true; };
  }, [page, search, t]);

  useEffect(() => {
    fetch("/api/institutions", { cache: "no-store" })
      .then((response) => response.ok ? response.json() : [])
      .then((data) => { if (Array.isArray(data)) setInstitutions(data); })
      .catch(() => setInstitutions([]));
  }, []);

  const send = async (url: string, method: "POST" | "PATCH", payload: unknown) => {
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      const message = typeof result.error === "string" && knownAccountApiErrors.has(result.error)
        ? t(result.error)
        : t("Could not save this account. Try again.");
      throw new Error(message);
    }
    return result;
  };

  async function invite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    setError("");
    try {
      await send("/api/admin/users", "POST", {
        email,
        role: newRole,
        institution_id: ["institution_admin", "institution_staff"].includes(newRole) ? newInstitution : null,
      });
      setEmail("");
      setMessage(t("An invitation has been sent. The user must set a password before signing in."));
      setPage(1);
      await load(1, search);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t("Could not save this account. Try again."));
    } finally {
      setBusy(false);
    }
  }

  async function save(user: Account) {
    const edit = edits[user.user_id];
    if (!edit) return;
    setBusyId(user.user_id);
    setMessage("");
    setError("");
    try {
      await send("/api/admin/users", "PATCH", {
        user_id: user.user_id,
        role: edit.role,
        institution_id: ["institution_admin", "institution_staff"].includes(edit.role) ? edit.institution_id : null,
        is_active: edit.is_active,
      });
      setMessage(t("The account was updated."));
      await load(page, search);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t("Could not save this account. Try again."));
    } finally {
      setBusyId(null);
    }
  }

  const needsInstitution = (role: Role) => role === "institution_admin" || role === "institution_staff";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 space-y-6">
      <section className="bg-white border border-[#D8DEE6] p-5">
        <p className="text-[10px] tracking-wider uppercase font-semibold text-[#5B6573]">{t("Account administration")}</p>
        <h1 className="text-xl sm:text-2xl font-bold text-[#17365D] mt-1">{t("User accounts")}</h1>
        <p className="text-sm text-[#5B6573] mt-2">{t("Only a platform administrator can issue invitations, assign roles, and change account access.")}</p>
      </section>

      {message && <p role="status" className="border-l-4 border-[#237A52] bg-[#EDF7F1] p-3 text-sm text-[#205E40]">{message}</p>}
      {error && <p role="alert" className="border-l-4 border-[#B42318] bg-[#FDF0EF] p-3 text-sm text-[#7A1B14]">{error}</p>}

      <section className="bg-white border border-[#D8DEE6] p-5" aria-labelledby="invite-heading">
        <h2 id="invite-heading" className="text-sm font-bold text-[#17365D]">{t("Invite a user")}</h2>
        <form onSubmit={invite} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 mt-4" aria-busy={busy}>
          <label className="text-xs font-semibold text-[#202B36]">
            {t("Email address")}
            <input type="email" required maxLength={254} autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1 block w-full px-3 py-2 border border-[#8B95A1] bg-white" />
          </label>
          <label className="text-xs font-semibold text-[#202B36]">
            {t("Account type")}
            <select value={newRole} onChange={(event) => setNewRole(event.target.value as Role)} className="mt-1 block w-full px-3 py-2 border border-[#8B95A1] bg-white">
              {roleOptions.map((role) => <option key={role.value} value={role.value}>{t(role.label)}</option>)}
            </select>
          </label>
          <label className="text-xs font-semibold text-[#202B36]">
            {t("Assigned institution")}
            <select required={needsInstitution(newRole)} disabled={!needsInstitution(newRole)} value={needsInstitution(newRole) ? newInstitution : ""} onChange={(event) => setNewInstitution(event.target.value)} className="mt-1 block w-full px-3 py-2 border border-[#8B95A1] bg-white disabled:bg-[#F4F6F8]">
              <option value="">{t("Select an institution")}</option>
              {institutions.map((institution) => <option key={institution.id} value={institution.id}>{institution.name}</option>)}
            </select>
          </label>
          <div className="flex items-end">
            <button type="submit" disabled={busy || (needsInstitution(newRole) && !newInstitution)} className="w-full bg-[#17365D] px-4 py-2 text-sm font-semibold text-white hover:bg-[#102A43] disabled:opacity-60">
              {busy ? t("Sending invitation…") : t("Send invitation")}
            </button>
          </div>
        </form>
      </section>

      <section className="bg-white border border-[#D8DEE6] overflow-hidden" aria-labelledby="accounts-heading">
        <div className="bg-[#F4F6F8] border-b border-[#D8DEE6] p-4 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h2 id="accounts-heading" className="text-sm font-bold text-[#17365D]">{t("User accounts")}</h2>
            <p className="text-xs text-[#5B6573] mt-1">{t("Search and update account roles. Changes take effect on the next server request.")}</p>
          </div>
          <form onSubmit={(event) => { event.preventDefault(); setPage(1); void load(1, search); }} className="flex gap-2">
            <label className="sr-only" htmlFor="account-search">{t("Search by email")}</label>
            <input id="account-search" type="search" value={search} maxLength={80} onChange={(event) => setSearch(event.target.value)} placeholder={t("Search by email")} className="min-w-0 px-3 py-2 border border-[#8B95A1] bg-white text-sm" />
            <button type="submit" className="border border-[#17365D] px-3 py-2 text-sm font-semibold text-[#17365D]">{t("Search")}</button>
          </form>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-xs border-collapse">
            <thead className="bg-white text-[#5B6573] uppercase text-[10px] tracking-wider font-semibold border-b border-[#D8DEE6]">
              <tr>
                <th scope="col" className="py-3 px-4">{t("Email")}</th>
                <th scope="col" className="py-3 px-4">{t("Email status")}</th>
                <th scope="col" className="py-3 px-4">{t("Account type")}</th>
                <th scope="col" className="py-3 px-4">{t("Institution")}</th>
                <th scope="col" className="py-3 px-4">{t("Account status")}</th>
                <th scope="col" className="py-3 px-4 text-right">{t("Actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D8DEE6] text-[#202B36]">
              {users.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-[#5B6573]">{search ? t("No accounts match your search.") : t("No accounts are available.")}</td></tr>
              ) : users.map((user) => {
                const edit = edits[user.user_id] || { role: "institution_staff" as Role, institution_id: "", is_active: false };
                const rowId = user.user_id;
                return (
                  <tr key={rowId}>
                    <td className="px-4 py-3 font-medium">{user.email}<span className="block text-[10px] text-[#5B6573] mt-1">{new Date(user.created_at).toLocaleDateString()}</span></td>
                    <td className="px-4 py-3">{user.is_email_verified ? t("Verified") : t("Not verified")}</td>
                    <td className="px-4 py-3">
                      <label className="sr-only" htmlFor={`role-${rowId}`}>{t("Account type")}: {user.email}</label>
                      <select id={`role-${rowId}`} value={edit.role} onChange={(event) => setEdits((old) => ({ ...old, [rowId]: { ...edit, role: event.target.value as Role, institution_id: needsInstitution(event.target.value as Role) ? edit.institution_id : "" } }))} className="px-2 py-2 border border-[#8B95A1] bg-white">
                        {roleOptions.map((role) => <option key={role.value} value={role.value}>{t(role.label)}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <label className="sr-only" htmlFor={`institution-${rowId}`}>{t("Assigned institution")}: {user.email}</label>
                      <select id={`institution-${rowId}`} value={needsInstitution(edit.role) ? edit.institution_id : ""} disabled={!needsInstitution(edit.role)} onChange={(event) => setEdits((old) => ({ ...old, [rowId]: { ...edit, institution_id: event.target.value } }))} className="max-w-64 px-2 py-2 border border-[#8B95A1] bg-white disabled:bg-[#F4F6F8]">
                        <option value="">{t("Select an institution")}</option>
                        {institutions.map((institution) => <option key={institution.id} value={institution.id}>{institution.name}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <label className="flex items-center gap-2">
                        <input type="checkbox" checked={edit.is_active} onChange={(event) => setEdits((old) => ({ ...old, [rowId]: { ...edit, is_active: event.target.checked } }))} aria-label={`${t("Turn access on or off")}: ${user.email}`} />
                        <span>{edit.is_active ? t("Active") : user.role === "pending" ? t("Awaiting approval") : t("Inactive")}</span>
                      </label>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button type="button" disabled={busyId === rowId || (needsInstitution(edit.role) && !edit.institution_id)} onClick={() => void save(user)} className="border border-[#17365D] px-3 py-2 font-semibold text-[#17365D] disabled:opacity-50">
                        {busyId === rowId ? t("Saving…") : t("Save changes")}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="border-t border-[#D8DEE6] px-4 py-3 flex items-center justify-between">
          <span className="text-xs text-[#5B6573]">{t("Page")} {page}</span>
          <div className="flex gap-2">
            <button type="button" disabled={page === 1} onClick={() => setPage((value) => Math.max(1, value - 1))} className="border border-[#8B95A1] px-3 py-2 text-xs font-semibold disabled:opacity-50">{t("Previous")}</button>
            <button type="button" disabled={!hasMore} onClick={() => setPage((value) => value + 1)} className="border border-[#8B95A1] px-3 py-2 text-xs font-semibold disabled:opacity-50">{t("Next")}</button>
          </div>
        </div>
      </section>
    </div>
  );
}
