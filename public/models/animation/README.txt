# Folder animasi karakter VRM (.vrma) — dibaca VrmViewer.tsx
#
# Konvensi nama file (boleh dioverride via prop animationSrc):
#   entrance.vrma  -> diputar SEKALI saat model selesai dimuat
#   idle.vrma      -> loop setelah entrance (kamu yang sediakan file-nya)
#   talk.vrma      -> loop selama AI menjawab (prop speaking / isTyping)
#   thinking.vrma  -> loop saat berpikir (prop thinking, pemicu menyusul)
#
# Syarat file:
# - Format VRM Animation (.vrma) dengan humanoid VRM 1.0
#   (dari VRoid Studio / Blender VRM addon / Unity UniVRM).
# - Set loop di software pembuatnya: entrance = once, sisanya = loop.
#   (Loader tetap memaksa entrance sekali + sisanya loop bila flag beda.)
#
# Catatan:
# - Setiap file bersifat OPSIONAL: file yang belum ada dilewati diam-diam
#   dan digantikan animasi prosedural bawaan (breathing/sway/blink).
#   Jadi project tetap jalan walau baru entrance.vrma yang ada.
# - Track tulang di clip selalu menang atas prosedural; tulang yang tidak
#   dianimasikan clip tetap digerakkan prosedural. Blink prosedural jalan
#   sebelum mixer.update agar track ekspresi di clip (bila ada) menang.
# - SCALE bone didukung (parser resmi membuangnya → viewer rebuild manual
#   dari channel scale .vrma dan menempelkannya ke clip; jumlah track yang
#   diterapkan tercatat di console sebagai info).
# - Selama ENTRANCE aktif, seluruh prosedural MATI (breathing/sway/kepala/
#   blink/mulut) — hanya placement statis + clip yang jalan.
#
# Offset Y model per animasi (prop offsetY, contoh, tanpa modif bone):
#   <VrmViewer speaking={isTyping} offsetY={{ talk: 0.05 }} />
# - Satuan dunia; positif = naik. Default semua 0. Dijumlahkan dengan
#   framing.offsetY (per breakpoint) + breathing.
#   (framing.offsetY = beda breakpoint; offsetY = beda state animasi.)
# - Diterapkan INSTAN saat state aktif dan HANYA bila file clip-nya ke-load.
#   Bila clip tak ada, offset key itu diabaikan (ada warning di console).
