const ACRONYM_PRONUNCIATIONS: Record<string, string> = {
  TJKT: "te je ka te",
  PPLG: "pe pe el ge",
  DKV: "de ka ve",
  TKR: "te ka er",
  SMK: "es em ka",
  PPDB: "pe pe de be",
  AI: "a i",
  API: "a pi i",
  UI: "u i",
  VRM: "vi ar em",
  URL: "u er el",
  HTML: "ha te em el",
};

const WORD_PRONUNCIATIONS: Array<[RegExp, string]> = [
  [/\bwebsite\b/gi, "situs web"],
  [/\bonline\b/gi, "daring"],
  [/\bgame\b/gi, "gim"],
  [/\bsoftware\b/gi, "sofwer"],
  [/\bhardware\b/gi, "hardwer"],
  [/\bstreaming\b/gi, "striming"],
  [/\bbrowser\b/gi, "brauser"],
  [/\blogin\b/gi, "lokin"],
  [/\blogout\b/gi, "lokaut"],
  [/\bfrontend\b/gi, "front end"],
  [/\bbackend\b/gi, "bek end"],
];

const SMALL_NUMBERS = [
  "nol", "satu", "dua", "tiga", "empat", "lima", "enam", "tujuh", "delapan",
  "sembilan", "sepuluh", "sebelas", "dua belas", "tiga belas", "empat belas",
  "lima belas", "enam belas", "tujuh belas", "delapan belas", "sembilan belas",
];

function spellSmallNumber(value: number): string {
  if (value < 20) return SMALL_NUMBERS[value];
  const tens = Math.floor(value / 10);
  const ones = value % 10;
  return SMALL_NUMBERS[tens] + " puluh" + (ones ? " " + SMALL_NUMBERS[ones] : "");
}

function spellYear(year: number): string {
  if (year >= 2000 && year < 2100) {
    return ("dua ribu" + (year === 2000 ? "" : " " + spellSmallNumber(year - 2000))).trim();
  }
  if (year >= 1900 && year < 2000) {
    return ("seribu sembilan ratus" + (year === 1900 ? "" : " " + spellSmallNumber(year - 1900))).trim();
  }
  return String(year);
}

function normalizeYearMatch(match: string): string {
  const parts = match.split(/\s*[\/–-]\s*/);
  if (parts.length !== 2) return match;
  const a = Number(parts[0]);
  const b = Number(parts[1]);
  if (!Number.isInteger(a) || !Number.isInteger(b)) return match;
  return spellYear(a) + " sampai " + spellYear(b);
}

export function normalizeForSpeech(input: string): string {
  let text = input
    .normalize("NFKC")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/https?:\/\/\S+/gi, " ")
    .replace(/\x60([^\x60]+)\x60/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/^#{1,6}\s*/gm, "")
    .replace(/\b(?:19|20)\d{2}\s*[\/–-]\s*(?:19|20)\d{2}\b/g, normalizeYearMatch)
    .replace(/\b(?:19|20)\d{2}\b/g, (m) => spellYear(Number(m)))
    .replace(/\s+/g, " ")
    .trim();

  for (const [key, pronunciation] of Object.entries(ACRONYM_PRONUNCIATIONS)) {
    text = text.replace(new RegExp("\\b" + key + "\\b", "gi"), pronunciation);
  }

  for (const [pattern, pronunciation] of WORD_PRONUNCIATIONS) {
    text = text.replace(pattern, pronunciation);
  }

  return text
    .replace(/\s*\/\s*/g, " atau ")
    .replace(/\s*:\s*/g, ": ")
    .replace(/\s+/g, " ")
    .trim();
}
