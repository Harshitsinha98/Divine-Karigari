"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function AuthShell({
  mode,
  nextPath,
  token,
}: {
  mode: "login" | "signup" | "forgot" | "reset";
  nextPath?: string;
  token?: string;
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const reset = mode === "reset";
  const heading =
    mode === "login"
      ? "Welcome back."
      : mode === "signup"
        ? "Begin your gifting story."
        : mode === "forgot"
          ? "A way back in."
          : "Choose a new password.";
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    if (reset && form.password !== form.confirm) {
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
            Enter your email and we’ll send reset instructions if we find an
            account.
          </p>
        )}
        <form
          onSubmit={submit}
          className="mt-10 grid gap-4 rounded-soft-xl border border-sand-line p-6 sm:p-8"
        >
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
          <Input
            required
            name="email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="Email address"
          />
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
          {reset && (
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
        <p className="mt-6 text-center text-sm text-muted-ink">
          {mode === "signup" ? (
            <>
              Already have an account?{" "}
              <Link href="/login" className="text-oxblood">
                Sign in
              </Link>
            </>
          ) : mode === "login" ? (
            <>
              New here?{" "}
              <Link href="/signup" className="text-oxblood">
                Create an account
              </Link>
            </>
          ) : (
            <Link href="/login" className="text-oxblood">
              Back to sign in
            </Link>
          )}
        </p>
      </div>
    </main>
  );
}
