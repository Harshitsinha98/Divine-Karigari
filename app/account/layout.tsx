import { redirect } from "next/navigation";
import { AccountNav } from "@/components/account/AccountNav";
import { AccountSessionSync } from "@/components/account/AccountSessionSync";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Account",
  robots: { index: false, follow: false },
};

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSessionUser();
  if (!session) redirect("/login?next=/account");
  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: { id: true, name: true },
  });
  if (!user) redirect("/login");
  return (
    <main className="container py-12 sm:py-20">
      <AccountSessionSync userId={user.id} />
      <div className="grid gap-10 lg:grid-cols-[220px_1fr] lg:gap-16">
        <AccountNav name={user.name ?? "there"} />
        <div>{children}</div>
      </div>
    </main>
  );
}
