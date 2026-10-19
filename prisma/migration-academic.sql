-- Data akademik siswa (Bagian C): jadwal, nilai, absensi, tugas, kartu ujian.
-- Diterapkan manual via: npx prisma db execute --file prisma/migration-academic.sql
-- Struktur mengikuti konvensi Prisma/Postgres (timestamp(3), FK ON DELETE CASCADE).

CREATE TABLE IF NOT EXISTS "academic_schedules" (
    "id" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "teacher" TEXT,
    "major" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "academic_schedules_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "academic_schedules_day_idx" ON "academic_schedules"("day");

CREATE TABLE IF NOT EXISTS "academic_grades" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "semester" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "academic_grades_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "academic_grades_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "academic_grades_userId_idx" ON "academic_grades"("userId");

CREATE TABLE IF NOT EXISTS "academic_attendance" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "academic_attendance_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "academic_attendance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "academic_attendance_userId_date_idx" ON "academic_attendance"("userId", "date");

CREATE TABLE IF NOT EXISTS "academic_tasks" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "description" TEXT,
    "dueAt" TEXT,
    "major" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "academic_tasks_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "academic_tasks_dueAt_idx" ON "academic_tasks"("dueAt");

CREATE TABLE IF NOT EXISTS "academic_exam_cards" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "examName" TEXT NOT NULL,
    "startDate" TEXT NOT NULL,
    "endDate" TEXT,
    "room" TEXT NOT NULL,
    "seatNo" TEXT,
    "participantNo" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "academic_exam_cards_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "academic_exam_cards_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "academic_exam_cards_userId_idx" ON "academic_exam_cards"("userId");
