import { redirect } from "next/navigation";
import { getActiveAdmin } from "@/lib/admin-auth";
import { AdminShell } from "@/components/admin/AdminShell";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};
export default async function AdminPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getActiveAdmin();
  if (!admin) redirect("/admin/login");
  return (
    <AdminShell role={admin.role} email={admin.email}>
      {children}
    </AdminShell>
  );
}
