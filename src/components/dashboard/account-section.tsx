import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  CircleUserRound,
  GraduationCap,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardAvatar, type DashboardUser } from "@/components/dashboard/dashboard-shell";

/**
 * Section "Akun Saya" — server component.
 * Menerima data yang sudah diambil dari database (Prisma) di page.tsx,
 * sehingga tidak perlu "use client" maupun state.
 */
export function AccountSection({ user }: { user: DashboardUser }) {
  const rows = [
    {
      icon: Mail,
      label: "Email",
      value: user.email,
    },
    {
      icon: ShieldCheck,
      label: "Status email",
      value: user.emailVerified ? "Terverifikasi" : "Belum diverifikasi",
    },
    {
      icon: CircleUserRound,
      label: "Metode masuk",
      value: user.providerLabel,
    },
    {
      icon: CalendarDays,
      label: "Bergabung sejak",
      value: user.joinedLabel,
    },
    {
      icon: GraduationCap,
      label: "Status",
      value: "Siswa aktif — semester ganjil 2026/2027",
    },
  ];

  return (
    <section id="akun" className="mt-10 scroll-mt-24">
      <Card className="overflow-hidden bg-white">
        <div className="h-2.5 bg-gradient-to-r from-sky-400 via-sky-500 to-cyan-400" />
        <CardHeader className="flex-row items-start justify-between space-y-0">
          <div>
            <CardTitle className="text-base">Akun Saya</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Data profil Anda yang tersimpan di sistem sekolah.
            </p>
          </div>
          <Badge variant="secondary">Profil</Badge>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4 rounded-2xl bg-sky-50/70 p-4 ring-1 ring-sky-100">
            <DashboardAvatar user={user} size="lg" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-base font-bold text-slate-900">{user.name}</p>
              <p className="truncate text-sm text-slate-500">{user.email}</p>
            </div>
            <Badge
              variant={user.emailVerified ? "secondary" : "outline"}
              className={
                user.emailVerified
                  ? "border-transparent bg-emerald-100 text-emerald-700"
                  : "border-amber-200 bg-amber-50 text-amber-700"
              }
            >
              {user.emailVerified ? (
                <>
                  <CheckCircle2 className="h-3 w-3" aria-hidden />
                  Terverifikasi
                </>
              ) : (
                "Menunggu verifikasi"
              )}
            </Badge>
          </div>

          <dl className="mt-5 grid gap-x-8 gap-y-4 sm:grid-cols-2">
            {rows.map((r) => (
              <div key={r.label} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600 ring-1 ring-sky-100">
                  <r.icon className="h-4 w-4" aria-hidden />
                </span>
                <div className="min-w-0">
                  <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    {r.label}
                  </dt>
                  {/* break-words di HP supaya alamat/nilai panjang tidak terpotong. */}
                  <dd className="mt-0.5 break-words text-sm font-semibold text-slate-800 sm:truncate">
                    {r.value}
                  </dd>
                </div>
              </div>
            ))}
          </dl>

          {/* flex-wrap: dua tombol label panjang tidak muat di layar 360px. */}
          <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-sky-100 pt-4">
            <Button size="sm" asChild>
              <a href="/profile">
                Lihat Profil Lengkap
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
            <Button size="sm" variant="outline" asChild>
              <a href="/settings">
                Pengaturan Akun
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
          <p className="mt-4 text-xs leading-relaxed text-slate-400">
            Butuh perubahan data (nama, kelas, jurusan)? Hubungi admin akademik di{" "}
            <a
              href="mailto:admin@smktunasharapan.sch.id"
              className="inline-flex items-center gap-0.5 font-semibold text-sky-600 hover:text-sky-700 hover:underline"
            >
              admin@smktunasharapan.sch.id
              <ArrowRight className="h-3 w-3" aria-hidden />
            </a>
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
