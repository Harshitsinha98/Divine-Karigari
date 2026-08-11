"use client";
import { useEffect } from "react";
import { useCommerce } from "@/components/commerce/CommerceProvider";
export function AccountSessionSync({ userId }: { userId: string }) {
  const { syncGuestData } = useCommerce();
  useEffect(() => {
    void syncGuestData(userId);
  }, [syncGuestData, userId]);
  return null;
}
