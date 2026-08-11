-- Extend review moderation and return approval audit data.
ALTER TABLE "Review"
ADD COLUMN "rejectedAt" TIMESTAMP(3),
ADD COLUMN "adminReply" TEXT,
ADD COLUMN "repliedAt" TIMESTAMP(3),
ADD COLUMN "moderatedAt" TIMESTAMP(3),
ADD COLUMN "moderatedById" TEXT;

ALTER TABLE "ReturnRequest"
ADD COLUMN "adminNotes" TEXT,
ADD COLUMN "reviewedAt" TIMESTAMP(3),
ADD COLUMN "reviewedById" TEXT;

CREATE INDEX "Review_moderatedById_idx" ON "Review"("moderatedById");
CREATE INDEX "ReturnRequest_reviewedById_idx" ON "ReturnRequest"("reviewedById");

ALTER TABLE "Review" ADD CONSTRAINT "Review_moderatedById_fkey"
FOREIGN KEY ("moderatedById") REFERENCES "Staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ReturnRequest" ADD CONSTRAINT "ReturnRequest_reviewedById_fkey"
FOREIGN KEY ("reviewedById") REFERENCES "Staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;
