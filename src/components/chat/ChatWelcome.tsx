"use client";

import type { CSSProperties } from "react";
import { Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import { useChat } from "./chat-store";

/** Pertanyaan populer — sesuai topik di knowledge/. Klik = langsung terkirim. */
const SUGGESTIONS = [
  "Apa saja jurusan yang ada?",
  "Berapa biaya PPDB?",
  "Apa saja syarat pendaftaran?",
  "Bagaimana cara mendaftar?",
];

/**
 * Tampilan awal percakapan (belum ada pesan) dengan entrance bertahap:
 * ikon melayang + cincin, label, judul, deskripsi, lalu kartu saran —
 * masing-masing muncul berurutan lewat `--reveal-i`.
 *
 * Dipakai di semua permukaan chat (panel bubble compact, fullscreen, /chat)
 * dengan prop `compact` yang hanya mengecilkan skala, bukan menghapus animasi.
 */
export function ChatWelcome({ compact = false }: { compact?: boolean }) {
  const { sendMessage, isTyping } = useChat();
  // Panel compact (±350px area pesan) hanya memuat 3 kartu tanpa scroll —
  // saran ke-4 tetap tersedia lewat chip jawaban setelah obrolan dimulai.
  const suggestions = compact ? SUGGESTIONS.slice(0, 3) : SUGGESTIONS;

  return (
    <div className="flex w-full flex-col items-center text-center mt-5">
      <div
        className={cn(
          "chat-reveal relative flex items-center justify-center",
          compact ? "mb-2.5" : "mb-4",
        )}
        style={{ "--reveal-i": 1 } as CSSProperties}
      >
        <span
          aria-hidden
          className={cn(
            "chat-welcome-ring pointer-events-none absolute rounded-[26px] border border-blue-400/30",
            compact ? "-inset-1.5" : "-inset-2.5",
          )}
        />
        <span
          aria-hidden
          className={cn(
            "chat-welcome-ring pointer-events-none absolute rounded-[32px] border border-indigo-400/20",
            compact ? "-inset-3.5" : "-inset-5",
          )}
          style={{ animationDelay: "900ms" }}
        />
        <div
          className={cn(
            "chat-welcome-icon flex items-center justify-center bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 text-white shadow-[0_18px_40px_-16px_rgb(37_99_235/0.8)] ring-1 ring-white/25",
            compact
              ? "h-12 w-12 rounded-2xl"
              : "h-16 w-16 rounded-[22px] sm:h-20 sm:w-20 sm:rounded-[26px]",
          )}
        >
          <Bot
            className={cn(
              "h-6 w-6 rounded-full object-cover object-center"
            )}
            color="white"
          />

          {/* <Sparkles className={compact ? "h-5 w-5" : "h-7 w-7 sm:h-9 sm:w-9"} /> */}
        </div>
      </div>

      <p
        className="chat-reveal mb-1.5 mt-3 text-[10px] font-bold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400"
        style={{ "--reveal-i": 2 } as CSSProperties}
      >
        Asisten Sekolah
      </p>
      <h3
        className={cn(
          "chat-reveal font-bold leading-tight tracking-tight text-slate-500 dark:text-slate-400",
          compact ? "text-[15px]" : "text-2xl sm:text-3xl",
        )}
        style={{ "--reveal-i": 3 } as CSSProperties}
      >
        Ada yang ingin kamu cari tahu?
      </h3>
      <p
        className={cn(
          "chat-reveal text-slate-500 dark:text-slate-400",
          compact
            ? "mt-1 line-clamp-2 text-[10.5px] leading-relaxed"
            : "mt-2 text-xs leading-relaxed sm:text-sm",
        )}
        style={{ "--reveal-i": 4 } as CSSProperties}
      >
        Halo! Saya asisten SMK Telekomunikasi Tunas Harapan. Tanya soal jurusan,
        fasilitas, atau PPDB — saya bantu.
      </p>

      <section
        aria-label="Saran pertanyaan"
        className={cn("chat-reveal w-full", compact ? "mt-2.5" : "mt-6")}
        style={{ "--reveal-i": 5 } as CSSProperties}
      >
        <p
          className={cn(
            "font-semibold uppercase tracking-wider text-slate-400",
            compact
              ? "mb-1.5 text-left text-[9px]"
              : "mb-2 text-[10px] sm:text-center",
          )}
        >
          Mulai dari salah satu pertanyaan ini
        </p>
        <div
          className={cn(
            "grid",
            compact ? "grid-cols-1 gap-1.5" : "gap-2.5 sm:grid-cols-2",
          )}
        >
          {suggestions.map((s, i) => (
            <button
              key={s}
              type="button"
              disabled={isTyping}
              onClick={() => void sendMessage(s)}
              style={{ "--chip-i": i } as CSSProperties}
              className={cn(
                "chat-chip group flex items-center justify-between gap-3 rounded-2xl border border-slate-200/70 bg-card/90 text-left font-semibold leading-snug text-slate-900 shadow-sm backdrop-blur transition-[transform,background-color,border-color,color,box-shadow] duration-300 hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50/70 hover:text-blue-700 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:translate-y-0 dark:border-white/10 dark:text-slate-400 dark:hover:border-blue-700 dark:hover:bg-blue-950/50 dark:hover:text-blue-100",
                compact
                  ? "min-h-10 px-3 py-1.5 text-[11px]"
                  : "min-h-11 px-4 py-2.5 text-xs",
              )}
            >
              <span className="min-w-0">{s}</span>
              <span
                aria-hidden
                className="shrink-0 text-blue-500 transition-transform duration-300 group-hover:translate-x-1"
              >
                ↗
              </span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
