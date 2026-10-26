import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JurusanBawaanDetail } from "@/components/jurusan/jurusan-bawaan-detail";
import { getJurusanDetailBawaan } from "@/lib/jurusan-server";

export const metadata: Metadata = {
  title: "PPLG — Pemrograman Perangkat Lunak & Gim | SMK Tunas Harapan",
  description:
    "Pelajari program PPLG SMK Telekomunikasi Tunas Harapan: pengembangan aplikasi, perangkat lunak, dan gim.",
};

export const revalidate = 0;

export default async function PPLGPage() {
  const jurusan = await getJurusanDetailBawaan("PPLG");
  if (!jurusan) notFound();

  return <JurusanBawaanDetail jurusan={jurusan} />;
}
