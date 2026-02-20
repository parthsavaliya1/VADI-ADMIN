"use client";

import { useEffect, useState } from "react";
import { Search, Plus, Edit2, Trash2, X, Filter } from "lucide-react";
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

type Category = {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  sortOrder: number;
  showOnHome: boolean;
  isActive: boolean;
  createdAt: string;
  productCount?: number;
};

export default function CategoriesClient() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [homeFilter, setHomeFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const params: any = {
        page: page.toString(),
        limit: "10",
      };

      if (statusFilter === "active") params.isActive = "true";
      if (statusFilter === "inactive") params.isActive = "false";

      if (homeFilter === "home") params.showOnHome = "true";
      if (homeFilter === "notHome") params.showOnHome = "false";

      const { data } = await API.get("/categories", { params });

      setCategories(data.data || []);
      setTotalPages(data.pagination?.pages || 1);
      setTotal(data.pagination?.total || 0);
    } catch (error) {
      console.error("Fetch categories error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [page, statusFilter, homeFilter]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Deactivate category "${name}"?`)) return;
    try {
      await API.delete(`/categories/${id}`);
      fetchCategories();
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to deactivate category");
    }
  };

  const clearFilters = () => {
    setStatusFilter("all");
    setHomeFilter("all");
    setPage(1);
  };

  const activeFiltersCount = [
    statusFilter !== "all",
    homeFilter !== "all",
  ].filter(Boolean).length;

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Categories</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage product categories ({total} total)
          </p>
        </div>

        <Link
          href="/admin/categories/add"
          className="px-4 py-2.5 bg-primary text-primary-foreground rounded-lg 
                     hover:bg-primary/90 transition flex items-center gap-2 font-medium"
        >
          <Plus className="h-4 w-4" />
          Add Category
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-xl shadow-sm p-4 space-y-4">
        <div className="flex justify-between">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="sm:hidden px-4 py-2.5 rounded-lg border bg-background 
                       hover:bg-muted transition flex items-center gap-2"
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

        <div
          className={`grid sm:grid-cols-3 gap-3 ${
            showFilters ? "grid" : "hidden sm:grid"
          }`}
        >
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 rounded-lg border bg-background"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <select
            value={homeFilter}
            onChange={(e) => setHomeFilter(e.target.value)}
            className="px-4 py-2.5 rounded-lg border bg-background"
          >
            <option value="all">All Home Visibility</option>
            <option value="home">Shown on Home</option>
            <option value="notHome">Hidden from Home</option>
          </select>

          {activeFiltersCount > 0 && (
            <button
              onClick={clearFilters}
              className="px-4 py-2.5 rounded-lg border border-red-200 bg-red-50 
                         hover:bg-red-100 transition flex items-center gap-2 text-red-700"
            >
              <X className="h-4 w-4" />
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Name</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>Sort Order</TableHead>
                <TableHead>Home</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={6}>
                      <div className="h-16 bg-muted animate-pulse rounded w-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10">
                    No categories found
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((category) => (
                  <TableRow key={category._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {category.image && (
                          <img
                            src={category.image}
                            className="w-10 h-10 rounded object-cover"
                          />
                        )}
                        <div>
                          <div className="font-medium">{category.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {category.slug}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>{category.productCount ?? "—"}</TableCell>

                    <TableCell>{category.sortOrder}</TableCell>

                    <TableCell>{category.showOnHome ? "Yes" : "No"}</TableCell>

                    <TableCell>
                      {category.isActive ? (
                        <span className="px-2 py-1 rounded-full text-xs bg-primary text-primary-foreground">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded-full text-xs bg-gray-200 text-gray-700">
                          Inactive
                        </span>
                      )}
                    </TableCell>

                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/admin/categories/edit/${category._id}`}
                          className="p-2 bg-primary text-primary-foreground rounded-lg"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Link>

                        <button
                          onClick={() =>
                            handleDelete(category._id, category.name)
                          }
                          className="p-2 text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
