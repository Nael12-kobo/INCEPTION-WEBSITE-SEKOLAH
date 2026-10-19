import type { Metadata } from "next";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Sejarah — SMK Telekomunikasi Tunas Harapan",
  description:
    "Perjalanan SMK Telekomunikasi Tunas Harapan sejak berdiri 27 Februari 2001 — dari satu program keahlian hingga empat jurusan hari ini.",
};

/**
 * Konten diambil dari halaman resmi sekolah (WordPress):
 * https://www.tunasharapan.info/official/sejarah/ (di-salin statis per
 * keputusan — lihat README knowledge). Jangan mengubah fakta tanpa
 * memperbarui juga knowledge/09-sejarah.md (jawaban chatbot AI).
 */

const milestones = [
  {
    period: "27 Februari 2001",
    title: "Berdiri resmi",
    desc: "Didirikan oleh Yayasan Tunas Harapan Kabupaten Semarang berdasarkan SK Kepala Kantor Wilayah Departemen Pendidikan dan Kebudayaan Provinsi Jawa Tengah Nomor 1315/I03.08/MN/2001 — dengan satu Program Keahlian: Teknik Informatika.",
  },
  {
    period: "Perkembangan kurikulum",
    title: "Perluasan program keahlian",
    desc: "Mengikuti kebutuhan dunia industri, sekolah membuka Program Keahlian Teknik Elektronika Komunikasi dan Teknik Otomotif berdasarkan Kurikulum 1999.",
  },
  {
    period: "Fase peningkatan mutu",
    title: "SSN & RSBI",
    desc: "Sekolah sempat menjadi bagian dari Sekolah Standar Nasional (SSN) dan Rintisan Sekolah Bertaraf Internasional (RSBI) — fondasi budaya mutu yang terus diwariskan sampai sekarang.",
  },
  {
    period: "Hari ini",
    title: "Lebih dari dua dekade",
    desc: "Kini SMK Telekomunikasi Tunas Harapan menjalani empat Program Keahlian (PPLG, TJKT, DKV, TKRO) dengan tetap menjaga semangat yang sama: menyiapkan generasi yang mampu menghadapi masa depan.",
  },
];

const gallery = [
  {
    src: "https://www.tunasharapan.info/official/wp-content/uploads/2026/09/IMG_0981-1024x681.jpg",
    alt: "Dokumentasi kegiatan SMK Telekomunikasi Tunas Harapan",
  },
  {
    src: "https://www.tunasharapan.info/official/wp-content/uploads/2026/09/IMG_0958-1024x651.jpg",
    alt: "Suasana pembelajaran di SMK Telekomunikasi Tunas Harapan",
  },
  {
    src: "https://www.tunasharapan.info/official/wp-content/uploads/2026/09/IMG_1009-1-1024x681.jpg",
    alt: "Kegiatan siswa SMK Telekomunikasi Tunas Harapan",
  },
  {
    src: "https://www.tunasharapan.info/official/wp-content/uploads/2026/09/IMG_1010-1024x661.jpg",
    alt: "Dokumentasi arsip sekolah",
  },
];

export default function SejarahPage() {
  return (
    <div className="min-h-dvh font-sans text-slate-900 dark:text-slate-100">
      {/* Header */}
      <section className="border-b border-blue-100/70 bg-gradient-to-b from-sky-50 via-card to-slate-50 dark:border-slate-800 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        <div className="mx-auto max-w-6xl px-4 py-14 text-center sm:px-6">
          <Badge variant="secondary" className="glass-chip border-white/60">
            Profil Sekolah
          </Badge>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Sejarah Sekolah
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-400 sm:text-base">
            Berdiri sejak <strong>27 Februari 2001</strong> — berakar dari
            sejarah, beradaptasi dengan zaman, dan bergerak menuju masa depan.
          </p>
        </div>
      </section>

      {/* Foto utama */}
      <section className="mx-auto max-w-6xl px-4 pt-10 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800">
          <Image
            src="https://www.tunasharapan.info/official/wp-content/uploads/2026/09/Gemini_Generated_Image_st54pwst54pwst54-1024x672.jpeg"
            alt="Dokumentasi arsip SMK Telekomunikasi Tunas Harapan"
            width={1024}
            height={672}
            priority
            className="h-auto w-full object-cover"
          />
        </div>
      </section>

      {/* Latar belakang */}
      <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
          Latar Belakang
        </h2>
        <div className="mt-5 space-y-5 leading-relaxed text-slate-600 dark:text-slate-400">
          <p>
            SMK Telekomunikasi Tunas Harapan Kabupaten Semarang lahir dari
            sebuah gagasan untuk menjawab tantangan perkembangan teknologi dan
            kebutuhan dunia industri terhadap sumber daya manusia yang
            terampil, adaptif, dan siap kerja. Gagasan tersebut diwujudkan oleh{" "}
            <strong className="text-slate-800 dark:text-slate-200">
              Yayasan Tunas Harapan Kabupaten Semarang
            </strong>{" "}
            dengan mendirikan SMK Telekomunikasi Tunas Harapan yang secara
            resmi berdiri pada{" "}
            <strong className="text-slate-800 dark:text-slate-200">
              27 Februari 2001
            </strong>
            , berdasarkan SK Kepala Kantor Wilayah Departemen Pendidikan dan
            Kebudayaan Provinsi Jawa Tengah Nomor 1315/I03.08/MN/2001. Pada
            awal berdirinya, sekolah ini hanya memiliki satu Program Keahlian,
            yaitu <strong className="text-slate-800 dark:text-slate-200">
              Teknik Informatika
            </strong>
            , sebagai bentuk keberanian untuk memasuki era teknologi informasi
            yang saat itu sedang berkembang pesat.
          </p>
          <p>
            Seiring perjalanan waktu, kebutuhan dunia industri terus berubah
            dan berkembang. SMK Telekomunikasi Tunas Harapan pun memilih untuk
            terus beradaptasi. Berdasarkan perkembangan kebutuhan pasar
            industri dan kurikulum yang berlaku, sekolah membuka program
            keahlian baru, yaitu{" "}
            <strong className="text-slate-800 dark:text-slate-200">
              Teknik Elektronika Komunikasi dan Teknik Otomotif
            </strong>{" "}
            berdasarkan Kurikulum 1999. Perubahan tersebut menjadi bagian dari
            karakter sekolah yang senantiasa membaca perkembangan zaman: ketika
            teknologi berubah, kompetensi dikembangkan; ketika industri
            membutuhkan keterampilan baru, pendidikan dipersiapkan untuk
            menjawabnya.
          </p>
          <p>
            Perjalanan SMK Telekomunikasi Tunas Harapan juga ditandai dengan
            berbagai fase pengembangan mutu pendidikan. Sejalan dengan
            perubahan spektrum dan kurikulum pada setiap masanya, program
            keahlian dan proses pembelajaran terus disesuaikan agar tetap
            relevan dengan kebutuhan peserta didik dan dunia kerja. Sekolah
            tidak hanya berkembang sebagai satuan pendidikan kejuruan, tetapi
            juga pernah menjadi bagian dari perjalanan{" "}
            <strong className="text-slate-800 dark:text-slate-200">
              Sekolah Standar Nasional (SSN)
            </strong>{" "}
            dan{" "}
            <strong className="text-slate-800 dark:text-slate-200">
              Rintisan Sekolah Bertaraf Internasional (RSBI)
            </strong>
            . Pengalaman tersebut menjadi fondasi penting dalam membangun
            budaya mutu, meningkatkan kualitas pembelajaran, serta memperkuat
            kesiapan sekolah menghadapi tuntutan pendidikan dan dunia kerja
            yang semakin kompetitif.
          </p>
          <p>
            Lebih dari dua dekade sejak berdiri, SMK Telekomunikasi Tunas
            Harapan Kabupaten Semarang terus menapaki perjalanan dengan satu
            semangat yang tidak berubah:{" "}
            <strong className="text-slate-800 dark:text-slate-200">
              menyiapkan generasi yang mampu menghadapi masa depan
            </strong>
            . Dari satu program keahlian hingga berkembang mengikuti dinamika
            teknologi dan industri, setiap perubahan menjadi bagian dari
            proses untuk terus bertumbuh. Kini, dengan pengalaman panjang dan
            semangat inovasi yang terus dijaga, SMK Telekomunikasi Tunas
            Harapan memandang masa depan bukan sebagai sesuatu yang harus
            ditunggu, melainkan sesuatu yang harus dipersiapkan dan diciptakan.{" "}
            <strong className="text-slate-800 dark:text-slate-200">
              Berakar dari sejarah, beradaptasi dengan zaman, dan bergerak
              menuju masa depan.
            </strong>
          </p>
        </div>
      </section>

      {/* Tonggak perjalanan */}
      <section className="border-y border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-gray-900/50">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Tonggak Perjalanan
          </h2>
          <ol className="mt-8 space-y-6">
            {milestones.map((m) => (
              <li
                key={m.title}
                className="relative rounded-2xl border border-slate-200 bg-card p-5 shadow-sm dark:border-slate-800"
              >
                <span className="inline-block rounded-full bg-gradient-to-r from-sky-600 to-cyan-500 px-3 py-1 text-xs font-semibold text-white">
                  {m.period}
                </span>
                <h3 className="mt-3 text-lg font-bold text-slate-900 dark:text-white">
                  {m.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  {m.desc}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Galeri dokumentasi */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
          Dokumentasi
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {gallery.map((img) => (
            <div
              key={img.src}
              className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800"
            >
              <Image
                src={img.src}
                alt={img.alt}
                width={1024}
                height={672}
                loading="lazy"
                className="h-auto w-full object-cover"
              />
            </div>
          ))}
        </div>
        <p className="mt-6 text-center text-xs text-slate-400">
          Sumber konten &amp; foto:{" "}
          <a
            href="https://www.tunasharapan.info/official/sejarah/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-sky-600"
          >
            situs resmi sekolah
          </a>
        </p>
      </section>
    </div>
  );
}
