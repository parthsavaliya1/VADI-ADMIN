import { returnStageLabel, type AdminReturnSummary } from "@/lib/returnStage";
import Link from 'next/link';
export type ReturnRequestSummary = {
  fulfillment?: AdminReturnSummary['fulfillment'];
  status?: string; reason?: string; requestedAt?: string; refundStatus?: string; refundAmount?: number; refundedTo?: string;
  items?: { productName?: string; quantity: number; action: string }[];
  refundOperation?: { gatewayRefundId?: string; error?: string };
};
export type ReturnRefundPreview = { amount?: number; destination?: string; error?: string };
export default function ReturnRequestPanel({ orderId, request, preview }: { orderId: string; request?: ReturnRequestSummary; preview?: ReturnRefundPreview }) {
  if (!request?.status) return null;
  const active = ['pending', 'processing'].includes(request.status);
  return <section className="rounded-xl border border-amber-300 bg-card p-6 space-y-3" aria-label="Customer return request">
    <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-lg font-semibold">Customer return request</h2><span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold capitalize text-amber-900">{returnStageLabel(request) || request.status}</span></div>
    {request.requestedAt && <p className="text-xs text-muted-foreground">Requested {new Date(request.requestedAt).toLocaleString('en-IN')}</p>}
    {request.reason && <p className="text-sm"><strong>Reason:</strong> {request.reason}</p>}
    {request.items?.length ? <ul className="space-y-1 text-sm">{request.items.map((item, index) => <li key={index}>{item.productName || 'Order item'} · Qty {item.quantity} · <span className="capitalize">{item.action}</span></li>)}</ul> : <p className="text-sm text-muted-foreground">Review the selected items in Returns.</p>}
    {active && preview && !preview.error && <p className="text-sm">Refund on approval: ₹{(preview.amount || 0).toFixed(2)}{preview.destination === 'original' ? ' to the original payment method' : preview.destination === 'wallet' ? ' to VADI wallet' : request.items?.length && request.items.every(item => item.action === 'replace') ? ' · Replacement requested; no money refund' : ' · Payment not recorded as collected'}.</p>}
    {request.refundedTo && request.refundedTo !== 'none' && <p className="text-sm">Refund recorded: ₹{request.refundAmount || 0} · {request.refundedTo === 'original' ? 'Original payment method' : 'VADI wallet'}</p>}
    {request.refundOperation?.gatewayRefundId && <p className="text-xs text-muted-foreground">Refund reference: {request.refundOperation.gatewayRefundId}</p>}
    <Link href={request.status === "approved" ? `/admin/returns/${encodeURIComponent(orderId)}` : `/admin/returns?orderId=${encodeURIComponent(orderId)}`} className="inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">{active ? 'Review return / approve refund' : 'View return details'}</Link>
  </section>;
}
