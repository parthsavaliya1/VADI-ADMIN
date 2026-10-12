"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Search, Store } from "lucide-react";
import axios from "axios";
import API from "@/lib/api";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";

type Seller = {
  _id: string;
  name: string;
  phone?: string;
  email?: string;
  status?: "pending" | "approved" | "rejected";
  isActive: boolean;
  location?: { city?: string; area?: string };
  createdAt: string;
};

export default function SellersPage() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [area, setArea] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await API.get("/api/admin/sellers");
      setSellers(data?.data || []);
    } catch (error) {
      console.error(error);
      setSellers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return sellers;
    return sellers.filter((seller) => {
      const blob = [
        seller.name,
        seller.phone,
        seller.email,
        seller.location?.city,
        seller.location?.area,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return blob.includes(q);
    });
  }, [sellers, search]);

  const setStatus = async (id: string, status: "approved" | "rejected") => {
    try {
      const { data } = await API.put(`/api/admin/sellers/${id}/status`, { status });
      if (!data?.success) throw new Error(data?.message);
      load();
    } catch (error) {
      console.error(error);
      alert("Failed to update seller");
    }
  };

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormMessage(null);
    if (!name.trim() || !phone.trim() || password.trim().length < 6) {
      setFormMessage({
        type: "error",
        text: "Shop name, phone, and a password of at least 6 characters are required.",
      });
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await API.post("/api/admin/sellers", {
        name: name.trim(),
        phone: phone.trim(),
        password,
        email: email.trim() || undefined,
        city: city.trim() || undefined,
        area: area.trim() || undefined,
      });
      if (!data?.success) throw new Error(data?.message);
      setFormMessage({
        type: "success",
        text: "Seller added. They can sign in on the seller panel with this phone and password.",
      });
      setName("");
      setPhone("");
      setPassword("");
      setEmail("");
      setCity("");
      setArea("");
      await load();
    } catch (err) {
      const msg = axios.isAxiosError(err)
        ? (err.response?.data as { message?: string })?.message
        : undefined;
      setFormMessage({
        type: "error",
        text: msg || "Failed to add seller.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl font-bold md:text-3xl">Sellers</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Add a shop here, or approve a request that came from the app. Approved sellers sign in with their phone and password.
        </p>
      </div>

      <div className="rounded-xl border bg-card p-5 shadow-sm md:p-6">
        <div className="mb-4 flex items-center gap-2">
          <Store className="h-5 w-5 text-primary" aria-hidden />
          <h2 className="text-lg font-semibold">Add seller</h2>
        </div>
        <form onSubmit={onCreate} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="seller-name">Shop name</Label>
            <Input
              id="seller-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Farm name or shop"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="seller-phone">Phone</Label>
            <Input
              id="seller-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="10-digit mobile"
              autoComplete="tel"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="seller-password">Password</Label>
            <Input
              id="seller-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              autoComplete="new-password"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="seller-email">Email</Label>
            <Input
              id="seller-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Optional"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="seller-area">Area</Label>
            <Input
              id="seller-area"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="Optional"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="seller-city">City</Label>
            <Input
              id="seller-city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Optional"
            />
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <Button type="submit" disabled={submitting} className="gap-2">
              <Plus className="h-4 w-4" />
              {submitting ? "Saving…" : "Add seller"}
            </Button>
          </div>
        </form>
        {formMessage && (
          <p
            className={`mt-3 text-sm ${
              formMessage.type === "success" ? "text-primary" : "text-destructive"
            }`}
            role="status"
          >
            {formMessage.text}
          </p>
        )}
      </div>

      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search sellers by name, phone, or city…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border bg-background py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            {sellers.length === 0 ? "No sellers yet. Add one above." : "No sellers match your search."}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-b bg-muted/50">
                <TableHead>Shop</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((seller) => (
                <TableRow key={seller._id}>
                  <TableCell className="font-medium">{seller.name}</TableCell>
                  <TableCell>
                    <div>{seller.phone || "—"}</div>
                    <div className="text-xs text-muted-foreground">{seller.email || ""}</div>
                  </TableCell>
                  <TableCell>
                    {[seller.location?.area, seller.location?.city].filter(Boolean).join(", ") || "—"}
                  </TableCell>
                  <TableCell className="capitalize">{seller.status || "approved"}</TableCell>
                  <TableCell className="text-right space-x-2">
                    {seller.status !== "approved" && (
                      <button
                        className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm"
                        onClick={() => setStatus(seller._id, "approved")}
                      >
                        Approve
                      </button>
                    )}
                    {seller.status !== "rejected" && (
                      <button
                        className="px-3 py-1.5 rounded-lg border text-sm"
                        onClick={() => setStatus(seller._id, "rejected")}
                      >
                        Reject
                      </button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Total sellers: {sellers.length}
        {search.trim() ? ` · Showing ${filtered.length}` : null}
      </p>
    </div>
  );
}
