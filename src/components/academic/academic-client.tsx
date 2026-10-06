"use client";

import * as React from "react";
import {
  BookOpen,
  Calendar,
  Clock,
  Download,
  FileCheck2,
  GraduationCap,
  Sparkles,
  Trophy,
  Users,
  Search,
  FileText,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { StatCard } from "@/components/ui/stat-card";

interface ScheduleItem {
  id: string;
  day: string;
  time: string;
  subject: string;
  teacher: string;
  room: string;
  code: string;
}

const SCHEDULES: ScheduleItem[] = [
  { id: "1", day: "Senin", time: "07:15 - 09:30", subject: "Administrasi Sistem Jaringan (ASJ)", teacher: "Ir. Bambang S., M.Kom", room: "Lab Cisco & Server 01", code: "TJKT-301" },
  { id: "2", day: "Senin", time: "09:45 - 12:00", subject: "Keamanan Jaringan & Cyber Security", teacher: "Dian Pratama, S.Kom, CEH", room: "Lab Cyber Security", code: "TJKT-302" },
  { id: "3", day: "Selasa", time: "07:15 - 10:00", subject: "Pemrograman Web & Cloud Architecture", teacher: "Ahmad Fauzi, M.T", room: "Lab Software Engineering", code: "PPLG-201" },
  { id: "4", day: "Selasa", time: "10:15 - 12:15", subject: "Sistem Basis Data Enterprise", teacher: "Siti Rahmawati, S.Kom", room: "Lab Database 02", code: "PPLG-204" },
  { id: "5", day: "Rabu", time: "07:15 - 09:30", subject: "Teknologi Jaringan Berbasis Luas (WAN)", teacher: "Hendra Wijaya, S.T", room: "Lab Fiber Optik", code: "TJKT-303" },
  { id: "6", day: "Rabu", time: "09:45 - 11:45", subject: "Bahasa Inggris Komunikasi Bisnis", teacher: "Sarah Amanda, M.Pd", room: "Ruang Teori 12", code: "UMUM-105" },
  { id: "7", day: "Kamis", time: "07:15 - 10:30", subject: "Praktikum Fiber Optik & Fusion Splicing", teacher: "Budi Santoso, S.T", room: "Workshop Telekomunikasi", code: "TT-301" },
  { id: "8", day: "Jumat", time: "07:15 - 09:00", subject: "Pendidikan Agama & Budi Pekerti", teacher: "Ust. M. Syarifuddin, S.Ag", room: "Masjid Al-Ikhlas / R. 08", code: "UMUM-101" },
  { id: "9", day: "Jumat", time: "09:15 - 11:15", subject: "Kewirausahaan & Startup Digital", teacher: "Rina Kusuma, M.M", room: "Inkubator Bisnis", code: "UMUM-109" },
];

const EXAMS = [
  { title: "Penilaian Tengah Semester (PTS Ganjil)", date: "12 - 17 Oktober 2026", status: "Mendatang", type: "Teori & Praktik Lab" },
  { title: "Sertifikasi Kompetensi Industri (MikroTik MTCNA)", date: "03 November 2026", status: "Wajib Kelas XII", type: "Ujian Internasional" },
  { title: "Penilaian Akhir Semester (PAS Ganjil)", date: "07 - 15 Desember 2026", status: "Jadwal Resmi", type: "CBT Online" },
];

const GRADES = [
  { subject: "Administrasi Sistem Jaringan", credit: 4, tugas: 94, uts: 90, uas: 92, finalScore: 92.2, predikat: "A" },
  { subject: "Cyber Security & Pentesting", credit: 4, tugas: 96, uts: 95, uas: 98, finalScore: 96.5, predikat: "A+" },
  { subject: "Pemrograman Web & Mobile", credit: 3, tugas: 88, uts: 85, uas: 90, finalScore: 87.8, predikat: "A-" },
  { subject: "Teknologi Fiber Optik", credit: 3, tugas: 90, uts: 92, uas: 91, finalScore: 91.0, predikat: "A" },
  { subject: "Bahasa Inggris Teknik", credit: 2, tugas: 85, uts: 88, uas: 86, finalScore: 86.4, predikat: "A-" },
];

const MODULES = [
  { title: "Modul Praktikum Konfigurasi Router BGP & OSPF Enterprise", size: "14.2 MB", format: "PDF", author: "Lab Networking", downloads: 412 },
  { title: "Source Code & Blueprint Fullstack Next.js + PostgreSQL", size: "8.6 MB", format: "ZIP", author: "Tim Dosen RPL", downloads: 680 },
  { title: "Buku Pedoman Splicing Fiber Optik Standar Industri Telkom", size: "22.5 MB", format: "PDF", author: "Mitra Telkom Akses", downloads: 320 },
  { title: "Dataset Log Analisis Ancaman Keamanan IDS/IPS Snort", size: "45.1 MB", format: "CSV", author: "Lab Cyber Security", downloads: 189 },
];

export function AcademicClient({ userName }: { userName: string }) {
  const [selectedDay, setSelectedDay] = React.useState<string>("Semua");
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [activeTab, setActiveTab] = React.useState<"jadwal" | "nilai" | "materi" | "ujian">("jadwal");

  const days = ["Semua", "Senin", "Selasa", "Rabu", "Kamis", "Jumat"];

  const filteredSchedule = SCHEDULES.filter((item) => {
    const matchDay = selectedDay === "Semua" || item.day === selectedDay;
    const matchSearch =
      item.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.teacher.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.room.toLowerCase().includes(searchQuery.toLowerCase());
    return matchDay && matchSearch;
  });

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-700 via-sky-700 to-blue-800 p-8 text-white shadow-xl shadow-sky-950/20 sm:p-10">
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <Badge className="border-white/30 bg-white/20 text-white backdrop-blur-md">
              <Sparkles className="mr-1.5 h-3.5 w-3.5" />
              Sistem Informasi Akademik Terpadu (SIAKAD)
            </Badge>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Portal Akademik & Kurikulum 2026/2027
            </h1>
            <p className="text-sm leading-relaxed text-sky-100 sm:text-base">
              Akses cepat jadwal tatap muka di lab, monitoring capaian IPK & transkrip nilai, modul e-learning resmi, serta kalender sertifikasi industri.
            </p>
          </div>
          <div className="flex flex-col items-center rounded-2xl border border-white/20 bg-white/10 p-5 text-center backdrop-blur-md">
            <span className="text-xs uppercase tracking-widest text-sky-200">Indeks Prestasi Kumulatif</span>
            <span className="mt-1 text-4xl font-extrabold text-white">3.92</span>
            <span className="mt-1 inline-flex items-center gap-1 text-xs text-emerald-300 font-medium">
              <Trophy className="h-3.5 w-3.5" /> Predikat Sangat Memuaskan (Cumlaude)
            </span>
          </div>
        </div>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={GraduationCap}
          label="Total Mata Pelajaran"
          value={16}
          sublabel="Semester Ganjil 2026/2027"
          colorTone="sky"
        />
        <StatCard
          icon={Clock}
          label="Jam Pelajaran / Pekan"
          value={44}
          valueSuffix=" Jam"
          sublabel="Teori 35% | Praktikum 65%"
          colorTone="emerald"
        />
        <StatCard
          icon={FileCheck2}
          label="Presensi Kehadiran"
          value="98.5"
          valueSuffix="%"
          sublabel="Sangat Tertib & Disiplin"
          colorTone="violet"
        />
        <StatCard
          icon={Trophy}
          label="Sertifikat Keahlian"
          value={4}
          sublabel="Cisco CCNA, MikroTik MTCNA, AWS"
          colorTone="amber"
        />
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab("jadwal")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
            activeTab === "jadwal"
              ? "bg-sky-600 text-white shadow-md shadow-sky-200"
              : "bg-white text-slate-600 hover:bg-sky-50"
          }`}
        >
          <Calendar className="h-4 w-4" />
          Jadwal Kuliah & Praktikum
        </button>
        <button
          onClick={() => setActiveTab("nilai")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
            activeTab === "nilai"
              ? "bg-sky-600 text-white shadow-md shadow-sky-200"
              : "bg-white text-slate-600 hover:bg-sky-50"
          }`}
        >
          <Trophy className="h-4 w-4" />
          Transkrip & Rekap Nilai
        </button>
        <button
          onClick={() => setActiveTab("materi")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
            activeTab === "materi"
              ? "bg-sky-600 text-white shadow-md shadow-sky-200"
              : "bg-white text-slate-600 hover:bg-sky-50"
          }`}
        >
          <BookOpen className="h-4 w-4" />
          E-Learning & Modul Praktik
        </button>
        <button
          onClick={() => setActiveTab("ujian")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
            activeTab === "ujian"
              ? "bg-sky-600 text-white shadow-md shadow-sky-200"
              : "bg-white text-slate-600 hover:bg-sky-50"
          }`}
        >
          <FileText className="h-4 w-4" />
          Kalender Ujian & Sertifikasi
        </button>
      </div>

      {/* TAB 1: JADWAL PELAJARAN */}
      {activeTab === "jadwal" && (
        <div className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-1.5">
              {days.map((day) => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`rounded-lg px-3.5 py-1.5 min-h-9 text-xs font-semibold transition-colors ${
                    selectedDay === day
                      ? "bg-sky-700 text-white shadow-sm"
                      : "bg-white text-slate-600 hover:bg-slate-100 ring-1 ring-slate-200"
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Cari mapel, guru, atau lab..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-white"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredSchedule.map((item) => (
              <Card key={item.id} className="relative overflow-hidden bg-white border-slate-200/80 hover:shadow-lg hover:border-sky-300 transition-all">
                <div className="h-2 w-full bg-gradient-to-r from-sky-500 to-indigo-500" />
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="bg-sky-50 text-sky-700 border-sky-200">
                      {item.code}
                    </Badge>
                    <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-sky-600" />
                      {item.day}, {item.time}
                    </span>
                  </div>
                  <CardTitle className="text-base font-bold text-slate-900 mt-2">
                    {item.subject}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-slate-400" />
                    <span>Dosen / Pengajar: <strong className="text-slate-800">{item.teacher}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-slate-400" />
                    <span>Lokasi: <span className="font-medium text-slate-700">{item.room}</span></span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: REKAP NILAI */}
      {activeTab === "nilai" && (
        <Card className="bg-white border-slate-200">
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <CardTitle className="text-xl">Transkrip Capaian Akademik</CardTitle>
                <CardDescription>
                  Nilai akumulatif tugas lab, penilaian tengah semester, dan proyek akhir siswa ({userName}).
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" /> Unduh KHS Digital (.PDF)
              </Button>
            </div>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase text-slate-600">
                <tr>
                  <th className="px-4 py-3">Mata Pelajaran</th>
                  <th className="px-4 py-3 text-center">SKS / JP</th>
                  <th className="px-4 py-3 text-center">Tugas & Praktik</th>
                  {/* Kolom sekunder disembunyikan di HP — tabel digulir horizontal. */}
                  <th className="hidden px-4 py-3 text-center sm:table-cell">UTS</th>
                  <th className="hidden px-4 py-3 text-center sm:table-cell">UAS</th>
                  <th className="px-4 py-3 text-center">Nilai Akhir</th>
                  <th className="hidden px-4 py-3 text-center sm:table-cell">Predikat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {GRADES.map((g, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3.5 font-medium text-slate-900">{g.subject}</td>
                    <td className="px-4 py-3.5 text-center text-slate-600">{g.credit}</td>
                    <td className="px-4 py-3.5 text-center text-slate-700">{g.tugas}</td>
                    <td className="hidden px-4 py-3.5 text-center text-slate-700 sm:table-cell">{g.uts}</td>
                    <td className="hidden px-4 py-3.5 text-center text-slate-700 sm:table-cell">{g.uas}</td>
                    <td className="px-4 py-3.5 text-center font-bold text-sky-700">{g.finalScore}</td>
                    <td className="hidden px-4 py-3.5 text-center sm:table-cell">
                      <span className="inline-block rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800">
                        {g.predikat}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* TAB 3: E-LEARNING & MODUL */}
      {activeTab === "materi" && (
        <div className="grid gap-4 md:grid-cols-2">
          {MODULES.map((mod, idx) => (
            <Card key={idx} className="bg-white border-slate-200 hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <Badge variant="secondary" className="bg-sky-50 text-sky-700">
                      {mod.format} • {mod.size}
                    </Badge>
                    <CardTitle className="text-base font-bold text-slate-900 mt-2">
                      {mod.title}
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 pt-2 border-t border-slate-100">
                <span>Diterbitkan oleh: <strong className="text-slate-700">{mod.author}</strong></span>
                <Button size="sm" variant="ghost" className="text-sky-600 hover:text-sky-700 gap-1.5 font-medium">
                  <Download className="h-4 w-4" /> Download ({mod.downloads})
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* TAB 4: UJIAN & SERTIFIKASI */}
      {activeTab === "ujian" && (
        <div className="space-y-4">
          {EXAMS.map((exam, i) => (
            <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 gap-4 shadow-sm">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge className="bg-indigo-600 text-white">{exam.status}</Badge>
                  <span className="text-xs text-slate-500 font-medium">{exam.type}</span>
                </div>
                <h3 className="text-base font-bold text-slate-900">{exam.title}</h3>
                <p className="text-xs text-slate-500 flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-sky-600" /> Waktu Pelaksanaan: <strong className="text-slate-700">{exam.date}</strong>
                </p>
              </div>
              <Button size="sm" className="bg-sky-600 hover:bg-sky-700 text-white shrink-0">
                Lihat Petunjuk Teknis
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
