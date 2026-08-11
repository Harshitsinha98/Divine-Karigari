import { AuthShell } from "@/components/auth/AuthShell";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset Password",
  robots: { index: false, follow: false },
};
export default function ResetPasswordPage({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  return <AuthShell mode="reset" token={searchParams.token} />;
}
