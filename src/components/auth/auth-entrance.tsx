"use client";

import type { ReactNode } from "react";
import { useAuthEntrance } from "@/components/auth/use-auth-entrance";

/**
 * Membungkus halaman auth agar entrance animation (anime.js) berjalan:
 * elemen dengan data-auth-panel / data-auth-form / data-auth-logo
 * dianimasikan sekali saat mount.
 */
export function AuthEntrance({ children }: { children: ReactNode }) {
  const ref = useAuthEntrance();
  return <div ref={ref}>{children}</div>;
}
