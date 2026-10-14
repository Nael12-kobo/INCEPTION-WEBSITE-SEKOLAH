import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { AuthBrandPanel } from "@/components/auth/auth-brand-panel";
import { AuthEntrance } from "@/components/auth/auth-entrance";
import { AuthLanguageProvider } from "@/components/auth/language-provider";
import { AuthErrorNotice } from "@/components/auth/auth-error-notice";

export const metadata: Metadata = {
  title: "Login bermasalah — SMK Telekomunikasi Tunas Harapan",
  description:
    "Terjadi kesalahan saat proses masuk. Silakan coba lagi atau hubungi sekolah.",
};

/**
 * Tujuan redirect error Auth.js (`pages.error` di src/lib/auth.ts).
 * Tanpa halaman ini, semua error login (mis. provider belum dikonfigurasi)
 * jatuh ke halaman 404 yang membingungkan.
 */
export default function AuthErrorPage() {
  return (
    <AuthLanguageProvider>
      <AuthEntrance>
        <AuthShell panel={<AuthBrandPanel />}>
          {/* useSearchParams() wajib punya Suspense boundary di App Router. */}
          <Suspense fallback={null}>
            <AuthErrorNotice />
          </Suspense>
        </AuthShell>
      </AuthEntrance>
    </AuthLanguageProvider>
  );
}
