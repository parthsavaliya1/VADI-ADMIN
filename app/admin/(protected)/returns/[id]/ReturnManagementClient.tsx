"use client";

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import API from '@/lib/api';
import { returnStageLabel, type AdminReturnSummary } from '@/lib/returnStage';
import ReturnFulfillmentPanel from '../ReturnFulfillmentPanel';

type ReturnOrder = {
  _id: string; orderNumber: string;
  returnRequest?: AdminReturnSummary & { reason?: string };
};

export default function ReturnManagementClient({ orderId }: { orderId: string }) {
  const [order, setOrder] = useState<ReturnOrder | null>(null);
  const [loading, setLoading] = useState(true), [error, setError] = useState('');
  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const { data } = await API.get(`/api/admin/orders/${orderId}`);
      const value = data.data?.order ?? data.data;
      if (!data.success || !value?._id) throw Error();
      setOrder(value);
    } catch { setError('Could not load this return. Please retry.'); }
    finally { setLoading(false); }
  }, [orderId]);
  useEffect(() => { void load(); }, [load]);
  const replacement = order?.returnRequest?.items?.some(item => item.action === 'replace');
  return <div className="mx-auto w-full max-w-4xl space-y-5">
    <Link href={`/admin/orders/${orderId}`} className="inline-flex items-center gap-2 text-sm text-primary underline"><ArrowLeft size={16} />Back to order</Link>
    <header className="space-y-2"><h1 className="text-2xl font-bold">{replacement ? 'Manage replacement' : 'Manage return'}</h1><p className="text-sm text-muted-foreground">{order?.orderNumber || 'Loading order…'}</p></header>
    {loading ? <div role="status" className="flex items-center gap-2 p-4 text-sm"><Loader2 className="h-4 w-4 animate-spin" />Loading return controls…</div>
      : error ? <div role="alert" className="rounded-xl border p-4 text-sm text-red-700">{error}<button onClick={() => void load()} className="ml-3 underline">Retry</button></div>
      : order?.returnRequest?.status ? <>
        <section className="rounded-xl border bg-card p-5 space-y-2"><p className="font-semibold">{returnStageLabel(order.returnRequest)}</p>{order.returnRequest.reason && <p className="text-sm">Reason: {order.returnRequest.reason}</p>}{replacement && <p className="text-sm text-muted-foreground">Receive and inspect the old product, reserve replacement stock, then assign delivery staff. The customer pays ₹0 for the replacement.</p>}</section>
        {order.returnRequest.status === 'approved' ? <ReturnFulfillmentPanel orderId={orderId} onStageChange={stage => setOrder(current => current?.returnRequest ? { ...current, returnRequest: { ...current.returnRequest, fulfillment: { ...current.returnRequest.fulfillment, stage } } } : current)} />
          : <Link href={`/admin/returns?orderId=${encodeURIComponent(orderId)}`} className="inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Review return request</Link>}
      </> : <p className="rounded-xl border p-5 text-sm">This order has no return request.</p>}
  </div>;
}
