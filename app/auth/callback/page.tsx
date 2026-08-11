"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/account";
  const [status, setStatus] = useState("Signing you in...");

  useEffect(() => {
    async function handleCallback() {
      try {
        // Extract access_token from URL hash fragment
        // Supabase sends tokens as: /auth/callback#access_token=xxx&token_type=bearer&...
        const hash = window.location.hash.substring(1);
        const hashParams = new URLSearchParams(hash);
        const accessToken = hashParams.get("access_token");

        if (!accessToken) {
          setStatus("Sign-in failed. Redirecting...");
          setTimeout(() => router.push("/login?error=missing_code"), 2000);
          return;
        }

        // Send token to our server to verify and create session
        const res = await fetch("/api/auth/social/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ access_token: accessToken }),
        });

        if (res.ok) {
          router.push(next);
        } else {
          const data = await res.json().catch(() => ({}));
          console.error("[auth-callback] Verify failed:", data);
          setStatus("Sign-in failed. Redirecting...");
          setTimeout(() => router.push("/login?error=auth_failed"), 2000);
        }
      } catch (err) {
        console.error("[auth-callback] Error:", err);
        setStatus("Something went wrong. Redirecting...");
        setTimeout(() => router.push("/login?error=server_error"), 2000);
      }
    }

    handleCallback();
  }, [next, router]);

  return (
    <main className="flex min-h-[500px] items-center justify-center">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
        <p className="mt-4 text-sm text-muted-ink">{status}</p>
      </div>
    </main>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-[500px] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
            <p className="mt-4 text-sm text-muted-ink">Loading...</p>
          </div>
        </main>
      }
    >
      <CallbackHandler />
    </Suspense>
  );
}
