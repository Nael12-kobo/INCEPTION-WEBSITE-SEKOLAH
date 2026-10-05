// Harus diimpor paling awal: three.js mengharapkan beberapa global browser
// yang tidak tersedia di Node. Sifatnya side-effect saja.
globalThis.self = globalThis.self ?? globalThis;
globalThis.window = globalThis.window ?? globalThis;
globalThis.requestAnimationFrame =
  globalThis.requestAnimationFrame ?? ((cb) => setTimeout(cb, 16));
