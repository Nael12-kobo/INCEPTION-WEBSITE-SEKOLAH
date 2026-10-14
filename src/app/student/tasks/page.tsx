import type { Metadata } from "next";
import { ListTodo } from "lucide-react";
import { StudentPage } from "@/components/student/student-page";

export const metadata: Metadata = {
  title: "Tugas — SMK Telekomunikasi Tunas Harapan",
  description: "Daftar tugas dan tenggat waktu siswa aktif.",
};

export default function TasksPage() {
  return (
    <StudentPage
      slug="tasks"
      title="Tugas"
      description="Daftar tugas per mata pelajaran beserta tenggat dan status pengumpulan."
      icon={ListTodo}
      emptyHint="Daftar tugas akan tampil di sini saat dibagikan oleh guru."
    />
  );
}
