"use client";

import Image from "next/image";
import Link from "next/link";
import { GraduationCap, Menu, RadioTower } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const profilLinks = [
  { href: "/#profil", title: "Profil Sekolah", desc: "Sambutan, visi-misi, dan sejarah singkat." },
  { href: "/#statistik", title: "Data & Statistik", desc: "Jumlah siswa, guru, dan prestasi." },
  { href: "/#fasilitas", title: "Fasilitas", desc: "Lab, perpustakaan, dan sarana praktik." },
];

const programLinks = [
  { href: "/jurusan/PPLG", title: "Pengembangan Perangkat Lunak Dan Gim", desc: "Web, mobile, dan cloud." },
  { href: "/jurusan/TJKT", title: "Teknik Jaringan Komputer Dan Telekomunikasi", desc: "Jaringan, Fiber optik, 5G, dan sistem komunikasi." },
  { href: "/jurusan/DKV", title: "Desain Komunikasi Visual", desc: "Fotografi, Videografi, " },
  { href: "/jurusan/TKRO", title: "Teknik Kendaraan Ringan Otomotif", desc: "Fotografi, Videografi, " },
];

const mobileLinks = [
  { href: "/#profil", label: "Profil" },
  { href: "/#jurusan", label: "Jurusan" },
  { href: "/#fasilitas", label: "Fasilitas" },
  { href: "/#berita", label: "Berita" },
  { href: "/#ppdb", label: "PPDB" },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-blue-100/80 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          
            <Image src="/images/TTH.png" alt="Logo SMK Telekomunikasi Tunas Harapan" width={40} height={40} className=" drop-shadow-lg" />
          
          <span className="leading-tight">
            <span className="block text-sm font-bold tracking-tight text-slate-900">
              SMK Telekomunikasi
            </span>
            <span className="block text-xs font-medium text-blue-600">Tunas Harapan</span>
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
                          className="block rounded-xl p-3 transition-colors hover:bg-blue-50"
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
                          className="block rounded-xl p-3 transition-colors hover:bg-blue-50"
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
                  href="#fasilitas"
                  className="inline-flex h-9 items-center justify-center rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-blue-100 hover:text-blue-900"
                >
                  Fasilitas
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link
                  href="#berita"
                  className="inline-flex h-9 items-center justify-center rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-blue-100 hover:text-blue-900"
                >
                  Berita
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        <div className="hidden items-center gap-2 lg:flex">
          <Button variant="ghost" asChild>
            <Link href="#profil">
              <GraduationCap />
              Tentang
            </Link>
          </Button>
          <Button asChild>
            <Link href="#ppdb">PPDB 2026</Link>
          </Button>
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="lg:hidden" aria-label="Buka menu">
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 text-white">
                  <RadioTower className="h-4 w-4" />
                </span>
                Tunas Harapan
              </SheetTitle>
            </SheetHeader>
            <nav className="mt-6 flex flex-col gap-1">
              {mobileLinks.map((l) => (
                <Link
                  key={l.href + l.label}
                  href={l.href}
                  className="rounded-xl px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-blue-50 hover:text-blue-900"
                >
                  {l.label}
                </Link>
              ))}
              <Button asChild className="mt-4">
                <Link href="#ppdb">PPDB 2026</Link>
              </Button>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
