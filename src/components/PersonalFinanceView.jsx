import { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import { analyzePersonalFinance, BUCKET, FRAMEWORKS } from '../utils/personalFinanceEngine';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n ?? 0);

// ─── Framework Selector ───────────────────────────────────────────────────────

const FrameworkSelector = ({ value, onChange }) => {
  const fw = FRAMEWORKS[value];
  return (
    <div className="card" style={{ marginBottom: '1.5rem' }}>
      <div style={{ marginBottom: '1rem' }}>
        <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1rem' }}>Pilih Framework Budgeting</h3>
        <p style={{ margin: 0, fontSize: '0.775rem', color: 'var(--text-muted)' }}>
          Setiap orang punya filosofi keuangan yang berbeda. Pilih framework yang paling sesuai dengan kondisi dan tujuanmu.
        </p>
      </div>

      {/* Option grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.625rem', marginBottom: '1rem' }}>
        {Object.values(FRAMEWORKS).map((f) => {
          const active = value === f.key;
          return (
            <button
              key={f.key}
              onClick={() => onChange(f.key)}
              style={{
                padding: '0.625rem 0.75rem',
                background: active ? 'var(--primary)' : 'var(--bg-secondary)',
                border: `1px solid ${active ? 'var(--primary)' : 'var(--border)'}`,
                borderRadius: '8px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s',
              }}
            >
              <div style={{ fontSize: '1.1rem', marginBottom: '0.2rem' }}>{f.emoji}</div>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: active ? '#fff' : 'var(--text-primary)', lineHeight: 1.3 }}>{f.name}</div>
              <div style={{ fontSize: '0.68rem', color: active ? 'rgba(255,255,255,0.75)' : 'var(--text-muted)', marginTop: '0.15rem', lineHeight: 1.35 }}>{f.tagline}</div>
            </button>
          );
        })}
      </div>

      {/* Selected framework detail */}
      <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.875rem 1rem' }}>
        <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.8125rem', color: 'var(--text-primary)', lineHeight: 1.65 }}>
          {fw.description}
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem', marginBottom: '0.625rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>
            <span style={{ color: '#22c55e', fontWeight: 600 }}>✓ Cocok untuk:</span><br />
            {fw.suitedFor}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>
            <span style={{ color: '#f59e0b', fontWeight: 600 }}>⚠ Kurang cocok:</span><br />
            {fw.notSuitedFor}
          </div>
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
          💭 <em>{fw.philosophy}</em>
        </div>
      </div>
    </div>
  );
};

// ─── Metric Card ──────────────────────────────────────────────────────────────

const MetricCard = ({ label, value, sub, color, icon: Icon }) => (
  <div style={{
    flex: 1, minWidth: 150,
    padding: '1rem 1.25rem',
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    position: 'relative', overflow: 'hidden',
  }}>
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${color}60, ${color}20)` }} />
    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
      {Icon && <Icon size={12} color={color} />}
      {label}
    </div>
    <div style={{ fontSize: '1.375rem', fontWeight: 700, color, letterSpacing: '-0.02em', lineHeight: 1.2 }}>{value}</div>
    {sub && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{sub}</div>}
  </div>
);

// ─── Framework Bar ────────────────────────────────────────────────────────────

const RuleBar = ({ label, actual, target, isUpperBound, color }) => {
  const isOk = isUpperBound ? actual <= target : actual >= target;
  const barPct = Math.min(100, Math.max(0, actual));
  const targetPct = Math.min(100, target);

  return (
    <div style={{ marginBottom: '0.875rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
        <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-primary)' }}>{label}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            target {isUpperBound ? '≤' : '≥'}{target}%
          </span>
          <span style={{
            fontSize: '0.75rem', fontWeight: 700,
            color: isOk ? '#22c55e' : '#ef4444',
            padding: '0.1rem 0.4rem', borderRadius: '20px',
            background: isOk ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
          }}>
            {actual.toFixed(1)}%
          </span>
        </div>
      </div>
      <div style={{ height: 8, background: 'var(--bg-card)', borderRadius: 4, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${barPct}%`, background: isOk ? color : '#ef4444', borderRadius: 4, transition: 'width 0.4s ease' }} />
        <div style={{ position: 'absolute', top: -1, left: `${targetPct}%`, width: 2, height: '110%', background: 'var(--text-muted)', opacity: 0.5, borderRadius: 2 }} />
      </div>
    </div>
  );
};

// ─── Recommendation Card ──────────────────────────────────────────────────────

const RecCard = ({ rec }) => (
  <div style={{
    display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
    padding: '0.875rem 1rem',
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
  }}>
    <span style={{ fontSize: '1.25rem', lineHeight: 1, flexShrink: 0 }}>{rec.emoji}</span>
    <span style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>{rec.text}</span>
  </div>
);

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

const PieTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0];
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '0.625rem 0.875rem', fontSize: '0.8rem' }}>
      <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{name}</div>
      <div style={{ color: payload[0].payload.color }}>{fmt(value)}</div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PersonalFinanceView({ transactions }) {
  const [frameworkKey, setFrameworkKey] = useState('50-30-20');

  const data = useMemo(
    () => analyzePersonalFinance(transactions, frameworkKey),
    [transactions, frameworkKey],
  );

  const {
    buckets, totalIncome, totalExpense, netBalance,
    savingsRate, score, healthLevel, healthColor,
    recommendations, spendingSlices, savingsTarget,
  } = data;

  const fw = FRAMEWORKS[frameworkKey];
  const bars = fw.bars(data);

  const NetIcon = netBalance > 0 ? TrendingUp : netBalance < 0 ? TrendingDown : Minus;
  const netColor = netBalance > 0 ? '#22c55e' : netBalance < 0 ? '#ef4444' : 'var(--text-muted)';

  return (
    <div>
      {/* ── Framework Selector ────────────────────────────────── */}
      <FrameworkSelector value={frameworkKey} onChange={setFrameworkKey} />

      {/* ── Health Score + Key Metrics ───────────────────────── */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          {/* Score Circle */}
          <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: `conic-gradient(${healthColor} ${score * 3.6}deg, var(--bg-secondary) 0deg)`,
              boxShadow: `0 0 0 4px var(--bg-card), 0 0 0 5px ${healthColor}33`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{
                width: 62, height: 62, borderRadius: '50%',
                background: 'var(--bg-card)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 700, color: healthColor, lineHeight: 1 }}>{score}</span>
                <span style={{ fontSize: '0.55rem', color: 'var(--text-muted)', lineHeight: 1.2 }}>/100</span>
              </div>
            </div>
            <span style={{
              fontSize: '0.75rem', fontWeight: 700, color: healthColor,
              padding: '0.2rem 0.625rem', borderRadius: '20px',
              background: `${healthColor}18`,
              border: `1px solid ${healthColor}30`,
            }}>
              {healthLevel}
            </span>
          </div>

          <div style={{ flex: 1, minWidth: 200 }}>
            <h2 style={{ margin: '0 0 0.25rem 0', fontSize: '1.125rem', fontWeight: 700 }}>Skor Kesehatan Keuangan Personal</h2>
            <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Dihitung berdasarkan prinsip <strong>{fw.name}</strong> — {fw.tagline}.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.875rem', flexWrap: 'wrap' }}>
          <MetricCard label="Total Pemasukan"   value={fmt(totalIncome)}  color="#22c55e" icon={TrendingUp} />
          <MetricCard label="Total Pengeluaran" value={fmt(totalExpense)} color="#f87171" icon={TrendingDown} />
          <MetricCard
            label="Saldo Bersih"
            value={fmt(netBalance)}
            sub={netBalance >= 0 ? 'Surplus — atur ke tabungan' : 'Defisit — kurangi pengeluaran'}
            color={netColor}
            icon={NetIcon}
          />
          <MetricCard
            label="Tingkat Tabungan"
            value={`${savingsRate.toFixed(1)}%`}
            sub={savingsRate >= savingsTarget ? `✓ Memenuhi target ${savingsTarget}%` : `Belum mencapai target ${savingsTarget}%`}
            color={savingsRate >= savingsTarget ? '#22c55e' : savingsRate >= savingsTarget / 2 ? '#f59e0b' : '#ef4444'}
          />
        </div>
      </div>

      {/* ── Framework Bars + Donut ────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Framework bars */}
        <div className="card" style={{ marginBottom: 0 }}>
          <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1rem' }}>
            {fw.emoji} Cek Framework {fw.name}
          </h3>
          <p style={{ margin: '0 0 1.25rem 0', fontSize: '0.775rem', color: 'var(--text-muted)' }}>
            Persentase dari total pemasukan
          </p>
          {bars.map((bar, i) => (
            <RuleBar
              key={i}
              label={bar.label}
              actual={bar.actual}
              target={bar.target}
              isUpperBound={bar.isUpperBound}
              color={bar.color}
            />
          ))}
          <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'var(--bg-secondary)', borderRadius: '8px', fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>
            <strong style={{ color: 'var(--text-primary)' }}>Filosofi:</strong> {fw.philosophy}<br />
            <span>Garis tegak = batas target ideal.</span>
          </div>
        </div>

        {/* Donut chart */}
        <div className="card" style={{ marginBottom: 0 }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem' }}>Komposisi Pengeluaran</h3>
          {spendingSlices.length > 0 ? (
            <div style={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={spendingSlices}
                    cx="50%" cy="45%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {spendingSlices.map((s, i) => (
                      <Cell key={i} fill={s.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip content={<PieTooltip />} />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '0.775rem' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Belum ada data pengeluaran terdeteksi
            </div>
          )}
        </div>
      </div>

      {/* ── Spending Detail ───────────────────────────────────── */}
      {Object.values(buckets).some((v) => v > 0) && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem' }}>Rincian per Bucket</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.75rem' }}>
            {[
              { key: BUCKET.INCOME,  color: '#22c55e', label: 'Pemasukan' },
              { key: BUCKET.NEEDS,   color: '#34d399', label: 'Kebutuhan' },
              { key: BUCKET.WANTS,   color: '#f59e0b', label: 'Keinginan' },
              { key: BUCKET.SAVINGS, color: '#818cf8', label: 'Tabungan & Investasi' },
              { key: BUCKET.OTHER,   color: '#94a3b8', label: 'Lain-lain' },
            ].filter(({ key }) => buckets[key] > 0).map(({ key, color, label }) => (
              <div key={key} style={{ padding: '0.75rem 1rem', background: 'var(--bg-secondary)', borderRadius: '8px', borderLeft: `3px solid ${color}` }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color, marginTop: '0.25rem' }}>{fmt(buckets[key])}</div>
                {key !== BUCKET.INCOME && totalIncome > 0 && (
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    {((buckets[key] / totalIncome) * 100).toFixed(1)}% dari pemasukan
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Recommendations ───────────────────────────────────── */}
      <div className="card">
        <h3 style={{ margin: '0 0 0.875rem 0', fontSize: '1rem' }}>Rekomendasi Personal</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
          {recommendations.map((rec, i) => <RecCard key={i} rec={rec} />)}
        </div>
        <p style={{ margin: '1rem 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
          * Rekomendasi dihasilkan otomatis berdasarkan data transaksi dan framework <strong>{fw.name}</strong>. Bukan saran keuangan profesional.
        </p>
      </div>
    </div>
  );
}
