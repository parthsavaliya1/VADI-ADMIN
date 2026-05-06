"use client";

import { useEffect, useState } from "react";
import { Search, Eye, X, Filter, Phone, Mail } from "lucide-react";
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

type User = {
  _id: string;
  name?: string;
  phone: string;
  email?: string;
  profileImage?: string;
  isPhoneVerified: boolean;
  createdAt: string;
  role: string;
};

export default function UsersClient() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params: any = {
        page: page.toString(),
        limit: "10",
        search: search || undefined,
      };

      const { data } = await API.get("/api/admin/users", { params });

      setUsers(data.data || []);
      setTotalPages(data.pagination?.pages || 1);
      setTotal(data.pagination?.total || 0);
    } catch (error) {
      console.error("Fetch users error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchUsers();
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchUsers();
  }, [page]);

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Users</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage all users ({total} total)
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-card rounded-xl shadow-sm border p-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, phone, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl shadow-sm border overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : users.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">No users found</p>
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
                  Email
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider">
                  Status
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider">
                  Role
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider">
                  Joined
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-right">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow
                  key={user._id}
                  className="border-b hover:bg-muted/50 transition"
                >
                  <TableCell className="text-sm font-medium">
                    <div className="flex items-center gap-2">
                      {user.profileImage && (
                        <img
                          src={user.profileImage}
                          alt={user.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      )}
                      {user.name || "Unnamed"}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                      {user.phone}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {user.email ? (
                      <div className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                        {user.email}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                        user.isPhoneVerified
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {user.isPhoneVerified ? "Verified" : "Pending"}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm">
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                        user.role === "admin"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {user.role?.toUpperCase() || "USER"}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      href={`/admin/users/${user._id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/10 rounded-lg transition"
                    >
                      <Eye className="h-4 w-4" />
                      View
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-lg border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Previous
          </button>

          <div className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </div>

          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 rounded-lg border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
