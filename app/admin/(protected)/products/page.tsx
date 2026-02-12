"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";

interface Product {
  _id: string;
  name: string;
  brand: string;
  category?: {
    name: string;
  };
  variants: any[];
  isActive: boolean;
  createdAt: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");

  const fetchProducts = async () => {
    setLoading(true);

    const res = await fetch(
      `/api/admin/products?page=${page}&limit=10&search=${search}`,
    );

    const data = await res.json();

    if (data.success) {
      setProducts(data.data);
      setTotalPages(data.pagination.pages);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, [page, search]);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Products</h2>

        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-2.5 text-muted-foreground"
          />
          <input
            placeholder="Search products..."
            className="pl-8 pr-4 py-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary outline-none text-sm"
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="p-4">Name</th>
              <th className="p-4">Brand</th>
              <th className="p-4">Category</th>
              <th className="p-4">Variants</th>
              <th className="p-4">Status</th>
              <th className="p-4">Created</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="p-6 text-center">
                  Loading...
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center">
                  No products found
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr
                  key={product._id}
                  className="border-t border-border hover:bg-muted/30 transition"
                >
                  <td className="p-4 font-medium">{product.name}</td>
                  <td className="p-4">{product.brand || "-"}</td>
                  <td className="p-4">{product.category?.name || "-"}</td>
                  <td className="p-4">{product.variants?.length || 0}</td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        product.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {product.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="p-4">
                    {new Date(product.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center">
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
          className="px-4 py-2 text-sm border border-border rounded-md disabled:opacity-50"
        >
          Previous
        </button>

        <span className="text-sm text-muted-foreground">
          Page {page} of {totalPages}
        </span>

        <button
          disabled={page === totalPages}
          onClick={() => setPage((p) => p + 1)}
          className="px-4 py-2 text-sm border border-border rounded-md disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
