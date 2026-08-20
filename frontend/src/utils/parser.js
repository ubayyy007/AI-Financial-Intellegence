import Papa from 'papaparse';
import { parsePDFWithAI, parseTextWithAI } from './pdfParser';

let xlsxPromise;
const loadXLSX = () => {
  if (!xlsxPromise) xlsxPromise = import('xlsx');
  return xlsxPromise;
};

// ─── Number Parsing ───────────────────────────────────────────────────────────
// Handles: Indonesian format (1.500.000 or 1.500.000,50), US format (1,500,000.50),
// currency symbols (Rp, $), negative values in parentheses (1.000.000)

const parseNumber = (val) => {
  if (val === null || val === undefined || val === '') return 0;
  if (typeof val === 'number') return val;

  let s = val.toString().trim();

  // Strip currency symbols, spaces, and Rp prefix
  s = s.replace(/[Rp$€£¥\s]/gi, '');

  // Handle accounting negative: (1.000.000) → -1000000
  const isNegative = s.startsWith('(') && s.endsWith(')');
  if (isNegative) s = s.slice(1, -1);

  // Determine number format by inspecting separators
  const commaCount = (s.match(/,/g) || []).length;
  const dotCount = (s.match(/\./g) || []).length;
  const lastCommaIdx = s.lastIndexOf(',');
  const lastDotIdx = s.lastIndexOf('.');

  if (commaCount > 0 && dotCount > 0) {
    if (lastCommaIdx > lastDotIdx) {
      // Indonesian: 1.500.000,50 → remove dots, comma becomes decimal
      s = s.replace(/\./g, '').replace(',', '.');
    } else {
      // US: 1,500,000.50 → remove commas
      s = s.replace(/,/g, '');
    }
  } else if (commaCount > 0 && dotCount === 0) {
    const parts = s.split(',');
    if (parts.length === 2 && parts[1].length <= 2) {
      // Decimal comma: 1500,50
      s = s.replace(',', '.');
    } else {
      // Thousands comma: 1,500,000
      s = s.replace(/,/g, '');
    }
  } else if (dotCount > 1) {
    // Multiple dots = Indonesian thousands: 1.500.000
    s = s.replace(/\./g, '');
  } else if (dotCount === 1) {
    const afterDot = s.split('.')[1];
    if (afterDot && afterDot.length === 3) {
      // Ambiguous: could be 1.500 (thousands) — treat as thousands if no decimal follows
      s = s.replace('.', '');
    }
    // Otherwise keep dot as decimal separator
  }

  s = s.replace(/[^0-9.-]/g, '');
  const result = parseFloat(s);
  const final = isNaN(result) ? 0 : result;
  return isNegative ? -Math.abs(final) : final;
};

// ─── Date Parsing ─────────────────────────────────────────────────────────────

const ID_MONTHS = {
  januari: '01', februari: '02', maret: '03', april: '04',
  mei: '05', juni: '06', juli: '07', agustus: '08',
  september: '09', oktober: '10', november: '11', desember: '12',
  jan: '01', feb: '02', mar: '03', apr: '04',
  mei2: '05', jun: '06', jul: '07', agu: '08', aug: '08',
  sep: '09', okt: '10', oct: '10', nov: '11', des: '12', dec: '12',
};

const parseDate = (val) => {
  if (!val && val !== 0) return null;

  // JS Date object (from XLSX cellDates:true)
  if (val instanceof Date && !isNaN(val)) {
    return val.toISOString().substring(0, 10);
  }

  // Excel serial date number (days since 1899-12-30)
  if (typeof val === 'number' && val > 25569 && val < 60000) {
    const jsDate = new Date(Math.round((val - 25569) * 86400 * 1000));
    return jsDate.toISOString().substring(0, 10);
  }

  const s = val.toString().trim();
  if (!s) return null;

  // Already ISO: 2024-01-15
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.substring(0, 10);

  // DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY
  const dmyMatch = s.match(new RegExp('^(\\d{1,2})[-/.–](\\d{1,2})[-/.–](\\d{4})'));
  if (dmyMatch) {
    const [, d, m, y] = dmyMatch;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }

  // MM/DD/YYYY (US format — less likely but handle it)
  const mdyMatch = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (mdyMatch) {
    const [, a, b, y] = mdyMatch;
    // Heuristic: if a > 12, it must be day
    if (parseInt(a) > 12) {
      return `${y}-${b.padStart(2, '0')}-${a.padStart(2, '0')}`;
    }
    // Ambiguous — assume DD/MM for Indonesian context
    return `${y}-${b.padStart(2, '0')}-${a.padStart(2, '0')}`;
  }

  // "15 Januari 2024" or "15 Jan 2024"
  const idMatch = s.match(/(\d{1,2})\s+([a-zA-Z]+)\s+(\d{4})/);
  if (idMatch) {
    const [, d, mStr, y] = idMatch;
    const mKey = mStr.toLowerCase();
    const m = ID_MONTHS[mKey] || ID_MONTHS[mKey.substring(0, 3)] || '01';
    return `${y}-${m}-${d.padStart(2, '0')}`;
  }

  return s.length <= 20 ? s : null;
};

// ─── Header Row Detection ──────────────────────────────────────────────────────
// Scans the first 25 rows to find the row most likely to be the column header.

const HEADER_KEYWORDS = [
  'tanggal', 'date', 'tgl', 'waktu', 'periode', 'bulan',
  'deskripsi', 'description', 'keterangan', 'uraian', 'narasi', 'berita', 'detail', 'transaksi', 'nota',
  'kategori', 'category', 'akun', 'account', 'kode', 'coa', 'perkiraan', 'kelompok',
  'nominal', 'amount', 'jumlah', 'nilai', 'total', 'angka',
  'debit', 'kredit', 'credit', 'db', 'cr', 'masuk', 'keluar', 'penerimaan', 'pengeluaran', 'mutasi',
  'saldo', 'balance', 'tipe', 'type', 'jenis', 'no', 'nomor',
];

const findHeaderRow = (sheet, range, XLSX) => {
  const maxScan = Math.min(range.e.r, 25);
  let bestRow = range.s.r;
  let bestScore = -1;

  for (let r = range.s.r; r <= maxScan; r++) {
    let score = 0;
    let stringCells = 0;
    let numericCells = 0;

    for (let c = range.s.c; c <= Math.min(range.e.c, 20); c++) {
      const cell = sheet[XLSX.utils.encode_cell({ r, c })];
      if (!cell || cell.v === undefined || cell.v === '') continue;

      const val = cell.v.toString().toLowerCase().trim();

      if (typeof cell.v === 'string') {
        stringCells++;
        if (HEADER_KEYWORDS.some((kw) => val === kw || val.includes(kw))) {
          score += 3;
        } else if (val.length >= 2 && val.length <= 40) {
          score += 0.5; // generic text — slight bonus
        }
      } else if (typeof cell.v === 'number') {
        numericCells++;
        if (cell.v > 1000) score -= 1; // large numbers = data row, not header
      }
    }

    // Bonus if the next row contains numbers (data pattern follows header)
    let nextNumerics = 0;
    for (let c = range.s.c; c <= Math.min(range.e.c, 10); c++) {
      const nextCell = sheet[XLSX.utils.encode_cell({ r: r + 1, c })];
      if (nextCell && typeof nextCell.v === 'number') nextNumerics++;
    }
    if (nextNumerics >= 2) score += 3;

    if (stringCells >= 2 && score > bestScore) {
      bestScore = score;
      bestRow = r;
    }
  }

  return bestRow;
};

// ─── Column Mapping ────────────────────────────────────────────────────────────
// Maps column indices to standardized field names via keyword matching.

const COLUMN_PATTERNS = {
  date: ['tanggal', 'date', 'tgl', 'waktu', 'time', 'periode', 'bulan', 'created', 'posted'],
  description: [
    'deskripsi', 'description', 'keterangan', 'uraian', 'narasi', 'detail',
    'transaksi', 'berita', 'nota', 'memo', 'remark', 'nama transaksi',
  ],
  // accountCredited must be mapped BEFORE credit/debit to claim "Account Credited/Debited" columns
  accountCredited: ['account credited', 'akun kredit', 'akun keluar', 'credited account'],
  accountDebited:  ['account debited',  'akun debit',  'akun masuk',  'debited account'],
  category: [
    'kategori', 'category', 'akun', 'account', 'kode akun', 'coa',
    'kelompok', 'sub akun', 'perkiraan', 'kode', 'nama akun', 'jenis akun',
  ],
  amount: ['nominal', 'amount', 'jumlah', 'nilai', 'angka', 'total', 'besar', 'rupiah'],
  debit: [
    'debit', 'db', 'masuk', 'penerimaan', 'pemasukan',
    'mutasi debit', 'kredit (-)', 'uang masuk', 'kas masuk', 'debet',
  ],
  credit: [
    'kredit', 'credit', 'cr', 'keluar', 'pengeluaran',
    'mutasi kredit', 'debit (-)', 'uang keluar', 'kas keluar',
  ],
  type: ['tipe', 'type', 'jenis', 'mutasi', 'flag', 'dc', 'd/c', 'dr/cr'],
  balance: ['saldo', 'balance', 'sisa saldo', 'sal', 'sisa', 'remaining'],
  number: ['no', 'no.', 'nomor', 'number', '#', 'seq', 'id transaksi'],
};

// Single-word patterns use word-boundary matching to prevent "account debited" → debit.
// Multi-word patterns still use substring matching.
const matchesPattern = (header, pattern) => {
  if (header === pattern) return true;
  if (pattern.includes(' ')) return header.includes(pattern) || pattern.includes(header);
  try {
    return new RegExp(`\\b${pattern}\\b`).test(header);
  } catch {
    return header.includes(pattern);
  }
};

const mapColumns = (headers) => {
  const mapping = {};

  headers.forEach((header, idx) => {
    if (header === null || header === undefined) return;
    const h = header.toString().toLowerCase().trim();
    if (!h) return;

    for (const [field, patterns] of Object.entries(COLUMN_PATTERNS)) {
      if (mapping[field] !== undefined) continue; // first match wins
      if (patterns.some((p) => matchesPattern(h, p))) {
        mapping[field] = idx;
      }
    }
  });

  return mapping;
};

// ─── Row Filtering ─────────────────────────────────────────────────────────────

const SUBTOTAL_KEYWORDS = [
  'total', 'subtotal', 'sub-total', 'grand total', 'jumlah total', 'jumlah',
  'saldo akhir', 'saldo awal', 'saldo', 'opening balance', 'closing balance',
  'beginning balance', 'ending balance',
];

const isNonDataRow = (description) => {
  if (!description && description !== 0) return true;
  const d = description.toString().toLowerCase().trim();
  if (!d) return true;
  return SUBTOTAL_KEYWORDS.some((kw) => d === kw || d.startsWith(kw + ' ') || d.startsWith(kw + ':'));
};

// ─── Single Row Normalization ──────────────────────────────────────────────────

const normalizeRow = (rawValues, colMap, index) => {
  const get = (field) => {
    const idx = colMap[field];
    return idx !== undefined ? (rawValues[idx] ?? '') : '';
  };

  const description = get('description')?.toString().trim() || '';
  const category = get('category')?.toString().trim() || 'Umum';

  if (isNonDataRow(description)) return null;

  const dateVal = parseDate(get('date'));

  // ── Amount resolution: separate Debit/Kredit cols take priority ──
  let amount = 0;
  let type = '';

  const hasDebitCol = colMap.debit !== undefined;
  const hasCreditCol = colMap.credit !== undefined;
  const hasAmountCol = colMap.amount !== undefined;

  // Keywords indicating cash/bank account (used for double-entry direction detection)
  const CASH_TERMS = ['cash', 'bank', 'kas', 'tunai', 'bca', 'bni', 'bri', 'mandiri', 'danamon', 'cimb'];

  if (hasDebitCol || hasCreditCol) {
    const debitVal = parseNumber(get('debit'));
    const creditVal = parseNumber(get('credit'));

    if (debitVal !== 0 && creditVal !== 0 && debitVal === creditVal) {
      // Double-entry format: both columns have equal value.
      // Determine direction by inspecting the "Account Credited" column:
      //   Cash/Bank credited → cash going OUT → Kredit (expense/payment)
      //   Cash/Bank debited  → cash coming IN → Debit  (income/receipt)
      const accCredited = (get('accountCredited') || '').toString().toLowerCase();
      const accDebited  = (get('accountDebited')  || '').toString().toLowerCase();
      if (CASH_TERMS.some((t) => accCredited.includes(t))) {
        type = 'Kredit';
      } else if (CASH_TERMS.some((t) => accDebited.includes(t))) {
        type = 'Debit';
      } else {
        // Fallback: treat as Kredit if description looks like an expense
        type = 'Debit';
      }
      amount = debitVal;
    } else if (debitVal !== 0) {
      amount = Math.abs(debitVal);
      type = 'Debit';
    } else if (creditVal !== 0) {
      amount = Math.abs(creditVal);
      type = 'Kredit';
    } else {
      return null;
    }
  } else if (hasAmountCol) {
    const raw = parseNumber(get('amount'));
    const rawType = get('type')?.toString().toLowerCase() || '';

    if (rawType.match(/kredit|cr|keluar|out/)) {
      type = 'Kredit';
    } else if (rawType.match(/debit|db|masuk|in/)) {
      type = 'Debit';
    } else if (raw < 0) {
      type = 'Kredit';
    } else {
      type = 'Debit';
    }
    amount = Math.abs(raw);
  } else {
    return null;
  }

  if (amount === 0) return null;

  return {
    id: `${Date.now()}_${index}`,
    date: dateVal || 'N/A',
    description: description || `Row ${index + 1}`,
    category,
    amount,
    type,
  };
};

// ─── Sheet name → fallback date ────────────────────────────────────────────────
// e.g. "Januari 2024" → "2024-01-15", "Feb 2024" → "2024-02-15"

const MONTH_MAP = {
  januari:1,februari:2,maret:3,april:4,mei:5,juni:6,
  juli:7,agustus:8,september:9,oktober:10,november:11,desember:12,
  jan:1,feb:2,mar:3,apr:4,jun:6,jul:7,agu:8,aug:8,
  sep:9,okt:10,oct:10,nov:11,des:12,dec:12,
};

const dateFromSheetName = (name) => {
  const lower = name.toLowerCase();
  for (const [key, mon] of Object.entries(MONTH_MAP)) {
    if (lower.includes(key)) {
      const yearMatch = name.match(/\d{4}/);
      const y = yearMatch ? yearMatch[0] : new Date().getFullYear();
      return `${y}-${String(mon).padStart(2,'0')}-15`;
    }
  }
  return null;
};

// ─── Single-sheet transaction extractor ────────────────────────────────────────

const SKIP_SHEET_NAMES = ['cover','petunjuk','panduan','info','summary','guide','readme'];

const OPENING_BALANCE_PATTERN = /saldo\s*awal|opening\s+balance|beginning\s+balance/i;

const extractOpeningBalance = (sheet, range, headerRow, colMap, XLSX) => {
  for (let r = range.s.r; r <= range.e.r; r += 1) {
    if (r === headerRow) continue;

    const values = [];
    for (let c = range.s.c; c <= range.e.c; c += 1) {
      const cell = sheet[XLSX.utils.encode_cell({ r, c })];
      values.push(cell ? cell.v : '');
    }

    const rowText = values
      .filter((value) => value !== null && value !== undefined && value !== '')
      .map((value) => value.toString())
      .join(' ');

    if (!OPENING_BALANCE_PATTERN.test(rowText)) continue;

    // Template convention: saldo awal kas is entered in Uang Masuk (Rp).
    // Fall back to a generic nominal column for compatible user files.
    const candidateIndexes = [colMap.debit, colMap.amount, colMap.credit]
      .filter((index, position, indexes) => index !== undefined && indexes.indexOf(index) === position);
    const amount = candidateIndexes
      .map((index) => parseNumber(values[index]))
      .find((value) => value !== 0) ?? 0;

    return Math.max(0, amount);
  }

  return null;
};

const parseSheetTransactions = (sheet, sheetName, XLSX) => {
  if (!sheet['!ref']) return [];
  const range = XLSX.utils.decode_range(sheet['!ref']);
  const headerRow = findHeaderRow(sheet, range, XLSX);

  const headers = [];
  for (let c = range.s.c; c <= range.e.c; c++) {
    const cell = sheet[XLSX.utils.encode_cell({ r: headerRow, c })];
    headers.push(cell ? cell.v : null);
  }

  const colMap = mapColumns(headers);
  const hasValueCols =
    colMap.amount !== undefined ||
    colMap.debit !== undefined ||
    colMap.credit !== undefined;

  if (!hasValueCols) return []; // skip silently — caller handles the error

  const openingBalance = extractOpeningBalance(sheet, range, headerRow, colMap, XLSX);

  const fallbackDate = dateFromSheetName(sheetName);
  const results = [];

  for (let r = headerRow + 1; r <= range.e.r; r++) {
    const rawValues = [];
    let hasAnyValue = false;

    for (let c = range.s.c; c <= range.e.c; c++) {
      const cell = sheet[XLSX.utils.encode_cell({ r, c })];
      const val = cell ? cell.v : '';
      rawValues.push(val);
      if (val !== '' && val !== null && val !== undefined) hasAnyValue = true;
    }

    if (!hasAnyValue) continue;

    const normalized = normalizeRow(rawValues, colMap, r);
    if (normalized) {
      // Use sheet-name date as fallback when date column is missing/invalid
      if ((!normalized.date || normalized.date === 'N/A') && fallbackDate) {
        normalized.date = fallbackDate;
      }
      results.push(normalized);
    }
  }

  return { transactions: results, openingBalance };
};

// ─── Excel Parser — reads ALL data sheets ──────────────────────────────────────

const parseExcelSmart = (workbook, XLSX) => {
  const allTransactions = [];
  const sheetsRead = []; // { name, count } per sheet that yielded transactions
  const openingBalances = [];

  for (const sheetName of workbook.SheetNames) {
    const nameLower = sheetName.toLowerCase();
    if (SKIP_SHEET_NAMES.some((kw) => nameLower.includes(kw))) continue;

    const sheet = workbook.Sheets[sheetName];
    try {
      const parsedSheet = parseSheetTransactions(sheet, sheetName, XLSX);
      if (Array.isArray(parsedSheet)) continue;
      if (parsedSheet.openingBalance !== null) openingBalances.push(parsedSheet.openingBalance);
      if (parsedSheet.transactions.length > 0) {
        allTransactions.push(...parsedSheet.transactions);
        sheetsRead.push({ name: sheetName, count: parsedSheet.transactions.length });
      }
    } catch { /* ignore unparseable sheets */ }
  }

  if (allTransactions.length === 0) {
    throw new Error(
      'Kolom nominal/debit/kredit tidak ditemukan di semua sheet.\n' +
      'Pastikan file memiliki kolom: Nominal / Jumlah / Debit / Kredit.'
    );
  }

  const firstKnownOpeningBalance = openingBalances.find((value) => value > 0) ?? openingBalances[0] ?? null;
  return { transactions: allTransactions, sheetsRead, openingBalance: firstKnownOpeningBalance };
};

// ─── CSV Parser ────────────────────────────────────────────────────────────────

const parseCSVData = (data) => {
  if (!data.length) return [];

  const headers = Object.keys(data[0]);
  const colMap = mapColumns(headers);

  return data
    .map((row, index) => {
      const rawValues = headers.map((h) => row[h]);
      return normalizeRow(rawValues, colMap, index);
    })
    .filter(Boolean);
};

// ─── Helper: parse CSV teks → Transaction[] via Papa ──────────────────────────

const parseCSVText = (text) =>
  new Promise((resolve, reject) => {
    Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try { resolve(parseCSVData(results.data)); }
        catch (e) { reject(new Error(e.message || 'Gagal memproses CSV.')); }
      },
      error: (err) => reject(new Error(err.message || 'Gagal membaca CSV.')),
    });
  });

// ─── Confidence Score (Rule-Based) ────────────────────────────────────────────

const computeRuleBasedConfidence = (transactions) => {
  const total = transactions.length;
  if (total === 0) {
    return { score: 0, level: 'low', method: 'rule-based', warnings: ['Tidak ada transaksi yang berhasil diekstrak'], flaggedIds: [] };
  }

  let score = 90; // rule-based succeeded — start optimistic
  const warnings = [];
  const flaggedIds = [];

  let noDate = 0, zeroAmt = 0, noDesc = 0, allUmum = 0;

  for (const t of transactions) {
    let bad = false;
    if (!t.date || t.date === 'N/A') { noDate++; bad = true; }
    if (t.amount === 0) { zeroAmt++; bad = true; }
    if (!t.description || t.description.trim().length < 2) noDesc++;
    if (t.category === 'Umum') allUmum++;
    if (bad) flaggedIds.push(t.id);
  }

  if (noDate > 0) {
    score -= Math.min(20, Math.round((noDate / total) * 40));
    warnings.push(`${noDate} transaksi tidak memiliki tanggal`);
  }
  if (zeroAmt > 0) {
    score -= Math.min(15, Math.round((zeroAmt / total) * 30));
    warnings.push(`${zeroAmt} transaksi bernilai nol`);
  }
  if (noDesc > total * 0.5) {
    score -= 10;
    warnings.push('Banyak transaksi tidak memiliki keterangan');
  }
  if (allUmum === total) {
    score -= 5;
    warnings.push('Kolom kategori tidak terdeteksi — semua transaksi dikategorikan "Umum"');
  }

  const clamped = Math.max(0, Math.min(100, score));
  return {
    score: clamped,
    level: clamped >= 80 ? 'high' : clamped >= 60 ? 'medium' : 'low',
    method: 'rule-based',
    warnings,
    flaggedIds,
  };
};

// ─── Public API ────────────────────────────────────────────────────────────────
// options.onProgress — optional (msg: string) => void callback for AI processing
// Returns: { transactions: Transaction[], confidence: ConfidenceReport }

export const parseFile = async (file, options = {}) => {
  if (!file) throw new Error('Tidak ada file yang dipilih.');

  const ext = file.name.split('.').pop().toLowerCase();
  const { onProgress } = options;

  // ── PDF → selalu AI ──────────────────────────────────────────────────────────
  if (ext === 'pdf') {
    return parsePDFWithAI(file, onProgress); // already returns { transactions, confidence }
  }

  // ── CSV ──────────────────────────────────────────────────────────────────────
  if (ext === 'csv') {
    const text = await file.text();

    try {
      const transactions = await parseCSVText(text);
      if (transactions.length > 0) {
        return { transactions, confidence: computeRuleBasedConfidence(transactions) };
      }
    } catch { /* lanjut ke AI */ }

    return parseTextWithAI(text, file.name, onProgress); // already returns { transactions, confidence }
  }

  // ── Excel ────────────────────────────────────────────────────────────────────
  if (ext === 'xlsx' || ext === 'xls') {
    const XLSX = await loadXLSX();
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: 'array', cellDates: false });

    try {
      const { transactions, sheetsRead, openingBalance } = parseExcelSmart(workbook, XLSX);
      if (transactions.length > 0) {
        const result = {
          transactions,
          confidence: computeRuleBasedConfidence(transactions),
          meta: { sheetsRead },
        };
        if (openingBalance !== null && openingBalance !== undefined) result.openingBalance = openingBalance;
        return result;
      }
    } catch { /* lanjut ke AI */ }

    // Fallback: dump all non-skip sheets to CSV for AI parsing
    const dataSheetNames = workbook.SheetNames
      .filter(n => !SKIP_SHEET_NAMES.some(kw => n.toLowerCase().includes(kw)));
    const allCsv = dataSheetNames.map(n => XLSX.utils.sheet_to_csv(workbook.Sheets[n])).join('\n');
    if (!allCsv.trim()) throw new Error('Tidak ada sheet yang dapat dibaca dalam file Excel ini.');
    const aiResult = await parseTextWithAI(allCsv, file.name, onProgress);
    return { ...aiResult, meta: { sheetsRead: dataSheetNames.map(name => ({ name, count: null })) } };
  }

  throw new Error('Format tidak didukung. Upload file CSV, Excel (.xlsx / .xls), atau PDF.');
};
