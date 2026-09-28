import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { AuthBrandPanel } from "@/components/auth/auth-brand-panel";
import { AuthEntrance } from "@/components/auth/auth-entrance";
import { AuthLanguageProvider } from "@/components/auth/language-provider";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = {
  title: "Lupa kata sandi — SMK Telekomunikasi Tunas Harapan",
  description: "Minta tautan reset kata sandi melalui email.",
};

export default function ForgotPasswordPage() {
  return (
    <AuthLanguageProvider>
      <AuthEntrance>
        <AuthShell panel={<AuthBrandPanel />}>
          <ForgotPasswordForm />
        </AuthShell>
      </AuthEntrance>
    </AuthLanguageProvider>
  );
}
