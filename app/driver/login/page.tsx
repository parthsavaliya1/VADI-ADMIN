"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
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
    if (normalized.length < 12) {
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
    <div className="min-h-screen flex items-center justify-center bg-secondary/40 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">Delivery staff</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Sign in with the phone number registered by your admin. OTP is sent
            via SMS (2factor.in).
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl shadow-sm p-8">
          {error && (
            <div className="mb-5 bg-destructive/10 text-destructive text-sm px-4 py-2 rounded-md">
              {error}
            </div>
          )}

          {step === "phone" ? (
            <>
              <label className="text-sm font-medium block mb-2">Mobile number</label>
              <input
                type="tel"
                placeholder="9876543210"
                className="w-full px-4 py-2.5 rounded-md border border-input bg-background mb-6"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <button
                type="button"
                onClick={() => void sendOtp()}
                disabled={loading}
                className="w-full bg-primary text-primary-foreground py-2.5 rounded-md font-medium disabled:opacity-60"
              >
                {loading ? "Sending…" : "Send OTP"}
              </button>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-3">Code sent to {lockedPhone}</p>
              <label className="text-sm font-medium block mb-2">6-digit OTP</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                className="w-full px-4 py-2.5 rounded-md border border-input bg-background mb-6 tracking-widest text-lg font-mono"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              />
              <button
                type="button"
                onClick={() => void verifyAndSignIn()}
                disabled={loading}
                className="w-full bg-primary text-primary-foreground py-2.5 rounded-md font-medium disabled:opacity-60"
              >
                {loading ? "Signing in…" : "Verify & sign in"}
              </button>
              <button
                type="button"
                className="w-full mt-3 text-sm text-muted-foreground hover:text-foreground"
                onClick={() => {
                  setStep("phone");
                  setOtp("");
                }}
              >
                Change number
              </button>
            </>
          )}
        </div>

        <p className="text-center mt-6 text-sm">
          <Link href="/admin/login" className="text-primary font-medium hover:underline">
            Admin login
          </Link>
        </p>
      </div>
    </div>
  );
}
