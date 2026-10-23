"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import {
  UserRole,
  canEditUser,
  canDeleteUser,
  isAdmin,
} from "@/lib/roles";
import { UserEditDialog } from "@/components/admin/user-edit-dialog";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { parseJsonSafe } from "@/components/admin/api-json";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface User {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  emailVerified: Date | null;
  createdAt: Date;
}

interface PpdbRegistration {
  id: string;
  registrationNo: string;
  fullName: string;
  email: string;
  status: string;
  majorFirst: string;
  majorSecond?: string;
  notes?: string;
  createdAt: Date;
}

const PPDB_STATUSES = ["PENDING", "CONTACTED", "REGISTERED", "REJECTED"] as const;
const PPDB_MAJORS = ["DKV", "PPLG", "TJKT", "TKR"] as const;

/** Opsi jurusan untuk select: nilai saat ini ikut disertakan bila belum ada di daftar. */
function majorOptions(current?: string): string[] {
  const list: string[] = [...PPDB_MAJORS];
  if (current && !list.includes(current)) list.unshift(current);
  return list;
}

interface AdminClientProps {
  currentUser: { id: string; name: string | null; email: string | null; role: string };
  users: User[];
  ppdbRegistrations: PpdbRegistration[];
  accessibleRoles: string[];
}

/**
 * Dialog form edit pendaftaran PPDB — pengganti rantai window.prompt/alert
 * yang blocking. Semua field yang dulu bisa diedit tetap tersedia: nama,
 * email, jurusan 1/2, catatan admin, dan status; aturan validasi juga sama
 * (jurusan & status harus termasuk daftar yang valid, nama min. 2 karakter).
 */
function PpdbEditDialog({
  registration,
  onOpenChange,
  onSave,
}: {
  registration: PpdbRegistration | null;
  onOpenChange: (open: boolean) => void;
  onSave: (id: string, data: Record<string, string>) => Promise<boolean>;
}) {
  const [fullName, setFullName] = useState(registration?.fullName ?? "");
  const [email, setEmail] = useState(registration?.email ?? "");
  const [majorFirst, setMajorFirst] = useState(registration?.majorFirst ?? "");
  const [majorSecond, setMajorSecond] = useState(registration?.majorSecond ?? "");
  const [notes, setNotes] = useState(registration?.notes ?? "");
  const [status, setStatus] = useState(registration?.status ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registration || saving) return;

    // Semantik lama dipertahankan: nilai kosong = tidak dikirim (tanpa
    // perubahan), kecuali catatan — dikosongkan berarti menghapus catatan lama.
    const next: Record<string, string> = {};
    const fieldErrors: Record<string, string> = {};

    const m1 = majorFirst.trim();
    if (m1) {
      if (!(PPDB_MAJORS as readonly string[]).includes(m1.toUpperCase())) {
        fieldErrors.majorFirst = `Jurusan 1 tidak valid. Pilih: ${PPDB_MAJORS.join(", ")}`;
      } else {
        next.majorFirst = m1.toUpperCase();
      }
    }

    const m2 = majorSecond.trim();
    if (m2) {
      if (!(PPDB_MAJORS as readonly string[]).includes(m2.toUpperCase())) {
        fieldErrors.majorSecond = `Jurusan 2 tidak valid. Pilih: ${PPDB_MAJORS.join(", ")}`;
      } else {
        next.majorSecond = m2.toUpperCase();
      }
    }

    const name = fullName.trim();
    if (name && name.length < 2) {
      fieldErrors.fullName = "Nama lengkap minimal 2 karakter.";
    } else if (name) {
      next.fullName = name;
    }

    const mail = email.trim();
    if (mail) next.email = mail;

    const note = notes.trim();
    if (note) next.notes = note;
    else if (registration.notes) next.notes = "";

    const st = status.trim();
    if (st) {
      if (!(PPDB_STATUSES as readonly string[]).includes(st.toUpperCase())) {
        fieldErrors.status = `Status tidak valid. Pilih: ${PPDB_STATUSES.join(", ")}`;
      } else {
        next.status = st.toUpperCase();
      }
    }

    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    if (Object.keys(next).length === 0) {
      // Kompatibel dengan perilaku lama: semua kolom dikosongkan = batal edit.
      onOpenChange(false);
      return;
    }

    setSaving(true);
    try {
      const ok = await onSave(registration.id, next);
      if (ok) onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  const fieldError = (key: string) =>
    errors[key] ? (
      <p id={`ppdb-edit-${key}-error`} className="font-caption text-xs text-rose-600">
        {errors[key]}
      </p>
    ) : null;

  return (
    <Dialog
      open={registration !== null}
      onOpenChange={(o) => {
        if (!o && !saving) onOpenChange(false);
      }}
    >
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>
            Edit Pendaftaran {registration?.registrationNo}
          </DialogTitle>
          <DialogDescription>
            Kolom yang dikosongkan tidak diubah, kecuali catatan — kosongkan
            untuk menghapus catatan lama.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="grid gap-4 py-2">
          <div className="space-y-1.5">
            <label htmlFor="ppdb-edit-name" className="font-caption text-sm font-semibold text-slate-700">
              Nama lengkap
            </label>
            <Input
              id="ppdb-edit-name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              aria-invalid={errors.fullName ? true : undefined}
              aria-describedby={errors.fullName ? "ppdb-edit-name-error" : undefined}
              placeholder="Nama pendaftar"
            />
            {fieldError("fullName")}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="ppdb-edit-email" className="font-caption text-sm font-semibold text-slate-700">
              Email
            </label>
            <Input
              id="ppdb-edit-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={errors.email ? true : undefined}
              aria-describedby={errors.email ? "ppdb-edit-email-error" : undefined}
              placeholder="email@contoh.com"
            />
            {fieldError("email")}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="ppdb-edit-major1" className="font-caption text-sm font-semibold text-slate-700">
                Jurusan 1
              </label>
              <select
                id="ppdb-edit-major1"
                value={majorFirst}
                onChange={(e) => setMajorFirst(e.target.value)}
                aria-invalid={errors.majorFirst ? true : undefined}
                aria-describedby={errors.majorFirst ? "ppdb-edit-major1-error" : undefined}
                className="flex h-10 w-full rounded-xl border border-slate-200 bg-card px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60"
              >
                <option value="">(tanpa perubahan)</option>
                {majorOptions(registration?.majorFirst).map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              {fieldError("majorFirst")}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="ppdb-edit-major2" className="font-caption text-sm font-semibold text-slate-700">
                Jurusan 2
              </label>
              <select
                id="ppdb-edit-major2"
                value={majorSecond}
                onChange={(e) => setMajorSecond(e.target.value)}
                aria-invalid={errors.majorSecond ? true : undefined}
                aria-describedby={errors.majorSecond ? "ppdb-edit-major2-error" : undefined}
                className="flex h-10 w-full rounded-xl border border-slate-200 bg-card px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60"
              >
                <option value="">(tanpa perubahan)</option>
                {majorOptions(registration?.majorSecond).map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              {fieldError("major2")}
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="ppdb-edit-notes" className="font-caption text-sm font-semibold text-slate-700">
              Catatan admin
            </label>
            <textarea
              id="ppdb-edit-notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Catatan internal (opsional)"
              className="w-full rounded-xl border border-slate-200 bg-card px-3.5 py-2.5 text-sm leading-relaxed text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400/60"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="ppdb-edit-status" className="font-caption text-sm font-semibold text-slate-700">
              Status
            </label>
            <select
              id="ppdb-edit-status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              aria-invalid={errors.status ? true : undefined}
              aria-describedby={errors.status ? "ppdb-edit-status-error" : undefined}
              className="flex h-10 w-full rounded-xl border border-slate-200 bg-card px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60"
            >
              {(
                registration &&
                !(PPDB_STATUSES as readonly string[]).includes(registration.status)
                  ? [registration.status, ...PPDB_STATUSES]
                  : PPDB_STATUSES
              ).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            {fieldError("status")}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={saving}
              onClick={() => onOpenChange(false)}
            >
              Batal
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
              Simpan Perubahan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function AdminClient({
  currentUser,
  users: initialUsers,
  ppdbRegistrations: initialPpdb,
  accessibleRoles,
}: AdminClientProps) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [ppdbRegistrations, setPpdbRegistrations] = useState<PpdbRegistration[]>(initialPpdb);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [statusUpdating, setStatusUpdating] = useState<string | null>(null);
  const toast = useToast();

  // Konfirmasi hapus (user & pendaftaran PPDB) via dialog, bukan confirm() blocking.
  const [deleteUserTarget, setDeleteUserTarget] = useState<User | null>(null);
  const [deleteUserBusy, setDeleteUserBusy] = useState(false);
  const [deleteRegTarget, setDeleteRegTarget] = useState<PpdbRegistration | null>(null);
  const [deleteRegBusy, setDeleteRegBusy] = useState(false);

  // Edit pendaftaran PPDB via dialog form (bukan rantai prompt).
  const [ppdbEditTarget, setPpdbEditTarget] = useState<PpdbRegistration | null>(null);

  const role = currentUser.role;

  const refreshUsers = async () => {
    const usersRes = await fetch("/api/admin/users");
    if (!usersRes.ok) return;
    const data = await parseJsonSafe<{ users?: User[] }>(usersRes);
    if (data?.users) setUsers(data.users);
  };

  const refreshPpdb = async () => {
    const res = await fetch("/api/admin/ppdb");
    if (!res.ok) return;
    const data = await parseJsonSafe<{ registrations?: PpdbRegistration[] }>(res);
    if (data?.registrations) setPpdbRegistrations(data.registrations);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditDialogOpen(true);
  };

  const handleSaveUser = async (
    userId: string,
    data: { name?: string; email?: string; role?: string }
  ) => {
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const error = await parseJsonSafe<{ error?: string }>(res);
      throw new Error(error?.error || "Gagal memperbarui user");
    }

    await refreshUsers();
  };

  const handleDeleteUser = async () => {
    if (!deleteUserTarget || deleteUserBusy) return;
    setDeleteUserBusy(true);
    try {
      const res = await fetch(`/api/admin/users/${deleteUserTarget.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const error = await parseJsonSafe<{ error?: string }>(res);
        throw new Error(error?.error || "Gagal menghapus user");
      }
      await refreshUsers();
      toast.success("User berhasil dihapus.");
      setDeleteUserTarget(null);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Gagal menghapus user");
    } finally {
      setDeleteUserBusy(false);
    }
  };

  const handleUpdatePpdbStatus = async (id: string, status: string) => {
    setStatusUpdating(id);
    try {
      const res = await fetch(`/api/admin/ppdb/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const error = await parseJsonSafe<{ error?: string }>(res);
        throw new Error(error?.error || "Gagal mengubah status");
      }
      setPpdbRegistrations((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status } : r))
      );
      toast.success("Status pendaftaran diperbarui.");
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Gagal mengubah status");
      await refreshPpdb();
    } finally {
      setStatusUpdating(null);
    }
  };

  const handleDeleteRegistration = async () => {
    if (!deleteRegTarget || deleteRegBusy) return;
    setDeleteRegBusy(true);
    try {
      const res = await fetch(`/api/admin/ppdb/${deleteRegTarget.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const error = await parseJsonSafe<{ error?: string }>(res);
        throw new Error(error?.error || "Gagal menghapus pendaftaran");
      }
      setPpdbRegistrations((prev) => prev.filter((r) => r.id !== deleteRegTarget.id));
      toast.success("Pendaftaran PPDB dihapus.");
      setDeleteRegTarget(null);
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Gagal menghapus pendaftaran"
      );
    } finally {
      setDeleteRegBusy(false);
    }
  };

  /**
   * Simpan hasil edit dialog pendaftaran PPDB. Kembali `true` bila sukses
   * (dialog tertutup oleh pemanggil); kegagalan ditampilkan via toast.
   */
  const handleUpdateRegistration = async (
    id: string,
    data: Record<string, string>
  ): Promise<boolean> => {
    try {
      const res = await fetch(`/api/admin/ppdb/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await parseJsonSafe<{ error?: string }>(res);
        throw new Error(err?.error || "Gagal memperbarui pendaftaran");
      }
      const body = await parseJsonSafe<{ registration?: PpdbRegistration }>(res);
      if (body?.registration) {
        setPpdbRegistrations((prev) =>
          prev.map((r) => (r.id === id ? { ...r, ...body.registration } : r))
        );
      } else {
        // Toleran-adiitif: respons tidak memuat registration — terapkan field
        // yang diedit secara lokal, lalu segarkan dari server.
        setPpdbRegistrations((prev) =>
          prev.map((r) => (r.id === id ? { ...r, ...data } : r))
        );
        void refreshPpdb();
      }
      toast.success("Pendaftaran PPDB diperbarui.");
      return true;
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Gagal memperbarui pendaftaran"
      );
      await refreshPpdb();
      return false;
    }
  };

  const openPpdbEdit = (reg: PpdbRegistration) => {
    if (!isAdmin(role)) return;
    setPpdbEditTarget(reg);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Admin Panel</h1>
          <p className="mt-2 text-slate-600">
            Selamat datang, {currentUser.name || currentUser.email} ({currentUser.role})
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-card rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-slate-900">Total Users</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">{users.length}</p>
          </div>
          <div className="bg-card rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-slate-900">Total PPDB</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">{ppdbRegistrations.length}</p>
          </div>
          <div className="bg-card rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-slate-900">Pending PPDB</h3>
            <p className="text-3xl font-bold text-yellow-600 mt-2">
              {ppdbRegistrations.filter((r) => r.status === "PENDING").length}
            </p>
          </div>
        </div>

        <div className="bg-card rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-xl font-semibold text-slate-900">User Management</h2>
          </div>
          <div className="px-6 py-4">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-background">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Email Verified
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-card divide-y divide-slate-200">
                  {users.map((user) => {
                    const isSelf = user.id === currentUser.id;
                    const canEdit = !isSelf && canEditUser(role, user.role);
                    const canDelete = !isSelf && canDeleteUser(role, user.role);

                    return (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                          {user.name || "-"}
                          {isSelf ? (
                            <span className="ml-2 text-xs text-sky-600">(Anda)</span>
                          ) : null}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              user.role === UserRole.SUPER_ADMIN
                                ? "bg-purple-100 text-purple-800"
                                : user.role === UserRole.ADMIN
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                          {user.emailVerified ? "✓" : "✗"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                          {new Date(user.createdAt).toLocaleDateString("id-ID")}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                          {canEdit || canDelete ? (
                            <div className="flex space-x-2">
                              {canEdit ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEditUser(user)}
                                >
                                  Edit
                                </Button>
                              ) : null}
                              {canDelete ? (
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => setDeleteUserTarget(user)}
                                >
                                  Delete
                                </Button>
                              ) : null}
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg shadow">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-xl font-semibold text-slate-900">PPDB Registrations</h2>
          </div>
          <div className="px-6 py-4">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-background">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Registration No
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Major
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-card divide-y divide-slate-200">
                  {ppdbRegistrations.map((registration) => (
                    <tr key={registration.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                        {registration.registrationNo}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {registration.fullName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {registration.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {registration.majorFirst}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        <select
                          value={registration.status}
                          disabled={statusUpdating === registration.id || !isAdmin(role)}
                          onChange={(e) =>
                            handleUpdatePpdbStatus(registration.id, e.target.value)
                          }
                          aria-label={`Ubah status pendaftaran ${registration.fullName}`}
                          className="rounded-md border border-input bg-background px-2 py-1 text-xs"
                        >
                          {PPDB_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {new Date(registration.createdAt).toLocaleDateString("id-ID")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openPpdbEdit(registration)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setDeleteRegTarget(registration)}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <UserEditDialog
        user={selectedUser}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        currentUserRole={role}
        accessibleRoles={accessibleRoles}
        onSave={handleSaveUser}
      />

      {/* Edit pendaftaran PPDB — key per pendaftar supaya draft form ikut reset. */}
      <PpdbEditDialog
        key={ppdbEditTarget?.id ?? "none"}
        registration={ppdbEditTarget}
        onOpenChange={(o) => {
          if (!o) setPpdbEditTarget(null);
        }}
        onSave={handleUpdateRegistration}
      />

      <ConfirmDialog
        open={deleteUserTarget !== null}
        onOpenChange={(o) => {
          if (!o) setDeleteUserTarget(null);
        }}
        title="Hapus user ini?"
        description={`Tindakan tidak bisa dibatalkan.${deleteUserTarget?.email ? ` ${deleteUserTarget.email} akan dihapus permanen.` : ""}`}
        confirmLabel="Hapus"
        destructive
        loading={deleteUserBusy}
        onConfirm={handleDeleteUser}
      />

      <ConfirmDialog
        open={deleteRegTarget !== null}
        onOpenChange={(o) => {
          if (!o) setDeleteRegTarget(null);
        }}
        title="Hapus pendaftaran PPDB ini?"
        description={`${deleteRegTarget?.registrationNo ?? ""} — ${deleteRegTarget?.fullName ?? ""}. Tindakan tidak bisa dibatalkan.`}
        confirmLabel="Hapus"
        destructive
        loading={deleteRegBusy}
        onConfirm={handleDeleteRegistration}
      />
    </div>
  );
}
