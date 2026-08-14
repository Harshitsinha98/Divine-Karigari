import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-api";
import { prisma } from "@/lib/prisma";
import { generateShiprocketManifest } from "@/lib/shiprocket";

type Context = { params: { id: string } };

export async function GET(_: Request, { params }: Context) {
  const { error } = await requireAdmin(["ORDER_MANAGER"]);
  if (error) return error;

  let order = await prisma.order.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      awbTrackingNumber: true,
      manifestUrl: true,
      shiprocketShipmentId: true,
    },
  });
  if (!order) return new Response("Order not found", { status: 404 });

  if (!order.awbTrackingNumber || !order.shiprocketShipmentId) {
    return new Response(
      "A Shiprocket AWB must be assigned before its manifest can be generated.",
      { status: 409 },
    );
  }

  if (!order.manifestUrl) {
    try {
      await generateShiprocketManifest(order.id, order.shiprocketShipmentId);
    } catch (caught) {
      const message =
        caught instanceof Error
          ? caught.message
          : "Shiprocket manifest generation failed.";
      return new Response(message, { status: 502 });
    }
    order = await prisma.order.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        awbTrackingNumber: true,
        manifestUrl: true,
        shiprocketShipmentId: true,
      },
    });
  }

  if (!order?.manifestUrl) {
    return new Response("Shiprocket did not return a manifest document.", {
      status: 502,
    });
  }

  return NextResponse.redirect(order.manifestUrl);
}
