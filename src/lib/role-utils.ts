import { auth } from "@/lib/auth";
import {
  UserRole,
  hasRole,
  isAdmin,
  isSuperAdmin,
  canEditUser,
  canManageUser,
  canChangeRole,
  canDeleteUser,
  getAccessibleRoles,
  canManagePpdb,
  isUserRole,
} from "@/lib/roles";

export {
  UserRole,
  hasRole,
  isAdmin,
  isSuperAdmin,
  canEditUser,
  canManageUser,
  canChangeRole,
  canDeleteUser,
  getAccessibleRoles,
  canManagePpdb,
  isUserRole,
};

/** Session saat ini (tanpa cek role). */
export async function getCurrentSession() {
  return auth();
}

/**
 * Guard: user harus punya role minimum `requiredRole`.
 * @returns session jika authorized, null jika tidak
 */
export async function requireRole(requiredRole: UserRole) {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  if (!hasRole(session.user.role, requiredRole)) {
    return null;
  }

  return session;
}

export async function requireSuperAdmin() {
  return requireRole(UserRole.SUPER_ADMIN);
}

export async function requireAdmin() {
  return requireRole(UserRole.ADMIN);
}
