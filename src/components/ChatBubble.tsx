"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { useRouter } from "next/navigation";
import {
  Bot,
  ExternalLink,
  Maximize2,
  MessageCircle,
  Minimize2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { ChatInput, ChatMessages } from "@/components/chat/ChatPanel";
import {
  enterPanel,
  exitPanel,
  morphIn,
  prefersReducedMotion,
  softenSwap,
} from "@/lib/chat-motion";
import Image from "next/image";
// import dynamic from "next/dynamic";
// import { mod } from "three/src/nodes/TSL.js";

/**
 * Bubble chat melayang dengan transisi ringkas:
 * - dibuka/ditutup → panel naik sedikit sambil fade, tanpa meregang dari bubble,
 * - fullscreen → panel morph ukuran & posisi, konten berganti dengan lembut.
 *
 * Semua morph memakai transform/opacity (Web Animations API) sehingga
 * tidak ada layout thrash; di perangkat yang meminta reduced-motion
 * animasi dilewati dan panel langsung tampil.
 *
 * FIX double-close: DialogContent generik punya tombol Close bawaan —
 * disembunyikan via `[&>button.absolute]:hidden`, jadi hanya ada satu X
 * custom di header.
 */
// const ChatBubble = dynamic(
//   () => import("@/components/ChatBubble").then((mod) => mod.ChatBubble),
//   { ssr: false },
// );

function ChatBubbleInner() {
  const [isOpen, setIsOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [closing, setClosing] = useState(false);
  const router = useRouter();

  const fabRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  /** Rect awal untuk morph compact ↔ fullscreen. */
  const toggleRect = useRef<DOMRect | null>(null);
  const panelAnim = useRef<Animation | null>(null);
  const closeTimer = useRef<number | null>(null);
  const hasOpened = useRef(false);

  const clearCloseTimer = () => {
    if (closeTimer.current !== null) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  useEffect(
    () => () => {
      if (closeTimer.current !== null) {
        window.clearTimeout(closeTimer.current);
      }
      panelAnim.current?.cancel();
    },
    [],
  );

  const openChat = useCallback(() => {
    if (isOpen) return;
    clearCloseTimer();
    hasOpened.current = true;
    setClosing(false);
    setIsOpen(true);
  }, [isOpen]);

  /** Tutup dengan fade dan gerak pendek ke bawah. */
  const requestClose = useCallback(() => {
    if (!isOpen || closing) return;
    clearCloseTimer();
    // Buang rect toggle agar tidak memicu morph saat `expanded` di-reset.
    toggleRect.current = null;

    const el = panelRef.current;
    if (!el || prefersReducedMotion()) {
      setIsOpen(false);
      setExpanded(false);
      return;
    }

    setClosing(true);
    panelAnim.current = exitPanel(el, 220);
    closeTimer.current = window.setTimeout(() => {
      setIsOpen(false);
      setExpanded(false);
      setClosing(false);
      panelAnim.current = null;
    }, 220);
  }, [isOpen, closing]);

  /**
   * Entrance dijalankan dari ref callback, bukan useLayoutEffect:
   * Radix Dialog menunda mount kontennya (Presence), sehingga ref panel
   * masih null saat layout effect parent berjalan. Ref callback dipanggil
   * tepat ketika panel benar-benar ada di DOM.
   */
  const attachPanel = useCallback((node: HTMLDivElement | null) => {
    panelRef.current = node;
    if (!node) return;
    panelAnim.current = enterPanel(node, 320);
  }, []);

  /** Morph compact ↔ fullscreen: ukuran dan posisi berubah tanpa blur. */
  useLayoutEffect(() => {
    const el = panelRef.current;
    const from = toggleRect.current;
    // Sama seperti pembukaan: biarkan rect tersimpan agar aman terhadap
    // double-invoke effect di Strict Mode (dev). Ditimpa saat toggle berikutnya.
    if (!el || !from) return;
    const anim = morphIn(el, from, { duration: 380 });
    panelAnim.current = anim;
    const fade = softenSwap(contentRef.current, 200);
    return () => {
      anim?.cancel();
      fade?.cancel();
      if (panelAnim.current === anim) panelAnim.current = null;
    };
  }, [expanded]);

  const toggleExpanded = useCallback(() => {
    const el = panelRef.current;
    if (el) toggleRect.current = el.getBoundingClientRect();
    setExpanded((v) => !v);
  }, []);

  /** Tombol "buka halaman chat" — animasikan keluar dulu agar tidak patah. */
  const goFullPage = useCallback(() => {
    if (closing) return;
    setClosing(true);
    toggleRect.current = null;
    const finish = () => {
      setIsOpen(false);
      setExpanded(false);
      setClosing(false);
      clearCloseTimer();
      panelAnim.current = null;
      router.push("/chat");
    };
    const el = panelRef.current;
    panelAnim.current =
      el && !prefersReducedMotion() ? exitPanel(el, 260) : null;
    const anim = panelAnim.current;
    if (anim) {
      anim.finished.catch(() => {}).finally(finish);
    } else {
      finish();
    }
  }, [closing, router]);

  // Kembalikan fokus ke bubble setelah panel tertutup (aksesibilitas).
  useEffect(() => {
    if (!isOpen && hasOpened.current) {
      fabRef.current?.focus({ preventScroll: true });
    }
  }, [isOpen]);

  return (
    <>
      {/* ===== Floating bubble ===== */}
      <button
        ref={fabRef}
        type="button"
        onClick={openChat}
        aria-label="Buka chat asisten sekolah"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        title="Tanya asisten sekolah"
        className={cn(
          // bottom dihitung dari env(safe-area-inset-bottom) supaya tombol
          // tidak tertimpa home indicator iPhone (viewportFit=cover aktif).
          "chat-fab group fixed bottom-[calc(1.5rem_+_env(safe-area-inset-bottom))] right-6 z-50 flex h-16 w-16 items-center justify-center rounded-full",
          "bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 text-white shadow-2xl shadow-blue-600/30 ring-1 ring-white/30",
          "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-400/40 focus-visible:ring-offset-2",
          // Bubble baru muncul lagi setelah panel selesai menutup agar kedua
          // elemen tidak bertumpuk di sudut kanan bawah.
          isOpen && "pointer-events-none scale-90 opacity-0",
        )}
      >
        <span className="chat-fab-entry pointer-events-none absolute inset-0">
          <span
            className="chat-fab-halo absolute inset-0 rounded-full"
            aria-hidden
          />
          <span className="chat-fab-float relative flex h-full w-full items-center justify-center">
            {/* Ikon crossfade: pesan ↔ silang, ikut berputar. */}
            <span className="relative flex h-7 w-7 items-center justify-center">
              <MessageCircle
                className={cn(
                  "chat-fab-icon absolute inset-0 h-7 w-7 drop-shadow-sm",
                  isOpen
                    ? "scale-50 -rotate-90 opacity-0"
                    : "scale-100 rotate-0 opacity-100",
                )}
              />
              <X
                className={cn(
                  "chat-fab-icon absolute inset-0 h-6 w-6 drop-shadow-sm",
                  isOpen
                    ? "scale-100 rotate-0 opacity-100"
                    : "scale-50 rotate-90 opacity-0",
                )}
              />
            </span>
            {/* <Sparkles className="chat-sparkle absolute -right-0.5 -top-0.5 h-4 w-4 text-yellow-300" /> */}
          </span>
        </span>
      </button>

      {/* ===== Panel chat ===== */}
      <Dialog
        open={isOpen}
        onOpenChange={(next) => {
          if (next) openChat();
          else requestClose();
        }}
      >
        <DialogContent
          ref={attachPanel}
          showCloseButton={false}
          overlayClassName={cn(
            // `black` tidak ikut di-remap oleh skala warna dark mode,
            // jadi scrim tetap gelap di kedua tema.
            "chat-panel-overlay bg-black/25",
            expanded && "bg-black/45",
            closing && "opacity-0 transition-opacity duration-200",
          )}
          className={cn(
            "chat-panel-content fixed z-50 m-0 flex flex-col gap-0 overflow-hidden border-0 bg-card p-0 shadow-2xl",
            "translate-x-0 translate-y-0 [&>button.absolute]:hidden",
            closing && "pointer-events-none",
            expanded
              ? // Mobile: benar-benar fullscreen. Desktop: panel tinggi
                // menempel kanan (bukan dialog tengah) agar morph terasa
                // seperti panel yang membesar, bukan halaman baru.
                "inset-0 h-[100dvh] w-screen max-h-none max-w-none rounded-none sm:inset-y-6 sm:bottom-6 sm:left-auto sm:right-6 sm:top-6 sm:h-auto sm:max-h-[calc(100dvh-3rem)] sm:w-[min(720px,calc(100vw-3rem))] sm:rounded-3xl"
              : "bottom-[calc(1.5rem_+_env(safe-area-inset-bottom))] left-auto right-6 top-auto h-auto w-[calc(100vw-2rem)] rounded-2xl sm:bottom-6 sm:w-[400px] sm:rounded-2xl",
          )}
        >
          <div ref={contentRef} className="flex min-h-0 flex-1 flex-col">
            {/* ===== Header ===== */}
            <div
              className={cn(
                "chat-reveal relative shrink-0 overflow-hidden bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 text-white",
                expanded
                  ? "px-4 pb-4 pt-[calc(env(safe-area-inset-top)+1rem)] sm:pt-4"
                  : "p-4",
              )}
              style={{ "--reveal-i": 0 } as CSSProperties}
            >
              <span
                aria-hidden
                className="pointer-events-none absolute -right-12 -top-16 h-36 w-36 rounded-full bg-white/12 blur-2xl"
              />
              <div className="relative flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="chat-avatar-pop flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20 shadow-inner backdrop-blur-sm ring-1 ring-white/30">
                    {/* <Bot className="h-5 w-5" /> */}
                    <Image
                      src="/images/TTH.png"
                      alt="Logo SMK Telekomunikasi Tunas Harapan"
                      width={35}
                      height={35}
                      quality={100}
                      className=" drop-shadow-lg"
                    />
                  </div>
                  <div className="min-w-0">
                    <DialogTitle className="truncate text-sm font-semibold">
                      Asisten Sekolah
                    </DialogTitle>
                    <p className="mt-0.5  flex items-center gap-1.5 truncate text-[11px] text-blue-100/90">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-70" />
                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-300" />
                      </span>
                      Online • Siap membantu
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  {expanded && (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={goFullPage}
                      aria-label="Buka halaman chat lengkap"
                      title="Buka halaman chat"
                      className="chat-action h-9 w-9 text-white hover:bg-white/20 hover:text-white sm:h-8 sm:w-8"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={toggleExpanded}
                    aria-label={expanded ? "Kecilkan chat" : "Mode fullscreen"}
                    title={expanded ? "Kecilkan" : "Fullscreen"}
                    aria-pressed={expanded}
                    className="chat-action h-9 w-9 text-white hover:bg-white/20 hover:text-white sm:h-8 sm:w-8"
                  >
                    {expanded ? (
                      <Minimize2 className="h-4 w-4" />
                    ) : (
                      <Maximize2 className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={requestClose}
                    aria-label="Tutup chat"
                    title="Tutup"
                    className="chat-action h-9 w-9 text-white hover:bg-white/20 hover:text-white sm:h-8 sm:w-8"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* ===== Area pesan ===== */}
            <div
              className={cn(
                "chat-reveal flex min-h-0 flex-col bg-background",
                expanded ? "flex-1" : "h-[min(350px,50dvh)]",
              )}
              style={{ "--reveal-i": 1 } as CSSProperties}
            >
              <ChatMessages compact={!expanded} />
            </div>

            {/* ===== Input ===== */}
            <div
              className="chat-reveal shrink-0"
              style={{ "--reveal-i": 2 } as CSSProperties}
            >
              <ChatInput />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function ChatBubble() {
  return <ChatBubbleInner />;
}
