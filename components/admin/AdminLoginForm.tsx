"use client";

import { LockKeyhole } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function AdminLoginForm({ nextPath }: { nextPath?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
        {loading ? "Signing in..." : "Sign in to admin"}
      </Button>
    </form>
  );
}
