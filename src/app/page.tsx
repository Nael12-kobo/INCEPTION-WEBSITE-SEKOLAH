import type { Metadata } from "next";
import { Hero } from "@/components/Hero";
import { Stats } from "@/components/Stats";
import { Profil } from "@/components/Profil";
import { Jurusan } from "@/components/Jurusan";
import { Fasilitas } from "@/components/Fasilitas";
import { Berita } from "@/components/Berita";
import { CtaPpdb } from "@/components/CtaPpdb";
import { HomeBackdrop } from "@/components/HomeBackdrop";
import { gabungBerita } from "@/lib/berita-server";
import { getJurusanAktif } from "@/lib/jurusan-server";
import { getSemuaSiteContent } from "@/lib/site-content-server";

export const metadata: Metadata = {
  title: "SMK Telekomunikasi Tunas Harapan | Profil, Program, dan PPDB",
  description:
    "Kenali SMK Telekomunikasi Tunas Harapan, empat program keahlian, fasilitas sekolah, dan informasi penerimaan peserta didik baru.",
};

export default async function Home() {
  // Berita = gabungan buatan admin (tabel `beritas`) + situs resmi sekolah
  // (WordPress, di-cache 1 jam). Keduanya diam-diam mengembalikan [] kalau
  // sumbernya tidak bisa diakses, jadi homepage tidak pernah gagal render.
  // `konten` = teks section beranda yang diedit dari Admin Panel > Konten
  // Situs; selalu berbentuk lengkap (fallback otomatis ke nilai default).
  const [berita, jurusan, konten] = await Promise.all([
    gabungBerita(9),
    getJurusanAktif(),
    getSemuaSiteContent(),
  ]);

  return (
    <div className="relative flex min-h-dvh flex-col  font-sans text-slate-900">
      <HomeBackdrop />
      <main className="relative flex-1">
        <Hero konten={konten.hero} />
        <Stats konten={konten.statistik} />
        <Profil konten={konten.profil} />
        <Jurusan items={jurusan} />
        <Fasilitas konten={konten.fasilitas} />
        <Berita posts={berita} />
        <CtaPpdb konten={konten["ppdb-cta"]} />
      </main>
      {/* Footer dirender SiteChrome (src/components/SiteChrome.tsx) agar
          juga muncul di halaman non-home seperti /jurusan dan /sejarah. */}
    </div>
  );
}
