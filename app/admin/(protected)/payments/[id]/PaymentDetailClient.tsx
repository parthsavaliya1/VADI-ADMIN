"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Loader2,
  DollarSign,
  CreditCard,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import API from "@/lib/api";

/* ── Types matching real API response ── */

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
  } | null; // ✅ API can return null
  amount: number;
  currency: string;
  method: string;
  status: string;
  isCod: boolean;
  codCollected?: boolean;
  collectedAt?: string;
  attempt?: number;
  gateway?: {
    name?: string;
    paymentId?: string;
    orderId?: string;
  };
  createdAt: string;
  updatedAt: string;
};

/* ── Style maps ── */

const STATUS_STYLES: Record<string, string> = {
  success: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
  failed: "bg-red-100 text-red-800",
  initiated: "bg-blue-100 text-blue-800",
  cancelled: "bg-gray-100 text-gray-800",
  refunded: "bg-purple-100 text-purple-800",
  partial_refund: "bg-orange-100 text-orange-800",
};

function StatusIcon({ status }: { status: string }) {
  if (status === "success") return <CheckCircle className="h-4 w-4 mr-1.5" />;
  if (status === "pending") return <Clock className="h-4 w-4 mr-1.5" />;
  if (status === "failed") return <AlertCircle className="h-4 w-4 mr-1.5" />;
  return null;
}

function formatLabel(str?: string) {
  if (!str) return "—";
  return str.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/* ── Component ── */

export default function PaymentDetailClient({
  paymentId,
}: {
  paymentId: string;
}) {
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [collecting, setCollecting] = useState(false);

  useEffect(() => {
    const fetchPayment = async () => {
      try {
        const { data } = await API.get(`/payments/${paymentId}`);
        if (data.success) setPayment(data.data);
      } catch (error) {
        console.error("Fetch payment error:", error);
      } finally {
        setLoading(false);
      }
    };

    if (paymentId) fetchPayment();
  }, [paymentId]);

  const collectCOD = async () => {
    if (!payment) return;
    setCollecting(true);
    try {
      const { data } = await API.post(`/payments/${paymentId}/collect-cod`, {});
      if (data.success) {
        setPayment({
          ...payment,
          codCollected: true,
          collectedAt: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error("Collect COD error:", error);
      alert("Failed to mark COD as collected");
    } finally {
      setCollecting(false);
    }
  };

  /* Loading */
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  /* Not found */
  if (!payment) {
    return (
      <div className="space-y-6 p-6">
        <Link
          href="/admin/payments"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Payments
        </Link>
        <p className="text-center text-muted-foreground">Payment not found</p>
      </div>
    );
  }

  const statusStyle =
    STATUS_STYLES[payment.status] ?? "bg-gray-100 text-gray-800";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin/payments"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition mb-4"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Payments
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">
                Payment Details
              </h1>
              <p className="text-muted-foreground mt-1 text-sm">
                Order #{payment.order.orderNumber}
              </p>
            </div>
            <span
              className={`self-start sm:self-auto inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold ${statusStyle}`}
            >
              <StatusIcon status={payment.status} />
              {formatLabel(payment.status)}
            </span>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left — Payment info, Order link, Gateway */}
          <div className="lg:col-span-2 space-y-6">
            {/* Payment Information */}
            <div className="bg-card rounded-xl shadow-sm border p-6">
              <h2 className="text-lg font-semibold mb-6">
                Payment Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1 mb-2">
                    <DollarSign className="h-3.5 w-3.5" /> Amount
                  </p>
                  <p className="text-3xl font-bold">
                    ₹{payment.amount.toLocaleString()}
                    <span className="text-sm text-muted-foreground ml-2">
                      {payment.currency}
                    </span>
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1 mb-2">
                    <CreditCard className="h-3.5 w-3.5" /> Method
                  </p>
                  <p className="text-2xl font-bold capitalize">
                    {payment.method}
                  </p>
                  {payment.isCod && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Cash on Delivery
                    </p>
                  )}
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Status
                  </p>
                  <p className="text-lg font-medium">
                    {formatLabel(payment.status)}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Date
                  </p>
                  <p className="text-base font-medium">
                    {new Date(payment.createdAt).toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                {payment.attempt != null && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                      Attempt
                    </p>
                    <p className="text-lg font-medium">#{payment.attempt}</p>
                  </div>
                )}

                {payment.updatedAt && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                      Last Updated
                    </p>
                    <p className="text-base font-medium">
                      {new Date(payment.updatedAt).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Related Order */}
            <div className="bg-card rounded-xl shadow-sm border p-6">
              <h2 className="text-lg font-semibold mb-4">Related Order</h2>
              <Link
                href={`/admin/orders/${payment.order._id}`}
                className="flex items-center justify-between p-4 bg-primary/5 hover:bg-primary/10 rounded-lg transition border border-primary/20"
              >
                <div>
                  <p className="font-medium">
                    Order #{payment.order.orderNumber}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <p className="text-sm text-muted-foreground">
                      ₹{payment.order.grandTotal.toLocaleString()}
                    </p>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-muted capitalize">
                      {formatLabel(payment.order.status)}
                    </span>
                  </div>
                </div>
                <span className="text-sm font-medium text-primary">View →</span>
              </Link>
            </div>

            {/* Gateway Information */}
            {payment.gateway?.name && (
              <div className="bg-card rounded-xl shadow-sm border p-6">
                <h2 className="text-lg font-semibold mb-4">
                  Gateway Information
                </h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Gateway
                    </p>
                    <p className="text-sm mt-1">{payment.gateway.name}</p>
                  </div>
                  {payment.gateway.paymentId && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Payment ID
                      </p>
                      <p className="text-sm font-mono break-all mt-1">
                        {payment.gateway.paymentId}
                      </p>
                    </div>
                  )}
                  {payment.gateway.orderId && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Order ID
                      </p>
                      <p className="text-sm font-mono break-all mt-1">
                        {payment.gateway.orderId}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right — Customer (nullable), COD, Payment ID */}
          <div className="space-y-6">
            {/* Customer — only shown if user is not null */}
            {payment.user ? (
              <div className="bg-card rounded-xl shadow-sm border p-6">
                <h2 className="text-lg font-semibold mb-4">Customer</h2>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Name
                    </p>
                    <p className="font-medium mt-1">
                      {payment.user.name || "Unknown"}
                    </p>
                  </div>
                  {payment.user.phone && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Phone
                      </p>
                      <p className="font-medium mt-1">{payment.user.phone}</p>
                    </div>
                  )}
                  {payment.user.email && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Email
                      </p>
                      <p className="font-medium mt-1 break-all">
                        {payment.user.email}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-card rounded-xl shadow-sm border p-6">
                <h2 className="text-lg font-semibold mb-2">Customer</h2>
                <p className="text-sm text-muted-foreground">
                  No customer data available
                </p>
              </div>
            )}

            {/* COD Collection */}
            {payment.isCod && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                <h2 className="text-lg font-semibold mb-4">COD Collection</h2>
                {payment.codCollected ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-green-700">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-medium">Payment Collected</span>
                    </div>
                    {payment.collectedAt && (
                      <p className="text-sm text-muted-foreground">
                        Collected on{" "}
                        {new Date(payment.collectedAt).toLocaleDateString(
                          "en-IN",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                      </p>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={collectCOD}
                    disabled={collecting}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-60 transition font-medium"
                  >
                    {collecting && (
                      <Loader2 size={14} className="animate-spin" />
                    )}
                    Mark as Collected
                  </button>
                )}
              </div>
            )}

            {/* Payment ID */}
            <div className="bg-card rounded-xl shadow-sm border p-6">
              <h2 className="text-lg font-semibold mb-3">Payment ID</h2>
              <p className="text-xs font-mono text-muted-foreground break-all">
                {payment._id}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
