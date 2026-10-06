"use client";

import { useEffect, useState, useCallback } from "react";

// Seeded PRNG (mulberry32) — deterministic, same on server & client
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const seededRand = mulberry32(42);

// Pick a random integer [0, max) using Math.random (client-only, inside state init)
function randomIndex(max: number) {
  return Math.floor(Math.random() * max);
}

// All code snippets
const codeSnippets = [
  { code: 'const app = new Next();', lang: "ts" },
  { code: 'fn main() { println!("Hello"); }', lang: "rs" },
  { code: '<div className="flex">', lang: "tsx" },
  { code: 'SELECT * FROM siswa;', lang: "sql" },
  { code: 'export default function Hero() {}', lang: "ts" },
  { code: 'async function fetchData() {', lang: "ts" },
  { code: 'Console.WriteLine("Aku bangga jadi PPLG");', lang: "cs" },
  { code: '<title>Website PPLG</title>', lang: "html" },
  { code: 'console.log("Proud to be PPLG!");', lang: "js" },
  { code: 'if (failed) { retry(); }', lang: "cs" },
  { code: 'import React from "react";', lang: "ts" },
  { code: 'git commit -m "feat: auth"', lang: "sh" },
  { code: 'interface User { id: number }', lang: "ts" },
  { code: 'useEffect(() => {}, []);', lang: "tsx" },
  { code: 'git push origin main', lang: "sh" },
  { code: 'return res.status(200).json({', lang: "ts" },
  { code: '<Button onClick={handleSubmit}>', lang: "tsx" },
  { code: 'npm install tailwindcss', lang: "sh" },
  { code: 'npm run dev', lang: "sh" },
  { code: 'npm run build', lang: "sh" },
];

const TOTAL_SNIPPETS = codeSnippets.length;

// Card layout config (positions, rotation, animation timing)
// Mobile: posisi disusun agar kartu (maks 62vw) tidak terpotong tepi layar
// 360px dan tidak tertutup logo hero di bawah (rentang ~62%-94% tinggi hero).
const codeCards = [
  { left: "2%", top: "2%",  rotate: 4,  duration: 15,   delay: 1.2 },
  { right: "2%", top: "20%", rotate: 2, duration: 13.5, delay: 0.6 },
  { left: "36%", top: "40%", rotate: 5,  duration: 14.5, delay: 1.8 },
];

// Typewriter: types text, pauses, deletes, then calls onCycleDone
function TypewriterText({ text, onCycleDone }: { text: string; onCycleDone: () => void }) {
  const [displayed, setDisplayed] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    if (!isDeleting && displayed.length < text.length) {
      timeout = setTimeout(() => {
        setDisplayed(text.slice(0, displayed.length + 1));
      }, 105 + Math.random() * 35);
    } else if (!isDeleting && displayed.length === text.length) {
      // Pause after typing complete
      timeout = setTimeout(() => setIsDeleting(true), 2200);
    } else if (isDeleting && displayed.length > 0) {
      timeout = setTimeout(() => {
        setDisplayed(text.slice(0, displayed.length - 1));
      }, 30);
    } else if (isDeleting && displayed.length === 0) {
      setIsDeleting(false);
      onCycleDone();
    }

    return () => clearTimeout(timeout);
  }, [displayed, isDeleting, text, onCycleDone]);

  return (
    <span>
      {displayed}
      <span className="inline-block w-[2px] h-[1.1em] bg-rose-300 ml-[1px] align-text-bottom animate-pulse" />
    </span>
  );
}

// Individual code card — picks random snippet, re-randomizes after each cycle
function CodeCard({ style, animation }: { style: React.CSSProperties; animation: string }) {
  const [snippetIdx, setSnippetIdx] = useState(() => randomIndex(TOTAL_SNIPPETS));

  const handleCycleDone = useCallback(() => {
    let next = randomIndex(TOTAL_SNIPPETS);
    // Avoid picking the same snippet twice in a row
    if (TOTAL_SNIPPETS > 1) {
      while (next === snippetIdx) {
        next = randomIndex(TOTAL_SNIPPETS);
      }
    }
    setSnippetIdx(next);
  }, [snippetIdx]);

  const snippet = codeSnippets[snippetIdx];

  return (
    <div
      className="absolute md:hidden pointer-events-none"
      style={{ ...style, animation }}
    >
      <div className="bg-black/40 backdrop-blur-md rounded-lg border border-white/10 px-4 py-2.5 shadow-xl max-w-[min(250px,62vw)]">
        {/* Window dots */}
        <div className="flex items-center gap-1.5 mb-2">
          <span className="w-3 h-3 rounded-full bg-red-400/80" />
          <span className="w-3 h-3 rounded-full bg-yellow-400/80" />
          <span className="w-3 h-3 rounded-full bg-green-400/80" />
          <span className="ml-2 text-[15px] text-white/30 font-mono uppercase">
            {snippet.lang}
          </span>
        </div>
        {/* Code with typewriter */}
        <code className="text-xs font-mono text-white/80 leading-relaxed">
          <TypewriterText key={`${snippetIdx}-${snippet.code}`} text={snippet.code} onCycleDone={handleCycleDone} />
        </code>
      </div>
    </div>
  );
}

export default function PPLGHeroDecorations() {
  // Inject keyframes once on mount
  useEffect(() => {
    const id = "pplg-hero-decorations";
    if (document.getElementById(id)) return;

    const style = document.createElement("style");
    style.id = id;
    style.textContent = `
      @keyframes pplg-float {
        0%, 100% { transform: translateY(0px) rotate(var(--cr, 0deg)); }
        50%      { transform: translateY(-16px) rotate(var(--cr, 0deg)); }
      }
    `;
    document.head.appendChild(style);
    return () => {
      const el = document.getElementById(id);
      if (el) el.remove();
    };
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {codeCards.map((card, i) => {
        const pos: React.CSSProperties = {};
        if ("left" in card) pos.left = card.left;
        if ("right" in card) pos.right = card.right;
        if ("top" in card) pos.top = card.top;
        return (
          <CodeCard
            key={i}
            style={{
              ...pos,
              "--cr": `${card.rotate}deg`,
            } as React.CSSProperties}
            animation={`pplg-float ${card.duration}s ease-in-out ${card.delay}s infinite`}
          />
        );
      })}
    </div>
  );
}
