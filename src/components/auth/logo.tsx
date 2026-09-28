import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Logo pada halaman auth.
 *
 * CARA GANTI LOGO:
 * 1. Timpa `public/images/logo.svg` dengan logo Anda (atau ubah LOGO_SRC
 *    ke path file Anda — svg/png/webp semuanya bekerja).
 * 2. Sesuaikan width/height di pemanggilan <AuthLogo> agar proporsional
 *    dengan rasio asset asli.
 *
 * `unoptimized` dipakai karena logo tidak perlu diproses optimizer Next.js.
 */
const LOGO_SRC = "/images/logo.svg";

export function AuthLogo({
  className,
  width = 44,
  height = 44,
  priority = false,
}: {
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center", className)}>
      <Image
        src={LOGO_SRC}
        alt="Logo SMK Telekomunikasi Tunas Harapan"
        width={width}
        height={height}
        priority={priority}
        unoptimized
        className="h-auto w-auto object-contain"
      />
    </span>
  );
}
