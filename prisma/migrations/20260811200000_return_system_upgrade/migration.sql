-- Add per-product return window
ALTER TABLE "Product" ADD COLUMN "returnWindowDays" INTEGER;

-- Add photos and return tracking fields to ReturnRequest
ALTER TABLE "ReturnRequest" ADD COLUMN "photos" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "ReturnRequest" ADD COLUMN "returnAwb" TEXT;
ALTER TABLE "ReturnRequest" ADD COLUMN "returnCourier" TEXT;

-- Create ReturnTrackingEvent table for reverse shipment tracking
CREATE TABLE "ReturnTrackingEvent" (
    "id" TEXT NOT NULL,
    "returnRequestId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "location" TEXT,
    "happenedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rawPayload" JSONB,

    CONSTRAINT "ReturnTrackingEvent_pkey" PRIMARY KEY ("id")
);

-- Create index on ReturnTrackingEvent
CREATE INDEX "ReturnTrackingEvent_returnRequestId_happenedAt_idx" ON "ReturnTrackingEvent"("returnRequestId", "happenedAt");

-- Add foreign key
ALTER TABLE "ReturnTrackingEvent" ADD CONSTRAINT "ReturnTrackingEvent_returnRequestId_fkey" FOREIGN KEY ("returnRequestId") REFERENCES "ReturnRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
