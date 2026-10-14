"use client";

import { FormEvent, useEffect, useState } from "react";
import { Loader2, Ticket } from "lucide-react";
import API from "@/lib/api";

type Option = { _id: string; name: string };
type Coupon = {
  _id: string;
  code: string;
  description: string;
  discountType: "percent" | "flat";
  discountValue: number;
  maxDiscount: number;
  minOrderAmount: number;
  usageLimit: number;
  usedCount: number;
  perUserLimit: number;
  startsAt?: string | null;
  expiresAt?: string | null;
  isActive: boolean;
  appliesTo: "all" | "selected";
  categories: Option[];
  products: Option[];
};

const emptyForm = {
  code: "",
  description: "",
  discountType: "percent" as "percent" | "flat",
  discountValue: "10",
  maxDiscount: "0",
  minOrderAmount: "0",
  usageLimit: "0",
  perUserLimit: "1",
  startsAt: "",
  expiresAt: "",
  isActive: true,
  appliesTo: "all" as "all" | "selected",
  categories: [] as string[],
  products: [] as string[],
};

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [categories, setCategories] = useState<Option[]>([]);
  const [products, setProducts] = useState<Option[]>([]);
  const [productQuery, setProductQuery] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data } = await API.get("/api/admin/coupons");
    setCoupons(data.data || []);
  };

  useEffect(() => {
    Promise.all([
      load(),
      API.get("/api/admin/categories", { params: { limit: 100 } }),
    ])
      .then(([, categoriesRes]) => setCategories(categoriesRes.data?.data || []))
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      API.get("/api/admin/products", { params: { search: productQuery, limit: 20 } })
        .then((res) => setProducts(res.data?.data || []))
        .catch(() => setProducts([]));
    }, 250);
    return () => clearTimeout(timer);
  }, [productQuery]);

  const toggle = (key: "categories" | "products", id: string) => {
    setForm((current) => ({
      ...current,
      [key]: current[key].includes(id)
        ? current[key].filter((item) => item !== id)
        : [...current[key], id],
    }));
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      discountValue: Number(form.discountValue),
      maxDiscount: Number(form.maxDiscount),
      minOrderAmount: Number(form.minOrderAmount),
      usageLimit: Number(form.usageLimit),
      perUserLimit: Number(form.perUserLimit),
      startsAt: form.startsAt || null,
      expiresAt: form.expiresAt || null,
      categories: form.appliesTo === "selected" ? form.categories : [],
      products: form.appliesTo === "selected" ? form.products : [],
    };
    try {
      if (editing) await API.put(`/api/admin/coupons/${editing}`, payload);
      else await API.post("/api/admin/coupons", payload);
      setForm(emptyForm);
      setEditing(null);
      await load();
    } catch (error: any) {
      alert(error?.response?.data?.message || "Could not save coupon");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (coupon: Coupon) => {
    setEditing(coupon._id);
    setForm({
      code: coupon.code,
      description: coupon.description || "",
      discountType: coupon.discountType,
      discountValue: String(coupon.discountValue),
      maxDiscount: String(coupon.maxDiscount || 0),
      minOrderAmount: String(coupon.minOrderAmount || 0),
      usageLimit: String(coupon.usageLimit || 0),
      perUserLimit: String(coupon.perUserLimit || 1),
      startsAt: coupon.startsAt ? coupon.startsAt.slice(0, 16) : "",
      expiresAt: coupon.expiresAt ? coupon.expiresAt.slice(0, 16) : "",
      isActive: coupon.isActive,
      appliesTo: coupon.appliesTo,
      categories: (coupon.categories || []).map((item) => item._id),
      products: (coupon.products || []).map((item) => item._id),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Ticket className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Coupons</h1>
          <p className="text-sm text-muted-foreground">
            Create codes for every product, or limit them to selected categories and products.
          </p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="grid gap-4 rounded-xl border bg-card p-5 md:grid-cols-2">
        <label className="text-sm">
          Code
          <input className="mt-1 w-full rounded-lg border px-3 py-2" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} required />
        </label>
        <label className="text-sm">
          Description
          <input className="mt-1 w-full rounded-lg border px-3 py-2" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </label>
        <label className="text-sm">
          Discount type
          <select className="mt-1 w-full rounded-lg border px-3 py-2" value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value as "percent" | "flat" })}>
            <option value="percent">Percent</option>
            <option value="flat">Flat amount (₹)</option>
          </select>
        </label>
        <label className="text-sm">
          Discount value
          <input type="number" min="1" className="mt-1 w-full rounded-lg border px-3 py-2" value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: e.target.value })} required />
        </label>
        <label className="text-sm">
          Max discount (₹, percent only, 0 = no cap)
          <input type="number" min="0" className="mt-1 w-full rounded-lg border px-3 py-2" value={form.maxDiscount} onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })} />
        </label>
        <label className="text-sm">
          Minimum order (₹)
          <input type="number" min="0" className="mt-1 w-full rounded-lg border px-3 py-2" value={form.minOrderAmount} onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })} />
        </label>
        <label className="text-sm">
          Total uses (0 = unlimited)
          <input type="number" min="0" className="mt-1 w-full rounded-lg border px-3 py-2" value={form.usageLimit} onChange={(e) => setForm({ ...form, usageLimit: e.target.value })} />
        </label>
        <label className="text-sm">
          Uses per customer
          <input type="number" min="1" className="mt-1 w-full rounded-lg border px-3 py-2" value={form.perUserLimit} onChange={(e) => setForm({ ...form, perUserLimit: e.target.value })} />
        </label>
        <label className="text-sm">
          Starts
          <input type="datetime-local" className="mt-1 w-full rounded-lg border px-3 py-2" value={form.startsAt} onChange={(e) => setForm({ ...form, startsAt: e.target.value })} />
        </label>
        <label className="text-sm">
          Expires
          <input type="datetime-local" className="mt-1 w-full rounded-lg border px-3 py-2" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
          Active
        </label>
        <label className="text-sm">
          Applies to
          <select className="mt-1 w-full rounded-lg border px-3 py-2" value={form.appliesTo} onChange={(e) => setForm({ ...form, appliesTo: e.target.value as "all" | "selected" })}>
            <option value="all">All products</option>
            <option value="selected">Selected categories and products</option>
          </select>
        </label>

        {form.appliesTo === "selected" && (
          <div className="md:col-span-2 grid gap-4 md:grid-cols-2">
            <div>
              <p className="mb-2 text-sm font-medium">Categories</p>
              <div className="max-h-48 space-y-1 overflow-auto rounded-lg border p-2">
                {categories.map((item) => (
                  <label key={item._id} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={form.categories.includes(item._id)} onChange={() => toggle("categories", item._id)} />
                    {item.name}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-sm font-medium">Products</p>
              <input className="mb-2 w-full rounded-lg border px-3 py-2 text-sm" placeholder="Search products" value={productQuery} onChange={(e) => setProductQuery(e.target.value)} />
              <div className="max-h-48 space-y-1 overflow-auto rounded-lg border p-2">
                {products.map((item) => (
                  <label key={item._id} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={form.products.includes(item._id)} onChange={() => toggle("products", item._id)} />
                    {item.name}
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="md:col-span-2 flex gap-2">
          <button disabled={saving} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
            {saving ? "Saving..." : editing ? "Update coupon" : "Create coupon"}
          </button>
          {editing && (
            <button type="button" className="rounded-lg border px-4 py-2 text-sm" onClick={() => { setEditing(null); setForm(emptyForm); }}>
              Cancel
            </button>
          )}
        </div>
      </form>

      {loading ? (
        <Loader2 className="h-6 w-6 animate-spin" />
      ) : (
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left">
              <tr>
                <th className="p-3">Code</th>
                <th className="p-3">Offer</th>
                <th className="p-3">Applies to</th>
                <th className="p-3">Used</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((coupon) => (
                <tr key={coupon._id} className="border-t">
                  <td className="p-3 font-semibold">{coupon.code}{!coupon.isActive ? " (off)" : ""}</td>
                  <td className="p-3">{coupon.discountType === "percent" ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}</td>
                  <td className="p-3">
                    {coupon.appliesTo === "all"
                      ? "All products"
                      : [
                          ...(coupon.categories || []).map((item) => item.name),
                          ...(coupon.products || []).map((item) => item.name),
                        ].join(", ") || "None"}
                  </td>
                  <td className="p-3">{coupon.usedCount}{coupon.usageLimit ? ` / ${coupon.usageLimit}` : ""}</td>
                  <td className="p-3 text-right">
                    <button className="mr-3 text-primary" onClick={() => startEdit(coupon)}>Edit</button>
                    <button
                      className="text-red-600"
                      onClick={async () => {
                        if (!confirm(`Delete ${coupon.code}?`)) return;
                        await API.delete(`/api/admin/coupons/${coupon._id}`);
                        await load();
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
