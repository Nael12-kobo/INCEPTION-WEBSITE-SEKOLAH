import type { Metadata } from "next";
import { IdCard } from "lucide-react";
import { StudentPage } from "@/components/student/student-page";

export const metadata: Metadata = {
  title: "Kartu Ujian — SMK Telekomunikasi Tunas Harapan",
  description: "Kartu peserta dan nomor ujian siswa aktif.",
};

export default function ExamCardPage() {
  return (
    <StudentPage
      slug="exam-card"
      title="Kartu Ujian"
      description="Kartu peserta, nomor ujian, dan ruang untuk PTS/PAS dan ujian kompetensi."
      icon={IdCard}
      emptyHint="Kartu ujian akan tampil di sini ketika masa penerbitan kartu dibuka."
    />
  );
}
