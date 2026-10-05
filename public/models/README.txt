# Taruh file karakter .vrm kamu di folder ini, mis. `character.vrm`.
# Lalu set di .env: NEXT_PUBLIC_VRM_URL="/models/character.vrm"
#
# Catatan: character.vrm sekarang ±17.5MB (sebelumnya 149MB). Berkas lama
# penuh morph target (blendshape) yang tidak pernah dipakai — dibuang oleh
# `scripts/optimize-vrm.mjs`, silakan jalankan lagi bila file diganti:
#   node scripts/optimize-vrm.mjs public/models/character.vrm
#
# Jangan lupa naikkan NEXT_PUBLIC_VRM_VERSION (atau angka cacheVersion di
# src/components/chat/VrmViewer.tsx) setiap file diganti, supaya browser
# mengabaikan cache lama (Cache-Control immutable 1 tahun di next.config.ts).
#
# Verifikasi file masih bisa di-load three.js + three-vrm:
#   node scripts/test-vrm-load.mjs public/models/character.vrm
