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

// Piston animations
const pistons: {
  top: string;
  left?: string;
  right?: string;
  width: number;
  height: number;
  duration: number;
  delay: number;
}[] = [
  //{ top: "20%", right: "25%", width: 14, height: 60, duration: 2, delay: 0 },

];

// Hexagonal bolt shapes
const bolts: {
  size: number;
  top: string;
  left?: string;
  right?: string;
  duration: number;
  delay: number;
}[] = [
  //{ size: 18, top: "12%", left: "20%",  duration: 10, delay: 0.2 },
];

// Tachometer arc shapes
const tachometerArcs: {
  size: number;
  top: string;
  left?: string;
  right?: string;
  duration: number;
  delay: number;
}[] = [
  //{ size: 290,  top: "3%",  left: "45%", duration: 25, delay: 0 },
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
      `${cx + innerR * Math.cos(angle1)},${cy + innerR * Math.sin(angle1)}`
    );
    // Tooth rise
    points.push(
      `${cx + (innerR + toothHeight) * Math.cos(angle2)},${cy + (innerR + toothHeight) * Math.sin(angle2)}`
    );
    // Tooth top
    points.push(
      `${cx + (innerR + toothHeight) * Math.cos(angle3)},${cy + (innerR + toothHeight) * Math.sin(angle3)}`
    );
    // Tooth fall
    points.push(
      `${cx + innerR * Math.cos(angle4)},${cy + innerR * Math.sin(angle4)}`
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

// Piston assembly
function Piston({ piston }: { piston: (typeof pistons)[0] }) {
  const pos: React.CSSProperties = { top: piston.top };
  if ("left" in piston) pos.left = piston.left;
  if ("right" in piston) pos.right = piston.right;

  return (
    <div
      className="absolute md:hidden opacity-[0.08]"
      style={{ ...pos }}
    >
      {/* Cylinder */}
      <div
        className="border-2 border-white/30 rounded-sm"
        style={{
          width: piston.width + 10,
          height: piston.height,
        }}
      />
      {/* Piston head - moves up and down */}
      <div
        className="absolute left-[5px] bg-white/40 rounded-sm"
        style={{
          width: piston.width,
          height: 10,
          animation: `tkro-piston ${piston.duration}s ease-in-out ${piston.delay}s infinite`,
        }}
      />
      {/* Connecting rod */}
      <div
        className="absolute bg-white/20"
        style={{
          left: piston.width / 2,
          width: 3,
          height: piston.height * 0.6,
          animation: `tkro-piston ${piston.duration}s ease-in-out ${piston.delay}s infinite`,
        }}
      />
    </div>
  );
}

// Hexagonal bolt
function Bolt({ bolt }: { bolt: (typeof bolts)[0] }) {
  const pos: React.CSSProperties = { top: bolt.top };
  if ("left" in bolt) pos.left = bolt.left;
  if ("right" in bolt) pos.right = bolt.right;

  return (
    <div
      className="absolute md:hidden opacity-[0.1]"
      style={{
        ...pos,
        width: bolt.size,
        height: bolt.size,
        animation: `tkro-float ${bolt.duration}s ease-in-out ${bolt.delay}s infinite`,
      }}
    >
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <polygon
          points="12,1 21,6 21,18 12,23 3,18 3,6"
          fill="white"
        />
        <circle cx="12" cy="12" r="4" fill="rgba(0,0,0,0.4)" />
      </svg>
    </div>
  );
}

// Tachometer arc
function TachometerArc({ arc }: { arc: (typeof tachometerArcs)[0] }) {
  const pos: React.CSSProperties = { top: arc.top };
  if ("left" in arc) pos.left = arc.left;
  if ("right" in arc) pos.right = arc.right;

  return (
    <div
      className="absolute md:hidden opacity-[0.06]"
      style={{ ...pos, width: arc.size, height: arc.size }}
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Outer arc */}
        <path
          d="M 15 80 A 45 45 0 0 1 85 80"
          stroke="white"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
        {/* Tick marks */}
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => {
          const angle = -180 + i * 18;
          const rad = (angle * Math.PI) / 180;
          const inner = 38;
          const outer = i % 5 === 0 ? 48 : 44;
          return (
            <line
              key={i}
              x1={50 + inner * Math.cos(rad)}
              y1={80 + inner * Math.sin(rad)}
              x2={50 + outer * Math.cos(rad)}
              y2={80 + outer * Math.sin(rad)}
              stroke="white"
              strokeWidth={i % 5 === 0 ? 2.5 : 1.2}
              strokeLinecap="round"
            />
          );
        })}
        {/* Needle */}
        <line
          x1="50"
          y1="80"
          x2="50"
          y2="40"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          style={{
            transformOrigin: "50px 80px",
            animation: `tkro-needle 4s ease-in-out ${arc.delay}s infinite`,
          }}
        />
        {/* Center dot */}
        <circle cx="50" cy="80" r="3" fill="white" />
      </svg>
    </div>
  );
}

export default function TKROHeroDecorations() {
  useEffect(() => {
    const id = "tkro-hero-animations";
    if (document.getElementById(id)) return;

    const style = document.createElement("style");
    style.id = id;
    style.textContent = `
      @keyframes tkro-spin {
        0%   { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      @keyframes tkro-float {
        0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.1; }
        50%      { transform: translateY(-10px) rotate(15deg); opacity: 0.15; }
      }
      @keyframes tkro-piston {
        0%, 100% { transform: translateY(0px); }
        50%      { transform: translateY(25px); }
      }
      @keyframes tkro-needle {
        0%, 100% { transform: rotate(-40deg); }
        50%      { transform: rotate(40deg); }
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

      {/* Pistons */}
      {pistons.map((piston, i) => (
        <Piston key={`piston-${i}`} piston={piston} />
      ))}

      {/* Hexagonal bolts */}
      {bolts.map((bolt, i) => (
        <Bolt key={`bolt-${i}`} bolt={bolt} />
      ))}

      {/* Tachometer arcs */}
      {tachometerArcs.map((arc, i) => (
        <TachometerArc key={`tach-${i}`} arc={arc} />
      ))}
    </div>
  );
}
