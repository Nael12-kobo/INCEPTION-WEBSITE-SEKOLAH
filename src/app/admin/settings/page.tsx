import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/role-utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings } from "lucide-react";

export const metadata = {
  title: "Pengaturan — Admin Panel | SMK Tunas Harapan",
  description: "Pengaturan panel admin.",
};

export default async function AdminSettingsPage() {
  const session = await requireAdmin();
  if (!session) {
    redirect("/auth/login?callbackUrl=/admin/settings");
  }

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="font-h1 text-slate-900">Pengaturan</h1>
        <p className="font-body text-slate-500">
          Preferensi panel admin untuk {session.user.email}.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-sky-600" />
            Preferensi
          </CardTitle>
          <CardDescription>
            Pengaturan lanjutan akan ditambahkan bertahap.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 font-caption text-sm text-slate-600">
          <p>
            Role aktif:{" "}
            <span className="font-semibold text-slate-900">{session.user.role}</span>
          </p>
          <p>
            Akun:{" "}
            <span className="font-semibold text-slate-900">
              {session.user.name || session.user.email}
            </span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
