/* eslint-disable @next/next/no-img-element */
/**
 * Gambar dari URL bebas (diisi admin untuk berita/jurusan buatan).
 *
 * Sengaja memakai `<img>` biasa, bukan `next/image`:
 * - optimizer Next hanya boleh memproses domain yang di-whitelist di
 *   `next.config.ts`; membuka whitelist ke domain sembarangan berarti server
 *   ikut mengunduh URL pihak ketiga (risiko SSRF),
 * - `<img>` tidak menyedot kuota image optimizer untuk foto eksternal.
 *
 * `onError` dipakai pemanggil untuk jatuh ke placeholder bila URL-nya mati.
 */
export function ExternalImage({
  src,
  alt,
  className,
  onLoad,
  onError,
}: {
  src: string;
  alt: string;
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
}) {
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      className={className}
      onLoad={onLoad}
      onError={onError}
    />
  );
}
