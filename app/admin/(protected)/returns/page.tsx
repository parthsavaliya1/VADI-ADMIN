"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import API from "@/lib/api";

type ReturnOrder = {
  _id: string;
  orderNumber: string;
  grandTotal: number;
  status: string;
  user?: { name?: string; phone?: string };
  payment?: { method?: string; status?: string };
  returnRequest?: {
    status?: string;
    reason?: string;
    refundAmount?: number;
    refundedTo?: string;
  };
};

export default function ReturnsPage() {
  const [orders, setOrders] = useState<ReturnOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");

  const load = async () => {
    const { data } = await API.get("/api/admin/returns");
    setOrders(data.data || []);
  };

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const resolve = async (id: string, action: "approve" | "reject") => {
    setBusyId(id);
    try {
      const { data } = await API.put(`/api/admin/returns/${id}`, { action });
      alert(data.message || "Updated");
      await load();
    } catch (error: any) {
      alert(error?.response?.data?.message || "Could not update return");
    } finally {
      setBusyId("");
    }
  };

  if (loading) return <Loader2 className="h-6 w-6 animate-spin" />;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Returns</h1>
        <p className="text-sm text-muted-foreground">
          Approving a paid online order refunds the amount to the customer wallet and restores stock.
        </p>
      </div>
      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-left">
            <tr>
              <th className="p-3">Order</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Reason</th>
              <th className="p-3">Status</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id} className="border-t">
                <td className="p-3">
                  <div className="font-semibold">{order.orderNumber}</div>
                  <div>₹{order.grandTotal}</div>
                </td>
                <td className="p-3">{order.user?.name || "Customer"}<div>{order.user?.phone}</div></td>
                <td className="p-3 max-w-xs">{order.returnRequest?.reason}</td>
                <td className="p-3">{order.returnRequest?.status}</td>
                <td className="p-3 text-right">
                  {order.returnRequest?.status === "pending" && (
                    <div className="flex justify-end gap-2">
                      <button disabled={busyId === order._id} className="rounded-lg bg-primary px-3 py-1.5 text-primary-foreground" onClick={() => resolve(order._id, "approve")}>
                        Approve
                      </button>
                      <button disabled={busyId === order._id} className="rounded-lg border px-3 py-1.5" onClick={() => resolve(order._id, "reject")}>
                        Reject
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr><td className="p-6 text-muted-foreground" colSpan={5}>No return requests yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
