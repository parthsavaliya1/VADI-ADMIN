"use client";

import API from "@/lib/api";
import { useState } from "react";

export default function DriverVerifyHandoverForm({
  onVerified,
}: {
  onVerified?: () => void;
}) {
  const [orderId, setOrderId] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const submit = async () => {
    setMsg("");
    setErr("");
    const ref = orderId.trim().replace(/^#/, "").trim();
    const c = code.replace(/\D/g, "");
    if (!ref) {
      setErr("Enter the order number (e.g. ORD…) or the 24-character ID from the admin order URL.");
      return;
    }
    if (c.length !== 6) {
      setErr("Enter the 6-digit code from the customer.");
      return;
    }
    setLoading(true);
    try {
      const pathRef = encodeURIComponent(ref);
      const { data } = await API.post(
        `/orders/${pathRef}/verify-delivery-handover`,
        { code: c },
      );
      if (data?.success) {
        setMsg(
          data.message ||
            "Code verified — order marked as delivered.",
        );
        setCode("");
        onVerified?.();
      } else {
        setErr(data?.message || "Verification failed");
      }
    } catch (e: unknown) {
      const ax = e as { response?: { data?: { message?: string } } };
      setErr(ax.response?.data?.message || "Request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-lg border bg-card p-5 space-y-4 max-w-xl">
      <div>
        <h2 className="font-semibold">Verify customer code</h2>
        <p className="text-xs text-muted-foreground mt-1">
          When the order is <strong>Out for delivery</strong>, enter the customer&apos;s
          6-digit code from their app. A correct code <strong>marks the order as
          delivered</strong> immediately (COD payment is completed the same way as
          in admin).
        </p>
      </div>
      <div>
        <label className="text-xs font-medium uppercase text-muted-foreground">
          Order number or ID
        </label>
        <input
          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono"
          placeholder="e.g. ORD23908068615 or 24-char ID from admin URL"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
        />
      </div>
      <div>
        <label className="text-xs font-medium uppercase text-muted-foreground">
          6-digit code
        </label>
        <input
          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-lg tracking-widest font-mono"
          inputMode="numeric"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
        />
      </div>
      <button
        type="button"
        disabled={loading}
        onClick={() => void submit()}
        className="rounded-md bg-violet-700 px-4 py-2 text-sm font-medium text-white hover:bg-violet-800 disabled:opacity-60"
      >
        {loading ? "Checking…" : "Verify code"}
      </button>
      {msg ? <p className="text-sm text-green-700">{msg}</p> : null}
      {err ? <p className="text-sm text-destructive">{err}</p> : null}
    </div>
  );
}
