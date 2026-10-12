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
      <div className="vadi-console flex h-screen overflow-hidden bg-[#F7F8FA] text-[#1F2937]">
        <Sidebar open={open} setOpen={setOpen} />
        <div className="flex min-w-0 flex-1 flex-col">
          <Header setOpen={setOpen} />
          <main className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden px-4 py-5 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-[1440px]">{children}</div>
          </main>
        </div>
      </div>
    </SessionProvider>
  );
}
