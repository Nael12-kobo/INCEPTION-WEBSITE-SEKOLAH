"use client";

import { useState } from "react";
import { MessageCircle, X, Send, Sparkles, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Message {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: string;
}

export function ChatBubble() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Halo! 👋 Ada yang bisa saya bantu tentang sekolah kami?",
      isUser: false,
      timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      text: inputText,
      isUser: true,
      timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsTyping(true);

    // Simulate bot response
    setTimeout(() => {
      const botResponses = [
        "Terima kasih atas pertanyaannya! Saya akan membantu mencari informasi yang Anda butuhkan.",
        "Pertanyaan yang menarik! Silakan tunggu sebentar, saya sedang memproses informasinya.",
        "Baik, saya mengerti. Ada hal lain yang ingin Anda tanyakan tentang SMK Telekomunikasi Tunas Harapan?",
        "Info yang Anda butuhkan sudah siap! Silakan lihat bagian jurusan atau fasilitas di website kami.",
      ];
      
      const randomResponse = botResponses[Math.floor(Math.random() * botResponses.length)];
      
      const botMessage: Message = {
        id: messages.length + 2,
        text: randomResponse,
        isUser: false,
        timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 z-50 group",
          "flex items-center justify-center",
          "w-16 h-16 rounded-full",
          "bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600",
          "text-white shadow-2xl",
          "hover:shadow-blue-500/50 hover:scale-110",
          "transition-all duration-300 ease-out",
          "animate-bounce-slow",
          isOpen && "scale-0 opacity-0"
        )}
        aria-label="Buka chat"
      >
        <div className="relative">
          <MessageCircle className="w-7 h-7" />
          <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-yellow-300 animate-pulse" />
        </div>
        
        {/* Notification Badge */}
        <span className="absolute -top-1 -right-1 flex h-5 w-5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-5 w-5 bg-red-500 text-[10px] font-bold items-center justify-center">
            1
          </span>
        </span>
      </button>

      {/* Chat Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="fixed bottom-6 right-6 top-auto left-auto translate-x-0 translate-y-0 m-0 w-[calc(100vw-2rem)] sm:w-[400px] rounded-2xl shadow-2xl border-0 p-0 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 p-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <DialogTitle className="text-sm font-semibold">Asisten Sekolah</DialogTitle>
                  <p className="text-xs text-blue-100">Online • Siap membantu</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 text-white hover:bg-white/20"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="h-[350px] overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-slate-50 to-white">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-2.5 max-w-[85%]",
                  message.isUser ? "ml-auto flex-row-reverse" : "mr-auto"
                )}
              >
                <div
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                    message.isUser
                      ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white"
                      : "bg-gradient-to-br from-indigo-500 to-purple-600 text-white"
                  )}
                >
                  {message.isUser ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <div
                    className={cn(
                      "rounded-2xl px-4 py-2.5 text-sm shadow-sm",
                      message.isUser
                        ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-md"
                        : "bg-white border border-slate-200 text-slate-800 rounded-bl-md"
                    )}
                  >
                    {message.text}
                  </div>
                  <span
                    className={cn(
                      "text-[10px] text-slate-400",
                      message.isUser ? "text-right" : "text-left"
                    )}
                  >
                    {message.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-2.5 max-w-[85%] mr-auto">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="flex flex-col gap-1">
                  <div className="rounded-2xl rounded-bl-md px-4 py-2.5 bg-white border border-slate-200 shadow-sm">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t border-slate-200 p-4 bg-white">
            <div className="flex gap-2">
              <Input
                placeholder="Ketik pesan Anda..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputText.trim() || isTyping}
                size="icon"
                className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-[10px] text-slate-400 mt-2 text-center">
              Powered by SMK Telekomunikasi Tunas Harapan
            </p>
          </div>
        </DialogContent>
      </Dialog>

      <style jsx global>{`
        @keyframes bounce-slow {
          0%, 100% {
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
