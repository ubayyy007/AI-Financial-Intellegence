// ─── Investment Readiness Score Engine ─────────────────────────────────────────
// Scores a business based on multi-period financial data.
// Each dimension is scored 0–25, total max = 100.

// ─── Helpers ───────────────────────────────────────────────────────────────────

const mean   = (arr) => arr.length ? arr.reduce((s, v) => s + v, 0) / arr.length : 0;
const stddev = (arr) => {
  const m = mean(arr);
  return arr.length < 2 ? 0 : Math.sqrt(arr.reduce((s, v) => s + (v - m) ** 2, 0) / arr.length);
};

const clamp  = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

const fmt = (n) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n ?? 0);

const fmtPct = (n) => `${n >= 0 ? '+' : ''}${n.toFixed(1)}%`;

// ─── Dimension Scorers ────────────────────────────────────────────────────────

/**
 * 1. Konsistensi Pendapatan (0–25)
 * Coefficient of variation (stddev/mean) of monthly revenue — lower = more consistent.
 */
const scoreConsistency = (revenues) => {
  if (revenues.length < 2) return { score: 10, detail: 'Data hanya 1 periode — tidak cukup untuk mengukur konsistensi.' };
  const m = mean(revenues);
  if (m === 0) return { score: 0, detail: 'Tidak ada pendapatan tercatat.' };
  const cv = stddev(revenues) / m; // 0 = perfect, >1 = very volatile
  // cv 0→0.1: 25, 0.1→0.3: 20, 0.3→0.5: 14, 0.5→0.8: 8, >0.8: 4
  let score;
  if (cv <= 0.1)      score = 25;
  else if (cv <= 0.3) score = 20;
  else if (cv <= 0.5) score = 14;
  else if (cv <= 0.8) score = 8;
  else                score = 4;
  return { score, cv, detail: `Variasi pendapatan antar bulan: ${(cv * 100).toFixed(0)}%` };
};

/**
 * 2. Profitabilitas (0–25)
 * Based on average net profit margin.
 */
const scoreProfitability = (periods) => {
  const margins = periods
    .filter((p) => p.revenue > 0)
    .map((p) => (p.netProfit / p.revenue) * 100);
  if (margins.length === 0) return { score: 0, avgMargin: 0, detail: 'Tidak ada data pendapatan.' };
  const avgMargin = mean(margins);
  // >30%: 25, 20-30%: 21, 10-20%: 16, 5-10%: 11, 0-5%: 6, <0: 0
  let score;
  if (avgMargin >= 30)     score = 25;
  else if (avgMargin >= 20) score = 21;
  else if (avgMargin >= 10) score = 16;
  else if (avgMargin >= 5)  score = 11;
  else if (avgMargin >= 0)  score = 6;
  else                      score = 0;
  return { score, avgMargin, detail: `Rata-rata margin bersih: ${avgMargin.toFixed(1)}%` };
};

/**
 * 3. Pertumbuhan Pendapatan (0–25)
 * Average MoM revenue growth rate across available periods.
 */
const scoreGrowth = (revenues) => {
  if (revenues.length < 2) return { score: 10, growthRate: null, detail: 'Perlu minimal 2 periode untuk mengukur pertumbuhan.' };
  const rates = [];
  for (let i = 1; i < revenues.length; i++) {
    if (revenues[i - 1] > 0) rates.push((revenues[i] - revenues[i - 1]) / revenues[i - 1] * 100);
  }
  if (rates.length === 0) return { score: 5, growthRate: null, detail: 'Tidak cukup data untuk menghitung pertumbuhan.' };
  const growthRate = mean(rates);
  // >10%: 25, 5-10%: 21, 1-5%: 17, 0-1%: 12, <0%: 4
  let score;
  if (growthRate >= 10)    score = 25;
  else if (growthRate >= 5) score = 21;
  else if (growthRate >= 1) score = 17;
  else if (growthRate >= 0) score = 12;
  else                      score = 4;
  return { score, growthRate, detail: `Rata-rata pertumbuhan pendapatan: ${fmtPct(growthRate)}/bulan` };
};

/**
 * 4. Kesehatan Arus Kas (0–25)
 * Ratio of months with positive net cash flow.
 */
const scoreCashFlow = (periods) => {
  if (periods.length === 0) return { score: 0, posRatio: 0, detail: 'Tidak ada data.' };
  const posCount = periods.filter((p) => p.netCashFlow >= 0).length;
  const posRatio = posCount / periods.length;
  // 100%: 25, 80%: 21, 60%: 15, 40%: 9, <40%: 4
  let score;
  if (posRatio >= 1.0)      score = 25;
  else if (posRatio >= 0.8) score = 21;
  else if (posRatio >= 0.6) score = 15;
  else if (posRatio >= 0.4) score = 9;
  else                      score = 4;
  return { score, posRatio, posCount, detail: `${posCount} dari ${periods.length} bulan arus kas positif` };
};

// ─── Grade & Labels ───────────────────────────────────────────────────────────

const getGrade = (score) => {
  if (score >= 80) return { grade: 'A', label: 'Sangat Layak',      color: '#22c55e', bg: 'rgba(34,197,94,0.1)',   border: 'rgba(34,197,94,0.3)'   };
  if (score >= 60) return { grade: 'B', label: 'Cukup Layak',       color: '#60a5fa', bg: 'rgba(96,165,250,0.1)',  border: 'rgba(96,165,250,0.3)'  };
  if (score >= 40) return { grade: 'C', label: 'Perlu Perbaikan',   color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)'  };
  return               { grade: 'D', label: 'Belum Siap Investasi', color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.3)'   };
};

// ─── Strengths & Risks ────────────────────────────────────────────────────────

const buildStrengths = (dims, businessProfile) => {
  const out = [];
  const { consistency, profitability, growth, cashflow } = dims;

  if (consistency.score >= 20)
    out.push('Pendapatan stabil dan dapat diprediksi — nilai positif bagi pemberi pinjaman.');
  if (profitability.avgMargin >= 20)
    out.push(`Margin laba bersih ${profitability.avgMargin.toFixed(1)}% — menunjukkan efisiensi operasional yang baik.`);
  if (growth.growthRate !== null && growth.growthRate >= 5)
    out.push(`Tren pertumbuhan pendapatan ${fmtPct(growth.growthRate)}/bulan — bisnis masih tumbuh.`);
  if (cashflow.posRatio >= 0.8)
    out.push(`Arus kas positif di ${Math.round(cashflow.posRatio * 100)}% bulan — menunjukkan kemampuan bayar yang baik.`);
  if (businessProfile.periodCount >= 6)
    out.push(`Riwayat keuangan ${businessProfile.periodCount} bulan tersedia — data historis yang cukup untuk evaluasi.`);
  if (out.length === 0)
    out.push('Sudah ada catatan keuangan yang mulai terorganisir — ini langkah awal yang baik.');
  return out;
};

const buildRisks = (dims, businessProfile) => {
  const out = [];
  const { consistency, profitability, growth, cashflow } = dims;

  if (consistency.score <= 8)
    out.push('Pendapatan sangat tidak konsisten antar bulan — investor & bank menilai ini sebagai risiko tinggi.');
  if (profitability.avgMargin < 5 && profitability.avgMargin >= 0)
    out.push(`Margin laba tipis (${profitability.avgMargin.toFixed(1)}%) — rentan terhadap kenaikan biaya operasional.`);
  if (profitability.avgMargin < 0)
    out.push('Rata-rata masih merugi — perlu pembenahan fundamental sebelum mengajukan pendanaan.');
  if (growth.growthRate !== null && growth.growthRate < 0)
    out.push(`Tren pendapatan menurun (${fmtPct(growth.growthRate)}/bulan) — sinyal yang perlu diselesaikan lebih dulu.`);
  if (cashflow.posRatio < 0.6)
    out.push(`Arus kas negatif di ${Math.round((1 - cashflow.posRatio) * 100)}% bulan — kemampuan bayar cicilan dipertanyakan.`);
  if (businessProfile.periodCount < 3)
    out.push('Riwayat keuangan kurang dari 3 bulan — pemberi pinjaman umumnya meminta minimal 3–6 bulan data.');
  if (out.length === 0 && dims.consistency.score < 20)
    out.push('Konsistensi pendapatan masih bisa ditingkatkan untuk memperkuat profil investasi.');
  return out;
};

// ─── Main Export ──────────────────────────────────────────────────────────────

export const computeInvestmentScore = (periods) => {
  if (!periods || periods.length === 0) {
    return null;
  }

  const revenues   = periods.map((p) => p.revenue);
  const netProfits = periods.map((p) => p.netProfit);

  const dimConsistency  = scoreConsistency(revenues);
  const dimProfitability = scoreProfitability(periods);
  const dimGrowth       = scoreGrowth(revenues);
  const dimCashflow     = scoreCashFlow(periods);

  const totalScore = clamp(
    dimConsistency.score + dimProfitability.score + dimGrowth.score + dimCashflow.score,
    0, 100
  );

  const { grade, label: gradeLabel, color, bg, border } = getGrade(totalScore);

  const businessProfile = {
    avgMonthlyRevenue:  mean(revenues),
    avgMonthlyExpenses: mean(periods.map((p) => p.expenses)),
    avgNetProfit:       mean(netProfits),
    profitMarginPct:    dimProfitability.avgMargin,
    revenueGrowthPct:   dimGrowth.growthRate,
    positiveCashMonths: dimCashflow.posCount ?? 0,
    periodCount:        periods.length,
    firstPeriod:        periods[0]?.label ?? '—',
    lastPeriod:         periods[periods.length - 1]?.label ?? '—',
  };

  const dims = {
    consistency:  dimConsistency,
    profitability: dimProfitability,
    growth:       dimGrowth,
    cashflow:     dimCashflow,
  };

  const strengths = buildStrengths(dims, businessProfile);
  const risks     = buildRisks(dims, businessProfile);

  // Plain-language overall recommendation
  let recommendation;
  if (grade === 'A') {
    recommendation = 'Profil keuangan bisnis Anda cukup kuat untuk mulai mengajukan pinjaman modal usaha atau mencari investor skala kecil. Siapkan dokumen legalitas dan rencana penggunaan dana.';
  } else if (grade === 'B') {
    recommendation = 'Bisnis Anda menunjukkan potensi yang baik. Perkuat 1–2 area yang masih lemah (lihat Risiko) selama 2–3 bulan ke depan, lalu pertimbangkan pengajuan KUR atau pinjaman UMKM.';
  } else if (grade === 'C') {
    recommendation = 'Masih perlu beberapa perbaikan sebelum siap untuk pengajuan pendanaan formal. Fokus pada stabilisasi pendapatan dan efisiensi biaya terlebih dahulu.';
  } else {
    recommendation = 'Saat ini belum disarankan mengajukan pinjaman — risiko cicilan macet cukup tinggi. Prioritaskan memperbaiki arus kas dan meningkatkan margin keuntungan selama 3–6 bulan ke depan.';
  }

  return {
    score: totalScore,
    grade,
    gradeLabel,
    color,
    bg,
    border,
    dimensions: [
      { key: 'consistency',  name: 'Konsistensi Pendapatan', score: dimConsistency.score,   max: 25, detail: dimConsistency.detail  },
      { key: 'profitability', name: 'Profitabilitas',         score: dimProfitability.score, max: 25, detail: dimProfitability.detail },
      { key: 'growth',       name: 'Pertumbuhan',             score: dimGrowth.score,        max: 25, detail: dimGrowth.detail       },
      { key: 'cashflow',     name: 'Kesehatan Arus Kas',      score: dimCashflow.score,      max: 25, detail: dimCashflow.detail      },
    ],
    strengths,
    risks,
    recommendation,
    businessProfile,
    fmt,
    fmtPct,
  };
};
