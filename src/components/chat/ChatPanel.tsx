"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, Send, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useChat } from "./chat-store";

export function ChatMessages({ compact = false }: { compact?: boolean }) {
  const { messages, isTyping } = useChat();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, isTyping]);

  return (
    <div
      className={cn(
        "flex-1 space-y-4 overflow-y-auto subtle-scroll",
        compact ? "p-4" : "p-4 sm:p-6"
      )}
    >
      {messages.map((message) => (
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
                "rounded-2xl px-4 py-2.5 text-sm shadow-sm",
                message.role === "user"
                  ? "rounded-br-md bg-gradient-to-br from-blue-500 to-blue-600 text-white"
                  : "rounded-bl-md border border-slate-200 bg-white text-slate-800"
              )}
            >
              {message.text}
            </div>
            <span
              className={cn(
                "text-[10px] text-slate-400",
                message.role === "user" ? "text-right" : "text-left"
              )}
            >
              {message.timestamp}
            </span>
          </div>
        </div>
      ))}

      {isTyping && (
        <div className="mr-auto flex max-w-[88%] gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
            <Bot className="h-4 w-4" />
          </div>
          <div className="rounded-2xl rounded-bl-md border border-slate-200 bg-white px-4 py-3 shadow-sm">
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
    void sendMessage(value);
    setValue("");
  };

  return (
    <div className="border-t border-white/40 bg-white/60 p-3 backdrop-blur-xl sm:p-4">
      <div className="flex gap-2">
        <Input
          placeholder="Ketik pesan Anda..."
          value={value}
          autoFocus={autoFocus}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          className="flex-1 rounded-xl border-slate-200 bg-white/80 focus:border-blue-500"
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
      <p className="mt-2 text-center text-[10px] text-slate-500">
        Powered by Gemini 2.5 Flash-Lite • SMK Telekomunikasi Tunas Harapan
      </p>
    </div>
  );
}
