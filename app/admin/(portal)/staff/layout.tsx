import { redirect } from "next/navigation";
import { getActiveAdmin, hasAdminRole } from "@/lib/admin-auth";

export default async function StaffAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getActiveAdmin();
  if (!admin || !hasAdminRole(admin.role, ["SUPER_ADMIN"])) redirect("/admin");
  return children;
}
