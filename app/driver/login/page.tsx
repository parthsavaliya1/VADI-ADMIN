"use client";

import { signIn } from "next-auth/react";
import { ArrowRight, LoaderCircle, Check } from "lucide-react";
import LoginShell, { loginInput, loginButton } from "../../_components/LoginShell";
import { useState } from "react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "https://vadi-backend.onrender.com";

function normalizePhone(raw: string) {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`;
  if (digits.length === 10) return `+91${digits}`;
  if (raw.trim().startsWith("+91")) return raw.trim();
  return `+91${digits}`;
}

export default function DriverLoginPage() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [lockedPhone, setLockedPhone] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const normalized = phone ? normalizePhone(phone) : "";

  const sendOtp = async () => {
    setError("");
    if (!/^\+91[6-9]\d{9}$/.test(normalized)) {
      setError("Enter a valid 10-digit mobile number");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/driver/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: normalized, forceResend: true }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || "Could not send OTP");
        return;
      }
      setLockedPhone(normalized);
      setOtp("");
      setStep("otp");
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const verifyAndSignIn = async () => {
    setError("");
    const code = otp.replace(/\D/g, "");
    if (code.length !== 6) {
      setError("Enter the 6-digit OTP");
      return;
    }
    setLoading(true);
    try {
      const res = await signIn("driver-credentials", {
        phone: lockedPhone,
        otp: code,
        redirect: false,
      });
      setLoading(false);
      if (res?.error) {
        setError("Invalid OTP or unregistered driver number");
        return;
      }
      window.location.href = "/driver/deliveries";
    } catch {
      setLoading(false);
      setError("Sign-in failed");
    }
  };

  return (
    <LoginShell driver>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Delivery workspace</p>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight">{step === "phone" ? "Ready to get moving?" : "Check your messages"}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{step === "phone" ? "Use your registered mobile number to sign in." : `Enter the code sent to ${lockedPhone}.`}</p>
      <ol aria-label="Sign-in progress" className="my-7 flex items-center gap-3 text-xs font-medium">
        <li className="flex items-center gap-2 text-primary"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground">{step === "otp" ? <Check size={14} /> : "1"}</span>Mobile number</li>
        <li aria-hidden className="h-px flex-1 bg-border" />
        <li aria-current={step === "otp" ? "step" : undefined} className={`flex items-center gap-2 ${step === "otp" ? "text-primary" : "text-muted-foreground"}`}><span className={`flex h-7 w-7 items-center justify-center rounded-full ${step === "otp" ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>2</span>Verify code</li>
      </ol>
      <form onSubmit={event => { event.preventDefault(); if (!loading) void (step === "phone" ? sendOtp() : verifyAndSignIn()); }} className="space-y-5">
        {error && <p role="alert" className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
        {step === "phone" ? <div>
          <label htmlFor="phone" className="mb-2 block text-sm font-medium">Mobile number</label>
          <input id="phone" type="tel" autoComplete="tel" required disabled={loading} placeholder="98765 43210" className={loginInput} value={phone} onChange={event => { setPhone(event.target.value); setError(""); }} />
          <p className="mt-2 text-xs text-muted-foreground">We’ll send you a 6-digit code by SMS.</p>
        </div> : <div>
          <label htmlFor="otp" className="mb-2 block text-sm font-medium">Verification code</label>
          <input id="otp" type="text" inputMode="numeric" autoComplete="one-time-code" autoFocus required pattern="[0-9]{6}" maxLength={6} disabled={loading} placeholder="000000" className={`${loginInput} text-center font-mono text-2xl tracking-[0.4em]`} value={otp} onChange={event => { setOtp(event.target.value.replace(/\D/g, "")); setError(""); }} />
        </div>}
        <button type="submit" disabled={loading} className={loginButton}>{loading ? <LoaderCircle size={18} className="motion-safe:animate-spin" /> : <ArrowRight size={18} />}{loading ? (step === "phone" ? "Sending code…" : "Signing in…") : (step === "phone" ? "Send verification code" : "Verify & sign in")}</button>
        {step === "otp" && <button type="button" disabled={loading} onClick={() => { setStep("phone"); setOtp(""); setError(""); }} className="w-full rounded-lg py-2 text-sm text-muted-foreground hover:text-primary focus-visible:ring-2 focus-visible:ring-primary">Use a different number or request a new code</button>}
      </form>
    </LoginShell>
  );
}
