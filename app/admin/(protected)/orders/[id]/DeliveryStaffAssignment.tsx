"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Truck } from "lucide-react";
import API from "@/lib/api";

export type DeliveryStaff = { _id: string; name?: string; phone?: string; isActive?: boolean; isDemo?: boolean };

export default function DeliveryStaffAssignment({ orderId, status, assignedDriver, disabled, onAssigned, onBusyChange }: {
  orderId: string;
  status: string;
  assignedDriver?: DeliveryStaff | string | null;
  disabled: boolean;
  onAssigned: (driver: DeliveryStaff) => void;
  onBusyChange: (busy: boolean) => void;
}) {
  const currentId = typeof assignedDriver === "string" ? assignedDriver : assignedDriver?._id || "";
  const [staff, setStaff] = useState<DeliveryStaff[]>([]);
  const [selectedId, setSelectedId] = useState(currentId);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const closed = ["delivered", "cancelled", "returned"].includes(status);
  const currentStaff = typeof assignedDriver === "object" && assignedDriver ? assignedDriver : staff.find(person => person._id === currentId);

  const loadStaff = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await API.get<{ success: boolean; data: DeliveryStaff[] }>("/api/admin/drivers");
      if (!data.success || !Array.isArray(data.data)) throw new Error("Invalid staff response");
      setStaff(data.data.filter(person => person.isActive && !person.isDemo));
    } catch {
      setError("Could not load delivery staff. Please try again.");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { if (!closed) void loadStaff(); }, [closed, loadStaff]);

  const saveAssignment = async () => {
    if (!selectedId || saving || disabled || closed) return;
    setSaving(true); onBusyChange(true); setError(""); setMessage("");
    try {
      const { data } = await API.put<{ success: boolean; message?: string; data: { assignedDriver: DeliveryStaff } }>(
        `/api/admin/orders/${orderId}/assign`, { driverId: selectedId, currentDriverId: currentId || null },
      );
      if (!data.success || !data.data?.assignedDriver) throw new Error("Assignment failed");
      onAssigned(data.data.assignedDriver);
      setMessage("Delivery staff assignment saved.");
    } catch (failure: unknown) {
      const apiMessage = (failure as { response?: { data?: { message?: string } } }).response?.data?.message;
      setError(apiMessage || "Could not assign staff. Please try again.");
    } finally { setSaving(false); onBusyChange(false); }
  };

  return <section className="bg-card rounded-xl shadow-sm border p-6" aria-labelledby="delivery-staff-heading">
    <h2 id="delivery-staff-heading" className="text-lg font-semibold mb-3 flex items-center gap-2"><Truck className="h-5 w-5" />Delivery staff</h2>
    <p className="text-sm mb-1">{currentId ? currentStaff?.name || currentStaff?.phone || "Staff assigned" : "No staff assigned"}</p>
    {currentStaff?.phone && <p className="text-sm text-muted-foreground mb-3">{currentStaff.phone}</p>}
    {closed ? <p className="text-sm text-muted-foreground">Assignments cannot be changed on a closed order.</p> : <>
      <p className="text-sm text-muted-foreground mb-4">Choose an active staff member to deliver this order. You can reassign it while the order is open.</p>
      <label htmlFor="delivery-staff" className="block text-sm font-medium mb-2">Assign to</label>
      <select id="delivery-staff" value={selectedId} onChange={event => { setSelectedId(event.target.value); setMessage(""); }}
        disabled={loading || saving || disabled} className="w-full rounded-lg border bg-background p-2.5 text-sm disabled:opacity-50">
        <option value="">{loading ? "Loading staff…" : "Choose staff"}</option>
        {currentId && !staff.some(person => person._id === currentId) && <option value={currentId} disabled>{currentStaff?.name || currentStaff?.phone || "Current staff"} (unavailable)</option>}
        {staff.map(person => <option key={person._id} value={person._id}>{person.name ? `${person.name} · ${person.phone || ""}` : person.phone}</option>)}
      </select>
      {!loading && !error && staff.length === 0 && <p className="mt-2 text-sm text-muted-foreground">No active delivery staff. Add or activate someone under Staff.</p>}
      <button type="button" onClick={() => void saveAssignment()} disabled={loading || saving || disabled || !selectedId || selectedId === currentId}
        className="mt-3 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">
        {saving && <Loader2 className="h-4 w-4 animate-spin" />}{saving ? "Saving…" : currentId ? "Save assignment" : "Assign staff"}
      </button>
      <Link href="/admin/drivers" className="block mt-3 text-sm text-primary underline">Manage staff</Link>
    </>}
    {error && <div role="alert" className="mt-3 text-sm text-red-700">{error}{!closed && <button type="button" onClick={() => void loadStaff()} disabled={loading || saving || disabled} className="ml-2 underline disabled:opacity-50">Reload staff</button>}</div>}
    {message && <p role="status" className="mt-3 text-sm text-green-700">{message}</p>}
  </section>;
}
