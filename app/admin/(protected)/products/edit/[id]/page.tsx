import EditProductClient from "./EditProductClient";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  console.log("ID:", id);

  return <EditProductClient productId={id} />;
}
