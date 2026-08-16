import * as XLSX from 'xlsx';

// ─── Shared helpers ────────────────────────────────────────────────────────────

const today = () => {
  const d = new Date();
  return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
};

const dateOffset = (days) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
};

const COL_WIDTHS = [{ wch: 14 }, { wch: 40 }, { wch: 18 }, { wch: 18 }, { wch: 18 }];

const applyWidths = (ws) => { ws['!cols'] = COL_WIDTHS; };

const writeFile = (wb, fileName) => XLSX.writeFile(wb, fileName);

// ─── Template Personal Finance ─────────────────────────────────────────────────

export const downloadPersonalTemplate = () => {
  const wb = XLSX.utils.book_new();

  // ── Sheet 1: Jurnal Harian ────────────────────────────────────────────────
  const journalData = [
    // Header
    ['Tanggal', 'Keterangan', 'Uang Masuk (Rp)', 'Uang Keluar (Rp)', 'Kategori'],
    // Sample rows
    [dateOffset(6), 'Gaji bulanan',                   5000000,       '',      'Gaji'],
    [dateOffset(5), 'Beli makan siang',                '',          35000,    'Makan & Minum'],
    [dateOffset(5), 'Ongkos ojek online',              '',          22000,    'Transport'],
    [dateOffset(4), 'Bayar tagihan listrik',           '',         150000,    'Tagihan'],
    [dateOffset(4), 'Bayar internet bulanan',          '',         200000,    'Tagihan'],
    [dateOffset(3), 'Freelance desain logo',          500000,        '',      'Penghasilan Lain'],
    [dateOffset(3), 'Belanja bulanan supermarket',     '',         450000,    'Belanja'],
    [dateOffset(2), 'Makan malam bersama keluarga',   '',          85000,    'Makan & Minum'],
    [dateOffset(2), 'Top-up e-wallet',                '',         200000,    'Lain-lain'],
    [dateOffset(1), 'Transfer dari orang tua',        300000,        '',      'Transfer Masuk'],
    [dateOffset(1), 'Beli obat apotek',               '',          45000,    'Kesehatan'],
    [today(),       'Parkir & bensin motor',           '',          80000,    'Transport'],
    // 10 empty rows for user to fill
    ...Array(10).fill(['', '', '', '', '']),
  ];

  const wsJournal = XLSX.utils.aoa_to_sheet(journalData);
  applyWidths(wsJournal);
  XLSX.utils.book_append_sheet(wb, wsJournal, 'Jurnal Harian');

  // ── Sheet 2: Panduan Kategori ─────────────────────────────────────────────
  const guideData = [
    ['PANDUAN PENGISIAN TEMPLATE PERSONAL FINANCE'],
    [],
    ['FORMAT KOLOM:'],
    ['Tanggal',           'Format DD/MM/YYYY  →  contoh: 15/08/2025'],
    ['Keterangan',        'Isi bebas — deskripsi singkat transaksi'],
    ['Uang Masuk (Rp)',   'Isi nominal TANPA titik/koma jika angka, atau tulis biasa misal: 500000'],
    ['Uang Keluar (Rp)',  'Isi nominal pengeluaran. Kosongkan jika itu pemasukan'],
    ['Kategori',          'Pilih dari daftar di bawah, atau tulis kategori sendiri'],
    [],
    ['DAFTAR KATEGORI YANG DISARANKAN:'],
    [],
    ['Uang Masuk:',       ''],
    ['',  'Gaji'],
    ['',  'Penghasilan Lain'],
    ['',  'Freelance / Usaha Sampingan'],
    ['',  'Transfer Masuk'],
    ['',  'Hadiah / Bonus'],
    [],
    ['Uang Keluar:',      ''],
    ['',  'Makan & Minum'],
    ['',  'Transport'],
    ['',  'Belanja'],
    ['',  'Tagihan        (listrik, air, internet, dll)'],
    ['',  'Kesehatan      (obat, dokter, dll)'],
    ['',  'Pendidikan     (kursus, buku, dll)'],
    ['',  'Hiburan        (streaming, nonton, dll)'],
    ['',  'Tabungan / Investasi'],
    ['',  'Lain-lain'],
    [],
    ['TIPS:'],
    ['',  '→  Isi satu baris per transaksi'],
    ['',  '→  Kosongkan kolom yang tidak berlaku (jangan tulis 0)'],
    ['',  '→  Kolom Kategori bebas diisi sesuai kebutuhan Anda'],
    ['',  '→  File ini bisa langsung diupload ke AI Financial Intelligence'],
  ];

  const wsGuide = XLSX.utils.aoa_to_sheet(guideData);
  wsGuide['!cols'] = [{ wch: 24 }, { wch: 55 }];
  XLSX.utils.book_append_sheet(wb, wsGuide, 'Panduan');

  writeFile(wb, 'Template_Personal_Finance.xlsx');
};

// ─── Template UMKM ────────────────────────────────────────────────────────────

export const downloadUMKMTemplate = () => {
  const wb = XLSX.utils.book_new();

  // ── Sheet 1: Jurnal Harian ────────────────────────────────────────────────
  const journalData = [
    // Header
    ['Tanggal', 'Keterangan', 'Uang Masuk (Rp)', 'Uang Keluar (Rp)', 'Kategori'],
    // Sample rows — contoh usaha keripik pisang
    [dateOffset(7), 'Penjualan produk - 50 pcs',            750000,        '',      'Pendapatan'],
    [dateOffset(7), 'Beli bahan baku pisang 10kg',           '',          85000,    'Bahan Baku'],
    [dateOffset(6), 'Penjualan ke reseller Bu Sari',       1300000,        '',      'Pendapatan'],
    [dateOffset(6), 'Ongkos kirim ke reseller',              '',          25000,    'Operasional'],
    [dateOffset(5), 'Beli minyak goreng 5L',                 '',          72000,    'Bahan Baku'],
    [dateOffset(5), 'Bayar listrik bulan ini',               '',         350000,    'Operasional'],
    [dateOffset(4), 'Penjualan produk - 45 pcs',            675000,        '',      'Pendapatan'],
    [dateOffset(4), 'Biaya promosi Instagram Ads',           '',         150000,    'Pemasaran'],
    [dateOffset(3), 'Bayar gaji karyawan 2 orang',           '',        1800000,    'Gaji'],
    [dateOffset(3), 'Beli kemasan plastik 200 pcs',          '',          60000,    'Bahan Baku'],
    [dateOffset(2), 'Penjualan produk - 70 pcs',           1050000,        '',      'Pendapatan'],
    [dateOffset(2), 'Bayar sewa tempat produksi',            '',         500000,    'Operasional'],
    [dateOffset(1), 'Beli bumbu dan rempah',                 '',          45000,    'Bahan Baku'],
    [dateOffset(1), 'Biaya cetak label produk',              '',          80000,    'Pemasaran'],
    [today(),       'Penjualan produk - 60 pcs',            900000,        '',      'Pendapatan'],
    [today(),       'Beli gas LPG 3 tabung',                 '',          57000,    'Operasional'],
    // 10 empty rows
    ...Array(10).fill(['', '', '', '', '']),
  ];

  const wsJournal = XLSX.utils.aoa_to_sheet(journalData);
  applyWidths(wsJournal);
  XLSX.utils.book_append_sheet(wb, wsJournal, 'Jurnal Harian');

  // ── Sheet 2: Panduan Kategori ─────────────────────────────────────────────
  const guideData = [
    ['PANDUAN PENGISIAN TEMPLATE UMKM / BISNIS'],
    [],
    ['FORMAT KOLOM:'],
    ['Tanggal',           'Format DD/MM/YYYY  →  contoh: 15/08/2025'],
    ['Keterangan',        'Isi bebas — deskripsi singkat transaksi'],
    ['Uang Masuk (Rp)',   'Nominal pemasukan (pendapatan, penerimaan). Kosongkan jika pengeluaran'],
    ['Uang Keluar (Rp)',  'Nominal pengeluaran. Kosongkan jika pemasukan'],
    ['Kategori',          'WAJIB DIISI — menentukan cara hitung Laba Rugi. Lihat daftar di bawah'],
    [],
    ['DAFTAR KATEGORI STANDAR UMKM:'],
    [],
    ['Uang Masuk:',       ''],
    ['',  'Pendapatan      → hasil penjualan produk / jasa (WAJIB pakai kategori ini untuk omzet)'],
    ['',  'Pendapatan Lain → pendapatan di luar usaha utama (mis: sewa aset, bunga)'],
    [],
    ['Uang Keluar:',      ''],
    ['',  'Bahan Baku      → pembelian bahan untuk produksi (masuk HPP / COGS)'],
    ['',  'Gaji            → upah karyawan / tenaga kerja'],
    ['',  'Operasional     → listrik, air, sewa, ongkos kirim, bahan bakar, dll'],
    ['',  'Pemasaran       → iklan, promosi, biaya endorse, cetak brosur, dll'],
    ['',  'Administrasi    → biaya bank, ATK, perizinan, dll'],
    ['',  'Modal           → setoran modal pemilik (bukan biaya, masuk ekuitas)'],
    ['',  'Utang           → pinjaman yang diterima (masuk liabilitas)'],
    ['',  'Lain-lain       → pengeluaran yang tidak termasuk kategori di atas'],
    [],
    ['CARA KERJA KALKULASI LABA RUGI:'],
    ['',  'Pendapatan'],
    ['',  '   dikurangi  Bahan Baku (HPP)'],
    ['',  '   ─────────────────────────'],
    ['',  '   = Laba Kotor'],
    ['',  '   dikurangi  Gaji + Operasional + Pemasaran + Administrasi + Lain-lain'],
    ['',  '   ─────────────────────────'],
    ['',  '   = Laba Bersih'],
    [],
    ['TIPS:'],
    ['',  '→  Isi satu baris per transaksi, satu bulan per file atau per sheet'],
    ['',  '→  Pisahkan bahan baku dan biaya operasional agar HPP lebih akurat'],
    ['',  '→  Kosongkan kolom yang tidak berlaku (jangan tulis 0)'],
    ['',  '→  File ini bisa langsung diupload ke AI Financial Intelligence'],
  ];

  const wsGuide = XLSX.utils.aoa_to_sheet(guideData);
  wsGuide['!cols'] = [{ wch: 20 }, { wch: 65 }];
  XLSX.utils.book_append_sheet(wb, wsGuide, 'Panduan');

  writeFile(wb, 'Template_UMKM_Bisnis.xlsx');
};
