"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "https://vadi-backend.onrender.com";

export default function LoginPage() {
  const [mode, setMode] = useState<"admin" | "seller">("admin");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setLoading(true);
    setError("");

    if (mode === "seller") {
      const check = await fetch(`${API_BASE}/sellers/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password }),
      });
      const body = await check.json().catch(() => ({}));
      if (!check.ok) {
        setLoading(false);
        setError(body.message || "Could not sign in");
        return;
      }
      const res = await signIn("seller-credentials", {
        phone,
        password,
        redirect: false,
      });
      setLoading(false);
      if (res?.error) setError(body.message || "Could not sign in");
      else window.location.href = "/admin/seller";
      return;
    }

    const res = await signIn("admin-credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError("Invalid email or password");
    } else {
      window.location.href = "/admin/dashboard";
    }
  };

  return (
    <div className="vadi-console flex min-h-screen items-center justify-center bg-[#F7F8FA] px-4">
      <div className="w-full max-w-md">
        {/* Logo / Heading */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">
            {mode === "seller" ? "Seller Panel" : "Admin Panel"}
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            {mode === "seller"
              ? "Sign in only after an admin approves your shop"
              : "Sign in to continue"}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4">
          <button
            type="button"
            onClick={() => { setMode("admin"); setError(""); }}
            className={`rounded-lg border py-2 text-sm font-medium ${mode === "admin" ? "border-[#B56A45] bg-[#B56A45] text-white" : "border-[#E5E7EB] bg-white text-[#1F2937]"}`}
          >
            Admin
          </button>
          <button
            type="button"
            onClick={() => { setMode("seller"); setError(""); }}
            className={`rounded-lg border py-2 text-sm font-medium ${mode === "seller" ? "border-[#B56A45] bg-[#B56A45] text-white" : "border-[#E5E7EB] bg-white text-[#1F2937]"}`}
          >
            Seller
          </button>
        </div>

        {/* Card */}
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-6 sm:p-8">
          {error && (
            <div className="mb-5 bg-destructive/10 text-destructive text-sm px-4 py-2 rounded-md">
              {error}
            </div>
          )}

          {/* Email */}
          {mode === "admin" ? (
          <div className="mb-5">
            <label className="text-sm font-medium block mb-2">Email</label>
            <input
              type="email"
              placeholder="admin@vadi.com"
              className="w-full px-4 py-2.5 rounded-md border border-input bg-background
                         placeholder:text-muted-foreground
                         focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary
                         transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          ) : (
          <div className="mb-5">
            <label className="text-sm font-medium block mb-2">Phone</label>
            <input
              type="tel"
              placeholder="10-digit mobile"
              className="w-full px-4 py-2.5 rounded-md border border-input bg-background
                         placeholder:text-muted-foreground
                         focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary
                         transition"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          )}

          {/* Password */}
          <div className="mb-6">
            <label className="text-sm font-medium block mb-2">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              className="w-full px-4 py-2.5 rounded-md border border-input bg-background
                         placeholder:text-muted-foreground
                         focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary
                         transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Button */}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full rounded-lg bg-[#B56A45] py-2.5 font-medium text-white
                       transition hover:bg-[#9A5436] active:scale-[0.98]
                       disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </div>

        {/* Footer */}
        <p className="text-center mt-6 text-sm">
          <a
            href="/driver/login"
            className="text-primary font-medium hover:underline"
          >
            Delivery staff login
          </a>
        </p>

        <p className="text-xs text-muted-foreground text-center mt-4">
          © {new Date().getFullYear()} VADI Admin
        </p>
      </div>
    </div>
  );
}
