import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const strict = process.argv.includes("--strict");
const required = [
  "DATABASE_URL",
  "AUTH_SECRET",
  "NEXT_PUBLIC_APP_URL",
  "RAZORPAY_KEY_ID",
  "RAZORPAY_KEY_SECRET",
  "RAZORPAY_WEBHOOK_SECRET",
  "SHIPROCKET_EMAIL",
  "SHIPROCKET_PASSWORD",
  "SHIPROCKET_WEBHOOK_TOKEN",
  "RESEND_API_KEY",
  "EMAIL_FROM",
  "CRON_SECRET",
  "UPSTASH_REDIS_REST_URL",
  "UPSTASH_REDIS_REST_TOKEN",
];
const recommended = [
  "NEXT_PUBLIC_GA_MEASUREMENT_ID",
  "NEXT_PUBLIC_META_PIXEL_ID",
  "RESEND_SEGMENT_ID",
  "MSG91_AUTH_KEY",
  "MSG91_FLOW_ID",
  "GUPSHUP_API_KEY",
  "GUPSHUP_APP_NAME",
  "GUPSHUP_SOURCE_NUMBER",
  "GUPSHUP_ORDER_TEMPLATE_ID",
];
const missing = required.filter((name) => !process.env[name]);
const warnings = recommended.filter((name) => !process.env[name]);
const unsafePublic = Object.keys(process.env).filter(
  (name) =>
    name.startsWith("NEXT_PUBLIC_") &&
    /(SECRET|PASSWORD|TOKEN|PRIVATE|AUTH_KEY)/.test(name),
);

function files(directory) {
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    return statSync(path).isDirectory() ? files(path) : [path];
  });
}

const clientSecretReferences = ["app", "components"]
  .filter((directory) => {
    try {
      return statSync(directory).isDirectory();
    } catch {
      return false;
    }
  })
  .flatMap(files)
  .filter((path) => /\.[jt]sx?$/.test(path))
  .filter((path) => {
    const source = readFileSync(path, "utf8");
    return (
      source.includes('"use client"') &&
      /process\.env\.(?!NEXT_PUBLIC_)[A-Z0-9_]+/.test(source)
    );
  });

console.log(`Required variables missing: ${missing.length}`);
missing.forEach((name) => console.log(`- ${name}`));
console.log(`Recommended integrations missing: ${warnings.length}`);
warnings.forEach((name) => console.log(`- ${name}`));
if (unsafePublic.length) {
  console.log("Unsafe public environment variable names:");
  unsafePublic.forEach((name) => console.log(`- ${name}`));
}
if (clientSecretReferences.length) {
  console.log("Server environment references found in client modules:");
  clientSecretReferences.forEach((path) => console.log(`- ${path}`));
}

const failed =
  missing.length > 0 ||
  unsafePublic.length > 0 ||
  clientSecretReferences.length > 0;
if (strict && failed) process.exitCode = 1;
