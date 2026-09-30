"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  CircleUser,
  Loader2,
  MapPin,
  MessageCircle,
  Phone,
  Send,
  Sparkles,
  Users,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  GENDER_OPTIONS,
  JURUSAN_OPTIONS,
  PHONE_HINT,
  type PpdbDraft,
  type PpdbValues,
  validatePpdbDraft,
} from "@/lib/ppdb";
import {
  PpdbCheckbox,
  PpdbInput,
  PpdbPills,
  PpdbSelect,
  PpdbTextarea,
} from "@/components/ppdb/field-controls";

const STEPS = [
  { key: "identity", title: "Data Diri", icon: CircleUser },
  { key: "address", title: "Alamat & Kontak", icon: MapPin },
  { key: "major", title: "Pilihan Jurusan", icon: Sparkles },
  { key: "parent", title: "Data Orang Tua", icon: Users },
] as const;

const STEP_FIELDS: Record<string, string[]> = {
  identity: ["fullName", "gender", "birthPlace", "birthDate"],
  address: ["email", "phone", "previousSchool", "address"],
  major: ["majorFirst", "majorSecond"],
  parent: ["parentName", "parentPhone"],
};

const INITIAL: PpdbValues = {
  fullName: "",
  email: "",
  gender: "",
  birthPlace: "",
  birthDate: "",
  previousSchool: "",
  address: "",
  phone: "",
  majorFirst: "" as PpdbValues["majorFirst"],
  majorSecond: "" as PpdbValues["majorSecond"],
  parentName: "",
  parentPhone: "",
};

type SubmitState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "done"; registrationNo: string; waUrl: string; alreadyRegistered: boolean; whatsappDelivered: boolean; emailDelivered: boolean }
  | { status: "error"; message: string; errors: Record<string, string> };

export function PpdbForm({ defaultEmail }: { defaultEmail: string }) {
  const [step, setStep] = React.useState(0);
  const [values, setValues] = React.useState<PpdbValues>({
    ...INITIAL,
    email: defaultEmail,
  });
  const [agreed, setAgreed] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [state, setState] = React.useState<SubmitState>({ status: "idle" });

  const headingRef = React.useRef<HTMLParagraphElement>(null);

  const set = React.useCallback(
    <K extends keyof PpdbValues>(key: K, value: PpdbValues[K]) => {
      setValues((prev) => ({ ...prev, [key]: value }));
      setErrors((prev) => {
        if (!prev[key]) return prev;
        const next = { ...prev };
        delete next[key];
        return next;
      });
    },
    []
  );

  /** Validasi hanya field langkah aktif supaya pesan error tidak membanjiri layar. */
  const validateStep = React.useCallback(
    (index: number, source: PpdbDraft) => {
      const result = validatePpdbDraft(source);
      if (result.ok) return {} as Record<string, string>;
      const fields = STEP_FIELDS[STEPS[index].key];
      const scoped: Record<string, string> = {};
      for (const f of fields) {
        if (result.errors[f]) scoped[f] = result.errors[f];
      }
      return scoped;
    },
    []
  );

  const goNext = () => {
    const scoped = validateStep(step, values);
    setErrors(scoped);
    if (Object.keys(scoped).length > 0) {
      const first = Object.keys(scoped)[0];
      document.getElementById(first)?.focus();
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
    headingRef.current?.focus();
  };

  const goBack = () => {
    setStep((s) => Math.max(s - 1, 0));
    headingRef.current?.focus();
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!agreed) {
      setErrors((p) => ({ ...p, agreement: "Centang persetujuan terlebih dahulu." }));
      return;
    }

    setState({ status: "submitting" });
    try {
      const res = await fetch("/api/ppdb", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();

      if (res.status === 401) {
        setState({ status: "error", message: data.message ?? "Sesi berakhir.", errors: {} });
        return;
      }
      if (res.status === 400 && data.errors) {
        setErrors(data.errors);
        const firstError = Object.keys(data.errors)[0];
        const stepOf = STEPS.findIndex((s) => STEP_FIELDS[s.key].includes(firstError));
        if (stepOf >= 0) setStep(stepOf);
        setState({ status: "error", message: "Periksa kembali isian yang ditandai.", errors: data.errors });
        return;
      }
      if (!res.ok) {
        setState({ status: "error", message: data.message ?? "Terjadi kesalahan. Coba lagi.", errors: {} });
        return;
      }

      setState({
        status: "done",
        registrationNo: data.registrationNo,
        waUrl: data.waUrl,
        alreadyRegistered: Boolean(data.alreadyRegistered),
        whatsappDelivered: Boolean(data.whatsappDelivered),
        emailDelivered: Boolean(data.emailDelivered),
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setState({ status: "error", message: "Koneksi terputus. Coba lagi.", errors: {} });
    }
  };

  if (state.status === "done") {
    return <SuccessCard state={state} fullName={values.fullName} />;
  }

  const current = STEPS[step];
  const progress = Math.round(((step + 1) / STEPS.length) * 100);
  const submitting = state.status === "submitting";
  const isLast = step === STEPS.length - 1;

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="overflow-hidden rounded-3xl border border-sky-100 bg-white shadow-xl shadow-sky-100/60"
    >
      {/* Stepper */}
      <div className="border-b border-sky-100 bg-sky-50/60 px-5 py-5 sm:px-7">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-sky-700">
            Langkah {step + 1} dari {STEPS.length}
          </p>
          <p className="text-xs font-medium text-slate-500">{progress}%</p>
        </div>

        <div
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Kemajuan pengisian formulir"
          className="mt-2.5 h-2 overflow-hidden rounded-full bg-sky-200/70"
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-sky-500 to-cyan-400 transition-[width] duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <ol className="mt-4 flex flex-wrap gap-x-2 gap-y-2">
          {STEPS.map((s, i) => {
            const done = i < step;
            const active = i === step;
            return (
              <li key={s.key}>
                <button
                  type="button"
                  onClick={() => {
                    if (i <= step) {
                      setStep(i);
                      headingRef.current?.focus();
                    }
                  }}
                  disabled={i > step}
                  aria-current={active ? "step" : undefined}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                    active && "bg-sky-600 text-white shadow-sm shadow-sky-200",
                    done && "bg-emerald-100 text-emerald-700 hover:bg-emerald-200",
                    !active && !done && "bg-white text-slate-400 ring-1 ring-sky-100"
                  )}
                >
                  {done ? (
                    <BadgeCheck className="h-3.5 w-3.5" aria-hidden />
                  ) : (
                    <s.icon className="h-3.5 w-3.5" aria-hidden />
                  )}
                  {s.title}
                </button>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="px-5 py-6 sm:px-7 sm:py-7">
        <h2 className="text-lg font-extrabold tracking-tight text-slate-900">
          {current.title}
        </h2>
        <p
          ref={headingRef}
          tabIndex={-1}
          className="mt-1 text-sm text-slate-500 outline-none"
        >
          {STEP_INTRO[current.key]}
        </p>

        {state.status === "error" && state.message ? (
          <p
            role="alert"
            className="mt-5 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50/70 px-3.5 py-2.5 text-sm font-medium text-rose-700"
          >
            <span aria-hidden className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-rose-500" />
            {state.message}
          </p>
        ) : null}

        <div className="mt-6">
          {current.key === "identity" ? (
            <div className="space-y-5">
              <PpdbInput
                id="fullName"
                label="Nama lengkap"
                required
                autoComplete="name"
                placeholder="Sesuai akta kelahiran"
                value={values.fullName}
                onChange={(e) => set("fullName", e.target.value)}
                error={errors.fullName}
              />
              <PpdbPills
                legend="Jenis kelamin"
                required
                options={GENDER_OPTIONS}
                value={values.gender}
                onChange={(v) => set("gender", v)}
                error={errors.gender}
              />
              <div className="grid gap-5 sm:grid-cols-2">
                <PpdbInput
                  id="birthPlace"
                  label="Tempat lahir"
                  required
                  placeholder="Kota/Kabupaten"
                  value={values.birthPlace}
                  onChange={(e) => set("birthPlace", e.target.value)}
                  error={errors.birthPlace}
                />
                <PpdbInput
                  id="birthDate"
                  label="Tanggal lahir"
                  type="date"
                  required
                  max={new Date().toISOString().slice(0, 10)}
                  value={values.birthDate}
                  onChange={(e) => set("birthDate", e.target.value)}
                  error={errors.birthDate}
                />
              </div>
            </div>
          ) : null}

          {current.key === "address" ? (
            <div className="space-y-5">
              <PpdbInput
                id="email"
                label="Alamat email aktif"
                type="email"
                required
                autoComplete="email"
                placeholder="nama@email.com"
                hint="Dipakai untuk pemberitahuan hasil pendaftaran."
                value={values.email}
                onChange={(e) => set("email", e.target.value)}
                error={errors.email}
              />
              <PpdbInput
                id="phone"
                label="No. HP / WhatsApp"
                type="tel"
                inputMode="tel"
                required
                autoComplete="tel"
                placeholder="0812-3456-7890"
                hint={PHONE_HINT}
                value={values.phone}
                onChange={(e) => set("phone", e.target.value)}
                error={errors.phone}
              />
              <PpdbSelect
                id="previousSchool"
                label="Asal SLTP / SMP / MTs / sederajat"
                required
                options={SCHOOL_STATUS.map((s) => ({ value: s, label: s }))}
                placeholder="Pilih asal sekolah"
                value={values.previousSchool}
                onChange={(e) => set("previousSchool", e.target.value)}
                error={errors.previousSchool}
              />
              <PpdbTextarea
                id="address"
                label="Alamat tempat tinggal"
                required
                rows={4}
                placeholder="Jalan, nomor, RT/RW, desa/kelurahan, kecamatan, kabupaten/kota"
                hint="Alamat domisili calon siswa saat ini."
                value={values.address}
                onChange={(e) => set("address", e.target.value)}
                error={errors.address}
              />
            </div>
          ) : null}

          {current.key === "major" ? (
            <div className="space-y-5">
              <PpdbSelect
                id="majorFirst"
                label="Pilihan jurusan 1"
                required
                hint="Urutan prioritas, jurusan yang paling Anda minati."
                options={JURUSAN_OPTIONS.map((j) => ({ value: j.value, label: `${j.nama} (${j.kode})` }))}
                placeholder="Pilih jurusan pertama"
                value={values.majorFirst}
                onChange={(e) => set("majorFirst", e.target.value as PpdbValues["majorFirst"])}
                error={errors.majorFirst}
              />
              <PpdbSelect
                id="majorSecond"
                label="Pilihan jurusan 2"
                required
                hint="Cadangan bila kuota jurusan pertama penuh."
                options={JURUSAN_OPTIONS
                  .filter((j) => j.value !== values.majorFirst)
                  .map((j) => ({ value: j.value, label: `${j.nama} (${j.kode})` }))}
                placeholder="Pilih jurusan kedua"
                value={values.majorSecond}
                onChange={(e) => set("majorSecond", e.target.value as PpdbValues["majorSecond"])}
                error={errors.majorSecond}
              />
              <ul className="grid gap-2.5 sm:grid-cols-2">
                {JURUSAN_OPTIONS.map((j) => (
                  <li
                    key={j.value}
                    className="rounded-2xl border border-sky-100 bg-sky-50/50 p-3.5"
                  >
                    <Badge variant="secondary" className="text-[10px]">
                      {j.kode}
                    </Badge>
                    <p className="mt-2 text-sm font-semibold text-slate-800">{j.nama}</p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-500">
                      {j.deskripsi}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {current.key === "parent" ? (
            <div className="space-y-5">
              <PpdbInput
                id="parentName"
                label="Nama orang tua / wali"
                required
                placeholder="Sesuai akta kelahiran"
                value={values.parentName}
                onChange={(e) => set("parentName", e.target.value)}
                error={errors.parentName}
              />
              <PpdbInput
                id="parentPhone"
                label="No. HP / WhatsApp orang tua"
                type="tel"
                inputMode="tel"
                required
                autoComplete="tel"
                placeholder="0812-3456-7890"
                hint={PHONE_HINT}
                value={values.parentPhone}
                onChange={(e) => set("parentPhone", e.target.value)}
                error={errors.parentPhone}
              />
              <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4">
                <PpdbCheckbox
                  id="ppdb-agreement"
                  checked={agreed}
                  onChange={(checked) => {
                    setAgreed(checked);
                    if (checked) {
                      setErrors((p) => {
                        const next = { ...p };
                        delete next.agreement;
                        return next;
                      });
                    }
                  }}
                  error={errors.agreement}
                  disabled={submitting}
                >
                  Saya menyatakan data di atas benar dan dapat dipertanggungjawabkan, serta
                  bersedia mengikuti tes minat bakat dan daftar ulang sesuai ketentuan
                  sekolah.
                </PpdbCheckbox>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Navigasi */}
      <div className="flex flex-wrap items-center gap-3 border-t border-sky-100 bg-sky-50/40 px-5 py-4 sm:px-7">
        {step > 0 ? (
          <Button type="button" variant="ghost" onClick={goBack} disabled={submitting}>
            <ArrowLeft aria-hidden />
            Kembali
          </Button>
        ) : null}

        <div className="ml-auto flex flex-wrap items-center gap-3">
          <p className="text-xs text-slate-400">
            Field bertanda <span className="text-rose-500">*</span> wajib diisi
          </p>
          {isLast ? (
            <Button type="submit" size="lg" disabled={submitting} aria-busy={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="animate-spin" aria-hidden />
                  Mengirim…
                </>
              ) : (
                <>
                  <Send aria-hidden />
                  Kirim Pendaftaran
                </>
              )}
            </Button>
          ) : (
            <Button type="button" size="lg" onClick={goNext} disabled={submitting}>
              Lanjut
              <ArrowRight aria-hidden />
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}

const STEP_INTRO: Record<string, string> = {
  identity: "Mohon isi data sesuai akta kelahiran agar tidak ada koreksi saat daftar ulang.",
  address: "Pastikan nomor WhatsApp aktif — jadwal tes dikirim ke nomor tersebut.",
  major: "Pilih dua jurusan. Kami akan menyesuaikan penempatan sesuai kuota yang tersedia.",
  parent: "Orang tua/wali kami hubungi bila ada hal yang perlu dikonfirmasi.",
};

/** Opsi asal sekolah: SMP/MTs (wajib) atau sedang belajar / belum. */
const SCHOOL_STATUS = [
  "SMP / MTs sederajat (lulus)",
  "SMP / MTs sederajat (kelas IX)",
  "Sedang pursuing paket B",
  "Belum lulus / belum bersekolah",
] as const;

function SuccessCard({
  state,
  fullName,
}: {
  state: Extract<SubmitState, { status: "done" }>;
  fullName: string;
}) {
  return (
    <div className="overflow-hidden rounded-3xl border border-emerald-200 bg-white shadow-xl shadow-emerald-100/60">
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 px-6 py-10 text-center text-white sm:px-10">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-grid-sky opacity-40 [mask-image:radial-gradient(ellipse_60%_80%_at_50%_50%,black,transparent)]" />
        <div className="relative">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 ring-1 ring-white/30">
            <CheckCircle2 className="h-7 w-7" aria-hidden />
          </span>
          <h2 className="mt-4 text-2xl font-extrabold tracking-tight">
            {state.alreadyRegistered ? "Anda sudah terdaftar" : "Pendaftaran terkirim"}
          </h2>
          <p className="mt-2 text-sm text-emerald-50">
            {state.alreadyRegistered
              ? "Data Anda sudah tersimpan sebelumnya. Nomor pendaftaran tetap berlaku."
              : `Terima kasih, ${fullName.split(" ")[0] || "calon siswa"}. Simpan nomor pendaftaran Anda.`}
          </p>
          <p className="mt-5 inline-flex flex-col items-center rounded-2xl bg-white/15 px-6 py-3 ring-1 ring-white/30 backdrop-blur">
            <span className="text-[11px] font-medium uppercase tracking-widest text-emerald-50">
              Nomor pendaftaran
            </span>
            <span className="mt-1 font-mono text-2xl font-extrabold tracking-wider">
              {state.registrationNo}
            </span>
          </p>
        </div>
      </div>

      <div className="space-y-4 px-6 py-7 sm:px-8">
        <p className="text-sm leading-relaxed text-slate-600">
          {state.whatsappDelivered
            ? "Detail pendaftaran sudah kami kirim ke nomor WhatsApp Anda. Mohon balas konfirmasi agar proses lebih cepat."
            : "Konfirmasi WhatsApp belum terkirim otomatis. Silakan kirim pesan berikut ke nomor sekolah agar data Anda tercatat lebih cepat."}
        </p>
        <p className="text-sm leading-relaxed text-slate-600">
          {state.emailDelivered
            ? "Bukti pendaftaran juga sudah dikirim ke alamat email yang Anda daftarkan."
            : "Email konfirmasi belum terkirim otomatis. Pendaftaran Anda tetap tersimpan; silakan simpan nomor pendaftaran di atas."}
        </p>

        <div className="flex flex-wrap gap-3">
          <Button asChild size="lg">
            <a href={state.waUrl} target="_blank" rel="noopener noreferrer">
              <MessageCircle aria-hidden />
              Kirim via WhatsApp
            </a>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/dashboard">
              Kembali ke Dashboard
              <ArrowRight aria-hidden />
            </Link>
          </Button>
        </div>

        <div className="space-y-2.5 rounded-2xl border border-sky-100 bg-sky-50/60 p-4 text-sm text-slate-600">
          <p className="flex items-start gap-2">
            <Wallet className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" aria-hidden />
            Formulir ini bersifat sementara sebagai bukti pendaftaran online. Daftar lebih
            lengkap wajib diisi saat pendaftaran langsung di sekolah.
          </p>
          <p className="flex items-start gap-2">
            <Phone className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" aria-hidden />
            Informasi waktu test dan syarat lengkap pendaftaran dikirim melalui WhatsApp. Bila
            tidak memiliki WhatsApp, informasi disampaikan via SMS.
          </p>
          <p className="flex items-start gap-2">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" aria-hidden />
            Jl. Umbul Senjoyo I No. 3, Desa Bener, Kec. Tengaran, Kab. Semarang, Jawa Tengah
            · Telp. (0298) 313040
          </p>
        </div>
      </div>
    </div>
  );
}
