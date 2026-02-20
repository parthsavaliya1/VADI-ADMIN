"use client";

import { useEffect, useState } from "react";
import { Search, Plus, Edit2, Trash2, Eye, Filter, X } from "lucide-react";
import Link from "next/link";
import API from "@/lib/api";

import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/app/components/ui/table";

type Product = {
  _id: string;
  name: string;
  slug: string;
  brand: string;
  category: {
    _id: string;
    name: string;
    slug: string;
  };
  variants: Array<{
    _id: string;
    packSize: number;
    packUnit: string;
    price: number;
    mrp: number;
    stock: number;
    isDefault: boolean;
  }>;
  image: string;
  featured: boolean;
  trending: boolean;
  bestDeal: boolean;
  isActive: boolean;
  createdAt: string;
};

type Category = {
  _id: string;
  name: string;
  slug: string;
};

export default function ProductsClient() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params: any = {
        search,
        page: page.toString(),
        limit: "10",
      };

      if (categoryFilter) params.category = categoryFilter;

      if (statusFilter === "active") params.isActive = "true";
      else if (statusFilter === "inactive") params.isActive = "false";
      else if (statusFilter === "featured") params.featured = "true";
      else if (statusFilter === "trending") params.trending = "true";
      else if (statusFilter === "bestDeal") params.bestDeal = "true";

      const { data } = await API.get("/products", { params });

      setProducts(data.data || []);
      setTotalPages(data.pagination?.pages || 1);
      setTotal(data.pagination?.total || 0);
    } catch (error) {
      console.error("Fetch products error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await API.get("/categories", {
        params: { isActive: "true" },
      });
      if (data.success) {
        setCategories(data.data || []);
      }
    } catch (error) {
      console.error("Fetch categories error:", error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [search, categoryFilter, statusFilter, page]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to deactivate "${name}"?`)) return;

    try {
      await API.delete(`/products/${id}`);
      fetchProducts();
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to deactivate product");
    }
  };

  const getDefaultVariant = (product: Product) => {
    return (
      product.variants.find((v) => v.isDefault) || product.variants[0] || {}
    );
  };

  const getVisiblePages = () => {
    const group = Math.floor((page - 1) / 5);
    const start = group * 5 + 1;
    const end = Math.min(start + 4, totalPages);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  const clearFilters = () => {
    setSearch("");
    setCategoryFilter("");
    setStatusFilter("all");
    setPage(1);
  };

  const activeFiltersCount = [
    search,
    categoryFilter,
    statusFilter !== "all",
  ].filter(Boolean).length;

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Products</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your product inventory ({total} total)
          </p>
        </div>

        <Link
          href="/admin/products/add"
          className="px-4 py-2.5 bg-primary text-primary-foreground rounded-lg 
                     hover:bg-primary/90 transition flex items-center justify-center gap-2 font-medium
                     shadow-sm hover:shadow-md"
        >
          <Plus className="h-4 w-4" />
          Add Product
        </Link>
      </div>

      {/* Filters Section */}
      <div className="bg-card rounded-xl shadow-sm p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search products by name, brand, or description..."
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border bg-background 
                       focus:outline-none focus:ring-2 focus:ring-primary transition"
            />
          </div>

          {/* Filter Toggle Button (Mobile) */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="sm:hidden px-4 py-2.5 rounded-lg border bg-background 
                     hover:bg-muted transition flex items-center justify-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
            {activeFiltersCount > 0 && (
              <span className="px-2 py-0.5 bg-primary text-primary-foreground text-xs rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        {/* Filter Dropdowns */}
        <div
          className={`grid sm:grid-cols-3 gap-3 ${showFilters ? "grid" : "hidden sm:grid"}`}
        >
          <select
            value={categoryFilter}
            onChange={(e) => {
              setPage(1);
              setCategoryFilter(e.target.value);
            }}
            className="px-4 py-2.5 rounded-lg border bg-background 
                     focus:outline-none focus:ring-2 focus:ring-primary transition"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => {
              setPage(1);
              setStatusFilter(e.target.value);
            }}
            className="px-4 py-2.5 rounded-lg border bg-background 
                     focus:outline-none focus:ring-2 focus:ring-primary transition"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
            <option value="featured">Featured</option>
            <option value="trending">Trending</option>
            <option value="bestDeal">Best Deals</option>
          </select>

          {activeFiltersCount > 0 && (
            <button
              onClick={clearFilters}
              className="px-4 py-2.5 rounded-lg border border-red-200 bg-red-50 
                       hover:bg-red-100 transition flex items-center justify-center gap-2
                       text-red-700 dark:bg-red-950 dark:border-red-800 dark:text-red-400"
            >
              <X className="h-4 w-4" />
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Table Card with Horizontal Scroll */}
      <div className="bg-card rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow className="border-0 bg-muted/50">
                <TableHead className="font-semibold text-foreground whitespace-nowrap">
                  Product
                </TableHead>
                <TableHead className="font-semibold text-foreground whitespace-nowrap">
                  Category
                </TableHead>
                <TableHead className="font-semibold text-foreground whitespace-nowrap">
                  Brand
                </TableHead>
                <TableHead className="font-semibold text-foreground whitespace-nowrap">
                  Price
                </TableHead>
                <TableHead className="font-semibold text-foreground whitespace-nowrap">
                  Stock
                </TableHead>
                <TableHead className="font-semibold text-foreground whitespace-nowrap">
                  Status
                </TableHead>
                <TableHead className="font-semibold text-foreground text-right whitespace-nowrap">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i} className="border-0">
                    <TableCell colSpan={7}>
                      <div className="h-16 bg-muted animate-pulse rounded w-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : products.length === 0 ? (
                <TableRow className="border-0">
                  <TableCell colSpan={7} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                        <Search className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <p className="text-lg font-medium">No products found</p>
                      <p className="text-sm text-muted-foreground">
                        Try adjusting your search or filters
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => {
                  const defaultVariant = getDefaultVariant(product);
                  return (
                    <TableRow
                      key={product._id}
                      className="border-0 hover:bg-muted/40 transition"
                    >
                      <TableCell className="min-w-[250px]">
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-14 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                            {product.image ? (
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                                No Image
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium truncate">
                              {product.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {defaultVariant.packSize}{" "}
                              {defaultVariant.packUnit}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <span className="inline-flex px-2.5 py-1 rounded-md bg-primary text-primary-foreground font-medium">
                          {product.category?.name || "N/A"}
                        </span>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {product.brand || (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <div className="font-semibold text-green-600 dark:text-green-400">
                          ₹{defaultVariant.price?.toLocaleString()}
                        </div>
                        {defaultVariant.mrp > defaultVariant.price && (
                          <div className="text-xs text-muted-foreground line-through">
                            ₹{defaultVariant.mrp?.toLocaleString()}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium
                          ${
                            defaultVariant.stock > 20
                              ? "bg-primary text-primary-foreground"
                              : defaultVariant.stock > 0
                                ? "bg-primary text-primary-foreground"
                                : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                          }`}
                        >
                          {defaultVariant.stock || 0} units
                        </span>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <div className="flex flex-col gap-1.5">
                          {product.isActive ? (
                            <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-primary text-primary-foreground w-fit">
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400 w-fit">
                              Inactive
                            </span>
                          )}
                          <div className="flex gap-1">
                            {product.featured && (
                              <span
                                className="text-xs px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                title="Featured"
                              >
                                ★
                              </span>
                            )}
                            {product.trending && (
                              <span
                                className="text-xs px-1.5 py-0.5 rounded bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                                title="Trending"
                              >
                                🔥
                              </span>
                            )}
                            {product.bestDeal && (
                              <span
                                className="text-xs px-1.5 py-0.5 rounded bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                title="Best Deal"
                              >
                                💰
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          {/* <Link
                            href={`/admin/products/${product._id}`}
                            className="p-2 bg-primary text-primary-foreground rounded-lg transition"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Link> */}
                          <Link
                            href={`/admin/products/edit/${product._id}`}
                            className="p-2 bg-primary text-primary-foreground rounded-lg transition"
                            title="Edit Product"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() =>
                              handleDelete(product._id, product.name)
                            }
                            className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition text-red-600 dark:text-red-400"
                            title="Deactivate"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {!loading && products.length > 0 && (
          <div className="border-t p-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground">
                Showing {(page - 1) * 10 + 1} to {Math.min(page * 10, total)} of{" "}
                {total} products
              </p>

              <div className="flex items-center gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((prev) => prev - 1)}
                  className="px-3 py-1.5 text-sm rounded-lg border
                           disabled:opacity-40 disabled:cursor-not-allowed
                           hover:bg-muted transition"
                >
                  Previous
                </button>

                <div className="hidden sm:flex items-center gap-1">
                  {getVisiblePages().map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`px-3 py-1.5 text-sm rounded-lg transition
                      ${
                        page === p
                          ? "bg-primary text-primary-foreground font-medium"
                          : "hover:bg-muted"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>

                <span className="sm:hidden text-sm font-medium">
                  {page} / {totalPages}
                </span>

                <button
                  disabled={page === totalPages}
                  onClick={() => setPage((prev) => prev + 1)}
                  className="px-3 py-1.5 text-sm rounded-lg border
                           disabled:opacity-40 disabled:cursor-not-allowed
                           hover:bg-muted transition"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
