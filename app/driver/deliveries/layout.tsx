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
    <div className="vadi-console flex min-h-screen w-full max-w-full flex-col overflow-x-hidden bg-muted">
      <DriverTopBar />
      <div className="box-border w-full min-w-0 flex-1 overflow-y-auto overflow-x-hidden px-4 py-4 sm:p-6">{children}</div>
    </div>
  );
}
