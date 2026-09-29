"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { UserRole, ROLE_META, isUserRole } from "@/lib/roles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Errors = Record<string, string>;

const CREATE_ROLE_OPTIONS = [UserRole.USER, UserRole.ADMIN] as const;

function CreateForm({
  canCreateAdmin,
  onCreated,
  onClose,
}: {
  canCreateAdmin: boolean;
  onCreated: (user: {
    id: string;
    name: string | null;
    email: string | null;
    role: string;
    emailVerified: string | null;
    createdAt: string;
  }) => void;
  onClose: () => void;
}) {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [role, setRole] = React.useState<string>(UserRole.USER);
  const [errors, setErrors] = React.useState<Errors>({});
  const [loading, setLoading] = React.useState(false);

  const roleOptions = canCreateAdmin ? CREATE_ROLE_OPTIONS : [UserRole.USER];

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.errors) setErrors(data.errors);
        throw new Error(data.error || "Gagal menambahkan user.");
      }
      onCreated(data.user);
      onClose();
    } catch (err) {
      if (Object.keys(errors).length === 0) {
        setErrors({ form: err instanceof Error ? err.message : "Gagal menambahkan user." });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit}>
      <div className="grid gap-4 py-2">
        <div className="space-y-1.5">
          <label htmlFor="create-name" className="font-caption text-sm font-semibold text-slate-700">
            Nama lengkap
          </label>
          <Input
            id="create-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nama user"
            required
          />
          {errors.name && <p className="font-caption text-xs text-rose-600">{errors.name}</p>}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="create-email" className="font-caption text-sm font-semibold text-slate-700">
            Email
          </label>
          <Input
            id="create-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="user@contoh.com"
            required
          />
          {errors.email && <p className="font-caption text-xs text-rose-600">{errors.email}</p>}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="create-password" className="font-caption text-sm font-semibold text-slate-700">
            Password awal
          </label>
          <div className="relative">
            <Input
              id="create-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimal 8 karakter"
              autoComplete="new-password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-sky-600 hover:text-sky-700"
            >
              {showPassword ? "Sembunyi" : "Lihat"}
            </button>
          </div>
          {errors.password && (
            <p className="font-caption text-xs text-rose-600">{errors.password}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="create-role" className="font-caption text-sm font-semibold text-slate-700">
            Role
          </label>
          <select
            id="create-role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            disabled={!canCreateAdmin}
            className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60"
          >
            {roleOptions.map((r) => (
              <option key={r} value={r}>
                {ROLE_META[r].label}
              </option>
            ))}
          </select>
          {!canCreateAdmin && (
            <p className="font-caption text-xs text-slate-400">
              Hanya Super Admin yang dapat membuat akun ADMIN.
            </p>
          )}
          {errors.role && <p className="font-caption text-xs text-rose-600">{errors.role}</p>}
        </div>

        {errors.form && (
          <p className="rounded-xl bg-rose-50 px-3 py-2 font-caption text-xs text-rose-700">
            {errors.form}
          </p>
        )}
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          Batal
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
          Tambah User
        </Button>
      </DialogFooter>
    </form>
  );
}

export function UserCreateDialog({
  open,
  onOpenChange,
  currentUserRole,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUserRole: string;
  onCreated: (user: {
    id: string;
    name: string | null;
    email: string | null;
    role: string;
    emailVerified: string | null;
    createdAt: string;
  }) => void;
}) {
  const canCreateAdmin =
    isUserRole(currentUserRole) && currentUserRole === UserRole.SUPER_ADMIN;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle>Tambah User</DialogTitle>
          <DialogDescription>
            Buat akun baru dengan password awal. Password dapat diganti oleh user
            setelah login.
          </DialogDescription>
        </DialogHeader>
        <CreateForm
          key={String(open)}
          canCreateAdmin={canCreateAdmin}
          onCreated={onCreated}
          onClose={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
