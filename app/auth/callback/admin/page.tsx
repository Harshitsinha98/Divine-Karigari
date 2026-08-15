"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Supabase may return the OAuth result as a hash fragment (#access_token=...)
// instead of a query parameter (?code=...). Since hash fragments are never
// sent to the server, this client page extracts the token and calls the
// server API to complete the admin login.
export default function AdminCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState("Completing sign-in…");

  useEffect(() => {
    async function handleCallback() {
      // Check for query param (PKCE/code flow)
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");

      // Check for hash fragment (implicit flow)
      const hash = window.location.hash.substring(1);
      const hashParams = new URLSearchParams(hash);
      const accessToken = hashParams.get("access_token");

      if (code) {
        // Server-side route will handle the code exchange
        // This shouldn't normally hit because Next.js route.ts takes priority,
        // but as a fallback redirect to the API route
        window.location.href = `/api/admin/auth/google/callback?code=${encodeURIComponent(code)}`;
        return;
      }

      if (accessToken) {
        // Send the access token to our server API to verify and create session
        try {
          const res = await fetch("/api/admin/auth/google/token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ access_token: accessToken }),
          });
          const data = await res.json();
          if (res.ok && data.success) {
            router.push("/admin");
            router.refresh();
            return;
          }
          setStatus(data.error ?? "Sign-in failed. Please try again.");
          setTimeout(() => router.push("/admin/login?error=auth_failed"), 2000);
        } catch {
          setStatus("Network error. Redirecting…");
          setTimeout(() => router.push("/admin/login?error=auth_failed"), 2000);
        }
        return;
      }

      // Neither code nor token found
      setStatus("No authentication data received. Redirecting…");
      setTimeout(() => router.push("/admin/login?error=no_code"), 2000);
    }

    handleCallback();
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-tulsi border-t-transparent" />
        <p className="mt-4 text-sm text-muted-ink">{status}</p>
      </div>
    </div>
  );
}
