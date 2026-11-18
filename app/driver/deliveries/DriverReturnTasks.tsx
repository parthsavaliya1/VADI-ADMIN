"use client";
import { useCallback, useEffect, useRef, useState } from 'react';
import API from '@/lib/api';
type Task = { _id: string; orderNumber: string; address?: { name?: string; phone?: string; addressLine?: string; address?: string; city?: string; pincode?: string }; items?: { productName: string; quantity: number; action: string }[]; fulfillment: { version: number; stage: string; label: string; replacement?: { reference: string; items: { productName: string; quantity: number }[] } } };
export default function DriverReturnTasks() {
  const [tasks, setTasks] = useState<Task[]>([]), [codes, setCodes] = useState<Record<string, string>>({});
  const [error, setError] = useState(''), [busy, setBusy] = useState(''); const guard = useRef(false);
  const load = useCallback(async () => { if (guard.current) return; try { const { data } = await API.get('/after-sales/assigned'); if (!data.success) throw Error(); setTasks(data.data); setError(''); } catch { setError('Could not load return tasks. Please refresh.'); } }, []);
  useEffect(() => { void load(); const timer = setInterval(() => { if (!document.hidden) void load(); }, 10000); return () => clearInterval(timer); }, [load]);
  const confirmTask = async (task: Task) => {
    if (guard.current) return; guard.current = true; setBusy(task._id); setError('');
    try { const { data } = await API.post(`/after-sales/${task._id}/action`, { action: task.fulfillment.stage === 'pickup_assigned' ? 'collect' : 'deliver', version: task.fulfillment.version, code: codes[task._id] }); if (!data.success) throw Error(); setCodes(current => ({ ...current, [task._id]: '' })); }
    catch (failure: unknown) { setError((failure as { response?: { data?: { message?: string } } }).response?.data?.message || 'Could not confirm handover'); }
    finally { guard.current = false; setBusy(''); }
    // Keep a handover error visible while refreshing the task list.
    try { const { data } = await API.get('/after-sales/assigned'); if (data.success) setTasks(data.data); } catch { /* Retry with Refresh. */ }
  };
  return <section className="rounded-xl border bg-card p-4 space-y-3"><div className="flex justify-between gap-2"><h2 className="text-lg font-semibold">Return pickups & replacement deliveries</h2><button disabled={!!busy} onClick={() => void load()} className="text-sm underline">Refresh tasks</button></div>
    {error && <p role="alert" className="text-red-700 text-sm">{error}</p>}
    {!tasks.length && <p className="text-sm text-muted-foreground">No return tasks assigned.</p>}
    {tasks.map(task => <article key={task._id} className="rounded-lg border p-4 space-y-2"><h3 className="font-semibold">{task.orderNumber} · {task.fulfillment.label}</h3><p className="text-sm">{task.address?.name} · {task.address?.phone}</p><p className="text-sm">{task.address?.addressLine || task.address?.address} {task.address?.city} {task.address?.pincode}</p>
      {(task.fulfillment.stage === 'out_for_delivery' ? task.fulfillment.replacement?.items : task.items)?.map((item, i) => <p key={i} className="text-sm">{item.productName} · Qty {item.quantity}</p>)}
      {task.fulfillment.stage === 'collected' ? <p className="text-sm">Bring collected goods to VADI for admin receipt and inspection.</p> : <><p className="text-sm font-semibold">{task.fulfillment.stage === 'pickup_assigned' ? 'Collect the returned goods, then ask for the pickup code.' : `Replacement ${task.fulfillment.replacement?.reference || ''} — ₹0 payable. Hand over the package, then verify the delivery code.`}</p><label className="block text-sm">Customer’s 6-digit code<input aria-label={`Code for ${task.orderNumber}`} inputMode="numeric" maxLength={6} value={codes[task._id] || ''} disabled={!!busy} onChange={event => setCodes(current => ({ ...current, [task._id]: event.target.value.replace(/\D/g, '').slice(0, 6) }))} className="ml-2 rounded-lg border bg-background p-2" /></label><button disabled={!!busy || !/^\d{6}$/.test(codes[task._id] || '')} onClick={() => void confirmTask(task)} className="rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground disabled:opacity-50">{busy === task._id ? 'Verifying…' : task.fulfillment.stage === 'pickup_assigned' ? 'Verify pickup & mark collected' : 'Verify replacement delivered'}</button></>}
    </article>)}
  </section>;
}
