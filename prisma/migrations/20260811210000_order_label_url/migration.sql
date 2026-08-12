-- Add shipping label and manifest URLs to Order
ALTER TABLE "Order" ADD COLUMN "labelUrl" TEXT;
ALTER TABLE "Order" ADD COLUMN "manifestUrl" TEXT;
