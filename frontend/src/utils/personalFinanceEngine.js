// ─── Keyword Lists ─────────────────────────────────────────────────────────────

const INCOME_KW = [
  'gaji', 'salary', 'penghasilan', 'pendapatan', 'pemasukan', 'freelance',
  'honor', 'bonus', 'thr', 'tunjangan', 'penjualan', 'usaha', 'bisnis',
  'pasif', 'dividen', 'bunga', 'hadiah', 'kiriman', 'transfer masuk', 'masuk',
];

const NEEDS_KW = [
  'makan', 'makanan', 'sembako', 'beras', 'sayur', 'lauk', 'dapur', 'bahan makanan',
  'transport', 'ojek', 'gojek', 'grab', 'bensin', 'bahan bakar', 'bbm', 'parkir', 'tol',
  'kos', 'kontrakan', 'sewa', 'kontrak', 'rumah',
  'listrik', 'pln', 'air', 'pdam', 'gas', 'lpg',
  'tagihan', 'internet', 'pulsa', 'kuota', 'telpon',
  'kesehatan', 'obat', 'dokter', 'rumah sakit', 'puskesmas', 'klinik', 'apotik',
  'cicilan', 'angsuran', 'kredit',
  'pendidikan', 'sekolah', 'kuliah', 'spp', 'uang sekolah', 'buku pelajaran',
  'sabun', 'deterjen', 'kebersihan', 'kebutuhan rumah',
];

const WANTS_KW = [
  'hiburan', 'nonton', 'bioskop', 'movie', 'streaming', 'netflix', 'disney', 'spotify',
  'youtube', 'game', 'gaming', 'steam',
  'baju', 'pakaian', 'fashion', 'sepatu', 'tas', 'aksesori', 'belanja', 'shopping',
  'restoran', 'makan malam', 'cafe', 'kopi', 'coffee', 'boba', 'minuman', 'jajan', 'snack',
  'liburan', 'travel', 'hotel', 'wisata', 'tiket', 'holiday',
  'hobi', 'olahraga', 'gym', 'fitness',
  'elektronik', 'gadget', 'hp', 'laptop', 'aksesoris hp',
  'kosmetik', 'salon', 'spa', 'perawatan', 'skincare',
  'gorengan', 'bakso', 'mie ayam', 'warung',
];

const SAVINGS_KW = [
  'tabungan', 'saving', 'nabung',
  'investasi', 'invest', 'reksadana', 'reksa dana',
  'saham', 'crypto', 'bitcoin', 'ethereum',
  'deposito', 'asuransi', 'premi',
  'dana darurat', 'emergency fund',
  'emas', 'logam mulia',
  'dana pensiun', 'pensiun',
  'obligasi', 'sbn', 'sbr',
];

const matchAny = (text, keywords) => keywords.some((k) => text.includes(k));

// ─── Bucket Labels ─────────────────────────────────────────────────────────────

export const BUCKET = {
  INCOME:  'Pemasukan',
  NEEDS:   'Kebutuhan',
  WANTS:   'Keinginan',
  SAVINGS: 'Tabungan & Investasi',
  OTHER:   'Lain-lain',
};

// ─── Budgeting Frameworks ──────────────────────────────────────────────────────
// bars(d): receives the analysis data object, returns array of bar configs.

export const FRAMEWORKS = {
  '50-30-20': {
    key: '50-30-20',
    name: '50/30/20',
    emoji: '📐',
    tagline: 'Paling populer — seimbang & mudah',
    description:
      'Bagi penghasilan ke tiga kelompok: 50% kebutuhan pokok (makan, sewa, tagihan, transport), ' +
      '30% keinginan (hiburan, fashion, jajan), dan 20% tabungan & investasi. ' +
      'Framework paling banyak direkomendasikan karena mudah dipahami dan diterapkan siapa saja.',
    philosophy: 'Keseimbangan antara menikmati hidup hari ini dan mempersiapkan masa depan.',
    suitedFor: 'Karyawan tetap, pendapatan menengah, pemula dalam pengelolaan keuangan.',
    notSuitedFor: 'Pendapatan sangat rendah (30% keinginan bisa terasa besar) atau yang ingin agresif berinvestasi.',
    savingsTarget: 20,
    bars: (d) => [
      { label: 'Kebutuhan Pokok',          actual: d.needsPct,    target: 50, isUpperBound: true,  color: '#22c55e' },
      { label: 'Keinginan & Gaya Hidup',   actual: d.wantsPct,    target: 30, isUpperBound: true,  color: '#f59e0b' },
      { label: 'Tabungan & Investasi',     actual: d.savingsRate, target: 20, isUpperBound: false, color: '#818cf8' },
    ],
    scoreCalc: (d) => {
      let s = 30;
      if (d.totalIncome > 0) s += 10;
      if (d.netBalance >= 0) s += 20; else if (d.netBalance > -d.totalIncome * 0.1) s += 8;
      if (d.savingsRate >= 20) s += 20; else if (d.savingsRate >= 10) s += 12; else if (d.savingsRate >= 5) s += 6;
      if (d.needsPct <= 50) s += 10; else if (d.needsPct <= 65) s += 5;
      if (d.wantsPct <= 30) s += 10; else if (d.wantsPct <= 40) s += 5;
      return s;
    },
  },

  '70-20-10': {
    key: '70-20-10',
    name: '70/20/10',
    emoji: '🏗️',
    tagline: 'Realistis untuk UMR & pendapatan rendah',
    description:
      '70% untuk semua biaya hidup (kebutuhan pokok + sedikit keinginan digabung), ' +
      '20% untuk tabungan, dan 10% untuk investasi jangka panjang atau melunasi utang. ' +
      'Lebih realistis bila 30% alokasi keinginan di framework 50/30/20 terasa terlalu longgar.',
    philosophy: 'Prioritaskan stabilitas hidup dulu, baru pikirkan pertumbuhan.',
    suitedFor: 'Fresh graduate, pendapatan UMR, yang tinggal di kota besar dengan biaya hidup tinggi, atau yang sedang aktif melunasi utang.',
    notSuitedFor: 'Pendapatan tinggi yang ingin memaksimalkan return investasi — target 10% investasi mungkin terlalu kecil.',
    savingsTarget: 20,
    bars: (d) => [
      { label: 'Biaya Hidup Total (Kebutuhan + Keinginan)', actual: d.needsPct + d.wantsPct, target: 70, isUpperBound: true,  color: '#22c55e' },
      { label: 'Tabungan',                                  actual: d.savingsPct,            target: 20, isUpperBound: false, color: '#818cf8' },
      { label: 'Investasi / Cicilan Utang',                 actual: d.otherPct,              target: 10, isUpperBound: false, color: '#38bdf8' },
    ],
    scoreCalc: (d) => {
      let s = 30;
      if (d.totalIncome > 0) s += 10;
      if (d.netBalance >= 0) s += 20; else if (d.netBalance > -d.totalIncome * 0.1) s += 8;
      if (d.savingsRate >= 20) s += 20; else if (d.savingsRate >= 10) s += 12; else if (d.savingsRate >= 5) s += 6;
      const living = d.needsPct + d.wantsPct;
      if (living <= 70) s += 20; else if (living <= 80) s += 10; else if (living <= 90) s += 4;
      return s;
    },
  },

  '80-20': {
    key: '80-20',
    name: '80/20 — Pay Yourself First',
    emoji: '🎯',
    tagline: 'Bayar diri sendiri dulu, lalu bebas',
    description:
      'Satu aturan sederhana: begitu gaji masuk, langsung sisihkan 20% ke rekening tabungan/investasi terpisah. ' +
      'Sisa 80% boleh digunakan untuk apapun tanpa perlu tracking ketat per kategori. ' +
      'Disiplinnya ada di depan, bukan di tengah bulan.',
    philosophy: 'Disiplin di awal, bebas di akhir. Tidak perlu budgeting yang rumit.',
    suitedFor: 'Yang tidak suka tracking detail, sudah punya disiplin diri tinggi, pendapatan tidak tetap (freelancer/wirausaha), atau ingin sistem sesederhana mungkin.',
    notSuitedFor: 'Yang masih sering defisit atau perlu kontrol ketat per pos pengeluaran.',
    savingsTarget: 20,
    bars: (d) => [
      { label: 'Tabungan & Investasi (sisihkan pertama)',    actual: d.savingsRate,                              target: 20, isUpperBound: false, color: '#818cf8' },
      { label: 'Pengeluaran Total (bebas digunakan)',        actual: d.needsPct + d.wantsPct + d.otherPct,       target: 80, isUpperBound: true,  color: '#22c55e' },
    ],
    scoreCalc: (d) => {
      let s = 30;
      if (d.totalIncome > 0) s += 10;
      if (d.netBalance >= 0) s += 20; else if (d.netBalance > -d.totalIncome * 0.1) s += 8;
      // Savings carries the most weight in this framework
      if (d.savingsRate >= 20) s += 40; else if (d.savingsRate >= 15) s += 28; else if (d.savingsRate >= 10) s += 16; else if (d.savingsRate >= 5) s += 8;
      return s;
    },
  },

  'zero-based': {
    key: 'zero-based',
    name: 'Zero-Based Budgeting',
    emoji: '⚖️',
    tagline: 'Setiap rupiah punya tujuan',
    description:
      'Setiap bulan, rencanakan seluruh penghasilan ke berbagai pos — termasuk tabungan dan hiburan — ' +
      'sehingga Penghasilan − Semua Alokasi = 0. Tidak ada satu rupiah pun yang "menganggur" tanpa tujuan yang jelas. ' +
      'Bukan berarti semuanya harus habis — tabungan adalah pos yang direncanakan juga.',
    philosophy: 'Kontrol penuh atas setiap rupiah. Tidak ada uang yang hilang begitu saja.',
    suitedFor: 'Yang detail-oriented, punya tujuan keuangan spesifik, sedang dalam kondisi keuangan ketat, atau ingin tahu persis ke mana uangnya pergi.',
    notSuitedFor: 'Yang pendapatannya sangat tidak teratur atau tidak punya waktu untuk planning bulanan yang teliti.',
    savingsTarget: 10,
    bars: (d) => {
      const usedPct = d.totalIncome > 0 ? Math.min(100, ((d.totalExpense / d.totalIncome) * 100)) : 0;
      const unplannedPct = Math.max(0, 100 - usedPct - d.savingsPct);
      return [
        { label: 'Total Pengeluaran Terencana',        actual: usedPct,        target: 90, isUpperBound: true,  color: '#22c55e' },
        { label: 'Tabungan Terencana',                 actual: d.savingsPct,   target: 10, isUpperBound: false, color: '#818cf8' },
        { label: 'Dana Tanpa Alokasi (target = 0%)',   actual: unplannedPct,   target: 5,  isUpperBound: true,  color: '#94a3b8' },
      ];
    },
    scoreCalc: (d) => {
      let s = 30;
      if (d.totalIncome > 0) s += 10;
      if (d.netBalance >= 0) s += 20; else if (d.netBalance > -d.totalIncome * 0.1) s += 8;
      if (d.savingsRate >= 10) s += 20; else if (d.savingsRate >= 5) s += 10;
      const usedPct = d.totalIncome > 0 ? ((d.totalExpense / d.totalIncome) * 100) : 0;
      // Reward having a plan (used near 100%) but not going over
      if (usedPct >= 80 && usedPct <= 100) s += 20; else if (usedPct >= 60) s += 10;
      return s;
    },
  },

  '30-30-30-10': {
    key: '30-30-30-10',
    name: '30/30/30/10',
    emoji: '🏠',
    tagline: 'Fokus hunian & tujuan jangka panjang',
    description:
      '30% untuk tempat tinggal (sewa/KPR + utilitas rumah), 30% untuk biaya hidup sehari-hari ' +
      '(makan, transport, kebutuhan), 30% untuk tujuan keuangan jangka panjang (investasi, dana pensiun, tabungan besar), ' +
      'dan 10% untuk hiburan & bersenang-senang. ' +
      'Catatan: app ini mendeteksi "hunian" sebagai bagian dari kebutuhan — nilai bar pertama adalah perkiraan.',
    philosophy: 'Rumah yang layak dan masa depan yang aman adalah prioritas utama.',
    suitedFor: 'Yang punya cicilan KPR, sewa di kota besar (Jakarta, Surabaya, Bali), atau sedang agresif menabung untuk tujuan besar.',
    notSuitedFor: 'Yang tinggal gratis atau sudah lunas KPR — alokasi 30% hunian akan terasa terlalu besar untuk kondisi mereka.',
    savingsTarget: 30,
    bars: (d) => [
      { label: 'Kebutuhan Pokok + Hunian (target ≤60%)',         actual: d.needsPct,    target: 60, isUpperBound: true,  color: '#22c55e' },
      { label: 'Tujuan Keuangan Jangka Panjang (target ≥30%)',   actual: d.savingsRate, target: 30, isUpperBound: false, color: '#818cf8' },
      { label: 'Hiburan & Bersenang-senang (target ≤10%)',        actual: d.wantsPct,    target: 10, isUpperBound: true,  color: '#f59e0b' },
    ],
    scoreCalc: (d) => {
      let s = 30;
      if (d.totalIncome > 0) s += 10;
      if (d.netBalance >= 0) s += 20; else if (d.netBalance > -d.totalIncome * 0.1) s += 8;
      if (d.savingsRate >= 30) s += 20; else if (d.savingsRate >= 20) s += 14; else if (d.savingsRate >= 10) s += 8;
      if (d.wantsPct <= 10) s += 10; else if (d.wantsPct <= 15) s += 5;
      if (d.needsPct <= 60) s += 10; else if (d.needsPct <= 70) s += 5;
      return s;
    },
  },

  'envelope': {
    key: 'envelope',
    name: 'Envelope Method',
    emoji: '✉️',
    tagline: 'Bagi berdasarkan amplop kategori',
    description:
      'Pisahkan uang ke "amplop" (rekening atau dompet berbeda) per kategori — amplop makan, transport, hiburan, dll. ' +
      'Kalau satu amplop habis, kategori itu selesai untuk bulan ini — tidak boleh ambil dari amplop lain. ' +
      'Target alokasi umum: 60% kebutuhan, 20% keinginan, 20% tabungan.',
    philosophy: 'Batasan nyata dan konkret per kategori. Membuat pengeluaran terasa lebih "nyata" dan bertanggung jawab.',
    suitedFor: 'Yang mudah tergoda overspending, lebih suka sistem yang terlihat jelas, atau ingin pemisahan fisik/rekening per kategori.',
    notSuitedFor: 'Yang sudah sangat disiplin dan tidak suka repot membagi-bagi uang ke banyak pos.',
    savingsTarget: 20,
    bars: (d) => [
      { label: 'Amplop Kebutuhan (maks. 60%)',        actual: d.needsPct,    target: 60, isUpperBound: true,  color: '#22c55e' },
      { label: 'Amplop Keinginan (maks. 20%)',        actual: d.wantsPct,    target: 20, isUpperBound: true,  color: '#f59e0b' },
      { label: 'Amplop Tabungan & Cadangan (min. 20%)', actual: d.savingsRate, target: 20, isUpperBound: false, color: '#818cf8' },
    ],
    scoreCalc: (d) => {
      let s = 30;
      if (d.totalIncome > 0) s += 10;
      if (d.netBalance >= 0) s += 20; else if (d.netBalance > -d.totalIncome * 0.1) s += 8;
      if (d.savingsRate >= 20) s += 20; else if (d.savingsRate >= 10) s += 12; else if (d.savingsRate >= 5) s += 6;
      if (d.needsPct <= 60) s += 10; else if (d.needsPct <= 70) s += 5;
      if (d.wantsPct <= 20) s += 10; else if (d.wantsPct <= 30) s += 5;
      return s;
    },
  },
};

// ─── Classification ────────────────────────────────────────────────────────────

const classify = (t) => {
  const text = `${t.category} ${t.description}`.toLowerCase();

  // All inflow → income
  if (t.type === 'Debit') return BUCKET.INCOME;

  // Outflows — priority: Savings > Needs > Wants > Other
  if (matchAny(text, SAVINGS_KW)) return BUCKET.SAVINGS;
  if (matchAny(text, NEEDS_KW))   return BUCKET.NEEDS;
  if (matchAny(text, WANTS_KW))   return BUCKET.WANTS;
  return BUCKET.OTHER;
};

// ─── Main Analysis ─────────────────────────────────────────────────────────────

const fmt = (n) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

export const analyzePersonalFinance = (transactions, frameworkKey = '50-30-20') => {
  const fw = FRAMEWORKS[frameworkKey] || FRAMEWORKS['50-30-20'];

  const buckets = {
    [BUCKET.INCOME]:  0,
    [BUCKET.NEEDS]:   0,
    [BUCKET.WANTS]:   0,
    [BUCKET.SAVINGS]: 0,
    [BUCKET.OTHER]:   0,
  };

  const categoryDetail = {};

  for (const t of transactions) {
    const bucket = classify(t);
    buckets[bucket] += t.amount;
    const cat = t.category || 'Lain-lain';
    if (!categoryDetail[cat]) categoryDetail[cat] = { bucket, amount: 0 };
    categoryDetail[cat].amount += t.amount;
  }

  const totalIncome  = buckets[BUCKET.INCOME];
  const totalExpense = buckets[BUCKET.NEEDS] + buckets[BUCKET.WANTS] + buckets[BUCKET.SAVINGS] + buckets[BUCKET.OTHER];
  const netBalance   = totalIncome - totalExpense;

  const pct = (val) => (totalIncome > 0 ? (val / totalIncome) * 100 : 0);
  const needsPct   = pct(buckets[BUCKET.NEEDS]);
  const wantsPct   = pct(buckets[BUCKET.WANTS]);
  const savingsPct = pct(buckets[BUCKET.SAVINGS]);
  const otherPct   = pct(buckets[BUCKET.OTHER]);
  const savingsRate = totalIncome > 0 ? ((netBalance + buckets[BUCKET.SAVINGS]) / totalIncome) * 100 : 0;

  // ── Health Score — framework-dependent ───────────────────────────────────
  const baseData = { totalIncome, totalExpense, netBalance, needsPct, wantsPct, savingsPct, otherPct, savingsRate };
  const rawScore  = fw.scoreCalc(baseData);
  const clamped   = Math.min(100, Math.max(0, Math.round(rawScore)));
  const healthLevel = clamped >= 75 ? 'Sehat' : clamped >= 55 ? 'Cukup' : 'Perlu Perhatian';
  const healthColor = clamped >= 75 ? '#22c55e' : clamped >= 55 ? '#f59e0b' : '#ef4444';

  // ── Recommendations — adapted to framework's savings target ───────────────
  const savingsTarget = fw.savingsTarget;
  const recs = [];

  if (totalIncome === 0) {
    recs.push({ emoji: '💡', text: 'Tidak ada data pemasukan terdeteksi. Pastikan kategori transaksi pemasukan mengandung kata seperti "Gaji", "Freelance", atau "Penghasilan".' });
  } else {
    if (netBalance < 0) {
      recs.push({ emoji: '🚨', text: `Pengeluaran melebihi pemasukan sebesar ${fmt(Math.abs(netBalance))}. Kurangi pengeluaran tidak mendesak atau cari tambahan penghasilan segera.` });
    }

    if (savingsRate < 5 && totalIncome > 0) {
      recs.push({ emoji: '🏦', text: `Tingkat tabungan sangat rendah (${savingsRate.toFixed(1)}%). Mulai dari kecil — sisihkan minimal 5% penghasilan sebelum dibelanjakan.` });
    } else if (savingsRate < savingsTarget) {
      const gap = fmt(savingsTarget / 100 * totalIncome - buckets[BUCKET.SAVINGS] - Math.max(0, netBalance));
      recs.push({ emoji: '💰', text: `Tingkat tabungan ${savingsRate.toFixed(1)}% masih di bawah target ${savingsTarget}% (framework ${fw.name}). Coba tingkatkan sekitar ${gap} per bulan.` });
    }

    if (wantsPct > 40) {
      recs.push({ emoji: '🛍️', text: `Pengeluaran "Keinginan" (hiburan, fashion, dll) mencapai ${wantsPct.toFixed(1)}% dari penghasilan — cukup tinggi. Tinjau pengeluaran yang bisa dikurangi.` });
    } else if (frameworkKey === '50-30-20' && wantsPct > 30) {
      recs.push({ emoji: '🛍️', text: `Keinginan menyerap ${wantsPct.toFixed(1)}% penghasilan, sedikit di atas batas ideal 30%. Pantau terus agar tidak membengkak.` });
    }

    if (frameworkKey === '30-30-30-10' && wantsPct > 15) {
      recs.push({ emoji: '🎉', text: `Framework ${fw.name} menargetkan hiburan maks. 10%. Saat ini ${wantsPct.toFixed(1)}% — pertimbangkan untuk memangkas pos ini.` });
    }

    if (needsPct > 65 && frameworkKey !== '70-20-10') {
      recs.push({ emoji: '🏠', text: `Kebutuhan pokok mengambil ${needsPct.toFixed(1)}% penghasilan — cukup tinggi. Cek apakah ada pos yang bisa dioptimasi, misalnya sewa atau cicilan.` });
    }

    if (buckets[BUCKET.SAVINGS] === 0 && netBalance > 0) {
      recs.push({ emoji: '📈', text: `Ada sisa uang sebesar ${fmt(netBalance)} — alokasikan ke rekening terpisah atau instrumen investasi agar tidak habis terpakai.` });
    }

    if (recs.length === 0) {
      recs.push({ emoji: '✅', text: 'Keuangan Anda terlihat sehat! Pertahankan konsistensi dan pertimbangkan untuk meningkatkan alokasi investasi jangka panjang.' });
    }

    if (recs.length < 3 && savingsRate >= savingsTarget && wantsPct <= 30) {
      recs.push({ emoji: '🎯', text: `Anda sudah menerapkan prinsip ${fw.name} dengan baik. Selanjutnya, pastikan dana darurat sudah cukup (setara 3–6 bulan pengeluaran).` });
    }
  }

  // ── Spending breakdown for chart ──────────────────────────────────────────
  const spendingSlices = [
    { name: 'Kebutuhan',          value: buckets[BUCKET.NEEDS],   color: '#22c55e' },
    { name: 'Keinginan',          value: buckets[BUCKET.WANTS],   color: '#f59e0b' },
    { name: 'Tabungan & Investasi', value: buckets[BUCKET.SAVINGS], color: '#818cf8' },
    { name: 'Lain-lain',          value: buckets[BUCKET.OTHER],   color: '#94a3b8' },
  ].filter((s) => s.value > 0);

  return {
    buckets,
    categoryDetail,
    totalIncome,
    totalExpense,
    netBalance,
    needsPct,
    wantsPct,
    savingsPct,
    otherPct,
    savingsRate,
    score: clamped,
    healthLevel,
    healthColor,
    recommendations: recs,
    spendingSlices,
    frameworkKey,
    savingsTarget,
  };
};
