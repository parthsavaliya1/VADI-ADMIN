"use client";

import { useEffect, useState } from "react";
import {
  Search,
  Eye,
  X,
  Filter,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
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

type Payment = {
  _id: string;
  order: {
    _id: string;
    orderNumber: string;
    status: string;
    grandTotal: number;
  };
  user: {
    _id: string;
    name?: string;
    email?: string;
    phone?: string;
  };
  amount: number;
  currency: string;
  method: string;
  status: string;
  isCod: boolean;
  createdAt: string;
};

const paymentMethods = ["cod", "upi", "card", "wallet"];
const paymentStatuses = [
  "initiated",
  "pending",
  "success",
  "failed",
  "cancelled",
  "refunded",
  "partial_refund",
];

export default function PaymentsClient() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [search, setSearch] = useState("");
  const [methodFilter, setMethodFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const params: any = {
        page: page.toString(),
        limit: "10",
        isAdmin: "true",
      };

      if (methodFilter && methodFilter !== "all") params.method = methodFilter;
      if (statusFilter && statusFilter !== "all") params.status = statusFilter;

      const { data } = await API.get("/payments", { params });

      setPayments(data.data || []);
      setTotalPages(data.pagination?.pages || 1);
      setTotal(data.pagination?.total || 0);
    } catch (error) {
      console.error("Fetch payments error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [page, methodFilter, statusFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "initiated":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-gray-100 text-gray-800";
      case "refunded":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case "cod":
        return "💵";
      case "upi":
        return "📱";
      case "card":
        return "💳";
      case "wallet":
        return "👛";
      default:
        return "💰";
    }
  };

  const clearFilters = () => {
    setMethodFilter("all");
    setStatusFilter("all");
    setPage(1);
  };

  const activeFiltersCount = [
    methodFilter !== "all",
    statusFilter !== "all",
  ].filter(Boolean).length;

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Payments</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage all payments ({total} total)
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-xl shadow-sm border p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by Order Number or Customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="ml-4 p-2 hover:bg-muted rounded-lg transition flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            {activeFiltersCount > 0 && (
              <span className="bg-primary text-primary-foreground text-xs rounded-full px-2 py-0.5">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
            <div>
              <label className="text-sm font-medium block mb-2">
                Payment Method
              </label>
              <select
                value={methodFilter}
                onChange={(e) => {
                  setMethodFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 rounded-lg border bg-background text-sm"
              >
                <option value="all">All Methods</option>
                {paymentMethods.map((method) => (
                  <option key={method} value={method}>
                    {method.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium block mb-2">
                Payment Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 rounded-lg border bg-background text-sm"
              >
                <option value="all">All Statuses</option>
                {paymentStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {activeFiltersCount > 0 && (
              <button
                onClick={clearFilters}
                className="md:col-span-2 px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition flex items-center justify-center gap-2"
              >
                <X className="h-4 w-4" />
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl shadow-sm border overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : payments.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">No payments found</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-b bg-muted/50">
                <TableHead className="text-xs font-semibold uppercase tracking-wider">
                  Order
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider">
                  Customer
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-right">
                  Amount
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider">
                  Method
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider">
                  Status
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider">
                  Date
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-right">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow
                  key={payment._id}
                  className="border-b hover:bg-muted/50 transition"
                >
                  <TableCell className="text-sm font-medium">
                    {payment.order?.orderNumber || "N/A"}
                  </TableCell>
                  <TableCell className="text-sm">
                    <div>
                      <p className="font-medium">
                        {payment.user?.name || "Unknown"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {payment.user?.phone}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm font-semibold text-right">
                    ₹{payment.amount?.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-sm">
                    <span className="inline-flex items-center gap-1.5">
                      {getMethodIcon(payment.method)}
                      {payment.method.toUpperCase()}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}
                    >
                      {payment.status === "success" && (
                        <CheckCircle className="h-3.5 w-3.5" />
                      )}
                      {payment.status === "pending" && (
                        <Clock className="h-3.5 w-3.5" />
                      )}
                      {payment.status === "failed" && (
                        <AlertCircle className="h-3.5 w-3.5" />
                      )}
                      {payment.status.charAt(0).toUpperCase() +
                        payment.status.slice(1)}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(payment.createdAt).toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      href={`/admin/payments/${payment._id}`}
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
