import { redirect } from "next/navigation";
import { getActiveAdmin, hasAdminRole } from "@/lib/admin-auth";

export default async function CategoryAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getActiveAdmin();
  if (!admin || !hasAdminRole(admin.role, ["INVENTORY_MANAGER"]))
    redirect("/admin");
  return children;
}
