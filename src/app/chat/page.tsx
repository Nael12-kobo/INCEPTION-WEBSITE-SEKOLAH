import type { Metadata } from "next";
import { ChatPageClient } from "@/components/chat/chat-page-client";

export const metadata: Metadata = {
  title: "Chat Asisten Sekolah — SMK Telekomunikasi Tunas Harapan",
  description:
    "Ngobrol dengan asisten AI SMK Telekomunikasi Tunas Harapan dalam mode fullscreen.",
};

export default function ChatPage() {
  return <ChatPageClient />;
}
