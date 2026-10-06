"use client";

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
}

interface ChatContextValue {
  messages: ChatMessage[];
  isTyping: boolean;
  conversationId: string | null;
  sendMessage: (text: string) => Promise<void>;
  clearChat: () => void;
  loadConversation: (id: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextValue | null>(null);

const STORAGE_KEY = "tth:chat:draft:v1";
const CONV_KEY = "tth:chat:conversationId:v1";

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

  try {
    const res = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
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
    } catch {
      /* abaikan */
    }
    hydrated.current = true;
  }, []);

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
      // Batas tunggu: tanpa ini fetch yang menggantung membuat `isTyping`
      // terkunci selamanya (tombol kirim & input tetap disabled).
      const timer = setTimeout(() => ctrl.abort(), 30_000);

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
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.message || "Gagal menghubungi AI.");

        // Obrolan sudah diganti (clearChat / pilih riwayat lain) selagi
        // request berjalan → jangan tempel balasannya ke obrolan baru.
        if (seqRef.current !== seq) return;

        const reply =
          typeof data.reply === "string" && data.reply.trim()
            ? data.reply
            : "Maaf, saya tidak bisa menjawab saat ini.";
        setMessages((prev) => [
          ...prev,
          {
            id: uid(),
            role: "assistant",
            text: reply,
            timestamp: nowTime(),
          },
        ]);
        void speakReply(reply);
        if (typeof data.conversationId === "string") {
          setConversationId(data.conversationId);
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
        clearTimeout(timer);
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
      }))
    );
    setConversationId(id);
  }, []);

  const value = useMemo(
    () => ({
      messages,
      isTyping,
      conversationId,
      sendMessage,
      clearChat,
      loadConversation,
    }),
    [messages, isTyping, conversationId, sendMessage, clearChat, loadConversation]
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat(): ChatContextValue {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat harus dipakai di dalam <ChatProvider>");
  return ctx;
}
