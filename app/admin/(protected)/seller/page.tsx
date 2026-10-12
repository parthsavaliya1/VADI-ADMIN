"use client";

import { FormEvent, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import API from "@/lib/api";

export default function SellerShopPage() {
  const { data: session } = useSession();
  const userId = session?.user?.userId;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [area, setArea] = useState("");
  const [status, setStatus] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!userId) return;
    API.get("/sellers/me", { params: { userId } })
      .then(({ data }) => {
        const shop = data?.data;
        if (!shop) return;
        setName(shop.name || "");
        setEmail(shop.email || "");
        setPhone(shop.phone || "");
        setCity(shop.location?.city || "");
        setArea(shop.location?.area || "");
        setStatus(shop.status || "");
      })
      .catch(() => setMessage("Could not load shop"));
  }, [userId]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setSaving(true);
    setMessage("");
    try {
      const { data } = await API.put("/sellers/me", {
        userId,
        name,
        email,
        phone,
        city,
        area,
      });
      setMessage(data?.message || "Saved");
    } catch (error: any) {
      setMessage(error.response?.data?.message || "Could not save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 max-w-xl">
      <div>
        <h1 className="text-2xl font-semibold">My shop</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Status: <span className="capitalize">{status || "—"}</span>. Products you add stay pending until an admin approves them.
        </p>
      </div>
      <form onSubmit={onSubmit} className="space-y-3">
        <input className="w-full px-4 py-2.5 rounded-lg border" value={name} onChange={(e) => setName(e.target.value)} placeholder="Shop name" />
        <input className="w-full px-4 py-2.5 rounded-lg border" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" />
        <input className="w-full px-4 py-2.5 rounded-lg border" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
        <input className="w-full px-4 py-2.5 rounded-lg border" value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" />
        <input className="w-full px-4 py-2.5 rounded-lg border" value={area} onChange={(e) => setArea(e.target.value)} placeholder="Area" />
        <button disabled={saving} className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground">
          {saving ? "Saving…" : "Save details"}
        </button>
        {message && <p className="text-sm">{message}</p>}
      </form>
    </div>
  );
}
