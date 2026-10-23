const base = (process.env.AI_EVAL_URL || "https://kitacobalagi-inception-website-sekolah-44ox.vercel.app").replace(/\/+$/, "");
const cases = [
  { name: "PPDB year safety", question: "Info PPBD 2027 dong", checks: [["source year disclosed", /2026\s*\/\s*2027/i], ["next cycle not asserted", /belum (terverifikasi|tersedia|tercantum|diketahui)|belum ada (kalender|jadwal|informasi)/i]], source: "06-ppdb.md" },
  { name: "PPDB fee details", question: "Berapa biaya PPDB?", checks: [["PP amount", /3\.500\.000/], ["SPP amount", /250\.000/], ["promo conflict", /konfirmasi|tidak konsisten|belum pasti|daftar persyaratan/i]], source: "06-ppdb.md" },
  { name: "PPDB document requirements", question: "Syarat berkas PPDB apa saja?", checks: [["rapor", /rapor/i], ["birth certificate", /akta/i], ["family card", /kartu keluarga|KK\b/i], ["3x4 photos", /pas foto|3\s*[×x]\s*4/i]], source: "06-ppdb.md" },
  { name: "all four majors", question: "Apa saja jurusan yang tersedia?", checks: [["PPLG", /\bPPLG\b/i], ["TJKT", /\bTJKT\b/i], ["DKV", /\bDKV\b/i], ["TKRO", /\bTKRO\b/i]], source: "02-jurusan.md" },
];
function parseSse(text) {
  let reply = "", sources = [], error = "";
  for (const line of text.split(/\r?\n/)) {
    if (!line.startsWith("data:")) continue;
    try {
      const event = JSON.parse(line.slice(5).trim());
      if (event.t === "token" && typeof event.v === "string") reply += event.v;
      if (event.t === "done") { if (typeof event.reply === "string") reply = event.reply; if (Array.isArray(event.sources)) sources = event.sources; }
      if (event.t === "error") error = event.message || "AI stream error";
    } catch {}
  }
  return { reply, sources, error };
}
const results = [];
for (const item of cases) {
  try {
    const response = await fetch(base + "/api/chat", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ messages: [{ role: "assistant", content: "Halo! Saya asisten informasi sekolah." }, { role: "user", content: item.question }] }),
      signal: AbortSignal.timeout(90000),
    });
    const parsed = parseSse(await response.text()), failed = [];
    if (!response.ok) failed.push("HTTP " + response.status);
    if (parsed.error) failed.push("AI error: " + parsed.error);
    if (!parsed.reply.trim()) failed.push("empty reply");
    for (const [label, pattern] of item.checks) if (!pattern.test(parsed.reply)) failed.push(label);
    if (!parsed.sources.includes(item.source)) failed.push("missing source " + item.source);
    results.push({ name: item.name, pass: failed.length === 0, wordCount: parsed.reply.trim() ? parsed.reply.trim().split(/\s+/).length : 0, sources: parsed.sources, failed, preview: parsed.reply.slice(0, 180) });
  } catch (error) { results.push({ name: item.name, pass: false, failed: [error instanceof Error ? error.message : String(error)] }); }
}
console.log(JSON.stringify({ base, passed: results.filter((r) => r.pass).length, total: results.length, results }, null, 2));
if (results.some((r) => !r.pass)) process.exitCode = 1;
