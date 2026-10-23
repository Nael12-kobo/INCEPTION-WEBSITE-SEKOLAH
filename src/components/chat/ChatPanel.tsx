"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Bot,
  Phone,
  Send,
  ShieldCheck,
  ThumbsDown,
  ThumbsUp,
  User,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { SOURCE_META } from "@/lib/chat-sources";
import { useChat } from "./chat-store";
import { MarkdownLite } from "./MarkdownLite";
import { ChatWelcome } from "./ChatWelcome";

/**
 * Tombol 👍/👎 per jawaban AI. Vote disimpan ke /api/chat/feedback dan
 * statusnya di localStorage agar tidak bisa vote dua kali (juga setelah
 * halaman dimuat ulang).
 */
const FEEDBACK_KEY = "tth:chat:feedback:v1";

function loadFeedbackState(): Record<string, "UP" | "DOWN"> {
  try {
    const raw = localStorage.getItem(FEEDBACK_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function FeedbackButtons({
  messageId,
  question,
  answer,
}: {
  messageId: string;
  question: string;
  answer: string;
}) {
  // Lazy init (bukan useEffect): state vote dibaca sekali saat mount.
  // Komponen ini baru dirender setelah draft chat dimuat di client
  // (saat SSR hanya ada pesan sapaan), jadi tidak ada mismatch hydration.
  const [voted, setVoted] = useState<"UP" | "DOWN" | null>(() => {
    if (typeof window === "undefined") return null;
    return loadFeedbackState()[messageId] ?? null;
  });
  const [sending, setSending] = useState(false);

  const vote = async (rating: "UP" | "DOWN") => {
    if (voted || sending) return;
    setVoted(rating); // optimistik — UI langsung merespons
    setSending(true);
    try {
      const res = await fetch("/api/chat/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId, question, answer, rating }),
      });
      if (!res.ok && res.status !== 409) {
        // rollback bila server menolak (429/500) — 409 = sudah pernah vote
        setVoted(null);
        return;
      }
      const state = loadFeedbackState();
      state[messageId] = rating;
      try {
        localStorage.setItem(FEEDBACK_KEY, JSON.stringify(state));
      } catch {
        /* storage penuh → abaikan */
      }
    } catch {
      setVoted(null);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex items-center gap-1 pt-0.5">
      <span className="mr-0.5 text-[10px] text-slate-400">Membantu?</span>
      <button
        type="button"
        onClick={() => void vote("UP")}
        disabled={!!voted || sending}
        aria-label="Jawaban membantu"
        aria-pressed={voted === "UP"}
        className={cn(
          "chat-action rounded-md p-1 transition-colors",
          voted === "UP"
            ? "chat-vote-pop bg-green-100 text-green-600"
            : "text-slate-400 hover:bg-green-50 hover:text-green-600",
          !voted && "hover:bg-green-50",
          (voted || sending) && "cursor-default opacity-80",
        )}
      >
        <ThumbsUp className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        onClick={() => void vote("DOWN")}
        disabled={!!voted || sending}
        aria-label="Jawaban tidak membantu"
        aria-pressed={voted === "DOWN"}
        className={cn(
          "chat-action rounded-md p-1 transition-colors",
          voted === "DOWN"
            ? "chat-vote-pop bg-red-100 text-red-500"
            : "text-slate-400 hover:bg-red-50 hover:text-red-500",
          (voted || sending) && "cursor-default opacity-80",
        )}
      >
        <ThumbsDown className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export function ChatMessages({ compact = false }: { compact?: boolean }) {
  const { messages, isTyping } = useChat();
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Chat masih baru (hanya sapaan) → tampilkan welcome bertahap + saran
  // agar user bisa mulai tanpa perlu mengetik.
  const isFresh = messages.length <= 1 && messages[0]?.id === "greeting";

  useEffect(() => {
    // Welcome dimulai dari atas (jangan auto-scroll ke sentinel bawah),
    // sedangkan percakapan berjalan tetap menempel ke pesan terbaru.
    if (isFresh) {
      scrollRef.current?.scrollTo({ top: 0 });
      return;
    }
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, isTyping, isFresh]);

  return (
    <div
      ref={scrollRef}
      className={cn(
        "flex-1 mt-1.5 space-y-4 overflow-y-auto subtle-scroll",
        compact ? "p-4" : "p-4 sm:p-6",
        // Fade-out tepi atas saat compact (panel mobile): pesan yang
        // ke-scroll ke atas memudar halus ~56px, bukan terpotong mendadak.
        // Mask menyatu dengan scroll container (tanpa overlay yang
        // menutup area sentuh). Prefix -webkit- wajib untuk Safari iOS.
        // Mask hanya saat sudah ada pesan — welcome tidak boleh ikut
        // memudar di tepi atas panel compact.
        compact &&
          !isFresh &&
          "[mask-image:linear-gradient(to_bottom,transparent_0,black_1.5rem)] [-webkit-mask-image:linear-gradient(to_bottom,transparent_0,black_1.5rem)]",
        // Fullscreen + belum ada pesan: welcome diletakkan di tengah area.
        // Compact sengaja rata atas — flex centering + overflow akan
        // memotong sisi atas saat konten lebih tinggi dari panel.
        isFresh && !compact && "flex flex-col justify-center",
      )}
    >
      {!isFresh &&
        messages.map((message, idx) => {
          // Pertanyaan yang memicu jawaban ini = pesan user terakhir sebelumnya.
          const question =
            message.role === "assistant"
              ? ([...messages.slice(0, idx)]
                  .reverse()
                  .find((m) => m.role === "user")?.text ?? "")
              : "";
          return (
            <div
              key={message.id}
              className={cn(
                "flex max-w-[88%] gap-2.5",
                message.role === "user"
                  ? "chat-msg-in-right ml-auto flex-row-reverse"
                  : "chat-msg-in-left mr-auto",
              )}
            >
              <div
                className={cn(
                  "chat-avatar-pop flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white shadow-sm ring-1 ring-black/5",
                  message.role === "user"
                    ? "bg-gradient-to-br from-blue-500 to-blue-600"
                    : "bg-gradient-to-br from-indigo-500 to-purple-600",
                )}
              >
                {message.role === "user" ? (
                  <User className="h-4 w-4" />
                ) : (
                  <Bot className="h-4 w-4" />
                )}
              </div>
              <div className="flex min-w-0 flex-col gap-1">
                <div
                  className={cn(
                    // break-words + pre-wrap: balasan Gemini sering berisi URL/
                    // token panjang & baris baru tanpa ini memaksa overflow-x
                    // di area pesan (yang cuma overflow-y-auto → scrollbar
                    // horizontal muncul di HP).
                    "chat-bubble-surface break-words whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm shadow-sm",
                    message.role === "user"
                      ? "rounded-br-md bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-blue-500/20"
                      : "rounded-bl-md border border-slate-200 bg-card text-slate-800",
                  )}
                >
                  {message.role === "assistant" ? (
                    <MarkdownLite text={message.text} />
                  ) : (
                    message.text
                  )}
                </div>
                {message.role === "assistant" &&
                  message.id !== "greeting" &&
                  message.sources?.includes("06-ppdb.md") && (
                    <div className="mt-2 rounded-xl border border-blue-100 bg-blue-50/70 p-3 dark:border-blue-900/60 dark:bg-blue-950/30">
                      <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                        Formulir, informasi PPDB, dan tombol WhatsApp panitia tersedia di halaman PPDB.
                      </p>
                      <Button
                        asChild
                        size="sm"
                        className="mt-2 bg-blue-600 text-white hover:bg-blue-700"
                      >
                        <Link href="/ppdb">
                          Buka halaman PPDB
                          <ArrowRight className="ml-1 h-3.5 w-3.5" />
                        </Link>
                      </Button>
                    </div>
                  )}
                {message.role === "assistant" && !!message.sources?.length && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    <span className="inline-flex items-center gap-1 text-[10px] text-slate-400">
                      <ShieldCheck className="h-3 w-3" />
                      Sumber:
                    </span>
                    {message.sources.map((file) => {
                      const meta = SOURCE_META[file];
                      if (!meta) return null;
                      return (
                        <Link
                          key={file}
                          href={meta.href}
                          className="rounded-full border border-slate-200 bg-card px-2 py-0.5 text-[10px] font-medium text-slate-500 transition-colors hover:border-blue-300 hover:text-blue-600"
                        >
                          {meta.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
                <span
                  className={cn(
                    "text-[10px] text-slate-400",
                    message.role === "user" ? "text-right" : "text-left",
                  )}
                >
                  {message.timestamp}
                </span>
                {message.role === "assistant" &&
                  message.id !== "greeting" &&
                  !!question && (
                    <FeedbackButtons
                      messageId={message.id}
                      question={question}
                      answer={message.text}
                    />
                  )}
              </div>
            </div>
          );
        })}

      {isFresh && <ChatWelcome compact={compact} />}

      {isTyping && (
        <div className="chat-msg-in-left mr-auto flex max-w-[88%] gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-sm ring-1 ring-black/5">
            <Bot className="h-4 w-4" />
          </div>
          <div className="rounded-2xl rounded-bl-md border border-slate-200 bg-card px-4 py-3 shadow-sm">
            <div className="flex items-center gap-1" aria-hidden>
              <span className="chat-dot h-2 w-2 rounded-full bg-slate-400" />
              <span className="chat-dot h-2 w-2 rounded-full bg-slate-400" />
              <span className="chat-dot h-2 w-2 rounded-full bg-slate-400" />
            </div>
            <span className="sr-only">Asisten sedang mengetik…</span>
          </div>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}

export function ChatInput({ autoFocus = false }: { autoFocus?: boolean }) {
  const { sendMessage, isTyping } = useChat();
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const submit = () => {
    if (!value.trim() || isTyping) return;
    if (value.length > 500) {
      alert("Pesan terlalu panjang! Maksimal 500 karakter.");
      return;
    }
    void sendMessage(value);
    setValue("");
    // Kembalikan fokus agar bisa langsung lanjut mengetik.
    inputRef.current?.focus();
  };

  const canSend = !!value.trim() && !isTyping;
  const nearLimit = value.length > 450;

  return (
    <div className="border-t border-border bg-card p-3 pb-[calc(0.75rem_+_env(safe-area-inset-bottom))] sm:p-4 sm:pb-4">
      <div className="chat-input-shell flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-card/90 p-1.5 shadow-sm">
        <Input
          ref={inputRef}
          placeholder="Ketik pesan Anda..."
          value={value}
          autoFocus={autoFocus}
          maxLength={500}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          className="h-10 flex-1 rounded-xl border-0 bg-transparent px-2.5 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
          aria-label="Tulis pesan untuk asisten"
        />
        <Button
          onClick={submit}
          disabled={!canSend}
          size="icon"
          aria-label="Kirim pesan"
          className={cn(
            "chat-send h-10 w-10 shrink-0 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/25 hover:from-blue-600 hover:to-indigo-700",
            canSend && "chat-send-ready",
          )}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
      <div className="mt-2.5 flex items-center justify-between gap-1">
        {/* Pengalihan ke petugas: WA resmi hanya lewat tombol di /ppdb
            (nomor dari env) — jangan karang nomor di sini. */}
        <Link
          href="/ppdb"
          className="inline-flex shrink-0 items-center gap-1 text-[13px] font-medium text-blue-600 transition-colors hover:text-blue-700 hover:underline"
        >
          <Phone className="h-3 w-3" />
          Hubungi Petugas
        </Link>
        <p
          className={cn(
            "text-right text-[12.5px] tabular-nums transition-colors duration-300",
            nearLimit ? "text-amber-600" : "text-slate-400",
          )}
        >
          <span>Maksimal Teks </span>
          {value.length}/500
        </p>
      </div>
    </div>
  );
}
