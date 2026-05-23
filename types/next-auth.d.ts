import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    role: "admin" | "driver";
    accessToken?: string;
    phone?: string;
  }

  interface Session {
    accessToken?: string;
    user: DefaultSession["user"] & {
      id: string;
      role: "admin" | "driver";
      phone?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: "admin" | "driver";
    accessToken?: string;
    phone?: string;
  }
}

export {};
