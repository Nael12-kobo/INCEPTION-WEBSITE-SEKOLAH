"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

// ChatBubble (dan seluruh panel chat: Radix Dialog, ChatPanel, MarkdownLite,
// chat-store) dimuat sebagai chunk terpisah yang tidak menghambat hydrasi
// halaman — signifikan untuk TTI di HP kelas menengah.
const ChatBubble = dynamic(
  () => import("@/components/ChatBubble").then((m) => m.ChatBubble),
  { ssr: false }
);

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
  // Halaman profil guru — punya Navbar situs (bukan route portal).
  "/guru-karyawan",
  // Halaman sejarah sekolah — Navbar situs + chat bubble.
  "/sejarah",
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
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-card focus:px-4 focus:py-3 focus:font-semibold focus:text-foreground focus:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        Lewati ke konten utama
      </a>
      {isSite && <Navbar />}
      <div id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">
        {children}
      </div>
      {/* Footer situs: cukup di sini — termasuk halaman home (dulu dirender
          manual di src/app/page.tsx, jadi halaman /jurusan, /sejarah,
          /guru-karyawan, dan legal tidak punya footer). Route portal
          (/dashboard, /admin, /auth, /ppdb, /chat, dst.) tidak ikut karena
          bukan isSitePath. */}
      {isSite && <Footer />}
      {isSite && !isChat && <ChatBubble />}
    </>
  );
}
