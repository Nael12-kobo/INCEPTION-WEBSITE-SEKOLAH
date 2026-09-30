"use client";

import Image from "next/image";
import {
  Mail,
  ShieldCheck,
  CircleUserRound,
  CalendarDays,
  GraduationCap,
  FileText,
  User,
  Phone,
  MapPin,
  Building2,
  UserCheck,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { formatRoleLabel } from "@/lib/roles";

type UserData = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  emailVerified: string | null;
  role: string;
  createdAt: string;
  providerLabel: string;
};

type PpdbData = {
  registrationNo: string | null;
  status: string | null;
  majorFirst: string | null;
  majorSecond: string | null;
  fullName: string | null;
  birthDate: Date | null;
  gender: string | null;
  phone: string | null;
  address: string | null;
  previousSchool: string | null;
  parentName: string | null;
  parentPhone: string | null;
  createdAt: Date | null;
} | null;

function initialsFrom(name: string, email: string): string {
  const source = name.trim() || email.split("@")[0] || "?";
  const parts = source.split(/[\s._-]+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "?";
  const second = parts[1]?.[0] ?? "";
  return (first + second).toUpperCase();
}

function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(dateString));
}

function getStatusBadge(status: string | null) {
  if (!status) return null;

  const statusConfig: Record<string, { variant: "secondary" | "warning" | "destructive"; label: string; icon: React.ComponentType<{ className?: string }> | null }> = {
    APPROVED: {
      variant: "secondary" as const,
      label: "Diterima",
      icon: CheckCircle2,
    },
    PENDING: {
      variant: "warning" as const,
      label: "Menunggu",
      icon: Clock,
    },
    REJECTED: {
      variant: "destructive" as const,
      label: "Ditolak",
      icon: XCircle,
    },
  };

  const config = statusConfig[status] || {
    variant: "secondary",
    label: status,
    icon: null,
  };

  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className="gap-1">
      {Icon && <Icon className="h-3 w-3" />}
      {config.label}
    </Badge>
  );
}

export function UserProfileClient({
  user,
  ppdb,
}: {
  user: UserData;
  ppdb: PpdbData;
}) {
  const accountRows = [
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
      value: formatDate(user.createdAt),
    },
    {
      icon: GraduationCap,
      label: "Role",
      value: formatRoleLabel(user.role),
    },
  ];

  const ppdbRows = ppdb
    ? [
        {
          icon: FileText,
          label: "No. Pendaftaran",
          value: ppdb.registrationNo || "—",
        },
        {
          icon: User,
          label: "Nama Lengkap",
          value: ppdb.fullName || "—",
        },
        {
          icon: CalendarDays,
          label: "Tanggal Lahir",
          value: ppdb.birthDate ? formatDate(ppdb.birthDate.toISOString()) : "—",
        },
        {
          icon: UserCheck,
          label: "Jenis Kelamin",
          value: ppdb.gender === "L" ? "Laki-laki" : ppdb.gender === "P" ? "Perempuan" : "—",
        },
        {
          icon: Phone,
          label: "No. Telepon",
          value: ppdb.phone || "—",
        },
        {
          icon: MapPin,
          label: "Alamat",
          value: ppdb.address || "—",
        },
        {
          icon: Building2,
          label: "Sekolah Asal",
          value: ppdb.previousSchool || "—",
        },
        {
          icon: User,
          label: "Nama Orang Tua",
          value: ppdb.parentName || "—",
        },
        {
          icon: Phone,
          label: "No. HP Orang Tua",
          value: ppdb.parentPhone || "—",
        },
        {
          icon: GraduationCap,
          label: "Jurusan Pilihan 1",
          value: ppdb.majorFirst || "—",
        },
        {
          icon: GraduationCap,
          label: "Jurusan Pilihan 2",
          value: ppdb.majorSecond || "—",
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Account Info Card */}
      <Card className="overflow-hidden bg-white">
        <div className="h-2.5 bg-linear-to-r from-sky-400 via-sky-500 to-cyan-400" />
        <CardHeader className="flex-row items-start justify-between space-y-0">
          <div>
            <CardTitle className="text-base">Informasi Akun</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Data akun Anda yang tersimpan di sistem.
            </p>
          </div>
          <Badge variant="secondary">Akun</Badge>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4 rounded-2xl bg-sky-50/70 p-4 ring-1 ring-sky-100">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-sky-100 text-2xl font-bold text-sky-600">
              {user.image ? (
                <Image
                  src={user.image}
                  alt={user.name}
                  width={64}
                  height={64}
                  className="h-full w-full rounded-full object-cover"
                  unoptimized
                />
              ) : (
                initialsFrom(user.name, user.email)
              )}
            </div>
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
            {accountRows.map((r) => (
              <div key={r.label} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600 ring-1 ring-sky-100">
                  <r.icon className="h-4 w-4" aria-hidden />
                </span>
                <div className="min-w-0">
                  <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    {r.label}
                  </dt>
                  <dd className="mt-0.5 truncate text-sm font-semibold text-slate-800">
                    {r.value}
                  </dd>
                </div>
              </div>
            ))}
          </dl>

          <div className="mt-6 flex items-center gap-3 border-t border-sky-100 pt-4">
            <Button size="sm" asChild>
              <a href="/settings">
                Edit Profil
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* PPDB Info Card */}
      {ppdb ? (
        <Card className="overflow-hidden bg-white">
          <div className="h-2.5 bg-linear-to-r from-emerald-400 via-emerald-500 to-teal-400" />
          <CardHeader className="flex-row items-start justify-between space-y-0">
            <div>
              <CardTitle className="text-base">Data PPDB</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Data pendaftaran Anda untuk tahun ajaran baru.
              </p>
            </div>
            {getStatusBadge(ppdb.status)}
          </CardHeader>
          <CardContent>
            <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
              {ppdbRows.map((r) => (
                <div key={r.label} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
                    <r.icon className="h-4 w-4" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      {r.label}
                    </dt>
                    <dd className="mt-0.5 truncate text-sm font-semibold text-slate-800">
                      {r.value}
                    </dd>
                  </div>
                </div>
              ))}
            </dl>

            <div className="mt-6 flex items-center gap-3 border-t border-emerald-100 pt-4">
              <Button size="sm" variant="outline" asChild>
                <a href="/ppdb">
                  Lihat Formulir PPDB
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden bg-white">
          <div className="h-2.5 bg-cyan-400" />
          <CardHeader>
            <CardTitle className="text-base">Data PPDB</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Anda belum mendaftar PPDB.
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Button size="sm" asChild>
                <a href="/ppdb">
                  Daftar PPDB Sekarang
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
