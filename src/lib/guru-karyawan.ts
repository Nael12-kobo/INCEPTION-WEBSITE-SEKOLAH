/**
 * Data guru & karyawan — foto ada di `public/guru-karyawan/`.
 *
 * Nama diambil otomatis dari nama file ("pak arif" → "Pak Arif",
 * "BIMO" → "Bimo", "hendra_p" → "Hendra P"). Kalau ada nama baru /
 * koreksi, cukup tambah/ubah entri di sini — tampilan ikut menyesuaikan.
 *
 * Catatan yang perlu diluruskan manual:
 * - `DSC_0077.jpg` & `DSC_0135.jpg` → `nama: ""` (nama asli tidak ada di
 *   file). Isi nama sebelum publikasi supaya kartunya tidak kosong.
 * - `Ahmad Munazil.jpg` == `Mistriyanto, S. Th.jpg` (isi file identik /
 *   md5 sama) — kemungkinan salah satu foto salah tempel.
 */
export type GuruKaryawan = {
  /** Path file di public, spasi/koma dibiarkan (browser & optimizer Next menanganinya) */
  src: string;
  /** Nama tampil; "" = nama belum diketahui */
  nama: string;
};

const DIR = "/guru-karyawan";

export const guruKaryawan: GuruKaryawan[] = [
  { src: `${DIR}/Ahmad Munazil.jpg`, nama: "Ahmad Munazil" },
  { src: `${DIR}/Akhmad Fajar, S. Kom.jpg`, nama: "Akhmad Fajar, S. Kom" },
  { src: `${DIR}/aris3.jpg`, nama: "Aris" },
  { src: `${DIR}/BIMO.jpg`, nama: "Bimo" },
  { src: `${DIR}/bu farah.jpg`, nama: "Bu Farah" },
  { src: `${DIR}/bu fita.jpg`, nama: "Bu Fita" },
  { src: `${DIR}/bu lia.jpg`, nama: "Bu Lia" },
  { src: `${DIR}/bu liana.jpg`, nama: "Bu Liana" },
  { src: `${DIR}/bu marhamah.jpg`, nama: "Bu Marhamah" },
  { src: `${DIR}/bu ninuk.jpg`, nama: "Bu Ninuk" },
  { src: `${DIR}/bu nuning.jpg`, nama: "Bu Nuning" },
  { src: `${DIR}/bu rini.jpg`, nama: "Bu Rini" },
  { src: `${DIR}/bu sevi.jpg`, nama: "Bu Sevi" },
  { src: `${DIR}/bu tanti.jpg`, nama: "Bu Tanti" },
  { src: `${DIR}/bu wendi.jpg`, nama: "Bu Wendi" },
  { src: `${DIR}/bu wulan.jpg`, nama: "Bu Wulan" },
  { src: `${DIR}/bu zulfa.jpg`, nama: "Bu Zulfa" },
  { src: `${DIR}/danesh.jpg`, nama: "Danesh" },
  { src: `${DIR}/gigih.jpg`, nama: "Gigih" },
  { src: `${DIR}/hendra_p.jpg`, nama: "Hendra P" },
  { src: `${DIR}/ivana.jpg`, nama: "Ivana" },
  { src: `${DIR}/joko.png`, nama: "Joko" },
  { src: `${DIR}/kukuh.jpg`, nama: "Kukuh" },
  { src: `${DIR}/listyorini.jpg`, nama: "Listyorini" },
  { src: `${DIR}/Mistriyanto, S. Th.jpg`, nama: "Mistriyanto, S. Th" },
  { src: `${DIR}/pak arif.jpg`, nama: "Pak Arif" },
  { src: `${DIR}/pak dimas.jpg`, nama: "Pak Dimas" },
  { src: `${DIR}/pak faizi.jpg`, nama: "Pak Faizi" },
  { src: `${DIR}/pak hendra ch.jpg`, nama: "Pak Hendra Ch" },
  { src: `${DIR}/pak heru.jpg`, nama: "Pak Heru" },
  { src: `${DIR}/pak kris.jpg`, nama: "Pak Kris" },
  { src: `${DIR}/pak misbah.jpg`, nama: "Pak Misbah" },
  { src: `${DIR}/pak mus.jpg`, nama: "Pak Mus" },
  { src: `${DIR}/pak nadir.jpg`, nama: "Pak Nadir" },
  { src: `${DIR}/pak rifai.jpg`, nama: "Pak Rifai" },
  { src: `${DIR}/pak septa.jpg`, nama: "Pak Septa" },
  { src: `${DIR}/pak trustha.jpg`, nama: "Pak Trustha" },
  { src: `${DIR}/pak wahyu.jpg`, nama: "Pak Wahyu" },
  { src: `${DIR}/pak wicak.jpg`, nama: "Pak Wicak" },
  { src: `${DIR}/pak zacky.jpg`, nama: "Pak Zacky" },
  { src: `${DIR}/rian.jpg`, nama: "Rian" },
  { src: `${DIR}/risty.jpg`, nama: "Risty" },
  { src: `${DIR}/rozaq.jpg`, nama: "Rozaq" },
  { src: `${DIR}/setiawan.jpg`, nama: "Setiawan" },
  { src: `${DIR}/sidiq.jpg`, nama: "Sidiq" },
  { src: `${DIR}/siti_k.jpg`, nama: "Siti K" },
  { src: `${DIR}/sulis.jpg`, nama: "Sulis" },
  { src: `${DIR}/yunika.jpg`, nama: "Yunika" },
  // Nama belum diketahui — kartu tetap tampil, caption dikosongkan.
  { src: `${DIR}/DSC_0077.jpg`, nama: "" },
  { src: `${DIR}/DSC_0135.jpg`, nama: "" },
];
