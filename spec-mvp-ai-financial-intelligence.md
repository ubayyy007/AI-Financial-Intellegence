# Spec Design & MVP — AI Financial Intelligence Platform

## 1. Ringkasan Produk
Platform berbasis AI yang mengubah data keuangan mentah menjadi tiga laporan keuangan standar (accounting), lalu menghasilkan insight dan strategi bisnis otomatis (business intelligence), dengan opsi deployment SaaS maupun on-premise untuk enterprise.

**Target pengguna**: UMKM, SME, dan Enterprise
**Problem yang diselesaikan**: pembukuan tidak rapi, biaya konsultan mahal, data tidak diinterpretasikan, proses accounting-to-insight terputus, kebutuhan privasi data di level enterprise.

---

## 2. Alur Pengguna (User Flow) Inti

```
Upload Data Mentah → AI Extraction & Klasifikasi → 
Generate 3 Statement (Laba Rugi, Neraca, Arus Kas) → 
Download / Re-upload ke Modul BI → 
Analisis Rasio + Visualisasi → 
AI Executive Summary & Rekomendasi Strategi
```

---

## 3. Modul & Fitur MVP

### Modul A — Accounting Engine
| Fitur | Deskripsi | Prioritas |
|---|---|---|
| Upload data | Terima Excel/CSV template, PDF, atau foto nota | Must-have |
| Ekstraksi AI | Klasifikasi transaksi ke akun (debit/kredit/kategori) | Must-have |
| Confidence score | Indikator keyakinan hasil ekstraksi per item | Must-have |
| Generate 3 Statement | Laba Rugi, Neraca, Arus Kas otomatis | Must-have |
| Export | Download PDF & Excel | Must-have |
| Template standar | Unduh template input + panduan chart of accounts (SAK EMKM/PSAK) | Should-have |

### Modul B — Business Intelligence Engine
| Fitur | Deskripsi | Prioritas |
|---|---|---|
| Re-upload dari Modul A | Data 3 statement otomatis masuk tanpa input ulang | Must-have |
| Analisis rasio | Likuiditas, profitabilitas, solvabilitas, efisiensi | Must-have |
| Benchmark industri | Perbandingan rasio terhadap rata-rata sektor (jika data tersedia) | Should-have |
| Visualisasi | Grafik tren, komposisi biaya/pendapatan, scorecard kesehatan keuangan | Must-have |
| AI Executive Summary | Narasi otomatis berbahasa Indonesia dari angka | Must-have |
| Rekomendasi strategi | Actionable insight (ekspansi, efisiensi, cash-tight warning) | Must-have |
| Investment Readiness Score | Skor kelayakan investasi + one-pager pitch | Nice-to-have (v2) |

### Modul C — Platform & Keamanan
| Fitur | Deskripsi | Prioritas |
|---|---|---|
| Autentikasi & role user | Login, multi-user per akun bisnis | Must-have |
| Enkripsi data | At rest & in transit | Must-have |
| Kebijakan retensi/hapus data | User dapat hapus data permanen | Should-have |
| Mode deployment | SaaS (cloud) vs on-premise/private (enterprise) | v2 (pasca-MVP) |

---

## 4. Cakupan MVP (Batasi untuk Vibe Coding Awal)

**Masuk MVP:**
- Upload Excel/CSV (fokus dulu, tunda OCR foto/PDF kompleks ke v2)
- AI klasifikasi transaksi dasar
- Generate 3 statement (format sederhana)
- Download PDF/Excel
- Re-upload otomatis ke BI engine
- Analisis rasio dasar (4 kategori)
- 1-2 jenis visualisasi (tren + komposisi)
- AI executive summary (teks naratif)

**Ditunda ke v2/v3:**
- OCR foto nota
- Benchmark industri
- Investment Readiness Score
- Mode on-premise/enterprise
- Multi-entity consolidation
- Sertifikasi ISO 27001 (proses formal, bukan fitur teknis)

---

## 5. Arsitektur Teknis (Rekomendasi Level Tinggi)

- **Frontend**: web app (dashboard input, viewer laporan, visualisasi)
- **Backend**: API untuk ekstraksi data, kalkulasi rasio, penyimpanan
- **AI Layer**: LLM untuk klasifikasi transaksi + generate narasi/insight (prompt terstruktur, output JSON agar mudah dipetakan ke UI)
- **Database**: penyimpanan data keuangan terenkripsi per akun bisnis
- **Storage sementara**: file upload asli disimpan terpisah dari data terstruktur

**Prinsip desain data**: pisahkan "data mentah" → "data terstruktur (3 statement)" → "data insight (BI)" sebagai tiga lapisan berbeda, agar re-upload antar modul dan audit trail lebih mudah.

---

## 6. Metrik Keberhasilan MVP
- Akurasi ekstraksi/klasifikasi transaksi (target awal realistis, bukan sempurna — verifikasi manual tetap tersedia)
- Waktu dari upload sampai laporan jadi
- Tingkat penyelesaian alur (upload → 3 statement → BI insight) tanpa drop-off
- Feedback kualitatif: apakah rekomendasi AI dianggap relevan/actionable oleh user uji coba

---

## 7. Urutan Build yang Disarankan
1. Upload & parsing Excel/CSV → data terstruktur
2. Generator 3 statement + export
3. Modul BI: kalkulasi rasio + 1 visualisasi dasar
4. AI executive summary generator
5. Integrasi alur re-upload otomatis antar modul
6. Polish UI/UX dashboard
