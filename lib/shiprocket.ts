import { prisma } from "@/lib/prisma";

type AddressSnapshot = {
  recipientName: string;
  phone: string;
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
};
const baseUrl = "https://apiv2.shiprocket.in/v1/external";
const configured = () =>
  Boolean(
    process.env.SHIPROCKET_EMAIL &&
    process.env.SHIPROCKET_PASSWORD &&
    process.env.SHIPROCKET_PICKUP_LOCATION,
  );
const addressOf = (value: unknown) => value as AddressSnapshot;
const number = (value: unknown, fallback: number) =>
  value === null || value === undefined ? fallback : Number(value);

async function getToken() {
  if (!configured()) throw new Error("Shiprocket is not configured.");
  const response = await fetch(`${baseUrl}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: process.env.SHIPROCKET_EMAIL,
      password: process.env.SHIPROCKET_PASSWORD,
    }),
  });
  if (!response.ok) throw new Error("Shiprocket authentication failed.");
  const data = await response.json();
  if (!data.token)
    throw new Error("Shiprocket did not return an access token.");
  return data.token as string;
}

async function shiprocketFetch(path: string, init: RequestInit = {}) {
  const token = await getToken();
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok)
    throw new Error(data.message ?? data.error ?? "Shiprocket request failed.");
  return data;
}

function packageMetrics(
  items: {
    quantity: number;
    product: {
      weightGrams: number | null;
      lengthCm: unknown;
      widthCm: unknown;
      heightCm: unknown;
    };
  }[],
) {
  return {
    weightKg: Math.max(
      0.1,
      items.reduce(
        (sum, item) => sum + (item.product.weightGrams ?? 300) * item.quantity,
        0,
      ) / 1000,
    ),
    length: Math.max(
      10,
      ...items.map((item) => number(item.product.lengthCm, 10)),
    ),
    breadth: Math.max(
      10,
      ...items.map((item) => number(item.product.widthCm, 10)),
    ),
    height: Math.max(
      5,
      ...items.map((item) => number(item.product.heightCm, 5)),
    ),
  };
}

export async function checkShiprocketServiceability(
  deliveryPincode: string,
  items: {
    product: {
      weightGrams: number | null;
      lengthCm: unknown;
      widthCm: unknown;
      heightCm: unknown;
    };
    quantity: number;
  }[],
) {
  if (!configured() || !process.env.SHIPROCKET_PICKUP_PINCODE) return null;
  const metrics = packageMetrics(items);
  const query = new URLSearchParams({
    pickup_postcode: process.env.SHIPROCKET_PICKUP_PINCODE,
    delivery_postcode: deliveryPincode,
    cod: "0",
    weight: String(metrics.weightKg),
  });
  const data = await shiprocketFetch(
    `/courier/serviceability/?${query.toString()}`,
    { method: "GET" },
  );
  const couriers =
    data.data?.available_courier_companies ??
    data.available_courier_companies ??
    [];
  // Log raw etd for debugging delivery days parsing
  if (couriers.length > 0) {
    console.log("[shiprocket] Raw courier[0] etd:", couriers[0].etd, "estimated_delivery_days:", couriers[0].estimated_delivery_days);
  }
  if (!couriers.length)
    return {
      available: false,
      estimatedDays: null,
      courierName: null,
      estimatedDeliveryDate: null,
    };
  // Pick the cheapest available courier for the customer-facing estimate
  const sorted = [...couriers].sort(
    (a, b) =>
      Number(a.rate ?? a.freight_charge ?? 0) -
      Number(b.rate ?? b.freight_charge ?? 0),
  );
  const courier = sorted[0];

  // Shiprocket returns etd in various formats:
  //  - "3-5" (range string)
  //  - "5" (plain number string)
  //  - "Jan 17, 2026" (date string)
  //  - or a numeric field estimated_delivery_days
  let days: number | null = null;
  const etdRaw = courier.etd ?? courier.estimated_delivery_days;
  if (etdRaw !== undefined && etdRaw !== null) {
    const etdStr = String(etdRaw).trim();
    // Try parsing "3-5" → take the max (5)
    const rangeMatch = etdStr.match(/^(\d+)\s*[-–]\s*(\d+)$/);
    if (rangeMatch) {
      days = Number(rangeMatch[2]);
    } else {
      // Try as pure number
      const num = Number(etdStr);
      if (!isNaN(num) && num > 0) {
        days = num;
      } else {
        // Try parsing as a date and compute diff from today
        const etdDate = new Date(etdStr);
        if (!isNaN(etdDate.getTime())) {
          const diffMs = etdDate.getTime() - Date.now();
          days = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
        }
      }
    }
  }
  // Final fallback only if nothing could be parsed
  if (!days || days <= 0) days = 5;

  const rate =
    Number(courier.rate ?? courier.freight_charge ?? 0) || null;
  const estimated = new Date();
  estimated.setDate(estimated.getDate() + days);
  return {
    available: true,
    estimatedDays: days,
    courierName: courier.courier_name ?? courier.name ?? null,
    rate,
    estimatedDeliveryDate: estimated,
  };
}

export async function createShiprocketOrderForOrder(orderId: string) {
  const claim = await prisma.order.updateMany({
    where: { id: orderId, shiprocketOrderId: null, shiprocketSyncError: null },
    data: { shiprocketSyncError: "Shiprocket sync in progress" },
  });
  if (!claim.count) return;
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: true,
      items: { include: { product: true, variant: true } },
    },
  });
  if (!order || order.status === "CANCELLED") return;
  if (!configured()) {
    await prisma.order.update({
      where: { id: orderId },
      data: {
        shiprocketSyncError: "Shiprocket credentials are not configured.",
      },
    });
    return;
  }
  try {
    const address = addressOf(order.shippingAddress);
    const metrics = packageMetrics(order.items);
    const payload = {
      order_id: order.orderNumber,
      order_date: order.createdAt.toISOString().slice(0, 19).replace("T", " "),
      pickup_location: process.env.SHIPROCKET_PICKUP_LOCATION,
      comment: "Divine Karigari order",
      billing_customer_name: address.recipientName,
      billing_last_name: "",
      billing_address: address.line1,
      billing_address_2: address.line2 ?? "",
      billing_city: address.city,
      billing_pincode: address.postalCode,
      billing_state: address.state,
      billing_country: address.country ?? "India",
      billing_email: order.user.email,
      billing_phone: address.phone,
      shipping_is_billing: true,
      order_items: order.items.map((item) => ({
        name: item.productName,
        sku: item.sku,
        units: item.quantity,
        selling_price: Number(item.unitPrice),
        discount: "",
        tax: "",
        hsn: "",
      })),
      payment_method: "Prepaid",
      sub_total: Number(order.total),
      length: metrics.length,
      breadth: metrics.breadth,
      height: metrics.height,
      weight: metrics.weightKg,
    };
    const created = await shiprocketFetch("/orders/create/adhoc", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    const shiprocketOrderId = String(
      created.order_id ?? created.data?.order_id ?? "",
    );
    const shipmentId = String(
      created.shipment_id ?? created.data?.shipment_id ?? "",
    );
    if (!shiprocketOrderId || !shipmentId)
      throw new Error("Shiprocket did not return an order or shipment ID.");
    await prisma.order.update({
      where: { id: order.id },
      data: {
        shiprocketOrderId,
        shiprocketShipmentId: shipmentId,
        shiprocketSyncError: null,
        status: "PROCESSING",
        trackingEvents: {
          create: {
            status: "PROCESSING",
            title: "Order is being prepared",
            description: "Your order has been sent to our delivery partner.",
          },
        },
      },
    });
    const assigned = await shiprocketFetch("/courier/assign/awb", {
      method: "POST",
      body: JSON.stringify({ shipment_id: shipmentId }),
    });
    const assignment = assigned.response?.data ?? assigned.data ?? assigned;
    const awb = assignment.awb_code ?? assignment.awb;
    if (awb) {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          awbTrackingNumber: String(awb),
          courierName:
            assignment.courier_name ?? assignment.courier_company_name ?? null,
          status: "SHIPPED",
          trackingEvents: {
            create: {
              status: "SHIPPED",
              title: "Shipment ready",
              description: `AWB ${awb} assigned via ${assignment.courier_name ?? "courier"}.`,
            },
          },
        },
      });
      // Auto-generate shipping label + request pickup
      await generateShiprocketLabelAndPickup(order.id, shipmentId);
    }
  } catch (error) {
    await prisma.order.update({
      where: { id: orderId },
      data: {
        shiprocketSyncError:
          error instanceof Error
            ? error.message
            : "Shiprocket order creation failed.",
      },
    });
  }
}

/**
 * Generates the shipping label PDF and requests pickup for a shipment.
 * Stores the label_url and manifest_url on the order.
 * Safe to call multiple times — failures are non-fatal (logged only).
 */
export async function generateShiprocketLabelAndPickup(
  orderId: string,
  shipmentId: string,
) {
  // 1) Generate label
  try {
    const labelRes = await shiprocketFetch("/courier/generate/label", {
      method: "POST",
      body: JSON.stringify({ shipment_id: [Number(shipmentId)] }),
    });
    const labelUrl = labelRes.label_url ?? labelRes.data?.label_url ?? null;
    if (labelUrl)
      await prisma.order.update({
        where: { id: orderId },
        data: { labelUrl: String(labelUrl) },
      });
  } catch (error) {
    console.error("[shiprocket] Label generation failed:", error);
  }

  // 2) Request pickup (non-fatal)
  try {
    await shiprocketFetch("/courier/generate/pickup", {
      method: "POST",
      body: JSON.stringify({ shipment_id: [Number(shipmentId)] }),
    });
  } catch (error) {
    console.error("[shiprocket] Pickup request failed:", error);
  }

  // 3) Generate manifest (non-fatal)
  try {
    const manifestRes = await shiprocketFetch("/manifests/generate", {
      method: "POST",
      body: JSON.stringify({ shipment_id: [Number(shipmentId)] }),
    });
    const manifestUrl =
      manifestRes.manifest_url ?? manifestRes.data?.manifest_url ?? null;
    if (manifestUrl)
      await prisma.order.update({
        where: { id: orderId },
        data: { manifestUrl: String(manifestUrl) },
      });
  } catch (error) {
    console.error("[shiprocket] Manifest generation failed:", error);
  }
}

/**
 * Fetches live tracking data from Shiprocket for a given AWB.
 * Returns the tracking activities array or null.
 */
export async function trackShiprocketAwb(awb: string) {
  if (!configured()) return null;
  try {
    const data = await shiprocketFetch(`/courier/track/awb/${awb}`, {
      method: "GET",
    });
    const tracking = data.tracking_data ?? data;
    return {
      currentStatus: tracking.shipment_track?.[0]?.current_status ?? null,
      awb,
      activities: (tracking.shipment_track_activities ?? []).map(
        (a: {
          date?: string;
          activity?: string;
          location?: string;
          status?: string;
        }) => ({
          date: a.date ?? null,
          activity: a.activity ?? null,
          location: a.location ?? null,
          status: a.status ?? null,
        }),
      ),
    };
  } catch (error) {
    console.error("[shiprocket] Track AWB failed:", error);
    return null;
  }
}

/** Retries creation or AWB assignment from the admin order workspace. */
export async function resyncShiprocketOrder(orderId: string) {
  const existing = await prisma.order.findUnique({ where: { id: orderId } });
  if (!existing) throw new Error("Order not found.");
  if (existing.status === "CANCELLED")
    throw new Error("Cancelled orders cannot be synced to Shiprocket.");

  if (!existing.shiprocketOrderId) {
    await prisma.order.update({
      where: { id: orderId },
      data: { shiprocketSyncError: null },
    });
    await createShiprocketOrderForOrder(orderId);
  } else if (existing.shiprocketShipmentId && !existing.awbTrackingNumber) {
    try {
      const assigned = await shiprocketFetch("/courier/assign/awb", {
        method: "POST",
        body: JSON.stringify({ shipment_id: existing.shiprocketShipmentId }),
      });
      const assignment = assigned.response?.data ?? assigned.data ?? assigned;
      await prisma.order.update({
        where: { id: orderId },
        data: {
          awbTrackingNumber: assignment.awb_code ?? assignment.awb ?? null,
          courierName:
            assignment.courier_name ?? assignment.courier_company_name ?? null,
          shiprocketSyncError: null,
        },
      });
    } catch (error) {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          shiprocketSyncError:
            error instanceof Error
              ? error.message
              : "Shiprocket AWB assignment failed.",
        },
      });
    }
  }
  return prisma.order.findUnique({ where: { id: orderId } });
}

export async function createShiprocketReturnForOrder(orderId: string) {
  const request = await prisma.returnRequest.findUnique({
    where: { orderId },
    include: {
      order: { include: { user: true, items: { include: { product: true } } } },
    },
  });
  if (!request || request.status !== "APPROVED")
    throw new Error("An approved return request was not found.");
  if (request.shiprocketReturnId) return request;
  if (!configured()) throw new Error("Shiprocket is not configured.");
  const address = addressOf(request.order.shippingAddress);
  const metrics = packageMetrics(request.order.items);
  const requiredWarehouse = [
    process.env.SHIPROCKET_RETURN_CONTACT_NAME,
    process.env.SHIPROCKET_RETURN_ADDRESS,
    process.env.SHIPROCKET_RETURN_CITY,
    process.env.SHIPROCKET_RETURN_STATE,
    process.env.SHIPROCKET_RETURN_PINCODE,
    process.env.SHIPROCKET_RETURN_PHONE,
  ];
  if (requiredWarehouse.some((value) => !value))
    throw new Error("Shiprocket return warehouse details are not configured.");

  const payload = {
    order_id: `${request.order.orderNumber}-RETURN`,
    order_date: new Date().toISOString().slice(0, 19).replace("T", " "),
    pickup_customer_name: address.recipientName,
    pickup_address: address.line1,
    pickup_address_2: address.line2 ?? "",
    pickup_city: address.city,
    pickup_state: address.state,
    pickup_country: address.country ?? "India",
    pickup_pincode: address.postalCode,
    pickup_email: request.order.user.email,
    pickup_phone: address.phone,
    shipping_customer_name: process.env.SHIPROCKET_RETURN_CONTACT_NAME,
    shipping_address: process.env.SHIPROCKET_RETURN_ADDRESS,
    shipping_address_2: process.env.SHIPROCKET_RETURN_ADDRESS_2 ?? "",
    shipping_city: process.env.SHIPROCKET_RETURN_CITY,
    shipping_state: process.env.SHIPROCKET_RETURN_STATE,
    shipping_country: process.env.SHIPROCKET_RETURN_COUNTRY ?? "India",
    shipping_pincode: process.env.SHIPROCKET_RETURN_PINCODE,
    shipping_email:
      process.env.SHIPROCKET_RETURN_EMAIL ?? process.env.SHIPROCKET_EMAIL,
    shipping_phone: process.env.SHIPROCKET_RETURN_PHONE,
    order_items: request.order.items.map((item) => ({
      name: item.productName,
      sku: item.sku,
      units: item.quantity,
      selling_price: Number(item.unitPrice),
      discount: 0,
      tax: 0,
      hsn: "",
    })),
    payment_method: "PREPAID",
    sub_total: Number(request.order.total),
    length: metrics.length,
    breadth: metrics.breadth,
    height: metrics.height,
    weight: metrics.weightKg,
  };
  const created = await shiprocketFetch("/orders/create/return", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  const returnId = String(
    created.order_id ?? created.data?.order_id ?? created.return_order_id ?? "",
  );
  if (!returnId)
    throw new Error("Shiprocket did not return a return order ID.");
  return prisma.returnRequest.update({
    where: { id: request.id },
    data: { shiprocketReturnId: returnId },
  });
}
