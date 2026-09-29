import { prisma } from "@/lib/prisma";
import { isUserRole } from "@/lib/roles";

/**
 * Catat aktivitas penting ke tabel AuditLog.
 *
 * Aturan penting: logging TIDAK PERNAH melempar error ke pemanggil —
 * kegagalan audit dicatat ke console saja, karena aksi bisnis (ubah role,
 * hapus user, dll) tidak boleh gagal hanya karena pencatatan gagal.
 *
 * Server-only: jangan diimpor dari komponen client.
 */
export async function logAudit(entry: {
  actorId?: string | null;
  actorEmail?: string | null;
  action: string;
  targetType?: string | null;
  targetId?: string | null;
  detail?: string | null;
  meta?: Record<string, unknown> | null;
}): Promise<void> {
  try {
    if (!prisma.auditLog) {
      console.warn("[audit] prisma.auditLog is undefined, skipping log.");
      return;
    }
    await prisma.auditLog.create({
      data: {
        actorId: entry.actorId ?? null,
        actorEmail: entry.actorEmail ?? null,
        action: entry.action,
        targetType: entry.targetType ?? null,
        targetId: entry.targetId ?? null,
        detail: entry.detail ?? null,
        meta: (entry.meta ?? null) as never,
      },
    });
  } catch (error) {
    console.error("[audit] gagal mencatat aktivitas:", error);
  }
}

/** Konvensi kode aksi agar filter & tampilan konsisten. */
export const AUDIT_ACTIONS = {
  LOGIN_SUCCESS: "LOGIN_SUCCESS",
  LOGIN_FAILED: "LOGIN_FAILED",
  LOGOUT: "LOGOUT",
  ACCOUNT_REGISTERED: "ACCOUNT_REGISTERED",
  ACCOUNT_PROFILE_UPDATED: "ACCOUNT_PROFILE_UPDATED",
  PASSWORD_CHANGED: "PASSWORD_CHANGED",
  USER_CREATED: "USER_CREATED",
  USER_UPDATED: "USER_UPDATED",
  USER_ROLE_CHANGED: "USER_ROLE_CHANGED",
  USER_DELETED: "USER_DELETED",
  PPDB_STATUS_UPDATED: "PPDB_STATUS_UPDATED",
  PPDB_DELETED: "PPDB_DELETED",
  PPDB_REGISTERED: "PPDB_REGISTERED",
} as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[keyof typeof AUDIT_ACTIONS];

/** Label manusiawi per aksi untuk UI audit & notifikasi. */
export const AUDIT_ACTION_LABELS: Record<string, string> = {
  [AUDIT_ACTIONS.LOGIN_SUCCESS]: "Login berhasil",
  [AUDIT_ACTIONS.LOGIN_FAILED]: "Login gagal",
  [AUDIT_ACTIONS.LOGOUT]: "Keluar dari sistem",
  [AUDIT_ACTIONS.ACCOUNT_REGISTERED]: "Pendaftaran akun baru",
  [AUDIT_ACTIONS.ACCOUNT_PROFILE_UPDATED]: "Memperbarui profil",
  [AUDIT_ACTIONS.PASSWORD_CHANGED]: "Mengganti kata sandi",
  [AUDIT_ACTIONS.USER_CREATED]: "Menambahkan user baru",
  [AUDIT_ACTIONS.USER_UPDATED]: "Mengubah data user",
  [AUDIT_ACTIONS.USER_ROLE_CHANGED]: "Mengubah role user",
  [AUDIT_ACTIONS.USER_DELETED]: "Menghapus user",
  [AUDIT_ACTIONS.PPDB_STATUS_UPDATED]: "Mengubah status PPDB",
  [AUDIT_ACTIONS.PPDB_DELETED]: "Menghapus pendaftaran PPDB",
  [AUDIT_ACTIONS.PPDB_REGISTERED]: "Pendaftaran PPDB baru",
};

/** Dapatkan nama pemilik nomor WhatsApp pendaftar (helper kecil). */
export function normalizeAuditEmail(email: string | null | undefined): string | null {
  const v = (email ?? "").trim().toLowerCase();
  return v.length > 0 ? v : null;
}

/** Validasi ringan agar role dari session selalu valid sebelum dicatat. */
export function auditRoleOrUser(role: unknown): string {
  return isUserRole(role) ? role : "USER";
}
