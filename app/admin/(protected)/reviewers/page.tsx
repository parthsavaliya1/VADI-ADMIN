"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Loader2, Plus, Save, ShieldCheck } from "lucide-react";
import API from "@/lib/api";

type Reviewer = { _id: string; name: string; phone: string; enabled: boolean; hasCode: boolean; status: string };
const emptyForm = { name: "", phone: "", code: "", enabled: true };
const inputClass = "mt-2 w-full rounded-lg border bg-background px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50";
function errorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 404) return "Reviewer settings are unavailable on this backend. Deploy the updated backend before using this page.";
    return error.response?.data?.message || "Could not save reviewer settings. Please try again.";
  }
  return "Could not save reviewer settings. Please try again.";
}
export default function ReviewerAccountsPage() {
  const [accounts, setAccounts] = useState<Reviewer[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [ready, setReady] = useState(false);

  async function load() {
    setLoading(true); setError("");
    try {
      const { data } = await API.get("/api/admin/reviewers");
      setAccounts(data.data); setReady(true);
    } catch (err) { setError(errorMessage(err)); setReady(false); }
    finally { setLoading(false); }
  }
  useEffect(() => { void load(); }, []);

  function reset() { setEditing(null); setForm(emptyForm); }
  function edit(account: Reviewer) {
    setEditing(account._id);
    setForm({ name: account.name, phone: account.phone.replace(/^\+91/, ""), code: "", enabled: account.enabled });
    setError(""); setNotice("");
  }
  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (busy) return;
    setBusy("save"); setError(""); setNotice("");
    try {
      const payload = { name: form.name.trim(), enabled: form.enabled, ...(form.code ? { code: form.code } : {}) };
      const { data } = editing
        ? await API.put(`/api/admin/reviewers/${editing}`, payload)
        : await API.post("/api/admin/reviewers", { ...payload, phone: form.phone });
      setAccounts(list => editing ? list.map(item => item._id === editing ? data.data : item) : [data.data, ...list]);
      reset(); setNotice("Reviewer saved. Share the phone number and assigned code with the reviewer.");
    } catch (err) { setError(errorMessage(err)); }
    finally { setBusy(null); }
  }
  async function toggle(account: Reviewer) {
    if (busy) return;
    setBusy(account._id); setError(""); setNotice("");
    try {
      const { data } = await API.put(`/api/admin/reviewers/${account._id}`, { enabled: !account.enabled });
      setAccounts(list => list.map(item => item._id === account._id ? data.data : item));
      if (editing === account._id) setForm(value => ({ ...value, enabled: data.data.enabled }));
      setNotice(data.data.enabled ? "Reviewer access enabled." : "Reviewer access disabled. Existing sessions are also blocked.");
    } catch (err) { setError(errorMessage(err)); }
    finally { setBusy(null); }
  }
  return <div className="max-w-5xl space-y-6">
    <div><h1 className="flex items-center gap-3 text-3xl font-bold"><ShieldCheck className="h-7 w-7 text-primary" />Reviewer Accounts</h1>
      <p className="mt-2 text-muted-foreground">Manage reviewer access through the normal VADI phone login and OTP screens.</p></div>
    {error && <div role="alert" className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-800">{error}{!ready && <button onClick={() => void load()} className="ml-3 underline">Retry</button>}</div>}
    {notice && <p role="status" className="rounded-lg border bg-muted/40 p-4">{notice}</p>}
    <section className="rounded-xl border bg-card p-6 shadow-sm">
      <h2 className="text-lg font-semibold">{editing ? "Edit reviewer" : "Add reviewer"}</h2>
      <p className="mt-1 text-sm text-muted-foreground">Use a separate phone number for each reviewer. Review accounts use demo orders and payments.</p>
      <form onSubmit={save} className="mt-5 space-y-5">
        <fieldset disabled={Boolean(busy) || !ready} className="grid gap-5 sm:grid-cols-2 disabled:opacity-60">
          <label className="text-sm font-medium">Name<input className={inputClass} required maxLength={100} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} autoComplete="off" /></label>
          <label className="text-sm font-medium">Mobile number (+91)<input className={inputClass} required disabled={Boolean(editing)} inputMode="numeric" pattern="[6-9][0-9]{9}" maxLength={10} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })} autoComplete="off" /></label>
          <label className="text-sm font-medium">{editing ? "New six-digit code (optional)" : "Six-digit review code"}<input className={inputClass} required={!editing} type="password" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} value={form.code} onChange={e => setForm({ ...form, code: e.target.value.replace(/\D/g, "").slice(0, 6) })} autoComplete="new-password" /><span className="mt-2 block text-xs text-muted-foreground">{editing ? "Leave blank to keep the current code. " : ""}Keep a copy of the code; saved codes cannot be viewed.</span></label>
          <label className="flex items-center gap-3 text-sm font-medium"><input type="checkbox" checked={form.enabled} onChange={e => setForm({ ...form, enabled: e.target.checked })} className="h-4 w-4" />Reviewer access enabled</label>
        </fieldset>
        <div className="flex gap-3"><button disabled={Boolean(busy) || !ready} className="flex items-center gap-2 rounded-lg bg-primary px-5 py-3 font-medium text-primary-foreground disabled:opacity-50">{busy === "save" ? <Loader2 className="h-4 w-4 animate-spin" /> : editing ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}{editing ? "Save reviewer" : "Add reviewer"}</button>
          {editing && <button type="button" onClick={reset} disabled={Boolean(busy)} className="rounded-lg border px-5 py-3">Cancel</button>}</div>
      </form>
    </section>
    <section className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <h2 className="border-b px-6 py-4 text-lg font-semibold">Reviewer accounts</h2>
      {loading ? <div role="status" className="flex items-center gap-2 p-6"><Loader2 className="h-5 w-5 animate-spin" />Loading reviewers...</div> : ready && accounts.length === 0 ? <p className="p-6 text-muted-foreground">No reviewer accounts yet. Add one above.</p> : <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-muted/40"><tr><th className="px-6 py-3">Reviewer</th><th className="px-6 py-3">Phone</th><th className="px-6 py-3">Access</th><th className="px-6 py-3">Actions</th></tr></thead>
        <tbody>{accounts.map(account => <tr key={account._id} className="border-t"><td className="px-6 py-4 font-medium">{account.name}</td><td className="px-6 py-4">{account.phone}</td><td className="px-6 py-4">{account.status === "blocked" ? "Blocked" : account.enabled ? "Enabled" : "Disabled"}{!account.hasCode && <span className="block text-xs text-muted-foreground">Set a review code</span>}</td><td className="px-6 py-4"><div className="flex gap-3"><button type="button" disabled={Boolean(busy)} onClick={() => edit(account)} className="rounded-md border px-3 py-2 disabled:opacity-50">Edit</button><button type="button" disabled={Boolean(busy) || (!account.enabled && (!account.hasCode || account.status === "blocked"))} onClick={() => void toggle(account)} className="rounded-md border px-3 py-2 disabled:opacity-50">{busy === account._id ? "Saving..." : account.enabled ? "Disable" : "Enable"}</button></div></td></tr>)}</tbody></table></div>}
    </section>
    <div className="rounded-lg bg-muted/40 p-5 text-sm"><h2 className="font-semibold">Reviewer sign-in instructions</h2><ol className="mt-2 list-inside list-decimal space-y-1"><li>Open the normal VADI login screen.</li><li>Enter the assigned mobile number and accept the privacy policy.</li><li>Tap Continue, then enter the assigned six-digit code on the OTP screen.</li></ol><p className="mt-3 text-muted-foreground">The review code is reusable while access is enabled. No SMS is sent for reviewer accounts.</p></div>
  </div>;
}
