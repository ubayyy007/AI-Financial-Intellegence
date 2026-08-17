import { useEffect, useRef } from 'react';

// ─── Animated canvas: chart grid + line + candlesticks + money flow ──────────

function ChartCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Smooth price path
    const N = 120;
    const prices = Array.from({ length: N }, (_, i) => {
      return 0;
    });
    prices[0] = 50;
    for (let i = 1; i < N; i++) {
      prices[i] = Math.max(10, Math.min(90, prices[i - 1] + (Math.random() - 0.46) * 5));
    }

    // Secondary dim path
    const prices2 = [45];
    for (let i = 1; i < N; i++) {
      prices2[i] = Math.max(5, Math.min(95, prices2[i - 1] + (Math.random() - 0.5) * 4));
    }

    // Candlestick data
    const candles = Array.from({ length: 24 }, (_, i) => {
      const open  = 20 + Math.random() * 60;
      const close = open + (Math.random() - 0.48) * 12;
      const high  = Math.max(open, close) + Math.random() * 6;
      const low   = Math.min(open, close) - Math.random() * 6;
      return { open, close, high: Math.min(95, high), low: Math.max(5, low), x: i / 23 };
    });

    // Floating money particles
    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 2.5 + 0.5,
      vx: (Math.random() - 0.5) * 0.0002,
      vy: -(Math.random() * 0.00035 + 0.00005),
      alpha: Math.random() * 0.6 + 0.2,
      color: Math.random() > 0.5 ? '#60a5fa' : '#34d399',
    }));

    let t = 0;
    let raf;

    const draw = () => {
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      // ── Grid lines ──────────────────────────────────────────────────────
      ctx.strokeStyle = 'rgba(59,130,246,0.08)';
      ctx.lineWidth = 1;
      for (let i = 1; i < 8; i++) {
        ctx.beginPath();
        ctx.moveTo(0, H * i / 8);
        ctx.lineTo(W, H * i / 8);
        ctx.stroke();
      }
      for (let i = 1; i < 12; i++) {
        ctx.beginPath();
        ctx.moveTo(W * i / 12, 0);
        ctx.lineTo(W * i / 12, H);
        ctx.stroke();
      }

      // ── Candlesticks (right half, faint) ────────────────────────────────
      const cw = W * 0.025;
      for (const c of candles) {
        const cx = W * 0.5 + c.x * W * 0.45;
        const isUp = c.close >= c.open;
        const col = isUp ? 'rgba(52,211,153,0.25)' : 'rgba(248,113,113,0.25)';
        const bodyTop = H * 0.1 + (1 - Math.max(c.open, c.close) / 100) * H * 0.8;
        const bodyBot = H * 0.1 + (1 - Math.min(c.open, c.close) / 100) * H * 0.8;
        const wickTop = H * 0.1 + (1 - c.high / 100) * H * 0.8;
        const wickBot = H * 0.1 + (1 - c.low  / 100) * H * 0.8;

        // Wick
        ctx.strokeStyle = col;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx, wickTop);
        ctx.lineTo(cx, wickBot);
        ctx.stroke();

        // Body
        ctx.fillStyle = col;
        ctx.fillRect(cx - cw / 2, bodyTop, cw, Math.max(2, bodyBot - bodyTop));
      }

      // ── Main price line (animated scroll) ───────────────────────────────
      const scrollOffset = (t * 0.003) % 1;

      // Shadow/glow under line
      ctx.beginPath();
      for (let i = 0; i < N; i++) {
        const xi = ((i / (N - 1)) + scrollOffset) % 1;
        const px = xi * W;
        const py = H * 0.1 + (1 - prices[i] / 100) * H * 0.7;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      // Fill under line
      ctx.lineTo(W, H);
      ctx.lineTo(0, H);
      ctx.closePath();
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, 'rgba(37,99,235,0.18)');
      grad.addColorStop(1, 'rgba(37,99,235,0)');
      ctx.fillStyle = grad;
      ctx.fill();

      // Main line stroke
      ctx.beginPath();
      for (let i = 0; i < N; i++) {
        const xi = ((i / (N - 1)) + scrollOffset) % 1;
        const px = xi * W;
        const py = H * 0.1 + (1 - prices[i] / 100) * H * 0.7;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#3b82f6';
      ctx.shadowBlur = 8;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Secondary dim line
      ctx.beginPath();
      for (let i = 0; i < N; i++) {
        const xi = ((i / (N - 1)) + scrollOffset * 0.7 + 0.3) % 1;
        const px = xi * W;
        const py = H * 0.15 + (1 - prices2[i] / 100) * H * 0.65;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.strokeStyle = 'rgba(99,102,241,0.4)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // ── Floating particles ───────────────────────────────────────────────
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < -0.02) { p.y = 1.02; p.x = Math.random(); }
        if (p.x < 0) p.x = 1;
        if (p.x > 1) p.x = 0;

        ctx.beginPath();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.arc(p.x * W, p.y * H, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      t++;
      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed', inset: 0, zIndex: 0,
        pointerEvents: 'none',
        opacity: 0.75,
      }}
    />
  );
}

// ─── Data ────────────────────────────────────────────────────────────────────

const FEATURES = [
  { icon: '📊', title: '3 Financial Statements', desc: 'Laba Rugi, Neraca, dan Arus Kas dihasilkan otomatis dari data mentah Anda.', tag: 'Bisnis' },
  { icon: '🧠', title: 'AI PDF Parser', desc: 'Upload mutasi bank PDF — AI Gemini mengekstrak transaksi tanpa input manual.', tag: 'AI' },
  { icon: '📈', title: 'BI Insight Dashboard', desc: 'Analisis tren, top kategori, dan rasio keuangan dalam satu tampilan interaktif.', tag: 'Bisnis' },
  { icon: '🏠', title: 'Personal Finance', desc: '6 framework budgeting: 50/30/20, ZBB, Envelope, dan lainnya.', tag: 'Personal' },
  { icon: '🏪', title: 'Mode Toko / Warung', desc: 'Laporan sederhana untuk UMKM kecil: omzet, HPP, laba bersih per hari.', tag: 'UMKM' },
  { icon: '🔮', title: 'Proyeksi Multi-Periode', desc: 'Komparasi antar bulan dan forecast arus kas 3 bulan ke depan.', tag: 'Analitik' },
];

const tagColors = {
  AI:       { bg: 'rgba(99,102,241,0.25)',  color: '#a5b4fc', border: 'rgba(99,102,241,0.4)'  },
  Bisnis:   { bg: 'rgba(37,99,235,0.25)',   color: '#93c5fd', border: 'rgba(37,99,235,0.4)'   },
  Personal: { bg: 'rgba(16,185,129,0.25)',  color: '#6ee7b7', border: 'rgba(16,185,129,0.4)'  },
  UMKM:     { bg: 'rgba(245,158,11,0.25)',  color: '#fcd34d', border: 'rgba(245,158,11,0.4)'  },
  Analitik: { bg: 'rgba(139,92,246,0.25)',  color: '#c4b5fd', border: 'rgba(139,92,246,0.4)'  },
};

// ─── Glassmorphism style ──────────────────────────────────────────────────────

const glass = {
  background: 'rgba(255,255,255,0.06)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.15)',
  borderRadius: '16px',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), 0 8px 40px rgba(0,0,0,0.5)',
};

const glassStrong = {
  background: 'rgba(255,255,255,0.08)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  border: '1px solid rgba(255,255,255,0.2)',
  borderRadius: '20px',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15), 0 16px 60px rgba(0,0,0,0.6)',
};

// ─── LandingPage ─────────────────────────────────────────────────────────────

export default function LandingPage({ onEnter }) {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#050810',
      color: '#fff',
      fontFamily: "'Inter', system-ui, sans-serif",
      overflowX: 'hidden',
      position: 'relative',
    }}>
      {/* Animated chart background */}
      <ChartCanvas />

      {/* Soft color overlay — lighter so chart shows through */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none',
        background: [
          'radial-gradient(ellipse 70% 50% at 20% 30%, rgba(37,99,235,0.15) 0%, transparent 60%)',
          'radial-gradient(ellipse 50% 40% at 80% 70%, rgba(99,102,241,0.1) 0%, transparent 60%)',
          'linear-gradient(to bottom, rgba(5,8,16,0.3) 0%, rgba(5,8,16,0.55) 50%, rgba(5,8,16,0.85) 100%)',
        ].join(','),
      }} />

      <div style={{ position: 'relative', zIndex: 2 }}>

        {/* ── Navbar ───────────────────────────────────────────────────── */}
        <nav style={{
          maxWidth: 1100, margin: '0 auto',
          padding: '1.5rem 2rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div style={{
              width: 36, height: 36, borderRadius: '10px',
              background: 'linear-gradient(135deg, #2563eb, #4f46e5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.1rem',
              boxShadow: '0 0 20px rgba(37,99,235,0.6)',
            }}>💹</div>
            <span style={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.02em' }}>
              AI Financial
            </span>
          </div>

          <div style={{ display: 'none', gap: '2rem' }} className="nav-links">
            {['Fitur', 'Mode', 'Demo'].map(l => (
              <span key={l} style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.55)', cursor: 'pointer' }}>{l}</span>
            ))}
          </div>

          <button
            onClick={onEnter}
            style={{
              padding: '0.5rem 1.375rem',
              borderRadius: '999px',
              background: 'linear-gradient(135deg, #2563eb, #4f46e5)',
              border: '1px solid rgba(255,255,255,0.2)',
              cursor: 'pointer', color: '#fff', fontWeight: 600,
              fontSize: '0.875rem',
              boxShadow: '0 0 24px rgba(37,99,235,0.5)',
            }}
          >
            Mulai Gratis →
          </button>
        </nav>

        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <section style={{ textAlign: 'center', padding: '4rem 2rem 3rem', maxWidth: 820, margin: '0 auto' }}>

          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.375rem 1rem', borderRadius: '999px',
            ...glass,
            background: 'rgba(37,99,235,0.2)',
            border: '1px solid rgba(37,99,235,0.45)',
            fontSize: '0.75rem', color: '#93c5fd', fontWeight: 600,
            marginBottom: '2rem',
            letterSpacing: '0.02em',
          }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#60a5fa', display: 'inline-block', boxShadow: '0 0 6px #60a5fa' }} />
            Powered by Google Gemini AI
          </div>

          {/* Headline */}
          <h1 style={{
            fontSize: 'clamp(2.75rem, 7vw, 5rem)',
            fontWeight: 900, lineHeight: 0.95,
            letterSpacing: '-0.045em', margin: '0 0 1.5rem',
          }}>
            Keuangan Anda.
            <br />
            <span style={{
              background: 'linear-gradient(100deg, #60a5fa 0%, #3b82f6 30%, #818cf8 60%, #a78bfa 100%)',
              WebkitBackgroundClip: 'text', backgroundClip: 'text',
              WebkitTextFillColor: 'transparent', color: 'transparent',
              filter: 'drop-shadow(0 0 20px rgba(96,165,250,0.4))',
            }}>
              Lebih Cerdas.
            </span>
          </h1>

          <p style={{
            fontSize: '1.0625rem', color: 'rgba(255,255,255,0.5)',
            lineHeight: 1.75, maxWidth: 520, margin: '0 auto 2.5rem',
          }}>
            Upload CSV, Excel, atau PDF laporan bank — dapatkan laporan keuangan standar, insight bisnis, dan proyeksi dalam hitungan detik.
          </p>

          {/* CTA buttons */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={onEnter} style={{
              padding: '0.9rem 2.25rem', borderRadius: '999px',
              background: 'linear-gradient(135deg, #2563eb, #4f46e5)',
              border: '1px solid rgba(255,255,255,0.2)',
              cursor: 'pointer', color: '#fff',
              fontWeight: 700, fontSize: '0.9375rem',
              boxShadow: '0 0 40px rgba(37,99,235,0.55), inset 0 1px 0 rgba(255,255,255,0.2)',
            }}>
              Coba Sekarang — Gratis
            </button>
            <button style={{
              padding: '0.9rem 2.25rem', borderRadius: '999px',
              ...glass,
              cursor: 'pointer', color: 'rgba(255,255,255,0.75)',
              fontWeight: 600, fontSize: '0.9375rem',
              border: '1px solid rgba(255,255,255,0.18)',
            }}>
              Lihat Demo ↓
            </button>
          </div>

          <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.2)', marginTop: '1rem' }}>
            Tidak perlu daftar · Tidak perlu kartu kredit · Data tidak disimpan di server
          </p>
        </section>

        {/* ── Stats strip ───────────────────────────────────────────────── */}
        <div style={{ maxWidth: 820, margin: '0 auto 5rem', padding: '0 2rem' }}>
          <div style={{ ...glassStrong, display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', textAlign: 'center', padding: '1.75rem 1rem' }}>
            {[
              { val: '6+',           label: 'Mode Analisis'       },
              { val: 'PDF/CSV/XLSX', label: 'Format Didukung'     },
              { val: '< 30 detik',   label: 'Waktu Pemrosesan'    },
            ].map(({ val, label }, i) => (
              <div key={i} style={{ padding: '0.5rem', borderRight: i < 2 ? '1px solid rgba(255,255,255,0.1)' : 'none' }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#60a5fa', letterSpacing: '-0.02em' }}>{val}</div>
                <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Features grid ─────────────────────────────────────────────── */}
        <section style={{ maxWidth: 1100, margin: '0 auto', padding: '0 2rem 6rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <p style={{ fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: '0.625rem' }}>
              Semua yang Anda butuhkan
            </p>
            <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, letterSpacing: '-0.035em', margin: 0 }}>
              Satu platform, semua mode analisis
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
            {FEATURES.map(({ icon, title, desc, tag }) => {
              const tc = tagColors[tag] || tagColors.Bisnis;
              return (
                <div key={title} style={{
                  ...glass,
                  padding: '1.625rem',
                  transition: 'transform 0.25s, box-shadow 0.25s',
                  cursor: 'default',
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: '12px',
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.4rem',
                    }}>{icon}</div>
                    <span style={{
                      fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.04em',
                      padding: '0.25rem 0.65rem', borderRadius: '999px',
                      background: tc.bg, color: tc.color, border: `1px solid ${tc.border}`,
                    }}>{tag}</span>
                  </div>
                  <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, margin: '0 0 0.5rem', letterSpacing: '-0.01em' }}>{title}</h3>
                  <p style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.65, margin: 0 }}>{desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── How it works ─────────────────────────────────────────────── */}
        <section style={{ maxWidth: 900, margin: '0 auto', padding: '0 2rem 6rem', textAlign: 'center' }}>
          <p style={{ fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: '0.625rem' }}>
            Semudah 3 langkah
          </p>
          <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, letterSpacing: '-0.035em', margin: '0 0 3rem' }}>
            Dari data mentah ke laporan siap pakai
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1px', background: 'rgba(255,255,255,0.1)', borderRadius: '20px', overflow: 'hidden' }}>
            {[
              { n: '01', emoji: '📂', title: 'Upload File', desc: 'CSV, Excel, atau PDF mutasi bank — drag and drop, langsung diproses.' },
              { n: '02', emoji: '⚡', title: 'AI Memproses', desc: 'Transaksi diekstrak, dikategorikan, dan divalidasi secara otomatis.' },
              { n: '03', emoji: '📋', title: 'Dapatkan Insight', desc: 'Laporan keuangan, grafik tren, dan rekomendasi siap dalam detik.' },
            ].map(({ n, emoji, title, desc }) => (
              <div key={n} style={{
                background: 'rgba(5,8,16,0.75)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                padding: '2.25rem 1.75rem',
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>{emoji}</div>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#3b82f6', letterSpacing: '0.1em', marginBottom: '0.625rem' }}>{n}</div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 0.5rem' }}>{title}</h3>
                <p style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.65, margin: 0 }}>{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ──────────────────────────────────────────────────────── */}
        <section style={{ maxWidth: 700, margin: '0 auto', padding: '0 2rem 8rem', textAlign: 'center' }}>
          <div style={{ ...glassStrong, padding: '3.5rem 2.5rem', position: 'relative', overflow: 'hidden' }}>
            {/* Top glow line */}
            <div style={{
              position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
              width: '60%', height: '1px',
              background: 'linear-gradient(to right, transparent, rgba(96,165,250,0.8), transparent)',
            }} />
            {/* Radial glow */}
            <div style={{
              position: 'absolute', top: '-40px', left: '50%', transform: 'translateX(-50%)',
              width: 300, height: 300, borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(37,99,235,0.15) 0%, transparent 70%)',
              pointerEvents: 'none',
            }} />

            <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.25rem)', fontWeight: 800, letterSpacing: '-0.035em', margin: '0 0 1rem', position: 'relative' }}>
              Siap analisis keuangan Anda?
            </h2>
            <p style={{ fontSize: '0.9375rem', color: 'rgba(255,255,255,0.45)', margin: '0 0 2rem', lineHeight: 1.7, position: 'relative' }}>
              Tidak perlu install. Tidak perlu daftar.<br />Langsung upload dan lihat hasilnya.
            </p>
            <button onClick={onEnter} style={{
              padding: '1rem 2.75rem', borderRadius: '999px',
              background: 'linear-gradient(135deg, #2563eb, #4f46e5)',
              border: '1px solid rgba(255,255,255,0.25)',
              cursor: 'pointer', color: '#fff',
              fontWeight: 700, fontSize: '1rem',
              boxShadow: '0 0 48px rgba(37,99,235,0.6), inset 0 1px 0 rgba(255,255,255,0.2)',
              position: 'relative',
            }}>
              Mulai Analisis Sekarang →
            </button>
          </div>
        </section>

        {/* ── Footer ───────────────────────────────────────────────────── */}
        <footer style={{
          borderTop: '1px solid rgba(255,255,255,0.07)',
          padding: '2rem', textAlign: 'center',
          fontSize: '0.72rem', color: 'rgba(255,255,255,0.2)',
        }}>
          AI Financial Intelligence · Data diproses di browser Anda, tidak dikirim ke server kami.
        </footer>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; }
      `}</style>
    </div>
  );
}
