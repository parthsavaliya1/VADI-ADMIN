"use client";

import { FormEvent, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import API from "@/lib/api";

export default function ProfilePage() {
  const { data: session } = useSession();
  const isSeller = session?.user?.role === "seller";
  const sellerId = isSeller ? session?.user?.id : "";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [area, setArea] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!sellerId) return;
    API.get("/sellers/me", { params: { sellerId } })
      .then(({ data }) => {
        const shop = data?.data;
        if (!shop) return;
        setName(shop.name || "");
        setEmail(shop.email || "");
        setPhone(shop.phone || "");
        setCity(shop.location?.city || "");
        setArea(shop.location?.area || "");
      })
      .catch(() => setMessage("Could not load shop"));
  }, [sellerId]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!sellerId) return;
    setSaving(true);
    setMessage("");
    try {
      const { data } = await API.put("/sellers/me", { sellerId, name, email, phone, city, area });
      setMessage(data?.message || "Saved");
    } catch (error: any) {
      setMessage(error.response?.data?.message || "Could not save");
    } finally {
      setSaving(false);
    }
  };

  if (!isSeller) {
    return (
      <div className="max-w-xl space-y-2 rounded-xl border border-border bg-card p-6">
        <h1 className="text-2xl font-semibold">Profile</h1>
        <p className="text-sm text-muted-foreground">{session?.user?.name}</p>
        <p className="text-sm text-muted-foreground">{session?.user?.email}</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="max-w-xl space-y-3 rounded-xl border border-border bg-card p-5 sm:p-6">
      <div>
        <h1 className="text-2xl font-semibold">Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">Shop details for your seller account.</p>
      </div>
      <input className="w-full px-4 py-2.5 rounded-lg border" value={name} onChange={(e) => setName(e.target.value)} placeholder="Shop name" />
      <input className="w-full px-4 py-2.5 rounded-lg border" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" />
      <input className="w-full px-4 py-2.5 rounded-lg border" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
      <input className="w-full px-4 py-2.5 rounded-lg border" value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" />
      <input className="w-full px-4 py-2.5 rounded-lg border" value={area} onChange={(e) => setArea(e.target.value)} placeholder="Area" />
      <button disabled={saving} className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white disabled:opacity-60">
        {saving ? "Saving…" : "Save details"}
      </button>
      {message ? <p className="text-sm">{message}</p> : null}
    </form>
  );
}
