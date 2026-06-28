# UI & ARCHITECTURE STANDARD — OSIM IMBOS

**Aplikasi:** Organisasi Siswa Insan Mulia (osim.imbos.sch.id)
**Versi Dokumen:** 2.0 (Updated for Next.js App Router & Tailwind CSS v4)
**Tujuan:** Panduan konsistensi UI, arsitektur, dan performa untuk AI agent serta developer saat menambah atau memodifikasi fitur.

---

## 1. ARSITEKTUR UTAMA (Next.js App Router)

Aplikasi ini menggunakan **Next.js 15+ (App Router)**. Semua pengembangan harus mematuhi aturan berikut:

- **Server Components by Default:** Semua file di dalam `app/` secara default adalah Server Components. Gunakan ini untuk memuat data (fetching dari Supabase) dan merender UI statis.
- **Client Components (`"use client";`):** Hanya tambahkan directive `"use client";` di baris paling atas untuk komponen yang membutuhkan interaktivitas (onClick, useState, useEffect, useRef). Pisahkan komponen klien sekecil mungkin ke dalam folder `components/` untuk menjaga Server Components tetap bersih.
- **Routing & Layout:**
  - `app/layout.js`: Root layout utama.
  - Halaman Admin/Dashboard diletakkan di dalam foldernya (misal `app/admin/`) dan seringkali memiliki struktur nested layout sendiri.

---

## 2. STRUKTUR DIREKTORI

- **`app/`**: Folder routing utama Next.js. Berisi `page.js` dan `layout.js`.
- **`components/`**: Folder untuk komponen re-usable.
  - `components/ui/`: Komponen UI atomik atau generik (contoh: `PageHeader.jsx`, `FilterBar.jsx`, `Modal.jsx`).
  - `components/layouts/`: Komponen khusus layouting.
  - `components/admin/`, `components/home/`: Komponen spesifik per halaman.
- **`lib/`**: Utilitas utama seperti instansiasi Supabase (`lib/supabase/`).
- **`utils/`**: Fungsi pembantu murni (helper functions).

---

## 3. WARNA & TEMA (Tailwind CSS v4)

Aplikasi ini menggunakan **Tailwind CSS v4** dengan konfigurasi tema yang ditulis langsung di `app/globals.css` menggunakan `@theme`. JANGAN gunakan kode hex secara langsung, gunakan utilitas class Tailwind yang sudah didefinisikan!

### Warna Utama
- **Primary:** `bg-primary`, `text-primary`, `border-primary` (Biru Utama: `#38bdf8`)
- **Primary Hover/Light:** `bg-primary-hover` (`#0ea5e9`), `bg-primary-light` (`#e0f2fe`)
- **Secondary:** `bg-secondary`, `text-secondary` (Biru Lebih Gelap)

### Warna Aksen / Status
- **Danger (Merah):** `bg-danger`, `text-danger`, `bg-danger-bg` (untuk background muda)
- **Success (Hijau):** `bg-success`, `text-success`
- **Warning (Oranye):** `bg-warning`, `text-warning`

### Warna Latar & Teks
- **Background Halaman:** `bg-bg-page` (`#f8fafc` - keabu-abuan terang)
- **Background Card:** `bg-bg-card` (`#ffffff`)
- **Border:** `border-border-dim`
- **Teks Utama (Heading):** `text-text-main` (`#0c4a6e`)
- **Teks Paragraf (Body):** `text-text-body` (`#334155`)
- **Teks Sekunder (Muted):** `text-text-muted` (`#94a3b8`)

---

## 4. TIPOGRAFI

- **Font Utama:** Outfit (`var(--font-outfit)`). Di setel global via class `font-sans` di `layout.js`.
- **Tingkatan Judul (Heading):**
  - Judul Halaman Utama: Gunakan class utility `.page-title` (Text besar, extrabold, warna text-main).
  - Subtitle: `text-sm` atau `text-xs`, warna `text-text-muted`.

---

## 5. UI KOMPONEN & CLASS UTILITY

Konfigurasi Tailwind kami menyediakan beberapa utilitas custom di `globals.css` pada layer `@layer components`. Gunakan class ini alih-alih merangkai banyak utility Tailwind berulang kali:

### Tombol (Button)
Gunakan kombinasi class standar ini:
- **`.button`**: Class dasar untuk layouting semua tombol.
- **`.button-primary`**: Tombol aksi utama (biru terang).
- **`.button-secondary`**: Tombol aksi alternatif (putih dengan border abu).
- **`.button-danger`**: Tombol hapus/destruktif (merah).

### Kartu (Card) & Pembatas
- **`.card`**: Class standar untuk kontainer kotak putih (`bg-bg-card border-border-dim rounded-xl p-6 shadow-sm-custom`).
- **`.card-divider`**: Garis pemisah horizontal (`border-t border-border-dim my-2`).

### Form (Input, Select, Textarea)
Element `<input>`, `<select>`, `<textarea>` sudah disetel styling defaultnya di `globals.css`. Jika tidak perlu custom, cukup gunakan tag aslinya dan akan otomatis ber-border `border-dim` dan memiliki efek focus ring.

---

## 6. PERFORMA & ANIMASI

Aplikasi menuntut visual yang halus (micro-animations) tanpa mengorbankan framerate (GPU-friendly).

- **Shadow Hover Khusus (`.card-hover`):** JANGAN menganimasi `box-shadow` secara langsung pada hover! Gunakan class `.card-hover`. Class ini menggunakan trik pseudo-element `::after` dan menganimasi opacity (sangat ringan untuk GPU).
- **Will-Change:** Gunakan `.will-change-transform` atau `.will-change-opacity` untuk elemen yang sangat sering bergerak atau berubah (misalnya modal pop-up, sidebar toggle).
- **Animasi Custom:**
  - `animate-fade-in`: Untuk modal atau kemunculan instan.
  - `animate-scale-in`: Untuk kemunculan kartu / popover.
  - `animate-slide-down` / `animate-slide-up`: Untuk dropdown atau toast.

---

## 7. POLA KOMPONEN UI SPESIFIK

### Page Header (`components/ui/PageHeader.jsx`)
Komponen ini sangat krusial untuk halaman Admin/Dashboard. Selalu gunakan komponen ini sebagai header halaman di atas konten.
- Menggunakan efek `sticky` di atas, `backdrop-blur`, dan mendeteksi kondisi scroll.
- Mensupport fitur: `title`, `subtitle`, `searchBar`, tombol aksi utama (`primaryAction`), dan menu aksi (`actions`).

### Breadcrumb (`components/Breadcrumbs.jsx`)
Otomatis merender path URL. Terintegrasi di dalam `PageHeader` (ketika halaman belum di-scroll). Jika membuat halaman custom yang tidak memakai `PageHeader`, panggil secara manual.

---

## 8. HAL YANG TIDAK BOLEH DILAKUKAN (DON'TS)

- ❌ **Jangan menggunakan warna arbitrary (Hex Code sembarangan):** Selalu gunakan variabel dari `globals.css` (`bg-primary`, `bg-bg-page`, dsb).
- ❌ **Jangan mem-bypass Server Components:** Jangan memberi `"use client"` di halaman Root page (misal `app/admin/page.js`) kecuali benar-benar memaksa. Gunakan di komponen anaknya.
- ❌ **Jangan menganimasi property layout berat:** Hindari transisi pada `width`, `height`, `margin`, `padding`, atau `box-shadow`. Gunakan `transform` (scale, translate) dan `opacity`.
- ❌ **Jangan membuat layout table di halaman Publik:** Gunakan grid card. Table hanya untuk admin.

---

## 9. CHECKLIST UNTUK AI KETIKA MEMBUAT HALAMAN/KOMPONEN

- [ ] Memastikan pemisahan Server vs Client Component (`"use client"`).
- [ ] Mengecek apakah fetch data lebih cocok dilakukan di Server (Supabase SSR) daripada Client side.
- [ ] Memakai semantic class dari `globals.css` (seperti `.card`, `.button-primary`, `.card-hover`).
- [ ] Menggunakan variabel warna tema Tailwind (`bg-bg-page`, `text-text-main`, `border-border-dim`).
- [ ] Mengimplementasi `PageHeader.jsx` dengan properti yang tepat jika ini adalah halaman dalam / admin.
- [ ] Seluruh komponen interaktif (input, tombol) menggunakan efek hover/focus yang halus tanpa stuttering (gunakan opacity/transform).
