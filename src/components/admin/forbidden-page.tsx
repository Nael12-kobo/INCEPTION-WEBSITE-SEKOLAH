"use client";

import Link from "next/link";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function ForbiddenPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center py-12">
      <Card className="w-full max-w-md elevation-3">
        <CardContent className="p-8 text-center space-y-6">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-rose-50">
            <ShieldAlert className="h-10 w-10 text-rose-600" strokeWidth={1.8} />
          </div>

          <div className="space-y-2">
            <h1 className="font-h2 text-slate-900">Akses Ditolak</h1>
            <p className="font-body text-slate-500 leading-relaxed">
              Halaman ini khusus Super Admin. Silakan hubungi Super Admin
              untuk mendapatkan izin akses.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Button asChild>
              <Link href="/admin/overview">
                <ArrowLeft className="h-4 w-4" />
                Kembali ke Overview
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard">
                Ke Dashboard User
              </Link>
            </Button>
          </div>

          <div className="pt-2">
            <p className="font-caption text-[11px] text-slate-400">
              Error 403 — Forbidden
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
