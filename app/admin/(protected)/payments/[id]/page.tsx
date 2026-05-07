import PaymentDetailClient from "./PaymentDetailClient";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <PaymentDetailClient paymentId={id} />;
}
