"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { Eye, EyeOff, LoaderCircle, ArrowRight } from "lucide-react";
import LoginShell, { loginInput, loginButton } from "../../_components/LoginShell";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "https://vadi-backend.onrender.com";

export default function LoginPage() {
  const [mode, setMode] = useState<"admin" | "seller">("admin");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setError("");

    try {
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
    } catch {
      setError("Unable to connect. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginShell>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Store workspace</p>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight">Welcome back</h2>
      <p className="mb-7 mt-2 text-sm text-muted-foreground">{mode === "seller" ? "Sign in to your approved shop to get started." : "Sign in to take care of your store."}</p>
      <div className="mb-7 grid grid-cols-2 gap-1 rounded-xl bg-secondary p-1" aria-label="Sign-in role">
        {(["admin", "seller"] as const).map(role => <button key={role} type="button" disabled={loading} aria-pressed={mode === role} onClick={() => { setMode(role); setError(""); }} className={`rounded-lg py-2.5 text-sm font-medium capitalize transition focus-visible:ring-2 focus-visible:ring-primary ${mode === role ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>{role}</button>)}
      </div>
      <form onSubmit={event => { event.preventDefault(); if (!loading) void handleLogin(); }} className="space-y-5">
        {error && <p role="alert" className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
        <div>
          <label htmlFor="identity" className="mb-2 block text-sm font-medium">{mode === "admin" ? "Email address" : "Mobile number"}</label>
          <input key={mode} id="identity" required disabled={loading} type={mode === "admin" ? "email" : "tel"} autoComplete={mode === "admin" ? "username" : "tel"} pattern={mode === "seller" ? "[0-9+ ()-]{10,16}" : undefined} placeholder={mode === "admin" ? "you@vadi.com" : "Your registered mobile number"} className={loginInput} value={mode === "admin" ? email : phone} onChange={event => { if (mode === "admin") setEmail(event.target.value); else setPhone(event.target.value); setError(""); }} />
        </div>
        <div>
          <label htmlFor="password" className="mb-2 block text-sm font-medium">Password</label>
          <div className="relative">
            <input id="password" required disabled={loading} type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="Enter your password" className={`${loginInput} pr-14`} value={password} onChange={event => { setPassword(event.target.value); setError(""); }} />
            <button type="button" aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword} onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 rounded-r-xl px-4 text-muted-foreground hover:text-primary focus-visible:ring-2 focus-visible:ring-primary">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
          </div>
        </div>
        <button type="submit" disabled={loading} className={loginButton}>{loading ? <LoaderCircle size={18} className="motion-safe:animate-spin" /> : <ArrowRight size={18} />}{loading ? "Signing in…" : `Sign in as ${mode}`}</button>
      </form>
    </LoginShell>
  );
}
