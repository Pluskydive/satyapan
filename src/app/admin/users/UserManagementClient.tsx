"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
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
  const { locale, t } = useLanguage();
  const isHi = locale === "hi";
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4">
      {/* Official Government Breadcrumb */}
      <div className="bg-[#EAEFF5] border border-[#CBD5E1] px-4 py-1.5 rounded-[2px] text-xs text-[#334155] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-[11px]">
          <Link href="/" className="text-[#205081] font-semibold hover:underline">
            {isHi ? "मुख्य पृष्ठ" : "Home"}
          </Link>
          <span className="text-[#94A3B8]">&gt;</span>
          <span className="text-[#205081] font-semibold">
            {isHi ? "प्रणाली प्रशासन" : "System Administration"}
          </span>
          <span className="text-[#94A3B8]">&gt;</span>
          <span className="text-[#102A43] font-bold">
            {isHi ? "उपयोगकर्ता खाते" : "User Accounts"}
          </span>
        </div>
        <div className="hidden sm:block text-[10px] font-mono text-[#64748B]">
          Role-Based Access Control (RBAC)
        </div>
      </div>

      {/* 1. Official Government Header Block */}
      <div className="bg-white border-l-4 border-l-[#FF9933] border-y border-r border-[#CBD5E1] p-4 sm:p-5 rounded-[2px] shadow-xs">
        <p className="text-[10px] tracking-wider uppercase font-bold text-[#205081]">
          {isHi ? "भारत सरकार • प्रणाली प्रशासन कक्ष • उपयोगकर्ता खाता शासन" : "GOVERNMENT OF INDIA • SYSTEM ADMINISTRATION • USER ACCOUNT GOVERNANCE"}
        </p>
        <h1 className="text-xl sm:text-2xl font-bold text-[#102A43] mt-1">
          {isHi ? "उपयोगकर्ता खाते एवं भूमिका अनुमतियाँ" : "User Accounts & Role Permissions"}
        </h1>
        <p className="text-xs text-[#64748B] mt-1">
          {isHi
            ? "केवल अधिकृत मुख्य प्रशासक नए उपयोगकर्ताओं को आमंत्रित कर सकते हैं और भूमिका-आधारित पहुंच अधिकार आवंटित कर सकते हैं।"
            : "Authorized platform administrators can invite new personnel and configure role-based access privileges."}
        </p>
      </div>

      {message && <p role="status" className="border-l-4 border-l-[#059669] bg-[#ECFDF5] p-3 text-xs text-[#065F46] border-y border-r border-[#A7F3D0] rounded-[2px]">{message}</p>}
      {error && <p role="alert" className="border-l-4 border-l-[#B42318] bg-[#FEF2F2] p-3 text-xs text-[#B42318] border-y border-r border-[#FECDCA] rounded-[2px]">{error}</p>}

      {/* Invitation Form (Government Form Style) */}
      <section className="bg-white border border-[#CBD5E1] p-4 sm:p-5 rounded-[2px] shadow-xs" aria-labelledby="invite-heading">
        <h2 id="invite-heading" className="text-xs sm:text-sm font-bold text-[#205081] uppercase tracking-wider">
          {isHi ? "नए उपयोगकर्ता को आमंत्रित करें" : "Invite a User"}
        </h2>
        <form onSubmit={invite} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 mt-3" aria-busy={busy}>
          <label className="text-xs font-bold text-[#102A43]">
            {isHi ? "ईमेल पता" : "Email Address"}
            <input type="email" required maxLength={254} autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1 block w-full px-3 py-1.5 border border-[#CBD5E1] bg-white text-xs text-[#102A43] rounded-[2px] focus:outline-none focus:border-[#205081]" />
          </label>
          <label className="text-xs font-bold text-[#102A43]">
            {isHi ? "खाता प्रकार / भूमिका" : "Role"}
            <select value={newRole} onChange={(event) => setNewRole(event.target.value as Role)} className="mt-1 block w-full px-3 py-1.5 border border-[#CBD5E1] bg-white text-xs font-semibold text-[#102A43] rounded-[2px] focus:outline-none focus:border-[#205081] cursor-pointer">
              {roleOptions.map((role) => <option key={role.value} value={role.value}>{t(role.label)}</option>)}
            </select>
          </label>
          <label className="text-xs font-bold text-[#102A43]">
            {isHi ? "संबद्ध संस्थान" : "Assigned Institution"}
            <select required={needsInstitution(newRole)} disabled={!needsInstitution(newRole)} value={needsInstitution(newRole) ? newInstitution : ""} onChange={(event) => setNewInstitution(event.target.value)} className="mt-1 block w-full px-3 py-1.5 border border-[#CBD5E1] bg-white disabled:bg-[#F4F6F9] text-xs font-semibold text-[#102A43] rounded-[2px] focus:outline-none focus:border-[#205081] cursor-pointer">
              <option value="">{isHi ? "संस्थान चुनें" : "Select an institution"}</option>
              {institutions.map((institution) => <option key={institution.id} value={institution.id}>{institution.name}</option>)}
            </select>
          </label>
          <div className="flex items-end">
            <button type="submit" disabled={busy || (needsInstitution(newRole) && !newInstitution)} className="w-full bg-[#205081] px-4 py-2 text-xs font-bold text-white hover:bg-[#112D4E] disabled:opacity-60 rounded-[2px] transition-colors cursor-pointer shadow-xs">
              {busy ? (isHi ? "आमंत्रण भेजा जा रहा है…" : "Sending Invite…") : (isHi ? "आमंत्रण भेजें" : "Send Invite")}
            </button>
          </div>
        </form>
      </section>

      {/* User Accounts Table (Government Portal Ledger Table Style) */}
      <section className="bg-white border border-[#CBD5E1] rounded-[2px] overflow-hidden shadow-xs" aria-labelledby="accounts-heading">
        <div className="bg-[#EAEFF5] border-b border-[#CBD5E1] p-3 sm:p-4 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#205081]">
              {isHi ? "सिस्टम निर्देशिका • पंजीकृत उपयोगकर्ता" : "System Directory • Registered Personnel"}
            </div>
            <h2 id="accounts-heading" className="text-xs sm:text-sm font-bold text-[#102A43] mt-0.5">
              {isHi ? "उपयोगकर्ता खाता निर्देशिका" : "User Accounts Directory"}
            </h2>
          </div>
          <form onSubmit={(event) => { event.preventDefault(); setPage(1); void load(1, search); }} className="flex gap-2">
            <label className="sr-only" htmlFor="account-search">{isHi ? "ईमेल खोजें" : "Search by email"}</label>
            <input id="account-search" type="search" value={search} maxLength={80} onChange={(event) => setSearch(event.target.value)} placeholder={isHi ? "ईमेल द्वारा खोजें..." : "Search by email..."} className="min-w-0 px-3 py-1.5 border border-[#CBD5E1] bg-white text-xs text-[#102A43] rounded-[2px] focus:outline-none focus:border-[#205081]" />
            <button type="submit" className="bg-[#205081] text-white px-3 py-1.5 text-xs font-bold rounded-[2px] hover:bg-[#112D4E] cursor-pointer shadow-xs">
              {isHi ? "खोजें" : "Search"}
            </button>
          </form>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-xs border-collapse">
            <thead className="bg-[#205081] text-white uppercase text-[10px] font-bold">
              <tr>
                <th scope="col" className="py-2.5 px-3 border-r border-[#112D4E]">{isHi ? "ईमेल" : "Email"}</th>
                <th scope="col" className="py-2.5 px-3 border-r border-[#112D4E]">{isHi ? "सत्यापन स्थिति" : "Verification"}</th>
                <th scope="col" className="py-2.5 px-3 border-r border-[#112D4E]">{isHi ? "भूमिका" : "Role"}</th>
                <th scope="col" className="py-2.5 px-3 border-r border-[#112D4E]">{isHi ? "संस्थान" : "Institution"}</th>
                <th scope="col" className="py-2.5 px-3 border-r border-[#112D4E]">{isHi ? "स्थिति" : "Status"}</th>
                <th scope="col" className="py-2.5 px-3 text-center w-24">{isHi ? "कार्रवाई" : "Action"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#CBD5E1] text-[#102A43]">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-xs text-[#64748B]">
                    {search
                      ? (isHi ? "शोध मानदंडों से मेल खाने वाला कोई खाता नहीं मिला।" : "No accounts match your search criteria.")
                      : (isHi ? "कोई खाता उपलब्ध नहीं है।" : "No accounts available.")}
                  </td>
                </tr>
              ) : users.map((user, idx) => {
                const edit = edits[user.user_id] || { role: "institution_staff" as Role, institution_id: "", is_active: false };
                const rowId = user.user_id;
                return (
                  <tr
                    key={rowId}
                    className={`transition-colors ${
                      idx % 2 === 0 ? "bg-white hover:bg-[#EAEFF5]" : "bg-[#F4F6F9] hover:bg-[#EAEFF5]"
                    }`}
                  >
                    <td className="px-3 py-2.5 font-bold text-[#205081] border-r border-[#CBD5E1]">
                      {user.email}
                      <span className="block text-[10px] text-[#64748B] font-mono font-normal mt-0.5">{new Date(user.created_at).toLocaleDateString()}</span>
                    </td>
                    <td className="px-3 py-2.5 border-r border-[#CBD5E1]">
                      <span className={`inline-block px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase rounded-[2px] border ${
                        user.is_email_verified
                          ? "bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]"
                          : "bg-[#FFFBEB] text-[#D97706] border-[#FEDF89]"
                      }`}>
                        {user.is_email_verified ? (isHi ? "सत्यापित" : "Verified") : (isHi ? "लंबित" : "Pending")}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 border-r border-[#CBD5E1]">
                      <select
                        aria-label={`Role for ${user.email}`}
                        value={edit.role}
                        onChange={(event) => {
                          const nextRole = event.target.value as Role;
                          setEdits((current) => ({
                            ...current,
                            [rowId]: {
                              ...current[rowId],
                              role: nextRole,
                              institution_id: needsInstitution(nextRole) ? current[rowId]?.institution_id || "" : "",
                            },
                          }));
                        }}
                        className="w-full px-2 py-1 border border-[#CBD5E1] bg-white text-xs font-semibold text-[#102A43] rounded-[2px] focus:outline-none focus:border-[#205081]"
                      >
                        {roleOptions.map((role) => (
                          <option key={role.value} value={role.value}>{t(role.label)}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-2.5 border-r border-[#CBD5E1]">
                      {needsInstitution(edit.role) ? (
                        <select
                          aria-label={`Institution for ${user.email}`}
                          value={edit.institution_id}
                          onChange={(event) => {
                            const nextInst = event.target.value;
                            setEdits((current) => ({
                              ...current,
                              [rowId]: {
                                ...current[rowId],
                                institution_id: nextInst,
                              },
                            }));
                          }}
                          className="w-full px-2 py-1 border border-[#CBD5E1] bg-white text-xs text-[#102A43] rounded-[2px] focus:outline-none focus:border-[#205081]"
                        >
                          <option value="">{isHi ? "संस्थान चुनें" : "Select"}</option>
                          {institutions.map((institution) => (
                            <option key={institution.id} value={institution.id}>{institution.name}</option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-[#64748B] text-xs">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 border-r border-[#CBD5E1]">
                      <label className="inline-flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={edit.is_active}
                          onChange={(event) => {
                            const nextActive = event.target.checked;
                            setEdits((current) => ({
                              ...current,
                              [rowId]: {
                                ...current[rowId],
                                is_active: nextActive,
                              },
                            }));
                          }}
                          className="rounded-[2px] text-[#205081] focus:ring-[#205081]"
                        />
                        <span className="text-xs font-semibold text-[#102A43]">
                          {edit.is_active ? (isHi ? "सक्रिय" : "Active") : (isHi ? "निष्क्रिय" : "Disabled")}
                        </span>
                      </label>
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <button
                        type="button"
                        disabled={busyId === rowId}
                        onClick={() => void save(user)}
                        className="bg-[#205081] text-white hover:bg-[#112D4E] px-2.5 py-1 text-xs font-bold rounded-[2px] transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
                      >
                        {busyId === rowId ? (isHi ? "सहेजा जा रहा है…" : "Saving…") : (isHi ? "सहेजें" : "Save")}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="border-t border-[#CBD5E1] bg-[#EAEFF5] px-4 py-2.5 flex items-center justify-between text-xs text-[#64748B]">
          <span className="font-mono">{isHi ? "पृष्ठ" : "Page"} {page}</span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page === 1}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              className="border border-[#205081] bg-white text-[#205081] px-3 py-1 font-bold rounded-[2px] disabled:opacity-50 hover:bg-[#F4F6F9] cursor-pointer"
            >
              {isHi ? "पिछला" : "Previous"}
            </button>
            <button
              type="button"
              disabled={!hasMore}
              onClick={() => setPage((value) => value + 1)}
              className="border border-[#205081] bg-white text-[#205081] px-3 py-1 font-bold rounded-[2px] disabled:opacity-50 hover:bg-[#F4F6F9] cursor-pointer"
            >
              {isHi ? "अगला" : "Next"}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
