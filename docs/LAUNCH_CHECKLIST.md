# Launch checklist

## Infrastructure

- [ ] Production PostgreSQL is provisioned, backed up, and restricted by
      network policy.
- [ ] All Prisma migrations apply successfully to a staging copy.
- [ ] `AUTH_SECRET`, `ADMIN_API_KEY`, `CRON_SECRET`, webhook secrets, and
      provider keys are unique production values.
- [ ] Upstash rate limiting is configured and verified across two application
      instances.
- [ ] `NEXT_PUBLIC_APP_URL` is the final HTTPS canonical domain.
- [ ] DNS, TLS, redirects, and `www`/apex canonical behavior are verified.

## Payments and shipping

- [ ] Razorpay test-mode payment succeeds and a failed/cancelled payment can be
      retried.
- [ ] Duplicate Razorpay callbacks do not duplicate orders or confirmations.
- [ ] Razorpay webhook signature failures return an error and do not confirm an
      order.
- [ ] Shiprocket serviceability returns a courier and delivery estimate for
      supported pincodes.
- [ ] Confirmed orders create Shiprocket shipments with correct weights,
      dimensions, tax, and address fields.
- [ ] AWB, label, pickup, tracking, RTO, and delivered updates are tested.
- [ ] Approved return requests create the expected Shiprocket return.
- [ ] Refunds are tested to original payment and wallet, including partial
      refunds.

## Communications and marketing

- [ ] Resend sending domain has SPF, DKIM, and DMARC configured.
- [ ] Order, shipping, delivery, password-reset, newsletter, and abandoned-cart
      emails render correctly in Gmail, Outlook, and iOS Mail.
- [ ] MSG91 Flow variables and Indian DLT registration are approved.
- [ ] Gupshup WhatsApp template is approved and explicit customer opt-in is
      retained.
- [ ] Opted-out customers receive no optional gifting or mobile updates.
- [ ] Abandoned-cart cron authorization and schedule are verified in production
      logs.
- [ ] Newsletter unsubscribe handling is configured in the selected Resend
      broadcast workflow.

## Storefront journey

- [ ] Browse, search, filter, sort, and paginate products on mobile and desktop.
- [ ] Open product gallery/lightbox and select every variant type.
- [ ] Add two different personalization notes for the same product variant.
- [ ] Add, update, remove, and merge guest cart and wishlist data after login.
- [ ] Add/select an address and verify pincode serviceability.
- [ ] Review subtotal, coupon, shipping, GST, and final total.
- [ ] Complete payment, see confirmation, receive notifications, and verify
      analytics purchase deduplication.
- [ ] Track order through delivered state, download invoice, reorder, request a
      return, and submit a review.

## Admin journey

- [ ] Confirm each role sees only authorized navigation and API operations.
- [ ] Create a category and product with images, variants, personalization,
      dimensions, and inventory.
- [ ] Import a valid CSV and reject malformed/oversized CSV data.
- [ ] Process an order, print invoice/label, re-sync Shiprocket, and update
      status.
- [ ] Moderate reviews and returns.
- [ ] Issue wallet goodwill credit and both refund destinations.
- [ ] Create/deactivate coupons and verify limits and expiry.
- [ ] Add/deactivate staff as super admin; block self-deactivation.
- [ ] Export sales and order reports and inspect spreadsheet encoding/columns.

## SEO, analytics, and performance

- [ ] Canonical metadata and social previews use the production domain.
- [ ] Product JSON-LD passes a structured-data validator.
- [ ] `sitemap.xml` contains active products and excludes private routes.
- [ ] `robots.txt` blocks account, checkout, and admin areas.
- [ ] GA4 DebugView receives page, cart, checkout, and one purchase event.
- [ ] Meta Events Manager receives matching events without duplicate purchase.
- [ ] Analytics scripts do not load before consent.
- [ ] Lighthouse is run on home, listing, product, cart, and checkout pages on
      mobile and desktop.
- [ ] Actual Lighthouse scores and any approved exceptions are attached to the
      release record.

## Legal and operations

- [ ] Privacy, terms, shipping, returns, cancellation, and personalization
      policies are finalized by counsel.
- [ ] GST invoice requirements and tax calculation are approved by accounting.
- [ ] Customer support ownership and escalation paths are documented.
- [ ] Backup restore, provider outage, payment dispute, RTO, and refund runbooks
      are rehearsed.
