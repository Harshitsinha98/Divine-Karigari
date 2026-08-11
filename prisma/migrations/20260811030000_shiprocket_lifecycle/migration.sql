ALTER TYPE "OrderStatus" ADD VALUE IF NOT EXISTS 'RTO';
CREATE TYPE "ReturnRequestStatus" AS ENUM ('REQUESTED', 'APPROVED', 'REJECTED', 'SHIPPED', 'COMPLETED');
ALTER TABLE "Order" ADD COLUMN "shiprocketShipmentId" TEXT;
ALTER TABLE "Order" ADD COLUMN "courierName" TEXT;
ALTER TABLE "Order" ADD COLUMN "estimatedDeliveryDate" TIMESTAMP(3);
ALTER TABLE "Order" ADD COLUMN "shiprocketSyncError" TEXT;
ALTER TABLE "Order" ADD COLUMN "deliveredAt" TIMESTAMP(3);
CREATE TABLE "TrackingEvent" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "status" "OrderStatus" NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "location" TEXT,
  "happenedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "rawPayload" JSONB,
  CONSTRAINT "TrackingEvent_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "ReturnRequest" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "status" "ReturnRequestStatus" NOT NULL DEFAULT 'REQUESTED',
  "reason" TEXT NOT NULL,
  "notes" TEXT,
  "shiprocketReturnId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ReturnRequest_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Order_awbTrackingNumber_idx" ON "Order"("awbTrackingNumber");
CREATE INDEX "TrackingEvent_orderId_happenedAt_idx" ON "TrackingEvent"("orderId", "happenedAt");
CREATE UNIQUE INDEX "ReturnRequest_orderId_key" ON "ReturnRequest"("orderId");
CREATE INDEX "ReturnRequest_userId_status_idx" ON "ReturnRequest"("userId", "status");
ALTER TABLE "TrackingEvent" ADD CONSTRAINT "TrackingEvent_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ReturnRequest" ADD CONSTRAINT "ReturnRequest_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ReturnRequest" ADD CONSTRAINT "ReturnRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
