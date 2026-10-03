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
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-sky-600 text-white">
              <RadioTower className="h-5 w-5" />
            </span>
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
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10 transition-colors hover:bg-sky-600 hover:text-white"
              >
                <Icon className="h-4 w-4" />
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">Jurusan</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            {jurusanLinks.map((j) => (
              <li key={j}>
                <Link href="#jurusan" className="text-slate-400 transition-colors hover:text-sky-300">
                  {j}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">Informasi</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            {infoLinks.map((l) => (
              <li key={l.label}>
                <Link href={l.href} className="text-slate-400 transition-colors hover:text-sky-300">
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
              Jl. Telekomunikasi No. 1, Tunas Harapan
            </li>
            <li className="flex gap-2.5">
              <Phone className="h-4 w-4 shrink-0 text-sky-400" />
              (021) 555-0126
            </li>
            <li className="flex gap-2.5">
              <Mail className="h-4 w-4 shrink-0 text-sky-400" />
              info@smktunasharapan.sch.id
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-slate-500 sm:flex-row sm:px-6">
          <p>© 2026 SMK Telekomunikasi Tunas Harapan. Seluruh hak cipta dilindungi.</p>
          <p>Akreditasi A — NPSN 20109999</p>
        </div>
      </div>
    </footer>
  );
}
