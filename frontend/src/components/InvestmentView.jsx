import { useMemo } from 'react';
import { TrendingUp, TrendingDown, ShieldCheck, AlertTriangle, Printer, CheckCircle2 } from 'lucide-react';
import { computeInvestmentScore } from '../utils/investmentEngine';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n ?? 0);

// ─── Dimension Bar ────────────────────────────────────────────────────────────

const DimBar = ({ name, score, max, detail, color }) => {
  const pct = (score / max) * 100;
  const barColor = pct >= 80 ? '#22c55e' : pct >= 56 ? '#60a5fa' : pct >= 40 ? '#f59e0b' : '#f87171';
  return (
    <div style={{ marginBottom: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.3rem' }}>
        <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>{name}</span>
        <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: barColor }}>{score}<span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 400 }}>/{max}</span></span>
      </div>
      <div style={{ height: 8, background: 'var(--bg-card)', borderRadius: 4, marginBottom: '0.25rem' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: barColor, borderRadius: 4, transition: 'width 0.5s ease' }} />
      </div>
      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{detail}</div>
    </div>
  );
};

// ─── Strength / Risk Item ─────────────────────────────────────────────────────

const StrengthItem = ({ text }) => (
  <li style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
    <CheckCircle2 size={14} color="#22c55e" style={{ flexShrink: 0, marginTop: 2 }} />
    <span style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>{text}</span>
  </li>
);

const RiskItem = ({ text }) => (
  <li style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
    <AlertTriangle size={14} color="#f59e0b" style={{ flexShrink: 0, marginTop: 2 }} />
    <span style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>{text}</span>
  </li>
);

// ─── Print One-Pager ──────────────────────────────────────────────────────────

const printOnePager = (data) => {
  const { score, grade, gradeLabel, color, dimensions, strengths, risks, recommendation, businessProfile } = data;
  const today = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  const html = `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<title>Ringkasan Kelayakan Investasi</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; color: #111; background: #fff; padding: 36px; font-size: 13px; }
  h1 { font-size: 20px; font-weight: 800; color: #111; }
  h2 { font-size: 14px; font-weight: 700; margin: 18px 0 8px; color: #333; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #111; padding-bottom: 12px; margin-bottom: 18px; }
  .sub { font-size: 12px; color: #666; margin-top: 4px; }
  .score-box { text-align: center; background: ${color}14; border: 2px solid ${color}; border-radius: 10px; padding: 12px 24px; }
  .score-num { font-size: 36px; font-weight: 900; color: ${color}; line-height: 1; }
  .score-label { font-size: 12px; font-weight: 600; color: ${color}; margin-top: 3px; }
  .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px; }
  .kpi { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 10px 12px; }
  .kpi-label { font-size: 11px; color: #666; text-transform: uppercase; letter-spacing: .05em; }
  .kpi-val { font-size: 16px; font-weight: 700; margin-top: 2px; }
  .dim-row { display: flex; justify-content: space-between; align-items: center; padding: 5px 0; border-bottom: 1px solid #f3f4f6; }
  .dim-bar-wrap { flex: 1; height: 6px; background: #f3f4f6; border-radius: 3px; margin: 0 10px; }
  .dim-bar-fill { height: 100%; border-radius: 3px; background: #3b82f6; }
  ul { list-style: none; padding: 0; }
  li { padding: 4px 0; border-bottom: 1px solid #f3f4f6; font-size: 12.5px; line-height: 1.55; display: flex; gap: 6px; }
  li::before { flex-shrink: 0; }
  .str li::before { content: '✅'; }
  .risk li::before { content: '⚠️'; }
  .rec { background: #eff6ff; border-left: 3px solid #3b82f6; padding: 10px 12px; border-radius: 4px; font-size: 12.5px; line-height: 1.65; color: #1e40af; }
  .footer { margin-top: 24px; font-size: 10px; color: #999; border-top: 1px solid #e5e7eb; padding-top: 8px; }
  @media print { body { padding: 24px; } }
</style>
</head>
<body>
<div class="header">
  <div>
    <h1>Ringkasan Kelayakan Investasi</h1>
    <div class="sub">Dibuat: ${today} &nbsp;|&nbsp; Periode data: ${businessProfile.firstPeriod} – ${businessProfile.lastPeriod} (${businessProfile.periodCount} bulan)</div>
    <div class="sub">Dihasilkan oleh AI Financial Intelligence</div>
  </div>
  <div class="score-box">
    <div class="score-num">${score}</div>
    <div style="font-size:20px; font-weight:800; color:${color}; margin-top:2px;">Grade ${grade}</div>
    <div class="score-label">${gradeLabel}</div>
  </div>
</div>

<h2>Profil Keuangan Bisnis</h2>
<div class="grid2">
  <div class="kpi"><div class="kpi-label">Rata-rata Pendapatan/Bulan</div><div class="kpi-val">${fmt(businessProfile.avgMonthlyRevenue)}</div></div>
  <div class="kpi"><div class="kpi-label">Rata-rata Pengeluaran/Bulan</div><div class="kpi-val">${fmt(businessProfile.avgMonthlyExpenses)}</div></div>
  <div class="kpi"><div class="kpi-label">Rata-rata Laba Bersih/Bulan</div><div class="kpi-val" style="color:${businessProfile.avgNetProfit >= 0 ? '#16a34a' : '#dc2626'}">${fmt(businessProfile.avgNetProfit)}</div></div>
  <div class="kpi"><div class="kpi-label">Margin Laba Bersih</div><div class="kpi-val">${businessProfile.profitMarginPct != null ? businessProfile.profitMarginPct.toFixed(1) + '%' : '—'}</div></div>
</div>

<h2>Skor Per Dimensi</h2>
${dimensions.map((d) => `
<div class="dim-row">
  <span style="width:170px; font-size:12.5px;">${d.name}</span>
  <div class="dim-bar-wrap"><div class="dim-bar-fill" style="width:${(d.score / d.max * 100).toFixed(0)}%"></div></div>
  <span style="width:48px; text-align:right; font-weight:600; font-size:12.5px;">${d.score}/${d.max}</span>
</div>
<div style="font-size:11px; color:#666; padding: 2px 0 6px 0;">${d.detail}</div>
`).join('')}

<div class="grid2" style="margin-top:14px">
  <div>
    <h2>Kekuatan</h2>
    <ul class="str">${strengths.map((s) => `<li>${s}</li>`).join('')}</ul>
  </div>
  <div>
    <h2>Risiko / Perhatian</h2>
    <ul class="risk">${risks.map((r) => `<li>${r}</li>`).join('')}</ul>
  </div>
</div>

<h2>Rekomendasi</h2>
<div class="rec">${recommendation}</div>

<div class="footer">
  Dokumen ini dihasilkan secara otomatis oleh AI Financial Intelligence berdasarkan data yang dimasukkan.
  Bukan merupakan penilaian resmi lembaga keuangan. Skor dapat berubah seiring dengan perkembangan data.
</div>
</body>
</html>`;

  const win = window.open('', '_blank', 'width=800,height=900');
  if (!win) {
    alert('Pop-up diblokir. Izinkan pop-up untuk halaman ini lalu coba lagi.');
    return;
  }
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 400);
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function InvestmentView({ periods }) {
  const data = useMemo(() => computeInvestmentScore(periods), [periods]);

  if (!data) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
        <ShieldCheck size={40} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
        <h3 style={{ marginBottom: '0.5rem' }}>Belum ada data keuangan</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Upload data laporan keuangan terlebih dahulu untuk menghitung skor kelayakan investasi.
        </p>
      </div>
    );
  }

  const { score, grade, gradeLabel, color, bg, border, dimensions, strengths, risks, recommendation, businessProfile } = data;

  return (
    <div>
      {/* ── Score Header ───────────────────────────────────────────── */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          {/* Score circle */}
          <div style={{
            flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
          }}>
            <div style={{
              width: 96, height: 96, borderRadius: '50%',
              background: `conic-gradient(${color} ${score * 3.6}deg, var(--bg-secondary) 0deg)`,
              boxShadow: `0 0 0 4px var(--bg-card), 0 0 0 5px ${color}44`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{
                width: 74, height: 74, borderRadius: '50%', background: 'var(--bg-card)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontSize: '1.75rem', fontWeight: 800, color, lineHeight: 1 }}>{score}</span>
                <span style={{ fontSize: '0.55rem', color: 'var(--text-muted)' }}>/100</span>
              </div>
            </div>
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem',
            }}>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color }}>{grade}</span>
              <span style={{
                fontSize: '0.75rem', fontWeight: 700, color,
                padding: '0.2rem 0.625rem', borderRadius: '20px',
                background: bg, border: `1px solid ${border}`,
              }}>{gradeLabel}</span>
            </div>
          </div>

          {/* Description + KPIs */}
          <div style={{ flex: 1, minWidth: 240 }}>
            <h2 style={{ margin: '0 0 0.25rem 0', fontSize: '1.25rem', fontWeight: 700 }}>Skor Kelayakan Investasi</h2>
            <p style={{ margin: '0 0 1.25rem 0', fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.65 }}>
              Dihitung dari {businessProfile.periodCount} bulan data ({businessProfile.firstPeriod} – {businessProfile.lastPeriod}) berdasarkan 4 dimensi keuangan utama.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.75rem' }}>
              {[
                { label: 'Rata-rata Pendapatan/Bln', value: fmt(businessProfile.avgMonthlyRevenue), color: '#22c55e' },
                { label: 'Rata-rata Laba Bersih/Bln', value: fmt(businessProfile.avgNetProfit), color: businessProfile.avgNetProfit >= 0 ? '#22c55e' : '#ef4444' },
                { label: 'Margin Laba Bersih', value: businessProfile.profitMarginPct != null ? `${businessProfile.profitMarginPct.toFixed(1)}%` : '—', color: 'var(--text-primary)' },
                { label: 'Bulan Data Tersedia', value: `${businessProfile.periodCount} bulan`, color: 'var(--text-primary)' },
              ].map(({ label, value, color: c }) => (
                <div key={label} style={{ padding: '0.625rem 0.875rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
                  <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: c, marginTop: '0.2rem' }}>{value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Dimensions + Strengths/Risks ──────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Dimension scores */}
        <div className="card" style={{ marginBottom: 0 }}>
          <h3 style={{ margin: '0 0 1.125rem 0', fontSize: '1rem' }}>Penilaian Per Dimensi</h3>
          {dimensions.map((d) => (
            <DimBar key={d.key} {...d} color={color} />
          ))}
        </div>

        {/* Strengths & Risks */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="card" style={{ marginBottom: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
              <TrendingUp size={14} color="#22c55e" />
              <h3 style={{ margin: 0, fontSize: '0.9375rem' }}>Kekuatan Bisnis</h3>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {strengths.map((s, i) => <StrengthItem key={i} text={s} />)}
            </ul>
          </div>

          <div className="card" style={{ marginBottom: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
              <TrendingDown size={14} color="#f59e0b" />
              <h3 style={{ margin: 0, fontSize: '0.9375rem' }}>Risiko / Perhatian</h3>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {risks.map((r, i) => <RiskItem key={i} text={r} />)}
            </ul>
          </div>
        </div>
      </div>

      {/* ── Recommendation + Print ────────────────────────────────── */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0, fontSize: '1rem' }}>Rekomendasi</h3>
          <button
            className="btn btn-ghost"
            onClick={() => printOnePager(data)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0, fontSize: '0.8125rem' }}
          >
            <Printer size={14} />
            Cetak / Export PDF
          </button>
        </div>

        <div style={{
          padding: '1rem 1.125rem',
          background: bg,
          border: `1px solid ${border}`,
          borderRadius: '8px',
          marginBottom: '1rem',
        }}>
          <p style={{ margin: 0, fontSize: '0.875rem', lineHeight: 1.7, color: 'var(--text-primary)' }}>
            {recommendation}
          </p>
        </div>

        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
          * Skor ini dihasilkan secara otomatis berdasarkan data keuangan yang dimasukkan. Bukan merupakan penilaian resmi lembaga keuangan.
          Tambahkan lebih banyak data historis untuk hasil yang lebih akurat.
        </p>
      </div>
    </div>
  );
}
