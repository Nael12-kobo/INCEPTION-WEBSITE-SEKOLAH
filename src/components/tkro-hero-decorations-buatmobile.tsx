"use client";

import { useEffect } from "react";

// Gear definitions: size, position, rotation speed, tooth count
// Mobile: gear dikecilkan dan di-bleed ke sudut supaya masih terbaca di
// layar 360px (ukuran lama 250/450/150px lebih lebar dari viewport).
const gears: {
  size: number;
  top: string;
  left?: string;
  right?: string;
  duration: number;
  delay: number;
  direction: "normal" | "reverse";
  teeth: number;
}[] = [
  { size: 200, top: "-6%",  left: "-10%",  duration: 15, delay: 0,    direction: "normal",  teeth: 16 },
  { size: 260, top: "46%",  right: "-12%", duration: 20, delay: 0,    direction: "normal",  teeth: 12 },
  { size: 130, top: "4%",   right: "-6%",  duration: 15, delay: 0,    direction: "normal",  teeth: 15 },
];

// Render a gear SVG with teeth
function GearShape({ gear }: { gear: (typeof gears)[0] }) {
  const pos: React.CSSProperties = { top: gear.top };
  if ("left" in gear) pos.left = gear.left;
  if ("right" in gear) pos.right = gear.right;

  const teeth = gear.teeth;
  const r = gear.size / 2;
  const innerR = r * 0.65;
  const toothHeight = r * 0.2;
  const cx = gear.size / 2;
  const cy = gear.size / 2;

  // Build gear path with teeth
  const points: string[] = [];
  for (let i = 0; i < teeth; i++) {
    const angle1 = (i / teeth) * Math.PI * 2;
    const angle2 = ((i + 0.35) / teeth) * Math.PI * 2;
    const angle3 = ((i + 0.65) / teeth) * Math.PI * 2;
    const angle4 = ((i + 1) / teeth) * Math.PI * 2;

    // Inner point
    points.push(
      `${(cx + innerR * Math.cos(angle1)).toFixed(3)},${(cy + innerR * Math.sin(angle1)).toFixed(3)}`
    );
    // Tooth rise
    points.push(
      `${(cx + (innerR + toothHeight) * Math.cos(angle2)).toFixed(3)},${(cy + (innerR + toothHeight) * Math.sin(angle2)).toFixed(3)}`
    );
    // Tooth top
    points.push(
      `${(cx + (innerR + toothHeight) * Math.cos(angle3)).toFixed(3)},${(cy + (innerR + toothHeight) * Math.sin(angle3)).toFixed(3)}`
    );
    // Tooth fall
    points.push(
      `${(cx + innerR * Math.cos(angle4)).toFixed(3)},${(cy + innerR * Math.sin(angle4)).toFixed(3)}`
    );
  }

  return (
    <div
      className="absolute md:hidden opacity-[0.07]"
      style={{
        ...pos,
        width: gear.size,
        height: gear.size,
        animation: `tkro-spin ${gear.duration}s linear ${gear.delay}s infinite ${gear.direction}`,
      }}
    >
      <svg
        viewBox={`0 0 ${gear.size} ${gear.size}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <polygon
          points={points.join(" ")}
          fill="white"
        />
        {/* Center hole */}
        <circle cx={cx} cy={cy} r={innerR * 0.4} fill="rgba(0,0,0,0.3)" />
        {/* Spokes */}
        {[0, 1, 2, 3].map((s) => {
          const a = (s / 4) * Math.PI * 2;
          return (
            <line
              key={s}
              x1={cx + innerR * 0.15 * Math.cos(a)}
              y1={cy + innerR * 0.15 * Math.sin(a)}
              x2={cx + innerR * 0.55 * Math.cos(a)}
              y2={cy + innerR * 0.55 * Math.sin(a)}
              stroke="white"
              strokeWidth={2.5}
              opacity={0.5}
            />
          );
        })}
      </svg>
    </div>
  );
}

export default function TKROHeroDecorations() {
  useEffect(() => {
    // Id unik per varian (desktop/mobile keduanya di-mount bersamaan) — id
    // kembar membuat race "siapa yang unmount menghapus style" (#11).
    const id = "tkro-hero-animations-mobile";
    if (document.getElementById(id)) return;

    const style = document.createElement("style");
    style.id = id;
    style.textContent = `
      @keyframes tkro-spin {
        0%   { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
    return () => {
      const el = document.getElementById(id);
      if (el) el.remove();
    };
  }, []);

  return (
    <div className="absolute md:hidden inset-0 overflow-hidden pointer-events-none">
      {/* Gears */}
      {gears.map((gear, i) => (
        <GearShape key={`gear-${i}`} gear={gear} />
      ))}
    </div>
  );
}
