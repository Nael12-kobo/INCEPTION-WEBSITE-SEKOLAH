import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JurusanBawaanDetail } from "@/components/jurusan/jurusan-bawaan-detail";
import { getJurusanDetailBawaan } from "@/lib/jurusan-server";

export const metadata: Metadata = {
  title: "DKV — Desain Komunikasi Visual | SMK Tunas Harapan",
  description:
    "Pelajari program DKV SMK Telekomunikasi Tunas Harapan: desain grafis, fotografi, komunikasi visual, dan produksi media digital.",
};

export const revalidate = 0;

export default async function DKVPage() {
  const jurusan = await getJurusanDetailBawaan("DKV");
  if (!jurusan) notFound();

  return <JurusanBawaanDetail jurusan={jurusan} />;
}
