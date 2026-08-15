"use client";

import { useEffect, useState } from "react";

// Supabase OAuth returns the session as a URL hash fragment
// (#access_token=...). Depending on www/non-www and Site URL config, that
// fragment can land on ANY page (often the homepage root) instead of
// /auth/callback. This global handler catches it wherever it lands,
// completes the sign-in, cleans the URL, and redirects.
export function OAuthHashHandler() {
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash || !hash.includes("access_token=")) return;

    const params = new URLSearchParams(hash.substring(1));
    const accessToken = params.get("access_token");
    if (!accessToken) return;

    const isAdmin = window.sessionStorage.getItem("dk_oauth_admin") === "1";
    setProcessing(true);

    const cleanHash = () =>
      window.history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search,
      );

    (async () => {
      try {
        if (isAdmin) {
          const res = await fetch("/api/admin/auth/google/token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ access_token: accessToken }),
          });
          window.sessionStorage.removeItem("dk_oauth_admin");
          cleanHash();
          if (res.ok) {
            window.location.href = "/admin";
          } else {
            const data = await res.json().catch(() => ({}));
            const err =
              res.status === 403 ? "not_authorized" : "auth_failed";
            window.location.href = `/admin/login?error=${err}${data.error ? "" : ""}`;
          }
        } else {
          const res = await fetch("/api/auth/social/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ access_token: accessToken }),
          });
          cleanHash();
          if (res.ok) {
            window.location.href = "/account";
          } else {
            window.location.href = "/login?error=auth_failed";
          }
        }
      } catch {
        window.sessionStorage.removeItem("dk_oauth_admin");
        cleanHash();
        window.location.href = isAdmin
          ? "/admin/login?error=auth_failed"
          : "/login?error=auth_failed";
      }
    })();
  }, []);

  if (!processing) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-white/95 backdrop-blur">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-tulsi border-t-transparent" />
        <p className="mt-4 text-sm text-muted-ink">Signing you in…</p>
      </div>
    </div>
  );
}
