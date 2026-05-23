"use client";

import { signOut, useSession } from "next-auth/react";
import { Truck } from "lucide-react";

export default function DriverTopBar() {
  const { data } = useSession();

  return (
    <header className="border-b bg-card px-6 py-4 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <Truck className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="font-semibold truncate">My deliveries</p>
          <p className="text-xs text-muted-foreground truncate">
            {data?.user?.name}
            {data?.user?.phone ? ` · ${data.user.phone}` : ""}
          </p>
        </div>
      </div>
      <button
        type="button"
        className="text-sm font-medium text-primary hover:underline shrink-0"
        onClick={() =>
          signOut({
            callbackUrl: "/driver/login",
          })
        }
      >
        Sign out
      </button>
    </header>
  );
}
