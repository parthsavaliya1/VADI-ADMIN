import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import DriverTopBar from "./DriverTopBar";

/**
 * Server layout: auth checks only. Do not render SessionProvider here — it uses
 * React context and must live in a Client Component. Root `app/providers.tsx`
 * already wraps the app with SessionProvider for useSession / signOut.
 */
export default async function DriverDeliveriesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/driver/login");
  }

  if (session.user.role !== "driver") {
    redirect("/admin/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted">
      <DriverTopBar />
      <div className="flex-1 overflow-y-auto p-6">{children}</div>
    </div>
  );
}
