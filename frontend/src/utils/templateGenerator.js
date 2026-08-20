import XLSX from 'xlsx-js-style';

// ─── Shared helpers ────────────────────────────────────────────────────────────

const COLORS = {
  black: '000000',
  white: 'FFFFFF',
  slate: '1F2937',
  border: 'D1D5DB',
};

const BORDER = {
  top: { style: 'thin', color: { rgb: COLORS.border } },
  bottom: { style: 'thin', color: { rgb: COLORS.border } },
  left: { style: 'thin', color: { rgb: COLORS.border } },
  right: { style: 'thin', color: { rgb: COLORS.border } },
};

const HEADER_STYLE = {
  fill: { patternType: 'solid', fgColor: { rgb: COLORS.black } },
  font: { name: 'Aptos', sz: 11, bold: true, color: { rgb: COLORS.white } },
  alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
  border: BORDER,
};

const BODY_STYLE = {
  fill: { patternType: 'solid', fgColor: { rgb: COLORS.white } },
  font: { name: 'Aptos', sz: 10, color: { rgb: COLORS.black } },
  alignment: { vertical: 'center' },
  border: BORDER,
};

const MARKER_STYLE = {
  fill: { patternType: 'solid', fgColor: { rgb: COLORS.slate } },
  font: { name: 'Aptos', sz: 10, bold: true, color: { rgb: COLORS.white } },
  alignment: { vertical: 'center', wrapText: true },
  border: BORDER,
};

const GUIDE_TITLE_STYLE = {
  fill: { patternType: 'solid', fgColor: { rgb: COLORS.black } },
  font: { name: 'Aptos Display', sz: 14, bold: true, color: { rgb: COLORS.white } },
  alignment: { vertical: 'center', wrapText: true },
  border: BORDER,
};

const GUIDE_SECTION_STYLE = {
  fill: { patternType: 'solid', fgColor: { rgb: COLORS.slate } },
  font: { name: 'Aptos', sz: 11, bold: true, color: { rgb: COLORS.white } },
  alignment: { vertical: 'center', wrapText: true },
  border: BORDER,
};

const cellAt = (ws, row, col) => ws[XLSX.utils.encode_cell({ r: row - 1, c: col - 1 })];

const styleRow = (ws, row, style, columnCount = 5) => {
  for (let col = 1; col <= columnCount; col += 1) {
    const ref = XLSX.utils.encode_cell({ r: row - 1, c: col - 1 });
    if (!ws[ref]) ws[ref] = { t: 's', v: '' };
    ws[ref].s = style;
  }
};

const styleLedgerSheet = (ws, { headerRow, endRow, widths, markerRows = [] }) => {
  ws['!cols'] = widths;
  ws['!freeze'] = { xSplit: 0, ySplit: headerRow };
  ws['!autofilter'] = { ref: `A${headerRow}:E${endRow}` };
  ws['!rows'] = ws['!rows'] || [];
  ws['!rows'][headerRow - 1] = { hpt: 28 };

  for (let row = headerRow; row <= endRow; row += 1) {
    for (let col = 1; col <= 5; col += 1) {
      const cell = cellAt(ws, row, col);
      if (!cell) continue;
      cell.s = { ...BODY_STYLE };
      if (col === 3 || col === 4) {
        cell.z = '#,##0;[Red]-#,##0';
        cell.s = { ...cell.s, alignment: { ...BODY_STYLE.alignment, horizontal: 'right' } };
      }
    }
  }

  styleRow(ws, headerRow, HEADER_STYLE);
  markerRows.forEach((row) => styleRow(ws, row, MARKER_STYLE));
};

const styleGuideSheet = (ws, { titleRows = [1], sectionRows = [] } = {}) => {
  ws['!cols'] = [{ wch: 26 }, { wch: 72 }];
  ws['!freeze'] = { xSplit: 0, ySplit: 1 };
  titleRows.forEach((row) => styleRow(ws, row, GUIDE_TITLE_STYLE, 2));
  sectionRows.forEach((row) => styleRow(ws, row, GUIDE_SECTION_STYLE, 2));
  const range = XLSX.utils.decode_range(ws['!ref']);
  for (let row = range.s.r + 1; row <= range.e.r + 1; row += 1) {
    for (let col = 1; col <= 2; col += 1) {
      const cell = cellAt(ws, row, col);
      if (cell && !titleRows.includes(row) && !sectionRows.includes(row)) {
        cell.s = { ...BODY_STYLE, alignment: { ...BODY_STYLE.alignment, wrapText: true } };
      }
    }
  }
};

const buildGuideSheet = (kind) => {
  const isUmkm = kind === 'umkm';
  const guideData = [
    [isUmkm ? 'PANDUAN TEMPLATE UMKM / BISNIS' : 'PANDUAN TEMPLATE PERSONAL FINANCE', ''],
    ['', ''],
    ['CARA PAKAI', ''],
    ['1. Isi saldo kas awal', 'Isi nominal kas yang sudah tersedia sebelum transaksi pertama pada baris >> SALDO AWAL BULAN <<, kolom C.'],
    ['2. Isi transaksi', 'Satu baris untuk satu transaksi. Isi tanggal, keterangan, salah satu kolom nominal, dan kategori.'],
    ['3. Simpan dan upload', 'Jangan menghapus nama kolom. Simpan file Excel ini lalu upload ke AI Financial Intelligence.'],
    ['', ''],
    ['FORMAT KOLOM', ''],
    ['Tanggal', 'Gunakan format DD/MM/YYYY, contoh 15/08/2026.'],
    ['Keterangan', 'Tulis deskripsi singkat dan jelas, misalnya Bayar listrik atau Penjualan produk.'],
    ['Uang Masuk (Rp)', 'Isi pemasukan/kas masuk. Kosongkan jika transaksi adalah pengeluaran.'],
    ['Uang Keluar (Rp)', 'Isi pengeluaran/kas keluar. Kosongkan jika transaksi adalah pemasukan.'],
    ['Kategori', isUmkm ? 'Gunakan kategori usaha agar omzet, HPP, biaya, aset, piutang, dan utang bisa ditinjau.' : 'Gunakan kategori yang paling sesuai. Jika ragu, tulis keterangan lengkap untuk ditinjau manual.'],
    ['', ''],
    ['SALDO KAS', ''],
    ['>> SALDO AWAL BULAN <<', 'Isi angka pada kolom C. Ini adalah kas sebelum periode dimulai, bukan pendapatan dan tidak masuk Laba Rugi.'],
    ['>> SALDO AKHIR <<', 'Dihitung otomatis oleh formula dari Saldo Awal + Uang Masuk - Uang Keluar. Jangan diisi manual.'],
    ['', ''],
    [isUmkm ? 'KATEGORI UMKM YANG DISARANKAN' : 'KATEGORI PERSONAL YANG DISARANKAN', ''],
    ...(isUmkm
      ? [
          ['Pendapatan', 'Penjualan produk/jasa yang sudah diterima kas.'],
          ['Bahan Baku', 'Pembelian bahan untuk produksi; dipakai dalam analisis HPP.'],
          ['Operasional', 'Listrik, air, sewa, ongkir, bahan bakar, dan biaya usaha rutin.'],
          ['Pemasaran', 'Iklan, promosi, endorse, foto produk, dan materi pemasaran.'],
          ['Aset Tetap', 'Peralatan, kendaraan, mesin, atau aset usaha jangka panjang.'],
          ['Piutang Usaha', 'Penjualan yang belum dibayar pelanggan; perlu tanggal jatuh tempo/review manual.'],
          ['Utang Usaha / Utang Bank', 'Kewajiban kepada pemasok atau pinjaman yang belum dilunasi.'],
        ]
      : [
          ['Gaji / Penghasilan Lain', 'Pemasukan dari pekerjaan, freelance, bonus, atau sumber lain.'],
          ['Makan & Minum / Belanja', 'Pengeluaran konsumsi dan kebutuhan rumah tangga.'],
          ['Tagihan / Transport / Kesehatan', 'Pengeluaran rutin sesuai jenisnya.'],
          ['Piutang', 'Uang yang dipinjamkan atau masih harus diterima; tambahkan jatuh tempo bila diketahui.'],
          ['Utang / Cicilan', 'Kewajiban atau cicilan yang masih harus dibayar.'],
        ]),
    ['', ''],
    ['CATATAN UNTUK SISTEM', ''],
    ['Sheet yang dibaca', 'Sistem membaca sheet Jurnal Harian. Sheet Panduan hanya untuk petunjuk dan tidak dihitung sebagai transaksi.'],
    ['Saldo awal', 'Baris saldo awal/akhir tidak dihitung sebagai transaksi. Nilai saldo awal dibaca sebagai Kas Awal jika diisi pada kolom C.'],
    ['Review manual', 'Klasifikasi hutang, piutang, aset, dan transaksi kredit dapat memerlukan konfirmasi pengguna.'],
  ];

  const ws = XLSX.utils.aoa_to_sheet(guideData);
  styleGuideSheet(ws, { sectionRows: [3, 8, 15, 19, 27] });
  return ws;
};

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

    const numRows = rows.length;
    const dataStart = 4;
    const dataEnd   = dataStart + numRows - 1;
    const allRows = [
      ['>> SALDO AWAL BULAN <<', '<-- OPSIONAL: isi nominal kas awal di kolom "Uang Masuk" (kolom C) di baris ini -->', 2500000, '', 'Bukan pemasukan — ini posisi kas Anda SEBELUM transaksi bulan ini. Kosongkan jika tidak tahu.'],
      ['', '', '', '', ''],
      ...rows,
      ['', '', '', '', ''],
      ['>> SALDO AKHIR <<', 'Saldo Awal + Total Masuk - Total Keluar (otomatis)',
        { f: `C1+SUMIF(C${dataStart}:C${dataEnd},"<>",C${dataStart}:C${dataEnd})-SUMIF(D${dataStart}:D${dataEnd},"<>",D${dataStart}:D${dataEnd})` },
        '', ''],
    ];
    const ws = XLSX.utils.aoa_to_sheet(allRows);
    styleLedgerSheet(ws, {
      headerRow: 3,
      endRow: allRows.length,
      widths: [{ wch: 14 }, { wch: 38 }, { wch: 18 }, { wch: 18 }, { wch: 22 }],
      markerRows: [1, allRows.length],
    });
    XLSX.utils.book_append_sheet(wb, ws, label);
  }

  XLSX.utils.book_append_sheet(wb, buildGuideSheet('personal'), 'Panduan');

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

    const numRows = rows.length;
    const dataStart = 4;
    const dataEnd   = dataStart + numRows - 1;
    const allRows = [
      ['>> SALDO AWAL BULAN <<', '<-- OPSIONAL: isi nominal kas awal di kolom "Uang Masuk" (kolom C) di baris ini -->', 3500000, '', 'Bukan pemasukan — ini posisi kas Anda SEBELUM transaksi bulan ini. Kosongkan jika tidak tahu.'],
      ['', '', '', '', ''],
      ...rows,
      ['', '', '', '', ''],
      ['>> SALDO AKHIR <<', 'Saldo Awal + Total Masuk - Total Keluar (otomatis)',
        { f: `C1+SUMIF(C${dataStart}:C${dataEnd},"<>",C${dataStart}:C${dataEnd})-SUMIF(D${dataStart}:D${dataEnd},"<>",D${dataStart}:D${dataEnd})` },
        '', ''],
    ];
    const ws = XLSX.utils.aoa_to_sheet(allRows);
    styleLedgerSheet(ws, {
      headerRow: 3,
      endRow: allRows.length,
      widths: [{ wch: 14 }, { wch: 38 }, { wch: 18 }, { wch: 18 }, { wch: 15 }],
      markerRows: [1, allRows.length],
    });
    XLSX.utils.book_append_sheet(wb, ws, label);
  }

  XLSX.utils.book_append_sheet(wb, buildGuideSheet('umkm'), 'Panduan');

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

    const dataRows = rows.slice(1);
    const dataStart = 4;
    const dataEnd = dataStart + dataRows.length - 1;
    const allRows = [
      ['>> SALDO AWAL BULAN <<', 'Isi kas awal periode pada kolom Uang Masuk (Rp).', 3500000, '', 'Bukan pendapatan — hanya posisi kas sebelum transaksi.'],
      ['', '', '', '', ''],
      rows[0],
      ...dataRows,
      ['', '', '', '', ''],
      ['>> SALDO AKHIR <<', 'Dihitung otomatis: Saldo Awal + Total Masuk - Total Keluar',
        { f: `C1+SUMIF(C${dataStart}:C${dataEnd},"<>",C${dataStart}:C${dataEnd})-SUMIF(D${dataStart}:D${dataEnd},"<>",D${dataStart}:D${dataEnd})` },
        '', ''],
    ];
    const ws = XLSX.utils.aoa_to_sheet(allRows);
    styleLedgerSheet(ws, {
      headerRow: 3,
      endRow: allRows.length,
      widths: [{ wch: 14 }, { wch: 42 }, { wch: 18 }, { wch: 18 }, { wch: 15 }],
      markerRows: [1, allRows.length],
    });
    XLSX.utils.book_append_sheet(wb, ws, label);
  }

  XLSX.utils.book_append_sheet(wb, buildGuideSheet('umkm'), 'Panduan');

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

  // Tambahkan baris Saldo Awal di atas dan Saldo Akhir di bawah
  const totalDataRows = journalData.length + 10; // header + sample + empty rows
  const dataStartRow = 4; // baris ke-4 (setelah 2 baris saldo awal + 1 header)
  const dataEndRow   = dataStartRow + totalDataRows - 1;

  const journalWithBalance = [
    ['>> SALDO AWAL BULAN <<', 'Isi nominal kas awal bulan di kolom sebelah kanan -->', 0, '', 'Bukan pemasukan — ini posisi kas Anda sebelum transaksi bulan ini'],
    ['', '', '', '', ''],
    ...journalData,
    ['', '', '', '', ''],
    ['>> SALDO AKHIR <<', 'Dihitung otomatis: Saldo Awal + Total Masuk - Total Keluar',
      { f: `C1+SUMIF(C${dataStartRow}:C${dataEndRow},"<>",C${dataStartRow}:C${dataEndRow})-SUMIF(D${dataStartRow}:D${dataEndRow},"<>",D${dataStartRow}:D${dataEndRow})` },
      '', ''],
  ];

  const wsJournal = XLSX.utils.aoa_to_sheet(journalWithBalance);
  styleLedgerSheet(wsJournal, {
    headerRow: 3,
    endRow: journalWithBalance.length,
    widths: COL_WIDTHS,
    markerRows: [1, journalWithBalance.length],
  });
  XLSX.utils.book_append_sheet(wb, wsJournal, 'Jurnal Harian');

  // ── Sheet 2: Panduan pengisian ────────────────────────────────────────────
  const wsGuide = buildGuideSheet('personal');
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

  const totalUMKMRows = journalData.length;
  const umkmDataStart = 4;
  const umkmDataEnd   = umkmDataStart + totalUMKMRows - 1;

  const journalWithBalance = [
    ['>> SALDO AWAL BULAN <<', 'Isi nominal kas awal bulan di kolom sebelah kanan -->', 0, '', 'Bukan pemasukan — ini posisi kas usaha sebelum transaksi bulan ini'],
    ['', '', '', '', ''],
    ...journalData,
    ['', '', '', '', ''],
    ['>> SALDO AKHIR <<', 'Dihitung otomatis: Saldo Awal + Total Masuk - Total Keluar',
      { f: `C1+SUMIF(C${umkmDataStart}:C${umkmDataEnd},"<>",C${umkmDataStart}:C${umkmDataEnd})-SUMIF(D${umkmDataStart}:D${umkmDataEnd},"<>",D${umkmDataStart}:D${umkmDataEnd})` },
      '', ''],
  ];

  const wsJournal = XLSX.utils.aoa_to_sheet(journalWithBalance);
  styleLedgerSheet(wsJournal, {
    headerRow: 3,
    endRow: journalWithBalance.length,
    widths: COL_WIDTHS,
    markerRows: [1, journalWithBalance.length],
  });
  XLSX.utils.book_append_sheet(wb, wsJournal, 'Jurnal Harian');

  // ── Sheet 2: Panduan pengisian ────────────────────────────────────────────
  const wsGuide = buildGuideSheet('umkm');
  XLSX.utils.book_append_sheet(wb, wsGuide, 'Panduan');

  writeFile(wb, 'Template_UMKM_Bisnis.xlsx');
};
