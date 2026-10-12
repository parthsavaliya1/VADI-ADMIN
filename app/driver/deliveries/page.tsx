"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import API from "@/lib/api";
import { ChevronLeft, ChevronRight, MapPin, Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import DriverVerifyHandoverForm from "./DriverVerifyHandoverForm";

type OrderItem = {
  productName: string;
  quantity: number;
  subtotal: number;
  packSize?: number;
  packUnit?: string;
  product?: { name?: string; image?: string };
};

type AddressSnapshot = {
  name?: string;
  phone?: string;
  addressLine?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  landmark?: string;
};

type DeliveryOrder = {
  _id: string;
  orderNumber: string;
  status?: string;
  deliveredAt?: string;
  deliveryHandoverVerifiedAt?: string;
  updatedAt?: string;
  grandTotal: number;
  items: OrderItem[];
  address?: { snapshot?: AddressSnapshot };
  payment?: {
    method?: string;
    status?: string;
    isCod?: boolean;
    codCollected?: boolean;
  };
};

type Bucket = "assigned" | "waiting" | "completed";

type ListedOrder = DeliveryOrder & { bucket: Bucket };

const PAGE_SIZE = 8;

const BUCKET_META: Record<
  Bucket,
  { label: string; className: string }
> = {
  assigned: {
    label: "Assigned",
    className: "bg-primary/10 text-primary",
  },
  waiting: {
    label: "Waiting for admin",
    className: "bg-amber-100 text-amber-900",
  },
  completed: {
    label: "Completed",
    className: "bg-emerald-100 text-emerald-800",
  },
};

function paymentLabel(method?: string) {
  const m = (method || "").toLowerCase();
  if (m === "cod") return "COD";
  if (m === "upi") return "UPI";
  if (m === "card") return "Card";
  if (m === "wallet") return "Wallet";
  return m ? m.toUpperCase() : "—";
}

function formatWhen(value?: string) {
  if (!value) return "";
  return new Date(value).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function customerLine(order: DeliveryOrder) {
  const snap = order.address?.snapshot;
  if (!snap) return "";
  return [snap.name, snap.city].filter(Boolean).join(" · ");
}

function addressText(order: DeliveryOrder) {
  const snap = order.address?.snapshot;
  if (!snap) return "";
  return [
    snap.addressLine,
    snap.addressLine1,
    snap.addressLine2,
    snap.landmark,
    snap.city,
    snap.state,
    snap.pincode,
  ]
    .filter(Boolean)
    .join(", ");
}

function OrderDetails({
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
  const address = addressText(order);
  const snap = order.address?.snapshot;

  return (
    <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b bg-muted/40 px-4 py-3">
        <span className="font-semibold">#{order.orderNumber}</span>
        {badge}
        <span className="text-xs text-muted-foreground">
          {dateValue ? `${dateLabel}: ${formatWhen(dateValue)}` : ""}
        </span>
        <span className="ml-auto text-sm font-medium">
          ₹{Number(order.grandTotal).toLocaleString("en-IN")}
        </span>
      </div>
      {(snap?.name || address) && (
        <div className="border-b px-4 py-3 text-sm">
          <p className="font-medium">{snap?.name || "Customer"}</p>
          {snap?.phone ? (
            <p className="text-xs text-muted-foreground">{snap.phone}</p>
          ) : null}
          {address ? (
            <p className="mt-1 flex gap-1.5 text-xs text-muted-foreground">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>{address}</span>
            </p>
          ) : null}
        </div>
      )}
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
            <li key={`${order._id}-${idx}`} className="flex gap-3 px-4 py-3 text-sm">
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
                  {item.packSize ? `${item.packSize}${item.packUnit || ""} · ` : ""}
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
  const [assigned, setAssigned] = useState<DeliveryOrder[]>([]);
  const [completed, setCompleted] = useState<DeliveryOrder[]>([]);
  const [pendingAdmin, setPendingAdmin] = useState<DeliveryOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [bucket, setBucket] = useState<"all" | Bucket>("all");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<ListedOrder | null>(null);

  const fetchLists = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await API.get<{
        success?: boolean;
        data?:
          | DeliveryOrder[]
          | {
              assigned?: DeliveryOrder[];
              completed?: DeliveryOrder[];
              pendingAdmin?: DeliveryOrder[];
            };
        message?: string;
      }>("/api/driver/deliveries");
      if (!data?.success) {
        setError(data?.message || "Could not load deliveries");
        return;
      }
      const payload = data.data;
      if (Array.isArray(payload)) {
        setAssigned([]);
        setCompleted(payload);
        setPendingAdmin([]);
      } else if (payload && typeof payload === "object") {
        setAssigned(payload.assigned || []);
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

  const orders = useMemo<ListedOrder[]>(() => {
    const waitingIds = new Set(pendingAdmin.map((order) => order._id));
    return [
      ...assigned
        .filter((order) => !waitingIds.has(order._id))
        .map((order) => ({ ...order, bucket: "assigned" as const })),
      ...pendingAdmin.map((order) => ({ ...order, bucket: "waiting" as const })),
      ...completed.map((order) => ({ ...order, bucket: "completed" as const })),
    ];
  }, [assigned, pendingAdmin, completed]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((order) => {
      if (bucket !== "all" && order.bucket !== bucket) return false;
      if (!q) return true;
      const snap = order.address?.snapshot;
      const haystack = [
        order.orderNumber,
        snap?.name,
        snap?.phone,
        snap?.city,
        snap?.pincode,
        ...order.items.map((item) => item.product?.name || item.productName),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [orders, search, bucket]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageOrders = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  useEffect(() => {
    setPage(1);
  }, [search, bucket]);

  const counts = {
    all: orders.length,
    assigned: orders.filter((order) => order.bucket === "assigned").length,
    waiting: orders.filter((order) => order.bucket === "waiting").length,
    completed: orders.filter((order) => order.bucket === "completed").length,
  };

  const codSummary = useMemo(() => {
    const codList = completed.filter(
      (order) =>
        order.payment?.isCod ||
        (order.payment?.method || "").toLowerCase() === "cod",
    );
    const codTotal = codList.reduce(
      (sum, order) => sum + Number(order.grandTotal || 0),
      0,
    );
    const outstanding = codList.filter(
      (order) =>
        !order.payment?.codCollected &&
        (order.payment?.status || "").toLowerCase() !== "paid",
    );
    const outstandingTotal = outstanding.reduce(
      (sum, order) => sum + Number(order.grandTotal || 0),
      0,
    );
    return { codList, codTotal, outstanding, outstandingTotal };
  }, [completed]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Deliveries</h1>
          <p className="text-sm text-muted-foreground">
            Open a card to see items, address, and payment.
          </p>
        </div>
        <label className="relative block w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order, customer, item"
            className="w-full rounded-lg border bg-card py-2 pl-9 pr-3 text-sm outline-none ring-primary/30 focus:ring-2"
          />
        </label>
      </div>

      <div className="flex flex-wrap gap-2">
        {(
          [
            ["all", "All"],
            ["assigned", "Assigned"],
            ["waiting", "Waiting"],
            ["completed", "Completed"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setBucket(key)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium ${
              bucket === key
                ? "bg-primary text-primary-foreground"
                : "border bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            {label} ({counts[key]})
          </button>
        ))}
      </div>

      {bucket === "all" || bucket === "completed" ? (
        codSummary.codList.length > 0 ? (
          <div className="rounded-lg border border-amber-200/80 bg-amber-50/50 px-4 py-3 text-sm">
            <span className="font-semibold text-amber-950">
              COD summary: {codSummary.codList.length} order
              {codSummary.codList.length !== 1 ? "s" : ""} · ₹
              {codSummary.codTotal.toLocaleString("en-IN")} total
            </span>
            {codSummary.outstanding.length > 0 ? (
              <p className="mt-1 text-amber-900">
                Still showing as not collected: {codSummary.outstanding.length} · ₹
                {codSummary.outstandingTotal.toLocaleString("en-IN")}
              </p>
            ) : (
              <p className="mt-1 text-green-800">
                All listed COD orders are marked paid / collected.
              </p>
            )}
          </div>
        ) : null
      ) : null}

      {loading ? (
        <div className="rounded-lg border bg-card p-10 text-center text-muted-foreground">
          Loading your deliveries…
        </div>
      ) : error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
          {error}
        </div>
      ) : pageOrders.length === 0 ? (
        <div className="rounded-lg border bg-card p-8">
          <p className="text-lg font-medium">No deliveries found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {search
              ? "Try another order number, customer, or item name."
              : "Assigned and completed orders will show up here."}
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {pageOrders.map((order) => {
            const meta = BUCKET_META[order.bucket];
            const when =
              order.bucket === "completed"
                ? order.deliveredAt
                : order.bucket === "waiting"
                  ? order.deliveryHandoverVerifiedAt
                  : order.updatedAt;
            const preview = order.items
              .slice(0, 2)
              .map((item) => item.product?.name || item.productName)
              .join(", ");
            return (
              <button
                key={`${order.bucket}-${order._id}`}
                type="button"
                onClick={() => setSelected(order)}
                className="rounded-xl border bg-card p-4 text-left shadow-sm transition hover:border-primary/40 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">#{order.orderNumber}</p>
                    <p className="mt-0.5 truncate text-sm text-muted-foreground">
                      {customerLine(order) || `${order.items.length} item${order.items.length === 1 ? "" : "s"}`}
                    </p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${meta.className}`}>
                    {meta.label}
                  </span>
                </div>
                <p className="mt-3 truncate text-sm">{preview || "No items"}</p>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="text-xs text-muted-foreground">
                    {paymentLabel(order.payment?.method)}
                    {when ? ` · ${formatWhen(when)}` : ""}
                  </span>
                  <span className="font-semibold">
                    ₹{Number(order.grandTotal).toLocaleString("en-IN")}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {!loading && !error && filtered.length > 0 ? (
        <div className="flex items-center justify-between gap-3 text-sm">
          <p className="text-muted-foreground">
            Showing {(safePage - 1) * PAGE_SIZE + 1}–
            {Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => setPage(safePage - 1)}
              className="inline-flex items-center gap-1 rounded-lg border bg-card px-3 py-1.5 disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
              Prev
            </button>
            <span className="text-muted-foreground">
              {safePage} / {totalPages}
            </span>
            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() => setPage(safePage + 1)}
              className="inline-flex items-center gap-1 rounded-lg border bg-card px-3 py-1.5 disabled:opacity-40"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : null}

      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
          {selected ? (
            <>
              <DialogHeader>
                <DialogTitle>Order #{selected.orderNumber}</DialogTitle>
                <DialogDescription>
                  {BUCKET_META[selected.bucket].label}
                  {selected.bucket === "assigned"
                    ? " · Verify the customer code when this order is out for delivery."
                    : ""}
                </DialogDescription>
              </DialogHeader>
              <OrderDetails
                order={selected}
                dateLabel={
                  selected.bucket === "completed"
                    ? "Delivered"
                    : selected.bucket === "waiting"
                      ? "Verified at"
                      : "Updated"
                }
                dateValue={
                  selected.bucket === "completed"
                    ? selected.deliveredAt
                    : selected.bucket === "waiting"
                      ? selected.deliveryHandoverVerifiedAt
                      : selected.updatedAt
                }
                badge={
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${BUCKET_META[selected.bucket].className}`}
                  >
                    {BUCKET_META[selected.bucket].label}
                  </span>
                }
              />
              {selected.bucket === "assigned" &&
              (selected.status === "out_for_delivery" || !selected.status) ? (
                <DriverVerifyHandoverForm
                  key={selected._id}
                  compact
                  orderNumber={selected.orderNumber}
                  onVerified={() => {
                    setSelected(null);
                    void fetchLists();
                  }}
                />
              ) : null}
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
