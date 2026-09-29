"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  UserRound,
  KeyRound,
  ShieldCheck,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";

type Errors = Record<string, string>;

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1.5 font-caption text-xs text-rose-600">{message}</p>;
}

function ProfileForm({
  initialName,
  initialEmail,
  hasPassword,
}: {
  initialName: string;
  initialEmail: string;
  hasPassword: boolean;
}) {
  const toast = useToast();
  const router = useRouter();
  const [name, setName] = React.useState(initialName);
  const [email, setEmail] = React.useState(initialEmail);
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [errors, setErrors] = React.useState<Errors>({});
  const [loading, setLoading] = React.useState(false);

  const emailChanged = email.trim().toLowerCase() !== initialEmail.toLowerCase();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    try {
      const res = await fetch("/api/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          currentPassword: emailChanged ? currentPassword : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.errors) setErrors(data.errors);
        throw new Error(data.message || "Gagal memperbarui profil.");
      }
      toast.success("Profil berhasil diperbarui.");
      setCurrentPassword("");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal memperbarui profil.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
            <UserRound className="h-4 w-4" aria-hidden />
          </span>
          Profil Saya
        </CardTitle>
        <CardDescription>
          Perbarui nama dan email akun Anda. Email baru wajib konfirmasi kata sandi.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="space-y-5 max-w-xl">
          <div>
            <label htmlFor="settings-name" className="font-caption text-sm font-semibold text-slate-700">
              Nama lengkap
            </label>
            <Input
              id="settings-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1.5"
              placeholder="Nama Anda"
              required
            />
            <FieldError message={errors.name} />
          </div>

          <div>
            <label htmlFor="settings-email" className="font-caption text-sm font-semibold text-slate-700">
              Email
            </label>
            <Input
              id="settings-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5"
              placeholder="email@contoh.com"
              required
            />
            <FieldError message={errors.email} />
          </div>

          {emailChanged && hasPassword && (
            <div>
              <label
                htmlFor="settings-current"
                className="font-caption text-sm font-semibold text-slate-700"
              >
                Konfirmasi kata sandi saat ini
              </label>
              <Input
                id="settings-current"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="mt-1.5"
                placeholder="Kata sandi saat ini"
                autoComplete="current-password"
              />
              <FieldError message={errors.currentPassword} />
            </div>
          )}

          <div className="flex items-center gap-3">
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
              Simpan Perubahan
            </Button>
            {emailChanged && (
              <Badge variant="warning" className="text-[11px]">
                Email berubah — perlu konfirmasi
              </Badge>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function PasswordForm({ hasPassword }: { hasPassword: boolean }) {
  const toast = useToast();
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showCurrent, setShowCurrent] = React.useState(false);
  const [showNew, setShowNew] = React.useState(false);
  const [errors, setErrors] = React.useState<Errors>({});
  const [loading, setLoading] = React.useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    if (newPassword !== confirmPassword) {
      setErrors({ confirmPassword: "Konfirmasi password tidak sama." });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/account", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.errors) setErrors(data.errors);
        throw new Error(data.message || "Gagal mengganti kata sandi.");
      }
      toast.success("Kata sandi berhasil diganti.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal mengganti kata sandi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
            <KeyRound className="h-4 w-4" aria-hidden />
          </span>
          Keamanan Akun
        </CardTitle>
        <CardDescription>
          {hasPassword
            ? "Ganti kata sandi akun Anda secara berkala untuk keamanan."
            : "Akun Anda belum memiliki kata sandi (login via OAuth). Set kata sandi agar bisa login dengan email."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="space-y-5 max-w-xl">
          {hasPassword && (
            <div>
              <label
                htmlFor="pw-current"
                className="font-caption text-sm font-semibold text-slate-700"
              >
                Kata sandi saat ini
              </label>
              <div className="relative mt-1.5">
                <Input
                  id="pw-current"
                  type={showCurrent ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="pr-10"
                  placeholder="Kata sandi saat ini"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent((v) => !v)}
                  aria-label={showCurrent ? "Sembunyikan sandi" : "Tampilkan sandi"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <FieldError message={errors.currentPassword} />
            </div>
          )}

          <div>
            <label htmlFor="pw-new" className="font-caption text-sm font-semibold text-slate-700">
              Kata sandi baru
            </label>
            <div className="relative mt-1.5">
              <Input
                id="pw-new"
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="pr-10"
                placeholder="Minimal 8 karakter"
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowNew((v) => !v)}
                aria-label={showNew ? "Sembunyikan sandi" : "Tampilkan sandi"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <FieldError message={errors.newPassword} />
          </div>

          <div>
            <label
              htmlFor="pw-confirm"
              className="font-caption text-sm font-semibold text-slate-700"
            >
              Ulangi kata sandi baru
            </label>
            <Input
              id="pw-confirm"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1.5"
              placeholder="Ulangi kata sandi baru"
              autoComplete="new-password"
              required
            />
            <FieldError message={errors.confirmPassword} />
          </div>

          <div className="flex items-start gap-2.5 rounded-2xl border border-sky-100 bg-sky-50/60 p-4">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" aria-hidden />
            <p className="font-caption text-xs leading-relaxed text-slate-600">
              Gunakan minimal 8 karakter dengan kombinasi huruf, angka, dan simbol.
              Jangan pernah membagikan kata sandi kepada siapa pun.
            </p>
          </div>

          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
            Ganti Kata Sandi
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export function AdminSettingsClient({
  initialName,
  initialEmail,
  role,
  hasPassword,
}: {
  initialName: string;
  initialEmail: string;
  role: string;
  hasPassword: boolean;
}) {
  return (
    <div className="space-y-6">
      <ProfileForm
        initialName={initialName}
        initialEmail={initialEmail}
        hasPassword={hasPassword}
      />
      <PasswordForm hasPassword={hasPassword} />
      <Card>
        <CardHeader>
          <CardTitle>Informasi Akun</CardTitle>
          <CardDescription>Detail role dan hak akses Anda saat ini.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 font-caption text-sm text-slate-600">
          <p>
            Role aktif:{" "}
            <Badge variant={role === "SUPER_ADMIN" ? "violet" : role === "ADMIN" ? "info" : "secondary"}>
              {role}
            </Badge>
          </p>
          <p>
            Lihat rincian izin di halaman{" "}
            <a href="/admin/roles" className="font-semibold text-sky-600 hover:underline">
              Role &amp; Izin
            </a>
            .
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
