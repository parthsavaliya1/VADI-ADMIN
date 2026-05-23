"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setLoading(true);
    setError("");

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
    <div className="min-h-screen flex items-center justify-center bg-secondary/40 px-4">
      <div className="w-full max-w-md">
        {/* Logo / Heading */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">Admin Panel</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Sign in to continue
          </p>
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-xl shadow-sm p-8">
          {error && (
            <div className="mb-5 bg-destructive/10 text-destructive text-sm px-4 py-2 rounded-md">
              {error}
            </div>
          )}

          {/* Email */}
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
            className="w-full bg-primary text-primary-foreground py-2.5 rounded-md
                       font-medium hover:opacity-90 active:scale-[0.98]
                       transition-all disabled:opacity-60"
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
