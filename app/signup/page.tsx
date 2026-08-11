import { AuthShell } from "@/components/auth/AuthShell";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Account",
  description:
    "Create a Divine Karigari account to save gifts, addresses, and order history.",
};
export default function SignupPage({
  searchParams,
}: {
  searchParams: { next?: string; error?: string };
}) {
  return (
    <AuthShell
      mode="signup"
      nextPath={searchParams.next}
      error={searchParams.error}
    />
  );
}
