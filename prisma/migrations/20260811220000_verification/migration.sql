-- User verification flags
ALTER TABLE "User" ADD COLUMN "emailVerified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN "phoneVerified" BOOLEAN NOT NULL DEFAULT false;

-- Email OTP table for verifying email addresses
CREATE TABLE "EmailOtp" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailOtp_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "EmailOtp_userId_idx" ON "EmailOtp"("userId");
CREATE INDEX "EmailOtp_email_idx" ON "EmailOtp"("email");

-- Backfill existing users: email login → email verified; otp login → phone verified
UPDATE "User" SET "emailVerified" = true WHERE "authProvider" IN ('email', 'google');
UPDATE "User" SET "phoneVerified" = true WHERE "authProvider" IN ('otp', 'firebase-otp');
