import type { SVGProps } from "react";

/**
 * Ikon Instagram bergaya lucide (24×24, stroke 2, round).
 *
 * lucide-react tidak lagi menyediakan ikon brand — ini penggantinya agar
 * tombol kanal bantuan (@smk_tth) tidak memakai ikon chat yang membingungkan.
 */
export function InstagramIcon({
  className,
  ...props
}: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      width={24}
      height={24}
      className={className}
      aria-hidden
      {...props}
    >
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
