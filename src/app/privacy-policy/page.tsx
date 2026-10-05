import type { Metadata } from "next";
import { LegalShell, LegalSection } from "@/components/legal/legal-shell";

export const metadata: Metadata = {
  title: "Kebijakan Privasi — SMK Telekomunikasi Tunas Harapan",
  description:
    "Kebijakan privasi situs SMK Telekomunikasi Tunas Harapan: data yang dikumpulkan, tujuan penggunaan, penyimpanan, dan hak Anda atas data pribadi.",
};

const sections = [
  { id: "tentang", title: "Tentang Kebijakan Ini" },
  { id: "data", title: "Data yang Kami Kumpulkan" },
  { id: "tujuan", title: "Tujuan Penggunaan Data" },
  { id: "login-google", title: "Masuk dengan Akun Google" },
  { id: "cookie", title: "Cookie & Sesi" },
  { id: "penyimpanan", title: "Penyimpanan & Keamanan" },
  { id: "pihak-ketiga", title: "Berbagi Data" },
  { id: "hak", title: "Hak Anda" },
  { id: "anak", title: "Data Siswa & Anak" },
  { id: "perubahan", title: "Perubahan Kebijakan" },
  { id: "kontak", title: "Kontak Kami" },
];

export default function PrivacyPolicyPage() {
  return (
    <LegalShell
      title="Kebijakan Privasi"
      description="Kami menghargai privasi siswa, orang tua, guru, dan pengunjung situs ini. Halaman ini menjelaskan data apa yang kami kumpulkan, mengapa dikumpulkan, dan bagaimana kami melindunginya."
      updatedAt="5 Oktober 2026"
      sections={sections}
    >
      <LegalSection id="tentang" title="Tentang Kebijakan Ini">
        <p>
          Kebijakan ini berlaku untuk situs <strong>SMK Telekomunikasi Tunas Harapan</strong> beserta
          fitur di dalamnya: portal akademik, pendaftaran siswa baru (PPDB), pendaftaran akun, chatbot
          asisten sekolah, dan halaman profil sekolah.
        </p>
        <p>
          Dengan membuat akun atau mengirimkan formulir melalui situs ini, Anda dianggap telah membaca
          dan menyetujui kebijakan ini. Jika Anda belum berusia 18 tahun, persetujuan juga diberikan
          oleh orang tua atau wali Anda.
        </p>
      </LegalSection>

      <LegalSection id="data" title="Data yang Kami Kumpulkan">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Data akun:</strong> nama, alamat email, foto profil, dan (untuk pendaftaran
            manual) kata sandi yang disimpan dalam bentuk ter-hash — tidak pernah disimpan dalam bentuk
            aslinya.
          </li>
          <li>
            <strong>Data pendaftaran PPDB:</strong> nama calon siswa, NISN, asal sekolah, nilai,
            data orang tua/wali, nomor WhatsApp, dan minat jurusan yang Anda isi di formulir.
          </li>
          <li>
            <strong>Data percakapan:</strong> pesan yang Anda kirim ke asisten AI sekolah, agar
            riwayat percakapan dapat dilanjutkan dan kualitas layanan dapat ditingkatkan.
          </li>
          <li>
            <strong>Data teknis:</strong> alamat IP, jenis perangkat/peramban, halaman yang dikunjungi,
            dan waktu akses yang tercatat otomatis untuk keamanan sistem.
          </li>
          <li>
            <strong>Catatan aktivitas (log):</strong> riwayat login dan perubahan data penting,
            disimpan untuk mencegah penyalahgunaan akun.
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="tujuan" title="Tujuan Penggunaan Data">
        <ul className="list-disc space-y-2 pl-5">
          <li>Menyediakan dan mengelola akun (login, pemulihan kata sandi, pengaturan profil).</li>
          <li>Memproses pendaftaran siswa baru dan menghubungi calon siswa terkait jadwal tes/daftar ulang.</li>
          <li>Menampilkan jadwal, nilai, materi, dan informasi akademik sesuai peran pengguna.</li>
          <li>Menjaga keamanan situs, mencegah login ilegal, dan menyiapkan catatan audit.</li>
          <li>Meningkatkan kualitas layanan dan isi konten situs.</li>
        </ul>
        <p>
          Kami <strong>tidak menjual, menyewakan, atau memperdagangkan</strong> data pribadi Anda kepada
          pihak mana pun.
        </p>
      </LegalSection>

      <LegalSection id="login-google" title="Masuk dengan Akun Google">
        <p>
          Situs ini menyediakan tombol “Lanjutkan dengan Google”. Saat Anda menggunakannya, proses
          autentikasi dilakukan oleh Google (OAuth 2.0) dan kami hanya menerima data minimum berikut:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Nama tampilan</li>
          <li>Alamat email</li>
          <li>Foto profil</li>
        </ul>
        <p>
          Kami <strong>tidak pernah</strong> melihat, menerima, atau menyimpan kata sandi Google Anda,
          dan tidak meminta akses ke akun Google Anda selain untuk identifikasi login. Anda dapat
          mencabut izin tersebut kapan saja melalui <strong>Akun Google → Aplikasi pihak ketiga</strong>.
        </p>
      </LegalSection>

      <LegalSection id="cookie" title="Cookie & Sesi">
        <p>
          Situs ini menggunakan cookie sesi (dibuat oleh Auth.js) untuk mempertahankan status login
          Anda dan melindungi formulir dari pengiriman yang tidak sah (CSRF). Cookie tersebut hanya
          berisi penanda sesi, bukan kata sandi.
        </p>
        <p>
          Anda dapat menghapus cookie atau memblokirnya melalui pengaturan peramban, namun sebagian
          fitur (seperti login) tidak akan berfungsi tanpanya.
        </p>
      </LegalSection>

      <LegalSection id="penyimpanan" title="Penyimpanan & Keamanan Data">
        <p>
          Data disimpan pada basis data PostgreSQL yang dikelola di infrastruktur awan, dan situs
          dijalankan di platform hosting terpercaya. Beberapa penegakan keamanan yang kami terapkan:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Kata sandi disimpan sebagai hash (bcrypt), bukan teks biasa.</li>
          <li>Koneksi data menggunakan enkripsi (TLS/SSL).</li>
          <li>Akses ke data dibatasi berdasarkan peran (siswa, guru, administrator).</li>
          <li>Catatan audit dicatat untuk aktivitas login dan perubahan data penting.</li>
        </ul>
        <p>
          Tidak ada sistem yang 100% bebas risiko. Jika terjadi insiden yang memengaruhi data
          pribadi Anda, kami akan memberitahukan pihak yang terdampak selambat-lambatnya sesuai
          ketentuan perundang-undangan yang berlaku.
        </p>
      </LegalSection>

      <LegalSection id="pihak-ketiga" title="Berbagi Data dengan Pihak Ketiga">
        <p>Data hanya dibagikan sejauh diperlukan untuk menjalankan layanan:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li><strong>Google & GitHub</strong> — untuk autentikasi login.</li>
          <li><strong>Penyedia basis data awan</strong> — menyimpan data aplikasi.</li>
          <li><strong>Penyedia hosting</strong> — menjalankan situs.</li>
          <li>
            <strong>Layanan email</strong> — mengirim email terkait akun (verifikasi, pemulihan kata
            sandi).
          </li>
          <li>
            <strong>Layanan pesan WhatsApp</strong> — hanya untuk notifikasi PPDB ke nomor yang Anda
            isi sendiri.
          </li>
          <li>
            <strong>Layanan AI</strong> — memproses teks pesan chatbot untuk menghasilkan jawaban;
            data tidak digunakan untuk identifikasi Anda.
          </li>
        </ul>
        <p>
          Kami dapat mengunggah data jika diwajibkan oleh hukum, perintah pengadilan, atau
          permintaan resmi instansi berwenang.
        </p>
      </LegalSection>

      <LegalSection id="hak" title="Hak Anda">
        <p>Anda berhak untuk:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Memperbarui nama, foto, dan kata sandi melalui halaman pengaturan akun.</li>
          <li>Meminta salinan data pribadi yang kami simpan tentang Anda.</li>
          <li>Meminta koreksi data yang tidak akurat.</li>
          <li>Meminta penghapusan akun dan data terkait, kecuali data yang wajib disimpan (mis. catatan audit) untuk mematuhi ketentuan hukum.</li>
        </ul>
        <p>
          Ajukan permintaan ke kontak di bagian bawah halaman ini. Kami akan menindaklanjuti dalam
          waktu wajar dan dapat meminta verifikasi identitas terlebih dahulu.
        </p>
      </LegalSection>

      <LegalSection id="anak" title="Data Siswa & Anak">
        <p>
          Sebagian pengguna adalah siswa yang belum dewasa. Kami hanya mengumpulkan data yang benar-
          benar diperlukan untuk kegiatan akademik dan pendaftaran. Data siswa tidak dipublikasikan
          dan tidak digunakan untuk tujuan promosi tanpa izin orang tua/wali.
        </p>
        <p>
          Orang tua atau wali dapat meminta akses maupun penghapusan data siswa melalui kontak sekolah.
        </p>
      </LegalSection>

      <LegalSection id="perubahan" title="Perubahan Kebijakan">
        <p>
          Kebijakan ini dapat diperbarui sewaktu-waktu, misalnya saat ada fitur baru atau perubahan
          ketentuan perundang-undangan. Tanggal pembaruan selalu dicantumkan di bagian atas halaman.
          Perubahan yang signifikan akan diumumkan melalui situs ini.
        </p>
      </LegalSection>

      <LegalSection id="kontak" title="Kontak Kami">
        <p>Pertanyaan, permintaan data, atau keluhan privasi dapat disampaikan ke:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Email: <strong>info@smktunasharapan.sch.id</strong></li>
          <li>Telepon: <strong>(021) 555-0126</strong></li>
          <li>Alamat: <strong>Jl. Telekomunikasi No. 1, Tunas Harapan</strong></li>
        </ul>
      </LegalSection>
    </LegalShell>
  );
}
