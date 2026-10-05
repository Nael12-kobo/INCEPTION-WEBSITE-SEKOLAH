"use client";

import { useEffect } from "react";

// Shape definitions: type, size, position, color, rotation speed, initial rotation
const shapes: {
  type: "circle" | "rect" | "triangle" | "diamond" | "ring" | "cross";
  size: number;
  top: string;
  left?: string;
  right?: string;
  color: string;
  duration: number;
  delay: number;
  rotateStart: number;
}[] = [
  // Circles
  { type: "circle", size: 60,  top: "8%",  left: "5%",   color: "bg-yellow-400",   duration: 8,  delay: 0,   rotateStart: 0 },
  { type: "circle", size: 35,  top: "65%", left: "8%",   color: "bg-cyan-300",     duration: 12, delay: 1.5, rotateStart: 45 },
  { type: "circle", size: 45,  top: "20%", right: "6%",  color: "bg-pink-400",     duration: 10, delay: 0.8, rotateStart: 90 },
  { type: "circle", size: 28,  top: "75%", right: "12%", color: "bg-green-300",    duration: 14, delay: 2,   rotateStart: 30 },
  // Rectangles
  { type: "rect",   size: 50,  top: "15%", left: "20%",  color: "bg-purple-400",   duration: 9,  delay: 0.5, rotateStart: 15 },
  { type: "rect",   size: 40,  top: "55%", right: "18%", color: "bg-orange-300",   duration: 11, delay: 1.2, rotateStart: 60 },
  { type: "rect",   size: 55,  top: "80%", left: "30%",  color: "bg-blue-300",     duration: 7,  delay: 0.3, rotateStart: 120 },
  { type: "rect",   size: 30,  top: "35%", right: "25%", color: "bg-red-300",      duration: 13, delay: 2.5, rotateStart: 200 },
  // Triangles
  { type: "triangle", size: 50, top: "10%", left: "35%",  color: "border-cyan-300",   duration: 10, delay: 0.7, rotateStart: 0 },
  { type: "triangle", size: 40, top: "70%", right: "30%", color: "border-yellow-300", duration: 14, delay: 1.8, rotateStart: 60 },
  { type: "triangle", size: 35, top: "45%", left: "12%",  color: "border-pink-300",   duration: 8,  delay: 0,   rotateStart: 150 },
  // Diamonds
  { type: "diamond",  size: 45, top: "25%", right: "10%", color: "bg-emerald-300",  duration: 9,  delay: 1,   rotateStart: 0 },
  { type: "diamond",  size: 35, top: "60%", left: "40%",  color: "bg-violet-300",   duration: 12, delay: 2.2, rotateStart: 45 },
  // Rings
  { type: "ring",     size: 70, top: "5%",  right: "20%", color: "border-white",    duration: 15, delay: 0.4, rotateStart: 0 },
  { type: "ring",     size: 50, top: "50%", left: "2%",   color: "border-cyan-200",  duration: 11, delay: 1.6, rotateStart: 30 },
  // Crosses
  { type: "cross",    size: 35, top: "40%", right: "5%",  color: "bg-white",        duration: 8,  delay: 0.9, rotateStart: 0 },
  { type: "cross",    size: 28, top: "85%", left: "15%",  color: "bg-yellow-200",   duration: 13, delay: 2.8, rotateStart: 45 },
  { type: "cross",    size: 32, top: "18%", left: "50%",  color: "bg-white",        duration: 10, delay: 1.3, rotateStart: 20 },
];

// Shape renderer
function Shape({ shape }: { shape: (typeof shapes)[0] }) {
  const posStyle: React.CSSProperties = { top: shape.top };
  if ("left" in shape) posStyle.left = shape.left;
  if ("right" in shape) posStyle.right = shape.right;

  const baseStyle: React.CSSProperties = {
    ...posStyle,
    width: shape.size,
    height: shape.size,
    animation: `dkv-spin ${shape.duration}s linear ${shape.delay}s infinite`,
  };

  switch (shape.type) {
    case "circle":
      return (
        <div
          className={`absolute ${shape.color} rounded-full opacity-20`}
          style={baseStyle}
        />
      );

    case "rect":
      return (
        <div
          className={`absolute ${shape.color} rounded-md opacity-20`}
          style={baseStyle}
        />
      );

    case "triangle":
      return (
        <div
          className="absolute opacity-20"
          style={{
            ...baseStyle,
            width: 0,
            height: 0,
            borderLeft: `${shape.size / 2}px solid transparent`,
            borderRight: `${shape.size / 2}px solid transparent`,
            borderBottom: `${shape.size}px solid`,
            borderBottomColor: "var(--tri-color, rgba(255,255,255,0.2))",
          }}
        />
      );

    case "diamond":
      return (
        <div
          className={`absolute ${shape.color} opacity-20`}
          style={{
            ...baseStyle,
            borderRadius: "4px",
            transform: "rotate(45deg)",
          }}
        />
      );

    case "ring":
      return (
        <div
          className={`absolute ${shape.color} rounded-full opacity-20 border-2`}
          style={{
            ...baseStyle,
            backgroundColor: "transparent",
          }}
        />
      );

    case "cross":
      return (
        <div className="absolute opacity-20" style={baseStyle}>
          <div
            className={`absolute ${shape.color}`}
            style={{
              left: "50%",
              top: "10%",
              width: "25%",
              height: "80%",
              transform: "translateX(-50%)",
              borderRadius: 2,
            }}
          />
          <div
            className={`absolute ${shape.color}`}
            style={{
              top: "50%",
              left: "10%",
              height: "25%",
              width: "80%",
              transform: "translateY(-50%)",
              borderRadius: 2,
            }}
          />
        </div>
      );

    default:
      return null;
  }
}

export default function DKVHeroDecorations() {
  useEffect(() => {
    const id = "dkv-hero-animations";
    if (document.getElementById(id)) return;

    const style = document.createElement("style");
    style.id = id;
    style.textContent = `
      @keyframes dkv-spin {
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
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {shapes.map((shape, i) => (
        <Shape key={i} shape={shape} />
      ))}
    </div>
  );
}
