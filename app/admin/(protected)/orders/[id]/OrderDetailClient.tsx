"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Loader2, MapPin, Phone } from "lucide-react";
import Link from "next/link";
import DriverPaymentCheck, { type PaymentSummary } from "@/app/driver/deliveries/DriverPaymentCheck";
import API from "@/lib/api";
import { returnStageLabel } from "@/lib/returnStage";
import ReturnFulfillmentPanel from "../../returns/ReturnFulfillmentPanel";
import ReturnRequestPanel, { type ReturnRequestSummary, type ReturnRefundPreview } from "./ReturnRequestPanel";
import DeliveryStaffAssignment, { type DeliveryStaff } from "./DeliveryStaffAssignment";

/* ── Types matching the real API response ── */

type OrderItem = {
  product: {
    _id: string;
    name: string;
    image: string;
  };
  productName: string;
  image: string;
  packSize: number;
  packUnit: string;
  unitPrice: number;
  mrp: number;
  discount: number;
  quantity: number;
  subtotal: number;
  tax?: { gstPercent: number; inclusive: boolean };
  seller?: { sellerId: string; sellerName: string };
};

type ShippingSnapshot = {
  name: string;
  phone: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  address?: string;
  addressLine?: string;
};

type Order = {
  _id: string;
  orderNumber: string;
  user: string; // API returns just the ID string
  items: OrderItem[];
  totalItems: number;
  totalQuantity: number;
  subtotal: number;
  taxAmount: number;
  deliveryFee: number;
  totalDiscount: number;
  grandTotal: number;
  status: string;
  assignedDriver?: DeliveryStaff | string | null;
  deliveryHandoverCode?: string;
  deliveryHandoverVerifiedAt?: string;
  payment: {
    method: string;
    status: string;
    isCod: boolean;
    codCollected?: boolean;
    onlineAttempt?: string | null;
    convertedFromCod?: boolean;
  };
  address: {
    snapshot: ShippingSnapshot;
    addressId: string;
  };
  createdAt: string;
  cancellation?: { state?: string; refundStatus?: string; refundAmount?: number; refundedTo?: string; refundOperation?: { gatewayRefundId?: string } };
  returnRequest?: ReturnRequestSummary;
  returnRefundPreview?: ReturnRefundPreview;
  statusHistory?: { from: string; to: string; reason: string; changedAt: string; codCollected?: boolean }[];
};

/* ── Style maps ── */

const STATUS_STYLES: Record<string, string> = {
  placed: "bg-amber-50 text-amber-700",
  confirmed: "bg-sky-50 text-sky-700",
  packed: "bg-orange-50 text-orange-700",
  out_for_delivery: "bg-violet-50 text-violet-700",
  shipped: "bg-cyan-50 text-cyan-700",
  delivered: "bg-emerald-50 text-emerald-700",
  cancelled: "bg-red-50 text-red-700",
  pending: "bg-amber-50 text-amber-700",
};

const PAYMENT_STATUS_STYLES: Record<string, string> = {
  success: "bg-emerald-50 text-emerald-700",
  paid: "bg-emerald-50 text-emerald-700",
  pending: "bg-amber-50 text-amber-700",
  failed: "bg-red-50 text-red-700",
};

const ORDER_STATUSES = [
  "placed",
  "confirmed",
  "packed",
  "shipped",
  "out_for_delivery",
  "delivered",
  "cancelled",
];

function formatStatus(status?: string) {
  if (!status) return "Unknown";
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/* ── Component ── */

export default function OrderDetailClient({ orderId }: { orderId: string }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [assigningStaff, setAssigningStaff] = useState(false);
  const [handoverInput, setHandoverInput] = useState("");
  const [verifyingHandover, setVerifyingHandover] = useState(false);
  const [reopenStatus, setReopenStatus] = useState("confirmed");
  const [reopenReason, setReopenReason] = useState("");
  const [reopenCod, setReopenCod] = useState("");
  const [reopening, setReopening] = useState(false);

  const handlePaymentChecked = useCallback((summary: PaymentSummary) => {
    setOrder(current => current && current._id === summary.orderId ? { ...current, payment: {
      ...current.payment, method: summary.method, status: summary.status,
      isCod: summary.method === 'cod', codCollected: summary.method === 'cod' && summary.status === 'paid',
      onlineAttempt: summary.onlinePending ? 'pending' : null,
    } } : current);
  }, []);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await API.get(`/api/admin/orders/${orderId}`);
        if (data.success) {
          // API returns { success, data: { order: {...}, payment: {...} } }
          setOrder(data.data.order ?? data.data);
        }
      } catch (error) {
        console.error("Fetch order error:", error);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) fetchOrder();
  }, [orderId]);

  const updateStatus = async (newStatus: string) => {
    if (!order || assigningStaff || order.status === newStatus) return;
    setUpdating(true);
    try {
      const { data } = await API.put(`/api/admin/orders/${orderId}/status`, { status: newStatus });
      if (data.success) {
        setOrder(current => current ? { ...current, ...data.data, status: newStatus, assignedDriver: current.assignedDriver } : current);
        setHandoverInput("");
      }
    } catch (error: unknown) {
      console.error("Update status error:", error);
      const msg =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Failed to update order status";
      alert(msg);
    } finally {
      setUpdating(false);
    }
  };

  const reopenOrder = async () => {
    if (!order || reopening || assigningStaff) return;
    if (reopenReason.trim().length < 5) { alert("Enter a correction reason of at least 5 characters."); return; }
    if (order.payment.method === "cod" && !reopenCod) { alert("Confirm whether COD cash was actually collected."); return; }
    setReopening(true);
    try {
      const { data } = await API.post(`/api/admin/orders/${orderId}/reopen`, {
        status: reopenStatus, reason: reopenReason.trim(),
        ...(order.payment.method === "cod" ? { codCollected: reopenCod === "yes" } : {}),
      });
      if (data.success) { setOrder(current => ({ ...data.data, assignedDriver: current?.assignedDriver })); setReopenReason(""); setReopenCod(""); setHandoverInput(""); alert(data.message); }
    } catch (error: unknown) {
      alert((error as { response?: { data?: { message?: string } } }).response?.data?.message || "Could not reopen this order");
    } finally { setReopening(false); }
  };

  const checkCancellationRefund = async () => {
    if (updating) return;
    setUpdating(true);
    try {
      const { data } = await API.post('/api/admin/orders/' + orderId + '/cancel/refund/check');
      if (data.success) { setOrder(current => current ? { ...current, ...data.data, assignedDriver: current.assignedDriver } : current); alert(data.message); }
    } catch (error: unknown) { alert((error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Could not check refund'); }
    finally { setUpdating(false); }
  };

  const verifyHandover = async () => {
    if (!order || assigningStaff || !handoverInput.trim()) return;
    setVerifyingHandover(true);
    try {
      const { data } = await API.post(
        `/api/admin/orders/${orderId}/verify-delivery-handover`,
        { code: handoverInput.trim() },
      );
      if (data.success && data.data) {
        setOrder(current => current ? { ...current, ...data.data, assignedDriver: current.assignedDriver } : current);
        setHandoverInput("");
        alert(data.message || "Verified");
      }
    } catch (error: unknown) {
      console.error("Verify handover error:", error);
      const msg =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Verification failed";
      alert(msg);
    } finally {
      setVerifyingHandover(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="space-y-6 p-6">
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Orders
        </Link>
        <p className="text-center text-muted-foreground">Order not found</p>
      </div>
    );
  }

  const statusStyle =
    (returnStageLabel(order.returnRequest) ? "bg-amber-50 text-amber-800" : STATUS_STYLES[order.status ?? ""]) ?? "bg-gray-100 text-gray-800";
  const addr = order.address?.snapshot;

  return (
    <div className="min-w-0 w-full">
      <div className="mx-auto w-full min-w-0 max-w-5xl py-2 sm:py-4">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition mb-4"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Orders
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">
                Order #{order.orderNumber}
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Placed on{" "}
                {new Date(order.createdAt).toLocaleDateString("en-IN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <span
              className={`self-start sm:self-auto px-4 py-2 rounded-lg text-sm font-semibold ${statusStyle}`}
            >
              {returnStageLabel(order.returnRequest) || formatStatus(order.status)}
            </span>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left — Items + Status Update */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <div className="bg-card rounded-xl shadow-sm border p-6">
              <h2 className="text-lg font-semibold mb-4">Order Items</h2>
              <div className="space-y-4">
                {order.items.map((item, i) => {
                  const image = item.product?.image || item.image;
                  const name = item.product?.name || item.productName;
                  return (
                    <div
                      key={i}
                      className="flex gap-4 pb-4 border-b last:border-0"
                    >
                      {image && (
                        <img
                          src={image}
                          alt={name}
                          className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-lg flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {item.packSize} {item.packUnit}
                          {item.seller && ` · ${item.seller.sellerName}`}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground line-through">
                            ₹{item.mrp}
                          </span>
                          <span className="text-sm font-medium">
                            ₹{item.unitPrice}
                          </span>
                          {item.discount > 0 && (
                            <span className="text-xs text-green-600 font-medium">
                              {item.discount}% off
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-sm text-muted-foreground">
                            Qty:{" "}
                            <span className="font-medium text-foreground">
                              {item.quantity}
                            </span>
                          </span>
                          <span className="font-semibold">
                            ₹{item.subtotal.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {order.returnRequest?.status && <div id="return-fulfillment" className="scroll-mt-6 space-y-4">
              <ReturnRequestPanel orderId={orderId} request={order.returnRequest} preview={order.returnRefundPreview} />
              {order.returnRequest?.status === 'approved' && <ReturnFulfillmentPanel orderId={orderId} onStageChange={stage => setOrder(current => current?.returnRequest ? { ...current, returnRequest: { ...current.returnRequest, fulfillment: { ...current.returnRequest.fulfillment, stage } } } : current)} />}
            </div>}

{order.returnRequest?.status !== "approved" && (            <DeliveryStaffAssignment key={orderId} orderId={orderId} status={order.status} assignedDriver={order.assignedDriver}
              disabled={updating || reopening || verifyingHandover}
              onBusyChange={setAssigningStaff}
              onAssigned={driver => setOrder(current => current ? { ...current, assignedDriver: driver } : current)} />)}

            {/* Delivery handover (customer tells driver this code) */}
            {order.status === "out_for_delivery" && (
              <div className="bg-card rounded-xl shadow-sm border border-purple-200/80 p-6">
                <h2 className="text-lg font-semibold mb-1">
                  Delivery handover code
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Enter the 6-digit code from the customer&apos;s app (order tracking).
                  A correct code marks the order <strong>Delivered</strong> and
                  completes COD collection when applicable.
                </p>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="6-digit code"
                    value={handoverInput}
                    onChange={(e) =>
                      setHandoverInput(e.target.value.replace(/\D/g, ""))
                    }
                    className="flex-1 min-w-0 rounded-lg border bg-background px-3 py-2 font-mono text-lg tracking-widest"
                  />
                  <button
                    type="button"
                    onClick={() => void verifyHandover()}
                    disabled={assigningStaff || verifyingHandover || handoverInput.length !== 6}
                    className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50"
                  >
                    {verifyingHandover ? "Checking…" : "Verify & mark delivered"}
                  </button>
                </div>
              </div>
            )}

            {/* Status Update */}
            {order.status === "delivered" && order.returnRequest?.status !== "approved" && <section className="rounded-xl border bg-card p-6 space-y-4">
              <h2 className="text-lg font-semibold">Correct an accidental delivery</h2>
              <p className="text-sm text-muted-foreground">Reopen this order to continue processing it. Online payments remain paid. Stock stays reserved. A new delivery code is generated when it goes out for delivery again.</p>
              {(["pending", "processing", "approved"].includes(order.returnRequest?.status || "") || order.payment.status === "refunded") ? <p className="text-sm text-amber-700">This order has a return or refund. Use <Link href={`/admin/returns/${orderId}`} className="underline">replacement management</Link> to continue this return.</p> : <>
                <label className="block text-sm font-medium">New status<select value={reopenStatus} onChange={(e) => setReopenStatus(e.target.value)} disabled={reopening} className="mt-2 block w-full rounded-lg border bg-background p-2"><option value="placed">Placed</option><option value="confirmed">Confirmed</option><option value="packed">Packed</option><option value="shipped">Shipped</option></select></label>
                <label className="block text-sm font-medium">Reason for correction<textarea value={reopenReason} onChange={(e) => setReopenReason(e.target.value)} maxLength={500} disabled={reopening} placeholder="Why was this order marked delivered by mistake?" className="mt-2 block min-h-20 w-full rounded-lg border bg-background p-3" /></label>
                {order.payment.method === "cod" && <label className="block text-sm font-medium">Was COD cash actually collected?<select value={reopenCod} onChange={(e) => setReopenCod(e.target.value)} disabled={reopening} className="mt-2 block w-full rounded-lg border bg-background p-2"><option value="">Select cash collection status</option><option value="yes">Yes — keep payment paid</option><option value="no">No — reset payment to pending</option></select><span className="mt-2 block text-xs text-muted-foreground">Choosing No reverses this order’s seller credit until payment is collected again. It does not refund or move money.</span></label>}
                <button type="button" onClick={() => void reopenOrder()} disabled={reopening || reopenReason.trim().length < 5 || (order.payment.method === "cod" && !reopenCod)} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50">{reopening ? "Reopening…" : "Reopen order"}</button>
              </>}
            </section>}
            {!!order.statusHistory?.length && <section className="rounded-xl border bg-card p-6 space-y-3"><h2 className="text-lg font-semibold">Status corrections</h2>{order.statusHistory.map((entry, index) => <div key={index} className="border-t pt-3 text-sm"><p className="font-medium">{formatStatus(entry.from)} → {formatStatus(entry.to)}</p><p>{entry.reason}</p><p className="text-xs text-muted-foreground">{new Date(entry.changedAt).toLocaleString()}{typeof entry.codCollected === "boolean" ? ` · COD collected: ${entry.codCollected ? "Yes" : "No"}` : ""}</p></div>)}</section>}

            <div className="bg-card rounded-xl shadow-sm border p-6">
              <h2 className="text-lg font-semibold mb-4">
                {order.returnRequest?.status === "approved" ? "Return / replacement status" : "Update Order Status"}
              </h2>
{order.returnRequest?.status === 'approved' ? <div className="space-y-2 text-sm"><p className="font-semibold">{returnStageLabel(order.returnRequest)}</p><p className="text-muted-foreground">Original delivery: {formatStatus(order.status)}. Continue the return or replacement using its controls.</p><Link href={`/admin/returns/${orderId}`} className="inline-flex rounded-lg bg-primary px-4 py-2 font-semibold text-primary-foreground">Manage pickup & replacement</Link></div> : (              <div className="flex flex-wrap gap-2">
                {ORDER_STATUSES.map((status) => (
                  <button
                    key={status}
                    onClick={() => updateStatus(status)}
                    disabled={assigningStaff || updating || reopening || order.status === status || ["delivered", "cancelled", "returned"].includes(order.status)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                      order.status === status
                        ? `${STATUS_STYLES[status] ?? "bg-primary text-primary-foreground"} cursor-default`
                        : "bg-muted hover:bg-muted/70 disabled:opacity-50"
                    }`}
                  >
                    {formatStatus(status)}
                  </button>
                ))}
              </div>)}
            </div>
          </div>

          {/* Right — Summary, Payment, Address */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-card rounded-xl shadow-sm border p-6">
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>₹{order.subtotal.toLocaleString()}</span>
                </div>
                {(order.totalDiscount ?? 0) > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>− ₹{order.totalDiscount.toLocaleString()}</span>
                  </div>
                )}
                {(order.taxAmount ?? 0) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax (GST)</span>
                    <span>₹{order.taxAmount.toLocaleString()}</span>
                  </div>
                )}
                {(order.deliveryFee ?? 0) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery Fee</span>
                    <span>₹{order.deliveryFee.toLocaleString()}</span>
                  </div>
                )}
                <div className="pt-3 border-t flex justify-between font-bold">
                  <span>Total</span>
                  <span className="text-lg">
                    ₹{order.grandTotal.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className="bg-card rounded-xl shadow-sm border p-6">
              <h2 className="text-lg font-semibold mb-4">Payment Details</h2>
              {order.cancellation?.state && <div className="mb-4 rounded-lg border p-3 text-sm space-y-2">
                <p>Cancellation refund: {order.cancellation.refundStatus || 'none'} · ₹{order.cancellation.refundAmount || 0} · {order.cancellation.refundedTo || 'none'}</p>
                {order.cancellation.refundOperation?.gatewayRefundId && <p>Refund reference: {order.cancellation.refundOperation.gatewayRefundId}</p>}
                {order.cancellation.state === 'processing' && <button type="button" disabled={updating} onClick={() => void checkCancellationRefund()} className="text-primary underline">Check / resume refund</button>}
              </div>}
              {order.payment.onlineAttempt && <p role="status" className="mb-3 text-sm font-semibold text-amber-800">Online payment is being checked. Do not collect cash.</p>}
              {order.payment.convertedFromCod && order.payment.status === 'paid' && <p className="mb-3 text-sm font-semibold text-green-700">Paid online — do not collect cash.</p>}
              {order.status === 'out_for_delivery' && order.payment.method === 'cod' && order.payment.status === 'pending' && <DriverPaymentCheck key={orderId} orderRef={orderId} admin onPaymentChecked={handlePaymentChecked} />}
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wide">
                    Method
                  </p>
                  <p className="text-sm font-medium mt-1 capitalize">
                    {order.payment.method}
                    {order.payment.isCod && " (Cash on Delivery)"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wide">
                    Status
                  </p>
                  <span
                    className={`inline-flex px-3 py-1 rounded-full text-xs font-medium mt-1 capitalize ${
                      PAYMENT_STATUS_STYLES[order.payment.status] ??
                      "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {order.payment.status}
                  </span>
                </div>
                {order.payment.isCod && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wide">
                      COD Collected
                    </p>
                    <p className="text-sm font-medium mt-1">
                      {order.payment.codCollected ? "✅ Yes" : "⏳ Not yet"}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Shipping Address — from address.snapshot */}
            {addr && (
              <div className="bg-card rounded-xl shadow-sm border p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Shipping Address
                </h2>
                <div className="space-y-1 text-sm">
                  <p className="font-medium">{addr.name}</p>
                  {(addr.addressLine || addr.address) && (
                    <p className="text-muted-foreground">{addr.addressLine || addr.address}</p>
                  )}
                  {addr.landmark && (
                    <p className="text-muted-foreground">
                      Near: {addr.landmark}
                    </p>
                  )}
                  <p className="text-muted-foreground">
                    {addr.city}, {addr.state} — {addr.pincode}
                  </p>
                  <div className="flex items-center gap-1.5 mt-2 text-muted-foreground">
                    <Phone className="h-3.5 w-3.5" />
                    <span>{addr.phone}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
