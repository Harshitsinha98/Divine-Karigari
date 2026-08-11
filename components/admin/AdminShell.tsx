"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  Boxes,
  FileBarChart,
  FolderTree,
  LogOut,
  Menu,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Star,
  TicketPercent,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
const links = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: BarChart3,
    roles: ["SUPER_ADMIN", "ORDER_MANAGER", "INVENTORY_MANAGER"],
  },
  {
    href: "/admin/products",
    label: "Products",
    icon: Boxes,
    roles: ["SUPER_ADMIN", "INVENTORY_MANAGER"],
  },
  {
    href: "/admin/categories",
    label: "Categories",
    icon: FolderTree,
    roles: ["SUPER_ADMIN", "INVENTORY_MANAGER"],
  },
  {
    href: "/admin/orders",
    label: "Orders",
    icon: ShoppingBag,
    roles: ["SUPER_ADMIN", "ORDER_MANAGER"],
  },
  {
    href: "/admin/customers",
    label: "Customers",
    icon: Users,
    roles: ["SUPER_ADMIN", "ORDER_MANAGER"],
  },
  {
    href: "/admin/coupons",
    label: "Coupons",
    icon: TicketPercent,
    roles: ["SUPER_ADMIN", "ORDER_MANAGER"],
  },
  {
    href: "/admin/reviews",
    label: "Reviews",
    icon: Star,
    roles: ["SUPER_ADMIN", "ORDER_MANAGER"],
  },
  {
    href: "/admin/returns",
    label: "Returns",
    icon: RotateCcw,
    roles: ["SUPER_ADMIN", "ORDER_MANAGER"],
  },
  {
    href: "/admin/reports",
    label: "Reports",
    icon: FileBarChart,
    roles: ["SUPER_ADMIN", "ORDER_MANAGER"],
  },
  {
    href: "/admin/staff",
    label: "Staff",
    icon: ShieldCheck,
    roles: ["SUPER_ADMIN"],
  },
];
export function AdminShell({
  children,
  role,
  email,
}: {
  children: React.ReactNode;
  role: string;
  email: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const logout = async () => {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };
  return (
    <div className="min-h-screen bg-[#efe4cd] text-ink">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 overflow-y-auto border-r border-sand-line bg-parchment p-5 pb-28 transition-transform lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between">
          <Link href="/admin" className="font-display text-2xl text-oxblood">
            Divine <span className="text-gold">Karigari</span>
          </Link>
          <button
            className="lg:hidden"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>
        <p className="mt-2 text-[10px] uppercase tracking-[.18em] text-muted-ink">
          Admin workspace
        </p>
        <nav className="mt-10 space-y-1">
          {links
            .filter((link) => link.roles.includes(role))
            .map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-soft px-3 py-3 text-sm",
                    pathname === link.href ||
                      (link.href !== "/admin" && pathname.startsWith(link.href))
                      ? "bg-ink text-parchment"
                      : "text-muted-ink hover:bg-sand-line/40 hover:text-ink",
                  )}
                >
                  <Icon size={17} />
                  {link.label}
                </Link>
              );
            })}
        </nav>
        <div className="fixed bottom-0 left-0 w-64 border-t border-sand-line bg-parchment p-5">
          <p className="truncate text-xs text-muted-ink">{email}</p>
          <button
            onClick={logout}
            className="mt-3 flex items-center gap-2 text-sm text-oxblood"
          >
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </aside>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-sand-line bg-parchment/95 px-5 backdrop-blur">
          <button
            className="lg:hidden"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={21} />
          </button>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden text-xs text-muted-ink sm:inline">
              {role.replaceAll("_", " ")}
            </span>
            <span
              className="h-2 w-2 rounded-full bg-tulsi"
              title="Active session"
            />
          </div>
        </header>
        <main className="p-5 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
