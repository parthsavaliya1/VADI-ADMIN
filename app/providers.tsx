"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import ThemeLoader from "./ThemeLoader";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <ThemeLoader />
      {children}
    </SessionProvider>
  );
}
