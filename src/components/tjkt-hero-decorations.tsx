"use client";

import { useEffect } from "react";

// Network node positions for the topology
const nodes = [
  { top: "12%", left: "8%", size: 10, delay: 0 },
  { top: "25%", left: "22%", size: 7, delay: 0.3 },
  { top: "8%", left: "40%", size: 12, delay: 0.6 },
  { top: "30%", left: "55%", size: 8, delay: 0.9 },
  { top: "15%", right: "25%", size: 10, delay: 1.2 },
  { top: "35%", right: "10%", size: 6, delay: 0.4 },
  { top: "60%", left: "5%", size: 9, delay: 1.5 },
  { top: "70%", left: "18%", size: 7, delay: 0.7 },
  { top: "80%", left: "35%", size: 11, delay: 1.0 },
  { top: "65%", right: "20%", size: 8, delay: 0.2 },
  { top: "75%", right: "8%", size: 10, delay: 1.8 },
  { top: "50%", left: "42%", size: 6, delay: 1.3 },
];

// Connection lines between nodes (index pairs)
const connections = [
  [0, 1], [1, 2], [2, 3], [3, 4], [4, 5],
  [6, 7], [7, 8], [8, 9], [9, 10],
  [1, 7], [3, 9], [2, 11], [11, 8],
];

// Data packets that travel along paths
const packets = [
  { from: 0, to: 1, duration: 3, delay: 0 },
  { from: 2, to: 3, duration: 2.5, delay: 1 },
  { from: 6, to: 7, duration: 3.5, delay: 0.5 },
  { from: 8, to: 9, duration: 2.8, delay: 1.5 },
  { from: 4, to: 5, duration: 3.2, delay: 2 },
  { from: 1, to: 7, duration: 4, delay: 0.8 },
  { from: 11, to: 8, duration: 3, delay: 1.2 },
];

// Signal wave arcs
const signalWaves = [
  { top: "18%", left: "30%", size: 80, delay: 0 },
  { top: "55%", right: "15%", size: 100, delay: 1.5 },
  { top: "72%", left: "50%", size: 70, delay: 0.8 },
];

function NetworkNode({ node, index }: { node: (typeof nodes)[0]; index: number }) {
  const pos: React.CSSProperties = { top: node.top };
  if ("left" in node) pos.left = node.left;
  if ("right" in node) pos.right = node.right;

  return (
    <div
      className="absolute"
      style={{ ...pos, animation: `tjkt-pulse ${2.5 + index * 0.3}s ease-in-out ${node.delay}s infinite` }}
    >
      {/* Outer glow */}
      <div
        className="absolute rounded-full bg-white/10"
        style={{
          width: node.size * 3,
          height: node.size * 3,
          top: -(node.size),
          left: -(node.size),
        }}
      />
      {/* Node core */}
      <div
        className="rounded-full bg-white/30 border border-white/40"
        style={{ width: node.size, height: node.size }}
      />
    </div>
  );
}

function ConnectionLine({ from, to }: { from: (typeof nodes)[0]; to: (typeof nodes)[0] }) {
  const x1 = from.left ? parseFloat(from.left) : from.right ? 100 - parseFloat(from.right) : 50;
  const y1 = parseFloat(from.top);
  const x2 = to.left ? parseFloat(to.left) : to.right ? 100 - parseFloat(to.right) : 50;
  const y2 = parseFloat(to.top);

  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);

  return (
    <div
      className="absolute"
      style={{
        left: `${x1}%`,
        top: `${y1}%`,
        width: `${length}%`,
        height: "1px",
        background: "linear-gradient(90deg, rgba(255,255,255,0.05), rgba(255,255,255,0.2), rgba(255,255,255,0.05))",
        transform: `rotate(${angle}deg)`,
        transformOrigin: "0 0",
      }}
    />
  );
}

function DataPacket({ from, to, duration, delay }: PacketDef) {
  const x1 = from.left ? parseFloat(from.left) : from.right ? 100 - parseFloat(from.right) : 50;
  const y1 = parseFloat(from.top);
  const x2 = to.left ? parseFloat(to.left) : to.right ? 100 - parseFloat(to.right) : 50;
  const y2 = parseFloat(to.top);

  return (
    <div
      className="absolute"
      style={{
        left: `${x1}%`,
        top: `${y1}%`,
        width: 6,
        height: 6,
        borderRadius: "50%",
        background: "rgba(255,255,255,0.7)",
        boxShadow: "0 0 8px rgba(255,255,255,0.4)",
        animation: `tjkt-packet-${duration.toFixed(1)} ${duration}s linear ${delay}s infinite`,
        ["--x1" as string]: `${x1}%`,
        ["--y1" as string]: `${y1}%`,
        ["--x2" as string]: `${x2}%`,
        ["--y2" as string]: `${y2}%`,
      }}
    />
  );
}

function SignalWave({ wave }: { wave: (typeof signalWaves)[0] }) {
  const pos: React.CSSProperties = { top: wave.top };
  if ("left" in wave) pos.left = wave.left;
  if ("right" in wave) pos.right = wave.right;

  return (
    // Ring sinyal disembunyikan di bawah md agar teks hero tetap bersih di HP.
    <div className="hidden md:block absolute" style={pos}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="absolute rounded-full border border-white/10"
          style={{
            width: wave.size + i * 30,
            height: wave.size + i * 30,
            top: -(wave.size / 2 + i * 15),
            left: -(wave.size / 2 + i * 15),
            animation: `tjkt-signal ${3 + i * 0.5}s ease-out ${wave.delay + i * 0.6}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

// Binary/hex data stream
const binaryStreams = [
  { top: "40%", left: "3%", text: "01101001 10110010", delay: 0 },
  { top: "22%", right: "3%", text: "FF:0A:3C:B2", delay: 1.2 },
  { top: "85%", left: "45%", text: "192.168.1.1", delay: 0.6 },
  { top: "55%", right: "5%", text: "TCP/IP", delay: 1.8 },
  { top: "10%", left: "55%", text: "eth0: UP", delay: 0.3 },
  { top: "92%", right: "30%", text: "ping 10.0.0.1", delay: 1.5 },
];

type PacketDef = {
  from: (typeof nodes)[0];
  to: (typeof nodes)[0];
  duration: number;
  delay: number;
};

// Build packet objects from indices
const packetDefs: PacketDef[] = packets.map((p) => ({
  from: nodes[p.from],
  to: nodes[p.to],
  duration: p.duration,
  delay: p.delay,
}));

export default function TJKTHeroDecorations() {
  useEffect(() => {
    const id = "tjkt-hero-animations";
    if (document.getElementById(id)) return;

    // Build dynamic keyframes for each unique packet path
    const packetKeyframes = packets
      .map((p) => {
        const from = nodes[p.from];
        const to = nodes[p.to];
        const x1 = from.left ? parseFloat(from.left) : from.right ? 100 - parseFloat(from.right) : 50;
        const y1 = parseFloat(from.top);
        const x2 = to.left ? parseFloat(to.left) : to.right ? 100 - parseFloat(to.right) : 50;
        const y2 = parseFloat(to.top);
        return `
          @keyframes tjkt-packet-${p.duration.toFixed(1)} {
            0%   { left: ${x1}%; top: ${y1}%; opacity: 0; }
            5%   { opacity: 1; }
            95%  { opacity: 1; }
            100% { left: ${x2}%; top: ${y2}%; opacity: 0; }
          }
        `;
      })
      .join("\n");

    const style = document.createElement("style");
    style.id = id;
    style.textContent = `
      @keyframes tjkt-pulse {
        0%, 100% { opacity: 0.6; transform: scale(1); }
        50%      { opacity: 1;   transform: scale(1.3); }
      }
      @keyframes tjkt-signal {
        0%   { opacity: 0.4; transform: scale(0.8); }
        100% { opacity: 0;   transform: scale(1.5); }
      }
      @keyframes tjkt-binary {
        0%   { opacity: 0; transform: translateY(8px); }
        15%  { opacity: 0.5; }
        85%  { opacity: 0.5; }
        100% { opacity: 0; transform: translateY(-8px); }
      }
      ${packetKeyframes}
    `;
    document.head.appendChild(style);
    return () => {
      const el = document.getElementById(id);
      if (el) el.remove();
    };
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Connection lines */}
      {connections.map(([fromIdx, toIdx], i) => (
        <ConnectionLine key={`line-${i}`} from={nodes[fromIdx]} to={nodes[toIdx]} />
      ))}

      {/* Network nodes */}
      {nodes.map((node, i) => (
        <NetworkNode key={`node-${i}`} node={node} index={i} />
      ))}

      {/* Data packets */}
      {packetDefs.map((pkt, i) => (
        <DataPacket key={`pkt-${i}`} {...pkt} />
      ))}

      {/* Signal waves */}
      {signalWaves.map((wave, i) => (
        <SignalWave key={`wave-${i}`} wave={wave} />
      ))}

      {/* Binary/data streams */}
      {binaryStreams.map((stream, i) => {
        const pos: React.CSSProperties = { top: stream.top };
        if ("left" in stream) pos.left = stream.left;
        if ("right" in stream) pos.right = stream.right;
        return (
          <div
            key={`bin-${i}`}
            className="absolute font-mono text-[10px] text-white/20 whitespace-nowrap hidden lg:block"
            style={{
              ...pos,
              animation: `tjkt-binary ${4 + i * 0.5}s ease-in-out ${stream.delay}s infinite`,
            }}
          >
            {stream.text}
          </div>
        );
      })}
    </div>
  );
}
