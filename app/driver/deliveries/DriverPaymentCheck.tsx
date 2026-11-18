"use client";
import API from '@/lib/api';
import { useCallback, useEffect, useRef, useState } from 'react';

export type PaymentSummary = { orderId: string; amount: number; orderNumber?: string; method: string; status: string; onlinePending: boolean; cashReserved: boolean; message: string };
type Summary = PaymentSummary;
type Choice = 'cash' | 'online';
export default function DriverPaymentCheck({ orderRef, admin = false, onPaymentChecked }: { orderRef: string; admin?: boolean; onPaymentChecked?: (summary: PaymentSummary) => void }) {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [choice, setChoice] = useState<Choice | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const inFlight = useRef(false);
  const check = useCallback(async (action = 'check', nextChoice?: Choice) => {
    if (!orderRef.trim() || inFlight.current) return;
    inFlight.current = true; setBusy(true); setError('');
    try {
      const ref = encodeURIComponent(orderRef.trim().replace(/^#/, ''));
      const endpoint = admin ? `/api/admin/orders/${ref}/cash-collection` : `/api/driver/orders/${ref}/payment`;
      const { data } = await API.post(endpoint, { action });
      if (!data.success) throw Error('Payment check failed');
      const result: Summary = data.data;
      setSummary(result);
      onPaymentChecked?.(result);
      setChoice(current => nextChoice || (result.onlinePending ? 'online' : result.cashReserved ? 'cash' : current));
    } catch (failure: unknown) {
      setError((failure as { response?: { data?: { message?: string } } }).response?.data?.message || 'Could not check payment');
    } finally { inFlight.current = false; setBusy(false); }
  }, [orderRef, admin, onPaymentChecked]);

  useEffect(() => {
    const timer = setTimeout(() => { if (orderRef.trim().length >= 3) void check(); }, 300);
    return () => clearTimeout(timer);
  }, [check, orderRef]);

  const chooseOnline = () => {
    if (busy || !summary) return;
    if (summary.cashReserved) {
      if (confirm('Has no cash been collected? Switching to online will release cash collection so the customer can pay in the VADI app.')) void check('release', 'online');
    } else setChoice('online');
  };
  const unpaidCod = summary?.method === 'cod' && summary.status === 'pending';
  return <section className="rounded-xl border bg-muted/30 p-4 text-sm space-y-3" aria-label="Payment collection method">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h3 className="font-semibold">Payment method</h3>
      <button type="button" disabled={busy || !orderRef.trim()} onClick={() => void check()} className="text-primary underline disabled:opacity-50">{busy ? 'Checking…' : 'Refresh payment'}</button>
    </div>
    {!summary && <p className="text-muted-foreground">{busy ? 'Loading available payment methods…' : 'Enter an order number to load payment methods.'}</p>}
    {summary && <>
      <p role="status" className="font-medium">{summary.message}</p>
      {unpaidCod && <>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2" role="group" aria-label="Choose how the customer will pay">
          <button type="button" aria-pressed={choice === 'cash'} disabled={busy || summary.onlinePending}
            onClick={() => { if (summary.cashReserved) setChoice('cash'); else void check('prepare', 'cash'); }}
            className={`rounded-lg border p-3 text-left disabled:opacity-50 ${choice === 'cash' ? 'border-primary bg-primary/10' : 'bg-background'}`}>
            <span className="block font-semibold">Cash on delivery</span><span className="text-xs text-muted-foreground">Collect ₹{summary.amount.toLocaleString('en-IN')} in cash</span>
          </button>
          <button type="button" aria-pressed={choice === 'online'} disabled={busy} onClick={chooseOnline}
            className={`rounded-lg border p-3 text-left disabled:opacity-50 ${choice === 'online' ? 'border-primary bg-primary/10' : 'bg-background'}`}>
            <span className="block font-semibold">Online payment</span><span className="text-xs text-muted-foreground">Customer pays by UPI / card in the VADI app</span>
          </button>
        </div>
        {choice === 'cash' && summary.cashReserved && <p className="text-muted-foreground">Cash collection is reserved. Collect the cash, then verify the customer code. To switch methods before taking cash, choose Online payment.</p>}
        {choice === 'online' && !summary.cashReserved && <div className="rounded-lg border bg-background p-3 space-y-2">
          <p className="font-semibold">Ask the customer to pay in their VADI app</p>
          <ol className="list-decimal pl-5 space-y-1 text-muted-foreground">
            <li>Open My Orders or Order Tracking for {summary.orderNumber ? `#${summary.orderNumber}` : 'this order'}.</li>
            <li>Tap Pay online, then select UPI or card in Razorpay.</li>
            <li>After payment, refresh here. Confirm delivery only after it shows Paid online.</li>
          </ol>
          <p className="text-xs text-muted-foreground">Choosing Online here does not mark the order paid. Payment methods open on the customer’s phone.</p>
          <button type="button" disabled={busy} onClick={() => void check()} className="rounded-lg bg-primary px-3 py-2 font-medium text-primary-foreground disabled:opacity-50">Check online payment received</button>
        </div>}
      </>}
    </>}
    {error && <p role="alert" className="text-red-700">{error}</p>}
  </section>;
}
