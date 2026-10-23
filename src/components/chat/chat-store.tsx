"use client";

import { getSpeechText } from "@/lib/chat-speech";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: string;
  /** File knowledge yang dipakai AI menjawab (chip "Sumber" di bubble). */
  sources?: string[];
}

interface ChatContextValue {
  messages: ChatMessage[];
  isTyping: boolean;
  conversationId: string | null;
  sendMessage: (text: string) => Promise<void>;
  clearChat: () => void;
  loadConversation: (id: string) => Promise<void>;
  /** Karakter 3D (VRM) tampil atau tidak — toggle ikon mata. */
  showCharacter: boolean;
  toggleCharacter: () => void;
  /** Suara TTS jawaban aktif atau tidak — toggle ikon speaker. */
  voiceEnabled: boolean;
  toggleVoice: () => void;
}

const ChatContext = createContext<ChatContextValue | null>(null);

const STORAGE_KEY = "tth:chat:draft:v1";
const CONV_KEY = "tth:chat:conversationId:v1";
// Preferensi tampilan chat — "0" = nonaktif, selain itu (termasuk kosong) = aktif.
const CHARACTER_KEY = "tth:chat:character:v1";
const VOICE_KEY = "tth:chat:voice:v1";

function nowTime(): string {
  return new Date().toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function unlockSpeech(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event("nara:unlock-audio"));
}

async function speakReply(text: string): Promise<void> {
  if (typeof window === "undefined" || !text.trim()) return;
  const speechText = getSpeechText(text);
  if (!speechText) return;

  try {
    const res = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: speechText }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      console.warn("[chat] TTS tidak tersedia:", data?.message || res.status);
      return;
    }

    const body = res.body;
    const canStream =
      !!body &&
      typeof window.MediaSource !== "undefined" &&
      MediaSource.isTypeSupported("audio/mpeg");

    if (canStream && body) {
      window.dispatchEvent(
        new CustomEvent("nara:audio-stream", {
          detail: { stream: body },
        })
      );
      return;
    }

    const buffer = await res.arrayBuffer();
    window.dispatchEvent(
      new CustomEvent("nara:audio", {
        detail: { buffer },
      })
    );
  } catch (error) {
    console.warn("[chat] TTS gagal:", error);
  }
}

const GREETING: ChatMessage = {
  id: "greeting",
  role: "assistant",
  text: "Halo! Saya asisten SMK Telekomunikasi Tunas Harapan. Ada yang bisa saya bantu?",
  // Placeholder stabil agar SSR === hydration (jam asli diisi saat mount).
  timestamp: "--.--",
};

function loadDraft(): ChatMessage[] {
  // Hanya dipanggil di useEffect (client) — aman memakai jam asli.
  const freshGreeting = (): ChatMessage => ({ ...GREETING, timestamp: nowTime() });
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [freshGreeting()];
    const parsed = JSON.parse(raw) as ChatMessage[];
    if (!Array.isArray(parsed) || parsed.length === 0) return [freshGreeting()];
    return parsed.slice(-50);
  } catch {
    return [freshGreeting()];
  }
}

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [showCharacter, setShowCharacter] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  /**
   * Ref sinkron voiceEnabled — dibaca sendMessage agar closure tidak basi
   * saat pengguna menyalakan/mematikan suara di tengah obrolan.
   */
  const voiceRef = useRef(true);
  const hydrated = useRef(false);
  /**
   * Nomor giliran. Dinaikkan tiap kali user memulai chat baru ATAU
   * mengganti obrolan (clearChat / loadConversation). Balasan dari request
   * lama yang datang belakangan lalu dibuang, supaya tidak menempel ke
   * obrolan yang sudah diganti.
   */
  const seqRef = useRef(0);
  /** Request chat yang sedang berjalan — dibatalkan saat ganti obrolan. */
  const abortRef = useRef<AbortController | null>(null);
  const messagesRef = useRef(messages);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    setMessages(loadDraft());
    try {
      setConversationId(localStorage.getItem(CONV_KEY));
      setShowCharacter(localStorage.getItem(CHARACTER_KEY) !== "0");
      setVoiceEnabled(localStorage.getItem(VOICE_KEY) !== "0");
    } catch {
      /* abaikan */
    }
    hydrated.current = true;
  }, []);

  useEffect(() => {
    voiceRef.current = voiceEnabled;
  }, [voiceEnabled]);

  useEffect(() => {
    if (!hydrated.current) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-50)));
    } catch {
      /* abaikan */
    }
  }, [messages]);

  useEffect(() => {
    if (!hydrated.current) return;
    try {
      if (conversationId) localStorage.setItem(CONV_KEY, conversationId);
      else localStorage.removeItem(CONV_KEY);
    } catch {
      /* abaikan */
    }
  }, [conversationId]);

  const sendMessage = useCallback(
    async (text: string) => {
      const clean = text.trim();
      if (!clean || isTyping) return;
      const userMsg: ChatMessage = {
        id: uid(),
        role: "user",
        text: clean,
        timestamp: nowTime(),
      };
      const next = (prev: ChatMessage[]) => [...prev, userMsg];
      setMessages(next);
      setIsTyping(true);
      // Hentikan audio jawaban sebelumnya sebelum giliran baru dimulai.
      window.dispatchEvent(new Event("nara:stop-audio"));
      unlockSpeech();

      const seq = ++seqRef.current;
      abortRef.current?.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      /**
       * Timeout dua lapis (streaming butuh waktu lebih lama dari JSON, tapi
       * tidak boleh menggantung selamanya):
       * - idle 20s: tidak ada chunk masuk (Gemini diam/proxy buffer) → abort.
       * - total 60s: pagar keras dari saat kirim.
       * Timer idle di-reset tiap chunk yang diterima.
       */
      const IDLE_MS = 20_000;
      const TOTAL_MS = 60_000;
      let idleTimer: ReturnType<typeof setTimeout> = setTimeout(
        () => ctrl.abort(),
        IDLE_MS
      );
      const totalTimer = setTimeout(() => ctrl.abort(), TOTAL_MS);
      const resetIdle = () => {
        clearTimeout(idleTimer);
        idleTimer = setTimeout(() => ctrl.abort(), IDLE_MS);
      };

      // Pesan assistant yang sedang tumbuh (di-append saat token masuk).
      let streamId: string | null = null;
      let streamText = "";
      const applyStream = () => {
        const id = streamId;
        const text = streamText;
        if (!id) return;
        setMessages((prev) =>
          prev.map((m) => (m.id === id ? { ...m, text } : m))
        );
      };

      try {
        const history = [...messagesRef.current, userMsg].map((m) => ({
          role: m.role,
          content: m.text,
        }));
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: history.slice(-20),
            conversationId,
          }),
          signal: ctrl.signal,
        });
        const contentType = res.headers.get("content-type") ?? "";
        const isSSE =
          res.ok && contentType.includes("text/event-stream") && res.body;

        if (!isSSE) {
          // Jalur lama (error JSON 400/429/502, atau respons non-stream).
          const data = await res.json().catch(() => ({}));
          if (!res.ok) throw new Error(data?.message || "Gagal menghubungi AI.");
          // Obrolan sudah diganti (clearChat / pilih riwayat lain) selagi
          // request berjalan → jangan tempel balasannya ke obrolan baru.
          if (seqRef.current !== seq) return;

          const reply =
            typeof data.reply === "string" && data.reply.trim()
              ? data.reply
              : "Maaf, saya tidak bisa menjawab saat ini.";
          const sources = Array.isArray(data.sources)
            ? (data.sources as string[]).filter((s) => typeof s === "string")
            : [];
          setMessages((prev) => [
            ...prev,
            {
              id: uid(),
              role: "assistant",
              text: reply,
              timestamp: nowTime(),
              ...(sources.length ? { sources } : {}),
            },
          ]);
          // Suara dimatikan → lewati TTS sepenuhnya (tanpa fetch /api/tts).
          if (voiceRef.current) void speakReply(reply);
          if (typeof data.conversationId === "string") {
            setConversationId(data.conversationId);
          }
          return;
        }

        // ===== Streaming SSE =====
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        /**
         * Payload done/error dikumpulkan ke array (bukan var luar yang
         * di-assign di closure) — TS control-flow tidak melihat assignment
         * di dalam closure sehingga variabel luar ter-narrow ke `never`.
         */
        const terminal: {
          t: string;
          reply?: unknown;
          sources?: unknown;
          conversationId?: unknown;
          message?: unknown;
          partial?: unknown;
        }[] = [];

        const handleEvent = (raw: string) => {
          const line = raw.trim();
          if (!line.startsWith("data:")) return;
          let payload: Record<string, unknown>;
          try {
            payload = JSON.parse(line.slice(5));
          } catch {
            return;
          }
          if (payload.t === "token" && typeof payload.v === "string") {
            if (!streamId) {
              streamId = uid();
              streamText = payload.v;
              const id = streamId;
              const text = streamText;
              setMessages((prev) => [
                ...prev,
                { id, role: "assistant", text, timestamp: nowTime() },
              ]);
            } else {
              streamText += payload.v;
              applyStream();
            }
          } else if (payload.t === "done" || payload.t === "error") {
            terminal.push(payload as (typeof terminal)[number]);
          }
        };

        // Baca sampai stream habis — event dipisah baris kosong ("\n\n").
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          resetIdle();
          buffer += decoder.decode(value, { stream: true });
          let idx: number;
          while ((idx = buffer.indexOf("\n\n")) !== -1) {
            const raw = buffer.slice(0, idx);
            buffer = buffer.slice(idx + 2);
            handleEvent(raw);
          }
        }
        // Sisa buffer tanpa delimiter penutup (putus di tengah event).
        if (buffer.trim()) handleEvent(buffer);

        if (seqRef.current !== seq) return;

        const errorPayload = terminal.find((p) => p.t === "error");
        const donePayload = terminal.find((p) => p.t === "done");

        if (errorPayload) {
          const message =
            typeof errorPayload.message === "string" && errorPayload.message
              ? errorPayload.message
              : "Maaf, terjadi kesalahan. Coba lagi ya.";
          const partial =
            typeof errorPayload.partial === "string"
              ? errorPayload.partial
              : "";
          if (streamId && partial) {
            // Teks parsial sudah tampil → tambahkan keterangan gangguan saja.
            streamText = partial;
            applyStream();
            setMessages((prev) => [
              ...prev,
              {
                id: uid(),
                role: "assistant",
                text: message,
                timestamp: nowTime(),
              },
            ]);
          } else if (streamId) {
            const id = streamId;
            setMessages((prev) =>
              prev.map((m) => (m.id === id ? { ...m, text: message } : m))
            );
          } else {
            setMessages((prev) => [
              ...prev,
              {
                id: uid(),
                role: "assistant",
                text: message,
                timestamp: nowTime(),
              },
            ]);
          }
          return;
        }

        // Stream berakhir tanpa done/error (koneksi terputus sebelum selesai).
        if (!donePayload) {
          if (streamId && streamText.trim()) {
            // Teks parsial dibiarkan tampil apa adanya.
            return;
          }
          throw new Error("Waktu tunggu habis. Coba kirim lagi ya.");
        }

        const reply =
          typeof donePayload.reply === "string" && donePayload.reply.trim()
            ? donePayload.reply
            : streamText.trim() || "Maaf, saya tidak bisa menjawab saat ini.";
        const sources = Array.isArray(donePayload.sources)
          ? (donePayload.sources as string[]).filter(
              (s) => typeof s === "string"
            )
          : [];
        // Finalisasi: teks final + chip sumber pada bubble streaming.
        if (streamId) {
          const id = streamId;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === id
                ? {
                    ...m,
                    text: reply,
                    ...(sources.length ? { sources } : {}),
                  }
                : m
            )
          );
        } else {
          setMessages((prev) => [
            ...prev,
            {
              id: uid(),
              role: "assistant",
              text: reply,
              timestamp: nowTime(),
              ...(sources.length ? { sources } : {}),
            },
          ]);
        }
        if (voiceRef.current) void speakReply(reply);
        if (typeof donePayload.conversationId === "string") {
          setConversationId(donePayload.conversationId);
        }
      } catch (error) {
        if (seqRef.current !== seq) return;
        const aborted = error instanceof Error && error.name === "AbortError";
        setMessages((prev) => [
          ...prev,
          {
            id: uid(),
            role: "assistant",
            text: aborted
              ? "Waktu tunggu habis. Coba kirim lagi ya."
              : error instanceof Error
                ? error.message
                : "Maaf, terjadi kesalahan. Coba lagi ya.",
            timestamp: nowTime(),
          },
        ]);
      } finally {
        clearTimeout(idleTimer);
        clearTimeout(totalTimer);
        if (abortRef.current === ctrl) abortRef.current = null;
        setIsTyping(false);
      }
    },
    [conversationId, isTyping]
  );

  const clearChat = useCallback(() => {
    // Batalkan request yang masih jalan supaya balasannya tidak jatuh ke
    // obrolan baru yang baru saja dibuat.
    seqRef.current++;
    abortRef.current?.abort();
    abortRef.current = null;
    setMessages([{ ...GREETING, timestamp: nowTime() }]);
    setConversationId(null);
    setIsTyping(false);
  }, []);

  const loadConversation = useCallback(async (id: string) => {
    seqRef.current++;
    abortRef.current?.abort();
    abortRef.current = null;
    setIsTyping(false);

    const res = await fetch("/api/chat/history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (!res.ok) throw new Error("Gagal memuat percakapan.");
    const data = await res.json();
    const rows = (data?.conversation?.messages ?? []) as {
      role: string;
      content: string;
      createdAt?: string;
      sources?: string[];
    }[];
    setMessages(
      rows.map((r) => ({
        id: uid(),
        role: r.role === "assistant" ? ("assistant" as const) : ("user" as const),
        text: r.content,
        timestamp: r.createdAt
          ? new Date(r.createdAt).toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
            })
          : nowTime(),
        ...(Array.isArray(r.sources) && r.sources.length
          ? { sources: r.sources }
          : {}),
      }))
    );
    setConversationId(id);
  }, []);

  const toggleCharacter = useCallback(() => {
    const next = !showCharacter;
    setShowCharacter(next);
    try {
      localStorage.setItem(CHARACTER_KEY, next ? "1" : "0");
    } catch {
      /* abaikan */
    }
  }, [showCharacter]);

  const toggleVoice = useCallback(() => {
    const next = !voiceEnabled;
    setVoiceEnabled(next);
    try {
      localStorage.setItem(VOICE_KEY, next ? "1" : "0");
    } catch {
      /* abaikan */
    }
    // Dimatikan di tengah audio → hentikan suara yang sedang berbunyi.
    if (!next) window.dispatchEvent(new Event("nara:stop-audio"));
  }, [voiceEnabled]);

  const value = useMemo(
    () => ({
      messages,
      isTyping,
      conversationId,
      sendMessage,
      clearChat,
      loadConversation,
      showCharacter,
      toggleCharacter,
      voiceEnabled,
      toggleVoice,
    }),
    [
      messages,
      isTyping,
      conversationId,
      sendMessage,
      clearChat,
      loadConversation,
      showCharacter,
      toggleCharacter,
      voiceEnabled,
      toggleVoice,
    ]
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat(): ChatContextValue {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat harus dipakai di dalam <ChatProvider>");
  return ctx;
}
