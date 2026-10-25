import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/role-utils";
import { prisma } from "@/lib/prisma";
import { ACADEMIC_DOMAINS } from "@/lib/academic";
import { listAcademic } from "@/lib/academic-server";
import { getPpdbJurusanOptions } from "@/lib/ppdb-jurusan-server";
import {
  AcademicAdminClient,
  type AcademicRow,
  type AcademicRows,
  type StudentOption,
} from "@/components/admin/academic-admin-client";

export const metadata = {
  title: "Data Akademik — Admin Panel | SMK Tunas Harapan",
  description: "Isi jadwal, nilai, absensi, tugas, dan kartu ujian siswa.",
};

export default async function AdminAcademicPage() {
  const session = await requireAdmin();
  if (!session) {
    redirect("/auth/login?callbackUrl=/admin/academic");
  }

  const [students, jurusanOptions] = await Promise.all([
    prisma.user.findMany({
      where: { ppdbRegistration: { status: "REGISTERED" } },
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" },
    }),
    getPpdbJurusanOptions(),
  ]);

  const initialRows = {} as AcademicRows;
  for (const domain of ACADEMIC_DOMAINS) {
    initialRows[domain] = (await listAcademic(domain)) as AcademicRow[];
  }

  const studentOptions: StudentOption[] = students.map((s) => ({
    id: s.id,
    name: s.name,
    email: s.email,
  }));

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="font-h1 text-slate-900">Data Akademik</h1>
          <p className="font-body text-slate-500">
            Isi jadwal, nilai, absensi, tugas, dan kartu ujian — langsung tampil
            di portal siswa.
          </p>
        </div>
      </div>

      <AcademicAdminClient
        initialRows={initialRows}
        students={studentOptions}
        jurusanOptions={jurusanOptions}
      />
    </div>
  );
}
