# Divine Karigari

Full-stack e-commerce storefront and role-aware admin portal for Divine
Karigari, built with Next.js 14, TypeScript, Tailwind CSS, PostgreSQL, and
Prisma.

## Local setup

Prerequisites:

- Node.js 20+
- PostgreSQL 15+
- npm

Copy `.env.example` to `.env`, replace the placeholder values, then run:

```bash
npm install
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

Useful validation commands:

```bash
npm run format:check
npm run lint
npm run build
npm run env:audit
npm run env:audit:strict
```

`env:audit:strict` is intended for deployment CI and fails when a required
variable is absent, a secret-like variable is exposed with a `NEXT_PUBLIC_`
prefix, or a client component references a server-only environment variable.

## Database

The Prisma schema covers:

- Customer and staff identities: `User`, `Staff`, `Address`,
  `SavedPaymentMethod`
- Catalog: `Category`, `Product`, `ProductVariant`, `Review`
- Commerce: `Cart`, `CartItem`, `Wishlist`, `WishlistItem`, `Coupon`,
  `CouponRedemption`
- Orders: `Order`, `OrderItem`, `Payment`, `Refund`, `TrackingEvent`,
  `ReturnRequest`
- Store credit: `Wallet`, `WalletTransaction`
- Marketing: `NewsletterSubscriber`

Product records support galleries, variants, personalization fields, inventory,
SKU, weight, and dimensions. Orders preserve immutable address and line-item
snapshots and store Razorpay and Shiprocket references.

Use named Prisma migrations for schema changes:

```bash
npm run db:migrate -- --name describe_the_change
```

The launch-readiness migration adds newsletter subscribers, abandoned-cart
state, and a cart uniqueness constraint that permits separate personalization
notes for the same product variant.

## Authentication and authorization

Customer and admin authentication use separate signed JWT sessions in secure,
httpOnly cookies:

- Customer: `divine_session`
- Admin: `divine_admin_session`

Set a long random `AUTH_SECRET`. Admin APIs enforce the staff roles
`SUPER_ADMIN`, `ORDER_MANAGER`, and `INVENTORY_MANAGER`.

The legacy catalog write endpoints also accept `x-api-key` matching
`ADMIN_API_KEY`. This key is server-side only and must not be exposed in browser
code.

Seeded staff accounts are:

- `admin@divinekarigari.in`
- `orders@divinekarigari.in`
- `inventory@divinekarigari.in`

Set `ADMIN_SEED_PASSWORD` before seeding. The local fallback password must never
be used in a deployed environment.

## Payments

Checkout creates a Razorpay order server-side. The customer order remains
pending until either the client callback or Razorpay webhook signature is
verified. Configure:

- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `RAZORPAY_WEBHOOK_SECRET`
- `NEXT_PUBLIC_RAZORPAY_KEY_ID`

Register `/api/checkout/webhook` for Razorpay payment capture/order-paid events.
Use HTTPS and retain the raw webhook body for signature verification.

## Shipping and returns

Shiprocket integration covers order creation, serviceability, AWB and courier
sync, tracking webhooks, customer timelines, and approved return creation.

Configure the `SHIPROCKET_*` variables in `.env.example`. Register
`/api/shiprocket/webhook` and send `SHIPROCKET_WEBHOOK_TOKEN` in
`x-shiprocket-token` or `x-api-key`.

Set `RETURN_WINDOW_DAYS` to the customer return-request period. Warehouse and
pickup details must exactly match the locations configured in Shiprocket.

## Email, SMS, and WhatsApp

Resend sends branded transactional email for:

- Order confirmation
- Shipping and delivery updates
- Password reset
- Newsletter welcome
- Abandoned-cart reminders

Verify the sending domain in Resend and set `RESEND_API_KEY`, `EMAIL_FROM`, and
`EMAIL_REPLY_TO`. Newsletter contacts are synchronized with the current Resend
Contacts API. `RESEND_SEGMENT_ID` is optional.

MSG91 sends SMS using a Flow template. Configure:

- `MSG91_AUTH_KEY`
- `MSG91_FLOW_ID`

The Flow must define `ORDER_NUMBER`, `STATUS`, and `TRACKING_URL` variables and
must be approved for the appropriate Indian DLT category.

Gupshup sends WhatsApp template messages. Configure:

- `GUPSHUP_API_KEY`
- `GUPSHUP_APP_NAME`
- `GUPSHUP_SOURCE_NUMBER`
- `GUPSHUP_ORDER_TEMPLATE_ID`

The approved template must accept order number, status, and tracking URL in that
order. Customers must explicitly enable “SMS and WhatsApp order updates” in
their account before mobile notifications are sent.

Provider calls fall back to server logs when credentials are absent so local
development does not send messages.

## Marketing automation

Newsletter submissions are stored locally before provider synchronization.
Abandoned-cart reminders are sent only to signed-in customers who explicitly
enabled “Occasional gifting notes.”

`vercel.json` invokes `/api/cron/abandoned-cart` hourly. Set a random
`CRON_SECRET`; Vercel sends it as a Bearer authorization header. Hourly cron
requires a Vercel plan that supports sub-daily schedules. On another host,
configure an equivalent authenticated GET request.

`ABANDONED_CART_DELAY_HOURS` controls inactivity delay. Keep one active
scheduler and monitor invocation logs for provider failures.

The referral-wallet mechanic is intentionally not enabled. Issuing wallet credit
without identity, order-completion, reversal, and abuse controls is not
launch-safe.

## SEO and analytics

The storefront includes:

- Per-page metadata and canonical URLs
- Open Graph and Twitter card metadata
- Product JSON-LD
- Dynamic `sitemap.xml` and `robots.txt`
- Meaningful image alt text
- GA4 page views and `add_to_cart`, `begin_checkout`, and `purchase` events
- Meta Pixel `PageView`, `AddToCart`, `InitiateCheckout`, and `Purchase` events

Set `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_GA_MEASUREMENT_ID`, and
`NEXT_PUBLIC_META_PIXEL_ID`. Analytics scripts are consent-gated and do not load
when the visitor chooses “Essential only.” Account, checkout, cart, wishlist,
and admin pages are excluded from search indexing.

## Security and performance

- Mutating APIs enforce same-origin requests; signed webhooks and server API-key
  requests are explicitly handled.
- Authentication and API requests are rate-limited. Production uses Upstash
  Redis; the memory fallback is suitable only for local or single-instance use.
- User and admin text fields are validated, length-limited, and sanitized.
- HTTPS, HSTS, CSP, frame denial, MIME sniffing protection, referrer policy, and
  permissions policy headers are configured.
- Images use `next/image` with AVIF/WebP support and remote-host allowlists.
- Below-fold images retain native lazy loading.

Set `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` for any
multi-instance deployment.

## Launch gate

Before production:

1. Apply migrations to a production-like PostgreSQL database and seed only
   intended data.
2. Run `npm run env:audit:strict`, `npm run lint`, and `npm run build`.
3. Test Razorpay in test mode, then repeat one low-value transaction in live
   mode.
4. Verify Razorpay and Shiprocket webhook signatures and delivery logs.
5. Send each Resend, MSG91, and Gupshup template to internal test recipients.
6. Run desktop and mobile browser QA for customer and admin journeys.
7. Run Lighthouse against the deployed production build and record actual
   mobile and desktop scores. A 90+ target is not considered met until measured.
8. Replace placeholder policy copy with counsel-reviewed India-specific legal,
   privacy, GST, shipping, and returns text.

See `docs/LAUNCH_CHECKLIST.md` for the detailed release checklist.
