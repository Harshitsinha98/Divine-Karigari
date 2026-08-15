"use client";
import { usePathname } from "next/navigation";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/commerce/CartDrawer";
import { CommerceToast } from "@/components/commerce/CommerceToast";
import { ChatWidget } from "@/components/chat/ChatWidget";
export function SiteChrome({ children }: { children: React.ReactNode }) {
  const admin = usePathname().startsWith("/admin");
  if (admin) return <>{children}</>;
  return (
    <>
      <AnnouncementBar />
      <Header />
      {children}
      <Footer />
      <CartDrawer />
      <CommerceToast />
      <ChatWidget />
    </>
  );
}
