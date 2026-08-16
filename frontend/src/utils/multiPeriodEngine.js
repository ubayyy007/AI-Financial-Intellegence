import { generateStatements } from './financialEngine';

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];

const toMonthKey = (dateStr) => {
  if (!dateStr || dateStr === 'N/A') return null;
  const m = dateStr.match(/^(\d{4})-(\d{2})/);
  return m ? `${m[1]}-${m[2]}` : null;
};

export const monthLabel = (key) => {
  const [year, month] = key.split('-');
  return `${MONTH_NAMES[parseInt(month, 10) - 1]} ${year}`;
};

const addMonths = (key, offset) => {
  let [y, mo] = key.split('-').map(Number);
  mo += offset;
  while (mo > 12) { mo -= 12; y++; }
  while (mo < 1)  { mo += 12; y--; }
  return `${y}-${String(mo).padStart(2, '0')}`;
};

// ─── Linear Regression ────────────────────────────────────────────────────────

const linReg = (values) => {
  const n = values.length;
  if (n === 0) return { a: 0, b: 0 };
  if (n === 1) return { a: values[0], b: 0 };
  const meanX = (n - 1) / 2;
  const meanY = values.reduce((s, v) => s + v, 0) / n;
  let ssXY = 0, ssXX = 0;
  values.forEach((v, i) => {
    ssXY += (i - meanX) * (v - meanY);
    ssXX += (i - meanX) ** 2;
  });
  const b = ssXX === 0 ? 0 : ssXY / ssXX;
  return { a: meanY - b * meanX, b };
};

const project = (values, steps) => {
  if (values.length === 0) return Array(steps).fill(0);
  const { a, b } = linReg(values);
  return Array.from({ length: steps }, (_, i) =>
    Math.round(a + b * (values.length + i))
  );
};

// ─── Public API ────────────────────────────────────────────────────────────────

// Group transactions by calendar month and compute per-period statements.
// Returns Period[] sorted chronologically.
export const buildPeriods = (transactions) => {
  const byMonth = {};
  for (const t of transactions) {
    const key = toMonthKey(t.date);
    if (!key) continue;
    if (!byMonth[key]) byMonth[key] = [];
    byMonth[key].push(t);
  }

  return Object.keys(byMonth)
    .sort()
    .map((key) => {
      const txns = byMonth[key];
      const stmts = generateStatements(txns);
      const expenses = stmts.incomeStatement.operatingExpenses + stmts.incomeStatement.cogs;
      return {
        key,
        label: monthLabel(key),
        transactions: txns,
        statements: stmts,
        revenue:     stmts.incomeStatement.revenue,
        expenses,
        grossProfit: stmts.incomeStatement.grossProfit,
        netProfit:   stmts.incomeStatement.netProfit,
        netCashFlow: stmts.cashFlowStatement.netCashFlow,
      };
    });
};

// Project next `steps` months using linear trend from historical periods.
export const computeForecast = (periods, steps = 3) => {
  if (periods.length === 0) {
    return { months: [], revenue: [], expenses: [], netProfit: [], netCashFlow: [] };
  }

  const lastKey = periods[periods.length - 1].key;
  const months = Array.from({ length: steps }, (_, i) => monthLabel(addMonths(lastKey, i + 1)));

  return {
    months,
    revenue:     project(periods.map((p) => p.revenue),     steps),
    expenses:    project(periods.map((p) => p.expenses),    steps),
    netProfit:   project(periods.map((p) => p.netProfit),   steps),
    netCashFlow: project(periods.map((p) => p.netCashFlow), steps),
  };
};

// Build chart data array that combines historical + forecast (with bridge point).
// Uses separate keys for forecast so recharts can render them as dashed lines.
export const buildChartData = (periods, fc) => {
  const data = periods.map((p) => ({
    month: p.label,
    revenue:    p.revenue,
    expenses:   p.expenses,
    netProfit:  p.netProfit,
    netCashFlow: p.netCashFlow,
  }));

  // Bridge: last actual point is also first forecast point → connects dashed line visually
  if (periods.length > 0 && fc.months.length > 0) {
    const last = periods[periods.length - 1];
    data[data.length - 1] = {
      ...data[data.length - 1],
      fcRevenue:    last.revenue,
      fcExpenses:   last.expenses,
      fcNetProfit:  last.netProfit,
    };
    fc.months.forEach((m, i) => {
      data.push({
        month:       m,
        fcRevenue:   fc.revenue[i],
        fcExpenses:  fc.expenses[i],
        fcNetProfit: fc.netProfit[i],
      });
    });
  }

  return data;
};

// Detect automatic warning conditions from historical periods and forecast.
export const detectWarnings = (periods, fc) => {
  const warnings = [];

  if (periods.length === 0) return warnings;

  if (periods.length === 1) {
    warnings.push({
      type: 'data_sparse',
      severity: 'info',
      message: 'Data hanya mencakup 1 bulan — tambahkan lebih banyak periode untuk proyeksi yang lebih akurat.',
    });
    return warnings;
  }

  // Declining revenue — last 3 periods all strictly decreasing
  const rev = periods.slice(-3).map((p) => p.revenue);
  if (rev.length >= 2 && rev.every((v, i, a) => i === 0 || v < a[i - 1])) {
    warnings.push({
      type: 'declining_revenue',
      severity: 'danger',
      message: `Pendapatan terus menurun ${rev.length} bulan terakhir. Perlu evaluasi strategi penjualan segera.`,
    });
  }

  // Cash tight — any projected month has negative cash flow
  const tightMonths = fc.netCashFlow
    .map((v, i) => (v < 0 ? fc.months[i] : null))
    .filter(Boolean);
  if (tightMonths.length > 0) {
    warnings.push({
      type: 'cash_tight',
      severity: 'danger',
      message: `Proyeksi arus kas negatif pada: ${tightMonths.join(', ')}. Pertimbangkan penghematan atau tambahan modal.`,
    });
  }

  // Rising costs faster than revenue (3-month window)
  if (periods.length >= 3) {
    const slice = periods.slice(-3);
    const revGrowth = slice[0].revenue > 0
      ? (slice[2].revenue - slice[0].revenue) / slice[0].revenue : 0;
    const expGrowth = slice[0].expenses > 0
      ? (slice[2].expenses - slice[0].expenses) / slice[0].expenses : 0;
    if (expGrowth > revGrowth + 0.1 && slice[2].expenses > 0) {
      warnings.push({
        type: 'rising_costs',
        severity: 'warning',
        message: 'Biaya tumbuh lebih cepat dari pendapatan dalam 3 bulan terakhir. Tinjau efisiensi operasional.',
      });
    }
  }

  // Positive signal — only when no danger warnings exist
  const hasDanger = warnings.some((w) => w.severity === 'danger');
  if (!hasDanger) {
    const last = periods[periods.length - 1];
    if (last.netProfit > 0) {
      warnings.push({
        type: 'healthy',
        severity: 'success',
        message: 'Tren keuangan terlihat sehat! Pertahankan konsistensi dan pantau biaya secara berkala.',
      });
    }
  }

  return warnings;
};
