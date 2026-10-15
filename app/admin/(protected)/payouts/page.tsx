"use client";

import { useEffect, useState } from "react";
import API from "@/lib/api";

type Payout = {
  _id: string;
  amount: number;
  status: string;
  seller?: { name?: string; phone?: string; bank?: { accountNumber?: string; ifsc?: string; upi?: string } };
};

export default function PayoutsPage() {
  const [rows, setRows] = useState<Payout[]>([]);

  const load = () =>
    API.get("/api/admin/payouts")
      .then(({ data }) => setRows(data.data || []))
      .catch(() => setRows([]));

  useEffect(() => {
    load();
  }, []);

  const resolve = async (id: string, action: "paid" | "rejected") => {
    await API.put(`/api/admin/payouts/${id}`, { action });
    load();
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Seller payouts</h1>
      <p className="text-sm text-muted-foreground">
        Mark a request paid after you transfer the amount to the seller bank or UPI.
      </p>
      {rows.map((row) => (
        <div key={row._id} className="rounded-xl border border-border bg-card p-4">
          <p className="font-medium">{row.seller?.name || "Seller"} · ₹{row.amount}</p>
          <p className="text-sm text-muted-foreground">
            {row.seller?.bank?.upi || row.seller?.bank?.accountNumber || "No bank details"} · {row.status}
          </p>
          {row.status === "pending" ? (
            <div className="mt-3 flex gap-2">
              <button type="button" className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground" onClick={() => resolve(row._id, "paid")}>
                Mark paid
              </button>
              <button type="button" className="rounded-md border px-3 py-1.5 text-sm" onClick={() => resolve(row._id, "rejected")}>
                Reject
              </button>
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
