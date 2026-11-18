"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import API from "@/lib/api";
import ReturnFulfillmentPanel from "./ReturnFulfillmentPanel";

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

  const [statusFilter, setStatusFilter] = useState('active');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [scopedOrderId, setScopedOrderId] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const requestVersion = useRef(0);
  const busyRef = useRef(false);
  const load = useCallback(async (quiet = false) => {
    if (quiet && busyRef.current) return;
    const version = ++requestVersion.current;
    if (!quiet) setRefreshing(true);
    const orderId = typeof window === 'undefined' ? '' : new URLSearchParams(window.location.search).get('orderId') || '';
    setScopedOrderId(orderId);
    try {
      const { data } = await API.get('/api/admin/returns', { params: { status: orderId ? 'all' : statusFilter, orderId: orderId || undefined, page, limit: 20 } });
      if (data.success !== true || !Array.isArray(data.data)) throw new Error('Invalid returns response');
      if (version !== requestVersion.current) return;
      setOrders(data.data); setPages(data.pagination?.pages || 1); setTotal(data.pagination?.total ?? data.data.length); setError('');
    } catch (failure: unknown) {
      if (version === requestVersion.current) setError((failure as { response?: { data?: { message?: string } } }).response?.data?.message || 'Could not load returns. Please retry.');
    } finally { if (version === requestVersion.current) { setRefreshing(false); setLoading(false); } }
  }, [statusFilter, page]);
  useEffect(() => {
    void load();
    const refresh = () => { if (!document.hidden) void load(true); };
    const timer = setInterval(refresh, 10000);
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refresh);
    return () => { requestVersion.current++; clearInterval(timer); window.removeEventListener('focus', refresh); document.removeEventListener('visibilitychange', refresh); };
  }, [load]);

  const resolve = async (order: ReturnOrder, action: "approve" | "reject") => {
    const amount = order.refundPreview?.amount || 0;
    const shouldRestock = order.returnRequest?.refundOperation?.restock ?? false;
    if (!confirm(action === "approve" ? `Approve this return? ${amount > 0 ? `₹${amount.toFixed(2)} will be refunded to ${order.refundPreview?.destination === "original" ? "the original payment method" : "the customer’s VADI wallet"}.` : "No refund will be issued."}${shouldRestock ? " Returned goods will be added back to stock." : " Stock will stay unchanged."}` : "Reject this request without issuing a refund?")) return;
    if (busyRef.current) return;
    busyRef.current = true; requestVersion.current++;
    setBusyId(order._id);
    try {
      const { data } = await API.put(`/api/admin/returns/${order._id}`, { action, adminNote: notes[order._id] || "", restock: shouldRestock });
      alert(data.message || "Updated"); await load();
    } catch (error: unknown) {
      alert((error as { response?: { data?: { message?: string } } }).response?.data?.message || "Could not update return");
    } finally { busyRef.current = false; setBusyId(""); }
  };

  if (loading) return <Loader2 className="h-6 w-6 animate-spin" />;
  return <div className="space-y-5">
    <div><h1 className="text-2xl font-bold">Returns</h1><p className="mt-2 text-sm text-muted-foreground">Approved online-payment refunds go back to the original payment method. Collected COD and VADI balance payments are credited to the customer’s VADI wallet. An online refund failure never switches automatically to wallet credit. Replacements do not receive a refund.</p><p className="mt-1 text-sm text-muted-foreground">Only the product amount paid after discounts is refundable. Delivery charges are never refunded, even when all products are returned. Restock only after receiving goods suitable for resale.</p></div>
    <div className="flex flex-wrap items-center gap-3">
      {!scopedOrderId && <label className="text-sm font-medium">Show <select aria-label="Return status" value={statusFilter} onChange={event => { setStatusFilter(event.target.value); setPage(1); }} className="ml-2 rounded-lg border bg-background p-2"><option value="active">Active requests / pickups / replacements</option><option value="pending">Pending</option><option value="processing">Processing</option><option value="approved">Approved</option><option value="rejected">Rejected</option><option value="all">All returns</option></select></label>}
      <p className="text-sm text-muted-foreground">{total} request(s) · Updates every 10 seconds</p>
      {scopedOrderId && <a href="/admin/returns" className="text-sm text-primary underline">Show all return requests</a>}
    </div>
    <button onClick={() => void load()} disabled={!!busyId || refreshing} className="rounded-lg border px-4 py-2 text-sm disabled:opacity-50">Refresh returns</button>
    {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
    {!orders.length && !error && <p className="rounded-xl border p-6 text-muted-foreground">No return requests found for this view.</p>}
    {orders.map((order) => <section key={order._id} className="rounded-xl border bg-card p-5 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3"><div><Link href={`/admin/orders/${order._id}`} className="font-semibold text-primary">{order.orderNumber}</Link><p className="text-sm text-muted-foreground">{order.user?.name || "Customer"} · {order.user?.phone || ""}</p><p className="text-sm text-muted-foreground">Payment: {order.payment?.method?.toUpperCase()} · {order.payment?.status}</p></div><span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold capitalize">{order.returnRequest?.status}</span></div>
      <div><h2 className="text-sm font-semibold">Customer’s reason</h2><p className="text-sm">{order.returnRequest?.reason}</p></div>
      <div className="space-y-1 text-sm">{order.returnRequest?.items?.length ? order.returnRequest.items.map((item, i) => <p key={i}>{item.productName} · Qty {item.quantity} · <span className="capitalize">{item.action}</span></p>) : <p>All items (legacy full-order request)</p>}</div>
      {["pending", "processing"].includes(order.returnRequest?.status || "") ? <>
        {order.refundPreview?.error ? <p role="alert" className="text-sm text-red-700">{order.refundPreview.error}</p> : <div className="rounded-lg bg-muted p-3 text-sm"><p className="font-semibold">Refund on approval: ₹{(order.refundPreview?.amount || 0).toFixed(2)}</p><p>{order.refundPreview?.destination === "wallet" ? "Destination: VADI wallet" : order.refundPreview?.destination === "original" ? "Destination: original payment method" : order.returnRequest?.items?.length && order.returnRequest.items.every(item => item.action === 'replace') ? 'Replacement requested — no money refund. Arrange replacement after approval.' : 'No refund due: payment is not recorded as collected.'}</p></div>}
        {order.returnRequest?.status === "processing" && <p role="status" className="text-sm text-amber-700">Original refund is awaiting confirmation. Resume checks the same refund reference; it does not start a separate refund. {order.returnRequest.refundOperation?.error}</p>}
        <label className="block text-sm font-medium">Admin note<textarea value={notes[order._id] || ""} onChange={(e) => setNotes((current) => ({ ...current, [order._id]: e.target.value }))} maxLength={1000} disabled={!!busyId || order.returnRequest?.status === "processing"} placeholder="Inspection result or rejection reason" className="mt-2 block min-h-20 w-full rounded-lg border bg-background p-3" /></label>
        <p className="text-xs text-muted-foreground">After approval, assign pickup below. Receive and inspect goods before restocking or packing a replacement.</p>
        <div className="flex flex-wrap gap-2"><button disabled={!!busyId || !!order.refundPreview?.error} onClick={() => void resolve(order, "approve")} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50">{busyId === order._id ? "Processing…" : order.returnRequest?.status === "processing" ? "Resume refund / check status" : "Approve return"}</button><button disabled={!!busyId || order.returnRequest?.status === "processing"} onClick={() => void resolve(order, "reject")} className="rounded-lg border px-4 py-2 text-sm disabled:opacity-50">Reject</button></div>
      </> : <div className="rounded-lg bg-muted p-3 text-sm"><p>Refund: ₹{(order.returnRequest?.refundAmount || 0).toFixed(2)} · {order.returnRequest?.refundedTo === "wallet" ? "VADI wallet" : order.returnRequest?.refundedTo === "original" ? "Original payment" : "No refund"}</p>{order.returnRequest?.adminNote && <p>Admin note: {order.returnRequest.adminNote}</p>}<p>Restocked: {order.returnRequest?.restocked ? "Yes" : "No"}</p>{order.returnRequest?.status === "approved" && order.returnRequest.items?.some((item) => item.action === "replace") && <p>Replacement approved. Arrange pickup, inspection and delivery below.</p>}</div>}
      {order.returnRequest?.status === "approved" && <ReturnFulfillmentPanel orderId={order._id} />}
    </section>)}
    {pages > 1 && <div className="flex items-center justify-between gap-3"><button disabled={page <= 1 || refreshing} onClick={() => setPage(value => value - 1)} className="rounded-lg border px-3 py-2 text-sm disabled:opacity-50">Previous</button><span className="text-sm">Page {page} of {pages}</span><button disabled={page >= pages || refreshing} onClick={() => setPage(value => value + 1)} className="rounded-lg border px-3 py-2 text-sm disabled:opacity-50">Next</button></div>}
  </div>;
}
