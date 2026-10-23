"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Download, Eye, Mail, UserCog, Trash2, LogIn, Loader2 } from "lucide-react";
import {
  UserRole,
  canEditUser,
  canDeleteUser,
  canImpersonate,
  getAccessibleRoles,
} from "@/lib/roles";
import { UserEditDialog } from "@/components/admin/user-edit-dialog";
import { UserCreateDialog } from "@/components/admin/user-create-dialog";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { parseJsonSafe } from "@/components/admin/api-json";
import { Button } from "@/components/ui/button";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { ExportButton } from "@/components/ui/export-button";
import { Search } from "lucide-react";

export type AdminUserRow = {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  emailVerified: string | null;
  createdAt: string;
  /** Foto siswa (syarat PPDB) sudah diunggah — untuk pratinjau & unduh. */
  hasPhoto: boolean;
};

const roleBadge: Record<
  string,
  { variant: "default" | "secondary" | "outline" | "violet" | "info"; label: string }
> = {
  SUPER_ADMIN: { variant: "violet", label: "Super Admin" },
  ADMIN: { variant: "info", label: "Admin" },
  USER: { variant: "secondary", label: "User" },
};

function initialsFrom(name: string | null, email: string | null) {
  const source = (name || email || "?").trim();
  const parts = source.split(/[\s._@-]+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "?";
  const second = parts[1]?.[0] ?? "";
  return (first + second).toUpperCase();
}

export function AdminUsersClient({
  currentUserId,
  currentUserRole,
  initialUsers,
}: {
  currentUserId: string;
  currentUserRole: string;
  initialUsers: AdminUserRow[];
}) {
  const [users, setUsers] = React.useState(initialUsers);
  const [query, setQuery] = React.useState("");
  const [editOpen, setEditOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<AdminUserRow | null>(null);
  const [createOpen, setCreateOpen] = React.useState(false);
  const router = useRouter();
  const toast = useToast();

  // Status sibuk per baris: menonaktifkan tombol aksi saat delete/impersonate
  // berjalan supaya tidak bisa double-submit (#46).
  const [pending, setPending] = React.useState<{
    id: string;
    action: "delete" | "impersonate";
  } | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<AdminUserRow | null>(null);

  // Buka dialog tambah saat URL ber-hash #tambah-user (dipicu tombol header).
  React.useEffect(() => {
    const sync = () => setCreateOpen(window.location.hash === "#tambah-user");
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  React.useEffect(() => {
    if (!createOpen && window.location.hash === "#tambah-user") {
      history.replaceState(null, "", window.location.pathname);
    }
  }, [createOpen]);

  const accessibleRoles = getAccessibleRoles(currentUserRole);

  const filtered = users.filter((u) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      (u.name || "").toLowerCase().includes(q) ||
      (u.email || "").toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q)
    );
  });

  const adminCount = users.filter((u) => u.role === UserRole.ADMIN).length;
  const superCount = users.filter((u) => u.role === UserRole.SUPER_ADMIN).length;

  const refresh = async () => {
    const res = await fetch("/api/admin/users");
    if (!res.ok) return;
    const data = await parseJsonSafe<{
      users?: Array<{
        id: string;
        name: string | null;
        email: string | null;
        role: string;
        emailVerified: string | Date | null;
        createdAt: string | Date;
        hasPhoto?: boolean;
      }>;
    }>(res);
    if (!data?.users) return;
    setUsers(
      data.users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        emailVerified: u.emailVerified
          ? typeof u.emailVerified === "string"
            ? u.emailVerified
            : new Date(u.emailVerified).toISOString()
          : null,
        createdAt:
          typeof u.createdAt === "string"
            ? u.createdAt
            : new Date(u.createdAt).toISOString(),
        hasPhoto: Boolean(u.hasPhoto),
      }))
    );
  };

  const handleSave = async (
    userId: string,
    data: { name?: string; email?: string; role?: string }
  ) => {
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await parseJsonSafe<{ error?: string }>(res);
      throw new Error(err?.error || "Gagal memperbarui user");
    }
    await refresh();
  };

  const handleCreate = (user: {
    id: string;
    name: string | null;
    email: string | null;
    role: string;
    emailVerified: string | null;
    createdAt: string;
  }) => {
    // User baru pasti belum punya foto.
    setUsers((prev) => [{ ...user, hasPhoto: false }, ...prev]);
  };

  const handleDelete = async () => {
    if (!deleteTarget || pending) return;
    const userId = deleteTarget.id;
    setPending({ id: userId, action: "delete" });
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await parseJsonSafe<{ error?: string }>(res);
        throw new Error(err?.error || "Gagal menghapus user");
      }
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      toast.success("User berhasil dihapus.");
      setDeleteTarget(null);
    } catch (error) {
      toast.error(
        error instanceof Error && error.message
          ? error.message
          : "Gagal menghapus user"
      );
    } finally {
      setPending(null);
    }
  };

  /** Pindah sesi ke akun target (mode "masuk sebagai siswa"). */
  const handleImpersonate = async (user: AdminUserRow) => {
    if (pending) return;
    setPending({ id: user.id, action: "impersonate" });
    try {
      const res = await fetch(`/api/admin/users/${user.id}/impersonate`, {
        method: "POST",
      });
      if (!res.ok) {
        const body = await parseJsonSafe<{ error?: string }>(res);
        throw new Error(body?.error ?? "");
      }
      // Navigasi + refresh: semua halaman memakai sesi siswa hasil pindah
      // (pengganti window.location.assign yang memicu lint no-location-assign).
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error && error.message
          ? error.message
          : "Gagal masuk sebagai user ini."
      );
    } finally {
      setPending(null);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Cari nama atau email..."
                  className="pl-9 h-9 text-sm"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <Badge variant="secondary">{users.length} user</Badge>
              <Badge variant="info">{adminCount} admin</Badge>
              <Badge variant="violet">{superCount} super admin</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full sm:min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left font-overline text-[11px] text-slate-500 uppercase tracking-wider py-3 px-3">
                    Pengguna
                  </th>
                  <th className="text-left font-overline text-[11px] text-slate-500 uppercase tracking-wider py-3 px-3 hidden sm:table-cell">
                    Role
                  </th>
                  <th className="text-left font-overline text-[11px] text-slate-500 uppercase tracking-wider py-3 px-3 hidden md:table-cell">
                    Verifikasi
                  </th>
                  <th className="text-left font-overline text-[11px] text-slate-500 uppercase tracking-wider py-3 px-3 hidden lg:table-cell">
                    Bergabung
                  </th>
                  <th className="text-right font-overline text-[11px] text-slate-500 uppercase tracking-wider py-3 px-3">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-sm text-slate-400">
                      Tidak ada pengguna yang cocok.
                    </td>
                  </tr>
                ) : (
                  filtered.map((user) => {
                    const badge = roleBadge[user.role] || roleBadge.USER;
                    const isSelf = user.id === currentUserId;
                    const canEdit = !isSelf && canEditUser(currentUserRole, user.role);
                    const canDelete = !isSelf && canDeleteUser(currentUserRole, user.role);
                    const canSwitch = !isSelf && canImpersonate(currentUserRole, user.role);
                    // Aksi baris ini sedang berjalan — tombol dinonaktifkan (#46).
                    const rowAction =
                      pending?.id === user.id ? pending.action : null;

                    return (
                      <tr
                        key={user.id}
                        className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60 transition-colors"
                      >
                        <td className="py-3.5 px-3">
                          <div className="flex items-center gap-3">
                            {user.hasPhoto ? (
                              // eslint-disable-next-line @next/next/no-img-element -- foto dari API ber-sesi, bukan aset statis
                              <img
                                src={`/api/admin/users/${user.id}/photo`}
                                alt={`Foto ${user.name ?? user.email ?? "siswa"}`}
                                loading="lazy"
                                className="h-9 w-9 shrink-0 rounded-full object-cover ring-2 ring-sky-100"
                              />
                            ) : (
                              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-cyan-500 font-bold text-xs text-white ring-2 ring-sky-100">
                                {initialsFrom(user.name, user.email)}
                              </span>
                            )}
                            <div className="min-w-0">
                              <div className="font-body text-sm font-semibold text-slate-900 truncate">
                                {user.name || "—"}
                                {isSelf ? (
                                  <span className="ml-2 text-xs font-medium text-sky-600">
                                    (Anda)
                                  </span>
                                ) : null}
                              </div>
                              <div className="font-caption text-[11px] text-slate-500 truncate flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {user.email || "—"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-3 hidden sm:table-cell">
                          <Badge variant={badge.variant} className="text-[10px]">
                            {badge.label}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-3 hidden md:table-cell">
                          <StatusBadge status={user.emailVerified ? "REGISTERED" : "PENDING"}>
                            {user.emailVerified ? "Terverifikasi" : "Belum Verif"}
                          </StatusBadge>
                        </td>
                        <td className="py-3.5 px-3 hidden lg:table-cell">
                          <span className="font-caption text-[11px] text-slate-500">
                            {new Date(user.createdAt).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {user.hasPhoto ? (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  aria-label={`Lihat foto ${user.name ?? user.email ?? ""}`}
                                  title="Lihat foto"
                                  asChild
                                >
                                  <a
                                    href={`/api/admin/users/${user.id}/photo`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <Eye className="h-4 w-4 text-slate-500" />
                                  </a>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  aria-label={`Unduh foto ${user.name ?? user.email ?? ""}`}
                                  title="Unduh foto"
                                  asChild
                                >
                                  <a href={`/api/admin/users/${user.id}/photo?download=1`}>
                                    <Download className="h-4 w-4 text-slate-500" />
                                  </a>
                                </Button>
                              </>
                            ) : null}
                            {canSwitch ? (
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                aria-label="Masuk sebagai user ini"
                                title="Masuk sebagai siswa ini"
                                disabled={rowAction !== null}
                                onClick={() => handleImpersonate(user)}
                              >
                                {rowAction === "impersonate" ? (
                                  <Loader2 className="h-4 w-4 animate-spin text-slate-500" aria-hidden />
                                ) : (
                                  <LogIn className="h-4 w-4 text-slate-500" />
                                )}
                              </Button>
                            ) : null}
                            {canEdit ? (
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                aria-label="Edit"
                                disabled={rowAction !== null}
                                onClick={() => {
                                  setSelected(user);
                                  setEditOpen(true);
                                }}
                              >
                                <UserCog className="h-4 w-4 text-slate-500" />
                              </Button>
                            ) : null}
                            {canDelete ? (
                              <Button
                                variant="ghost-destructive"
                                size="icon-sm"
                                aria-label="Hapus"
                                disabled={rowAction !== null}
                                onClick={() => setDeleteTarget(user)}
                              >
                                {rowAction === "delete" ? (
                                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </Button>
                            ) : null}
                            {!canEdit && !canDelete && !user.hasPhoto ? (
                              <span className="text-xs text-slate-300 px-2">—</span>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-3 flex-wrap">
            <p className="font-caption text-[11px] text-slate-400">
              Menampilkan {filtered.length} dari {users.length} pengguna.
            </p>
            <ExportButton
              filename="users-admin"
              data={filtered.map((u) => ({
                name: u.name,
                email: u.email,
                role: u.role,
                emailVerified: Boolean(u.emailVerified),
                foto: u.hasPhoto ? "Ada" : "Belum",
                createdAt: u.createdAt,
              }))}
              columns={[
                { key: "name", label: "Nama" },
                { key: "email", label: "Email" },
                { key: "role", label: "Role" },
                { key: "emailVerified", label: "Terverifikasi" },
                { key: "foto", label: "Foto Siswa" },
                { key: "createdAt", label: "Bergabung" },
              ]}
            />
          </div>
        </CardContent>
      </Card>

      <UserEditDialog
        user={selected}
        open={editOpen}
        onOpenChange={setEditOpen}
        currentUserRole={currentUserRole}
        accessibleRoles={accessibleRoles}
        onSave={handleSave}
      />

      <UserCreateDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        currentUserRole={currentUserRole}
        onCreated={handleCreate}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(o) => {
          if (!o && !pending) setDeleteTarget(null);
        }}
        title="Hapus user ini?"
        description={`${deleteTarget?.email ?? ""} — tindakan tidak bisa dibatalkan.`}
        confirmLabel="Hapus"
        destructive
        loading={pending?.action === "delete"}
        onConfirm={handleDelete}
      />
    </>
  );
}
