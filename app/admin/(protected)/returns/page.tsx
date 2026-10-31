"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import API from "@/lib/api";

type ReturnOrder = {
  _id: string; orderNumber: string; grandTotal: number; status: string;
  user?: { name?: string; phone?: string };
  payment?: { method?: string; status?: string };
  returnRequest?: { status?: string; reason?: string; adminNote?: string; refundAmount?: number; refundedTo?: string; restocked?: boolean; refundStatus?: string; refundOperation?: { error?: string; gatewayRefundId?: string; restock?: boolean; };
    items?: { productName: string; quantity: number; action: string }[] };
  refundPreview?: { amount?: number; destination?: string; fullRefund?: boolean; error?: string };
};

export default function ReturnsPage() {
  const [orders, setOrders] = useState<ReturnOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [restock, setRestock] = useState<Record<string, boolean>>({});

  const load = async () => {
    try {
      const { data } = await API.get("/api/admin/returns");
      setOrders(data.data || []); setError("");
    } catch { setError("Could not load returns. Please retry."); }
  };
  useEffect(() => { void load().finally(() => setLoading(false)); }, []);

  const resolve = async (order: ReturnOrder, action: "approve" | "reject") => {
    const amount = order.refundPreview?.amount || 0;
    const shouldRestock = restock[order._id] ?? order.returnRequest?.refundOperation?.restock ?? false;
    if (!confirm(action === "approve" ? `Approve this return? ${amount > 0 ? `₹${amount.toFixed(2)} will be refunded to ${order.refundPreview?.destination === "original" ? "the original payment method" : "the customer’s VADI wallet"}.` : "No refund will be issued."}${shouldRestock ? " Returned goods will be added back to stock." : " Stock will stay unchanged."}` : "Reject this request without issuing a refund?")) return;
    setBusyId(order._id);
    try {
      const { data } = await API.put(`/api/admin/returns/${order._id}`, { action, adminNote: notes[order._id] || "", restock: shouldRestock });
      alert(data.message || "Updated"); await load();
    } catch (error: unknown) {
      alert((error as { response?: { data?: { message?: string } } }).response?.data?.message || "Could not update return");
    } finally { setBusyId(""); }
  };

  if (loading) return <Loader2 className="h-6 w-6 animate-spin" />;
  return <div className="space-y-5">
    <div><h1 className="text-2xl font-bold">Returns</h1><p className="mt-2 text-sm text-muted-foreground">Approved online-payment refunds go back to the original payment method. Collected COD and VADI balance payments are credited to the customer’s VADI wallet. An online refund failure never switches automatically to wallet credit. Replacements do not receive a refund.</p><p className="mt-1 text-sm text-muted-foreground">Only the product amount paid after discounts is refundable. Delivery charges are never refunded, even when all products are returned. Restock only after receiving goods suitable for resale.</p></div>
    <button onClick={() => void load()} disabled={!!busyId} className="rounded-lg border px-4 py-2 text-sm disabled:opacity-50">Refresh returns</button>
    {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
    {!orders.length && !error && <p className="rounded-xl border p-6 text-muted-foreground">No return requests yet.</p>}
    {orders.map((order) => <section key={order._id} className="rounded-xl border bg-card p-5 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3"><div><Link href={`/admin/orders/${order._id}`} className="font-semibold text-primary">{order.orderNumber}</Link><p className="text-sm text-muted-foreground">{order.user?.name || "Customer"} · {order.user?.phone || ""}</p><p className="text-sm text-muted-foreground">Payment: {order.payment?.method?.toUpperCase()} · {order.payment?.status}</p></div><span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold capitalize">{order.returnRequest?.status}</span></div>
      <div><h2 className="text-sm font-semibold">Customer’s reason</h2><p className="text-sm">{order.returnRequest?.reason}</p></div>
      <div className="space-y-1 text-sm">{order.returnRequest?.items?.length ? order.returnRequest.items.map((item, i) => <p key={i}>{item.productName} · Qty {item.quantity} · <span className="capitalize">{item.action}</span></p>) : <p>All items (legacy full-order request)</p>}</div>
      {["pending", "processing"].includes(order.returnRequest?.status || "") ? <>
        {order.refundPreview?.error ? <p role="alert" className="text-sm text-red-700">{order.refundPreview.error}</p> : <div className="rounded-lg bg-muted p-3 text-sm"><p className="font-semibold">Refund on approval: ₹{(order.refundPreview?.amount || 0).toFixed(2)}</p><p>{order.refundPreview?.destination === "wallet" ? "Destination: VADI wallet" : order.refundPreview?.destination === "original" ? "Destination: original payment method" : "No refund due: unpaid order or replacement-only request"}</p></div>}
        {order.returnRequest?.status === "processing" && <p role="status" className="text-sm text-amber-700">Original refund is awaiting confirmation. Resume checks the same refund reference; it does not start a separate refund. {order.returnRequest.refundOperation?.error}</p>}
        <label className="block text-sm font-medium">Admin note<textarea value={notes[order._id] || ""} onChange={(e) => setNotes((current) => ({ ...current, [order._id]: e.target.value }))} maxLength={1000} disabled={!!busyId || order.returnRequest?.status === "processing"} placeholder="Inspection result or rejection reason" className="mt-2 block min-h-20 w-full rounded-lg border bg-background p-3" /></label>
        <label className="flex items-start gap-2 text-sm"><input type="checkbox" checked={restock[order._id] ?? order.returnRequest?.refundOperation?.restock ?? false} disabled={!!busyId || (order.returnRequest?.status === "processing" && !order.returnRequest.refundOperation?.restock)} onChange={(e) => setRestock((current) => ({ ...current, [order._id]: e.target.checked }))} className="mt-1" />Goods have been received and are suitable for resale — add returned quantities back to stock</label>
        <div className="flex flex-wrap gap-2"><button disabled={!!busyId || !!order.refundPreview?.error} onClick={() => void resolve(order, "approve")} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50">{busyId === order._id ? "Processing…" : order.returnRequest?.status === "processing" ? "Resume refund / check status" : "Approve return"}</button><button disabled={!!busyId || order.returnRequest?.status === "processing"} onClick={() => void resolve(order, "reject")} className="rounded-lg border px-4 py-2 text-sm disabled:opacity-50">Reject</button></div>
      </> : <div className="rounded-lg bg-muted p-3 text-sm"><p>Refund: ₹{(order.returnRequest?.refundAmount || 0).toFixed(2)} · {order.returnRequest?.refundedTo === "wallet" ? "VADI wallet" : order.returnRequest?.refundedTo === "original" ? "Original payment" : "No refund"}</p>{order.returnRequest?.adminNote && <p>Admin note: {order.returnRequest.adminNote}</p>}<p>Restocked: {order.returnRequest?.restocked ? "Yes" : "No"}</p>{order.returnRequest?.status === "approved" && order.returnRequest.items?.some((item) => item.action === "replace") && <p>Replacement approved. Arrange fulfilment with the customer; no replacement shipment is created automatically.</p>}</div>}
    </section>)}
  </div>;
}
