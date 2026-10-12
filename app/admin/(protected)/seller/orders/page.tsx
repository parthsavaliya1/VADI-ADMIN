"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import API from "@/lib/api";

type Staff = { _id: string; name?: string; phone?: string };
type Order = {
  _id: string;
  orderNumber: string;
  status: string;
  grandTotal: number;
  createdAt: string;
  user?: { name?: string; phone?: string };
  assignedDriver?: { _id: string; name?: string; phone?: string } | null;
  items: { productName: string; quantity: number; seller?: { sellerId?: string } }[];
};

const NEXT_STATUS = ["confirmed", "packed", "shipped", "out_for_delivery", "cancelled"];

export default function SellerOrdersPage() {
  const { data: session } = useSession();
  const sellerId = session?.user?.role === "seller" ? session.user.id : "";
  const [orders, setOrders] = useState<Order[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [pickedStaff, setPickedStaff] = useState<Record<string, string>>({});

  const load = () => {
    if (!sellerId) return;
    API.get("/sellers/me/orders", { params: { sellerId } })
      .then(({ data }) => setOrders(data?.data || []))
      .catch(() => setOrders([]));
  };

  useEffect(() => {
    if (!sellerId) return;
    load();
    API.get("/sellers/me/staff", { params: { sellerId } })
      .then(({ data }) => setStaff(data?.data || []))
      .catch(() => setStaff([]));
  }, [sellerId]);

  const updateStatus = async (id: string, status: string) => {
    try {
      await API.put(`/sellers/me/orders/${id}/status`, { sellerId, status });
      load();
    } catch (error: any) {
      alert(error.response?.data?.message || "Could not update order");
    }
  };

  const assignStaff = async (id: string) => {
    const driverId = pickedStaff[id];
    if (!driverId) return alert("Choose a staff member");
    try {
      await API.put(`/sellers/me/orders/${id}/assign`, { sellerId, driverId });
      load();
    } catch (error: any) {
      alert(error.response?.data?.message || "Could not assign staff");
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">My orders</h1>
        <p className="text-sm text-muted-foreground mt-1">
          These are orders that include your products. Assign staff, then mark the order out for delivery. Staff confirm delivery with the customer code.
        </p>
      </div>
      {orders.length === 0 ? (
        <p className="text-sm text-muted-foreground">No orders yet.</p>
      ) : (
        orders.map((order) => {
          const closed = ["delivered", "cancelled", "returned"].includes(order.status);
          return (
            <div key={order._id} className="space-y-3 rounded-xl border border-[#E5E7EB] bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium">#{order.orderNumber}</p>
                  <p className="text-xs text-muted-foreground">
                    {order.user?.name || "Customer"} · {order.user?.phone || ""} · ₹{Number(order.grandTotal).toLocaleString("en-IN")}
                  </p>
                </div>
                <span className="rounded-full bg-[#E8F5E9] px-2 py-1 text-xs font-medium capitalize text-[#2E7D32]">
                  {order.status.replace(/_/g, " ")}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {order.items.map((item) => `${item.productName} × ${item.quantity}`).join(", ")}
              </p>
              <p className="text-xs text-muted-foreground">
                Staff: {order.assignedDriver?.name || order.assignedDriver?.phone || "Not assigned"}
              </p>
              {closed ? null : (
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex gap-2 flex-1">
                    <select
                      className="flex-1 px-3 py-2 rounded-lg border text-sm"
                      value={pickedStaff[order._id] || order.assignedDriver?._id || ""}
                      onChange={(e) => setPickedStaff((prev) => ({ ...prev, [order._id]: e.target.value }))}
                    >
                      <option value="">Assign staff</option>
                      {staff.map((person) => (
                        <option key={person._id} value={person._id}>
                          {person.name || person.phone}
                        </option>
                      ))}
                    </select>
                    <button type="button" onClick={() => assignStaff(order._id)} className="px-3 py-2 rounded-lg border text-sm">
                      Assign
                    </button>
                  </div>
                  <select
                    className="px-3 py-2 rounded-lg border text-sm"
                    defaultValue=""
                    onChange={(e) => {
                      if (e.target.value) updateStatus(order._id, e.target.value);
                      e.target.value = "";
                    }}
                  >
                    <option value="">Update status</option>
                    {NEXT_STATUS.map((status) => (
                      <option key={status} value={status}>{status.replace(/_/g, " ")}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
