import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const BACKEND_URL =
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "https://vadi-backend.onrender.com";

type AuthUser = {
  id: string;
  role: "admin" | "driver";
  accessToken?: string;
  email?: string;
  name?: string;
  phone?: string;
};

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "admin-credentials",
      name: "Admin",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const res = await fetch(`${BACKEND_URL}/api/admin/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: credentials?.email,
            password: credentials?.password,
          }),
        });

        const data = await res.json();
        if (!res.ok) return null;

        return {
          id: "admin",
          role: "admin",
          email: credentials?.email ?? undefined,
          name: "Admin",
          accessToken: data.token,
        } satisfies AuthUser;
      },
    }),
    CredentialsProvider({
      id: "driver-credentials",
      name: "Driver",
      credentials: {
        phone: { label: "Phone", type: "text" },
        otp: { label: "OTP", type: "text" },
      },
      async authorize(credentials) {
        const res = await fetch(`${BACKEND_URL}/api/driver/verify-otp`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone: credentials?.phone,
            otp: credentials?.otp,
          }),
        });
        const data = await res.json();
        if (!res.ok || !data.success || !data.token || !data.driver) {
          return null;
        }
        return {
          id: String(data.driver.id),
          role: "driver",
          phone: data.driver.phone,
          name: data.driver.name || "Driver",
          accessToken: data.token,
        } satisfies AuthUser;
      },
    }),
  ],

  pages: {
    signIn: "/admin/login",
  },

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const authUser = user as AuthUser;
        token.id = authUser.id;
        token.role = authUser.role;
        token.accessToken = authUser.accessToken;
        token.email = authUser.email;
        token.name = authUser.name;
        token.phone = authUser.phone;
      }
      if (!token.role && token.id === "admin") {
        token.role = "admin";
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "admin" | "driver";
        session.user.name = (token.name as string) || session.user.name || "";
        session.user.email =
          (token.email as string) ||
          (token.role === "driver" ? (token.phone as string) : "") ||
          "";
        session.user.phone = token.phone as string | undefined;
      }
      session.accessToken = token.accessToken as string;
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
