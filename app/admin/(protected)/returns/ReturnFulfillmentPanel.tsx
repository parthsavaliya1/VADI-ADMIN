"use client";
import { useCallback, useEffect, useRef, useState } from 'react';
import API from '@/lib/api';
type Staff = { _id: string; name?: string; phone?: string; isActive?: boolean; isDemo?: boolean };
type Tracking = { stage: string; label: string; version: number; pickupDriver?: { name?: string; phone?: string }; deliveryDriver?: { name?: string; phone?: string }; inspectionNote?: string; replacement?: { reference: string; items: { productName: string; quantity: number }[] }; history?: { stage: string; at: string; note?: string }[] };
export default function ReturnFulfillmentPanel({ orderId, onStageChange }: { orderId: string; onStageChange?: (stage: string) => void }) {
  const [tracking, setTracking] = useState<Tracking | null>(null), [staff, setStaff] = useState<Staff[]>([]);
  const [driverId, setDriverId] = useState(''), [note, setNote] = useState(''), [restock, setRestock] = useState(false);
  const [error, setError] = useState(''), [busy, setBusy] = useState(false);
  const guard = useRef(false);
  const stageListener = useRef(onStageChange); stageListener.current = onStageChange;
  const load = useCallback(async () => {
    if (guard.current) return;
    try { const { data } = await API.get(`/after-sales/${orderId}`); if (!data.success) throw Error(); setTracking(data.data); if (data.data?.stage) stageListener.current?.(data.data.stage); setError(''); }
    catch { setError('Could not load return tracking. Refresh to retry.'); }
  }, [orderId]);
  useEffect(() => { void load(); const refresh = () => { if (!document.hidden) void load(); }; const timer = setInterval(refresh, 10000); return () => clearInterval(timer); }, [load]);
  useEffect(() => { let live = true; API.get('/api/admin/drivers').then(({ data }) => { if (live && data.success) setStaff(data.data.filter((person: Staff) => person.isActive && !person.isDemo)); }).catch(() => { if (live) setError('Could not load staff. Refresh to retry.'); }); return () => { live = false; }; }, []);
  const act = async (action: string) => {
    if (!tracking || guard.current) return;
    guard.current = true; setBusy(true); setError('');
    try { const { data } = await API.post(`/after-sales/${orderId}/action`, { action, version: tracking.version, driverId, note, restock }); if (!data.success) throw Error(); setTracking(data.data); if (data.data?.stage) stageListener.current?.(data.data.stage); setDriverId(''); }
    catch (failure: unknown) { setError((failure as { response?: { data?: { message?: string } } }).response?.data?.message || 'Could not update return. Refresh and retry.'); }
    finally { guard.current = false; setBusy(false); }
  };
  const stage = tracking?.stage;
  const assignment = ['pickup_pending', 'pickup_assigned', 'replacement_ready', 'out_for_delivery'].includes(stage || '');
  const button = 'rounded-lg border px-3 py-2 text-sm font-semibold disabled:opacity-50';
  return <section className="rounded-xl border border-primary/30 p-4 space-y-3" aria-label="Return pickup and replacement">
    <div className="flex justify-between gap-2"><h3 className="font-semibold">Pickup & replacement tracking</h3><button disabled={busy} onClick={() => void load()} className="text-sm underline">Refresh</button></div>
    {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
    {tracking && <><p role="status" className="font-medium">{tracking.label}</p>
      <p className="text-sm">Pickup staff: {tracking.pickupDriver?.name || 'Unassigned'} {tracking.pickupDriver?.phone}</p>
      {tracking.replacement && <div className="rounded-lg bg-muted p-3 text-sm"><p className="font-semibold">Replacement {tracking.replacement.reference} · ₹0 payable</p>{tracking.replacement.items.map((item, i) => <p key={i}>{item.productName} · Qty {item.quantity}</p>)}<p>Delivery staff: {tracking.deliveryDriver?.name || 'Unassigned'} {tracking.deliveryDriver?.phone}</p></div>}
      {assignment && <div className="flex flex-wrap gap-2"><select aria-label="Return staff" disabled={busy} value={driverId} onChange={event => setDriverId(event.target.value)} className="rounded-lg border bg-background p-2"><option value="">Choose staff</option>{staff.map(person => <option key={person._id} value={person._id}>{person.name} · {person.phone}</option>)}</select><button disabled={busy || !driverId} onClick={() => void act(['pickup_pending', 'pickup_assigned'].includes(stage!) ? 'assign_pickup' : 'assign_delivery')} className={button}>{['pickup_pending', 'pickup_assigned'].includes(stage!) ? 'Assign / reassign pickup' : 'Assign / reassign replacement delivery'}</button><p className="w-full text-xs text-muted-foreground">Reassigning generates a new customer confirmation code.</p></div>}
      {stage === 'pickup_assigned' && <p className="text-sm">Staff confirms collection using the pickup code on the customer’s tracking screen.</p>}
      {stage === 'collected' && <button disabled={busy} onClick={() => void act('receive')} className={button}>Confirm goods received at VADI</button>}
      {stage === 'received' && <><p className="text-sm font-semibold">Next: inspect the received goods. Complete inspection to enable replacement packing.</p><label className="block text-sm">Inspection result<textarea disabled={busy} maxLength={1000} value={note} onChange={event => setNote(event.target.value)} className="mt-1 block w-full rounded-lg border bg-background p-2" placeholder="Condition of goods and inspection result" /></label><label className="flex gap-2 text-sm"><input type="checkbox" disabled={busy} checked={restock} onChange={event => setRestock(event.target.checked)} />Goods are suitable for resale — restock returned quantities</label><p className="text-xs text-muted-foreground">Leave unchecked for damaged or unsuitable goods.</p><button disabled={busy || note.trim().length < 5} onClick={() => void act('inspect')} className={button}>Complete inspection</button></>}
      {stage === 'inspected' && <button disabled={busy} onClick={() => void act('pack_replacement')} className={button}>Reserve stock & pack replacement</button>}
      {stage === 'out_for_delivery' && <p className="text-sm">No cash to collect. Staff verifies the replacement delivery code when handing over the package.</p>}
      {!!tracking.inspectionNote && <p className="text-sm">Inspection: {tracking.inspectionNote}</p>}
      <ol className="space-y-1 text-xs text-muted-foreground">{tracking.history?.map((event, i) => <li key={i}>{event.stage.replaceAll('_', ' ')} · {new Date(event.at).toLocaleString('en-IN')}</li>)}</ol>
    </>}
  </section>;
}
