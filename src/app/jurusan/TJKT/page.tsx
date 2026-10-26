import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JurusanBawaanDetail } from "@/components/jurusan/jurusan-bawaan-detail";
import { getJurusanDetailBawaan } from "@/lib/jurusan-server";

export const metadata: Metadata = {
  title:
    "TJKT — Teknologi Jaringan Komputer & Telekomunikasi | SMK Tunas Harapan",
  description:
    "Pelajari program TJKT SMK Telekomunikasi Tunas Harapan: instalasi jaringan, infrastruktur telekomunikasi, cloud, dan keamanan jaringan.",
};

export const revalidate = 0;

export default async function TJKTPage() {
  const jurusan = await getJurusanDetailBawaan("TJKT");
  if (!jurusan) notFound();

  return <JurusanBawaanDetail jurusan={jurusan} />;
}
