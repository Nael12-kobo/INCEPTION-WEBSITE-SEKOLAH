"use client";

import * as React from "react";
import { isSuperAdmin } from "@/lib/roles";
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

interface User {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
}

interface UserEditDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUserRole: string;
  accessibleRoles: string[];
  onSave: (
    userId: string,
    data: { name?: string; email?: string; role?: string }
  ) => Promise<void>;
}

function UserEditForm({
  user,
  currentUserRole,
  accessibleRoles,
  onSave,
  onClose,
}: {
  user: User;
  currentUserRole: string;
  accessibleRoles: string[];
  onSave: UserEditDialogProps["onSave"];
  onClose: () => void;
}) {
  const [name, setName] = React.useState(user.name || "");
  const [email, setEmail] = React.useState(user.email || "");
  const [role, setRole] = React.useState(user.role);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const canEditRole = isSuperAdmin(currentUserRole) && accessibleRoles.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await onSave(user.id, {
        name: name || undefined,
        email: email || undefined,
        role: canEditRole ? role || undefined : undefined,
      });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal memperbarui user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-1 items-start gap-1.5 sm:grid-cols-4 sm:items-center sm:gap-4">
          <label htmlFor="name" className="text-left text-sm font-medium sm:text-right">
            Name
          </label>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="sm:col-span-3"
            placeholder="User name"
          />
        </div>
        <div className="grid grid-cols-1 items-start gap-1.5 sm:grid-cols-4 sm:items-center sm:gap-4">
          <label htmlFor="email" className="text-left text-sm font-medium sm:text-right">
            Email
          </label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="sm:col-span-3"
            placeholder="user@example.com"
          />
        </div>
        <div className="grid grid-cols-1 items-start gap-1.5 sm:grid-cols-4 sm:items-center sm:gap-4">
          <label htmlFor="role" className="text-left text-sm font-medium sm:text-right">
            Role
          </label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            disabled={!canEditRole}
            className="sm:col-span-3 flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60"
          >
            {(canEditRole ? accessibleRoles : [user.role]).map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
        {!canEditRole && (
          <div className="sm:col-span-4 text-sm text-slate-500">
            Hanya Super Admin yang dapat mengubah role
          </div>
        )}
        {error && <div className="sm:col-span-4 text-sm text-rose-600">{error}</div>}
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function UserEditDialog({
  user,
  open,
  onOpenChange,
  currentUserRole,
  accessibleRoles,
  onSave,
}: UserEditDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            {isSuperAdmin(currentUserRole)
              ? "Super Admin dapat mengubah data dan role user."
              : "Admin dapat mengedit data USER, tanpa mengubah role."}
          </DialogDescription>
        </DialogHeader>
        {user ? (
          <UserEditForm
            key={user.id}
            user={user}
            currentUserRole={currentUserRole}
            accessibleRoles={accessibleRoles}
            onSave={onSave}
            onClose={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
