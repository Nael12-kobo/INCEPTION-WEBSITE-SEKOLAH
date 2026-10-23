import assert from "node:assert/strict";
import test from "node:test";
import { asksPpdbApplicantCount, isPpdbOverviewRequest, isPpdbQuestion, normalizePpdbTerm } from "../src/lib/ai-query.ts";
import { expandKnowledgeQuery, getKnowledgeContext, normalizeKnowledgeQuery, pickRelevantTopics } from "../src/lib/knowledge.ts";
test("normalizes the common PPBD typo", () => {
  assert.equal(normalizePpdbTerm("Info PPBD 2027 dong"), "Info ppdb 2027 dong");
  assert.equal(normalizeKnowledgeQuery(" Di MANA sekolahnya? "), "di mana sekolahnya");
});
test("overview mode uses the current question, not earlier turns", () => {
  assert.equal(isPpdbOverviewRequest("Info PPBD 2027 dong"), true);
  assert.equal(isPpdbOverviewRequest("Biayanya berapa?", "Info PPDB 2027 dong Biayanya berapa?"), false);
  assert.equal(isPpdbOverviewRequest("Jelaskan lengkap dong", "Info PPDB sebelumnya"), true);
});
test("PPDB retrieval carries short followups", () => {
  assert.equal(isPpdbQuestion("Biayanya berapa?", "Info PPDB biaya dan syarat"), true);
  assert.equal(isPpdbQuestion("Bagaimana cara membuat gambar?", "Halo apa kabar"), false);
});
test("live counter intent excludes fee questions", () => {
  assert.equal(asksPpdbApplicantCount("Berapa jumlah pendaftar PPDB?", "Berapa jumlah pendaftar PPDB?"), true);
  assert.equal(asksPpdbApplicantCount("Berapa sisa kuota PPDB?", "Berapa sisa kuota PPDB?"), true);
  assert.equal(asksPpdbApplicantCount("Berapa biaya PPDB?", "Berapa biaya PPDB?"), false);
  assert.equal(asksPpdbApplicantCount("Berapa biaya PPDB?", "Sebelumnya tanya jumlah pendaftar PPDB"), false);
  assert.equal(asksPpdbApplicantCount("Jumlahnya berapa?", "PPDB dan jumlah pendaftar saat ini"), true);
});
test("fee synonyms retrieve PPDB knowledge", () => {
  assert.match(expandKnowledgeQuery("Berapa biaya masuk sekolah?"), /biaya pendidikan/);
  assert.ok(pickRelevantTopics("Berapa biaya masuk sekolah?").files.includes("06-ppdb.md"));
});
test("location synonyms retrieve official contacts", () => assert.ok(pickRelevantTopics("Di mana alamat sekolah dan nomor WA?").files.includes("07-kontak.md")));
test("career synonyms retrieve majors", () => assert.ok(pickRelevantTopics("Saya tertarik coding dan membuat aplikasi").files.includes("02-jurusan.md")));
test("source list only includes documents actually placed in context", () => {
  const result = getKnowledgeContext("info ppdb", { maxFiles: 3, maxCharsPerFile: 10500, maxTotalChars: 14000, includeFiles: ["06-ppdb.md", "08-berita.md", "07-kontak.md"] });
  assert.ok(result.context.includes("2026/2027"));
  assert.ok(result.files.includes("06-ppdb.md"));
  assert.ok(result.files.every((file) => result.context.includes("Sumber: knowledge/" + file)));
  assert.deepEqual(new Set(result.files), new Set(["06-ppdb.md", "08-berita.md", "07-kontak.md"]));
});
