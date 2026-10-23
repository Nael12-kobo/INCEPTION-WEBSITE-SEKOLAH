"use client";

import Image from "next/image";
import Link from "next/link";
import { GraduationCap, Menu, RadioTower } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  SheetClose,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const profilLinks = [
  { href: "/#profil", title: "Profil Sekolah", desc: "Sambutan, visi-misi, dan sejarah singkat." },
  { href: "/sejarah", title: "Sejarah", desc: "Perjalanan sekolah sejak 2001." },
  { href: "/#statistik", title: "Data & Statistik", desc: "Jumlah siswa, guru, dan prestasi." },
  { href: "/#fasilitas", title: "Fasilitas", desc: "Lab, perpustakaan, dan sarana praktik." },
];

const programLinks = [
  { href: "/jurusan/PPLG", title: "Pengembangan Perangkat Lunak Dan Gim", desc: "Web, mobile, dan cloud." },
  { href: "/jurusan/TJKT", title: "Teknik Jaringan Komputer Dan Telekomunikasi", desc: "Jaringan, Fiber optik, 5G, dan sistem komunikasi." },
  { href: "/jurusan/DKV", title: "Desain Komunikasi Visual", desc: "Desain grafis, fotografi, videografi, dan animasi." },
  { href: "/jurusan/TKRO", title: "Teknik Kendaraan Ringan Otomotif", desc: "Mesin, kelistrikan, chassis, dan body repair." }
];

const mobileLinks = [
  { href: "/#profil", label: "Profil Sekolah" },
  { href: "/#statistik", label: "Data & Statistik" },
  { href: "/#fasilitas", label: "Fasilitas" },
  { href: "/sejarah", label: "Sejarah" },
  { href: "/jurusan/PPLG", label: "PPLG - Pengembangan Perangkat Lunak" },
  { href: "/jurusan/TJKT", label: "TJKT - Jaringan Komputer" },
  { href: "/jurusan/DKV", label: "DKV - Desain Komunikasi Visual" },
  { href: "/jurusan/TKRO", label: "TKRO - Kendaraan Ringan Otomotif" },
  { href: "/#berita", label: "Berita" },
  { href: "/guru-karyawan", label: "Guru & Karyawan" },
  { href: "/#profil", label: "Tentang" },
  // Tanpa link ini, pengunjung HP tidak punya jalan menuju login —
  // satu-satunya akses sebelumnya lewat redirect dari /ppdb.
  { href: "/auth/login", label: "Masuk" },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-blue-100/80 dark:border-card bg-card/80 backdrop-blur-md">
      {/* gap-1 (bukan gap-4): saat 1024px muatan nav hampir penuh — gap cuma
          berpengaruh kalau sempit, saat lega justify-between tetap memisahkan
          grup dengan jarak yang sama. Dibutuhkan untuk muat button "Guru". */}
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-1 px-4 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          
            <Image src="/images/TTH.png" alt="Logo SMK Telekomunikasi Tunas Harapan" width={40} height={40} className=" drop-shadow-lg" />
          
          <span className="leading-tight">
            <span className="block text-sm font-bold tracking-tight text-slate-900">
              SMK Telekomunikasi
            </span>
            <span className="block text-xs font-medium text-cyan-500 dark:text-white/80">Tunas Harapan</span>
          </span>
        </Link>

        <NavigationMenu className="hidden lg:flex">
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Profil</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[380px] gap-1 p-3">
                  {profilLinks.map((l) => (
                    <li key={l.title}>
                      <NavigationMenuLink asChild>
                        <Link
                          href={l.href}
                          className="block rounded-xl p-3 transition-colors hover:bg-sky-100"
                        >
                          <span className="block text-sm font-semibold text-slate-900">
                            {l.title}
                          </span>
                          <span className="block text-xs text-slate-500">{l.desc}</span>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Program</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[380px] gap-1 p-3">
                  {programLinks.map((l) => (
                    <li key={l.title}>
                      <NavigationMenuLink asChild>
                        <Link
                          href={l.href}
                          className="block rounded-xl p-3 transition-colors hover:bg-sky-100"
                        >
                          <span className="block text-sm font-semibold text-slate-900">
                            {l.title}
                          </span>
                          <span className="block text-xs text-slate-500">{l.desc}</span>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link
                  href="/#fasilitas"
                  className="inline-flex h-9 items-center justify-center rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-sky-100 "
                >
                  Fasilitas
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link
                  href="/#berita"
                  className="inline-flex h-9 items-center justify-center rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-sky-100"
                >
                  Berita
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        <div className="hidden items-center gap-2 lg:flex">
          <Button variant="ghost" asChild>
            <Link href="/#profil">
              <GraduationCap />
              Tentang
            </Link>
          </Button>
          {/* Label "Guru" (bukan "Guru & Karyawan") — versi penuh tidak muat
              di 1024–1080px: logo membungkus & menimpa menu Profil.
              Menu HP tetap memakai label penuh. px-3 menghemat 16px lagi. */}
          <Button variant="ghost" className="px-3" asChild>
            <Link href="/guru-karyawan">Guru</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/auth/login">Masuk</Link>
          </Button>
          <ThemeToggle />
          <Button asChild className="dark:bg-sky-200 glass-hover hover:dark:bg-sky-300">
            <Link href="/#ppdb" className="text-white dark:text-gray-300">
              PPDB 2026
            </Link>
          </Button>
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="lg:hidden" aria-label="Buka menu">
              <Menu />
            </Button>
          </SheetTrigger>
          {/* flex + nav flex-1 overflow-y-auto: menu mobile harus BISA DI-SCROLL
              di HP pendek — item bawah ("Masuk", tombol PPDB) muat semua.
              pb-safe: jauhkan dari home indicator iPhone (viewport-fit cover). */}
          <SheetContent side="right" className="z-[60] flex flex-col">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 text-white">
                  <RadioTower className="h-4 w-4" />
                </span>
                Tunas Harapan
              </SheetTitle>
            </SheetHeader>
            <nav className="subtle-scroll mt-6 flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto pb-[env(safe-area-inset-bottom)]">
              {/* Section Profil */}
              <div className="mb-2">
                <p className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Profil
                </p>
                {/* 4 item: Profil Sekolah, Data & Statistik, Fasilitas, Sejarah */}
                {mobileLinks.slice(0, 4).map((l) => (
                  <SheetClose
                    key={l.href + l.label}
                    asChild
                  >
                    <Link
                      href={l.href}
                      className="block rounded-xl px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-blue-50 hover:text-blue-900"
                    >
                      {l.label}
                    </Link>
                  </SheetClose>
                ))}
              </div>

              {/* Section Program */}
              <div className="mb-2">
                <p className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Program Keahlian
                </p>
                {mobileLinks.slice(4, 8).map((l) => (
                  <SheetClose
                    key={l.href + l.label}
                    asChild
                  >
                    <Link
                      href={l.href}
                      className="block rounded-xl px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-blue-50 hover:text-blue-900"
                    >
                      {l.label}
                    </Link>
                  </SheetClose>
                ))}
              </div>

              {/* Section Lainnya */}
              <div className="mb-2">
                <p className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Lainnya
                </p>
                {mobileLinks.slice(8).map((l) => (
                  <SheetClose
                    key={l.href + l.label}
                    asChild
                  >
                    <Link
                      href={l.href}
                      className="block rounded-xl px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-blue-50 hover:text-blue-900"
                    >
                      {l.label}
                    </Link>
                  </SheetClose>
                ))}
              </div>

              {/* Mode tampilan — toggle terang/gelap/otomatis */}
              <div className="mt-4 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <span className="text-sm font-medium text-slate-700">
                  Mode tampilan
                </span>
                <ThemeToggle />
              </div>

              <SheetClose asChild>
                <Button asChild className="mt-4 w-full">
                  <Link href="/#ppdb">PPDB 2026</Link>
                </Button>
              </SheetClose>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
