"use client";

import { useState } from "react";
import {
  UserRole,
  canEditUser,
  canDeleteUser,
  isAdmin,
} from "@/lib/roles";
import { UserEditDialog } from "@/components/admin/user-edit-dialog";
import { Button } from "@/components/ui/button";

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
  createdAt: Date;
}

const PPDB_STATUSES = ["PENDING", "CONTACTED", "REGISTERED", "REJECTED"] as const;

interface AdminClientProps {
  currentUser: { id: string; name: string | null; email: string | null; role: string };
  users: User[];
  ppdbRegistrations: PpdbRegistration[];
  accessibleRoles: string[];
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

  const role = currentUser.role;

  const refreshUsers = async () => {
    const usersRes = await fetch("/api/admin/users");
    if (usersRes.ok) {
      const data = await usersRes.json();
      setUsers(data.users || []);
    }
  };

  const refreshPpdb = async () => {
    const res = await fetch("/api/admin/ppdb");
    if (res.ok) {
      const data = await res.json();
      setPpdbRegistrations(data.registrations || []);
    }
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
      const error = await res.json();
      throw new Error(error.error || "Failed to update user");
    }

    await refreshUsers();
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Hapus user ini? Tindakan tidak bisa dibatalkan.")) return;

    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to delete user");
      }
      await refreshUsers();
    } catch (error: unknown) {
      alert(error instanceof Error ? error.message : "Failed to delete user");
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
        const error = await res.json();
        throw new Error(error.error || "Failed to update status");
      }
      setPpdbRegistrations((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status } : r))
      );
    } catch (error: unknown) {
      alert(error instanceof Error ? error.message : "Failed to update status");
      await refreshPpdb();
    } finally {
      setStatusUpdating(null);
    }
  };

  const handleDeleteRegistration = async (id: string) => {
    if (!confirm("Hapus pendaftaran PPDB ini?")) return;

    try {
      const res = await fetch(`/api/admin/ppdb/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to delete registration");
      }
      setPpdbRegistrations((prev) => prev.filter((r) => r.id !== id));
    } catch (error: unknown) {
      alert(error instanceof Error ? error.message : "Failed to delete registration");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
          <p className="mt-2 text-gray-600">
            Selamat datang, {currentUser.name || currentUser.email} ({currentUser.role})
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900">Total Users</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">{users.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900">Total PPDB</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">{ppdbRegistrations.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900">Pending PPDB</h3>
            <p className="text-3xl font-bold text-yellow-600 mt-2">
              {ppdbRegistrations.filter((r) => r.status === "PENDING").length}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
          </div>
          <div className="px-6 py-4">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email Verified
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => {
                    const isSelf = user.id === currentUser.id;
                    const canEdit = !isSelf && canEditUser(role, user.role);
                    const canDelete = !isSelf && canDeleteUser(role, user.role);

                    return (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {user.name || "-"}
                          {isSelf ? (
                            <span className="ml-2 text-xs text-sky-600">(Anda)</span>
                          ) : null}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              user.role === UserRole.SUPER_ADMIN
                                ? "bg-purple-100 text-purple-800"
                                : user.role === UserRole.ADMIN
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.emailVerified ? "✓" : "✗"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(user.createdAt).toLocaleDateString("id-ID")}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
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
                                  onClick={() => handleDeleteUser(user.id)}
                                >
                                  Delete
                                </Button>
                              ) : null}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">—</span>
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

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">PPDB Registrations</h2>
          </div>
          <div className="px-6 py-4">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Registration No
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Major
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {ppdbRegistrations.map((registration) => (
                    <tr key={registration.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {registration.registrationNo}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {registration.fullName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {registration.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {registration.majorFirst}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <select
                          value={registration.status}
                          disabled={statusUpdating === registration.id || !isAdmin(role)}
                          onChange={(e) =>
                            handleUpdatePpdbStatus(registration.id, e.target.value)
                          }
                          className="rounded-md border border-input bg-background px-2 py-1 text-xs"
                        >
                          {PPDB_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(registration.createdAt).toLocaleDateString("id-ID")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditRegistration(registration)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteRegistration(registration.id)}
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
    </div>
  );
}
