import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    role: "admin" | "driver" | "seller";
    accessToken?: string;
    phone?: string;
    userId?: string;
  }

  interface Session {
    accessToken?: string;
    user: DefaultSession["user"] & {
      id: string;
      role: "admin" | "driver" | "seller";
      phone?: string;
      userId?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: "admin" | "driver" | "seller";
    userId?: string;
    accessToken?: string;
    phone?: string;
  }
}

export {};
