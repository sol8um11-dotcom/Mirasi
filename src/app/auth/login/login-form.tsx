"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { isValidIndianPhone } from "@/lib/utils";
import { Logo } from "@/components/ui/logo";

type AuthStep = "choose" | "phone-input" | "otp-verify";

export function LoginForm() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";
  const error = searchParams.get("error");

  const [step, setStep] = useState<AuthStep>("choose");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const callbackMessage = searchParams.get("message");
  const [errorMsg, setErrorMsg] = useState(
    error === "auth_callback_error"
      ? callbackMessage
        ? decodeURIComponent(callbackMessage)
        : "Authentication failed. Please try again."
      : ""
  );

  const supabase = createClient();

  async function handleGoogleLogin() {
    setLoading(true);
    setErrorMsg("");
    try {
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirect)}`;
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo },
      });

      if (error) {
        setErrorMsg(error.message);
        setLoading(false);
        return;
      }

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to connect to Google. Please try again.");
      setLoading(false);
    }
  }

  async function handleSendOTP() {
    if (!isValidIndianPhone(phone)) {
      setErrorMsg("Please enter a valid 10-digit Indian mobile number");
      return;
    }
    setLoading(true);
    setErrorMsg("");

    const { error } = await supabase.auth.signInWithOtp({
      phone: `+91${phone.replace(/\D/g, "")}`,
    });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
    } else {
      setStep("otp-verify");
      setLoading(false);
    }
  }

  async function handleVerifyOTP() {
    if (otp.length !== 6) {
      setErrorMsg("Please enter the 6-digit OTP");
      return;
    }
    setLoading(true);
    setErrorMsg("");

    const { error } = await supabase.auth.verifyOtp({
      phone: `+91${phone.replace(/\D/g, "")}`,
      token: otp,
      type: "sms",
    });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
    } else {
      window.location.href = redirect;
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col items-center justify-center px-4">
      {/* Logo */}
      <Link href="/" className="mb-8 flex flex-col items-center text-center">
        <Logo size="lg" />
        <p className="mt-1 text-sm italic text-gold">
          Every face tells a legend
        </p>
      </Link>

      {/* Error message */}
      {errorMsg && (
        <div className="mb-4 w-full rounded-lg bg-error/10 px-4 py-3 text-sm text-error">
          {errorMsg}
        </div>
      )}

      {/* Step: Choose method */}
      {step === "choose" && (
        <div className="flex w-full flex-col gap-3">
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-card px-4 py-3.5 text-sm font-medium text-foreground shadow-card transition-all hover:shadow-card-hover disabled:opacity-50"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853" />
              <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
            </svg>
            {loading ? "Connecting..." : "Continue with Google"}
          </button>

          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-background px-3 text-muted">or</span>
            </div>
          </div>

          <button
            onClick={() => setStep("phone-input")}
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-card px-4 py-3.5 text-sm font-medium text-foreground shadow-card transition-all hover:shadow-card-hover disabled:opacity-50"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <rect x="4" y="1" width="10" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
              <line x1="7" y1="14" x2="11" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Continue with Phone
          </button>
        </div>
      )}

      {/* Step: Phone input */}
      {step === "phone-input" && (
        <div className="flex w-full flex-col gap-4">
          <label className="text-sm font-medium text-foreground">
            Mobile Number
          </label>
          <div className="flex gap-2">
            <span className="flex items-center rounded-lg border border-border bg-sand px-3 text-sm text-muted">
              +91
            </span>
            <input
              type="tel"
              inputMode="numeric"
              maxLength={10}
              placeholder="9876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
              className="flex-1 rounded-lg border border-border bg-card px-4 py-3 text-base text-foreground outline-none transition-colors focus:border-saffron"
              autoFocus
            />
          </div>
          <button
            onClick={handleSendOTP}
            disabled={loading || phone.length !== 10}
            className="w-full rounded-xl bg-saffron px-4 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-saffron-dark disabled:opacity-50"
          >
            {loading ? "Sending OTP..." : "Send OTP"}
          </button>
          <button
            onClick={() => { setStep("choose"); setErrorMsg(""); }}
            className="text-sm text-muted hover:text-foreground"
          >
            Back to all options
          </button>
        </div>
      )}

      {/* Step: OTP verification */}
      {step === "otp-verify" && (
        <div className="flex w-full flex-col gap-4">
          <p className="text-sm text-muted">
            We sent a 6-digit code to +91 {phone}
          </p>
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="Enter 6-digit OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            className="w-full rounded-lg border border-border bg-card px-4 py-3 text-center text-lg tracking-[0.3em] text-foreground outline-none transition-colors focus:border-saffron"
            autoFocus
          />
          <button
            onClick={handleVerifyOTP}
            disabled={loading || otp.length !== 6}
            className="w-full rounded-xl bg-saffron px-4 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-saffron-dark disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Verify & Sign In"}
          </button>
          <button
            onClick={() => { setStep("phone-input"); setOtp(""); setErrorMsg(""); }}
            className="text-sm text-muted hover:text-foreground"
          >
            Change number
          </button>
        </div>
      )}

      {/* Terms notice */}
      <p className="mt-8 text-center text-xs text-muted">
        By signing in, you agree to our{" "}
        <Link href="/terms" className="underline hover:text-foreground">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="underline hover:text-foreground">
          Privacy Policy
        </Link>
      </p>
    </div>
  );
}
