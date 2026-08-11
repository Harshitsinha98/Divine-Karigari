"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

type AuthMode = "login" | "signup" | "forgot" | "reset" | "otp";

export function AuthShell({
  mode: initialMode,
  nextPath,
  token,
}: {
  mode: "login" | "signup" | "forgot" | "reset";
  nextPath?: string;
  token?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const oauthError = searchParams.get("error");

  const [mode, setMode] = useState<AuthMode>(initialMode as AuthMode);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
  });
  const [otpPhone, setOtpPhone] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(oauthError ? getOAuthErrorMessage(oauthError) : "");
  const [loading, setLoading] = useState(false);

  const heading =
    mode === "login"
      ? "Welcome back."
      : mode === "signup"
        ? "Begin your gifting story."
        : mode === "forgot"
          ? "A way back in."
          : mode === "reset"
            ? "Choose a new password."
            : "Sign in with OTP.";

  // Email/Password submit
  const submitEmailPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    if (mode === "reset" && form.password !== form.confirm) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    const endpoint =
      mode === "login"
        ? "/api/auth/login"
        : mode === "signup"
          ? "/api/auth/signup"
          : mode === "forgot"
            ? "/api/auth/forgot-password"
            : "/api/auth/reset-password";

    const body =
      mode === "reset"
        ? { token, password: form.password }
        : mode === "forgot"
          ? { email: form.email }
          : form;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(data.error ?? "Something went wrong.");
      return;
    }
    if (mode === "login" || mode === "signup")
      router.push(nextPath || "/account");
    else if (mode === "reset") {
      setMessage("Your password has been updated. You can now sign in.");
      router.push("/login");
    } else setMessage(data.message);
  };

  // OTP Send
  const sendOtp = async () => {
    setLoading(true);
    setError("");
    setMessage("");

    const response = await fetch("/api/auth/otp/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: otpPhone }),
    });
    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(data.error ?? "Unable to send OTP.");
      return;
    }
    setOtpSent(true);
    setMessage("OTP sent! Check your phone.");
  };

  // OTP Verify
  const verifyOtp = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    const response = await fetch("/api/auth/otp/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: otpPhone, otp: otpCode }),
    });
    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(data.error ?? "Invalid OTP.");
      return;
    }
    router.push(nextPath || "/account");
  };

  // Google OAuth
  const signInWithGoogle = () => {
    const params = new URLSearchParams();
    if (nextPath) params.set("next", nextPath);
    window.location.href = `/api/auth/google?${params.toString()}`;
  };

  return (
    <main className="container flex min-h-[600px] items-center justify-center py-16">
      <div className="w-full max-w-md">
        <p className="text-center text-xs uppercase tracking-[0.22em] text-oxblood">
          Divine Karigari
        </p>
        <h1 className="mt-4 text-center font-display text-5xl leading-tight">
          {heading}
        </h1>

        {mode === "forgot" && (
          <p className="mt-4 text-center text-sm leading-7 text-muted-ink">
            Enter your email and we&apos;ll send reset instructions if we find
            an account.
          </p>
        )}

        <div className="mt-10 rounded-soft-xl border border-sand-line p-6 sm:p-8">
          {/* ══════════════════════════════════════
              GOOGLE SIGN-IN BUTTON
          ══════════════════════════════════════ */}
          {(mode === "login" || mode === "signup") && (
            <>
              <button
                type="button"
                onClick={signInWithGoogle}
                className="flex w-full items-center justify-center gap-3 rounded-soft border border-sand-line bg-white px-4 py-3 text-sm font-medium text-ink transition-all duration-200 hover:-translate-y-0.5 hover:border-gold/50 hover:shadow-soft"
              >
                <GoogleIcon />
                Continue with Google
              </button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-sand-line" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-parchment px-3 text-muted-ink">or</span>
                </div>
              </div>

              {/* ══════════════════════════════════════
                  AUTH METHOD TABS (Email / Phone OTP)
              ══════════════════════════════════════ */}
              <div className="mb-5 flex rounded-soft border border-sand-line p-1">
                <button
                  type="button"
                  onClick={() => { setMode(initialMode); setError(""); setMessage(""); }}
                  className={`flex-1 rounded-[6px] py-2 text-xs font-medium transition-all ${
                    (mode as string) !== "otp"
                      ? "bg-ink text-parchment shadow-sm"
                      : "text-muted-ink hover:text-ink"
                  }`}
                >
                  Email & Password
                </button>
                <button
                  type="button"
                  onClick={() => { setMode("otp"); setError(""); setMessage(""); setOtpSent(false); }}
                  className={`flex-1 rounded-[6px] py-2 text-xs font-medium transition-all ${
                    (mode as string) === "otp"
                      ? "bg-ink text-parchment shadow-sm"
                      : "text-muted-ink hover:text-ink"
                  }`}
                >
                  Phone OTP
                </button>
              </div>
            </>
          )}

          {/* ══════════════════════════════════════
              OTP FLOW
          ══════════════════════════════════════ */}
          {mode === "otp" && (
            <form onSubmit={verifyOtp} className="grid gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-ink">
                  Phone number (international format)
                </label>
                <div className="flex gap-2">
                  <Input
                    required
                    type="tel"
                    value={otpPhone}
                    onChange={(e) => setOtpPhone(e.target.value)}
                    placeholder="+919876543210"
                    disabled={otpSent}
                    className="flex-1"
                  />
                  {!otpSent && (
                    <Button
                      type="button"
                      onClick={sendOtp}
                      disabled={loading || !otpPhone}
                      variant="secondary"
                      className="shrink-0 whitespace-nowrap"
                    >
                      {loading ? "Sending..." : "Send OTP"}
                    </Button>
                  )}
                </div>
              </div>

              {otpSent && (
                <>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-muted-ink">
                      Enter 6-digit OTP
                    </label>
                    <Input
                      required
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                      placeholder="123456"
                      autoFocus
                    />
                  </div>

                  <Button type="submit" disabled={loading || otpCode.length !== 6}>
                    {loading ? "Verifying..." : "Verify & Sign in"}
                  </Button>

                  <button
                    type="button"
                    onClick={() => { setOtpSent(false); setOtpCode(""); setError(""); setMessage(""); }}
                    className="text-center text-xs text-muted-ink hover:text-oxblood"
                  >
                    Change phone number
                  </button>
                </>
              )}

              {error && <p className="text-sm text-oxblood">{error}</p>}
              {message && <p className="text-sm text-tulsi">{message}</p>}
            </form>
          )}

          {/* ══════════════════════════════════════
              EMAIL/PASSWORD FLOW
          ══════════════════════════════════════ */}
          {mode !== "otp" && (
            <form onSubmit={submitEmailPassword} className="grid gap-4">
              {mode === "signup" && (
                <>
                  <Input
                    required
                    name="name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Full name"
                  />
                  <Input
                    required
                    name="phone"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="Phone number"
                  />
                </>
              )}
              {mode !== "reset" && (
                <Input
                  required
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="Email address"
                />
              )}
              {mode !== "forgot" && (
                <Input
                  required
                  name="password"
                  type="password"
                  minLength={10}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Password"
                />
              )}
              {mode === "reset" && (
                <Input
                  required
                  name="confirm"
                  type="password"
                  minLength={10}
                  value={form.confirm}
                  onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                  placeholder="Confirm password"
                />
              )}

              {error && <p className="text-sm text-oxblood">{error}</p>}
              {message && <p className="text-sm text-tulsi">{message}</p>}

              <Button type="submit" disabled={loading}>
                {loading
                  ? "Please wait..."
                  : mode === "login"
                    ? "Sign in"
                    : mode === "signup"
                      ? "Create account"
                      : mode === "forgot"
                        ? "Send instructions"
                        : "Reset password"}
              </Button>

              {mode === "login" && (
                <Link
                  href="/forgot-password"
                  className="text-center text-sm text-muted-ink hover:text-oxblood"
                >
                  Forgot your password?
                </Link>
              )}
            </form>
          )}
        </div>

        {/* Bottom links */}
        <p className="mt-6 text-center text-sm text-muted-ink">
          {mode === "signup" || mode === "otp" ? (
            <>
              Already have an account?{" "}
              <Link href="/login" className="text-oxblood hover:text-gold">
                Sign in
              </Link>
            </>
          ) : mode === "login" ? (
            <>
              New here?{" "}
              <Link href="/signup" className="text-oxblood hover:text-gold">
                Create an account
              </Link>
            </>
          ) : (
            <Link href="/login" className="text-oxblood hover:text-gold">
              Back to sign in
            </Link>
          )}
        </p>
      </div>
    </main>
  );
}

/** Google SVG icon */
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

/** Map OAuth error codes to user-friendly messages */
function getOAuthErrorMessage(code: string): string {
  switch (code) {
    case "missing_code":
      return "Sign-in was cancelled. Please try again.";
    case "auth_failed":
      return "Google sign-in failed. Please try again.";
    case "no_email":
      return "Could not retrieve email from Google. Please try another method.";
    case "server_error":
      return "Something went wrong. Please try again.";
    default:
      return "";
  }
}
