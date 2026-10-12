"use client";

import { FormEvent, useEffect, useState } from "react";
import API from "@/lib/api";

type Category = { _id: string; name: string };

export default function SellerCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  const load = () => {
    API.get("/categories")
      .then(({ data }) => {
        const list = data?.data || data || [];
        setCategories(Array.isArray(list) ? list : []);
      })
      .catch(() => setCategories([]));
  };

  useEffect(() => {
    load();
  }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      await API.post("/categories", { name: name.trim(), isActive: true, showOnHome: false });
      setName("");
      load();
    } catch (error: any) {
      alert(error.response?.data?.message || "Could not create category");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 max-w-xl">
      <div>
        <h1 className="text-2xl font-semibold">Categories</h1>
        <p className="text-sm text-muted-foreground">Add a category, then use it when you list a product.</p>
      </div>
      <form onSubmit={onSubmit} className="flex gap-2">
        <input className="flex-1 px-4 py-2.5 rounded-lg border" placeholder="Category name" value={name} onChange={(e) => setName(e.target.value)} />
        <button disabled={saving} className="px-4 py-2.5 rounded-lg bg-primary text-primary-foreground">
          {saving ? "Adding…" : "Add"}
        </button>
      </form>
      <div className="space-y-2">
        {categories.map((item) => (
          <div key={item._id} className="border rounded-lg px-3 py-2 text-sm">{item.name}</div>
        ))}
      </div>
    </div>
  );
}
