import { useState, useMemo } from 'react';
import { TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';
import { computeBenchmark, SECTORS, BENCHMARKS } from '../utils/benchmarkEngine';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const clamp01 = (v) => Math.min(1, Math.max(0, v));

// ─── Comparison Bar ───────────────────────────────────────────────────────────
// Side-by-side bar showing user vs benchmark on the same scale

const ComparisonBar = ({ item }) => {
  const { user, benchmark, higherIsBetter, userLabel, benchLabel, label, delta, icon, unit } = item;

  const diff = user - benchmark;
  const isGood = higherIsBetter ? diff >= 0 : diff <= 0;
  const isNeutral = delta === 'setara dengan rata-rata sektor';

  // Normalise both bars to a common scale (max of user and benchmark)
  let userPct, benchPct;
  if (unit === 'currency') {
    const maxVal = Math.max(user, benchmark, 1);
    userPct  = clamp01(user / maxVal) * 100;
    benchPct = clamp01(benchmark / maxVal) * 100;
  } else {
    // For percentage values cap at 100%
    const maxVal = Math.max(user, benchmark, 1);
    userPct  = clamp01(user / maxVal) * 100;
    benchPct = clamp01(benchmark / maxVal) * 100;
  }

  const userColor  = isNeutral ? '#60a5fa' : isGood ? '#22c55e' : '#f59e0b';
  const SentIcon   = isNeutral ? Minus : isGood ? TrendingUp : TrendingDown;

  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
        <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          {icon} {label}
        </span>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
          fontSize: '0.75rem', fontWeight: 600,
          color: userColor,
          padding: '0.15rem 0.5rem', borderRadius: '20px',
          background: `${userColor}15`,
        }}>
          <SentIcon size={11} />
          {delta}
        </span>
      </div>

      {/* User bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.3rem' }}>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', width: 58, textAlign: 'right', flexShrink: 0 }}>Bisnis Anda</span>
        <div style={{ flex: 1, height: 10, background: 'var(--bg-card)', borderRadius: 5, overflow: 'hidden' }}>
          <div style={{ width: `${userPct}%`, height: '100%', background: userColor, borderRadius: 5, transition: 'width 0.5s ease' }} />
        </div>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: userColor, width: 72, flexShrink: 0 }}>{userLabel}</span>
      </div>

      {/* Benchmark bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', width: 58, textAlign: 'right', flexShrink: 0 }}>Rata-rata</span>
        <div style={{ flex: 1, height: 10, background: 'var(--bg-card)', borderRadius: 5, overflow: 'hidden' }}>
          <div style={{ width: `${benchPct}%`, height: '100%', background: 'var(--border)', borderRadius: 5 }} />
        </div>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', width: 72, flexShrink: 0 }}>{benchLabel}</span>
      </div>
    </div>
  );
};

// ─── Sector Selector ──────────────────────────────────────────────────────────

const SectorSelector = ({ selected, onChange }) => (
  <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap' }}>
    {SECTORS.map((s) => {
      const active = selected === s.key;
      return (
        <button
          key={s.key}
          onClick={() => onChange(s.key)}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.375rem',
            padding: '0.45rem 0.875rem',
            borderRadius: '8px',
            border: `1px solid ${active ? 'var(--primary)' : 'var(--border)'}`,
            background: active ? 'var(--primary-light)' : 'var(--bg-secondary)',
            color: active ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: active ? 600 : 400,
            fontSize: '0.8125rem',
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
        >
          {s.emoji} {s.label}
        </button>
      );
    })}
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

export default function BenchmarkView({ periods }) {
  const [sectorKey, setSectorKey] = useState('fnb');

  const result = useMemo(
    () => computeBenchmark(periods, sectorKey),
    [periods, sectorKey]
  );

  if (!periods || periods.length === 0) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
        <Info size={40} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
        <h3 style={{ marginBottom: '0.5rem' }}>Belum ada data keuangan</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Upload data laporan keuangan untuk membandingkan performa bisnis Anda dengan sektor UMKM sejenis.
        </p>
      </div>
    );
  }

  const { sector, comparisons, wins, total, overallLabel, overallColor, highlights } = result;

  return (
    <div>
      {/* ── Sektor Selector ───────────────────────────────────────── */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1rem' }}>Pilih Sektor Usaha Anda</h3>
        <p style={{ margin: '0 0 1rem 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Pilih jenis usaha yang paling mirip dengan bisnis Anda untuk perbandingan yang relevan.
        </p>
        <SectorSelector selected={sectorKey} onChange={setSectorKey} />
        <p style={{ margin: '0.75rem 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'flex-start', gap: '0.3rem' }}>
          <Info size={11} style={{ marginTop: 2, flexShrink: 0 }} />
          {BENCHMARKS[sectorKey].notes}
        </p>
      </div>

      {/* ── Overall Position ──────────────────────────────────────── */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1rem' }}>
              {sector.emoji} Perbandingan vs {sector.label}
            </h3>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Bisnis Anda unggul di {wins} dari {total} dimensi yang diukur.
            </p>
          </div>
          <span style={{
            padding: '0.35rem 1rem', borderRadius: '20px', fontSize: '0.875rem', fontWeight: 700,
            background: `${overallColor}18`, color: overallColor, border: `1px solid ${overallColor}40`,
            flexShrink: 0,
          }}>
            {overallLabel}
          </span>
        </div>

        {/* Highlights in plain language */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
          {highlights.map((h, i) => (
            <div key={i} style={{
              padding: '0.75rem 1rem',
              background: 'var(--bg-secondary)', border: '1px solid var(--border)',
              borderRadius: '8px', fontSize: '0.8125rem', color: 'var(--text-primary)', lineHeight: 1.65,
            }}>
              {h}
            </div>
          ))}
        </div>

        {/* Comparison bars */}
        <div>
          {comparisons.map((item) => (
            <ComparisonBar key={item.key} item={item} />
          ))}
        </div>
      </div>

      {/* ── Benchmark Reference Table ─────────────────────────────── */}
      <div className="card">
        <h3 style={{ margin: '0 0 0.75rem 0', fontSize: '1rem' }}>Tabel Referensi Benchmark UMKM</h3>
        <div className="table-container" style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Sektor</th>
                <th style={{ textAlign: 'right' }}>Pendapatan/Bln</th>
                <th style={{ textAlign: 'right' }}>Margin Bersih</th>
                <th style={{ textAlign: 'right' }}>Rasio Pengeluaran</th>
                <th style={{ textAlign: 'right' }}>Pertumbuhan/Bln</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(BENCHMARKS).map(([key, b]) => {
                const isActive = key === sectorKey;
                return (
                  <tr
                    key={key}
                    style={isActive ? { background: 'var(--primary-light)' } : {}}
                    onClick={() => setSectorKey(key)}
                    title="Klik untuk memilih sektor ini"
                    className="clickable-row"
                  >
                    <td style={{ fontWeight: isActive ? 700 : 400, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                      {b.emoji} {b.label}
                      {isActive && <span style={{ marginLeft: '0.4rem', fontSize: '0.65rem', color: 'var(--primary)', fontWeight: 700, background: 'rgba(59,130,246,0.15)', padding: '0.1rem 0.35rem', borderRadius: '20px' }}>dipilih</span>}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(b.avgMonthlyRevenue)}
                    </td>
                    <td style={{ textAlign: 'right' }}>{b.netMarginPct}%</td>
                    <td style={{ textAlign: 'right' }}>{b.expenseRatioPct}%</td>
                    <td style={{ textAlign: 'right' }}>+{b.monthlyGrowthPct}%</td>
                  </tr>
                );
              })}
              {/* User row */}
              {result && (
                <tr style={{ borderTop: '2px solid var(--primary)', background: 'rgba(59,130,246,0.06)' }}>
                  <td style={{ fontWeight: 700, color: 'var(--primary)' }}>📊 Bisnis Anda</td>
                  <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--primary)' }}>
                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(result.userMetrics.avgRevenue)}
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 600, color: result.userMetrics.netMarginPct >= 0 ? '#22c55e' : '#ef4444' }}>
                    {result.userMetrics.netMarginPct.toFixed(1)}%
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>
                    {result.userMetrics.expenseRatioPct.toFixed(1)}%
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 600, color: result.userMetrics.monthlyGrowthPct != null && result.userMetrics.monthlyGrowthPct >= 0 ? '#22c55e' : '#ef4444' }}>
                    {result.userMetrics.monthlyGrowthPct != null
                      ? `${result.userMetrics.monthlyGrowthPct >= 0 ? '+' : ''}${result.userMetrics.monthlyGrowthPct.toFixed(1)}%`
                      : '—'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <p style={{ margin: '0.875rem 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
          * Data benchmark berdasarkan statistik UMKM Indonesia (BPS, Bank Indonesia, Kemenkop UKM). Angka merupakan estimasi representatif — kondisi aktual bervariasi antar daerah dan jenis usaha spesifik.
        </p>
      </div>
    </div>
  );
}
