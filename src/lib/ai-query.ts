const PPDB_TERMS = /\b(ppdb|spmb|pendaftaran|pendaftar|mendaftar|daftar ulang)\b/i;
const PPDB_RELATED_TERMS = /\b(biaya\w*|harga\w*|tarif\w*|bayar\w*|pembayaran|spp|beasiswa|asrama|zonasi|gelombang|formulir|berkas|dokumen|rapor|rapot|akta|akte|kk|pas foto|wawancara|tes|kuota|jurusan|syarat\w*|persyaratan|daftar ulang|registrasi|nomor pendaftaran|bina lingkungan)\b/i;

const QUICK_SUGGESTION_QUESTIONS = new Set([
  "apa saja jurusan yang ada",
  "berapa biaya ppdb",
  "apa saja syarat pendaftaran",
  "bagaimana cara mendaftar",
]);

/** Starter prompts must use live model reasoning, not instantly return an old cached reply. */
export function isQuickSuggestionQuestion(text: string): boolean {
  const normalized = text
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[?.!,;:]+\s*$/g, "")
    .trim();
  return QUICK_SUGGESTION_QUESTIONS.has(normalized);
}

export function normalizePpdbTerm(text: string): string {
  return text.replace(/\bppbd\b/gi, "ppdb");
}
export function isPpdbOverviewRequest(currentQuestion: string, conversationContext = currentQuestion): boolean {
  const current = normalizePpdbTerm(currentQuestion);
  const context = normalizePpdbTerm(conversationContext);
  const mentionsPpdb = PPDB_TERMS.test(current) || PPDB_TERMS.test(context);
  const asksOverview = /\b(info|informasi|lengkap|semua|jelaskan|jelasin|apa saja|ringkasan|overview|panduan|seluruh)\b/i.test(current);
  return mentionsPpdb && asksOverview;
}
export function isPpdbQuestion(currentQuestion: string, conversationContext = currentQuestion): boolean {
  const current = normalizePpdbTerm(currentQuestion);
  const context = normalizePpdbTerm(conversationContext);
  if (PPDB_TERMS.test(current)) return true;
  if (!PPDB_TERMS.test(context) || !current.trim()) return false;
  return PPDB_RELATED_TERMS.test(current) || /\b(itu|tadi|tersebut|nya|yang pertama|yang kedua|lanjut|detailnya|rincian)\b/i.test(current);
}
export function asksPpdbApplicantCount(currentQuestion: string, conversationContext = currentQuestion): boolean {
  const current = normalizePpdbTerm(currentQuestion);
  const context = normalizePpdbTerm(conversationContext);
  if (!(PPDB_TERMS.test(current) || PPDB_TERMS.test(context))) return false;
  if (!/\b(berapa|jumlah|total|banyak|tercatat|terdaftar|sisa|tersisa|masih ada|sudah ada)\b/i.test(current)) return false;
  const mentionsApplicants = /\b(pendaftar|siswa yang daftar|orang yang daftar|yang mendaftar|siswa terdaftar|calon siswa)\b/i.test(current) ||
    (/\b(sisa|tersisa|kuota)\b/i.test(current) && /\b(kursi|kuota|pendaftar|terdaftar)\b/i.test(current));
  const contextMentionsApplicants = /\b(pendaftar|yang mendaftar|siswa terdaftar|jumlah pendaftar|sisa kursi|sisa kuota)\b/i.test(context);
  const asksFeeInstead = ["biaya", "harga", "tarif", "spp", "beasiswa"].some((term) => current.toLowerCase().includes(term));
  return mentionsApplicants || (contextMentionsApplicants && !asksFeeInstead);
}
