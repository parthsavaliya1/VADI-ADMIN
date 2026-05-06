"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Loader2, MapPin, Phone } from "lucide-react";
import Link from "next/link";
import API from "@/lib/api";

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
  payment: {
    method: string;
    status: string;
    isCod: boolean;
    codCollected?: boolean;
  };
  address: {
    snapshot: ShippingSnapshot;
    addressId: string;
  };
  createdAt: string;
};

/* ── Style maps ── */

const STATUS_STYLES: Record<string, string> = {
  placed: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  packed: "bg-orange-100 text-orange-800",
  out_for_delivery: "bg-purple-100 text-purple-800",
  shipped: "bg-cyan-100 text-cyan-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  pending: "bg-yellow-100 text-yellow-800",
};

const PAYMENT_STATUS_STYLES: Record<string, string> = {
  success: "bg-green-100 text-green-800",
  paid: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
  failed: "bg-red-100 text-red-800",
};

const ORDER_STATUSES = [
  "placed",
  "confirmed",
  "packed",
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

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await API.get(`/orders/${orderId}`);
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
    if (!order || order.status === newStatus) return;
    setUpdating(true);
    try {
      const { data } = await API.put(`/orders/${orderId}/status`, {
        status: newStatus,
      });
      if (data.success) setOrder({ ...order, status: newStatus });
    } catch (error) {
      console.error("Update status error:", error);
      alert("Failed to update order status");
    } finally {
      setUpdating(false);
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
    STATUS_STYLES[order.status ?? ""] ?? "bg-gray-100 text-gray-800";
  const addr = order.address?.snapshot;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
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
              {formatStatus(order.status)}
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

            {/* Status Update */}
            <div className="bg-card rounded-xl shadow-sm border p-6">
              <h2 className="text-lg font-semibold mb-4">
                Update Order Status
              </h2>
              <div className="flex flex-wrap gap-2">
                {ORDER_STATUSES.map((status) => (
                  <button
                    key={status}
                    onClick={() => updateStatus(status)}
                    disabled={updating || order.status === status}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                      order.status === status
                        ? `${STATUS_STYLES[status] ?? "bg-primary text-primary-foreground"} cursor-default`
                        : "bg-muted hover:bg-muted/70 disabled:opacity-50"
                    }`}
                  >
                    {formatStatus(status)}
                  </button>
                ))}
              </div>
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
                  {addr.address && (
                    <p className="text-muted-foreground">{addr.address}</p>
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
