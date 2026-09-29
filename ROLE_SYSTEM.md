# Role-Based Access Control (RBAC) System

## Overview
Sistem ini mengimplementasikan hak akses berbasis peran dengan tiga level: Super Admin, Admin, dan User biasa.

## Role Hierarchy
1. **SUPER_ADMIN** - Akses penuh ke semua fitur
   - Bisa mengubah role user (ADMIN / USER)
   - Bisa menghapus user (ADMIN / USER)
   - Bisa mengedit data ADMIN & USER
   - Bisa mengelola PPDB
   - Akses ke panel admin

2. **ADMIN** - Akses terbatas
   - Bisa mengelola PPDB (semua pendaftaran)
   - Bisa melihat daftar semua user
   - Bisa mengedit data USER (nama/email), tanpa ubah role
   - Akses ke panel admin
   - Tidak bisa mengubah role user lain
   - Tidak bisa menghapus user

3. **USER** - Akses dasar
   - Hanya akses dashboard personal
   - Bisa mendaftar PPDB
   - Tidak ada akses admin

## Setup Awal
Akun admin sudah dibuat secara otomatis:

### Super Admin
- Email: `superadmin@example.com`
- Password: `superadmin123`
- Role: SUPER_ADMIN

### Admin
- Email: `admin@example.com`
- Password: `admin123`
- Role: ADMIN

⚠️ **PENTING**: Silakan ganti password setelah login pertama!

## Perubahan Database
Schema Prisma telah diperbarui dengan field `role` pada model User:

```prisma
enum UserRole {
  USER
  ADMIN
  SUPER_ADMIN
}

model User {
  // ... existing fields
  role UserRole @default(USER)
}
```

## Auth & Helpers
1. **JWT Session** — Role di-sync dari database pada setiap refresh token
2. **Type Definitions** — `src/types/next-auth.d.ts`
3. **Pure helpers** — `src/lib/roles.ts` (aman untuk client & server)
4. **Server guards** — `src/lib/role-utils.ts` (`requireAdmin`, `requireSuperAdmin`)

## API Endpoints

### User Management
- `GET /api/admin/users` — List semua users (Admin & Super Admin)
- `PUT /api/admin/users` — Update role user (Super Admin only)
- `PATCH /api/admin/users/[id]` — Edit data user (sesuai permission)
- `DELETE /api/admin/users/[id]` — Hapus user (Super Admin only)

### PPDB Management
- `GET /api/admin/ppdb` — List pendaftaran (Admin & Super Admin)
- `PATCH /api/admin/ppdb/[id]` — Update status PPDB (Admin & Super Admin)
- `DELETE /api/admin/ppdb/[id]` — Hapus pendaftaran (Admin & Super Admin)

## Security Notes
1. Semua API endpoint dilindungi dengan role checking
2. Super Admin tidak bisa mengubah / menghapus akun sendiri
3. Super Admin tidak bisa mengedit / menghapus Super Admin lain
4. Role di JWT selalu di-sync dari DB
5. Pendaftaran PPDB hanya untuk role USER
