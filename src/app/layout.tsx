import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SiteChrome } from "@/components/SiteChrome";
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

/**
 * viewportFit "cover" supaya `env(safe-area-inset-*)` punya nilai nyata di
 * iPhone (notch / home indicator). Tanpa ini, tombol mengambang dan panel
 * chat di bawah layar bisa tertimpa baris gesture iOS.
 */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f8fafc",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ChatProvider>
          <SiteChrome>{children}</SiteChrome>
        </ChatProvider>
      </body>
    </html>
  );
}
