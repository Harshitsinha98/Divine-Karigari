import { notFound } from "next/navigation";
import { CustomerProfile } from "@/components/admin/CustomerProfile";
import { prisma } from "@/lib/prisma";

export default async function CustomerPage({
  params,
}: {
  params: { id: string };
}) {
  const customer = await prisma.user.findFirst({
    where: { id: params.id, role: "CUSTOMER" },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      createdAt: true,
      addresses: { orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }] },
      wallet: {
        include: { transactions: { orderBy: { createdAt: "desc" }, take: 30 } },
      },
      orders: {
        select: {
          id: true,
          orderNumber: true,
          status: true,
          paymentStatus: true,
          total: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!customer) notFound();
  return <CustomerProfile initial={JSON.parse(JSON.stringify(customer))} />;
}
