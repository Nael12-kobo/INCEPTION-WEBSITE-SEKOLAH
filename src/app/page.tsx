import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Stats } from "@/components/Stats";
import { Profil } from "@/components/Profil";
import { Jurusan } from "@/components/Jurusan";
import { Fasilitas } from "@/components/Fasilitas";
import { Berita } from "@/components/Berita";
import { CtaPpdb } from "@/components/CtaPpdb";
import { Footer } from "@/components/Footer";
import { HomeBackdrop } from "@/components/HomeBackdrop";

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col  font-sans text-slate-900">
      <HomeBackdrop />
      <main className="relative flex-1">
        <Hero />
        <Stats />
        <Profil />
        <Jurusan />
        <Fasilitas />
        <Berita />
        <CtaPpdb />
      </main>
      <Footer />
    </div>
  );
}
