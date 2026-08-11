"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

type AuthMode = "login" | "signup" | "forgot" | "reset" | "otp";

export function AuthShell({
  mode: initialMode,
  nextPath,
  token,
  error: oauthError,
}: {
  mode: "login" | "signup" | "forgot" | "reset";
  nextPath?: string;
  token?: string;
  error?: string;
}) {
  const router = useRouter();

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

  // Full E.164 phone with India country code (+91)
  const fullPhone = `+91${otpPhone}`;
  const phoneValid = /^[6-9]\d{9}$/.test(otpPhone);

  // OTP Send via Firebase
  const sendOtp = async () => {
    if (!phoneValid) {
      setError("Enter a valid 10-digit Indian mobile number.");
      return;
    }
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const { auth } = await import("@/lib/firebase/config");
      const { RecaptchaVerifier, signInWithPhoneNumber } = await import("firebase/auth");

      // Create invisible reCAPTCHA (only once)
      if (!(window as unknown as Record<string, unknown>).__recaptchaVerifier) {
        (window as unknown as Record<string, unknown>).__recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
          size: "invisible",
        });
      }

      const verifier = (window as unknown as Record<string, unknown>).__recaptchaVerifier as import("firebase/auth").RecaptchaVerifier;
      const result = await signInWithPhoneNumber(auth, fullPhone, verifier);
      (window as unknown as Record<string, unknown>).__confirmationResult = result;

      setOtpSent(true);
      setMessage(`OTP sent to ${fullPhone}. Check your phone.`);
    } catch (err: unknown) {
      const firebaseError = err as { code?: string; message?: string };
      console.error("[otp-send] Firebase error:", firebaseError);
      if (firebaseError.code === "auth/too-many-requests") {
        setError("Too many attempts. Please try again later.");
      } else if (firebaseError.code === "auth/invalid-phone-number") {
        setError("Invalid phone number. Please check and try again.");
      } else {
        setError(firebaseError.message ?? "Unable to send OTP. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // OTP Verify via Firebase
  const verifyOtp = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!otpSent) {
      await sendOtp();
      return;
    }
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const confirmationResult = (window as unknown as Record<string, unknown>).__confirmationResult as import("firebase/auth").ConfirmationResult;
      if (!confirmationResult) {
        setError("Session expired. Please request a new OTP.");
        setOtpSent(false);
        setLoading(false);
        return;
      }

      const credential = await confirmationResult.confirm(otpCode);
      const user = credential.user;

      // Send verified phone to our API to create/find user and set session
      const response = await fetch("/api/auth/firebase/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: user.phoneNumber,
          uid: user.uid,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error ?? "Sign-in failed.");
        setLoading(false);
        return;
      }

      router.push(nextPath || "/account");
    } catch (err: unknown) {
      const firebaseError = err as { code?: string; message?: string };
      console.error("[otp-verify] Firebase error:", firebaseError);
      if (firebaseError.code === "auth/invalid-verification-code") {
        setError("Invalid OTP. Please check and try again.");
      } else if (firebaseError.code === "auth/code-expired") {
        setError("OTP expired. Please request a new one.");
        setOtpSent(false);
      } else {
        setError(firebaseError.message ?? "Verification failed.");
      }
      setLoading(false);
    }
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
              OTP FLOW (India +91 predefined)
          ══════════════════════════════════════ */}
          {mode === "otp" && (
            <form onSubmit={verifyOtp} className="grid gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-ink">
                  Mobile number
                </label>
                <div className="flex items-stretch overflow-hidden rounded-soft border border-sand-line bg-parchment transition focus-within:border-gold focus-within:ring-2 focus-within:ring-gold/20">
                  {/* Fixed +91 prefix */}
                  <span className="flex items-center gap-1.5 border-r border-sand-line bg-sand-line/20 px-3 text-sm font-medium text-ink">
                    <span className="text-base">🇮🇳</span>
                    +91
                  </span>
                  <input
                    required
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    value={otpPhone}
                    onChange={(e) =>
                      setOtpPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                    }
                    placeholder="98765 43210"
                    disabled={otpSent}
                    className="h-12 flex-1 bg-transparent px-3 text-sm text-ink outline-none placeholder:text-muted-ink/60 disabled:opacity-60"
                  />
                </div>
                {!otpSent && (
                  <Button
                    type="button"
                    onClick={sendOtp}
                    disabled={loading || !phoneValid}
                    className="mt-3 w-full"
                  >
                    {loading ? "Sending OTP..." : "Send OTP"}
                  </Button>
                )}
              </div>

              {otpSent && (
                <>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-muted-ink">
                      Enter 6-digit OTP
                    </label>
                    <input
                      required
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) =>
                        setOtpCode(e.target.value.replace(/\D/g, ""))
                      }
                      placeholder="------"
                      autoFocus
                      className="h-14 w-full rounded-soft border border-sand-line bg-parchment text-center text-2xl font-semibold tracking-[0.5em] text-ink outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading || otpCode.length !== 6}
                  >
                    {loading ? "Verifying..." : "Verify & Sign in"}
                  </Button>

                  <div className="flex items-center justify-between text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setOtpSent(false);
                        setOtpCode("");
                        setError("");
                        setMessage("");
                      }}
                      className="text-muted-ink hover:text-oxblood"
                    >
                      &larr; Change number
                    </button>
                    <button
                      type="button"
                      onClick={sendOtp}
                      disabled={loading}
                      className="text-oxblood hover:text-gold disabled:opacity-50"
                    >
                      Resend OTP
                    </button>
                  </div>
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

        {/* Invisible reCAPTCHA container for Firebase phone auth */}
        <div id="recaptcha-container" />

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
