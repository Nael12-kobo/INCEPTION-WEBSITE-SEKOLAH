import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JurusanBawaanDetail } from "@/components/jurusan/jurusan-bawaan-detail";
import { getJurusanDetailBawaan } from "@/lib/jurusan-server";

export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const jurusan = await getJurusanDetailBawaan("DKV");
  return {
    title: jurusan
      ? `${jurusan.singkatan} — ${jurusan.tagline ?? jurusan.nama} | SMK Tunas Harapan`
      : "Program Keahlian tidak ditemukan",
    description: jurusan?.deskripsi,
  };
}

export default async function DKVPage() {
  const jurusan = await getJurusanDetailBawaan("DKV");
  if (!jurusan) notFound();
  return <JurusanBawaanDetail jurusan={jurusan} />;
}
