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
  const messagesRef = useRef(messages);
  messagesRef.current = messages;

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
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.message || "Gagal menghubungi AI.");
        setMessages((prev) => [
          ...prev,
          {
            id: uid(),
            role: "assistant",
            text: data.reply ?? "Maaf, saya tidak bisa menjawab saat ini.",
            timestamp: nowTime(),
          },
        ]);
        if (typeof data.conversationId === "string") {
          setConversationId(data.conversationId);
        }
      } catch (error) {
        setMessages((prev) => [
          ...prev,
          {
            id: uid(),
            role: "assistant",
            text:
              error instanceof Error
                ? error.message
                : "Maaf, terjadi kesalahan. Coba lagi ya.",
            timestamp: nowTime(),
          },
        ]);
      } finally {
        setIsTyping(false);
      }
    },
    [conversationId, isTyping]
  );

  const clearChat = useCallback(() => {
    setMessages([{ ...GREETING, timestamp: nowTime() }]);
    setConversationId(null);
  }, []);

  const loadConversation = useCallback(async (id: string) => {
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
