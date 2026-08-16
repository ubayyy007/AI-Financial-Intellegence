# V3 Roadmap — AI Financial Intelligence Platform

## Konteks
V1: Core platform (upload, 3 statement, BI insight, dashboard)
V2: Parser improvement, PDF document understanding, confidence score
V3: Fokus segmen Personal, UMKM, dan usaha kecil (toko kelontong, warung, dsb) — low to mid market

---

## Prioritas Fitur V3

### 3.1 — Multi-Periode & Forecasting *(prioritas tertinggi)*
- Analisis komparasi antar periode (bulan ke bulan, tahun ke tahun)
- Proyeksi arus kas dan laba 3–6 bulan ke depan berbasis tren historis
- Peringatan otomatis: cash-tight warning, tren pendapatan menurun

### 3.2 — Laporan Keuangan Personal
- Mode khusus untuk keuangan pribadi (bukan bisnis)
- Kategorisasi pengeluaran personal: kebutuhan, hiburan, tabungan, investasi
- Ringkasan kesehatan keuangan personal + rekomendasi sederhana
- Cocok untuk pelajar, mahasiswa, karyawan, freelancer

### 3.3 — Mode Usaha Mikro / Toko Kelontong
- Template input yang sangat sederhana (tidak perlu paham istilah akuntansi)
- Bahasa output non-teknis, mudah dipahami pemilik warung/toko kecil
- Insight dasar: hari paling ramai, produk margin tertinggi, kapan stok perlu diisi
- Input bisa semudah catatan harian (uang masuk/keluar per hari)

### 3.4 — Investment Readiness Score *(untuk UMKM yang mau naik kelas)*
- Skor kelayakan jika ingin mengajukan pinjaman atau mencari investor
- Output one-pager ringkasan bisnis (PDF) siap dipakai untuk proposal
- Bahasa sederhana, bukan bahasa korporat

### 3.5 — Benchmark Sederhana
- Perbandingan performa bisnis user terhadap rata-rata UMKM sejenis
- Fokus kategori: F&B, retail/toko, jasa, pertanian
- Disajikan dalam bahasa awam ("pengeluaran bahan baku Anda lebih tinggi 20% dari rata-rata usaha sejenis")

---

## Yang Ditunda ke V4 (Belum Relevan untuk Low-Mid Market)
- Mode on-premise / self-hosted enterprise
- Multi-entity consolidation
- Payment gateway & subscription system (fitur produk, belum prioritas build)
- Benchmark korporat / perusahaan Tbk

---

## Urutan Build V3 yang Disarankan
1. Multi-periode & forecasting
2. Mode laporan keuangan personal
3. Mode usaha mikro / toko kelontong (template & bahasa disederhanakan)
4. Investment Readiness Score untuk UMKM
5. Benchmark sederhana

---

## Catatan: Tier Gratis vs Berbayar

### Gratis (Free Tier)
- Upload hingga 1 laporan per bulan
- Generate 3 statement (Laba Rugi, Neraca, Arus Kas)
- BI insight dasar (ringkasan + 1-2 visualisasi)
- Cocok untuk personal dan UMKM yang baru coba

### Berbayar (direncanakan, bukan bagian dari build sekarang)
- Upload tidak terbatas
- Forecasting & multi-periode
- Investment Readiness Score + one-pager PDF
- Priority support
- Ditentukan setelah validasi dari user nyata dulu

*Catatan: Jangan bangun sistem payment dulu sebelum ada user yang mau bayar — validasi pasar lebih dulu, monetisasi belakangan.*
