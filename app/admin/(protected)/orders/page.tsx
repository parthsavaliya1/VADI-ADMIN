"use client";

import { useEffect, useState } from "react";
import { Search, Eye, Package, X, Truck, CheckCircle } from "lucide-react";
import API from "@/lib/api";
import Link from "next/link";

type Order = {
  _id: string;
  orderNumber: string;
  user: {
    _id: string;
    name?: string;
    email?: string;
    phone?: string;
  };
  totalItems: number;
  totalQuantity: number;
  grandTotal: number;
  status: string;
  payment: {
    method: string;
    status: string;
    isCod: boolean;
  };
  createdAt: string;
};

const STATUS_STYLES: Record<string, string> = {
  placed: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  packed: "bg-orange-100 text-orange-700",
  shipped: "bg-cyan-100 text-cyan-700",
  out_for_delivery: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function OrdersClient() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data } = await API.get("/orders", {
        params: {
          page,
          limit: 10,
          status: statusFilter || undefined,
          isAdmin: "true",
        },
      });
      setOrders(data.data || []);
      setTotalPages(data.pagination?.pages || 1);
      setTotal(data.pagination?.total || 0);
    } catch (error) {
      console.error("Fetch orders error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, statusFilter]);

  const updateStatus = async (id: string, status: string) => {
    try {
      await API.put(`/orders/${id}/status`, { status });
      fetchOrders();
    } catch {
      alert("Failed to update status");
    }
  };

  const cancelOrder = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this order?")) return;
    try {
      await API.post(`/orders/${id}/cancel`);
      fetchOrders();
    } catch {
      alert("Failed to cancel order");
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Orders</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage customer orders ({total} total)
        </p>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-xl shadow-sm p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by Order Number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border bg-background text-sm"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2 rounded-lg border bg-background text-sm"
        >
          <option value="">All Status</option>
          <option value="placed">Placed</option>
          <option value="confirmed">Confirmed</option>
          <option value="packed">Packed</option>
          <option value="shipped">Shipped</option>
          <option value="out_for_delivery">Out for Delivery</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* ── DESKTOP TABLE ── */}
      <div className="hidden md:block bg-card rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="p-4 text-left font-semibold">Order</th>
              <th className="p-4 text-left font-semibold">Items</th>
              <th className="p-4 text-left font-semibold">Amount</th>
              <th className="p-4 text-left font-semibold">Payment</th>
              <th className="p-4 text-left font-semibold">Status</th>
              <th className="p-4 text-left font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={6}
                  className="p-8 text-center text-muted-foreground"
                >
                  Loading...
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="p-8 text-center text-muted-foreground"
                >
                  No orders found
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr
                  key={order._id}
                  className="border-t hover:bg-muted/30 transition"
                >
                  <td className="p-4">
                    <div className="font-semibold">#{order.orderNumber}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {new Date(order.createdAt).toLocaleString()}
                    </div>
                  </td>
                  <td className="p-4 text-muted-foreground">
                    {order.totalItems} items · {order.totalQuantity} qty
                  </td>
                  <td className="p-4 font-semibold text-green-600">
                    ₹{order.grandTotal.toLocaleString()}
                  </td>
                  <td className="p-4">
                    <div className="capitalize font-medium">
                      {order.payment.method}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {order.payment.status}
                    </div>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-1 text-xs font-medium rounded-full capitalize ${
                        STATUS_STYLES[order.status] ??
                        "bg-muted text-muted-foreground"
                      }`}
                    >
                      {order.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="p-4">
                    <OrderActions
                      order={order}
                      onUpdateStatus={updateStatus}
                      onCancel={cancelOrder}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <Pagination page={page} totalPages={totalPages} setPage={setPage} />
      </div>

      {/* ── MOBILE CARDS ── */}
      <div className="flex flex-col gap-4 md:hidden">
        {loading ? (
          <div className="text-center py-10 text-muted-foreground">
            Loading...
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            No orders found
          </div>
        ) : (
          orders.map((order) => (
            <div
              key={order._id}
              className="bg-card rounded-xl shadow-sm p-4 space-y-3"
            >
              {/* Top row */}
              <div className="flex justify-between items-start gap-2">
                <div>
                  <div className="font-semibold">#{order.orderNumber}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {new Date(order.createdAt).toLocaleString()}
                  </div>
                </div>
                <span
                  className={`px-2.5 py-1 text-xs font-medium rounded-full capitalize whitespace-nowrap ${
                    STATUS_STYLES[order.status] ??
                    "bg-muted text-muted-foreground"
                  }`}
                >
                  {order.status.replace(/_/g, " ")}
                </span>
              </div>

              {/* Details row */}
              <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
                <span>
                  {order.totalItems} items · {order.totalQuantity} qty
                </span>
                <span className="font-semibold text-green-600">
                  ₹{order.grandTotal.toLocaleString()}
                </span>
                <span className="capitalize">
                  {order.payment.method} · {order.payment.status}
                </span>
              </div>

              {/* Actions */}
              <div className="pt-1 border-t">
                <OrderActions
                  order={order}
                  onUpdateStatus={updateStatus}
                  onCancel={cancelOrder}
                  isMobile
                />
              </div>
            </div>
          ))
        )}

        {/* Mobile Pagination */}
        <Pagination page={page} totalPages={totalPages} setPage={setPage} />
      </div>
    </div>
  );
}

/* ── Action Buttons Component ── */
function OrderActions({
  order,
  onUpdateStatus,
  onCancel,
  isMobile = false,
}: {
  order: Order;
  onUpdateStatus: (id: string, status: string) => void;
  onCancel: (id: string) => void;
  isMobile?: boolean;
}) {
  const btnBase = isMobile
    ? "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition"
    : "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition";

  return (
    <div className={`flex flex-wrap gap-2 ${isMobile ? "mt-2" : ""}`}>
      {/* View */}
      <Link
        href={`/admin/orders/${order._id}`}
        className={`${btnBase} bg-primary/10 text-primary hover:bg-primary hover:text-white`}
      >
        <Eye size={13} />
        View
      </Link>

      {/* Confirm */}
      {order.status === "placed" && (
        <button
          onClick={() => onUpdateStatus(order._id, "confirmed")}
          className={`${btnBase} bg-blue-50 text-blue-600 hover:bg-blue-500 hover:text-white`}
        >
          <Package size={13} />
          Confirm
        </button>
      )}

      {/* Pack */}
      {order.status === "confirmed" && (
        <button
          onClick={() => onUpdateStatus(order._id, "packed")}
          className={`${btnBase} bg-orange-50 text-orange-600 hover:bg-orange-500 hover:text-white`}
        >
          <Truck size={13} />
          Pack
        </button>
      )}

      {/* Ship */}
      {order.status === "packed" && (
        <button
          onClick={() => onUpdateStatus(order._id, "shipped")}
          className={`${btnBase} bg-cyan-50 text-cyan-700 hover:bg-cyan-600 hover:text-white`}
        >
          <Truck size={13} />
          Shipped
        </button>
      )}

      {/* Out for delivery */}
      {order.status === "shipped" && (
        <button
          onClick={() => onUpdateStatus(order._id, "out_for_delivery")}
          className={`${btnBase} bg-purple-50 text-purple-700 hover:bg-purple-600 hover:text-white`}
        >
          <Truck size={13} />
          Out for delivery
        </button>
      )}

      {/* Mark Delivered — only when not waiting on handover (e.g. skipped OFD) */}
      {(order.status === "shipped" || order.status === "packed") && (
        <button
          onClick={() => onUpdateStatus(order._id, "delivered")}
          className={`${btnBase} bg-green-50 text-green-600 hover:bg-green-500 hover:text-white`}
        >
          <CheckCircle size={13} />
          Deliver
        </button>
      )}

      {/* Cancel */}
      {order.status !== "delivered" && order.status !== "cancelled" && (
        <button
          onClick={() => onCancel(order._id)}
          className={`${btnBase} bg-red-50 text-red-500 hover:bg-red-500 hover:text-white`}
        >
          <X size={13} />
          Cancel
        </button>
      )}
    </div>
  );
}

/* ── Pagination Component ── */
function Pagination({
  page,
  totalPages,
  setPage,
}: {
  page: number;
  totalPages: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
}) {
  return (
    <div className="flex justify-between items-center p-4 border-t text-sm">
      <button
        disabled={page === 1}
        onClick={() => setPage((p) => p - 1)}
        className="px-3 py-1.5 border rounded-lg disabled:opacity-40 hover:bg-muted transition"
      >
        Previous
      </button>
      <span className="text-muted-foreground">
        Page {page} of {totalPages}
      </span>
      <button
        disabled={page === totalPages}
        onClick={() => setPage((p) => p + 1)}
        className="px-3 py-1.5 border rounded-lg disabled:opacity-40 hover:bg-muted transition"
      >
        Next
      </button>
    </div>
  );
}
