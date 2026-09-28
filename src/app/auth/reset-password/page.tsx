import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { AuthBrandPanel } from "@/components/auth/auth-brand-panel";
import { AuthEntrance } from "@/components/auth/auth-entrance";
import { AuthLanguageProvider } from "@/components/auth/language-provider";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata: Metadata = {
  title: "Buat kata sandi baru — SMK Telekomunikasi Tunas Harapan",
  description: "Atur kata sandi baru untuk akun Anda.",
};

export default function ResetPasswordPage() {
  return (
    <AuthLanguageProvider>
      <AuthEntrance>
        <AuthShell panel={<AuthBrandPanel />}>
          <Suspense fallback={null}>
            <ResetPasswordForm />
          </Suspense>
        </AuthShell>
      </AuthEntrance>
    </AuthLanguageProvider>
  );
}
