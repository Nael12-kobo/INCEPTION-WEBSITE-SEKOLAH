import { redirect } from "next/navigation";
import {
  requireAdmin,
  canViewRolesPage,
  ROLE_ACCESS_MATRIX,
  ROLE_META,
  ROLE_PERMISSIONS,
  PERMISSION_LABELS,
  UserRole,
  isUserRole,
  type AccessLevel,
} from "@/lib/role-utils";
import { ForbiddenPage } from "@/components/admin/forbidden-page";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Minus, AlertCircle, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Role & Izin — Admin Panel | SMK Tunas Harapan",
  description: "Matrix hak akses penuh per peran sistem.",
};

const ROLES_ORDER: UserRole[] = [
  UserRole.USER,
  UserRole.ADMIN,
  UserRole.SUPER_ADMIN,
];

function AccessCell({
  level,
  note,
}: {
  level: AccessLevel;
  note?: string;
}) {
  if (level === "yes") {
    return (
      <div className="flex flex-col items-center gap-1">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <Check className="h-4 w-4" strokeWidth={2.5} />
        </span>
        {note ? (
          <span className="text-[10px] leading-tight text-slate-400 text-center max-w-[9rem]">
            {note}
          </span>
        ) : null}
      </div>
    );
  }
  if (level === "limited") {
    return (
      <div className="flex flex-col items-center gap-1">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-amber-50 text-amber-600">
          <AlertCircle className="h-4 w-4" strokeWidth={2.5} />
        </span>
        {note ? (
          <span className="text-[10px] leading-tight text-amber-700/80 text-center max-w-[9rem]">
            {note}
          </span>
        ) : (
          <span className="text-[10px] text-amber-600">Terbatas</span>
        )}
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-400">
        <Minus className="h-4 w-4" strokeWidth={2.5} />
      </span>
      {note ? (
        <span className="text-[10px] leading-tight text-slate-400 text-center max-w-[9rem]">
          {note}
        </span>
      ) : null}
    </div>
  );
}

const toneBadge: Record<string, "secondary" | "info" | "violet"> = {
  slate: "secondary",
  sky: "info",
  violet: "violet",
};

export default async function AdminRolesPage() {
  const session = await requireAdmin();
  if (!session) {
    redirect("/auth/login?callbackUrl=/admin/roles");
  }

  if (!canViewRolesPage(session.user.role)) {
    return <ForbiddenPage />;
  }

  const currentRole = isUserRole(session.user.role)
    ? session.user.role
    : UserRole.USER;
  const myPermissions = ROLE_PERMISSIONS[currentRole];

  const categories = Array.from(
    new Set(ROLE_ACCESS_MATRIX.map((row) => row.category))
  );

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="font-h1 text-slate-900">Role & Izin</h1>
        <p className="font-body text-slate-500">
          Matrix hak akses penuh: apa yang boleh dilakukan USER, ADMIN, dan SUPER_ADMIN.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {ROLES_ORDER.map((role) => {
          const meta = ROLE_META[role];
          const isMine = role === currentRole;
          return (
            <Card
              key={role}
              className={cn(isMine && "ring-2 ring-sky-400/60 border-sky-200")}
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Shield
                      className={cn(
                        "h-4 w-4",
                        meta.tone === "violet"
                          ? "text-violet-600"
                          : meta.tone === "sky"
                            ? "text-sky-600"
                            : "text-slate-500"
                      )}
                    />
                    {meta.label}
                  </CardTitle>
                  <Badge variant={toneBadge[meta.tone]}>{meta.shortLabel}</Badge>
                </div>
                <CardDescription>{meta.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {isMine ? (
                  <Badge variant="info" className="text-[10px]">
                    Role Anda saat ini
                  </Badge>
                ) : null}
                <ul className="space-y-1.5 font-caption text-sm text-slate-600">
                  {ROLE_PERMISSIONS[role].slice(0, 6).map((p) => (
                    <li key={p} className="flex items-start gap-2">
                      <Check className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
                      <span>{PERMISSION_LABELS[p]}</span>
                    </li>
                  ))}
                  {ROLE_PERMISSIONS[role].length > 6 ? (
                    <li className="text-slate-400 text-xs pl-5">
                      +{ROLE_PERMISSIONS[role].length - 6} izin lainnya
                    </li>
                  ) : null}
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Matrix akses</CardTitle>
          <CardDescription>
            <span className="inline-flex items-center gap-3 flex-wrap">
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <Check className="h-3 w-3" />
                </span>
                Boleh
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-amber-50 text-amber-600">
                  <AlertCircle className="h-3 w-3" />
                </span>
                Terbatas
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                  <Minus className="h-3 w-3" />
                </span>
                Tidak boleh
              </span>
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full min-w-[820px]">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left font-overline text-[11px] text-slate-500 uppercase tracking-wider py-3 px-3 w-[28%]">
                    Aksi
                  </th>
                  {ROLES_ORDER.map((role) => (
                    <th
                      key={role}
                      className={cn(
                        "text-center font-overline text-[11px] uppercase tracking-wider py-3 px-3",
                        role === currentRole ? "text-sky-700" : "text-slate-500"
                      )}
                    >
                      {ROLE_META[role].shortLabel}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <CategoryRows
                    key={category}
                    category={category}
                    currentRole={currentRole}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Izin aktif di akun Anda</CardTitle>
          <CardDescription>
            {ROLE_META[currentRole].label} · {myPermissions.length} permission
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {myPermissions.map((p) => (
              <Badge key={p} variant="outline" className="font-mono text-[10px]">
                {p}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function CategoryRows({
  category,
  currentRole,
}: {
  category: string;
  currentRole: UserRole;
}) {
  const rows = ROLE_ACCESS_MATRIX.filter((r) => r.category === category);
  return (
    <>
      <tr className="bg-slate-50/80">
        <td
          colSpan={4}
          className="py-2.5 px-3 font-overline text-[11px] text-slate-500 uppercase tracking-wider"
        >
          {category}
        </td>
      </tr>
      {rows.map((row) => (
        <tr
          key={row.id}
          className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50"
        >
          <td className="py-3.5 px-3 align-top">
            <div className="font-body text-sm font-semibold text-slate-900">
              {row.action}
            </div>
            <div className="font-caption text-[11px] text-slate-500 mt-0.5">
              {row.detail}
            </div>
          </td>
          {ROLES_ORDER.map((role) => (
            <td
              key={role}
              className={cn(
                "py-3.5 px-3 align-top",
                role === currentRole && "bg-sky-50/40"
              )}
            >
              <AccessCell
                level={row.access[role]}
                note={row.note?.[role]}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
