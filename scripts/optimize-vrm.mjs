/**
 * Kompres file .vrm/.glb dengan membuang morph target (blendshape) yang tidak
 * pernah dipakai oleh expression VRMC_vrm.
 *
 * Latar belakang: file character.vrm berbobot 148 MB karena mesh punya
 * 106 morph target x 17 primitive, padahal expression hanya memakai 7 di
 * antaranya (+ 5 viseme mulut yang sekaligus di-bind di sini). Hasilnya
 * file jatuh ke ~18 MB sehingga halaman /chat tidak "mengunduh" 148 MB.
 *
 * Pemakaian:
 *   node scripts/optimize-vrm.mjs public/models/character.vrm
 *
 * Aman dijalankan berulang (idempoten): morph yang sudah dipotong tidak
 * dipotong lagi. Selalu backup dulu file aslinya sebelum menjalankan.
 */
import fs from "node:fs";
import path from "node:path";

const GLB_MAGIC = 0x46546c67;
const CHUNK_JSON = 0x4e4f534a;
const CHUNK_BIN = 0x004e4942;

const [, , inputArg, outputArg] = process.argv;
if (!inputArg) {
  console.error("Pakai: node scripts/optimize-vrm.mjs <file.vrm> [output.vrm]");
  process.exit(1);
}
const inputPath = path.resolve(inputArg);
const outputPath = path.resolve(outputArg || inputArg);

/** Viseme mulut yang di-bind otomatis ke expression preset (VRoid naming). */
const VISEME_BIND = { aa: "あ頂点", ih: "い頂点", ou: "う頂点", ee: "え頂点", oh: "お頂点" };

function parseGlb(buf) {
  if (buf.readUInt32LE(0) !== GLB_MAGIC) throw new Error("Bukan file GLB valid");
  const total = buf.readUInt32LE(8);
  let offset = 12;
  let json = null;
  let bin = null;
  while (offset < total) {
    const len = buf.readUInt32LE(offset);
    const type = buf.readUInt32LE(offset + 4);
    const start = offset + 8;
    if (type === CHUNK_JSON) json = JSON.parse(buf.subarray(start, start + len).toString("utf8"));
    else if (type === CHUNK_BIN) bin = buf.subarray(start, start + len);
    offset = start + len;
  }
  if (!json || !bin) throw new Error("Chunk JSON/BIN tidak ditemukan");
  return { json, bin };
}

function align4(n) {
  return (n + 3) & ~3;
}

function accByteLength(acc) {
  const NC = { 5120: 1, 5121: 1, 5122: 2, 5123: 2, 5125: 4, 5126: 4 };
  const NT = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4, MAT2: 4, MAT3: 9, MAT4: 16 };
  if (!(acc.componentType in NC) || !(acc.type in NT)) {
    throw new Error(`accessor tidak dikenal: ${JSON.stringify(acc)}`);
  }
  const perElement = NC[acc.componentType] * NT[acc.type];
  // sparse tidak didukung script ini
  if (acc.sparse) throw new Error("accessor sparse belum didukung");
  return acc.count * perElement;
}

const raw = fs.readFileSync(inputPath);
const { json, bin } = parseGlb(raw);
const originalSize = raw.length;

const expressions = json.extensions?.VRMC_vrm?.expressions;
const mesh = json.meshes.find((m) => m.primitives?.some((p) => p.targets?.length));
if (!mesh) throw new Error("Tidak ada mesh dengan morph target");

const targetCount = mesh.primitives[0].targets.length;
const targetNames = mesh.extras?.targetNames ?? [];

// ---- 1. Kumpulkan morph yang harus dipertahankan -------------------------
const keep = new Set();
for (const group of [expressions?.preset, expressions?.custom]) {
  for (const expr of Object.values(group ?? {})) {
    for (const bind of expr.morphTargetBinds ?? []) keep.add(bind.index);
  }
}

// ---- 2. Bind viseme mulut yang masih kosong (lumayan buat lip-sync) -----
const addedBinds = [];
const nameToIndex = new Map(targetNames.map((n, i) => [n, i]));
const groupNames = { preset: expressions?.preset, custom: expressions?.custom };
for (const [group, presetName] of [["preset", "aa"], ["preset", "ih"], ["preset", "ou"], ["preset", "ee"], ["preset", "oh"]]) {
  const expr = groupNames[group]?.[presetName];
  const morphName = VISEME_BIND[presetName];
  if (!expr || !morphName) continue;
  if ((expr.morphTargetBinds ?? []).length > 0) continue; // sudah ada
  const idx = nameToIndex.get(morphName);
  if (idx == null) continue;
  expr.morphTargetBinds = [{ index: idx, node: meshNodeIndex(json, mesh), weight: 1 }];
  keep.add(idx);
  addedBinds.push(`${presetName} -> "${morphName}" (#${idx})`);
}

function meshNodeIndex(doc, m) {
  const i = doc.nodes.findIndex((n) => n.mesh === doc.meshes.indexOf(m));
  return i >= 0 ? i : 0;
}

const keepSorted = [...keep].sort((a, b) => a - b);
if (keepSorted.length >= targetCount) {
  console.log("Tidak ada morph yang bisa dibuang — file dibiarkan apa adanya.");
  process.exit(0);
}
const remap = new Map(keepSorted.map((oldIdx, i) => [oldIdx, i]));

// ---- 3. Potong morph target di setiap primitive --------------------------
let removedSlots = 0;
for (const m of json.meshes) {
  const hasTargets = m.primitives?.some((p) => p.targets?.length);
  if (!hasTargets) continue;
  for (const prim of m.primitives) {
    if (!prim.targets?.length) continue;
    removedSlots += prim.targets.length - keepSorted.length;
    prim.targets = keepSorted.map((i) => prim.targets[i]).filter(Boolean);
    if (prim.targets.length === 0) delete prim.targets;
  }
  // mesh.weights harus sepanjang jumlah morph target (divalidasi glTF)
  if (Array.isArray(m.weights)) {
    m.weights = keepSorted.map((i) => m.weights[i]).filter((v) => v !== undefined);
    if (m.weights.length === 0) delete m.weights;
  }
  if (mesh.extras?.targetNames && m === mesh) {
    m.extras.targetNames = keepSorted.map((i) => mesh.extras.targetNames[i]);
  }
}

// remap indeks di expression
for (const group of [expressions?.preset, expressions?.custom]) {
  for (const expr of Object.values(group ?? {})) {
    for (const bind of expr.morphTargetBinds ?? []) {
      const next = remap.get(bind.index);
      if (next == null) throw new Error(`bind.index ${bind.index} tidak ada di keep-set`);
      bind.index = next;
    }
  }
}

// ---- 4. Kumpulkan accessor & bufferView yang masih dipakai ---------------
const usedAcc = new Set();
const usedBv = new Set();
const markAcc = (i) => {
  if (i == null || usedAcc.has(i)) return;
  usedAcc.add(i);
  const acc = json.accessors[i];
  if (acc.bufferView != null) usedBv.add(acc.bufferView);
};

for (const m of json.meshes) {
  for (const prim of m.primitives) {
    Object.values(prim.attributes ?? {}).forEach(markAcc);
    markAcc(prim.indices);
    for (const t of prim.targets ?? []) Object.values(t).forEach(markAcc);
  }
}
for (const skin of json.skins ?? []) markAcc(skin.inverseBindMatrices);
for (const anim of json.animations ?? []) {
  for (const s of anim.samplers) { markAcc(s.input); markAcc(s.output); }
}
for (const img of json.images ?? []) if (img.bufferView != null) usedBv.add(img.bufferView);

// aksesori sparse (kalau ada) ikut ditandai
for (const i of usedAcc) {
  const sp = json.accessors[i]?.sparse;
  if (sp) { usedBv.add(sp.indices.bufferView); usedBv.add(sp.values.bufferView); }
}

const accRemap = new Map();
const bvRemap = new Map();
const keptAccIndices = [...usedAcc].sort((a, b) => a - b);
const keptBvIndices = [...usedBv].sort((a, b) => a - b);
keptAccIndices.forEach((old, i) => accRemap.set(old, i));
keptBvIndices.forEach((old, i) => bvRemap.set(old, i));

// ---- 5. Susun ulang binary buffer --------------------------------------
const newViews = [];
let cursor = 0;
const chunks = [];
for (const oldIdx of keptBvIndices) {
  const bv = json.bufferViews[oldIdx];
  if (bv.buffer !== 0) throw new Error(`bufferView ${oldIdx} menunjuk buffer lain`);
  const start = bv.byteOffset ?? 0;
  cursor = align4(cursor); // glTF mewajibkan bufferView 4-byte aligned
  newViews.push({ ...bv, byteOffset: cursor });
  chunks.push(bin.subarray(start, start + bv.byteLength));
  cursor += bv.byteLength;
}
const outBuf = Buffer.alloc(align4(cursor));
newViews.forEach((v, i) => outBuf.set(chunks[i], v.byteOffset));

json.bufferViews = newViews;
json.buffers = [{ byteLength: outBuf.length }];

// ---- 6. Remap referensi -------------------------------------------------
for (const m of json.meshes) {
  for (const prim of m.primitives) {
    for (const [k, v] of Object.entries(prim.attributes ?? {})) prim.attributes[k] = accRemap.get(v);
    if (prim.indices != null) prim.indices = accRemap.get(prim.indices);
    for (const t of prim.targets ?? []) {
      for (const [k, v] of Object.entries(t)) t[k] = accRemap.get(v);
    }
  }
}
for (const skin of json.skins ?? []) {
  if (skin.inverseBindMatrices != null) skin.inverseBindMatrices = accRemap.get(skin.inverseBindMatrices);
}
for (const img of json.images ?? []) {
  if (img.bufferView != null) img.bufferView = bvRemap.get(img.bufferView);
}
for (const acc of json.accessors) {
  if (acc.bufferView != null) acc.bufferView = bvRemap.get(acc.bufferView);
  if (acc.bufferView != null && acc.byteOffset == null) acc.byteOffset = 0;
}
json.accessors = keptAccIndices.map((i) => json.accessors[i]);

// ---- 7. Tulis GLB baru --------------------------------------------------
const jsonBytes = Buffer.from(JSON.stringify(json), "utf8");
const jsonPadded = Buffer.alloc(align4(jsonBytes.length), 0x20);
jsonBytes.copy(jsonPadded);
const binPadded = Buffer.alloc(align4(outBuf.length), 0x00);
outBuf.copy(binPadded);

const header = Buffer.alloc(12);
header.writeUInt32LE(GLB_MAGIC, 0);
header.writeUInt32LE(2, 4);
header.writeUInt32LE(12 + 8 + jsonPadded.length + 8 + binPadded.length, 8);

const jsonChunkHeader = Buffer.alloc(8);
jsonChunkHeader.writeUInt32LE(jsonPadded.length, 0);
jsonChunkHeader.writeUInt32LE(CHUNK_JSON, 4);
const binChunkHeader = Buffer.alloc(8);
binChunkHeader.writeUInt32LE(binPadded.length, 0);
binChunkHeader.writeUInt32LE(CHUNK_BIN, 4);

fs.writeFileSync(outputPath, Buffer.concat([header, jsonChunkHeader, jsonPadded, binChunkHeader, binPadded]));

const finalSize = fs.statSync(outputPath).size;
const mb = (n) => (n / 1048576).toFixed(1);
console.log(`Morph target : ${targetCount} -> ${keepSorted.length}`);
console.log(`Dibuang      : ${removedSlots} slot morph`);
console.log(`Accessors    : ${json.accessors.length} tersisa`);
console.log(`BufferViews  : ${json.bufferViews.length} tersisa`);
if (addedBinds.length) console.log(`Bind baru    : ${addedBinds.join(", ")}`);
console.log(`Ukuran       : ${mb(originalSize)} MB -> ${mb(finalSize)} MB (${Math.round((1 - finalSize / originalSize) * 100)}% lebih kecil)`);
