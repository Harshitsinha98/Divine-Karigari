import { NextResponse } from "next/server";

export function requireAdminApiKey(request: Request) {
  const expectedKey = process.env.ADMIN_API_KEY;
  const providedKey = request.headers.get("x-api-key");

  if (!expectedKey || !providedKey || providedKey !== expectedKey) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return null;
}

export function apiError(error: unknown) {
  console.error(error);
  return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
}
