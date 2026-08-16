import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Use local worker (bundled by Vite) — more reliable than CDN
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorkerUrl;

// Google Gemini — free tier: 1.500 request/hari, tidak perlu kartu kredit
const GEMINI_MODEL = import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.5-flash';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
const MAX_TEXT_CHARS = 80000;
const LS_KEY = 'gemini_api_key';

// ─── API Key Management ────────────────────────────────────────────────────────

export const getStoredApiKey = () =>
  localStorage.getItem(LS_KEY) || import.meta.env.VITE_GEMINI_API_KEY || '';

export const saveApiKey = (key) => {
  if (key && key.trim()) {
    localStorage.setItem(LS_KEY, key.trim());
  } else {
    localStorage.removeItem(LS_KEY);
  }
};

// ─── PDF Text Extraction ───────────────────────────────────────────────────────

const extractTextFromPDF = async (file, onProgress) => {
  onProgress?.('Membaca file PDF...');

  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;

  const maxPages = Math.min(pdf.numPages, 50);
  let fullText = '';

  for (let i = 1; i <= maxPages; i++) {
    onProgress?.(`Mengekstrak teks halaman ${i} / ${maxPages}...`);
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();

    // Preserve line breaks using y-position grouping
    let lastY = null;
    const lineChunks = [];
    for (const item of textContent.items) {
      if ('str' in item) {
        const y = item.transform?.[5];
        if (lastY !== null && Math.abs(y - lastY) > 5) lineChunks.push('\n');
        lineChunks.push(item.str);
        lastY = y;
      }
    }

    fullText += `\n[Halaman ${i}]\n` + lineChunks.join(' ');
  }

  return fullText.trim();
};

// ─── Gemini System Prompt ──────────────────────────────────────────────────────

const SYSTEM_PROMPT = `Kamu adalah AI spesialis ekstraksi data laporan keuangan Indonesia.
Tugasmu mengubah teks dokumen keuangan dari PDF ke format JSON terstruktur untuk dianalisis.

OUTPUT: JSON dengan format:
{
  "overall_confidence": <integer 0-100>,
  "warnings": ["peringatan 1", "peringatan 2"],
  "transactions": [...]
}
Setiap transaksi: { "date": "YYYY-MM-DD", "description": "...", "category": "...", "amount": number_positif, "type": "Debit"|"Kredit", "confidence": <integer 0-100> }

PANDUAN CONFIDENCE SCORE:
- overall_confidence: nilai kepercayaan menyeluruh terhadap hasil ekstraksi (100 = sangat yakin, 0 = sangat meragukan)
- confidence per transaksi: nilai per-baris (kurangi jika tanggal tidak jelas, angka ambigu, atau konteks tidak jelas)
- warnings: daftar peringatan penting yang perlu diverifikasi user (kosong jika tidak ada)

═══ FORMAT ANGKA (WAJIB DIBACA SEBELUM MENGISI AMOUNT) ═══
1. Deteksi satuan dokumen:
   - "dalam jutaan rupiah" / "million Rp" → kalikan semua angka × 1.000.000
   - "dalam ribuan rupiah" / "thousand Rp" → kalikan semua angka × 1.000
   - "dalam miliar rupiah" / "billion Rp" → kalikan semua angka × 1.000.000.000
   - Tanpa keterangan → angka dalam satuan penuh IDR (tidak dikali)

2. Aturan pemisah ribuan vs desimal (jangan asumsikan — ikuti aturan ini):
   - "150,000"  → koma + tepat 3 digit = PEMISAH RIBUAN → 150000
   - "1,500,000" → koma berulang = PEMISAH RIBUAN → 1500000
   - "150.000"  → titik + tepat 3 digit = PEMISAH RIBUAN → 150000
   - "1.500.000" → titik berulang = PEMISAH RIBUAN → 1500000
   - "150,50"   → koma + 1–2 digit = DESIMAL → 150.5
   - "1.500,50" → titik ribuan + koma desimal → 1500.5
   - "1,500.50" → koma ribuan + titik desimal → 1500.5
   - Angka dalam tanda kurung (1.500.000) = negatif → ambil nilai absolutnya

═══ TIPE 1: MUTASI BANK / BUKU KAS (daftar transaksi harian) ═══
Ciri: ada kolom Tanggal, Deskripsi/Keterangan, Debit/Kredit/Nominal, dan Saldo.
- Setiap baris transaksi = 1 item dalam array
- Kolom Debit/Masuk/Penerimaan → type "Debit"
- Kolom Kredit/Keluar/Pengeluaran → type "Kredit"
- category: gunakan keterangan transaksi (mis: "Transfer", "Pembayaran Listrik")
- Jangan masukkan baris saldo awal/akhir atau total

═══ TIPE 2: LAPORAN KEUANGAN PERUSAHAAN / Tbk ═══
Ciri: ada Laporan Laba Rugi, Neraca/Posisi Keuangan, atau Laporan Arus Kas.
Ubah setiap pos menjadi "synthetic transaction":

LABA RUGI:
  Pendapatan/Penjualan bersih → type "Debit", category "Pendapatan [nama pos]"
  Beban Pokok / HPP / COGS → type "Kredit", category "HPP"
  Beban Operasional → type "Kredit", category "Biaya [nama pos]"
  Beban Lain-lain → type "Kredit", category "Biaya Lain [nama]"
  Pendapatan Lain-lain → type "Debit", category "Pendapatan Lain [nama]"

NERACA (hanya jika Laba Rugi tidak tersedia):
  Aset Lancar → type "Debit", category sesuai nama ("Kas", "Piutang", "Inventaris")
  Aset Tidak Lancar → type "Debit", category "Peralatan"
  Liabilitas Jangka Pendek → type "Debit", category "Utang Jangka Pendek"
  Liabilitas Jangka Panjang → type "Debit", category "Utang Pinjaman"
  Ekuitas / Modal → type "Debit", category "Modal"

ATURAN LAPORAN Tbk:
- Laporan multi-periode → AMBIL HANYA PERIODE TERBARU
- Laporan konsolidasi vs induk → AMBIL HANYA KONSOLIDASI
- JANGAN masukkan baris Subtotal, Total, Jumlah — hanya baris detail
- Tanggal: gunakan tanggal akhir periode laporan (mis: "2023-12-31")
- Angka dalam tanda kurung (1.234) = negatif → ambil absolute value

Jika dokumen tidak mengandung data keuangan: { "transactions": [] }
Maksimal 200 transaksi.`;

// ─── Gemini API Call ───────────────────────────────────────────────────────────

const parseWithAI = async (text, apiKey, onProgress) => {
  onProgress?.('Mengirim dokumen ke Gemini AI untuk dianalisis...');

  const truncated = text.length > MAX_TEXT_CHARS
    ? text.substring(0, MAX_TEXT_CHARS) + '\n\n[...dokumen dipotong karena melebihi batas karakter...]'
    : text;

  const response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: `${SYSTEM_PROMPT}\n\nEkstrak semua data keuangan dari dokumen berikut:\n\n${truncated}`,
            },
          ],
        },
      ],
      generationConfig: {
        responseMimeType: 'application/json',
        thinkingConfig: { thinkingBudget: 0 },
        maxOutputTokens: 8192,
        temperature: 0.1,
        responseSchema: {
          type: 'object',
          properties: {
            overall_confidence: { type: 'integer' },
            warnings: { type: 'array', items: { type: 'string' } },
            transactions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  date:        { type: 'string' },
                  description: { type: 'string' },
                  category:    { type: 'string' },
                  amount:      { type: 'number' },
                  type:        { type: 'string', enum: ['Debit', 'Kredit'] },
                  confidence:  { type: 'integer' },
                },
                required: ['date', 'description', 'category', 'amount', 'type', 'confidence'],
              },
            },
          },
          required: ['overall_confidence', 'warnings', 'transactions'],
        },
      },
    }),
  });

  if (!response.ok) {
    let errMsg = `Gemini API Error ${response.status}`;
    try {
      const errBody = await response.json();
      errMsg = errBody.error?.message || errMsg;
    } catch { /* keep default */ }
    throw new Error(errMsg);
  }

  onProgress?.('Memproses respons AI...');

  const result = await response.json();
  // gemini-2.5-flash (thinking model) may return thought parts before the actual response
  const parts = result.candidates?.[0]?.content?.parts || [];
  const rawText = (parts.find((p) => !p.thought) ?? parts[0])?.text;

  if (!rawText) throw new Error('Gemini tidak mengembalikan respons yang valid.');

  try {
    return JSON.parse(rawText);
  } catch {
    // Fallback: try to extract JSON if model added surrounding text
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Gagal mem-parsing respons JSON dari AI.');
    return JSON.parse(jsonMatch[0]);
  }
};

// ─── Result Normalization ──────────────────────────────────────────────────────

const normalizeAIResult = (aiResult, onProgress) => {
  onProgress?.('Menyusun data transaksi...');

  const raw = aiResult.transactions || aiResult.data || [];
  if (!Array.isArray(raw)) throw new Error('Struktur data dari AI tidak valid (bukan array).');

  const flaggedIds = [];
  const ts = Date.now();

  const normalized = raw
    .map((item, index) => {
      const amount = Math.abs(Number(item.amount) || 0);
      if (amount === 0) return null;

      let date = 'N/A';
      if (item.date && /^\d{4}-\d{2}-\d{2}$/.test(item.date)) {
        date = item.date;
      } else if (item.date) {
        const match = item.date.toString().match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
        if (match) {
          date = `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`;
        }
      }

      const id = `ai_${ts}_${index}`;
      const itemConf = typeof item.confidence === 'number' ? item.confidence : 80;
      if (date === 'N/A' || itemConf < 70) flaggedIds.push(id);

      return {
        id,
        date,
        description: (item.description || `Item ${index + 1}`).toString().trim().substring(0, 200),
        category: (item.category || 'Umum').toString().trim().substring(0, 100),
        amount,
        type: item.type === 'Kredit' ? 'Kredit' : 'Debit',
      };
    })
    .filter(Boolean);

  // Build confidence metadata
  const rawScore = typeof aiResult.overall_confidence === 'number'
    ? Math.min(100, Math.max(0, Math.round(aiResult.overall_confidence)))
    : 75;

  const warnings = Array.isArray(aiResult.warnings) ? [...aiResult.warnings] : [];
  const noDateCount = normalized.filter((t) => t.date === 'N/A').length;
  if (noDateCount > 0 && !warnings.some((w) => w.toLowerCase().includes('tanggal'))) {
    warnings.push(`${noDateCount} transaksi tidak memiliki tanggal yang jelas`);
  }

  const confidence = {
    score: rawScore,
    level: rawScore >= 80 ? 'high' : rawScore >= 60 ? 'medium' : 'low',
    method: 'ai',
    warnings,
    flaggedIds,
  };

  return { normalized, confidence };
};

// ─── Excel / CSV AI Parser ────────────────────────────────────────────────────
// Dipanggil sebagai fallback ketika rule-based parser gagal atau hasilnya kosong.

const UMKM_PROMPT = `Kamu adalah asisten pencatat keuangan harian untuk UMKM dan keperluan personal.
Tugasmu membaca isi spreadsheet atau CSV yang mungkin formatnya tidak standar, tidak rapi, atau tidak mengikuti template baku, lalu mengubahnya menjadi daftar transaksi keuangan sederhana.

Yang kamu cari: tanggal, keterangan/deskripsi transaksi, jumlah uang, dan arah uang (masuk atau keluar).

Panduan:
- Uang masuk / pemasukan / penerimaan / penjualan → type "Debit"
- Uang keluar / pengeluaran / pembayaran / biaya → type "Kredit"
- Jika ada kolom Debit dan Kredit terpisah: isi di kolom Debit = type "Debit", isi di kolom Kredit = type "Kredit"
- category: kategori singkat dan deskriptif (contoh: "Penjualan", "Biaya Makan", "Transport", "Gaji", "Listrik", "Pembelian Bahan", dll)
- Abaikan baris kosong, judul, header, total, subtotal, saldo awal/akhir
- Jika tanggal tidak ada atau tidak jelas → gunakan "N/A"
- Jika satuan "juta" → kalikan × 1.000.000

FORMAT ANGKA — WAJIB DIBACA:
Jangan tebak berdasarkan kebiasaan. Gunakan aturan ini secara konsisten:
- "150,000"  → koma diikuti tepat 3 digit = PEMISAH RIBUAN → nilai = 150000
- "1,500,000" → koma berulang = PEMISAH RIBUAN → nilai = 1500000
- "150.000"  → titik diikuti tepat 3 digit = PEMISAH RIBUAN (format Indonesia) → nilai = 150000
- "1.500.000" → titik berulang = PEMISAH RIBUAN → nilai = 1500000
- "150,50"   → koma diikuti 1–2 digit = DESIMAL → nilai = 150.5
- "1.500,50" → titik ribuan + koma desimal → nilai = 1500.5
- "1,500.50" → koma ribuan + titik desimal → nilai = 1500.5
- Angka dalam tanda kurung (150.000) = negatif → ambil nilai absolutnya
- Selalu isi amount sebagai bilangan bulat atau desimal positif (bukan string)

Output JSON:
{
  "overall_confidence": <integer 0-100>,
  "warnings": ["..."],
  "transactions": [...]
}
Setiap transaksi: { "date", "description", "category", "amount", "type": "Debit"|"Kredit", "confidence": <integer 0-100> }
Maksimal 500 transaksi. Jika tidak ada data keuangan: { "overall_confidence": 0, "warnings": [], "transactions": [] }`;

export const parseTextWithAI = async (textContent, fileName, onProgress) => {
  const apiKey = getStoredApiKey();

  if (!apiKey) {
    throw new Error(
      'Format file tidak dikenali oleh parser standar.\n' +
      'Masukkan API key Google Gemini di "Pengaturan API untuk PDF" untuk parsing otomatis format non-standar.'
    );
  }

  onProgress?.('Format tidak standar — meminta bantuan AI...');

  const truncated = textContent.length > MAX_TEXT_CHARS
    ? textContent.substring(0, MAX_TEXT_CHARS) + '\n[...dipotong...]'
    : textContent;

  const response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: `${UMKM_PROMPT}\n\nIsi file "${fileName}":\n\n${truncated}`,
            },
          ],
        },
      ],
      generationConfig: {
        responseMimeType: 'application/json',
        thinkingConfig: { thinkingBudget: 0 },
        maxOutputTokens: 8192,
        temperature: 0.1,
        responseSchema: {
          type: 'object',
          properties: {
            overall_confidence: { type: 'integer' },
            warnings: { type: 'array', items: { type: 'string' } },
            transactions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  date:        { type: 'string' },
                  description: { type: 'string' },
                  category:    { type: 'string' },
                  amount:      { type: 'number' },
                  type:        { type: 'string', enum: ['Debit', 'Kredit'] },
                  confidence:  { type: 'integer' },
                },
                required: ['date', 'description', 'category', 'amount', 'type', 'confidence'],
              },
            },
          },
          required: ['overall_confidence', 'warnings', 'transactions'],
        },
      },
    }),
  });

  if (!response.ok) {
    let errMsg = `Gemini API Error ${response.status}`;
    try { const b = await response.json(); errMsg = b.error?.message || errMsg; } catch { /* keep */ }
    throw new Error(errMsg);
  }

  onProgress?.('Memproses respons AI...');

  const result = await response.json();
  const parts2 = result.candidates?.[0]?.content?.parts || [];
  const rawText = (parts2.find((p) => !p.thought) ?? parts2[0])?.text;
  if (!rawText) throw new Error('Gemini tidak mengembalikan respons yang valid.');

  let parsed;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    const m = rawText.match(/\{[\s\S]*\}/);
    if (!m) throw new Error('Gagal mem-parsing respons JSON dari AI.');
    parsed = JSON.parse(m[0]);
  }

  const { normalized, confidence } = normalizeAIResult(parsed, onProgress);

  if (!normalized.length) {
    throw new Error(
      'AI tidak menemukan data transaksi dalam file ini. ' +
      'Pastikan file berisi catatan keuangan dengan tanggal dan jumlah uang.'
    );
  }

  return { transactions: normalized, confidence };
};

// ─── Public API ────────────────────────────────────────────────────────────────

export const parsePDFWithAI = async (file, onProgress) => {
  const apiKey = getStoredApiKey();

  if (!apiKey) {
    throw new Error(
      'API Key Google Gemini belum dikonfigurasi. ' +
      'Masukkan API key Anda di bagian "Pengaturan API untuk PDF" di bawah area upload.'
    );
  }

  const text = await extractTextFromPDF(file, onProgress);

  if (!text || text.replace(/\s|\[Halaman\s\d+\]/g, '').length < 80) {
    throw new Error(
      'Tidak dapat mengekstrak teks dari PDF ini. ' +
      'File kemungkinan berupa scan/gambar. Gunakan PDF dengan teks yang bisa diseleksi (bukan hasil scan).'
    );
  }

  const aiResult = await parseWithAI(text, apiKey, onProgress);
  const { normalized, confidence } = normalizeAIResult(aiResult, onProgress);

  if (!normalized.length) {
    throw new Error(
      'AI tidak menemukan data keuangan dalam dokumen ini. ' +
      'Pastikan PDF berisi laporan keuangan, mutasi bank, atau buku kas yang memiliki angka.'
    );
  }

  return { transactions: normalized, confidence };
};
