"use client";

import { useEffect, useRef, useState } from "react";
import {
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

/** Pertanyaan populer — sesuai topik di knowledge/. Klik = langsung terkirim. */
const SUGGESTIONS = [
  "Apa saja jurusan yang ada?",
  "Berapa biaya PPDB?",
  "Apa saja syarat pendaftaran?",
  "Bagaimana cara mendaftar?",
  "Saya bingung pilih jurusan",
  "Bagaimana cara menghubungi sekolah?",
];

function SuggestionChips() {  const { sendMessage, isTyping } = useChat();
  return (
    <div className="mr-auto flex max-w-[92%] flex-wrap gap-2">
      {SUGGESTIONS.map((s) => (
        <button
          key={s}
          type="button"
          disabled={isTyping}
          onClick={() => void sendMessage(s)}
          className="rounded-full border border-blue-200 bg-card px-3.5 py-1.5 text-xs font-medium text-blue-700 shadow-sm transition-colors hover:border-blue-400 hover:bg-blue-50 disabled:opacity-50 dark:border-blue-800 dark:text-blue-300 dark:hover:bg-blue-950"
        >
          {s}
        </button>
      ))}
    </div>
  );
}

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
          "rounded-md p-1 transition-colors",
          voted === "UP"
            ? "bg-green-100 text-green-600"
            : "text-slate-400 hover:bg-green-50 hover:text-green-600",
          !voted && "hover:bg-green-50",
          (voted || sending) && "cursor-default opacity-80"
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
          "rounded-md p-1 transition-colors",
          voted === "DOWN"
            ? "bg-red-100 text-red-500"
            : "text-slate-400 hover:bg-red-50 hover:text-red-500",
          (voted || sending) && "cursor-default opacity-80"
        )}
      >
        <ThumbsDown className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export function ChatMessages({ compact = false }: { compact?: boolean }) {
  const { messages, isTyping } = useChat();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, isTyping]);

  // Chat masih baru (hanya sapaan) → tampilkan pertanyaan populer
  // agar user bisa mulai tanpa perlu mengetik.
  const showSuggestions =
    !isTyping && messages.length <= 1 && messages[0]?.id === "greeting";

  return (
    <div
      className={cn(
        "flex-1 space-y-4 overflow-y-auto subtle-scroll",
        compact ? "p-4" : "p-4 sm:p-6",
        // Fade-out tepi atas saat compact (panel mobile): pesan yang
        // ke-scroll ke atas memudar halus ~56px, bukan terpotong mendadak.
        // Mask menyatu dengan scroll container (tanpa overlay yang
        // menutup area sentuh). Prefix -webkit- wajib untuk Safari iOS.
        compact &&
          "[mask-image:linear-gradient(to_bottom,transparent_0,black_3.5rem)] [-webkit-mask-image:linear-gradient(to_bottom,transparent_0,black_3.5rem)]"
      )}
    >
      {messages.map((message, idx) => {
        // Pertanyaan yang memicu jawaban ini = pesan user terakhir sebelumnya.
        const question =
          message.role === "assistant"
            ? [...messages.slice(0, idx)]
                .reverse()
                .find((m) => m.role === "user")?.text ?? ""
            : "";
        return (
        <div
          key={message.id}
          className={cn(
            "flex max-w-[88%] gap-2.5",
            message.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
          )}
        >
          <div
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white",
              message.role === "user"
                ? "bg-gradient-to-br from-blue-500 to-blue-600"
                : "bg-gradient-to-br from-indigo-500 to-purple-600"
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
                "break-words whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm shadow-sm",
                message.role === "user"
                  ? "rounded-br-md bg-gradient-to-br from-blue-500 to-blue-600 text-white"
                  : "rounded-bl-md border border-slate-200 bg-card text-slate-800"
              )}
            >
              {message.role === "assistant" ? (
                <MarkdownLite text={message.text} />
              ) : (
                message.text
              )}
            </div>
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
                message.role === "user" ? "text-right" : "text-left"
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

      {showSuggestions && <SuggestionChips />}

      {isTyping && (
        <div className="mr-auto flex max-w-[88%] gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
            <Bot className="h-4 w-4" />
          </div>
          <div className="rounded-2xl rounded-bl-md border border-slate-200 bg-card px-4 py-3 shadow-sm">
            <div className="flex gap-1">
              <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" />
              <span
                className="h-2 w-2 animate-bounce rounded-full bg-slate-400"
                style={{ animationDelay: "150ms" }}
              />
              <span
                className="h-2 w-2 animate-bounce rounded-full bg-slate-400"
                style={{ animationDelay: "300ms" }}
              />
            </div>
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

  const submit = () => {
    if (!value.trim() || isTyping) return;
    if (value.length > 500) {
      alert("Pesan terlalu panjang! Maksimal 500 karakter.");
      return;
    }
    void sendMessage(value);
    setValue("");
  };

  return (
    <div className="border-t border-white/20 bg-card/20 p-3 backdrop-blur-xl sm:p-4">
      <div className="flex gap-2">
        <Input
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
          className="flex-1 rounded-xl border-slate-200 bg-card/80 focus:border-blue-500"
        />
        <Button
          onClick={submit}
          disabled={!value.trim() || isTyping}
          size="icon"
          aria-label="Kirim pesan"
          className="h-10 w-10 shrink-0 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg hover:from-blue-600 hover:to-indigo-700"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
      <div className="mt-2 flex items-center justify-between gap-2">
        <p className="text-[10px] text-slate-500">
          Powered by Gemini 3.5 Flash-Lite • SMK Telekomunikasi Tunas Harapan
        </p>
        {/* Pengalihan ke petugas: WA resmi hanya lewat tombol di /ppdb
            (nomor dari env) — jangan karang nomor di sini. */}
        <Link
          href="/ppdb"
          className="inline-flex shrink-0 items-center gap-1 text-[10px] font-medium text-blue-600 transition-colors hover:text-blue-700 hover:underline"
        >
          <Phone className="h-3 w-3" />
          Hubungi Petugas
        </Link>
      </div>
      <p className="text-right text-[10px] text-slate-400">
        {value.length}/500
      </p>
    </div>
  );
}
