"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import API from "@/lib/api";

type Row = {
  _id: string;
  orderNumber?: string;
  gross: number;
  commissionPercent: number;
  commissionAmount: number;
  sellerAmount: number;
  status: "credited" | "reversed";
  paidAt?: string;
  createdAt: string;
};

const rupee = (value: number) =>
  `₹${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

export default function SellerEarningsPage() {
  const { data: session } = useSession();
  const sellerId = session?.user?.role === "seller" ? session.user.id : "";
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [upi, setUpi] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [amount, setAmount] = useState("");

  useEffect(() => {
    if (!sellerId) return;
    API.get("/sellers/me/earnings", { params: { sellerId } })
      .then(({ data }) => setRows(data?.data || []))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
    API.get("/sellers/me/payouts", { params: { sellerId } })
      .then(({ data }) => {
        const bank = data?.bank || {};
        setUpi(bank.upi || "");
        setAccountName(bank.accountName || "");
        setAccountNumber(bank.accountNumber || "");
        setIfsc(bank.ifsc || "");
      })
      .catch(() => undefined);
  }, [sellerId]);

  const credited = rows.filter((row) => row.status === "credited");
  const earnings = credited.reduce((sum, row) => sum + Number(row.sellerAmount || 0), 0);
  const commission = credited.reduce((sum, row) => sum + Number(row.commissionAmount || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Earnings</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Each paid order for your products is split here. You receive the product total minus the
          commission set by admin. Delivery charges are not part of your earnings.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">You receive</p>
          <p className="mt-2 text-2xl font-semibold">{rupee(earnings)}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">Commission kept by platform</p>
          <p className="mt-2 text-2xl font-semibold">{rupee(commission)}</p>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading earnings…</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No paid orders yet. Earnings appear after the customer payment succeeds.</p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-background text-left text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Product sales</th>
                <th className="px-4 py-3 font-medium">Commission</th>
                <th className="px-4 py-3 font-medium">You receive</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row._id} className="border-t border-border">
                  <td className="px-4 py-3">
                    <div className="font-medium">#{row.orderNumber || "Order"}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(row.paidAt || row.createdAt).toLocaleString("en-IN")}
                    </div>
                  </td>
                  <td className="px-4 py-3">{rupee(row.gross)}</td>
                  <td className="px-4 py-3">
                    {rupee(row.commissionAmount)} ({row.commissionPercent}%)
                  </td>
                  <td className="px-4 py-3">{rupee(row.sellerAmount)}</td>
                  <td className="px-4 py-3 capitalize">{row.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="rounded-xl border border-border bg-card p-5 space-y-3">
        <h2 className="text-lg font-semibold">Payout</h2>
        <p className="text-sm text-muted-foreground">
          Save a bank account or UPI id, then request a payout. Admin marks it paid after the transfer.
        </p>
        <input className="w-full rounded-md border px-3 py-2" placeholder="Account name" value={accountName} onChange={(e) => setAccountName(e.target.value)} />
        <input className="w-full rounded-md border px-3 py-2" placeholder="Account number" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} />
        <input className="w-full rounded-md border px-3 py-2" placeholder="IFSC" value={ifsc} onChange={(e) => setIfsc(e.target.value)} />
        <input className="w-full rounded-md border px-3 py-2" placeholder="UPI id" value={upi} onChange={(e) => setUpi(e.target.value)} />
        <button
          type="button"
          className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground"
          onClick={async () => {
            await API.put("/sellers/me/bank", { sellerId, accountName, accountNumber, ifsc, upi });
            alert("Bank details saved");
          }}
        >
          Save bank details
        </button>
        <input className="w-full rounded-md border px-3 py-2" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
        <button
          type="button"
          className="rounded-md border px-4 py-2 text-sm"
          onClick={async () => {
            try {
              await API.post("/sellers/me/payouts", { sellerId, amount: Number(amount) });
              alert("Payout requested");
              setAmount("");
            } catch (error: any) {
              alert(error?.response?.data?.message || "Could not request payout");
            }
          }}
        >
          Request payout
        </button>
      </div>
    </div>
  );
}
