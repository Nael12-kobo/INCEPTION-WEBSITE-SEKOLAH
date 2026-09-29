/**
 * Pure role/permission helpers — aman dipakai di client & server.
 * Guard berbasis session ada di `role-utils.ts` (server-only).
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

/**
 * Boleh mengedit data profil target (nama/email).
 * - SUPER_ADMIN → ADMIN & USER (bukan SUPER_ADMIN lain / diri sendiri ditangani di API)
 * - ADMIN → USER saja
 * - USER → tidak ada
 */
export function canEditUser(
  currentUserRole: string | null | undefined,
  targetUserRole: string | null | undefined
): boolean {
  if (isSuperAdmin(currentUserRole)) {
    return targetUserRole === UserRole.ADMIN || targetUserRole === UserRole.USER;
  }
  if (currentUserRole === UserRole.ADMIN) {
    return targetUserRole === UserRole.USER;
  }
  return false;
}

/** Alias historis — sama dengan canEditUser (kelola data, bukan hapus/ubah role). */
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
  if (!isSuperAdmin(currentUserRole)) return false;
  if (targetUserRole === UserRole.SUPER_ADMIN) return false;
  if (!isUserRole(newRole)) return false;
  // Super admin boleh assign USER / ADMIN / SUPER_ADMIN ke non-super-admin
  return true;
}

/** Hapus user — hanya SUPER_ADMIN, dan bukan SUPER_ADMIN lain. */
export function canDeleteUser(
  currentUserRole: string | null | undefined,
  targetUserRole: string | null | undefined
): boolean {
  if (!isSuperAdmin(currentUserRole)) return false;
  return targetUserRole === UserRole.ADMIN || targetUserRole === UserRole.USER;
}

/** Role yang boleh di-assign lewat UI/API. */
export function getAccessibleRoles(currentUserRole: string | null | undefined): UserRole[] {
  if (isSuperAdmin(currentUserRole)) {
    return [UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN];
  }
  return [];
}

/** Admin & Super Admin boleh kelola semua pendaftaran PPDB. */
export function canManagePpdb(userRole: string | null | undefined): boolean {
  return isAdmin(userRole);
}
