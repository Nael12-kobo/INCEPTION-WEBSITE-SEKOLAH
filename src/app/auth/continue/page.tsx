import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { landingPathForRole } from "@/lib/roles";

export const metadata: Metadata = {
  title: "Mengalihkan… — SMK Telekomunikasi Tunas Harapan",
  description: "Menyiapkan halaman setelah Anda masuk.",
};

/**
 * Tujuan akhir login (`callbackUrl` tidak ditentukan).
 *
 * Satu rute untuk SEMUA jalur masuk — form email/sandi (login-form.tsx) dan
 * tombol Google (social-auth-buttons.tsx) — agar keputusan peran hanya
 * ditulis sekali di server:
 *
 * - ADMIN / SUPER_ADMIN → /admin/overview (Admin Panel)
 * - USER                → /dashboard (portal siswa)
 *
 * Kalau tidak ada sesi (mis. cookie terhapus di tengah jalan), kembali ke
 * halaman login. `callbackUrl` eksplisit tetap dihormati oleh LoginForm —
 * rute ini hanya dipakai saat user tidak membawa tujuan tertentu.
 */
export default async function AuthContinuePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  redirect(landingPathForRole(session.user.role));
}
