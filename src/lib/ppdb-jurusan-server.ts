/**
 * Pilihan jurusan PPDB yang tersedia. Empat kode lama dipertahankan agar
 * pendaftaran historis tetap cocok; jurusan baru mengikuti kode URL DB.
 */
import { JURUSAN_OPTIONS, type PpdbJurusanOption } from "@/lib/ppdb";
import { getJurusanAktif } from "@/lib/jurusan-server";

export async function getPpdbJurusanOptions(): Promise<PpdbJurusanOption[]> {
  const current = await getJurusanAktif();
  // Nilai lama dipertahankan agar pendaftaran/histori lama tetap valid
  // (mis. TKRO masih dikirim sebagai "TKR"), tetapi label dan deskripsinya
  // mengikuti konten jurusan yang bisa diedit admin.
  const kodeBawaanPerValue: Record<string, string> = {
    DKV: "DKV",
    PPLG: "PPLG",
    TJKT: "TJKT",
    TKR: "TKRO",
  };
  const bawaan = JURUSAN_OPTIONS.flatMap((option) => {
    const jurusan = current.find(
      (item) =>
        item.bawaan && item.kode === kodeBawaanPerValue[option.value],
    );
    return jurusan
      ? [{ ...option, nama: jurusan.nama, deskripsi: jurusan.deskripsi }]
      : [];
  });
  const existing = new Set<string>(bawaan.map((item) => item.value));
  const tambahan = current
    .filter((item) => !item.bawaan)
    .map((item) => ({
      value: item.kode.toUpperCase(),
      kode: item.singkatan,
      nama: item.nama,
      deskripsi: item.deskripsi,
    }))
    .filter((item) => !existing.has(item.value));
  return [...bawaan, ...tambahan];
}
