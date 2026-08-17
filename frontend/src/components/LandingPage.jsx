import { useEffect, useRef } from 'react';

// ─── Animated canvas background: financial chart + money flow ─────────────────

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

    // Generate a realistic stock-chart path
    const genPath = (seed, n = 80) => {
      let v = seed;
      return Array.from({ length: n }, (_, i) => {
        v += (Math.random() - 0.48) * 18;
        v = Math.max(20, Math.min(80, v));
        return { x: i / (n - 1), y: v / 100 };
      });
    };

    const paths = [
      { pts: genPath(55), color: '#2563eb', alpha: 0.35, width: 2   },
      { pts: genPath(40), color: '#3b82f6', alpha: 0.20, width: 1.5 },
      { pts: genPath(65), color: '#60a5fa', alpha: 0.15, width: 1   },
      { pts: genPath(35), color: '#1d4ed8', alpha: 0.12, width: 1   },
    ];

    // Floating particles (money dots)
    const particles = Array.from({ length: 40 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 2 + 1,
      vx: (Math.random() - 0.5) * 0.0003,
      vy: -(Math.random() * 0.0004 + 0.0001),
      alpha: Math.random() * 0.4 + 0.1,
    }));

    let offset = 0;
    let raf;

    const draw = () => {
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      // Draw chart lines with horizontal scroll animation
      for (const { pts, color, alpha, width } of paths) {
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.globalAlpha = alpha;
        ctx.lineWidth = width;
        ctx.lineJoin = 'round';

        for (let i = 0; i < pts.length; i++) {
          const px = ((pts[i].x + offset) % 1) * W;
          const py = pts[i].y * H * 0.7 + H * 0.15;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }

      // Particles
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < -0.02) { p.y = 1.02; p.x = Math.random(); }
        if (p.x < 0) p.x = 1;
        if (p.x > 1) p.x = 0;

        ctx.beginPath();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = '#3b82f6';
        ctx.arc(p.x * W, p.y * H, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      offset += 0.0008;
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
        filter: 'blur(3px)',
        opacity: 0.6,
        pointerEvents: 'none',
      }}
    />
  );
}

// ─── Feature cards data ───────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: '📊',
    title: '3 Financial Statements',
    desc: 'Laba Rugi, Neraca, dan Arus Kas dihasilkan otomatis dari data mentah Anda.',
    tag: 'Bisnis',
  },
  {
    icon: '🧠',
    title: 'AI PDF Parser',
    desc: 'Upload mutasi bank PDF — AI Gemini mengekstrak transaksi tanpa input manual.',
    tag: 'AI',
  },
  {
    icon: '📈',
    title: 'BI Insight Dashboard',
    desc: 'Analisis tren, top kategori, dan rasio keuangan dalam satu tampilan.',
    tag: 'Bisnis',
  },
  {
    icon: '🏠',
    title: 'Personal Finance',
    desc: '6 framework budgeting: 50/30/20, ZBB, Envelope, dan lainnya — pilih sesuai gaya hidup.',
    tag: 'Personal',
  },
  {
    icon: '🏪',
    title: 'Mode Toko / Warung',
    desc: 'Laporan sederhana untuk UMKM kecil: omzet, HPP, laba bersih per hari.',
    tag: 'UMKM',
  },
  {
    icon: '🔮',
    title: 'Proyeksi Multi-Periode',
    desc: 'Komparasi antar bulan dan forecast arus kas 3 bulan ke depan.',
    tag: 'Analitik',
  },
];

// ─── Glassmorphism card ───────────────────────────────────────────────────────

const glassCard = {
  background: 'rgba(255,255,255,0.04)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '16px',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08), 0 8px 32px rgba(0,0,0,0.4)',
};

const tagColors = {
  AI:      { bg: 'rgba(99,102,241,0.2)',  color: '#a5b4fc' },
  Bisnis:  { bg: 'rgba(37,99,235,0.2)',   color: '#93c5fd' },
  Personal:{ bg: 'rgba(16,185,129,0.2)',  color: '#6ee7b7' },
  UMKM:    { bg: 'rgba(245,158,11,0.2)',  color: '#fcd34d' },
  Analitik:{ bg: 'rgba(139,92,246,0.2)',  color: '#c4b5fd' },
};

// ─── LandingPage ─────────────────────────────────────────────────────────────

export default function LandingPage({ onEnter }) {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#080c14',
      color: '#fff',
      fontFamily: "'Inter', system-ui, sans-serif",
      overflowX: 'hidden',
      position: 'relative',
    }}>
      {/* Animated background */}
      <ChartCanvas />

      {/* Dark overlay gradient */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(37,99,235,0.12) 0%, transparent 70%), linear-gradient(to bottom, rgba(8,12,20,0.5) 0%, rgba(8,12,20,0.85) 60%, #080c14 100%)',
      }} />

      <div style={{ position: 'relative', zIndex: 2 }}>

        {/* ── Navbar ── */}
        <nav style={{
          maxWidth: '1100px', margin: '0 auto',
          padding: '1.25rem 2rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div style={{
              width: 32, height: 32, borderRadius: '8px',
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1rem', boxShadow: '0 0 16px rgba(37,99,235,0.5)',
            }}>💹</div>
            <span style={{ fontWeight: 700, fontSize: '1rem', letterSpacing: '-0.02em' }}>AI Financial</span>
          </div>

          <div style={{ display: 'flex', gap: '2rem' }}>
            {['Fitur', 'Mode Analisis', 'Demo'].map(l => (
              <span key={l} style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.6)', cursor: 'pointer' }}>{l}</span>
            ))}
          </div>

          <button onClick={onEnter} style={{
            padding: '0.5rem 1.25rem',
            borderRadius: '999px',
            background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
            border: 'none', cursor: 'pointer',
            color: '#fff', fontWeight: 600, fontSize: '0.875rem',
            boxShadow: '0 0 20px rgba(37,99,235,0.4)',
            transition: 'all 0.2s',
          }}>
            Mulai Gratis
          </button>
        </nav>

        {/* ── Hero ── */}
        <section style={{ textAlign: 'center', padding: '5rem 2rem 4rem', maxWidth: '800px', margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.375rem 0.875rem', borderRadius: '999px',
            background: 'rgba(37,99,235,0.15)', border: '1px solid rgba(37,99,235,0.3)',
            fontSize: '0.75rem', color: '#93c5fd', fontWeight: 500,
            marginBottom: '1.75rem',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#3b82f6', display: 'inline-block' }} />
            Powered by Google Gemini AI
          </div>

          <h1 style={{
            fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
            fontWeight: 800, lineHeight: 1,
            letterSpacing: '-0.04em', margin: '0 0 1.5rem',
          }}>
            Keuangan Anda.{' '}
            <span style={{
              background: 'linear-gradient(135deg, #60a5fa 0%, #2563eb 40%, #818cf8 100%)',
              WebkitBackgroundClip: 'text', backgroundClip: 'text',
              WebkitTextFillColor: 'transparent', color: 'transparent',
            }}>
              Lebih Cerdas.
            </span>
          </h1>

          <p style={{
            fontSize: '1.125rem', color: 'rgba(255,255,255,0.55)',
            lineHeight: 1.7, maxWidth: '560px', margin: '0 auto 2.5rem',
          }}>
            Upload CSV, Excel, atau PDF laporan bank — dapatkan laporan keuangan standar, insight bisnis, dan proyeksi otomatis dalam hitungan detik.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={onEnter} style={{
              padding: '0.875rem 2rem',
              borderRadius: '999px',
              background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              border: 'none', cursor: 'pointer',
              color: '#fff', fontWeight: 700, fontSize: '0.9375rem',
              boxShadow: '0 0 32px rgba(37,99,235,0.5)',
              transition: 'transform 0.2s',
            }}>
              Coba Sekarang — Gratis
            </button>
            <button style={{
              padding: '0.875rem 2rem', borderRadius: '999px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.15)',
              cursor: 'pointer', color: 'rgba(255,255,255,0.7)',
              fontWeight: 600, fontSize: '0.9375rem',
              backdropFilter: 'blur(8px)',
            }}>
              Lihat Demo ↓
            </button>
          </div>

          <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.25)', marginTop: '1rem' }}>
            Tidak perlu daftar · Tidak perlu kartu kredit · Data tidak disimpan
          </p>
        </section>

        {/* ── Stats strip ── */}
        <div style={{ maxWidth: '800px', margin: '0 auto 5rem', padding: '0 2rem' }}>
          <div style={{
            ...glassCard,
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
            textAlign: 'center', padding: '1.5rem',
          }}>
            {[
              { val: '6+', label: 'Mode Analisis' },
              { val: 'PDF/CSV/Excel', label: 'Format Didukung' },
              { val: '< 30 detik', label: 'Waktu Pemrosesan' },
            ].map(({ val, label }, i) => (
              <div key={i} style={{ padding: '0.5rem', borderRight: i < 2 ? '1px solid rgba(255,255,255,0.08)' : 'none' }}>
                <div style={{ fontSize: '1.375rem', fontWeight: 700, color: '#60a5fa' }}>{val}</div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', marginTop: '0.25rem' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Features grid ── */}
        <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 2rem 6rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <p style={{ fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: '0.75rem' }}>
              Semua yang Anda butuhkan
            </p>
            <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 700, letterSpacing: '-0.03em', margin: 0 }}>
              Satu platform, semua mode analisis
            </h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1rem',
          }}>
            {FEATURES.map(({ icon, title, desc, tag }) => {
              const tc = tagColors[tag] || tagColors.Bisnis;
              return (
                <div key={title} style={{ ...glassCard, padding: '1.5rem', transition: 'transform 0.2s, box-shadow 0.2s' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <div style={{ fontSize: '2rem', lineHeight: 1 }}>{icon}</div>
                    <span style={{
                      fontSize: '0.65rem', fontWeight: 600,
                      padding: '0.2rem 0.6rem', borderRadius: '999px',
                      background: tc.bg, color: tc.color,
                    }}>{tag}</span>
                  </div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 0.5rem', letterSpacing: '-0.01em' }}>{title}</h3>
                  <p style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, margin: 0 }}>{desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── How it works ── */}
        <section style={{
          maxWidth: '900px', margin: '0 auto', padding: '0 2rem 6rem',
          textAlign: 'center',
        }}>
          <p style={{ fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: '0.75rem' }}>
            Semudah 3 langkah
          </p>
          <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 700, letterSpacing: '-0.03em', margin: '0 0 3rem' }}>
            Dari data mentah ke laporan siap presentasi
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1px', background: 'rgba(255,255,255,0.08)', borderRadius: '16px', overflow: 'hidden' }}>
            {[
              { n: '01', title: 'Upload File', desc: 'CSV, Excel, atau PDF mutasi bank — drag and drop, selesai.' },
              { n: '02', title: 'AI Memproses', desc: 'Transaksi diekstrak, dikategorikan, dan divalidasi secara otomatis.' },
              { n: '03', title: 'Dapatkan Insight', desc: 'Laporan keuangan, grafik tren, dan rekomendasi siap dalam detik.' },
            ].map(({ n, title, desc }) => (
              <div key={n} style={{ background: 'rgba(8,12,20,0.8)', backdropFilter: 'blur(12px)', padding: '2rem 1.5rem' }}>
                <div style={{
                  fontSize: '0.75rem', fontWeight: 700, color: '#3b82f6',
                  letterSpacing: '0.08em', marginBottom: '0.75rem',
                }}>{n}</div>
                <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, margin: '0 0 0.5rem' }}>{title}</h3>
                <p style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.6, margin: 0 }}>{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <section style={{ maxWidth: '700px', margin: '0 auto', padding: '0 2rem 8rem', textAlign: 'center' }}>
          <div style={{ ...glassCard, padding: '3rem 2rem', position: 'relative', overflow: 'hidden' }}>
            <div style={{
              position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
              width: '300px', height: '1px',
              background: 'linear-gradient(to right, transparent, #3b82f6, transparent)',
            }} />
            <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.25rem)', fontWeight: 700, letterSpacing: '-0.03em', margin: '0 0 1rem' }}>
              Siap analisis keuangan Anda?
            </h2>
            <p style={{ fontSize: '0.9375rem', color: 'rgba(255,255,255,0.5)', margin: '0 0 2rem', lineHeight: 1.6 }}>
              Tidak perlu install. Tidak perlu daftar. Langsung upload dan lihat hasilnya.
            </p>
            <button onClick={onEnter} style={{
              padding: '0.9375rem 2.5rem',
              borderRadius: '999px',
              background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              border: 'none', cursor: 'pointer',
              color: '#fff', fontWeight: 700, fontSize: '1rem',
              boxShadow: '0 0 40px rgba(37,99,235,0.5)',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}>
              Mulai Analisis Sekarang →
            </button>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer style={{
          borderTop: '1px solid rgba(255,255,255,0.06)',
          padding: '2rem',
          textAlign: 'center',
          fontSize: '0.75rem',
          color: 'rgba(255,255,255,0.25)',
        }}>
          AI Financial Intelligence · Data diproses di browser Anda, tidak dikirim ke server kami.
        </footer>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}
