import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Sign In",
  robots: { index: false, follow: false },
};
import { getActiveAdmin } from "@/lib/admin-auth";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: { next?: string };
}) {
  if (await getActiveAdmin()) redirect("/admin");
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#efe5d2] px-5 py-12">
      <div className="w-full max-w-md">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-oxblood">
          Divine Karigari
        </p>
        <h1 className="mt-3 font-display text-4xl">Admin portal</h1>
        <p className="mt-3 text-sm leading-6 text-muted-ink">
          Sign in with an active staff account to manage store operations.
        </p>
        <AdminLoginForm nextPath={searchParams.next} />
      </div>
    </main>
  );
}
