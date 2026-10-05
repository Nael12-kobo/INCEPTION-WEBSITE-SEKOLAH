import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { ChatBubble } from "@/components/ChatBubble";
import { ChatProvider } from "@/components/chat/chat-store";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SMK Telekomunikasi Tunas Harapan",
  description:
    "SMK Telekomunikasi Tunas Harapan — sekolah vokasi modern bidang telekomunikasi, jaringan, dan teknologi digital.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Navbar />
        <ChatProvider>
          {children}
          <ChatBubble />
        </ChatProvider>
      </body>
    </html>
  );
}
