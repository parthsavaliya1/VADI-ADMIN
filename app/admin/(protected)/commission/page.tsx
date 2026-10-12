"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";
import API from "@/lib/api";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";

type SellerRow = {
  _id: string;
  name: string;
  phone?: string;
  status?: string;
  commissionPercent: number | null;
  effectivePercent: number;
  gross: number;
  commission: number;
  sellerPayout: number;
  orders: number;
};

type Report = {
  defaultCommissionPercent: number;
  deliveryFee: number;
  freeDeliveryAbove: number;
  driverFeeMode: "flat" | "percent_of_delivery" | "percent_of_order";
  driverFeeValue: number;
  totals: {
    gross: number;
    commission: number;
    sellerPayout: number;
    orders: number;
    deliveryFee: number;
    driverPayout: number;
  };
  sellers: SellerRow[];
};

const rupee = (value: number) =>
  `₹${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

export default function CommissionPage() {
  const [report, setReport] = useState<Report | null>(null);
  const [defaultPercent, setDefaultPercent] = useState("10");
  const [deliveryFee, setDeliveryFee] = useState("40");
  const [freeDeliveryAbove, setFreeDeliveryAbove] = useState("500");
  const [driverFeeMode, setDriverFeeMode] = useState<
    "flat" | "percent_of_delivery" | "percent_of_order"
  >("flat");
  const [driverFeeValue, setDriverFeeValue] = useState("30");
  const [overrides, setOverrides] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [savingDefault, setSavingDefault] = useState(false);
  const [savingId, setSavingId] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await API.get("/api/admin/commission-report");
      if (!data?.success) throw new Error(data?.message);
      setReport(data.data);
      setDefaultPercent(String(data.data.defaultCommissionPercent ?? 10));
      setDeliveryFee(String(data.data.deliveryFee ?? 40));
      setFreeDeliveryAbove(String(data.data.freeDeliveryAbove ?? 500));
      setDriverFeeMode(data.data.driverFeeMode || "flat");
      setDriverFeeValue(String(data.data.driverFeeValue ?? 30));
      const next: Record<string, string> = {};
      for (const seller of data.data.sellers || []) {
        next[seller._id] =
          seller.commissionPercent === null || seller.commissionPercent === undefined
            ? ""
            : String(seller.commissionPercent);
      }
      setOverrides(next);
    } catch (error) {
      console.error(error);
      setReport(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const saveDefault = async () => {
    const percent = Number(defaultPercent);
    const fee = Number(deliveryFee);
    const freeAbove = Number(freeDeliveryAbove);
    const driverValue = Number(driverFeeValue);
    if (!Number.isFinite(percent) || percent < 0 || percent > 100) {
      alert("Enter a commission from 0 to 100");
      return;
    }
    if (!Number.isFinite(fee) || fee < 0) {
      alert("Enter a delivery fee of 0 or more");
      return;
    }
    if (!Number.isFinite(freeAbove) || freeAbove < 0) {
      alert("Enter a free-delivery amount of 0 or more. Use 0 to turn free delivery off.");
      return;
    }
    if (!Number.isFinite(driverValue) || driverValue < 0 || (driverFeeMode !== "flat" && driverValue > 100)) {
      alert(driverFeeMode === "flat" ? "Enter a driver fee of 0 or more" : "Enter a driver percent from 0 to 100");
      return;
    }
    setSavingDefault(true);
    try {
      const { data } = await API.put("/api/admin/commission-settings", {
        defaultCommissionPercent: percent,
        deliveryFee: fee,
        freeDeliveryAbove: freeAbove,
        driverFeeMode,
        driverFeeValue: driverValue,
      });
      if (!data?.success) throw new Error(data?.message);
      await load();
    } catch (error: any) {
      alert(error?.response?.data?.message || "Could not save commission");
    } finally {
      setSavingDefault(false);
    }
  };

  const saveSeller = async (sellerId: string) => {
    const raw = overrides[sellerId] ?? "";
    const payload =
      raw.trim() === "" ? { commissionPercent: null } : { commissionPercent: Number(raw) };
    if (payload.commissionPercent !== null && !Number.isFinite(payload.commissionPercent)) {
      alert("Enter a commission from 0 to 100, or leave blank to use the default");
      return;
    }
    setSavingId(sellerId);
    try {
      const { data } = await API.put(`/api/admin/sellers/${sellerId}/commission`, payload);
      if (!data?.success) throw new Error(data?.message);
      await load();
    } catch (error: any) {
      alert(error?.response?.data?.message || "Could not update this seller");
    } finally {
      setSavingId("");
    }
  };

  if (loading && !report) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#B56A45]" />
      </div>
    );
  }

  const totals = report?.totals;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Payment rules</h1>
        <p className="mt-1 max-w-3xl text-sm text-[#6B7280]">
          These rules apply to new orders. A paid order keeps the commission, delivery fee, and
          driver amount from the moment it was placed, so later changes do not rewrite old orders.
          Seller commission is taken from the product total. The delivery fee is charged to the
          customer. The driver amount is what that delivery should pay the driver.
        </p>
      </div>

      <div className="max-w-3xl space-y-5 rounded-xl border border-[#E5E7EB] bg-white p-5">
        <div>
          <Label htmlFor="default-commission">Seller commission (%)</Label>
          <p className="mt-1 text-xs text-[#6B7280]">
            Default for every seller who does not have their own rate. 10 means the seller keeps 90% of the product price.
          </p>
          <Input
            id="default-commission"
            className="mt-3 max-w-xs"
            type="number"
            min={0}
            max={100}
            step="0.1"
            value={defaultPercent}
            onChange={(e) => setDefaultPercent(e.target.value)}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="delivery-fee">Customer delivery fee (₹)</Label>
            <p className="mt-1 text-xs text-[#6B7280]">Charged on checkout unless the order is free.</p>
            <Input
              id="delivery-fee"
              className="mt-3"
              type="number"
              min={0}
              step="1"
              value={deliveryFee}
              onChange={(e) => setDeliveryFee(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="free-above">Free delivery above (₹)</Label>
            <p className="mt-1 text-xs text-[#6B7280]">Use 0 if delivery is never free.</p>
            <Input
              id="free-above"
              className="mt-3"
              type="number"
              min={0}
              step="1"
              value={freeDeliveryAbove}
              onChange={(e) => setFreeDeliveryAbove(e.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="driver-mode">Driver fee</Label>
            <p className="mt-1 text-xs text-[#6B7280]">
              A flat amount is still paid when the customer gets free delivery.
            </p>
            <select
              id="driver-mode"
              className="mt-3 h-10 w-full rounded-md border border-[#E5E7EB] bg-white px-3 text-sm"
              value={driverFeeMode}
              onChange={(e) =>
                setDriverFeeMode(e.target.value as "flat" | "percent_of_delivery" | "percent_of_order")
              }
            >
              <option value="flat">Flat amount per order (₹)</option>
              <option value="percent_of_delivery">Percent of the delivery fee</option>
              <option value="percent_of_order">Percent of the product total</option>
            </select>
          </div>
          <div>
            <Label htmlFor="driver-value">
              {driverFeeMode === "flat" ? "Driver amount (₹)" : "Driver percent (%)"}
            </Label>
            <p className="mt-1 text-xs text-[#6B7280]">Saved on each new order as the driver payout.</p>
            <Input
              id="driver-value"
              className="mt-3"
              type="number"
              min={0}
              max={driverFeeMode === "flat" ? undefined : 100}
              step="0.1"
              value={driverFeeValue}
              onChange={(e) => setDriverFeeValue(e.target.value)}
            />
          </div>
        </div>

        <Button type="button" onClick={saveDefault} disabled={savingDefault} className="gap-2">
          <Save className="h-4 w-4" />
          {savingDefault ? "Saving…" : "Save rules"}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {[
          { label: "Product sales", value: rupee(totals?.gross || 0) },
          { label: "Platform commission", value: rupee(totals?.commission || 0) },
          { label: "Paid to sellers", value: rupee(totals?.sellerPayout || 0) },
          { label: "Delivery fees", value: rupee(totals?.deliveryFee || 0) },
          { label: "Driver payouts", value: rupee(totals?.driverPayout || 0) },
        ].map((card) => (
          <div key={card.label} className="rounded-xl border border-[#E5E7EB] bg-white p-5">
            <p className="text-[13px] font-medium text-[#6B7280]">{card.label}</p>
            <p className="mt-3 text-2xl font-semibold text-[#1F2937]">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Seller</TableHead>
              <TableHead>Rate (%)</TableHead>
              <TableHead>Orders</TableHead>
              <TableHead>Product sales</TableHead>
              <TableHead>Commission</TableHead>
              <TableHead>Seller receives</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {(report?.sellers || []).length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-[#6B7280]">
                  No sellers yet.
                </TableCell>
              </TableRow>
            ) : (
              (report?.sellers || []).map((seller) => (
                <TableRow key={seller._id}>
                  <TableCell>
                    <div className="font-medium">{seller.name}</div>
                    <div className="text-xs text-[#6B7280]">{seller.phone || seller.status}</div>
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      step="0.1"
                      className="w-24"
                      placeholder={String(report?.defaultCommissionPercent ?? 10)}
                      value={overrides[seller._id] ?? ""}
                      onChange={(e) =>
                        setOverrides((prev) => ({ ...prev, [seller._id]: e.target.value }))
                      }
                    />
                    <p className="mt-1 text-[11px] text-[#6B7280]">
                      Using {seller.effectivePercent}%
                    </p>
                  </TableCell>
                  <TableCell>{seller.orders}</TableCell>
                  <TableCell>{rupee(seller.gross)}</TableCell>
                  <TableCell>{rupee(seller.commission)}</TableCell>
                  <TableCell>{rupee(seller.sellerPayout)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={savingId === seller._id}
                      onClick={() => saveSeller(seller._id)}
                    >
                      {savingId === seller._id ? "Saving…" : "Save rate"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
