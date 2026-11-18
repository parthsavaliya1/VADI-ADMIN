export type AdminReturnSummary = {
  status?: string;
  items?: { action?: string }[];
  fulfillment?: { stage?: string; replacement?: { reference?: string } };
};
export function returnStageLabel(request?: AdminReturnSummary): string | null {
  if (!request?.status) return null;
  if (request.status === 'pending') return 'Return requested';
  if (request.status === 'processing') return 'Refund processing';
  if (request.status === 'rejected') return 'Return rejected';
  if (request.status !== 'approved') return null;
  const replacement = request.items?.some(item => item.action === 'replace') || !!request.fulfillment?.replacement?.reference;
  const labels: Record<string, string> = {
    pickup_pending: 'Return accepted', pickup_assigned: 'Pickup scheduled', collected: 'Items collected',
    received: 'Received at VADI', inspected: 'Inspection complete', replacement_ready: 'Replacement packed',
    out_for_delivery: 'Replacement out for delivery', completed: replacement ? 'Replacement delivered' : 'Return completed',
  };
  return labels[request.fulfillment?.stage || 'pickup_pending'] || 'Return accepted';
}
