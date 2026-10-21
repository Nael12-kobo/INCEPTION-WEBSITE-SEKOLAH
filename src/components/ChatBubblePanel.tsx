"use client";

import { useEffect, useState } from "react";
import { Bot, Maximize2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ChatInput, ChatMessages } from "@/components/chat/ChatPanel";

/**
 * Panel chat yang di-mount hanya saat bubble dibuka (dimuat via
 * next/dynamic dari ChatBubble), supaya Radix Dialog + ChatPanel tidak ikut
 * ter-bundle di setiap halaman situs — termasuk /admin yang tidak memakai
 * bubble sama sekali.
 *
 * Default export diwajibkan `ssr: false` dipertahankan di sisi pemanggil:
 * dialog ini murni interaksi client.
 */
export default function ChatBubblePanel({
  open,
  onClose,
  onFullscreen,
}: {
  open: boolean;
  onClose: () => void;
  onFullscreen: () => void;
}) {
  /**
   * Keyboard iOS/Android: elemen `fixed` tidak ikut visual viewport —
   * baris input bisa tersembunyi di balik keyboard. Hitung tinggi keyboard
   * dari window.visualViewport lalu angkat panel sebesar itu (inline
   * `bottom` menimpa kelas, transform sengaja dihindari agar animasi
   * Radix tidak bentrok).
   */
  const [kbOffset, setKbOffset] = useState(0);
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const update = () => {
      const offset = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      // >120px = keyboard terbuka (bukan penyusutan toolbar biasa)
      setKbOffset(offset > 120 ? offset : 0);
    };
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    update();
    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
    };
  }, []);

  return (
    // Panel chat — tanpa overlay gelap, tanpa close ganda.
    // FIX double-close: DialogContent generik punya tombol Close bawaan —
    // di sini disembunyikan via `[&_button.absolute]:hidden`, sehingga hanya
    // tersisa 1 tombol X custom di header + 1 tombol fullscreen ke /chat.
    //
    // `open` dikendalikan dari ChatBubble dan panel ini tetap ter-mount
    // setelah pembukaan pertama: kalau di-unmount saat menutup, animasi
    // `data-state="closed"` tidak sempat jalan.
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent
        showCloseButton={false}
        style={{
          bottom: `calc(1.5rem + env(safe-area-inset-bottom) + ${kbOffset}px)`,
        }}
        className="chat-panel-content fixed bottom-[calc(1.5rem_+_env(safe-area-inset-bottom))] left-auto right-6 top-auto m-0 w-[calc(100vw-2rem)] translate-x-0 translate-y-0 gap-0 overflow-hidden rounded-2xl border-0 p-0 origin-bottom-right shadow-2xl sm:bottom-6 sm:w-[400px] [&>button.absolute]:hidden"
      >
        {/* Header — SATU-SATUNYA tombol close ada di sini */}
        <div className="bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 p-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-card/20 backdrop-blur-sm">
                <Bot className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <DialogTitle className="text-sm font-semibold">
                  Asisten Sekolah
                </DialogTitle>
                {/* Subtitle "Online • AI Gemini…" disembunyikan (permintaan
                    pemilik situs) — dipertahankan sebagai komentar agar mudah
                    diaktifkan kembali. truncate + min-w-0: bila ditampilkan
                    lagi, teks dipotong, bukan mendorong tombol close. */}
                {/* <p className="truncate text-[11px] text-blue-100 sm:text-xs">
                  Online • AI Gemini 3.5 Flash-Lite
                </p> */}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={onFullscreen}
                aria-label="Buka fullscreen"
                title="Fullscreen"
                className="h-9 w-9 text-white hover:bg-white/20 sm:h-8 sm:w-8"
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={onClose}
                aria-label="Tutup chat"
                title="Tutup"
                className="h-9 w-9 text-white hover:bg-white/20 sm:h-8 sm:w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Area pesan — dulu `h-[350px]` tetap: di HP landscape
            (tinggi ~375px) total dialog melebihi viewport dan
            terpotong. Dibatasi 50dvh supaya selalu muat. */}
        <div className="flex h-[min(350px,50dvh)] flex-col bg-gradient-to-b from-slate-50 to-slate-200/30">
          <ChatMessages compact />
        </div>

        <ChatInput />
        <DialogHeader className="sr-only">
          <DialogTitle>Panel chat asisten sekolah</DialogTitle>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
