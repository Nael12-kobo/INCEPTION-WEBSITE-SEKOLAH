"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  Bot,
  ChevronUp,
  History,
  Maximize2,
  Minimize2,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useChat } from "@/components/chat/chat-store";
import { ChatInput, ChatMessages } from "@/components/chat/ChatPanel";
import { useIsDesktop } from "@/hooks/useIsDesktop";

const VrmViewer = dynamic(
  () => import("@/components/chat/VrmViewer").then((m) => m.VrmViewer),
  { ssr: false }
);

interface HistoryItem {
  id: string;
  title: string;
  updatedAt: string;
}

/**
 * Layout (Opsi B — satu VRM permanen):
 * - SATU <VrmViewer> selalu mounted di layer belakang; tidak pernah unmount
 *   saat resize mobile ↔ desktop, jadi hanya 1 <canvas> + 1× unduhan model.
 *   Offset framing responsif via prop (dibaca VrmViewer lewat ref, tanpa reload).
 * - Desktop (lg+): VRM menempati area kiri (kanan disisakan 440px untuk panel
 *   chat); panel chat absolute kanan.
 * - Mobile: VRM full-screen di belakang; panel chat menempel di depan bawah
 *   setinggi 30% dengan gradient transparan ke atas; tombol expand → fullscreen.
 */
export function ChatPageClient() {
  const { isTyping, clearChat, conversationId, loadConversation } = useChat();
  const isDesktop = useIsDesktop();
  const [expanded, setExpanded] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const fetchHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const res = await fetch("/api/chat/history");
      if (res.status === 401) {
        setHistory([]);
        return;
      }
      const data = await res.json();
      setHistory(data.conversations ?? []);
    } catch {
      /* abaikan — guest tidak punya histori */
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchHistory();
  }, [fetchHistory, conversationId]);

  const openHistory = async (id: string) => {
    try {
      await loadConversation(id);
      setShowHistory(false);
      setExpanded(true);
    } catch {
      /* abaikan */
    }
  };

  const deleteHistory = useCallback(
    async (id: string) => {
      // Hapus optimis dari daftar; kalau ternyata server menolak, muat ulang.
      const wasActive = id === conversationId;
      setHistory((prev) => prev.filter((it) => it.id !== id));
      if (wasActive) {
        clearChat();
        setShowHistory(false);
      }
      try {
        const res = await fetch("/api/chat/history", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });
        if (!res.ok && res.status !== 404) {
          await fetchHistory();
        }
      } catch {
        await fetchHistory();
      }
    },
    [conversationId, clearChat, fetchHistory]
  );

  return (
    <main className="relative flex h-[100dvh] flex-col overflow-hidden bg-gradient-to-br from-sky-100 via-slate-50 to-indigo-100 lg:h-[calc(100dvh-0px)]">
      {/* ===== SATU VRM permanen — tidak pernah unmount saat pindah breakpoint ===== */}
      <div className="absolute inset-0 lg:inset-y-0 lg:left-0 lg:right-[440px]">
        {/* offsetY di mobile: angkat badan agar wajah di atas panel chat 30%.
            Dibaca VrmViewer via ref — ganti breakpoint tanpa reload model. */}
        <VrmViewer
          speaking={isTyping}
          framing={{ offsetY: isDesktop ? -0.4 : -0.45 , zoomOffset: -3}}
        />
      </div>

      {/* ===== DESKTOP overlay: badge + info + panel chat kanan ===== */}
      {isDesktop && (
      <>
        <div className="absolute left-6 top-6 flex items-center gap-2">
          <Button asChild variant="outline" size="sm" className="bg-white/70 backdrop-blur-xl">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" /> Beranda
            </Link>
          </Button>
        </div>
        <div className="pointer-events-none absolute bottom-6 left-6 max-w-sm rounded-2xl border border-white/50 bg-white/60 p-4 backdrop-blur-xl">
          <p className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <Bot className="h-4 w-4 text-blue-600" /> Nana AI
          </p>
          <p className="mt-1 text-xs leading-relaxed text-slate-600">
            Asisten sekolah berbasis AI, dapat membantu menjawab pertanyaan seputar sekolah, jurusan, fasilitas, dan informasi PPDB.
          </p>
        </div>

        {/* Kanan — panel chat translucent */}
        <aside className="absolute bottom-0 right-0 top-0 flex w-[440px] min-h-0 flex-col border-l border-white/50 bg-white/60 backdrop-blur-2xl">
          <DesktopHeader
            onHistory={() => setShowHistory((v) => !v)}
            onNew={() => {
              clearChat();
              setShowHistory(false);
            }}
          />
          <div className="flex min-h-0 flex-1 flex-col">
            <ChatMessages />
          </div>
          <ChatInput autoFocus />
          {showHistory && (
            <HistoryDrawer
              items={history}
              loading={historyLoading}
              activeId={conversationId}
              onPick={openHistory}
              onDelete={deleteHistory}
              onClose={() => setShowHistory(false)}
            />
          )}
        </aside>
      </>
      )}

      {/* ===== MOBILE overlay: top bar + panel chat bawah ===== */}
      {!isDesktop && (
      <>
        {/* Top bar melayang */}
        {/* top aman di bawah status bar iPhone (viewportFit=cover; env=0 di HP lain). */}
        <div className="absolute left-4 right-4 top-[calc(env(safe-area-inset-top)+1rem)] flex items-center justify-between">
          <Button asChild variant="outline" size="sm" className="h-11 bg-white/70 backdrop-blur-xl sm:h-8">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" /> Kembali
            </Link>
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon-sm"
              aria-label="Riwayat"
              className="h-11 w-11 bg-white/70 backdrop-blur-xl"
              onClick={() => {
                setShowHistory((v) => !v);
                if (!showHistory) void fetchHistory();
              }}
            >
              <History className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              className="h-11 w-11 bg-white/70 backdrop-blur-xl"
              onClick={() => setExpanded((v) => !v)}
              aria-label={expanded ? "Kecilkan chat" : "Fullscreen chat"}
            >
              {expanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Panel chat bawah — 45% default, expand → 88%.
            Dulu 30%: di layar 640px tingginya cuma ~192px, dan setelah
            dikurangi handle + ChatInput tersisa ~80px untuk pesan
            (kurang dari satu balasan). */}
        <section
          className={cn(
            "absolute inset-x-0 bottom-0 flex flex-col rounded-t-3xl border-t",
            // Collapsed (45%): kaca hampir bening — gradient putih 25–5%
            // + blur supaya karakter 3D di belakang panel terlihat jelas.
            // Expanded (88%): putih opaque penuh, blur dilepas (tak berguna
            // di atas bg solid + hemat GPU mobile saat panel fullscreen).
            // Bubble pesan sendiri opaque (bg-white / gradasi biru) jadi teks
            // tetap kontras; baris input punya lapisan bg-white/20 sendiri.
            expanded
              ? "border-white bg-white shadow-[0_-12px_40px_-12px_rgb(2_132_199/0.25)]"
              : "border-white/30 bg-gradient-to-t from-white/25 via-white/15 to-white/5 shadow-[0_-12px_40px_-12px_rgb(2_132_199/0.35)] backdrop-blur-sm",
            "transition-[height] duration-300",
            // home indicator iPhone: viewportFit=cover aktif, jadi beri ruang
            "pb-[env(safe-area-inset-bottom)]",
            expanded ? "h-[88%]" : "h-[45%]"
          )}
        >
          {/* Handle + tombol expand */}
          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex w-full flex-col items-center gap-0.5 pb-1 pt-2"
            aria-label={expanded ? "Kecilkan panel chat" : "Perbesar panel chat"}
          >
            <ChevronUp
              className={cn(
                "h-5 w-5 text-slate-500 drop-shadow-sm transition-transform",
                expanded && "rotate-180"
              )}
            />
            <span className="h-1 w-12 rounded-full bg-slate-400/80" />
            <span className="mt-0.5 text-[10px] font-medium text-slate-700 [text-shadow:0_1px_8px_rgb(255_255_255/0.9),0_0_2px_rgb(255_255_255/1)]">
              {expanded ? "Ketuk untuk mengecilkan" : "Ketuk untuk memperbesar"}
            </span>
          </button>

          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <div className="flex min-h-0 flex-1 flex-col">
              <ChatMessages compact />
            </div>
            <ChatInput />
          </div>
        </section>

        {showHistory && (
          <HistoryDrawer
            items={history}
            loading={historyLoading}
            activeId={conversationId}
            onPick={openHistory}
            onDelete={deleteHistory}
            onClose={() => setShowHistory(false)}
            floating
          />
        )}
      </>
      )}
    </main>
  );
}

function DesktopHeader({
  onHistory,
  onNew,
}: {
  onHistory: () => void;
  onNew: () => void;
}) {
  return (
    <div className="flex items-center justify-between border-b border-white/40 p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
          <Bot className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">Asisten Sekolah</p>
          <p className="text-xs text-slate-500">
            Online • Gemini 3.5 Flash-Lite
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon-sm" onClick={onNew} title="Percakapan baru" aria-label="Percakapan baru">
          <Plus className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon-sm" onClick={onHistory} title="Riwayat" aria-label="Riwayat">
          <History className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function HistoryDrawer({
  items,
  loading,
  activeId,
  onPick,
  onDelete,
  onClose,
  floating = false,
}: {
  items: HistoryItem[];
  loading: boolean;
  activeId: string | null;
  onPick: (id: string) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
  floating?: boolean;
}) {
  return (
    <div
      className={cn(
        "border-white/50 bg-white/85 backdrop-blur-2xl",
        floating
          ? "absolute inset-x-4 top-16 z-10 max-h-[60%] overflow-hidden rounded-2xl border shadow-2xl"
          : "absolute inset-x-0 top-0 z-10 max-h-[50%] overflow-hidden rounded-b-2xl border-b shadow-xl"
      )}
    >
      <div className="flex items-center justify-between border-b border-slate-200/70 p-3">
        <p className="text-xs font-semibold text-slate-700">
          Riwayat percakapan (akun login)
        </p>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon-sm" onClick={onClose} aria-label="Tutup riwayat">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="subtle-scroll max-h-64 overflow-y-auto p-2">
        {loading && <p className="p-3 text-xs text-slate-500">Memuat...</p>}
        {!loading && items.length === 0 && (
          <p className="p-3 text-xs text-slate-500">
            Belum ada riwayat. Login lalu mulai ngobrol — percakapanmu akan
            tersimpan otomatis di database.
          </p>
        )}
        {items.map((it) => (
          <div
            key={it.id}
            className={cn(
              "flex items-center gap-1 rounded-xl pr-1 transition-colors hover:bg-blue-50",
              activeId === it.id && "bg-blue-50 ring-1 ring-blue-200"
            )}
          >
            <button
              type="button"
              onClick={() => onPick(it.id)}
              className="min-w-0 flex-1 px-3 py-2.5 text-left"
            >
              <p className="truncate text-xs font-medium text-slate-800">{it.title}</p>
              <p className="text-[10px] text-slate-400">
                {new Date(it.updatedAt).toLocaleString("id-ID")}
              </p>
            </button>
            {/* 44×44 agar nyaman di sentuh (belum sempat di-merge sebelumnya) */}
            <button
              type="button"
              onClick={() => onDelete(it.id)}
              aria-label={`Hapus riwayat ${it.title}`}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
