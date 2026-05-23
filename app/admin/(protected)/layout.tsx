import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import AdminShell from "./provider";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/admin/login");
  }

  const role = session.user?.role;
  if (role === "driver") {
    redirect("/driver/deliveries");
  }

  return <AdminShell session={session}>{children}</AdminShell>;
}
