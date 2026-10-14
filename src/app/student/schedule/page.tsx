import type { Metadata } from "next";
import { CalendarRange } from "lucide-react";
import { StudentPage } from "@/components/student/student-page";

export const metadata: Metadata = {
  title: "Jadwal Peserta — SMK Telekomunikasi Tunas Harapan",
  description: "Jadwal pelajaran dan kegiatan harian siswa aktif.",
};

export default function SchedulePage() {
  return (
    <StudentPage
      slug="schedule"
      title="Jadwal Peserta"
      description="Jadwal pelajaran, piket, dan kegiatan harian Anda per kelas dan jurusan."
      icon={CalendarRange}
      emptyHint="Jadwal pelajaran mingguan akan tampil di sini."
    />
  );
}
