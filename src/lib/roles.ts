/**
 * Pure role/permission helpers — aman dipakai di client & server.
 * Guard berbasis session ada di `role-utils.ts` (server-only).
 *
 * Sumber kebenaran hak akses: ROLE_PERMISSIONS + ROLE_ACCESS_MATRIX.
 */

export enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN",
  SUPER_ADMIN = "SUPER_ADMIN",
}

const ROLE_LEVEL: Record<UserRole, number> = {
  [UserRole.SUPER_ADMIN]: 3,
  [UserRole.ADMIN]: 2,
  [UserRole.USER]: 1,
};

export const ROLE_META: Record<
  UserRole,
  { label: string; shortLabel: string; description: string; tone: "slate" | "sky" | "violet" }
> = {
  [UserRole.USER]: {
    label: "User",
    shortLabel: "USER",
    description: "Calon siswa / pengguna portal. Akses dasar dashboard dan pendaftaran PPDB.",
    tone: "slate",
  },
  [UserRole.ADMIN]: {
    label: "Admin",
    shortLabel: "ADMIN",
    description: "Staf sekolah. Kelola PPDB dan data user biasa, tanpa ubah role atau hapus akun.",
    tone: "sky",
  },
  [UserRole.SUPER_ADMIN]: {
    label: "Super Admin",
    shortLabel: "SUPER ADMIN",
    description: "Pemilik sistem. Akses penuh termasuk ubah role, hapus user, dan audit.",
    tone: "violet",
  },
};

/** Permission keys — dipakai di guard UI/API. */
export type Permission =
  | "portal.dashboard"
  | "portal.account.view"
  | "ppdb.register"
  | "ppdb.view_own"
  | "admin.access"
  | "admin.overview"
  | "admin.users.view"
  | "admin.users.edit"
  | "admin.users.change_role"
  | "admin.users.delete"
  | "admin.ppdb.view"
  | "admin.ppdb.update_status"
  | "admin.ppdb.delete"
  | "admin.roles.view"
  | "admin.audit.view"
  | "admin.settings.view";

export const PERMISSION_LABELS: Record<Permission, string> = {
  "portal.dashboard": "Akses dashboard personal",
  "portal.account.view": "Lihat profil akun sendiri",
  "ppdb.register": "Mendaftar PPDB",
  "ppdb.view_own": "Lihat status PPDB sendiri",
  "admin.access": "Masuk panel admin",
  "admin.overview": "Lihat overview & statistik admin",
  "admin.users.view": "Lihat daftar semua pengguna",
  "admin.users.edit": "Edit data pengguna (nama/email)",
  "admin.users.change_role": "Ubah role pengguna",
  "admin.users.delete": "Hapus pengguna",
  "admin.ppdb.view": "Lihat semua pendaftaran PPDB",
  "admin.ppdb.update_status": "Ubah status pendaftaran PPDB",
  "admin.ppdb.delete": "Hapus pendaftaran PPDB",
  "admin.roles.view": "Lihat matrix Role & Izin",
  "admin.audit.view": "Lihat Audit Log",
  "admin.settings.view": "Akses pengaturan admin",
};

/** Hak yang dimiliki tiap role (hierarki: SUPER_ADMIN ⊃ ADMIN ⊃ subset USER). */
export const ROLE_PERMISSIONS: Record<UserRole, readonly Permission[]> = {
  [UserRole.USER]: [
    "portal.dashboard",
    "portal.account.view",
    "ppdb.register",
    "ppdb.view_own",
  ],
  [UserRole.ADMIN]: [
    "portal.dashboard",
    "portal.account.view",
    "ppdb.view_own",
    // Admin tidak mendaftar PPDB sebagai calon siswa
    "admin.access",
    "admin.overview",
    "admin.users.view",
    "admin.users.edit",
    "admin.ppdb.view",
    "admin.ppdb.update_status",
    "admin.ppdb.delete",
    "admin.roles.view",
    "admin.settings.view",
  ],
  [UserRole.SUPER_ADMIN]: [
    "portal.dashboard",
    "portal.account.view",
    "ppdb.view_own",
    "admin.access",
    "admin.overview",
    "admin.users.view",
    "admin.users.edit",
    "admin.users.change_role",
    "admin.users.delete",
    "admin.ppdb.view",
    "admin.ppdb.update_status",
    "admin.ppdb.delete",
    "admin.roles.view",
    "admin.audit.view",
    "admin.settings.view",
  ],
};

export type AccessLevel = "yes" | "no" | "limited";

export type AccessMatrixRow = {
  id: string;
  category: string;
  action: string;
  detail: string;
  access: Record<UserRole, AccessLevel>;
  note?: Partial<Record<UserRole, string>>;
};

/**
 * Matrix lengkap untuk UI + dokumentasi.
 * "limited" = boleh, tapi dengan batasan (lihat note).
 */
export const ROLE_ACCESS_MATRIX: AccessMatrixRow[] = [
  {
    id: "login",
    category: "Portal",
    action: "Login / session",
    detail: "Masuk ke sistem dengan email atau OAuth",
    access: {
      [UserRole.USER]: "yes",
      [UserRole.ADMIN]: "yes",
      [UserRole.SUPER_ADMIN]: "yes",
    },
  },
  {
    id: "dashboard",
    category: "Portal",
    action: "Dashboard personal",
    detail: "Agenda, pengumuman, statistik, profil",
    access: {
      [UserRole.USER]: "yes",
      [UserRole.ADMIN]: "yes",
      [UserRole.SUPER_ADMIN]: "yes",
    },
  },
  {
    id: "ppdb-register",
    category: "PPDB (siswa)",
    action: "Mendaftar PPDB",
    detail: "Isi formulir pendaftaran (1x per akun)",
    access: {
      [UserRole.USER]: "yes",
      [UserRole.ADMIN]: "no",
      [UserRole.SUPER_ADMIN]: "no",
    },
    note: {
      [UserRole.ADMIN]: "Khusus calon siswa (USER)",
      [UserRole.SUPER_ADMIN]: "Khusus calon siswa (USER)",
    },
  },
  {
    id: "ppdb-own",
    category: "PPDB (siswa)",
    action: "Lihat status PPDB sendiri",
    detail: "Nomor registrasi & status di dashboard",
    access: {
      [UserRole.USER]: "yes",
      [UserRole.ADMIN]: "limited",
      [UserRole.SUPER_ADMIN]: "limited",
    },
    note: {
      [UserRole.ADMIN]: "Hanya jika pernah terdaftar sebagai USER",
      [UserRole.SUPER_ADMIN]: "Hanya jika pernah terdaftar sebagai USER",
    },
  },
  {
    id: "admin-panel",
    category: "Admin Panel",
    action: "Masuk panel admin",
    detail: "Route /admin dan menu admin",
    access: {
      [UserRole.USER]: "no",
      [UserRole.ADMIN]: "yes",
      [UserRole.SUPER_ADMIN]: "yes",
    },
  },
  {
    id: "admin-overview",
    category: "Admin Panel",
    action: "Overview & chart",
    detail: "Statistik user, PPDB, tren, distribusi jurusan",
    access: {
      [UserRole.USER]: "no",
      [UserRole.ADMIN]: "yes",
      [UserRole.SUPER_ADMIN]: "yes",
    },
  },
  {
    id: "users-view",
    category: "Manajemen User",
    action: "Lihat daftar user",
    detail: "Semua akun di sistem",
    access: {
      [UserRole.USER]: "no",
      [UserRole.ADMIN]: "yes",
      [UserRole.SUPER_ADMIN]: "yes",
    },
  },
  {
    id: "users-edit",
    category: "Manajemen User",
    action: "Edit nama / email",
    detail: "Ubah data profil user lain",
    access: {
      [UserRole.USER]: "no",
      [UserRole.ADMIN]: "limited",
      [UserRole.SUPER_ADMIN]: "limited",
    },
    note: {
      [UserRole.ADMIN]: "Hanya target USER",
      [UserRole.SUPER_ADMIN]: "Target ADMIN & USER (bukan SUPER_ADMIN lain / diri sendiri)",
    },
  },
  {
    id: "users-role",
    category: "Manajemen User",
    action: "Ubah role",
    detail: "Promote / demote USER ↔ ADMIN ↔ SUPER_ADMIN",
    access: {
      [UserRole.USER]: "no",
      [UserRole.ADMIN]: "no",
      [UserRole.SUPER_ADMIN]: "limited",
    },
    note: {
      [UserRole.SUPER_ADMIN]: "Tidak bisa ubah role diri sendiri atau SUPER_ADMIN lain",
    },
  },
  {
    id: "users-delete",
    category: "Manajemen User",
    action: "Hapus user",
    detail: "Hapus akun permanen",
    access: {
      [UserRole.USER]: "no",
      [UserRole.ADMIN]: "no",
      [UserRole.SUPER_ADMIN]: "limited",
    },
    note: {
      [UserRole.SUPER_ADMIN]: "Hanya ADMIN & USER (bukan SUPER_ADMIN lain / diri sendiri)",
    },
  },
  {
    id: "ppdb-admin-view",
    category: "Manajemen PPDB",
    action: "Lihat semua pendaftaran",
    detail: "Daftar lengkap + filter/export",
    access: {
      [UserRole.USER]: "no",
      [UserRole.ADMIN]: "yes",
      [UserRole.SUPER_ADMIN]: "yes",
    },
  },
  {
    id: "ppdb-admin-status",
    category: "Manajemen PPDB",
    action: "Ubah status PPDB",
    detail: "PENDING → CONTACTED → REGISTERED / REJECTED",
    access: {
      [UserRole.USER]: "no",
      [UserRole.ADMIN]: "yes",
      [UserRole.SUPER_ADMIN]: "yes",
    },
  },
  {
    id: "ppdb-admin-delete",
    category: "Manajemen PPDB",
    action: "Hapus pendaftaran",
    detail: "Hapus record PPDB",
    access: {
      [UserRole.USER]: "no",
      [UserRole.ADMIN]: "yes",
      [UserRole.SUPER_ADMIN]: "yes",
    },
  },
  {
    id: "roles-page",
    category: "Sistem",
    action: "Halaman Role & Izin",
    detail: "Lihat matrix hak akses",
    access: {
      [UserRole.USER]: "no",
      [UserRole.ADMIN]: "yes",
      [UserRole.SUPER_ADMIN]: "yes",
    },
  },
  {
    id: "audit",
    category: "Sistem",
    action: "Audit Log",
    detail: "Riwayat aktivitas admin",
    access: {
      [UserRole.USER]: "no",
      [UserRole.ADMIN]: "no",
      [UserRole.SUPER_ADMIN]: "yes",
    },
  },
  {
    id: "settings",
    category: "Sistem",
    action: "Pengaturan admin",
    detail: "Preferensi panel admin",
    access: {
      [UserRole.USER]: "no",
      [UserRole.ADMIN]: "yes",
      [UserRole.SUPER_ADMIN]: "yes",
    },
  },
];

export function isUserRole(value: unknown): value is UserRole {
  return (
    value === UserRole.USER ||
    value === UserRole.ADMIN ||
    value === UserRole.SUPER_ADMIN
  );
}

/** SUPER_ADMIN > ADMIN > USER */
export function hasRole(userRole: string | null | undefined, requiredRole: UserRole): boolean {
  const userLevel = ROLE_LEVEL[userRole as UserRole] ?? 0;
  const requiredLevel = ROLE_LEVEL[requiredRole] ?? 0;
  return userLevel >= requiredLevel;
}

export function isAdmin(userRole: string | null | undefined): boolean {
  return hasRole(userRole, UserRole.ADMIN);
}

export function isSuperAdmin(userRole: string | null | undefined): boolean {
  return userRole === UserRole.SUPER_ADMIN;
}

export function hasPermission(
  userRole: string | null | undefined,
  permission: Permission
): boolean {
  if (!isUserRole(userRole)) return false;
  return ROLE_PERMISSIONS[userRole].includes(permission);
}

/**
 * Boleh mengedit data profil target (nama/email).
 * - SUPER_ADMIN → ADMIN & USER
 * - ADMIN → USER saja
 */
export function canEditUser(
  currentUserRole: string | null | undefined,
  targetUserRole: string | null | undefined
): boolean {
  if (!hasPermission(currentUserRole, "admin.users.edit")) return false;
  if (isSuperAdmin(currentUserRole)) {
    return targetUserRole === UserRole.ADMIN || targetUserRole === UserRole.USER;
  }
  if (currentUserRole === UserRole.ADMIN) {
    return targetUserRole === UserRole.USER;
  }
  return false;
}

/** Alias historis — sama dengan canEditUser. */
export function canManageUser(
  currentUserRole: string | null | undefined,
  targetUserRole: string | null | undefined
): boolean {
  return canEditUser(currentUserRole, targetUserRole);
}

/**
 * Ubah role target → newRole.
 * Hanya SUPER_ADMIN; tidak boleh menyentuh SUPER_ADMIN lain.
 */
export function canChangeRole(
  currentUserRole: string | null | undefined,
  targetUserRole: string | null | undefined,
  newRole: UserRole
): boolean {
  if (!hasPermission(currentUserRole, "admin.users.change_role")) return false;
  if (!isSuperAdmin(currentUserRole)) return false;
  if (targetUserRole === UserRole.SUPER_ADMIN) return false;
  if (!isUserRole(newRole)) return false;
  return true;
}

/** Hapus user — hanya SUPER_ADMIN, bukan SUPER_ADMIN lain. */
export function canDeleteUser(
  currentUserRole: string | null | undefined,
  targetUserRole: string | null | undefined
): boolean {
  if (!hasPermission(currentUserRole, "admin.users.delete")) return false;
  return targetUserRole === UserRole.ADMIN || targetUserRole === UserRole.USER;
}

/** Role yang boleh di-assign lewat UI/API. */
export function getAccessibleRoles(currentUserRole: string | null | undefined): UserRole[] {
  if (!hasPermission(currentUserRole, "admin.users.change_role")) return [];
  if (isSuperAdmin(currentUserRole)) {
    return [UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN];
  }
  return [];
}

export function canManagePpdb(userRole: string | null | undefined): boolean {
  return (
    hasPermission(userRole, "admin.ppdb.view") ||
    hasPermission(userRole, "admin.ppdb.update_status") ||
    hasPermission(userRole, "admin.ppdb.delete")
  );
}

export function canRegisterPpdb(userRole: string | null | undefined): boolean {
  return hasPermission(userRole, "ppdb.register");
}

export function canViewAudit(userRole: string | null | undefined): boolean {
  return hasPermission(userRole, "admin.audit.view");
}

export function canViewRolesPage(userRole: string | null | undefined): boolean {
  return hasPermission(userRole, "admin.roles.view");
}
