/**
 * Metadata label + halaman tujuan untuk file knowledge yang dikutip AI.
 * Dipisah dari `lib/knowledge.ts` karena file itu memakai `node:fs`
 * (server-only) dan tidak boleh masuk bundle komponen client.
 */
export const SOURCE_META: Record<string, { label: string; href: string }> = {
  "01-profil-sekolah.md": { label: "Profil Sekolah", href: "/" },
  "09-sejarah.md": { label: "Sejarah Sekolah", href: "/sejarah" },
  "02-jurusan.md": { label: "Info Jurusan", href: "/jurusan" },
  "03-fasilitas.md": { label: "Fasilitas Sekolah", href: "/" },
  "04-prestasi.md": { label: "Prestasi", href: "/" },
  "05-kegiatan.md": { label: "Kegiatan", href: "/" },
  "06-ppdb.md": { label: "Info PPDB", href: "/ppdb" },
  "07-kontak.md": { label: "Kontak Sekolah", href: "/ppdb" },
  "08-berita.md": { label: "Berita", href: "/" },
};
