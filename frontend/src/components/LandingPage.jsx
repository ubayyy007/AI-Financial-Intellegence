import { useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';

// ─── Minimal Chart Canvas — very subtle, quiet lines ─────────────────────────
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

    // Generate two smooth price paths
    const N = 160;
    const makePath = (start, volatility) => {
      const pts = [start];
      for (let i = 1; i < N; i++) {
        pts[i] = Math.max(8, Math.min(92, pts[i-1] + (Math.random() - 0.48) * volatility));
      }
      return pts;
    };

    const path1 = makePath(42, 4.5);
    const path2 = makePath(55, 3);

    let frame = 0;
    let animId;

    const draw = () => {
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
      const lineAlpha = isDark ? 0.12 : 0.07;
      const fillAlpha = isDark ? 0.04 : 0.025;

      // Draw main price line (bottom-third of canvas, scrolling)
      const drawLine = (path, yOffset, color, alpha, fillCol) => {
        const segW = W / (N - 1);
        const startIdx = Math.floor(frame / 1.2) % N;

        ctx.beginPath();
        for (let i = 0; i < N; i++) {
          const idx = (startIdx + i) % N;
          const x   = i * segW;
          const y   = H * yOffset - (path[idx] / 100) * (H * 0.22);
          if (i === 0) ctx.moveTo(x, y);
          else         ctx.lineTo(x, y);
        }
        ctx.strokeStyle = color.replace('ALPHA', alpha);
        ctx.lineWidth   = 1.2;
        ctx.stroke();

        // Fill below
        ctx.lineTo(W, H);
        ctx.lineTo(0, H);
        ctx.closePath();
        ctx.fillStyle = color.replace('ALPHA', fillAlpha);
        ctx.fill();
      };

      drawLine(path1, 0.72, 'rgba(74,134,240,ALPHA)', lineAlpha, fillAlpha);
      drawLine(path2, 0.88, 'rgba(100,116,200,ALPHA)', lineAlpha * 0.55, fillAlpha * 0.5);

      frame++;
      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed', inset: 0, zIndex: 0,
        width: '100%', height: '100%',
        opacity: 0.65, pointerEvents: 'none',
      }}
    />
  );
}

// ─── Glass style constants ─────────────────────────────────────────────────────
const glass = {
  background: 'rgba(8,10,22,0.55)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: '16px',
  boxShadow: '0 8px 40px rgba(0,0,0,0.50)',
};

const glassLight = {
  background: 'rgba(255,253,248,0.70)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(0,0,0,0.07)',
  borderRadius: '16px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
};

// ─── LandingPage ──────────────────────────────────────────────────────────────
export default function LandingPage({ onEnter }) {
  const { t, lang, setLang, theme, setTheme } = useApp();
  const isDark = theme === 'dark';
  const g = isDark ? glass : glassLight;

  const textMain  = isDark ? '#eeeef2' : '#10101a';
  const textMuted = isDark ? '#5a6080' : '#8a8fa8';
  const textSub   = isDark ? '#888baa' : '#4a4e68';
  const primary   = isDark ? '#4a86f0' : '#2563eb';
  const bg        = isDark ? '#06060e' : '#f5f4ef';

  const features = [
    { icon: '⚡', tk: 'landing_feat_1_title', dk: 'landing_feat_1_desc' },
    { icon: '📊', tk: 'landing_feat_2_title', dk: 'landing_feat_2_desc' },
    { icon: '📑', tk: 'landing_feat_3_title', dk: 'landing_feat_3_desc' },
    { icon: '📈', tk: 'landing_feat_4_title', dk: 'landing_feat_4_desc' },
    { icon: '🏦', tk: 'landing_feat_5_title', dk: 'landing_feat_5_desc' },
    { icon: '🔮', tk: 'landing_feat_6_title', dk: 'landing_feat_6_desc' },
  ];

  const steps = [
    { num: '01', tk: 'landing_step_1_title', dk: 'landing_step_1_desc' },
    { num: '02', tk: 'landing_step_2_title', dk: 'landing_step_2_desc' },
    { num: '03', tk: 'landing_step_3_title', dk: 'landing_step_3_desc' },
  ];

  return (
    <div style={{
      minHeight: '100vh', background: bg,
      fontFamily: "'DM Sans', system-ui, sans-serif",
      color: textMain, position: 'relative', overflow: 'hidden',
    }}>
      <ChartCanvas />

      {/* Blue light reflection — top right */}
      <div style={{
        position: 'fixed', top: '-20vh', right: '-10vw',
        width: '55vw', height: '55vw', maxWidth: 700, maxHeight: 700,
        borderRadius: '50%',
        background: 'radial-gradient(circle at center, rgba(37,99,235,0.11) 0%, transparent 68%)',
        filter: 'blur(80px)', zIndex: 0, pointerEvents: 'none',
      }} />

      {/* ── Navbar ────────────────────────────────────────────────────────────── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        ...g,
        borderRadius: 0,
        borderTop: 'none', borderLeft: 'none', borderRight: 'none',
        borderBottom: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)',
        padding: '0 2rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 60,
      }}>
        <span style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: '1.0625rem', fontWeight: 500,
          color: textMain, letterSpacing: '-0.01em',
        }}>
          AI Financial Intelligence
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Language toggle */}
          <button
            onClick={() => setLang(lang === 'id' ? 'en' : 'id')}
            style={{
              background: 'none', border: `1px solid ${isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.10)'}`,
              borderRadius: '6px', padding: '0.3rem 0.6rem',
              color: textMuted, cursor: 'pointer',
              fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.06em',
            }}
          >
            {lang === 'id' ? 'EN' : 'ID'}
          </button>
          {/* Theme toggle */}
          <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            style={{
              background: 'none', border: `1px solid ${isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.10)'}`,
              borderRadius: '6px', padding: '0.3rem 0.55rem',
              color: textMuted, cursor: 'pointer', fontSize: '0.875rem',
            }}
          >
            {isDark ? '☀' : '☽'}
          </button>
          {/* CTA */}
          <button
            onClick={onEnter}
            style={{
              background: primary, color: '#fff',
              border: 'none', borderRadius: '8px',
              padding: '0.45rem 1.1rem',
              fontSize: '0.8125rem', fontWeight: 500, cursor: 'pointer',
              letterSpacing: '0.01em',
            }}
          >
            {t('landing_nav_enter')}
          </button>
        </div>
      </nav>

      {/* ── Hero ──────────────────────────────────────────────────────────────── */}
      <section style={{
        position: 'relative', zIndex: 1,
        minHeight: '100vh',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '8rem 2rem 6rem',
        textAlign: 'center',
      }}>
        {/* Tag line */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.3rem 1rem',
          ...g, borderRadius: '999px',
          fontSize: '0.6875rem', fontWeight: 500,
          color: primary, letterSpacing: '0.08em', textTransform: 'uppercase',
          marginBottom: '2.5rem',
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: primary, flexShrink: 0 }} />
          {t('landing_hero_tag')}
        </div>

        {/* Headline */}
        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 'clamp(2.6rem, 7vw, 5.5rem)',
          fontWeight: 400,
          lineHeight: 1.1,
          letterSpacing: '-0.02em',
          marginBottom: '1.5rem',
          maxWidth: 800,
        }}>
          <span style={{ color: textMain }}>{t('landing_hero_1')}</span>
          <br />
          <span style={{
            background: `linear-gradient(135deg, ${primary} 0%, #7c84d4 100%)`,
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            {t('landing_hero_2')}
          </span>
        </h1>

        {/* Sub */}
        <p style={{
          fontSize: 'clamp(0.9375rem, 2vw, 1.125rem)',
          color: textSub, maxWidth: 560, margin: '0 auto 3rem',
          lineHeight: 1.75, fontWeight: 300, letterSpacing: '0.01em',
        }}>
          {t('landing_hero_sub')}
        </p>

        {/* CTAs */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            onClick={onEnter}
            style={{
              background: primary, color: '#fff',
              border: 'none', borderRadius: '10px',
              padding: '0.875rem 2rem',
              fontSize: '0.9375rem', fontWeight: 500, cursor: 'pointer',
              boxShadow: `0 4px 20px rgba(74,134,240,0.30)`,
              letterSpacing: '0.01em',
            }}
          >
            {t('landing_cta_primary')}
          </button>
          <a
            href="#how"
            style={{
              ...g, borderRadius: '10px',
              padding: '0.875rem 1.75rem',
              fontSize: '0.9375rem', color: textSub, cursor: 'pointer',
              letterSpacing: '0.01em', textDecoration: 'none',
              display: 'inline-flex', alignItems: 'center',
            }}
          >
            {t('landing_cta_secondary')}
          </a>
        </div>

        {/* Stats strip */}
        <div style={{
          display: 'flex', gap: '3rem', flexWrap: 'wrap', justifyContent: 'center',
          marginTop: '5rem',
        }}>
          {[
            { val: '3', label: t('landing_stat_1') },
            { val: '95%', label: t('landing_stat_2') },
            { val: '∞', label: t('landing_stat_3') },
          ].map(({ val, label }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 'clamp(2rem, 4vw, 2.75rem)',
                fontWeight: 400, color: textMain, lineHeight: 1,
              }}>{val}</div>
              <div style={{ fontSize: '0.75rem', color: textMuted, marginTop: '0.375rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────────────────────── */}
      <section style={{ position: 'relative', zIndex: 1, padding: '6rem 2rem' }}>
        <div style={{ maxWidth: 1060, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
              fontWeight: 400, color: textMain, marginBottom: '1rem',
              letterSpacing: '-0.01em',
            }}>{t('landing_feat_title')}</h2>
            <p style={{ color: textSub, fontSize: '1rem', fontWeight: 300, maxWidth: 480, margin: '0 auto' }}>
              {t('landing_feat_sub')}
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1px',
            background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)',
            borderRadius: '18px', overflow: 'hidden',
            border: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.06)',
          }}>
            {features.map(({ icon, tk, dk }) => (
              <div
                key={tk}
                style={{
                  padding: '2rem',
                  background: isDark ? 'rgba(8,10,22,0.75)' : 'rgba(255,253,248,0.75)',
                  backdropFilter: 'blur(12px)',
                }}
              >
                <div style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>{icon}</div>
                <div style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: '1.0625rem', fontWeight: 500,
                  color: textMain, marginBottom: '0.5rem', letterSpacing: '-0.01em',
                }}>{t(tk)}</div>
                <p style={{ color: textSub, fontSize: '0.875rem', lineHeight: 1.65, fontWeight: 300, margin: 0 }}>
                  {t(dk)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────────────────────────── */}
      <section id="how" style={{ position: 'relative', zIndex: 1, padding: '6rem 2rem' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
            fontWeight: 400, color: textMain, marginBottom: '4rem', letterSpacing: '-0.01em',
          }}>{t('landing_how_title')}</h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {steps.map(({ num, tk, dk }, i) => (
              <div
                key={num}
                style={{
                  display: 'flex', gap: '2rem', alignItems: 'flex-start',
                  textAlign: 'left', position: 'relative', paddingBottom: i < 2 ? '3rem' : 0,
                }}
              >
                {/* Number + vertical line */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: '50%',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.10)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: "'Playfair Display', serif",
                    fontSize: '0.875rem', color: primary, fontWeight: 400,
                    background: isDark ? 'rgba(74,134,240,0.06)' : 'rgba(37,99,235,0.05)',
                    flexShrink: 0,
                  }}>{num}</div>
                  {i < 2 && (
                    <div style={{
                      width: 1, flex: 1, minHeight: 40,
                      background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)',
                      margin: '0.75rem 0',
                    }} />
                  )}
                </div>
                <div style={{ paddingTop: '0.75rem' }}>
                  <div style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: '1.125rem', fontWeight: 500,
                    color: textMain, marginBottom: '0.5rem', letterSpacing: '-0.01em',
                  }}>{t(tk)}</div>
                  <p style={{ color: textSub, fontSize: '0.9rem', fontWeight: 300, lineHeight: 1.7, margin: 0 }}>
                    {t(dk)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ────────────────────────────────────────────────────────── */}
      <section style={{ position: 'relative', zIndex: 1, padding: '4rem 2rem 8rem' }}>
        <div style={{
          maxWidth: 640, margin: '0 auto', textAlign: 'center',
          ...g, padding: '3.5rem 2rem',
        }}>
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(1.6rem, 3.5vw, 2.25rem)',
            fontWeight: 400, color: textMain, marginBottom: '2rem',
            letterSpacing: '-0.01em',
          }}>
            {t('landing_hero_1')}<br />
            <em style={{ fontStyle: 'italic' }}>{t('landing_hero_2')}</em>
          </h2>
          <button
            onClick={onEnter}
            style={{
              background: primary, color: '#fff', border: 'none',
              borderRadius: '10px', padding: '0.875rem 2.25rem',
              fontSize: '0.9375rem', fontWeight: 500, cursor: 'pointer',
              boxShadow: `0 4px 20px rgba(74,134,240,0.28)`,
              letterSpacing: '0.01em',
            }}
          >
            {t('landing_cta_final')}
          </button>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────────── */}
      <footer style={{
        position: 'relative', zIndex: 1,
        borderTop: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.06)',
        padding: '1.5rem 2rem',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: '0.5rem',
      }}>
        <span style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: '0.875rem', color: textMuted, fontWeight: 400,
        }}>
          AI Financial Intelligence
        </span>
        <span style={{ fontSize: '0.8125rem', color: textMuted, fontWeight: 300 }}>
          {t('landing_footer')}
        </span>
      </footer>
    </div>
  );
}
