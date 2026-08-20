// ─── Static Benchmark Data (Representative Indonesian UMKM) ───────────────────
// Sources: BPS UMKM data, Bank Indonesia UMKM reports, Kemenkop UKM statistics.
// These are ranges — we use midpoints for comparison.

export const SECTORS = [
  { key: 'fnb',       label: 'Makanan & Minuman (F&B)', emoji: '🍜' },
  { key: 'retail',    label: 'Toko / Retail',           emoji: '🏪' },
  { key: 'jasa',      label: 'Jasa / Layanan',          emoji: '🔧' },
  { key: 'pertanian', label: 'Pertanian / Agribisnis',  emoji: '🌾' },
];

// All monetary values in IDR, percentages as numbers
const BENCHMARKS = {
  fnb: {
    label: 'Makanan & Minuman',
    emoji: '🍜',
    avgMonthlyRevenue: 12_000_000,    // Rp 12jt/bulan rata-rata UMKM F&B kecil
    netMarginPct:       17,            // 15–20%
    expenseRatioPct:    60,            // COGS + overhead
    monthlyGrowthPct:   4,             // 3–5% per bulan
    positiveCashRatio:  0.80,          // 80% bulan arus kas positif
    notes: 'Rata-rata usaha F&B skala kecil-menengah di Indonesia.',
  },
  retail: {
    label: 'Toko / Retail',
    emoji: '🏪',
    avgMonthlyRevenue: 22_000_000,
    netMarginPct:       10,
    expenseRatioPct:    82,
    monthlyGrowthPct:   2.5,
    positiveCashRatio:  0.85,
    notes: 'Rata-rata toko kelontong, minimarket mandiri, dan retail kecil.',
  },
  jasa: {
    label: 'Jasa / Layanan',
    emoji: '🔧',
    avgMonthlyRevenue: 10_000_000,
    netMarginPct:       30,
    expenseRatioPct:    48,
    monthlyGrowthPct:   5,
    positiveCashRatio:  0.75,
    notes: 'Rata-rata usaha jasa: bengkel, salon, laundry, kursus, dsb.',
  },
  pertanian: {
    label: 'Pertanian / Agribisnis',
    emoji: '🌾',
    avgMonthlyRevenue: 9_000_000,
    netMarginPct:       24,
    expenseRatioPct:    58,
    monthlyGrowthPct:   2,
    positiveCashRatio:  0.65,
    notes: 'Rata-rata usaha pertanian, perikanan, dan agribisnis skala kecil.',
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const mean = (arr) => arr.length ? arr.reduce((s, v) => s + v, 0) / arr.length : 0;

const fmt = (n) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n ?? 0);

// Returns plain-language delta description
const deltaText = (userVal, benchVal, higherIsBetter, unit = '%') => {
  if (benchVal === 0) return null;
  const diff = userVal - benchVal;
  const diffPct = Math.abs((diff / benchVal) * 100);
  const absDiff = Math.abs(diff);

  if (diffPct < 5) return 'setara dengan rata-rata sektor';

  const direction = diff > 0 ? 'lebih tinggi' : 'lebih rendah';
  const magnitude = diffPct >= 30 ? 'jauh' : diffPct >= 15 ? 'cukup' : 'sedikit';

  if (unit === 'pct') {
    return `${magnitude} ${direction} ${absDiff.toFixed(1)}% dari rata-rata`;
  }
  return `${magnitude} ${direction} ${fmt(absDiff)} dari rata-rata`;
};

// ─── Main Analysis ─────────────────────────────────────────────────────────────

export const computeBenchmark = (periods, sectorKey) => {
  if (!periods || periods.length === 0) return null;

  const bench = BENCHMARKS[sectorKey];
  if (!bench) return null;

  const revenues  = periods.map((p) => p.revenue);
  const expenses  = periods.map((p) => p.expenses);
  const profits   = periods.map((p) => p.netProfit);

  const avgRevenue  = mean(revenues);
  const avgExpenses = mean(expenses);
  const avgProfit   = mean(profits);

  const netMarginPct    = avgRevenue > 0 ? (avgProfit / avgRevenue) * 100 : 0;
  const expenseRatioPct = avgRevenue > 0 ? (avgExpenses / avgRevenue) * 100 : 0;

  // MoM growth
  const growthRates = [];
  for (let i = 1; i < revenues.length; i++) {
    if (revenues[i - 1] > 0) growthRates.push((revenues[i] - revenues[i - 1]) / revenues[i - 1] * 100);
  }
  const monthlyGrowthPct = growthRates.length ? mean(growthRates) : null;

  const posCount = periods.filter((p) => p.netCashFlow >= 0).length;
  const positiveCashRatio = periods.length ? posCount / periods.length : 0;

  // ── Build comparison items ────────────────────────────────────────────────

  const comparisons = [
    {
      key: 'revenue',
      label: 'Rata-rata Pendapatan Bulanan',
      user:      avgRevenue,
      benchmark: bench.avgMonthlyRevenue,
      userLabel: fmt(avgRevenue),
      benchLabel: fmt(bench.avgMonthlyRevenue),
      delta: deltaText(avgRevenue, bench.avgMonthlyRevenue, true, 'currency'),
      higherIsBetter: true,
      icon: '💰',
      unit: 'currency',
    },
    {
      key: 'margin',
      label: 'Margin Laba Bersih',
      user:      netMarginPct,
      benchmark: bench.netMarginPct,
      userLabel: `${netMarginPct.toFixed(1)}%`,
      benchLabel: `${bench.netMarginPct}%`,
      delta: deltaText(netMarginPct, bench.netMarginPct, true, 'pct'),
      higherIsBetter: true,
      icon: '📈',
      unit: 'pct',
    },
    {
      key: 'expense',
      label: 'Rasio Pengeluaran (dari Pendapatan)',
      user:      expenseRatioPct,
      benchmark: bench.expenseRatioPct,
      userLabel: `${expenseRatioPct.toFixed(1)}%`,
      benchLabel: `${bench.expenseRatioPct}%`,
      delta: deltaText(expenseRatioPct, bench.expenseRatioPct, false, 'pct'),
      higherIsBetter: false,
      icon: '🏷️',
      unit: 'pct',
    },
    ...(monthlyGrowthPct !== null ? [{
      key: 'growth',
      label: 'Rata-rata Pertumbuhan Pendapatan/Bulan',
      user:      monthlyGrowthPct,
      benchmark: bench.monthlyGrowthPct,
      userLabel: `${monthlyGrowthPct >= 0 ? '+' : ''}${monthlyGrowthPct.toFixed(1)}%`,
      benchLabel: `+${bench.monthlyGrowthPct}%`,
      delta: deltaText(monthlyGrowthPct, bench.monthlyGrowthPct, true, 'pct'),
      higherIsBetter: true,
      icon: '🚀',
      unit: 'pct',
    }] : []),
    {
      key: 'cashflow',
      label: 'Konsistensi Arus Kas Positif',
      user:      positiveCashRatio * 100,
      benchmark: bench.positiveCashRatio * 100,
      userLabel: `${Math.round(positiveCashRatio * 100)}%`,
      benchLabel: `${Math.round(bench.positiveCashRatio * 100)}%`,
      delta: deltaText(positiveCashRatio * 100, bench.positiveCashRatio * 100, true, 'pct'),
      higherIsBetter: true,
      icon: '💧',
      unit: 'pct',
    },
  ];

  // ── Overall position ──────────────────────────────────────────────────────
  // Count how many dimensions user beats the benchmark
  const wins   = comparisons.filter((c) => {
    const diff = c.user - c.benchmark;
    return c.higherIsBetter ? diff >= 0 : diff <= 0;
  }).length;
  const total  = comparisons.length;

  let overallLabel, overallColor;
  if (wins >= total * 0.8)       { overallLabel = 'Di Atas Rata-rata';   overallColor = '#22c55e'; }
  else if (wins >= total * 0.5)  { overallLabel = 'Setara Rata-rata';    overallColor = '#60a5fa'; }
  else if (wins >= total * 0.3)  { overallLabel = 'Di Bawah Rata-rata';  overallColor = '#f59e0b'; }
  else                            { overallLabel = 'Perlu Banyak Perbaikan'; overallColor = '#ef4444'; }

  // ── Plain-language summary ────────────────────────────────────────────────
  const highlights = [];

  const marginDiff = netMarginPct - bench.netMarginPct;
  if (Math.abs(marginDiff) >= 3) {
    const adj = marginDiff > 0 ? 'lebih tinggi' : 'lebih rendah';
    highlights.push(`Margin keuntungan Anda (${netMarginPct.toFixed(1)}%) ${adj} ${Math.abs(marginDiff).toFixed(1)}% dari rata-rata bisnis ${bench.label} (${bench.netMarginPct}%).`);
  }

  const expDiff = expenseRatioPct - bench.expenseRatioPct;
  if (Math.abs(expDiff) >= 5) {
    const adj = expDiff < 0 ? 'lebih efisien' : 'lebih boros';
    highlights.push(`Pengeluaran Anda ${adj} — menyerap ${expenseRatioPct.toFixed(0)}% dari pendapatan vs rata-rata ${bench.expenseRatioPct}% di sektor ini.`);
  }

  const revDiff = ((avgRevenue - bench.avgMonthlyRevenue) / bench.avgMonthlyRevenue) * 100;
  if (Math.abs(revDiff) >= 10) {
    const adj = revDiff > 0 ? 'di atas' : 'di bawah';
    highlights.push(`Rata-rata pendapatan bulanan Anda ${adj} rata-rata sektor (${fmt(bench.avgMonthlyRevenue)}/bulan).`);
  }

  if (highlights.length === 0) {
    highlights.push(`Secara keseluruhan, kinerja bisnis Anda cukup setara dengan rata-rata usaha ${bench.label} di Indonesia.`);
  }

  return {
    sector: bench,
    comparisons,
    wins,
    total,
    overallLabel,
    overallColor,
    highlights,
    userMetrics: { avgRevenue, avgExpenses, avgProfit, netMarginPct, expenseRatioPct, monthlyGrowthPct, positiveCashRatio },
  };
};

export { BENCHMARKS };
