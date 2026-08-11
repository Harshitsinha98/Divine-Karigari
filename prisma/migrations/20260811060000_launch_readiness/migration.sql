ALTER TABLE "Cart"
ADD COLUMN "abandonedReminderSentAt" TIMESTAMP(3);

CREATE TABLE "NewsletterSubscriber" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'website',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "consentedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unsubscribedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NewsletterSubscriber_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "NewsletterSubscriber_email_key"
ON "NewsletterSubscriber"("email");

CREATE INDEX "NewsletterSubscriber_active_consentedAt_idx"
ON "NewsletterSubscriber"("active", "consentedAt");

DROP INDEX IF EXISTS "CartItem_cartId_productId_variantId_key";

CREATE UNIQUE INDEX "CartItem_cartId_productId_variantId_customization_key"
ON "CartItem"("cartId", "productId", "variantId", "customization");
