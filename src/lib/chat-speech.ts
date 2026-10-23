/**
 * Create a concise, relevant spoken lead from a chat answer.
 * The text bubble remains complete; TTS only reads the lead for long replies.
 */
function stripChatMarkdown(text: string): string {
  return text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/https?:\/\/\S+/gi, "")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^#{1,6}\s*/gm, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/^\s*[-*•]+\s*/gm, "")
    .replace(/^\s*\d+[.)]\s*/gm, "")
    .replace(/\s+/g, " ")
    .trim();
}

function firstLeadSegment(text: string): string {
  return text.match(/^.{1,220}?(?:(?<!Rp)[.!?]|:)(?=\s|$)/u)?.[0]?.trim() ?? "";
}

export function getSpeechText(text: string): string {
  const fullText = text.trim();
  if (!fullText) return "";

  const plainText = stripChatMarkdown(fullText);
  if (!plainText) return "";

  // Jawaban pendek masih dibacakan lengkap, tetapi Markdown tidak ikut dibaca.
  if (plainText.length <= 260) return plainText;

  // Jangan memakai pembuka TTS generik hanya karena jawabannya bersumber dari PPDB.
  // Ambil pembuka jawaban yang benar-benar relevan dengan pertanyaan pengguna.
  const first = firstLeadSegment(plainText);
  if (!first) {
    const shortLead = plainText.slice(0, 150).replace(/\s+\S*$/, "").trim();
    return shortLead
      ? shortLead + ". Rincian lengkapnya bisa dibaca pada jawaban di layar."
      : "Rincian lengkapnya bisa dibaca pada jawaban di layar.";
  }

  let lead = first;
  // Bila pembuka hanya "Ada, ya." atau sejenisnya, sertakan kalimat berikut agar
  // audio tetap menjawab inti pertanyaan dan tidak terdengar menggantung.
  if (first.length < 55) {
    const remainder = plainText.slice(first.length).trim();
    const second = firstLeadSegment(remainder);
    if (second && (first.length + second.length + 1) <= 220) {
      lead = first + " " + second;
    }
  }

  return lead + " Rincian lengkapnya bisa dibaca pada jawaban di layar.";
}
