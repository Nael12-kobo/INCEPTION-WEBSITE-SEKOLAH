import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { GuruKaryawanGrid } from "@/components/GuruKaryawanGrid";
import { getSiteContent } from "@/lib/site-content-server";

export const metadata: Metadata = {
  title: "Guru & Karyawan — SMK Telekomunikasi Tunas Harapan",
  description:
    "Daftar guru dan tenaga kependidikan SMK Telekomunikasi Tunas Harapan beserta fotonya.",
};

/**
 * Halaman foto guru & karyawan. Judul + daftar orang diedit dari
 * Admin Panel > Konten Situs > Guru & Karyawan (`site_contents.guru`);
 * bila tabel belum terisi, memakai nilai default dari kode.
 */
export default async function GuruKaryawanPage() {
  const konten = await getSiteContent("guru");
  const jumlah = konten.daftar.length;
  const deskripsi = konten.deskripsi.replaceAll("{jumlah}", String(jumlah));

  return (
    <div className="min-h-dvh font-sans text-slate-900">
      {/* Header */}
      <section className="border-b border-blue-100/70 bg-gradient-to-b from-sky-50 via-card to-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-14 text-center sm:px-6">
          <Badge variant="secondary" className="glass-chip border-white/60">
            {konten.badge}
          </Badge>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            {konten.judul}
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
            {deskripsi}
          </p>
        </div>
      </section>

      {/* Grid foto */}
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <GuruKaryawanGrid items={konten.daftar} />
      </main>
    </div>
  );
}
