"use client";

import API from "@/lib/api";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import DriverVerifyHandoverForm from "./DriverVerifyHandoverForm";

type OrderItem = {
  productName: string;
  quantity: number;
  subtotal: number;
  product?: { name?: string; image?: string };
};

type DeliveryOrder = {
  _id: string;
  orderNumber: string;
  deliveredAt?: string;
  deliveryHandoverVerifiedAt?: string;
  grandTotal: number;
  items: OrderItem[];
  payment?: {
    method?: string;
    status?: string;
    isCod?: boolean;
    codCollected?: boolean;
  };
};

function paymentLabel(method?: string) {
  const m = (method || "").toLowerCase();
  if (m === "cod") return "COD";
  if (m === "upi") return "UPI";
  if (m === "card") return "Card";
  if (m === "wallet") return "Wallet";
  return m ? m.toUpperCase() : "—";
}

function OrderBlock({
  order,
  dateLabel,
  dateValue,
  badge,
}: {
  order: DeliveryOrder;
  dateLabel: string;
  dateValue?: string;
  badge?: ReactNode;
}) {
  const method = (order.payment?.method || "").toLowerCase();
  const isCod = order.payment?.isCod || method === "cod";
  const codCollected =
    order.payment?.codCollected || order.payment?.status === "paid";
  const payName = paymentLabel(order.payment?.method);

  return (
    <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b bg-muted/40 px-4 py-3">
        <span className="font-semibold">#{order.orderNumber}</span>
        {badge}
        <span className="text-xs text-muted-foreground">
          {dateValue
            ? `${dateLabel}: ${new Date(dateValue).toLocaleString("en-IN")}`
            : ""}
        </span>
        <span className="ml-auto text-sm font-medium">
          ₹{Number(order.grandTotal).toLocaleString("en-IN")}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-2 border-b bg-muted/20 px-4 py-2 text-xs">
        <span className="font-semibold text-muted-foreground">Payment</span>
        <span
          className={`rounded-full px-2 py-0.5 font-medium ${
            isCod
              ? "bg-amber-100 text-amber-950"
              : method === "upi"
                ? "bg-violet-100 text-violet-900"
                : method === "card"
                  ? "bg-sky-100 text-sky-900"
                  : "bg-zinc-100 text-zinc-800"
          }`}
        >
          {payName}
        </span>
        {isCod ? (
          <span className="text-muted-foreground">
            {codCollected ? (
              <span className="text-green-700">Cash collected (marked paid)</span>
            ) : (
              <span className="font-medium text-amber-900">
                Collect ₹{Number(order.grandTotal).toLocaleString("en-IN")} cash
              </span>
            )}
          </span>
        ) : (
          <span className="text-muted-foreground">Paid online — nothing to collect</span>
        )}
      </div>
      <ul className="divide-y">
        {order.items.map((item, idx) => {
          const name = item.product?.name || item.productName;
          return (
            <li
              key={`${order._id}-${idx}`}
              className="flex gap-3 px-4 py-3 text-sm"
            >
              {item.product?.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.product.image}
                  alt=""
                  className="h-12 w-12 shrink-0 rounded-md bg-muted object-cover"
                />
              ) : (
                <div className="h-12 w-12 shrink-0 rounded-md bg-muted" />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{name}</p>
                <p className="text-xs text-muted-foreground">
                  Qty {item.quantity} · ₹
                  {Number(item.subtotal).toLocaleString("en-IN")}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default function DriverDeliveriesPage() {
  const [completed, setCompleted] = useState<DeliveryOrder[]>([]);
  const [pendingAdmin, setPendingAdmin] = useState<DeliveryOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchLists = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await API.get<{
        success?: boolean;
        data?:
          | DeliveryOrder[]
          | { completed?: DeliveryOrder[]; pendingAdmin?: DeliveryOrder[] };
        message?: string;
      }>("/api/driver/deliveries");
      if (!data?.success) {
        setError(data?.message || "Could not load deliveries");
        return;
      }
      const payload = data.data;
      if (Array.isArray(payload)) {
        setCompleted(payload);
        setPendingAdmin([]);
      } else if (payload && typeof payload === "object") {
        setCompleted(payload.completed || []);
        setPendingAdmin(payload.pendingAdmin || []);
      } else {
        setCompleted([]);
        setPendingAdmin([]);
      }
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to load deliveries";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchLists();
  }, [fetchLists]);

  return (
    <div className="space-y-8">
      <DriverVerifyHandoverForm onVerified={() => void fetchLists()} />

      {loading ? (
        <div className="rounded-lg border bg-card p-10 text-center text-muted-foreground">
          Loading your deliveries…
        </div>
      ) : error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
          {error}
        </div>
      ) : (
        <>
          {pendingAdmin.length > 0 ? (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold">Waiting for admin</h2>
              <p className="max-w-3xl text-sm text-muted-foreground">
                You verified the customer code for these orders. They still show{" "}
                <strong>Out for delivery</strong> in admin until someone marks them{" "}
                <strong>Delivered</strong>. Then they move to{" "}
                <strong>Completed</strong>.
              </p>
              <div className="space-y-4">
                {pendingAdmin.map((order) => (
                  <OrderBlock
                    key={order._id}
                    order={order}
                    dateLabel="Verified at"
                    dateValue={order.deliveryHandoverVerifiedAt}
                    badge={
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900">
                        Out for delivery
                      </span>
                    }
                  />
                ))}
              </div>
            </div>
          ) : null}

          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Completed</h2>
            {completed.length === 0 ? (
              <div className="space-y-3 rounded-lg border bg-card p-8">
                <p className="text-lg font-medium">No completed deliveries yet</p>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  When you verify a customer&apos;s code for an order that is{" "}
                  <strong>Out for delivery</strong>, that order is marked{" "}
                  <strong>Delivered</strong> and will show up here.
                </p>
              </div>
            ) : (
              <>
                <p className="max-w-3xl text-sm text-muted-foreground">
                  Orders you completed at the door. <strong>COD</strong> rows show
                  whether cash was marked collected — use totals to reconcile with
                  the driver.
                </p>
                {(() => {
                  const codList = completed.filter(
                    (o) =>
                      o.payment?.isCod ||
                      (o.payment?.method || "").toLowerCase() === "cod",
                  );
                  const codTotal = codList.reduce(
                    (s, o) => s + Number(o.grandTotal || 0),
                    0,
                  );
                  const codOutstanding = codList.filter(
                    (o) =>
                      !o.payment?.codCollected &&
                      (o.payment?.status || "").toLowerCase() !== "paid",
                  );
                  const outSum = codOutstanding.reduce(
                    (s, o) => s + Number(o.grandTotal || 0),
                    0,
                  );
                  if (codList.length === 0) return null;
                  return (
                    <div className="rounded-lg border border-amber-200/80 bg-amber-50/50 px-4 py-3 text-sm">
                      <span className="font-semibold text-amber-950">
                        COD summary: {codList.length} order
                        {codList.length !== 1 ? "s" : ""} · ₹
                        {codTotal.toLocaleString("en-IN")} total
                      </span>
                      {codOutstanding.length > 0 ? (
                        <p className="mt-1 text-amber-900">
                          Still showing as not collected: {codOutstanding.length}{" "}
                          · ₹{outSum.toLocaleString("en-IN")}
                        </p>
                      ) : (
                        <p className="mt-1 text-green-800">
                          All listed COD orders are marked paid / collected.
                        </p>
                      )}
                    </div>
                  );
                })()}
                <div className="space-y-4">
                  {completed.map((order) => (
                    <OrderBlock
                      key={order._id}
                      order={order}
                      dateLabel="Delivered"
                      dateValue={order.deliveredAt}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
