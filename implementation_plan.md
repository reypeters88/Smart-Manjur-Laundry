# Rencana Pembuatan Dashboard Manjur Laundry

Pembuatan antarmuka pengguna (UI) untuk dashboard utama Manjur Laundry berdasar pada Product Requirements Document (PRD) dan gambar referensi. Aplikasi ini akan dibangun sebagai Single Page Application (SPA) yang berjalan langsung dari file `index.html` menggunakan HTML, CSS (Vanilla), dan JavaScript.

## Kebutuhan Review Pengguna

Desain aplikasi berfokus pada pengalaman seluler (mobile-first) dengan gaya "vibrant blue & emerald green, glassmorphism". Mohon periksa usulan struktur di bawah ini dan berikan persetujuan untuk mulai pengkodean.

## Pertanyaan Terbuka

1.  **Ikon**: Apakah Anda setuju jika kita menggunakan pustaka ikon seperti **FontAwesome** (atau Boxicons/Material Icons) via CDN agar ikon-ikon terlihat profesional dan mirip dengan gambar?
2.  **Font**: Saya mengusulkan menggunakan font modern dari Google Fonts seperti **Inter** atau **Poppins** agar terlihat rapi dan kelas atas. Apakah Anda memiliki preferensi lain?
3.  **Tombol "+" (Tambah Transaksi)**: Saat tombol besar "+" di tengah bawah diklik, apakah Anda ingin memunculkan *pop-up modal* atau berpindah ke tampilan *halaman kasir/POS*?

## Perubahan yang Diusulkan

### UI & Layout Inti (HTML & CSS)
*   **Header Profil**: Menampilkan sapaan "Hai, Manjur Laundry" dan ikon QR.
*   **Top Bar (Tab & Statistik)**: 
    *   Navigasi tab: "KEUANGAN", "TRANSAKSI", "KEPEGAWAIAN" dengan gaya *glassmorphism* dan gradien biru.
    *   Slider statistik horizontal: "Masuk", "Harus Selesai", "Terlambat", dll.
*   **Menu Layanan Utama**: Grid ikon layanan (Self Service, Penjemputan, Antrian, dll.) dilengkapi dengan *badge* notifikasi.
*   **Pintasan (Shortcuts)**: Daftar menu baris (Aktivitas Mesin, Top Pelanggan, dll.) menggunakan gaya *card* putih yang bersih.
*   **Bottom Navigation Bar**: Menu navigasi lengket di bawah (Beranda, Pesanan, +, Laporan, Akun) dengan tombol "+" yang menonjol di tengah.

#### [NEW] index.html
Struktur utama halaman SPA, memuat semua elemen UI untuk dashboard.

#### [NEW] style.css
Berisi aturan gaya (styling) kustom yang mengimplementasikan warna *vibrant blue*, tata letak Flexbox/Grid, bayangan lembut (soft shadows), dan animasi transisi halus untuk memberikan kesan aplikasi premium.

#### [NEW] app.js
Logika interaktif awal untuk menangani pergantian tab (Keuangan/Transaksi/Kepegawaian), navigasi menu bawah, efek klik (ripple effect), dan persiapan manajemen status dengan `localStorage`.

### Persiapan Progressive Web App (PWA)
Sesuai PRD, aplikasi ini juga dirancang untuk dapat diinstal sebagai PWA di HP.
#### [NEW] manifest.json
Konfigurasi manifest PWA dengan nama "Manjur Laundry", warna tema `#0284c7`, dan referensi ke `logo_manjur.png`.

#### [NEW] sw.js
Skrip Service Worker dasar untuk kemampuan mode *offline* (caching awal).

---

## Fokus: Halaman Pesanan (Orders)

Berdasarkan instruksi terbaru, kita akan memfokuskan pengerjaan pada halaman/tab **Pesanan**. Ketika tombol "Pesanan" di navigasi bawah diklik, tampilan akan berubah (seolah-olah membuka halaman baru) sesuai dengan gambar referensi terakhir.

**Komponen UI Pesanan yang akan dibangun:**
1.  **Header Pesanan Khusus**: 
    *   Terdapat tombol navigasi **Back (Kembali)** di pojok kiri atas untuk kembali ke halaman Beranda/Transaksi.
    *   Sapaan "Hai, Manjur Laundry" beserta informasi singkat status pesanan.
    *   Ikon pencarian (Search) dan riwayat di pojok kanan, atau ikon QR code.
2.  **Filter Kategori Gulir Horisontal (Scrollable Chips)**:
    *   Tombol-tombol kategori seperti: *Semua, Baru, Antrian, Proses, Selesai, Siap Ambil, Selesai*.
    *   Gaya desain: Kapsul membulat (pill-shaped) yang interaktif.
3.  **Daftar Kartu Pesanan (Order Cards)**:
    *   Kartu riwayat cucian yang menampilkan: No Faktur/Order ID, Nama Pelanggan, Tanggal/Jam, Total Harga, Status Pembayaran (Lunas/Belum), dan Label Status Pengerjaan.
    *   Gaya desain: *Clean card* bergaya glassmorphism/material dengan bayangan lembut.

> [!IMPORTANT]
> **Pertanyaan Desain:** Karena tab "Pesanan" dibuka dari menu bawah (Bottom Navigation), apakah Anda ingin **menyembunyikan menu bawah tersebut** saat berada di halaman Pesanan agar layar terasa lebih luas (seperti halaman detail penuh)? Ataukah menu bawah dibiarkan tetap terlihat di bagian bawah layar?

## Rencana Verifikasi

### Verifikasi Manual
1.  Buka file `index.html` di browser desktop dan gunakan mode responsif seluler (Mobile View).
2.  Pastikan semua tab dan tombol menu interaktif (bisa diklik dan mengubah status/tampilan).
3.  Verifikasi halaman "Pesanan" berfungsi dengan tombol filter gulir horisontal.
