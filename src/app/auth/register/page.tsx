import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { AuthBrandPanel } from "@/components/auth/auth-brand-panel";
import { AuthEntrance } from "@/components/auth/auth-entrance";
import { AuthLanguageProvider } from "@/components/auth/language-provider";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Daftar — SMK Telekomunikasi Tunas Harapan",
  description: "Buat akun baru untuk memulai.",
};

export default function RegisterPage() {
  return (
    <AuthLanguageProvider>
      <AuthEntrance>
        <AuthShell panel={<AuthBrandPanel />}>
          <RegisterForm />
        </AuthShell>
      </AuthEntrance>
    </AuthLanguageProvider>
  );
}
