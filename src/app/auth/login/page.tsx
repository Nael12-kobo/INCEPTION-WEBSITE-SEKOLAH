import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { AuthBrandPanel } from "@/components/auth/auth-brand-panel";
import { AuthEntrance } from "@/components/auth/auth-entrance";
import { AuthLanguageProvider } from "@/components/auth/language-provider";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Masuk — SMK Telekomunikasi Tunas Harapan",
  description: "Masuk ke akun Anda untuk melanjutkan.",
};

export default function LoginPage() {
  return (
    <AuthLanguageProvider>
      <AuthEntrance>
        <AuthShell panel={<AuthBrandPanel />}>
          <LoginForm />
        </AuthShell>
      </AuthEntrance>
    </AuthLanguageProvider>
  );
}
