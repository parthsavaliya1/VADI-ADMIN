"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import API from "@/lib/api";

type Product = {
  _id: string;
  name: string;
  approvalStatus?: string;
  isActive?: boolean;
  image?: string;
};

export default function SellerProductsPage() {
  const { data: session } = useSession();
  const userId = session?.user?.userId;
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (!userId) return;
    API.get("/sellers/me/products", { params: { userId } })
      .then(({ data }) => setProducts(data?.data || []))
      .catch(() => setProducts([]));
  }, [userId]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">My products</h1>
          <p className="text-sm text-muted-foreground">New products stay hidden until an admin approves them.</p>
        </div>
        <Link href="/admin/seller/products/add" className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm">
          Add product
        </Link>
      </div>
      <div className="space-y-2">
        {products.length === 0 ? (
          <p className="text-sm text-muted-foreground">No products yet.</p>
        ) : (
          products.map((product) => (
            <div key={product._id} className="border rounded-lg p-3 flex items-center justify-between">
              <div>
                <p className="font-medium">{product.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{product.approvalStatus || "pending"}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
