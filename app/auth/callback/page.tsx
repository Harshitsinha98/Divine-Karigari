"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

/**
 * This page handles the OAuth callback from Supabase.
 * Supabase redirects here with tokens in the URL hash fragment (#access_token=...)
 * Since hash fragments are only available client-side, this must be a client component.
 * 
 * Flow:
 * 1. Supabase redirects here with #access_token=... in URL
 * 2. We extract the access_token from the hash
 * 3. We call our server API with the token to create a session
 * 4. Server verifies token, finds/creates user, sets cookie
 * 5. We redirect to the destination
 */
export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/account";
  const [status, setStatus] = useState("Signing you in...");

  useEffect(() => {
    async function handleCallback() {
      try {
        // Extract tokens from URL hash
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        const accessToken = params.get("access_token");

        // Also check query params for code (PKCE flow)
        const code = searchParams.get("code");

        if (!accessToken && !code) {
          // Try creating a Supabase client to get the session
          const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          );

          const { data: { session } } = await supabase.auth.getSession();
          if (session?.access_token) {
            await exchangeToken(session.access_token);
            return;
          }

          setStatus("Sign-in failed. Redirecting...");
          setTimeout(() => router.push(`/login?error=missing_code`), 1500);
          return;
        }

        if (accessToken) {
          await exchangeToken(accessToken);
        } else if (code) {
          await exchangeCode(code);
        }
      } catch (err) {
        console.error("[auth-callback] Error:", err);
        setStatus("Something went wrong. Redirecting...");
        setTimeout(() => router.push(`/login?error=server_error`), 1500);
      }
    }

    async function exchangeToken(token: string) {
      const res = await fetch("/api/auth/social/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ access_token: token, next }),
      });

      if (res.ok) {
        router.push(next);
      } else {
        setStatus("Sign-in failed. Redirecting...");
        setTimeout(() => router.push(`/login?error=auth_failed`), 1500);
      }
    }

    async function exchangeCode(code: string) {
      const res = await fetch("/api/auth/social/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, next }),
      });

      if (res.ok) {
        router.push(next);
      } else {
        setStatus("Sign-in failed. Redirecting...");
        setTimeout(() => router.push(`/login?error=auth_failed`), 1500);
      }
    }

    handleCallback();
  }, [next, router, searchParams]);

  return (
    <main className="flex min-h-[500px] items-center justify-center">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
        <p className="mt-4 text-sm text-muted-ink">{status}</p>
      </div>
    </main>
  );
}
