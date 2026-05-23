"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ExternalLink, Phone, Plus, Search, Truck } from "lucide-react";
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

type Driver = {
  _id: string;
  phone: string;
  name?: string;
  isActive: boolean;
  createdAt: string;
};

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const fetchDrivers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await API.get<{ success: boolean; data: Driver[] }>(
        "/api/admin/drivers",
      );
      setDrivers(Array.isArray(data.data) ? data.data : []);
    } catch (e) {
      console.error("Fetch drivers:", e);
      setDrivers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return drivers;
    return drivers.filter((d) => {
      const phoneMatch = d.phone.toLowerCase().includes(q);
      const nameMatch = (d.name || "").toLowerCase().includes(q);
      return phoneMatch || nameMatch;
    });
  }, [drivers, search]);

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormMessage(null);
    const trimmed = phone.trim();
    if (!trimmed) {
      setFormMessage({ type: "error", text: "Phone number is required." });
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await API.post<{
        success: boolean;
        message?: string;
        data?: { id: string; phone: string; name: string };
      }>("/api/admin/drivers", {
        phone: trimmed,
        name: name.trim() || undefined,
      });
      if (data.success) {
        setFormMessage({
          type: "success",
          text:
            data.message ||
            "Driver created. They can sign in at /driver/login with this phone.",
        });
        setPhone("");
        setName("");
        await fetchDrivers();
      } else {
        setFormMessage({
          type: "error",
          text: "Could not create driver.",
        });
      }
    } catch (err) {
      const msg = axios.isAxiosError(err)
        ? (err.response?.data as { message?: string })?.message
        : undefined;
      setFormMessage({
        type: "error",
        text: msg || "Failed to create driver. Check the number and try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Drivers</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Register delivery drivers by phone. They sign in with OTP at{" "}
            <Link
              href="/driver/login"
              className="font-medium text-primary underline-offset-2 hover:underline"
            >
              Driver login
            </Link>
            .
          </p>
        </div>
        <Button variant="outline" size="sm" asChild className="w-fit gap-2">
          <Link href="/driver/login" target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4" />
            Open driver portal
          </Link>
        </Button>
      </div>

      <div className="rounded-xl border bg-card p-5 shadow-sm md:p-6">
        <div className="mb-4 flex items-center gap-2">
          <Truck className="h-5 w-5 text-primary" aria-hidden />
          <h2 className="text-lg font-semibold">Add driver</h2>
        </div>
        <form onSubmit={onCreate} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="driver-phone">Phone</Label>
            <Input
              id="driver-phone"
              type="tel"
              placeholder="+91 or 10-digit mobile"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoComplete="tel"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="driver-name">Name (optional)</Label>
            <Input
              id="driver-name"
              type="text"
              placeholder="Display name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="flex items-end gap-2">
            <Button type="submit" disabled={submitting} className="gap-2">
              <Plus className="h-4 w-4" />
              {submitting ? "Saving…" : "Add driver"}
            </Button>
          </div>
        </form>
        {formMessage && (
          <p
            className={`mt-3 text-sm ${
              formMessage.type === "success"
                ? "text-green-700 dark:text-green-400"
                : "text-destructive"
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
            placeholder="Filter by phone or name…"
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
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
            <p className="text-muted-foreground">
              {drivers.length === 0
                ? "No drivers yet. Add one above."
                : "No drivers match your search."}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-b bg-muted/50">
                <TableHead className="text-xs font-semibold uppercase tracking-wider">
                  Name
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider">
                  Phone
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider">
                  Status
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider">
                  Added
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((d) => (
                <TableRow
                  key={d._id}
                  className="border-b transition hover:bg-muted/50"
                >
                  <TableCell className="text-sm font-medium">
                    {d.name?.trim() ? d.name : "—"}
                  </TableCell>
                  <TableCell className="text-sm">
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                      {d.phone}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                        d.isActive
                          ? "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300"
                          : "bg-gray-100 text-gray-800 dark:bg-muted dark:text-muted-foreground"
                      }`}
                    >
                      {d.isActive ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(d.createdAt).toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Total drivers: {drivers.length}
        {search.trim() ? ` · Showing ${filtered.length}` : null}
      </p>
    </div>
  );
}
