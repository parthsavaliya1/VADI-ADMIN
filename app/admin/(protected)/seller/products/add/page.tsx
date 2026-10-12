"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import API from "@/lib/api";

type Category = { _id: string; name: string };

export default function SellerAddProductPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const userId = session?.user?.userId;
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [unit, setUnit] = useState("kg");
  const [packSize, setPackSize] = useState("1");
  const [price, setPrice] = useState("");
  const [mrp, setMrp] = useState("");
  const [stock, setStock] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    API.get("/categories").then(({ data }) => {
      const list = data?.data || data || [];
      setCategories(Array.isArray(list) ? list : []);
      if (list[0]?._id) setCategory(list[0]._id);
    });
  }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setSaving(true);
    try {
      await API.post("/products/mine", {
        userId,
        name,
        description,
        category,
        unit,
        packUnit: unit,
        packSize: Number(packSize) || 1,
        price: Number(price),
        mrp: Number(mrp || price),
        stock: Number(stock),
      });
      router.push("/admin/seller/products");
    } catch (error: any) {
      alert(error.response?.data?.message || "Could not create product");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-3 max-w-xl">
      <h1 className="text-2xl font-semibold">Add product</h1>
      <input required className="w-full px-4 py-2.5 rounded-lg border" placeholder="Product name" value={name} onChange={(e) => setName(e.target.value)} />
      <textarea className="w-full px-4 py-2.5 rounded-lg border" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
      <select className="w-full px-4 py-2.5 rounded-lg border" value={category} onChange={(e) => setCategory(e.target.value)}>
        {categories.map((item) => (
          <option key={item._id} value={item._id}>{item.name}</option>
        ))}
      </select>
      <div className="grid grid-cols-2 gap-3">
        <select className="px-4 py-2.5 rounded-lg border" value={unit} onChange={(e) => setUnit(e.target.value)}>
          {["kg", "g", "litre", "ml", "pcs"].map((u) => <option key={u}>{u}</option>)}
        </select>
        <input className="px-4 py-2.5 rounded-lg border" placeholder="Pack size" value={packSize} onChange={(e) => setPackSize(e.target.value)} />
        <input required className="px-4 py-2.5 rounded-lg border" placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} />
        <input className="px-4 py-2.5 rounded-lg border" placeholder="MRP" value={mrp} onChange={(e) => setMrp(e.target.value)} />
        <input required className="px-4 py-2.5 rounded-lg border" placeholder="Stock" value={stock} onChange={(e) => setStock(e.target.value)} />
      </div>
      <button disabled={saving} className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground">
        {saving ? "Saving…" : "Submit for approval"}
      </button>
    </form>
  );
}
