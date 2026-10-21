"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Bubble chat melayang.
 *
 * Panel dialog (Radix Dialog + ChatPanel + MarkdownLite) dimuat via
 * next/dynamic HANYA saat bubble dibuka pertama kali — bundel halaman
 * situs tidak memikulnya (hemat JS di HP). Setelah ter-mount, panel TIDAK
 * di-unmount lagi saat menutup supaya animasi `data-state="closed"`
 * tetap sempat jalan. FIX double-close: tombol Close bawaan Radix
 * disembunyikan di ChatBubblePanel via `[&_button.absolute]:hidden`.
 */
const ChatBubblePanel = dynamic(() => import("./ChatBubblePanel"), {
  ssr: false,
});

function ChatBubbleInner() {
  const [isOpen, setIsOpen] = useState(false);
  const [panelLoaded, setPanelLoaded] = useState(false);
  const router = useRouter();

  const goFullscreen = () => {
    setIsOpen(false);
    router.push("/chat");
  };

  const open = () => {
    setPanelLoaded(true);
    setIsOpen(true);
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={open}
        className={cn(
          // bottom dihitung dari env(safe-area-inset-bottom) supaya tombol
          // tidak tertimpa home indicator iPhone (viewportFit=cover aktif)
          "fixed bottom-[calc(1.5rem_+_env(safe-area-inset-bottom))] right-6 z-50 flex h-16 w-16 items-center justify-center rounded-full",
          "bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 text-white shadow-2xl",
          "transition-all duration-300 ease-out hover:scale-110 hover:shadow-blue-500/50",
          "animate-bounce-slow",
          isOpen && "scale-0 opacity-0",
        )}
        aria-label="Buka Chat"
      >
        <div className="relative">
          <MessageCircle className="h-7 w-7" />
          <Sparkles className="absolute -right-1 -top-1 h-3 w-3 animate-pulse text-yellow-300" />
        </div>
        {/* Badge unread sengaja disembunyikan (permintaan pemilik situs) —
            struktur dipertahankan agar mudah diaktifkan kembali. Saat
            diaktifkan, hitung dari useChat().messages lalu tampilkan di sini. */}
      </button>

      {panelLoaded && (
        <ChatBubblePanel
          open={isOpen}
          onClose={() => setIsOpen(false)}
          onFullscreen={goFullscreen}
        />
      )}
    </>
  );
}

export function ChatBubble() {
  return <ChatBubbleInner />;
}
