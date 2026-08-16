// ─── Constants ─────────────────────────────────────────────────────────────────

const DAYS_ID = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

// Keywords to identify restocking / supply expenses
const RESTOCK_KW = [
  'belanja', 'beli', 'modal', 'stok', 'stock', 'kulakan', 'kulak', 'kulaan',
  'bahan', 'supply', 'grosir', 'sembako', 'sayur', 'daging', 'ikan',
  'tepung', 'minyak', 'gula', 'beras', 'kopi', 'teh', 'mie',
  'packaging', 'kemasan', 'plastik', 'kardus',
];

const matchAny = (text, kws) => kws.some((k) => text.includes(k));

// ─── Helpers ───────────────────────────────────────────────────────────────────

const parseDate = (dateStr) => {
  if (!dateStr || dateStr === 'N/A') return null;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
};

const toDateKey = (d) => d.toISOString().slice(0, 10);

// ─── Main Analysis ─────────────────────────────────────────────────────────────

export const analyzeMikro = (transactions) => {
  let totalIn = 0, totalOut = 0;
  const byDay   = Array.from({ length: 7 }, () => ({ count: 0, amountIn: 0, amountOut: 0 }));
  const byCat   = {};
  const byDate  = {};

  for (const t of transactions) {
    const isIn = t.type === 'Debit';
    if (isIn) totalIn  += t.amount;
    else       totalOut += t.amount;

    // Day-of-week
    const d = parseDate(t.date);
    if (d) {
      const dow = d.getDay();
      byDay[dow].count++;
      if (isIn)  byDay[dow].amountIn  += t.amount;
      else        byDay[dow].amountOut += t.amount;

      // Daily
      const dk = toDateKey(d);
      if (!byDate[dk]) byDate[dk] = { amountIn: 0, amountOut: 0 };
      if (isIn)  byDate[dk].amountIn  += t.amount;
      else        byDate[dk].amountOut += t.amount;
    }

    // Category
    const cat = t.category || 'Lain-lain';
    if (!byCat[cat]) byCat[cat] = { amountIn: 0, amountOut: 0, count: 0 };
    byCat[cat].count++;
    if (isIn)  byCat[cat].amountIn  += t.amount;
    else        byCat[cat].amountOut += t.amount;
  }

  const profit = totalIn - totalOut;

  // ── Busiest day ──────────────────────────────────────────────────────────────
  let busiestDayIdx = 0;
  for (let i = 1; i < 7; i++) {
    if (byDay[i].count > byDay[busiestDayIdx].count) busiestDayIdx = i;
  }
  const busiestDay = byDay[busiestDayIdx].count > 0 ? DAYS_ID[busiestDayIdx] : null;

  // Day chart data
  const dayChart = DAYS_ID.map((name, i) => ({
    name,
    masuk: byDay[i].amountIn,
    keluar: byDay[i].amountOut,
    count: byDay[i].count,
  }));

  // ── Category performance ─────────────────────────────────────────────────────
  const catList = Object.entries(byCat)
    .map(([name, v]) => ({ name, ...v, margin: v.amountIn - v.amountOut }))
    .sort((a, b) => b.amountIn - a.amountIn);

  const topEarners = catList.filter((c) => c.amountIn > 0).slice(0, 5);
  const bestMargin = [...catList].sort((a, b) => b.margin - a.margin).filter((c) => c.margin > 0)[0] ?? null;

  // ── Daily trend (last 30 entries) ────────────────────────────────────────────
  const dailyData = Object.entries(byDate)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-30)
    .map(([date, v]) => ({
      date: date.slice(5), // MM-DD for chart label
      masuk: v.amountIn,
      keluar: v.amountOut,
      untung: v.amountIn - v.amountOut,
    }));

  // ── Restock detection ────────────────────────────────────────────────────────
  // Identify large outgoing transactions that look like supply purchases
  const restockTx = transactions
    .filter((t) => t.type === 'Kredit' && t.amount > 0)
    .filter((t) => {
      const text = `${t.category} ${t.description}`.toLowerCase();
      return matchAny(text, RESTOCK_KW);
    });

  const restockTotal = restockTx.reduce((s, t) => s + t.amount, 0);
  const avgRestockSize = restockTx.length > 0 ? restockTotal / restockTx.length : 0;

  // Detect most common restock day
  const restockByDay = Array(7).fill(0);
  restockTx.forEach((t) => {
    const d = parseDate(t.date);
    if (d) restockByDay[d.getDay()]++;
  });
  const restockDayIdx = restockByDay.indexOf(Math.max(...restockByDay));
  const restockDay = restockTx.length > 0 && restockByDay[restockDayIdx] > 0
    ? DAYS_ID[restockDayIdx]
    : null;

  // ── Simple profitability metrics ─────────────────────────────────────────────
  const marginPct = totalIn > 0 ? (profit / totalIn) * 100 : 0;
  const profitLevel = marginPct >= 30 ? 'bagus' : marginPct >= 15 ? 'lumayan' : marginPct >= 0 ? 'tipis' : 'rugi';

  // ── Recommendations in plain language ────────────────────────────────────────
  const tips = [];

  if (totalIn === 0) {
    tips.push({ emoji: '💡', text: 'Belum ada data uang masuk. Pastikan transaksi penjualan sudah tercatat dengan tipe "Debit" atau "Uang Masuk".' });
  } else {
    if (profit < 0) {
      tips.push({ emoji: '🚨', text: `Pengeluaran lebih besar dari pemasukan bulan ini (selisih ${fmtSimple(Math.abs(profit))}). Perlu diperiksa — mungkin ada pembelian bahan yang terlalu banyak atau pengeluaran lain-lain yang bisa dikurangi.` });
    }

    if (busiestDay) {
      tips.push({ emoji: '📅', text: `Hari ${busiestDay} paling banyak transaksi. Pastikan stok dan tenaga siap di hari itu agar tidak kehabisan barang.` });
    }

    if (bestMargin && bestMargin.name !== 'Lain-lain') {
      tips.push({ emoji: '⭐', text: `Kategori "${bestMargin.name}" memberi keuntungan terbesar. Pertimbangkan untuk memprioritaskan atau menambah stok di kategori ini.` });
    }

    if (restockDay) {
      tips.push({ emoji: '🛒', text: `Biasanya belanja bahan/kulakan dilakukan hari ${restockDay}. Catat jadwal ini agar tidak lupa dan tidak kehabisan stok mendadak.` });
    } else if (restockTx.length === 0 && totalOut > 0) {
      tips.push({ emoji: '🛒', text: 'Belum ada catatan pengeluaran belanja bahan. Coba tambahkan kategori "Belanja Bahan" agar bisa tahu berapa modal yang keluar per periode.' });
    }

    if (marginPct > 0 && marginPct < 15) {
      tips.push({ emoji: '💰', text: `Margin keuntungan saat ini ${marginPct.toFixed(0)}% — cukup tipis. Coba cek apakah harga jual bisa sedikit dinaikkan atau ada pengeluaran yang bisa dipangkas.` });
    }

    if (marginPct >= 30) {
      tips.push({ emoji: '✅', text: `Margin keuntungan ${marginPct.toFixed(0)}% — sudah bagus! Pertahankan konsistensi catatan agar bisa terus dipantau setiap bulan.` });
    }

    if (tips.length < 2) {
      tips.push({ emoji: '📒', text: 'Semakin lengkap catatan harian Anda, semakin akurat insight yang bisa diberikan. Usahakan mencatat setiap transaksi meski kecil.' });
    }
  }

  return {
    totalIn, totalOut, profit, marginPct, profitLevel,
    busiestDay, busiestDayIdx,
    dayChart,
    topEarners,
    bestMargin,
    dailyData,
    restockDay, restockTotal, avgRestockSize, restockCount: restockTx.length,
    tips,
    txCount: transactions.length,
  };
};

// simple formatter used internally for tip messages
const fmtSimple = (n) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);
