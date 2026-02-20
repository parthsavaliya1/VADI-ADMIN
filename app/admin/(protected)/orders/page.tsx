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

export default function OrdersClient() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data } = await API.get("/orders", {
        params: {
          page,
          limit: 10,
          status: statusFilter || undefined,
        },
      });

      setOrders(data.data || []);
      setTotalPages(data.pagination?.pages || 1);
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
    } catch (error) {
      alert("Failed to update status");
    }
  };

  const cancelOrder = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this order?")) return;

    try {
      await API.post(`/orders/${id}/cancel`);
      fetchOrders();
    } catch (error) {
      alert("Failed to cancel order");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Orders</h1>
        <p className="text-muted-foreground">Manage customer orders</p>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-xl shadow-sm p-4 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by Order Number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border bg-background"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 rounded-lg border bg-background"
        >
          <option value="">All Status</option>
          <option value="placed">Placed</option>
          <option value="confirmed">Confirmed</option>
          <option value="packed">Packed</option>
          <option value="out_for_delivery">Out for Delivery</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-card rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="p-4 text-left">Order</th>
              <th className="p-4 text-left">Items</th>
              <th className="p-4 text-left">Amount</th>
              <th className="p-4 text-left">Payment</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="p-6 text-center">
                  Loading...
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center">
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
                    <div className="text-xs text-muted-foreground">
                      {new Date(order.createdAt).toLocaleString()}
                    </div>
                  </td>

                  <td className="p-4">
                    {order.totalItems} items ({order.totalQuantity} qty)
                  </td>

                  <td className="p-4 font-semibold text-green-600">
                    ₹{order.grandTotal.toLocaleString()}
                  </td>

                  <td className="p-4">
                    <div className="text-sm capitalize">
                      {order.payment.method}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {order.payment.status}
                    </div>
                  </td>

                  <td className="p-4">
                    <span className="px-3 py-1 text-xs rounded-full bg-primary text-primary-foreground">
                      {order.status}
                    </span>
                  </td>

                  <td className="p-4 text-right space-x-2">
                    <Link
                      href={`/admin/orders/${order._id}`}
                      className="p-2 bg-primary text-white rounded-lg"
                    >
                      <Eye size={16} />
                    </Link>

                    {order.status === "placed" && (
                      <button
                        onClick={() => updateStatus(order._id, "confirmed")}
                        className="p-2 bg-blue-500 text-white rounded-lg"
                      >
                        <Package size={16} />
                      </button>
                    )}

                    {order.status === "confirmed" && (
                      <button
                        onClick={() => updateStatus(order._id, "packed")}
                        className="p-2 bg-orange-500 text-white rounded-lg"
                      >
                        <Truck size={16} />
                      </button>
                    )}

                    {order.status !== "delivered" &&
                      order.status !== "cancelled" && (
                        <button
                          onClick={() => cancelOrder(order._id)}
                          className="p-2 bg-red-500 text-white rounded-lg"
                        >
                          <X size={16} />
                        </button>
                      )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex justify-between items-center p-4 border-t">
          <button
            disabled={page === 1}
            onClick={() => setPage((prev) => prev - 1)}
            className="px-3 py-1 border rounded-lg"
          >
            Previous
          </button>

          <span>
            Page {page} of {totalPages}
          </span>

          <button
            disabled={page === totalPages}
            onClick={() => setPage((prev) => prev + 1)}
            className="px-3 py-1 border rounded-lg"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
