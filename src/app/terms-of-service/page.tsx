import type { Metadata } from "next";
import { LegalShell, LegalSection } from "@/components/legal/legal-shell";

export const metadata: Metadata = {
  title: "Syarat & Ketentuan — SMK Telekomunikasi Tunas Harapan",
  description:
    "Syarat dan ketentuan penggunaan situs, akun, portal akademik, PPDB, dan asisten AI SMK Telekomunikasi Tunas Harapan.",
};

const sections = [
  { id: "tentang", title: "Tentang Ketentuan Ini" },
  { id: "akun", title: "Akun & Keamanan" },
  { id: "penggunaan", title: "Penggunaan Layanan" },
  { id: "dilarang", title: "Hal yang Dilarang" },
  { id: "ai", title: "Konten & Asisten AI" },
  { id: "ppdb", title: "Pendaftaran (PPDB)" },
  { id: "kekayaan", title: "Kekayaan Intelektual" },
  { id: "pihak-ketiga", title: "Tautan Pihak Ketiga" },
  { id: "tanggung-jawab", title: "Batasan Tanggung Jawab" },
  { id: "penangguhan", title: "Penangguhan & Penghentian" },
  { id: "perubahan", title: "Perubahan Ketentuan" },
  { id: "kontak", title: "Kontak Kami" },
];

export default function TermsOfServicePage() {
  return (
    <LegalShell
      title="Syarat & Ketentuan"
      description="Ketentuan penggunaan situs SMK Telekomunikasi Tunas Harapan — mencakup akun, portal akademik, PPDB, dan asisten AI sekolah."
      updatedAt="5 Oktober 2026"
      sections={sections}
    >
      <LegalSection id="tentang" title="Tentang Ketentuan Ini">
        <p>
          Ketentuan ini mengatur penggunaan situs <strong>SMK Telekomunikasi Tunas Harapan</strong>{" "}
          beserta seluruh fiturnya. Dengan mengakses situs, membuat akun, atau mengirimkan formulir,
          Anda setuju untuk mematuhi ketentuan ini.
        </p>
        <p>
          Jika Anda tidak setuju dengan salah satu ketentuan, mohon untuk tidak menggunakan layanan
          ini.
        </p>
      </LegalSection>

      <LegalSection id="akun" title="Akun & Keamanan">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Anda dapat mendaftar menggunakan email dan kata sandi, atau melalui tombol “Lanjutkan
            dengan Google”.
          </li>
          <li>
            Anda bertanggung jawab penuh menjaga kerahasiaan kata sandi dan seluruh aktivitas yang
            terjadi di akun Anda.
          </li>
          <li>
            Segera beri tahu kami jika mencurigai adanya penggunaan akun tanpa izin, agar akun dapat
            diamankan.
          </li>
          <li>
            Satu orang satu akun. Akun dibuat untuk penggunaan pribadi dan tidak boleh dipinjamkan
            atau dijual.
          </li>
          <li>
            Data yang Anda isi saat pendaftaran harus benar. Sekolah dapat menonaktifkan akun yang
            datanya tidak dapat dipertanggungjawabkan.
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="penggunaan" title="Penggunaan Layanan">
        <p>Situs ini disediakan untuk:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Informasi publik tentang sekolah, jurusan, fasilitas, dan berita.</li>
          <li>Portal akademik bagi siswa dan guru (jadwal, nilai, materi).</li>
          <li>Pendaftaran siswa baru (PPDB) dan pendaftaran akun.</li>
          <li>Asisten AI untuk membantu menjawab pertanyaan seputar sekolah.</li>
        </ul>
        <p>
          Anda setuju menggunakan layanan sesuai hukum yang berlaku di Republik Indonesia dan norma
          yang berlaku di lingkungan pendidikan.
        </p>
      </LegalSection>

      <LegalSection id="dilarang" title="Hal yang Dilarang">
        <p>Anda dilarang untuk:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Menggunakan kata sandi atau akun orang lain.</li>
          <li>Menyuntikkan kode berbahaya, melakukan peretasan, atau mengganggu kinerja situs.</li>
          <li>Mengunggah atau mengirim konten yang SARA, kasar, menyesatkan, atau melanggar hukum.</li>
          <li>Meniru identitas orang lain atau menyamar sebagai petugas sekolah.</li>
          <li>Menggunakan situs untuk kegiatan komersial, periklanan, atau penipuan.</li>
          <li>Mengambil data dari situs secara otomatis (scraping) tanpa izin tertulis.</li>
        </ul>
      </LegalSection>

      <LegalSection id="ai" title="Konten & Asisten AI">
        <p>
          Asisten AI pada situs ini adalah layanan bantuan otomatis. Jawabannya dihasilkan oleh model
          AI dan <strong>dapat keliru atau tidak lengkap</strong>. Untuk keputusan penting (nilai,
          jadwal, pendaftaran, biaya), selalu konfirmasi ke guru atau panitia sekolah.
        </p>
        <p>
          Anda dilarang menyalahgunakan fitur chat untuk menghasilkan konten terlarang. Riwayat
          percakapan dapat disimpan untuk keamanan dan peningkatan layanan, sebagaimana dijelaskan
          dalam <a href="/privacy-policy" className="font-medium text-blue-600 hover:underline">Kebijakan Privasi</a>.
        </p>
      </LegalSection>

      <LegalSection id="ppdb" title="Pendaftaran (PPDB)">
        <ul className="list-disc space-y-2 pl-5">
          <li>Pengisian formulir PPDB tidak menjamin diterimanya calon siswa; penerimaan mengikuti ketentuan dan jadwal resmi sekolah.</li>
          <li>Data yang diisi wajib benar. Sekolah dapat membatalkan pendaftaran jika ditemukan data tidak benar.</li>
          <li>Informasi tes, daftar ulang, dan kelulusan akan disampaikan melalui kanal resmi sekolah (WhatsApp/email yang Anda daftarkan).</li>
          <li>Biaya pendaftaran dan ketentuan lain mengikuti pengumuman resmi yang berlaku untuk tahun ajaran tersebut.</li>
        </ul>
      </LegalSection>

      <LegalSection id="kekayaan" title="Kekayaan Intelektual">
        <p>
          Seluruh konten situs — teks, foto, logo, video, desain, dan materi pembelajaran — menjadi
          milik SMK Telekomunikasi Tunas Harapan atau pihak yang memberikan lisensinya.
        </p>
        <p>
          Anda boleh membagikan tautan halaman untuk keperluan non-komersial, tetapi dilarang
          menyalin, memodifikasi, atau menggunakan ulang konten tanpa izin tertulis.
        </p>
      </LegalSection>

      <LegalSection id="pihak-ketiga" title="Tautan Pihak Ketiga">
        <p>
          Situs dapat memuat tautan ke layanan lain (media sosial, platform video, layanan pihak
          ketiga). Tautan tersebut disediakan untuk kenyamanan dan berada di luar kendali kami, sehingga
          kebijakan dan ketentuan masing-masing pihak yang berlaku.
        </p>
      </LegalSection>

      <LegalSection id="tanggung-jawab" title="Batasan Tanggung Jawab">
        <p>
          Layanan disediakan “sebagaimana adanya”. Sejauh diizinkan oleh hukum, sekolah tidak bertanggung
          jawab atas:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Kerugian akibat gangguan, keterlambatan, atau ketidakakuratan informasi di situs.</li>
          <li>Kehilangan data akibat penyalahgunaan akun oleh pihak yang mengetahui kata sandi Anda.</li>
          <li>Kerusakan yang timbul akibat penyalahgunaan jawaban asisten AI tanpa verifikasi.</li>
          <li>Layanan pihak ketiga yang tidak dapat diakses (jaringan, penyedia OAuth, dsb).</li>
        </ul>
      </LegalSection>

      <LegalSection id="penangguhan" title="Penangguhan & Penghentian">
        <p>
          Sekolah dapat membatasi, menangguhkan, atau menghapus akun yang melanggar ketentuan ini,
          membahayakan keamanan sistem, atau terbukti menyampaikan data palsu — tanpa pemberitahuan
          terlebih dahulu jika dianggap mendesak.
        </p>
        <p>
          Anda dapat meminta penutupan akun kapan saja melalui kontak di bawah ini, dan kami akan
          menindaklanjuti sesuai ketentuan yang berlaku.
        </p>
      </LegalSection>

      <LegalSection id="perubahan" title="Perubahan Ketentuan">
        <p>
          Ketentuan ini dapat diperbarui sewaktu-waktu. Tanggal pembaruan tercantum di bagian atas
          halaman. Penggunaan lanjutan setelah perubahan berarti Anda menerima versi terbaru.
        </p>
      </LegalSection>

      <LegalSection id="kontak" title="Kontak Kami">
        <p>Pertanyaan mengenai ketentuan ini dapat disampaikan ke:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Email: <strong>info@smktunasharapan.sch.id</strong></li>
          <li>Telepon: <strong>(021) 555-0126</strong></li>
          <li>Alamat: <strong>Jl. Telekomunikasi No. 1, Tunas Harapan</strong></li>
        </ul>
        <p>
          Keburukan data pribadi dibahas terpisah di{" "}
          <a href="/privacy-policy" className="font-medium text-blue-600 hover:underline">
            Kebijakan Privasi
          </a>.
        </p>
      </LegalSection>
    </LegalShell>
  );
}
