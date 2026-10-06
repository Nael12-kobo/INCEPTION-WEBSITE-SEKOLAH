"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { ChatBubble } from "@/components/ChatBubble";

/**
 * Chrome global (Navbar + tombol chat mengambang) hanya dirender di route
 * yang memang butuh. Dipisah dari root layout karena root layout tidak bisa
 * membaca pathname.
 *
 * Kenapa Navbar disembunyikan di route portal:
 * - /dashboard, /admin, /profile, /settings, /academic, /ppdb, /auth, /chat
 *   punya header sticky sendiri di `top-0` dengan z-index LEBIH RENDAH
 *   (z-20/z-30) daripada Navbar situs (z-40). Akibatnya dua baris nav
 *   memakan ±64px layar HP, dan setelah scroll header portal tertimpa
 *   Navbar → tombol hamburger portal tidak bisa dilihat/di-tap sama sekali.
 *
 * /settings dan /academic punya shell sendiri (ProfileShell dan
 * DashboardShell) yang sudah menyediakan hamburger, breadcrumb, user menu,
 * plus link "Portal Sekolah" ke `/` di dalam Sheet mobile — jadi keduanya
 * tidak butuh Navbar ganda.
 *
 * ChatBubble tidak ditampilkan di /chat karena posisinya (fixed
 * bottom-right) menimpa tombol kirim ChatInput.
 */
const SITE_PREFIXES = [
  "/jurusan",
  "/privacy-policy",
  "/terms-of-service",
];

function isSitePath(pathname: string): boolean {
  if (pathname === "/") return true;
  return SITE_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
}

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/";
  const isSite = isSitePath(pathname);
  const isChat = pathname === "/chat" || pathname.startsWith("/chat/");

  return (
    <>
      {isSite && <Navbar />}
      {children}
      {isSite && !isChat && <ChatBubble />}
    </>
  );
}
