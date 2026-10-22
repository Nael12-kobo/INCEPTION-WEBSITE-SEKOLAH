import type { Metadata } from "next";
import { Hero } from "@/components/Hero";
import { Stats } from "@/components/Stats";
import { Profil } from "@/components/Profil";
import { Jurusan } from "@/components/Jurusan";
import { Fasilitas } from "@/components/Fasilitas";
import { Berita } from "@/components/Berita";
import { CtaPpdb } from "@/components/CtaPpdb";
import { Footer } from "@/components/Footer";
import { HomeBackdrop } from "@/components/HomeBackdrop";
import { ambilBerita } from "@/lib/blog";

export const metadata: Metadata = {
  title: "SMK Telekomunikasi Tunas Harapan | Profil, Program, dan PPDB",
  description:
    "Kenali SMK Telekomunikasi Tunas Harapan, empat program keahlian, fasilitas sekolah, dan informasi penerimaan peserta didik baru.",
};

export default async function Home() {
  // Berita terbaru dari situs resmi sekolah — di-cache 1 jam oleh Next,
  // dan diam-diam mengembalikan [] kalau situsnya lagi tidak bisa diakses.
  const berita = await ambilBerita(9);

  return (
    <div className="relative flex min-h-dvh flex-col  font-sans text-slate-900">
      <HomeBackdrop />
      <main className="relative flex-1">
        <Hero />
        <Stats />
        <Profil />
        <Jurusan />
        <Fasilitas />
        <Berita posts={berita} />
        <CtaPpdb />
      </main>
      <Footer />
    </div>
  );
}
