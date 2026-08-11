import { getSessionUser } from "@/lib/auth";

export async function getApiUserId() {
  return (await getSessionUser())?.id ?? null;
}
