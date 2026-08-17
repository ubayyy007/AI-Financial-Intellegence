import * as XLSX from 'xlsx';

// ─── Shared helpers ────────────────────────────────────────────────────────────

const fmtDate = (y, m, d) =>
  `${String(d).padStart(2,'0')}/${String(m).padStart(2,'0')}/${y}`;

// ─── Demo Personal Finance (3 bulan: Jan–Mar 2024) ─────────────────────────────

const buildPersonalWorkbook = () => {
  const wb = XLSX.utils.book_new();

  const months = [
    { label: 'Januari 2024', m: 1, gaji: 8500000, bonus: 0 },
    { label: 'Februari 2024', m: 2, gaji: 8500000, bonus: 1000000 },
    { label: 'Maret 2024',    m: 3, gaji: 8500000, bonus: 0 },
  ];

  for (const { label, m, gaji, bonus } of months) {
    const y = 2024;
    const rows = [
      ['Tanggal', 'Keterangan', 'Uang Masuk (Rp)', 'Uang Keluar (Rp)', 'Kategori'],
      [fmtDate(y,m,1),  'Gaji bulanan',               gaji,        '',        'Gaji'],
      bonus ? [fmtDate(y,m,1), 'Bonus kinerja Q4',   bonus,        '',        'Gaji'] : null,
      [fmtDate(y,m,3),  'Belanja bulanan Indomaret',   '',         320000,    'Belanja'],
      [fmtDate(y,m,4),  'Ongkos GoRide',               '',          18000,    'Transport'],
      [fmtDate(y,m,5),  'Bayar tagihan listrik',        '',         215000,    'Tagihan'],
      [fmtDate(y,m,5),  'Bayar internet Indihome',      '',         300000,    'Tagihan'],
      [fmtDate(y,m,6),  'Makan siang kantor',           '',          45000,    'Makan & Minum'],
      [fmtDate(y,m,7),  'Beli kopi & snack',            '',          32000,    'Makan & Minum'],
      [fmtDate(y,m,8),  'Freelance desain web',        750000,        '',      'Penghasilan Lain'],
      [fmtDate(y,m,10), 'Bayar cicilan motor',           '',         850000,    'Cicilan'],
      [fmtDate(y,m,11), 'Belanja fashion online',        '',         275000,    'Belanja'],
      [fmtDate(y,m,12), 'Makan malam keluarga',          '',          95000,    'Makan & Minum'],
      [fmtDate(y,m,13), 'Top-up GoPay',                  '',         200000,    'Lain-lain'],
      [fmtDate(y,m,14), 'Parkir & bensin motor',          '',          85000,    'Transport'],
      [fmtDate(y,m,15), 'Obat & vitamin apotek',          '',          63000,    'Kesehatan'],
      [fmtDate(y,m,17), 'Bayar BPJS Kesehatan',           '',          74000,    'Tagihan'],
      [fmtDate(y,m,18), 'Tabungan bulanan',               '',         500000,    'Tabungan / Investasi'],
      [fmtDate(y,m,19), 'Makan siang & ojek',             '',          60000,    'Makan & Minum'],
      [fmtDate(y,m,20), 'Nonton bioskop',                 '',          75000,    'Hiburan'],
      [fmtDate(y,m,21), 'Transfer dari saudara',         200000,        '',      'Transfer Masuk'],
      [fmtDate(y,m,22), 'Belanja sayur & lauk',           '',          95000,    'Makan & Minum'],
      [fmtDate(y,m,23), 'Spotify & Netflix',              '',          98000,    'Hiburan'],
      [fmtDate(y,m,24), 'Ongkos GoCar ke bandara',        '',         120000,    'Transport'],
      [fmtDate(y,m,25), 'Belanja perlengkapan rumah',     '',         185000,    'Belanja'],
      [fmtDate(y,m,26), 'Kursus online Udemy',            '',         149000,    'Pendidikan'],
      [fmtDate(y,m,27), 'Makan malam & minuman',          '',          78000,    'Makan & Minum'],
      [fmtDate(y,m,28), 'Beli buku pengembangan diri',    '',          89000,    'Pendidikan'],
    ].filter(Boolean);

    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = [{ wch: 14 }, { wch: 38 }, { wch: 18 }, { wch: 18 }, { wch: 22 }];
    XLSX.utils.book_append_sheet(wb, ws, label);
  }

  return wb;
};

export const downloadDemoPersonal = () => XLSX.writeFile(buildPersonalWorkbook(), 'Demo_Personal_Finance.xlsx');

export const generateDemoPersonalFile = () => {
  const buf = XLSX.write(buildPersonalWorkbook(), { bookType: 'xlsx', type: 'array' });
  return new File([buf], 'Demo_Personal_Finance.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
};

// ─── Demo Toko / Warung (3 bulan: Jan–Mar 2024) ────────────────────────────────

const buildWarungWorkbook = () => {
  const wb = XLSX.utils.book_new();

  const months = [
    { label: 'Januari 2024', m: 1 },
    { label: 'Februari 2024', m: 2 },
    { label: 'Maret 2024',    m: 3 },
  ];

  for (const { label, m } of months) {
    const y = 2024;
    const rows = [
      ['Tanggal', 'Keterangan', 'Uang Masuk (Rp)', 'Uang Keluar (Rp)', 'Kategori'],
      [fmtDate(y,m,1),  'Penjualan harian — Senin',       850000,        '',       'Pendapatan'],
      [fmtDate(y,m,1),  'Beli stok beras 25kg',            '',          275000,    'Bahan Baku'],
      [fmtDate(y,m,2),  'Penjualan harian — Selasa',       920000,        '',       'Pendapatan'],
      [fmtDate(y,m,2),  'Beli stok minyak goreng 10L',     '',           95000,    'Bahan Baku'],
      [fmtDate(y,m,3),  'Penjualan harian — Rabu',         780000,        '',       'Pendapatan'],
      [fmtDate(y,m,3),  'Beli gula & kopi curah',          '',           55000,    'Bahan Baku'],
      [fmtDate(y,m,4),  'Penjualan harian — Kamis',       1050000,        '',       'Pendapatan'],
      [fmtDate(y,m,4),  'Bayar listrik toko',              '',          175000,    'Operasional'],
      [fmtDate(y,m,5),  'Penjualan harian — Jumat',       1200000,        '',       'Pendapatan'],
      [fmtDate(y,m,6),  'Penjualan harian — Sabtu',       1450000,        '',       'Pendapatan'],
      [fmtDate(y,m,6),  'Beli stok sembako mingguan',      '',          420000,    'Bahan Baku'],
      [fmtDate(y,m,8),  'Penjualan harian — Senin',        890000,        '',       'Pendapatan'],
      [fmtDate(y,m,9),  'Penjualan harian — Selasa',       760000,        '',       'Pendapatan'],
      [fmtDate(y,m,10), 'Penjualan harian — Rabu',         840000,        '',       'Pendapatan'],
      [fmtDate(y,m,10), 'Bayar sewa kios bulan ini',       '',          600000,    'Operasional'],
      [fmtDate(y,m,11), 'Penjualan harian — Kamis',        990000,        '',       'Pendapatan'],
      [fmtDate(y,m,12), 'Penjualan harian — Jumat',       1100000,        '',       'Pendapatan'],
      [fmtDate(y,m,13), 'Penjualan harian — Sabtu',       1380000,        '',       'Pendapatan'],
      [fmtDate(y,m,13), 'Beli stok minuman kemasan',       '',          235000,    'Bahan Baku'],
      [fmtDate(y,m,15), 'Penjualan harian — Senin',        820000,        '',       'Pendapatan'],
      [fmtDate(y,m,16), 'Penjualan harian — Selasa',       730000,        '',       'Pendapatan'],
      [fmtDate(y,m,16), 'Gaji karyawan 1 orang',           '',          900000,    'Gaji'],
      [fmtDate(y,m,17), 'Penjualan harian — Rabu',         870000,        '',       'Pendapatan'],
      [fmtDate(y,m,18), 'Penjualan harian — Kamis',       1010000,        '',       'Pendapatan'],
      [fmtDate(y,m,19), 'Penjualan harian — Jumat',       1150000,        '',       'Pendapatan'],
      [fmtDate(y,m,20), 'Penjualan harian — Sabtu',       1500000,        '',       'Pendapatan'],
      [fmtDate(y,m,20), 'Beli stok sembako mingguan',      '',          390000,    'Bahan Baku'],
      [fmtDate(y,m,22), 'Penjualan harian — Senin',        800000,        '',       'Pendapatan'],
      [fmtDate(y,m,23), 'Penjualan harian — Selasa',       745000,        '',       'Pendapatan'],
      [fmtDate(y,m,24), 'Penjualan harian — Rabu',         810000,        '',       'Pendapatan'],
      [fmtDate(y,m,24), 'Biaya plastik kresek & kantong',  '',           35000,    'Operasional'],
      [fmtDate(y,m,25), 'Penjualan harian — Kamis',        940000,        '',       'Pendapatan'],
      [fmtDate(y,m,26), 'Penjualan harian — Jumat',       1080000,        '',       'Pendapatan'],
      [fmtDate(y,m,27), 'Penjualan harian — Sabtu',       1420000,        '',       'Pendapatan'],
      [fmtDate(y,m,27), 'Beli stok akhir bulan',           '',          445000,    'Bahan Baku'],
    ];

    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = [{ wch: 14 }, { wch: 38 }, { wch: 18 }, { wch: 18 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(wb, ws, label);
  }

  return wb;
};

export const downloadDemoWarung = () => XLSX.writeFile(buildWarungWorkbook(), 'Demo_Toko_Warung.xlsx');

export const generateDemoWarungFile = () => {
  const buf = XLSX.write(buildWarungWorkbook(), { bookType: 'xlsx', type: 'array' });
  return new File([buf], 'Demo_Toko_Warung.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
};

// ─── Demo Bisnis UMKM (3 bulan: Jan–Mar 2024) ──────────────────────────────────

const buildUMKMWorkbook = () => {
  const wb = XLSX.utils.book_new();

  const months = [
    { label: 'Januari 2024', m: 1, order: 42 },
    { label: 'Februari 2024', m: 2, order: 38 },
    { label: 'Maret 2024',    m: 3, order: 55 },
  ];

  for (const { label, m, order } of months) {
    const y = 2024;
    const rows = [
      ['Tanggal', 'Keterangan', 'Uang Masuk (Rp)', 'Uang Keluar (Rp)', 'Kategori'],
      [fmtDate(y,m,2),  `Penjualan online ${order} order`,  order*185000,    '',        'Pendapatan'],
      [fmtDate(y,m,2),  'Beli bahan baku produksi',           '',          2800000,    'Bahan Baku'],
      [fmtDate(y,m,3),  'Penjualan ke reseller CV Maju',     4500000,        '',        'Pendapatan'],
      [fmtDate(y,m,3),  'Ongkos kirim ekspedisi',             '',           380000,    'Operasional'],
      [fmtDate(y,m,5),  'Penjualan B2B Toko Sumber Jaya',    6200000,        '',        'Pendapatan'],
      [fmtDate(y,m,5),  'Beli kemasan & label produk',        '',           425000,    'Bahan Baku'],
      [fmtDate(y,m,7),  'Penjualan online tambahan',         1850000,        '',        'Pendapatan'],
      [fmtDate(y,m,7),  'Biaya iklan Meta Ads',               '',           750000,    'Pemasaran'],
      [fmtDate(y,m,8),  'Gaji karyawan 4 orang',              '',          8000000,    'Gaji'],
      [fmtDate(y,m,10), 'Penjualan ke distributor Surabaya', 9800000,        '',        'Pendapatan'],
      [fmtDate(y,m,10), 'Bayar listrik & air pabrik',         '',           650000,    'Operasional'],
      [fmtDate(y,m,11), 'Bayar sewa gudang produksi',         '',          2000000,    'Operasional'],
      [fmtDate(y,m,12), 'Beli mesin packaging kecil',         '',          3500000,    'Aset'],
      [fmtDate(y,m,13), 'Penjualan online 28 order',         5180000,        '',        'Pendapatan'],
      [fmtDate(y,m,14), 'Beli bahan baku tambahan',           '',          1950000,    'Bahan Baku'],
      [fmtDate(y,m,15), 'Bayar cicilan pinjaman KUR',         '',          1500000,    'Cicilan'],
      [fmtDate(y,m,16), 'Penjualan ke reseller Bandung',     3750000,        '',        'Pendapatan'],
      [fmtDate(y,m,17), 'Biaya foto produk & konten',         '',           450000,    'Pemasaran'],
      [fmtDate(y,m,18), 'Komisi marketplace Tokopedia',       '',           320000,    'Operasional'],
      [fmtDate(y,m,19), 'Penjualan pameran UMKM',            2200000,        '',        'Pendapatan'],
      [fmtDate(y,m,20), 'Biaya stand pameran',                '',           500000,    'Pemasaran'],
      [fmtDate(y,m,21), 'Penjualan online 31 order',         5735000,        '',        'Pendapatan'],
      [fmtDate(y,m,22), 'Beli bahan baku produksi',           '',          2600000,    'Bahan Baku'],
      [fmtDate(y,m,23), 'Biaya administrasi & ATK',           '',           125000,    'Administrasi'],
      [fmtDate(y,m,24), 'Penjualan ke distributor Jakarta',  8500000,        '',        'Pendapatan'],
      [fmtDate(y,m,25), 'Ongkos kirim & packaging',           '',           290000,    'Operasional'],
      [fmtDate(y,m,26), 'Biaya Google Ads bulan ini',         '',           600000,    'Pemasaran'],
      [fmtDate(y,m,27), 'Penjualan online akhir bulan',      3920000,        '',        'Pendapatan'],
      [fmtDate(y,m,28), 'Biaya pengurusan izin PIRT',         '',           350000,    'Administrasi'],
    ];

    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = [{ wch: 14 }, { wch: 42 }, { wch: 18 }, { wch: 18 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(wb, ws, label);
  }

  return wb;
};

export const downloadDemoUMKM = () => XLSX.writeFile(buildUMKMWorkbook(), 'Demo_Bisnis_UMKM.xlsx');

export const generateDemoUMKMFile = () => {
  const buf = XLSX.write(buildUMKMWorkbook(), { bookType: 'xlsx', type: 'array' });
  return new File([buf], 'Demo_Bisnis_UMKM.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
};

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
