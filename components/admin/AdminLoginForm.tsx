"use client";

import { LockKeyhole } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function AdminLoginForm({ nextPath }: { nextPath?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Check URL for Google OAuth errors
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const oauthError = params.get("error");
    if (oauthError === "not_authorized") {
      setError(
        "Access denied. Only divinekarigari@gmail.com can sign in as admin.",
      );
    } else if (oauthError === "auth_failed") {
      setError("Google sign-in failed. Please try again.");
    } else if (oauthError) {
      setError("Sign-in error. Please try again.");
    }
  }, []);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    const response = await fetch("/api/admin/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const result = await response.json();
    setLoading(false);
    if (!response.ok) {
      setError(result.error ?? "Unable to sign in.");
      return;
    }
    router.push(
      nextPath?.startsWith("/admin") && nextPath !== "/admin/login"
        ? nextPath
        : "/admin",
    );
    router.refresh();
  };

  return (
    <form
      onSubmit={submit}
      className="mt-8 grid gap-4 border border-sand-line bg-white p-6 shadow-soft sm:p-8"
    >
      <label className="grid gap-2 text-sm font-medium">
        Work email
        <Input
          required
          type="email"
          autoComplete="username"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="bg-white"
          placeholder="name@divinekarigari.in"
        />
      </label>
      <label className="grid gap-2 text-sm font-medium">
        Password
        <Input
          required
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="bg-white"
          placeholder="Enter your password"
        />
      </label>
      {error && (
        <p role="alert" className="text-sm text-oxblood">
          {error}
        </p>
      )}
      <Button type="submit" disabled={loading} className="mt-2 w-full">
        <LockKeyhole size={16} />
        {loading ? "Signing in..." : "Sign in with password"}
      </Button>

      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-sand-line" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white px-3 text-muted-ink">or</span>
        </div>
      </div>

      <a
        href={`/api/admin/auth/google${nextPath ? `?next=${encodeURIComponent(nextPath)}` : ""}`}
        className="flex w-full items-center justify-center gap-3 rounded-soft border border-sand-line bg-white py-3 text-sm font-medium text-ink shadow-soft transition hover:shadow-lift"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Sign in with Google
      </a>
      <p className="mt-3 text-center text-[11px] text-muted-ink">
        Google sign-in is restricted to the authorized admin account only.
      </p>
    </form>
  );
}
