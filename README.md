# Disposable Camera

Kamera sekali pakai untuk acara pernikahan. Tamu memindai QR, memotret langsung dari browser, dan foto masuk ke galeri privat pengantin.

## Prasyarat

- Node.js 22 atau lebih baru
- Proyek Supabase
- Supabase CLI (opsional, untuk menjalankan migrasi lewat terminal)

## Setup lokal

1. Gunakan versi Node yang benar dan pasang dependensi.

```bash
nvm use
npm install
```

2. Salin konfigurasi environment.

```bash
cp .env.example .env.local
```

Isi semua variabel di `.env.local`. `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_PASSWORD`, dan `SESSION_SECRET` hanya boleh tersedia di server.

3. Buat proyek Supabase, lalu jalankan migrasi.

Lewat SQL Editor: buka `supabase/migrations/20261106000000_initial_schema.sql`, salin seluruh isinya, lalu jalankan.

Lewat Supabase CLI:

```bash
supabase link --project-ref PROJECT_REF
supabase db push
```

Migrasi membuat tabel, constraint, index, RLS, function kuota, pengaturan awal, serta bucket Storage privat bernama `photos`.

4. Jalankan aplikasi.

```bash
npm run dev
```

Buka `http://localhost:3000`. Untuk mencoba kamera dengan kuota dummy, buka `http://localhost:3000/c/demo`.

Kamera browser membutuhkan HTTPS di perangkat fisik. `localhost` dikecualikan oleh browser, sedangkan alamat IP lokal dengan HTTP tidak akan bisa membuka kamera.

## Perintah

```bash
npm run dev
npm run build
npm run lint
npm run typecheck
```

## Struktur

```text
src/app/                  Halaman dan route handler Next.js
src/components/           Komponen UI
src/lib/env.ts            Validasi environment server
src/lib/supabase/         Client browser, client admin, dan tipe database
supabase/migrations/      Migrasi Postgres dan Storage
```

## Keamanan

- Bucket `photos` privat. Pembacaan dilakukan lewat signed URL berumur pendek.
- RLS aktif dan akses tabel dicabut dari role `anon` serta `authenticated`.
- Service role hanya dipakai dari modul server.
- Tabel `upload_reservations` menjaga konsistensi kuota saat upload gagal atau terputus.
