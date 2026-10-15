"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import API from "@/lib/api";

type Product = {
  _id: string;
  name: string;
  isActive?: boolean;
  image?: string;
  variants?: { price?: number; stock?: number }[];
};

export default function SellerProductsPage() {
  const { data: session } = useSession();
  const sellerId = session?.user?.role === "seller" ? session.user.id : "";
  const [products, setProducts] = useState<Product[]>([]);

  const load = () => {
    if (!sellerId) return;
    API.get("/sellers/me/products", { params: { sellerId } })
      .then(({ data }) => setProducts(data?.data || []))
      .catch(() => setProducts([]));
  };

  useEffect(() => {
    load();
  }, [sellerId]);

  const toggle = async (product: Product) => {
    try {
      await API.put(`/sellers/me/products/${product._id}`, {
        sellerId,
        isActive: !product.isActive,
      });
      load();
    } catch (error: any) {
      alert(error.response?.data?.message || "Could not update product");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">My products</h1>
          <p className="text-sm text-muted-foreground">
            These are only your products. Because your shop is approved, new products are live right away.
          </p>
        </div>
        <Link href="/admin/seller/products/add" className="inline-flex w-full items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark sm:w-auto">
          Add product
        </Link>
      </div>
      <div className="space-y-2">
        {products.length === 0 ? (
          <div className="rounded-xl border border-border bg-card px-4 py-10 text-center text-sm text-muted-foreground">
            No products yet.
          </div>
        ) : (
          products.map((product) => (
            <div key={product._id} className="flex flex-col gap-3 rounded-xl border border-border bg-card p-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-border bg-secondary">
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">No image</div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground">{product.name}</p>
                  <p className="text-xs text-muted-foreground">
                    ₹{product.variants?.[0]?.price ?? "—"} · Stock {product.variants?.[0]?.stock ?? "—"}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${product.isActive ? "bg-[#E8F5E9] text-[#2E7D32]" : "bg-secondary text-muted-foreground"}`}>
                  {product.isActive ? "Live" : "Hidden"}
                </span>
                <Link
                  href={`/admin/seller/products/edit/${product._id}`}
                  className="rounded-lg border border-border px-3 py-1.5 text-sm text-foreground hover:bg-background"
                >
                  Edit
                </Link>
                <button type="button" onClick={() => toggle(product)} className="rounded-lg border border-border px-3 py-1.5 text-sm text-foreground hover:bg-background">
                  {product.isActive ? "Hide" : "Show"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
