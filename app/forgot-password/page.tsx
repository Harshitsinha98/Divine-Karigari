import { AuthShell } from "@/components/auth/AuthShell";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forgot Password",
  robots: { index: false },
};
export default function ForgotPasswordPage() {
  return <AuthShell mode="forgot" />;
}
