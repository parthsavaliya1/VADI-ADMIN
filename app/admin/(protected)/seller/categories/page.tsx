"use client";

import { FormEvent, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import API from "@/lib/api";
import { uploadImageToSupabase } from "@/lib/upload";

type Category = { _id: string; name: string; approvalStatus?: string; image?: string };

export default function SellerCategoriesPage() {
  const { data: session } = useSession();
  const sellerId = session?.user?.role === "seller" ? session.user.id : "";
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [saving, setSaving] = useState(false);

  const load = () => {
    if (!sellerId) return;
    API.get("/sellers/me/categories", { params: { sellerId } })
      .then(({ data }) => setCategories(data?.data || []))
      .catch(() => setCategories([]));
  };

  useEffect(() => {
    load();
  }, [sellerId]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !sellerId) return;
    setSaving(true);
    try {
      await API.post("/sellers/me/categories", { sellerId, name: name.trim(), image });
      setName("");
      setImage("");
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
        <p className="text-sm text-muted-foreground">
          New categories stay hidden until an admin approves them. Approved categories can be used on your products.
        </p>
      </div>
      <form onSubmit={onSubmit} className="space-y-3 rounded-xl border border-[#E5E7EB] bg-white p-4">
        <input className="w-full px-4 py-2.5 rounded-lg border" placeholder="Category name" value={name} onChange={(e) => setName(e.target.value)} />
        <input
          type="file"
          accept="image/*"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const url = await uploadImageToSupabase(file, "category");
            if (url) setImage(url);
          }}
        />
        <button disabled={saving} className="rounded-lg bg-[#B56A45] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#9A5436] disabled:opacity-60">
          {saving ? "Sending…" : "Send for approval"}
        </button>
      </form>
      <div className="space-y-2">
        {categories.map((item) => (
          <div key={item._id} className="flex items-center justify-between gap-3 rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-sm">
            <div className="flex min-w-0 items-center gap-3">
              {item.image ? (
                <img src={item.image} alt="" className="h-9 w-9 rounded-md border border-[#E5E7EB] object-cover" />
              ) : null}
              <span className="truncate">{item.name}</span>
            </div>
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                item.approvalStatus === "approved"
                  ? "bg-[#E8F5E9] text-[#2E7D32]"
                  : item.approvalStatus === "rejected"
                    ? "bg-red-50 text-red-700"
                    : "bg-amber-50 text-amber-700"
              }`}
            >
              {item.approvalStatus || "pending"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
