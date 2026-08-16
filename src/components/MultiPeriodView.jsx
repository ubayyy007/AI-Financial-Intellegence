import { useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, Legend, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { AlertTriangle, CheckCircle2, Info, TrendingDown, TrendingUp, DollarSign } from 'lucide-react';
import { buildChartData, detectWarnings } from '../utils/multiPeriodEngine';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n ?? 0);

const fmtShort = (v) => {
  if (Math.abs(v) >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}jt`;
  if (Math.abs(v) >= 1_000)     return `${(v / 1_000).toFixed(0)}rb`;
  return String(v);
};

const delta = (current, previous) => {
  if (!previous || previous === 0) return null;
  return ((current - previous) / Math.abs(previous)) * 100;
};

// ─── Warning Card ─────────────────────────────────────────────────────────────

const SEVERITY_CONFIG = {
  danger:  { color: '#ef4444', bg: 'rgba(239,68,68,0.08)',  border: 'rgba(239,68,68,0.25)',  Icon: AlertTriangle },
  warning: { color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.25)', Icon: TrendingDown  },
  info:    { color: '#60a5fa', bg: 'rgba(96,165,250,0.08)', border: 'rgba(96,165,250,0.25)', Icon: Info          },
  success: { color: '#22c55e', bg: 'rgba(34,197,94,0.08)',  border: 'rgba(34,197,94,0.25)',  Icon: CheckCircle2  },
};

const WarningCard = ({ warning }) => {
  const cfg = SEVERITY_CONFIG[warning.severity] || SEVERITY_CONFIG.info;
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: '0.625rem',
      padding: '0.75rem 1rem',
      background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: '8px',
    }}>
      <cfg.Icon size={15} color={cfg.color} style={{ flexShrink: 0, marginTop: '1px' }} />
      <span style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', lineHeight: 1.55 }}>
        {warning.message}
      </span>
    </div>
  );
};

// ─── MoM Delta Badge ─────────────────────────────────────────────────────────

const DeltaBadge = ({ pct }) => {
  if (pct === null) return <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>—</span>;
  const up = pct >= 0;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '2px',
      fontSize: '0.7rem', fontWeight: 600,
      color: up ? '#22c55e' : '#ef4444',
    }}>
      {up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
      {Math.abs(pct).toFixed(1)}%
    </span>
  );
};

// ─── Forecast Summary Cards ───────────────────────────────────────────────────

const ForecastCard = ({ month, revenue, expenses, netProfit, netCashFlow }) => {
  const isPositive = netProfit >= 0;
  const cashOk = netCashFlow >= 0;
  return (
    <div style={{
      flex: 1, minWidth: 160,
      padding: '1rem',
      background: 'var(--bg-secondary)',
      border: `1px solid ${isPositive ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
      borderRadius: '10px',
    }}>
      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.625rem' }}>
        {month} <span style={{ fontSize: '0.65rem', color: '#60a5fa', fontWeight: 500 }}>(proyeksi)</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>Pendapatan</span>
          <span style={{ color: '#22c55e', fontWeight: 500 }}>{fmt(revenue)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>Biaya</span>
          <span style={{ color: '#ef4444', fontWeight: 500 }}>{fmt(expenses)}</span>
        </div>
        <div style={{ borderTop: '1px solid var(--border)', marginTop: '0.25rem', paddingTop: '0.35rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600 }}>
          <span>Laba Bersih</span>
          <span style={{ color: isPositive ? '#22c55e' : '#ef4444' }}>{fmt(netProfit)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>Arus Kas</span>
          <span style={{ color: cashOk ? '#22c55e' : '#ef4444' }}>{fmt(netCashFlow)}</span>
        </div>
      </div>
    </div>
  );
};

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: '8px', padding: '0.75rem 1rem',
      fontSize: '0.8rem', minWidth: 180,
      boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
    }}>
      <div style={{ fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>{label}</div>
      {payload.map((entry) => (
        <div key={entry.dataKey} style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', color: entry.color, marginBottom: '0.2rem' }}>
          <span>{entry.name}</span>
          <span style={{ fontWeight: 500 }}>{fmt(entry.value)}</span>
        </div>
      ))}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function MultiPeriodView({ periods, forecast }) {
  const warnings = useMemo(() => detectWarnings(periods, forecast), [periods, forecast]);
  const chartData = useMemo(() => buildChartData(periods, forecast), [periods, forecast]);

  // Boundary label on chart — the last actual month
  const boundaryMonth = periods.length > 0 ? periods[periods.length - 1].label : null;

  if (periods.length === 0) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
        <DollarSign size={40} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
        <h3 style={{ marginBottom: '0.5rem' }}>Belum ada data dengan tanggal</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Upload data yang mengandung tanggal transaksi agar sistem dapat mengelompokkan per periode.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* ── Warnings ──────────────────────────────────────────────── */}
      {warnings.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', marginBottom: '1.5rem' }}>
          {warnings.map((w, i) => <WarningCard key={i} warning={w} />)}
        </div>
      )}

      {/* ── Trend + Forecast Chart ────────────────────────────────── */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h3 style={{ margin: 0, fontSize: '1rem' }}>Tren & Proyeksi Keuangan</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <span>—— Historis</span>
            <span style={{ letterSpacing: '2px' }}>- - - Proyeksi</span>
          </div>
        </div>

        <div style={{ height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="var(--text-muted)" />
              <YAxis
                tick={{ fontSize: 11 }}
                stroke="var(--text-muted)"
                tickFormatter={(v) => `${fmtShort(v)}`}
                width={52}
              />
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '0.8rem', paddingTop: '0.5rem' }} />

              {/* Actual lines */}
              <Line type="monotone" dataKey="revenue"    name="Pendapatan"   stroke="#22c55e" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} connectNulls />
              <Line type="monotone" dataKey="expenses"   name="Total Biaya"  stroke="#f87171" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} connectNulls />
              <Line type="monotone" dataKey="netProfit"  name="Laba Bersih"  stroke="#818cf8" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} connectNulls />

              {/* Forecast lines (dashed) */}
              {forecast.months.length > 0 && (
                <>
                  <Line type="monotone" dataKey="fcRevenue"   name="Proyeksi Pendapatan"  stroke="#22c55e" strokeWidth={2} strokeDasharray="6 4" dot={false} connectNulls legendType="none" />
                  <Line type="monotone" dataKey="fcExpenses"  name="Proyeksi Biaya"       stroke="#f87171" strokeWidth={2} strokeDasharray="6 4" dot={false} connectNulls legendType="none" />
                  <Line type="monotone" dataKey="fcNetProfit" name="Proyeksi Laba Bersih" stroke="#818cf8" strokeWidth={2} strokeDasharray="6 4" dot={false} connectNulls legendType="none" />
                  {boundaryMonth && (
                    <ReferenceLine
                      x={boundaryMonth}
                      stroke="var(--border)"
                      strokeDasharray="4 2"
                      label={{ value: 'Sekarang', position: 'insideTopRight', fontSize: 10, fill: 'var(--text-muted)' }}
                    />
                  )}
                </>
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Forecast Summary Cards ────────────────────────────────── */}
      {forecast.months.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.75rem', fontWeight: 600 }}>
            Ringkasan Proyeksi 3 Bulan ke Depan
          </h3>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {forecast.months.map((m, i) => (
              <ForecastCard
                key={m}
                month={m}
                revenue={forecast.revenue[i]}
                expenses={forecast.expenses[i]}
                netProfit={forecast.netProfit[i]}
                netCashFlow={forecast.netCashFlow[i]}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Period Comparison Table ───────────────────────────────── */}
      <div className="card">
        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem' }}>
          Tabel Komparasi Per Periode
          <span className="badge" style={{ marginLeft: '0.625rem', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', border: '1px solid rgba(59,130,246,0.3)' }}>
            {periods.length} bulan
          </span>
        </h3>
        <div className="table-container" style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Periode</th>
                <th style={{ textAlign: 'right' }}>Pendapatan</th>
                <th style={{ textAlign: 'right' }}>Total Biaya</th>
                <th style={{ textAlign: 'right' }}>Laba Kotor</th>
                <th style={{ textAlign: 'right' }}>Laba Bersih</th>
                <th style={{ textAlign: 'right' }}>Arus Kas</th>
                <th style={{ textAlign: 'center' }}>MoM</th>
              </tr>
            </thead>
            <tbody>
              {periods.map((p, i) => {
                const prev = periods[i - 1];
                const pct = prev ? delta(p.netProfit, prev.netProfit) : null;
                const isLoss = p.netProfit < 0;
                return (
                  <tr key={p.key} style={isLoss ? { background: 'rgba(239,68,68,0.04)' } : {}}>
                    <td style={{ fontWeight: 500, whiteSpace: 'nowrap' }}>{p.label}</td>
                    <td style={{ textAlign: 'right', color: '#22c55e' }}>{fmt(p.revenue)}</td>
                    <td style={{ textAlign: 'right', color: '#f87171' }}>{fmt(p.expenses)}</td>
                    <td style={{ textAlign: 'right' }}>{fmt(p.grossProfit)}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600, color: isLoss ? '#ef4444' : '#22c55e' }}>
                      {fmt(p.netProfit)}
                    </td>
                    <td style={{ textAlign: 'right', color: p.netCashFlow >= 0 ? '#22c55e' : '#ef4444' }}>
                      {fmt(p.netCashFlow)}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <DeltaBadge pct={pct} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
