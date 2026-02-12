"use client";

import { SessionProvider } from "next-auth/react";
import { useState } from "react";
import Header from "../_components/Header";
import Sidebar from "../_components/Sidebar";

export default function AdminShell({
  children,
  session,
}: {
  children: React.ReactNode;
  session: any;
}) {
  const [open, setOpen] = useState(false);

  return (
    <SessionProvider session={session}>
      <div className="flex h-screen bg-muted">
        <Sidebar open={open} setOpen={setOpen} />
        <div className="flex-1 flex flex-col">
          <Header setOpen={setOpen} />
          <main className="flex-1 p-6 overflow-y-auto">
            <div className="bg-card p-6 rounded-lg shadow-sm">{children}</div>
          </main>
        </div>
      </div>
    </SessionProvider>
  );
}
