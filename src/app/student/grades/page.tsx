import type { Metadata } from "next";
import { Award } from "lucide-react";
import { StudentPage } from "@/components/student/student-page";

export const metadata: Metadata = {
  title: "Nilai / Rapor — SMK Telekomunikasi Tunas Harapan",
  description: "Rekap nilai harian, PTS, dan rapor siswa aktif.",
};

export default function GradesPage() {
  return (
    <StudentPage
      slug="grades"
      title="Nilai / Rapor"
      description="Nilai harian, PTS/PAS, dan rapor semester Anda per mata pelajaran."
      icon={Award}
      emptyHint="Rekap nilai akan tampil di sini setelah guru memasukkan penilaian."
    />
  );
}
