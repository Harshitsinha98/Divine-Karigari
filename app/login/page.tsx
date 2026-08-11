import { AuthShell } from "@/components/auth/AuthShell";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In",
  robots: { index: false },
};
export default function LoginPage({
  searchParams,
}: {
  searchParams: { next?: string };
}) {
  return <AuthShell mode="login" nextPath={searchParams.next} />;
}
