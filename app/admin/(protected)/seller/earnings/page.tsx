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

  useEffect(() => {
    if (!sellerId) return;
    API.get("/sellers/me/earnings", { params: { sellerId } })
      .then(({ data }) => setRows(data?.data || []))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, [sellerId]);

  const credited = rows.filter((row) => row.status === "credited");
  const earnings = credited.reduce((sum, row) => sum + Number(row.sellerAmount || 0), 0);
  const commission = credited.reduce((sum, row) => sum + Number(row.commissionAmount || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Earnings</h1>
        <p className="mt-1 max-w-2xl text-sm text-[#6B7280]">
          Each paid order for your products is split here. You receive the product total minus the
          commission set by admin. Delivery charges are not part of your earnings.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-5">
          <p className="text-sm text-[#6B7280]">You receive</p>
          <p className="mt-2 text-2xl font-semibold">{rupee(earnings)}</p>
        </div>
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-5">
          <p className="text-sm text-[#6B7280]">Commission kept by platform</p>
          <p className="mt-2 text-2xl font-semibold">{rupee(commission)}</p>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-[#6B7280]">Loading earnings…</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-[#6B7280]">No paid orders yet. Earnings appear after the customer payment succeeds.</p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white">
          <table className="w-full text-sm">
            <thead className="bg-[#F7F8FA] text-left text-[#6B7280]">
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
                <tr key={row._id} className="border-t border-[#E5E7EB]">
                  <td className="px-4 py-3">
                    <div className="font-medium">#{row.orderNumber || "Order"}</div>
                    <div className="text-xs text-[#6B7280]">
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
    </div>
  );
}
