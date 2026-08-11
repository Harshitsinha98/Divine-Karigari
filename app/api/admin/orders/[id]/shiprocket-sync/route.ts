import { NextResponse } from "next/server";
import { adminError, requireAdmin } from "@/lib/admin-api";
import { resyncShiprocketOrder } from "@/lib/shiprocket";
type Context = { params: { id: string } };
export async function POST(_: Request, { params }: Context) {
  const { error } = await requireAdmin(["ORDER_MANAGER"]);
  if (error) return error;
  try {
    return NextResponse.json({ data: await resyncShiprocketOrder(params.id) });
  } catch (caught) {
    return adminError(caught);
  }
}
