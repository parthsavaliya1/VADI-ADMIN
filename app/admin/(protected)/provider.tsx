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
      <div className="vadi-console flex h-screen overflow-hidden bg-background text-foreground">
        <Sidebar open={open} setOpen={setOpen} />
        <div className="flex w-full min-w-0 flex-1 flex-col overflow-hidden">
          <Header setOpen={setOpen} />
          <main className="box-border w-full min-w-0 flex-1 overflow-y-auto overflow-x-hidden px-4 py-4 sm:px-6 sm:py-5 lg:px-8">
            <div className="mx-auto w-full min-w-0 max-w-[1440px]">{children}</div>
          </main>
        </div>
      </div>
    </SessionProvider>
  );
}
