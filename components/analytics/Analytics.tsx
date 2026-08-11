"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...arguments_: unknown[]) => void;
    fbq?: (...arguments_: unknown[]) => void;
    _fbq?: unknown;
  }
}

const CONSENT_KEY = "divine-karigari-analytics-consent";

function PageViewTracker({
  gaId,
  pixelId,
}: {
  gaId?: string;
  pixelId?: string;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  useEffect(() => {
    const query = searchParams.toString();
    const pagePath = query ? `${pathname}?${query}` : pathname;
    if (gaId && window.gtag)
      window.gtag("event", "page_view", {
        page_path: pagePath,
        page_location: window.location.href,
      });
    if (pixelId && window.fbq) window.fbq("track", "PageView");
  }, [gaId, pathname, pixelId, searchParams]);
  return null;
}

export function Analytics() {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const [consent, setConsent] = useState<"granted" | "denied" | null>(null);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const stored = window.localStorage.getItem(CONSENT_KEY);
    if (stored === "granted" || stored === "denied") setConsent(stored);
    setLoaded(true);
  }, []);
  if (!gaId && !pixelId) return null;
  const choose = (value: "granted" | "denied") => {
    window.localStorage.setItem(CONSENT_KEY, value);
    setConsent(value);
  };
  return (
    <>
      {consent === "granted" && gaId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            strategy="afterInteractive"
          />
          <Script id="ga4" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}window.gtag=gtag;gtag('js',new Date());gtag('config','${gaId}',{send_page_view:false});`}
          </Script>
        </>
      )}
      {consent === "granted" && pixelId && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${pixelId}');`}
        </Script>
      )}
      {consent === "granted" && (
        <Suspense fallback={null}>
          <PageViewTracker gaId={gaId} pixelId={pixelId} />
        </Suspense>
      )}
      {loaded && consent === null && (
        <aside
          aria-label="Analytics consent"
          className="fixed bottom-4 left-4 right-4 z-[70] mx-auto max-w-2xl rounded-soft-xl border border-sand-line bg-parchment p-4 shadow-lift sm:flex sm:items-center sm:gap-5 sm:p-5"
        >
          <p className="text-sm leading-6 text-muted-ink">
            We use optional analytics to understand how the shop is used. No
            analytics or advertising tags load until you accept.
          </p>
          <div className="mt-4 flex shrink-0 gap-2 sm:mt-0">
            <button
              type="button"
              onClick={() => choose("denied")}
              className="rounded-soft border border-sand-line px-4 py-2 text-xs font-medium"
            >
              Essential only
            </button>
            <button
              type="button"
              onClick={() => choose("granted")}
              className="rounded-soft bg-ink px-4 py-2 text-xs font-medium text-parchment"
            >
              Accept analytics
            </button>
          </div>
        </aside>
      )}
    </>
  );
}
