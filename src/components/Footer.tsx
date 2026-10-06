import Image from "next/image";
import Link from "next/link";
import { AtSign, Globe, Mail, MapPin, MessageCircle, Phone, RadioTower } from "lucide-react";

const jurusanLinks = ["Pengembangan Perangkat Lunak", "Teknik Jaringan Komputer Dan Telekomunikasi", "Desain Komunikasi Visual", "Teknik Kendaraan Ringan Otomotif"];
const infoLinks = [
  { label: "Profil Sekolah", href: "#profil" },
  { label: "Fasilitas", href: "#fasilitas" },
  { label: "Berita", href: "#berita" },
  { label: "PPDB 2026", href: "#ppdb" },
];

export function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-300 z-10">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2.5">
            <Image src="/images/TTH.png" alt="Logo SMK Telekomunikasi Tunas Harapan" width={40} height={40} className=" drop-shadow-lg" />
            <span className="leading-tight">
              <span className="block text-sm font-bold text-white">SMK Telekomunikasi</span>
              <span className="block text-xs font-medium text-sky-400">Tunas Harapan</span>
            </span>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-slate-400">
            Sekolah vokasi telekomunikasi dan teknologi digital — kompeten, berkarakter, siap
            kerja.
          </p>
          <div className="mt-4 flex gap-2">
            {[Globe, AtSign, MessageCircle, Mail].map((Icon, i) => (
              <Link
                key={i}
                href="#beranda"
                aria-label="Media sosial sekolah"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10 transition-colors hover:bg-sky-600 hover:text-white sm:h-9 sm:w-9"
              >
                <Icon className="h-4 w-4" />
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">Jurusan</h3>
          <ul className="mt-4 space-y-0 text-sm sm:space-y-2.5">
            {jurusanLinks.map((j) => (
              <li key={j}>
                <Link href="#jurusan" className="block py-2 text-slate-400 transition-colors hover:text-sky-300 sm:py-0">
                  {j}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">Informasi</h3>
          <ul className="mt-4 space-y-0 text-sm sm:space-y-2.5">
            {infoLinks.map((l) => (
              <li key={l.label}>
                <Link href={l.href} className="block py-2 text-slate-400 transition-colors hover:text-sky-300 sm:py-0">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">Kontak</h3>
          <ul className="mt-4 space-y-3 text-sm text-slate-400">
            <li className="flex gap-2.5">
              <MapPin className="h-4 w-4 shrink-0 text-sky-400" />
              Jl. Umbul Senjoyo I, No. 3 Desa Bener, Kec. Tengaran, Kabupaten Semarang, Jawa Tengah.
            </li>
            <li className="flex gap-2.5">
              <Phone className="h-4 w-4 shrink-0 text-sky-400" />
              (0298) 311391
            </li>
            <li className="flex gap-2.5">
              <Mail className="h-4 w-4 shrink-0 text-sky-400" />
              info@tunasharapan.info
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        {/* pb-28 di mobile supaya baris link legal tidak tertimpa tombol chat mengambang */}
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 pt-5 pb-28 text-xs text-slate-500 sm:flex-row sm:px-6 sm:pb-5">
          <p>© 2026 SMK Telekomunikasi Tunas Harapan. Seluruh hak cipta dilindungi.</p>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
            <Link
              href="/privacy-policy"
              className="transition-colors hover:text-sky-300"
            >
              Kebijakan Privasi
            </Link>
            <Link
              href="/terms-of-service"
              className="transition-colors hover:text-sky-300"
            >
              Syarat &amp; Ketentuan
            </Link>
            <span>Akreditasi A — NPSN 20109999</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
