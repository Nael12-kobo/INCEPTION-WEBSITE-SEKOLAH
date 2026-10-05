"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bot, Maximize2, MessageCircle, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useChat } from "@/components/chat/chat-store";
import { ChatInput, ChatMessages } from "@/components/chat/ChatPanel";

/**
 * Bubble chat melayang. FIX double-close: DialogContent generik punya
 * tombol Close bawaan — di sini disembunyikan via
 * `[&_button.absolute]:hidden`, sehingga hanya tersisa 1 tombol X custom
 * di header + 1 tombol fullscreen (Maximize2) ke /chat.
 */
function ChatBubbleInner() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { messages } = useChat();
  const unread = Math.min(
    Math.max(messages.filter((m) => m.role === "assistant").length, 1),
    9
  );

  const goFullscreen = () => {
    setIsOpen(false);
    router.push("/chat");
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 z-50 flex h-16 w-16 items-center justify-center rounded-full",
          "bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 text-white shadow-2xl",
          "transition-all duration-300 ease-out hover:scale-110 hover:shadow-blue-500/50",
          "animate-bounce-slow",
          isOpen && "scale-0 opacity-0"
        )}
        aria-label="Buka chat"
      >
        <div className="relative">
          <MessageCircle className="h-7 w-7" />
          <Sparkles className="absolute -right-1 -top-1 h-3 w-3 animate-pulse text-yellow-300" />
        </div>
        <span className="absolute -right-1 -top-1 flex h-5 w-5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
          <span className="relative inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold">
            {unread}
          </span>
        </span>
      </button>

      {/* Panel chat — tanpa overlay gelap, tanpa close ganda */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent
          showCloseButton={false}
          className="fixed bottom-6 left-auto right-6 top-auto m-0 w-[calc(100vw-2rem)] translate-x-0 translate-y-0 gap-0 overflow-hidden rounded-2xl border-0 p-0 shadow-2xl sm:w-[400px] [&>button.absolute]:hidden"
        >
          {/* Header — SATU-SATUNYA tombol close ada di sini */}
          <div className="bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 p-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <DialogTitle className="text-sm font-semibold">
                    Asisten Sekolah
                  </DialogTitle>
                  <p className="text-xs text-blue-100">
                    Online • AI Gemini 3.5 Flash-Lite
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={goFullscreen}
                  aria-label="Buka fullscreen"
                  title="Fullscreen"
                  className="h-8 w-8 text-white hover:bg-white/20"
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setIsOpen(false)}
                  aria-label="Tutup chat"
                  title="Tutup"
                  className="h-8 w-8 text-white hover:bg-white/20"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Area pesan */}
          <div className="flex h-[350px] flex-col bg-gradient-to-b from-slate-50 to-white">
            <ChatMessages compact />
          </div>

          <ChatInput />
          <DialogHeader className="sr-only">
            <DialogTitle>Panel chat asisten sekolah</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <style jsx global>{`
        @keyframes bounce-slow {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
      `}</style>
    </>
  );
}

export function ChatBubble() {
  return <ChatBubbleInner />;
}
