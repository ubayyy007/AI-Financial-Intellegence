import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer, Cell,
  LineChart, Line, Legend,
} from 'recharts';
import { TrendingUp, TrendingDown, Minus, ShoppingCart, Star, Calendar, Package } from 'lucide-react';
import { analyzeMikro } from '../utils/mikroEngine';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n ?? 0);

const fmtShort = (v) => {
  if (Math.abs(v) >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}jt`;
  if (Math.abs(v) >= 1_000)     return `${(v / 1_000).toFixed(0)}rb`;
  return String(Math.round(v));
};

const PROFIT_LABEL = { bagus: 'Untung Bagus', lumayan: 'Lumayan Untung', tipis: 'Untung Tipis', rugi: 'Rugi' };
const PROFIT_COLOR = { bagus: '#22c55e', lumayan: '#86efac', tipis: '#f59e0b', rugi: '#ef4444' };

// ─── Big Number Card ──────────────────────────────────────────────────────────

const BigCard = ({ label, value, color, icon: Icon, sub }) => (
  <div style={{
    flex: 1, minWidth: 160,
    padding: '1.25rem',
    background: 'var(--bg-secondary)',
    border: `1px solid ${color}30`,
    borderRadius: '12px',
    borderTop: `3px solid ${color}`,
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.625rem' }}>
      {Icon && <Icon size={14} color={color} />}
      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
    </div>
    <div style={{ fontSize: '1.5rem', fontWeight: 800, color, letterSpacing: '-0.03em', lineHeight: 1.1 }}>{value}</div>
    {sub && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.375rem' }}>{sub}</div>}
  </div>
);

// ─── Tip Card ─────────────────────────────────────────────────────────────────

const TipCard = ({ tip }) => (
  <div style={{
    display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
    padding: '0.875rem 1rem',
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
  }}>
    <span style={{ fontSize: '1.25rem', lineHeight: 1, flexShrink: 0 }}>{tip.emoji}</span>
    <span style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', lineHeight: 1.65 }}>{tip.text}</span>
  </div>
);

// ─── Day Bar Tooltip ──────────────────────────────────────────────────────────

const DayTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '0.625rem 0.875rem', fontSize: '0.8rem' }}>
      <div style={{ fontWeight: 600, marginBottom: '0.375rem' }}>{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} style={{ color: p.fill, marginBottom: '0.15rem' }}>
          {p.name}: {fmt(p.value)}
        </div>
      ))}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function MikroView({ transactions }) {
  const data = useMemo(() => analyzeMikro(transactions), [transactions]);

  const {
    totalIn, totalOut, profit, marginPct, profitLevel,
    busiestDay, busiestDayIdx,
    dayChart,
    topEarners,
    dailyData,
    restockDay, restockCount,
    tips,
    txCount,
  } = data;

  const ProfitIcon = profit > 0 ? TrendingUp : profit < 0 ? TrendingDown : Minus;
  const profitColor = PROFIT_COLOR[profitLevel];

  return (
    <div>
      {/* ── Ringkasan Utama ───────────────────────────────────────── */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h2 style={{ margin: '0 0 0.2rem 0', fontSize: '1.2rem', fontWeight: 700 }}>Laporan Toko Saya</h2>
            <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Total {txCount} catatan transaksi dianalisis.
            </p>
          </div>
          <span style={{
            padding: '0.3rem 0.875rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700,
            background: `${profitColor}18`, color: profitColor, border: `1px solid ${profitColor}40`,
          }}>
            {PROFIT_LABEL[profitLevel]}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.875rem', flexWrap: 'wrap' }}>
          <BigCard
            label="Uang Masuk"
            value={fmt(totalIn)}
            sub="Total penjualan / pemasukan"
            color="#22c55e"
            icon={TrendingUp}
          />
          <BigCard
            label="Uang Keluar"
            value={fmt(totalOut)}
            sub="Modal + biaya operasional"
            color="#f87171"
            icon={TrendingDown}
          />
          <BigCard
            label={profit >= 0 ? 'Untung Bersih' : 'Rugi Bersih'}
            value={fmt(Math.abs(profit))}
            sub={profit >= 0
              ? `Margin ${marginPct.toFixed(0)}% dari pemasukan`
              : 'Pengeluaran > pemasukan'}
            color={profitColor}
            icon={ProfitIcon}
          />
        </div>
      </div>

      {/* ── Hari Paling Ramai + Highlights ───────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Day-of-week chart */}
        <div className="card" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Calendar size={15} color="#818cf8" />
              Hari Paling Ramai
            </h3>
            {busiestDay && (
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#818cf8', background: 'rgba(129,140,248,0.12)', padding: '0.2rem 0.625rem', borderRadius: '20px' }}>
                {busiestDay}
              </span>
            )}
          </div>
          <p style={{ margin: '0 0 1rem 0', fontSize: '0.775rem', color: 'var(--text-muted)' }}>
            Jumlah uang masuk per hari dalam seminggu
          </p>
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dayChart} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="var(--text-muted)" />
                <YAxis tick={{ fontSize: 10 }} stroke="var(--text-muted)" tickFormatter={fmtShort} width={40} />
                <RechartsTooltip content={<DayTooltip />} />
                <Bar dataKey="masuk" name="Uang Masuk" radius={[4, 4, 0, 0]}>
                  {dayChart.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={i === busiestDayIdx ? '#818cf8' : 'var(--primary)'}
                      opacity={i === busiestDayIdx ? 1 : 0.55}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Highlights grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {/* Kategori terlaris */}
          {topEarners.length > 0 && (
            <div className="card" style={{ marginBottom: 0, padding: '1rem 1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
                <Star size={14} color="#f59e0b" />
                <span style={{ fontSize: '0.875rem', fontWeight: 700 }}>Kategori Terlaris</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {topEarners.slice(0, 4).map((cat) => {
                  const barPct = totalIn > 0 ? (cat.amountIn / totalIn) * 100 : 0;
                  return (
                    <div key={cat.name}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.775rem', marginBottom: '0.2rem' }}>
                        <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{cat.name}</span>
                        <span style={{ color: '#22c55e', fontWeight: 600 }}>{fmt(cat.amountIn)}</span>
                      </div>
                      <div style={{ height: 5, background: 'var(--bg-card)', borderRadius: 3 }}>
                        <div style={{ width: `${barPct}%`, height: '100%', background: '#22c55e', borderRadius: 3, opacity: 0.75 }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Catatan belanja / restok */}
          <div className="card" style={{ marginBottom: 0, padding: '1rem 1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
              <ShoppingCart size={14} color="#60a5fa" />
              <span style={{ fontSize: '0.875rem', fontWeight: 700 }}>Catatan Belanja Bahan</span>
            </div>
            {restockCount > 0 ? (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.65 }}>
                <p style={{ margin: '0 0 0.3rem 0' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{restockCount}×</span> transaksi belanja bahan terdeteksi.
                </p>
                {restockDay && (
                  <p style={{ margin: 0 }}>
                    Biasanya kulakan hari <span style={{ fontWeight: 600, color: '#60a5fa' }}>{restockDay}</span>.
                  </p>
                )}
              </div>
            ) : (
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Belum ada catatan belanja bahan terdeteksi. Gunakan kategori "Belanja Bahan" atau tambahkan keterangan seperti "kulakan", "beli stok", dll.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Tren Harian ──────────────────────────────────────────── */}
      {dailyData.length > 1 && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1rem' }}>Tren Harian</h3>
          <p style={{ margin: '0 0 1rem 0', fontSize: '0.775rem', color: 'var(--text-muted)' }}>
            Uang masuk vs uang keluar per hari (30 hari terakhir)
          </p>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyData} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="var(--text-muted)" interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 10 }} stroke="var(--text-muted)" tickFormatter={fmtShort} width={44} />
                <RechartsTooltip
                  formatter={(v, name) => [fmt(v), name === 'masuk' ? 'Uang Masuk' : name === 'keluar' ? 'Uang Keluar' : 'Untung']}
                  contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: '0.8rem' }}
                />
                <Legend wrapperStyle={{ fontSize: '0.775rem' }} formatter={(v) => v === 'masuk' ? 'Uang Masuk' : v === 'keluar' ? 'Uang Keluar' : 'Untung'} />
                <Line type="monotone" dataKey="masuk"  stroke="#22c55e" strokeWidth={2}   dot={false} activeDot={{ r: 4 }} />
                <Line type="monotone" dataKey="keluar" stroke="#f87171" strokeWidth={2}   dot={false} activeDot={{ r: 4 }} />
                <Line type="monotone" dataKey="untung" stroke="#818cf8" strokeWidth={1.5} dot={false} activeDot={{ r: 4 }} strokeDasharray="4 3" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ── Tips ──────────────────────────────────────────────────── */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.875rem' }}>
          <Package size={15} color="var(--primary)" />
          <h3 style={{ margin: 0, fontSize: '1rem' }}>Tips untuk Toko Kamu</h3>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
          {tips.map((tip, i) => <TipCard key={i} tip={tip} />)}
        </div>
        <p style={{ margin: '1rem 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
          * Tips dihasilkan otomatis dari data catatan Anda. Semakin lengkap catatan, semakin tepat analisisnya.
        </p>
      </div>
    </div>
  );
}
