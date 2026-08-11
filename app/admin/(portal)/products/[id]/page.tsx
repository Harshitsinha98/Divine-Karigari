import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/ProductForm";
export default async function EditProductPage({
  params,
}: {
  params: { id: string };
}) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: { variants: true },
  });
  if (!product) notFound();
  return <ProductForm product={JSON.parse(JSON.stringify(product))} />;
}
