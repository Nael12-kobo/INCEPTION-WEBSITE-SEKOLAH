import type { Metadata } from "next";
import { ClipboardCheck } from "lucide-react";
import { StudentPage } from "@/components/student/student-page";

export const metadata: Metadata = {
  title: "Absensi — SMK Telekomunikasi Tunas Harapan",
  description: "Rekap kehadiran harian siswa aktif.",
};

export default function AttendancePage() {
  return (
    <StudentPage
      slug="attendance"
      title="Absensi"
      description="Rekap kehadiran: hadir, izin, sakit, dan alpa per pertemuan."
      icon={ClipboardCheck}
      emptyHint="Rekap kehadiran akan tampil di sini setiap hari sekolah."
    />
  );
}
