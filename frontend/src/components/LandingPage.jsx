import { useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

// ─── Logo Icon ────────────────────────────────────────────────────────────────
function LogoIcon() {
  return (
    <svg viewBox="0 0 256 256" width="26" height="26" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M 128.005 191.173 C 128.448 156.208 156.93 128 192 128 L 192 64 L 128 64 C 128 99.346 99.346 128 64 128 L 64 192 L 128 192 Z M 192 256 L 64 256 C 28.654 256 0 227.346 0 192 L 0 64 L 64 64 L 64 0 L 192 0 C 227.346 0 256 28.654 256 64 L 256 192 L 192 192 Z" />
    </svg>
  );
}

// ─── Currency symbols for marquee ──────────────────────────────────────────────
const CURRENCIES = [
  { sym: 'Rp',  style: { fontFamily: 'Georgia, serif',               fontWeight: 700, fontSize: 22, letterSpacing: '-0.02em' } },
  { sym: '$',   style: { fontFamily: "'Arial Black', sans-serif",     fontWeight: 900, fontSize: 28, letterSpacing: '-0.01em' } },
  { sym: '€',   style: { fontFamily: "'Times New Roman', serif",      fontWeight: 400, fontSize: 26, letterSpacing: '0.01em'  } },
  { sym: '£',   style: { fontFamily: 'Garamond, Georgia, serif',      fontWeight: 600, fontSize: 24, letterSpacing: '-0.01em' } },
  { sym: '¥',   style: { fontFamily: "'Trebuchet MS', sans-serif",    fontWeight: 700, fontSize: 25, letterSpacing: '0.04em'  } },
  { sym: '₿',   style: { fontFamily: 'Verdana, sans-serif',           fontWeight: 700, fontSize: 22, letterSpacing: '-0.02em' } },
  { sym: '₩',   style: { fontFamily: "'Courier New', monospace",      fontWeight: 700, fontSize: 20, letterSpacing: '0.06em'  } },
  { sym: '₺',   style: { fontFamily: 'Impact, sans-serif',            fontWeight: 400, fontSize: 24, letterSpacing: '0.05em'  } },
  { sym: '₱',   style: { fontFamily: "'Palatino', serif",             fontWeight: 500, fontSize: 23, letterSpacing: '0.01em'  } },
  { sym: 'Fr',  style: { fontFamily: 'Helvetica, Arial, sans-serif',  fontWeight: 700, fontSize: 19, letterSpacing: '-0.02em' } },
  { sym: '₴',   style: { fontFamily: 'Verdana, sans-serif',           fontWeight: 600, fontSize: 21, letterSpacing: '0.03em'  } },
  { sym: '₦',   style: { fontFamily: "Georgia, serif",                fontWeight: 700, fontSize: 22, letterSpacing: '-0.01em' } },
];

// ─── Animated chart canvas (subtle background) ────────────────────────────────
function ChartCanvas() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);
    const N = 120;
    const makePath = (start, v) => {
      const pts = [start];
      for (let i = 1; i < N; i++) pts[i] = Math.max(5, Math.min(95, pts[i-1] + (Math.random() - 0.48) * v));
      return pts;
    };
    const p1 = makePath(40, 3.5), p2 = makePath(60, 2.5);
    let frame = 0, animId;
    const draw = () => {
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      const drawLine = (path, yOff, color) => {
        const segW = W / (N - 1);
        const start = Math.floor(frame / 1.5) % N;
        ctx.beginPath();
        for (let i = 0; i < N; i++) {
          const idx = (start + i) % N;
          const x = i * segW, y = H * yOff - (path[idx] / 100) * (H * 0.18);
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = color; ctx.lineWidth = 1; ctx.stroke();
        ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath();
        ctx.fillStyle = color.replace('0.06', '0.025'); ctx.fill();
      };
      drawLine(p1, 0.70, 'rgba(37,99,235,0.06)');
      drawLine(p2, 0.85, 'rgba(90,99,200,0.045)');
      frame++; animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);
  return (
    <canvas ref={canvasRef} style={{
      position: 'fixed', inset: 0, zIndex: 0, width: '100%', height: '100%',
      opacity: 0.5, pointerEvents: 'none',
    }} />
  );
}

// ─── Landing Page ──────────────────────────────────────────────────────────────
export default function LandingPage({ onEnter }) {
  const { t, lang, setLang, theme, setTheme } = useApp();
  const isDark = theme === 'dark';

  const bg       = isDark ? '#0a0a14' : '#F5F5F5';
  const textMain = isDark ? '#eeeef2' : '#0a0a14';
  const textMuted= isDark ? 'rgba(238,238,242,0.50)' : 'rgba(10,10,20,0.50)';
  const textSub  = isDark ? 'rgba(238,238,242,0.68)' : 'rgba(10,10,20,0.65)';
  const cardBg   = isDark ? '#16162a' : '#fff';
  const cardBg2  = isDark ? '#1e1e38' : '#f0f0f8';
  const border   = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.09)';
  const accentCard = '#2B2644';

  const doubled = [...CURRENCIES, ...CURRENCIES];

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
    <div style={{ display: 'flex', flexDirection: 'column', background: bg, fontFamily: "'DM Sans', system-ui, sans-serif", minHeight: '100vh' }}>
      <ChartCanvas />

      <style>{`
        @keyframes marquee-curr { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .curr-track { display: flex; width: max-content; animation: marquee-curr 26s linear infinite; }
        * { box-sizing: border-box; }
      `}</style>

      {/* ── First screen: Navbar + Hero ─────────────────────────────────────── */}
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>

        {/* Navbar — absolute over hero */}
        <nav style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20, padding: '20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {/* Left: logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: textMain }}>
              <LogoIcon />
              <span style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-0.04em', color: textMain }}>
                AI Financial Intelligence
              </span>
            </div>

            {/* Right: controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button
                onClick={() => setLang(lang === 'id' ? 'en' : 'id')}
                style={{
                  background: 'none', border: `1px solid ${border}`, borderRadius: 8,
                  padding: '5px 11px', color: textMuted, cursor: 'pointer',
                  fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', fontFamily: 'inherit',
                }}
              >{lang === 'id' ? 'EN' : 'ID'}</button>
              <button
                onClick={() => setTheme(isDark ? 'light' : 'dark')}
                style={{
                  background: 'none', border: `1px solid ${border}`, borderRadius: 8,
                  padding: '5px 11px', color: textMuted, cursor: 'pointer', fontSize: 14, fontFamily: 'inherit',
                }}
              >{isDark ? '☀' : '☽'}</button>
              {/* Pill CTA */}
              <button
                onClick={onEnter}
                style={{
                  background: textMain, color: bg, border: 'none', borderRadius: 9999,
                  padding: '9px 24px', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                  fontFamily: 'inherit', letterSpacing: '-0.01em', transition: 'opacity 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.80'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >{t('landing_nav_enter')}</button>
            </div>
          </div>
        </nav>

        {/* Hero card with video */}
        <div style={{ flex: 1, padding: '0 20px 20px', display: 'flex', alignItems: 'flex-end', paddingTop: 0 }}>
          <div style={{
            position: 'relative', width: '100%', borderRadius: 20, overflow: 'hidden',
            height: 'calc(100vh - 88px)', marginTop: 'auto',
          }}>
            {/* Video background */}
            <video
              autoPlay muted loop playsInline
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
              src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260423_161253_c72b1869-400f-45ed-ac0c-52f68c2ed5bd.mp4"
            />
            {/* Subtle overlay so text is readable */}
            <div style={{
              position: 'absolute', inset: 0,
              background: isDark
                ? 'linear-gradient(160deg, rgba(10,10,20,0.45) 0%, rgba(10,10,20,0.15) 60%, transparent 100%)'
                : 'linear-gradient(160deg, rgba(245,245,245,0.40) 0%, rgba(245,245,245,0.10) 60%, transparent 100%)',
            }} />

            {/* Content */}
            <div style={{
              position: 'relative', zIndex: 10, height: '100%',
              display: 'flex', flexDirection: 'column', justifyContent: 'flex-start',
              padding: '48px', paddingTop: 140,
            }}>
              {/* Tag */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.08)',
                backdropFilter: 'blur(10px)', borderRadius: 999,
                padding: '5px 14px', marginBottom: 24, width: 'fit-content',
                fontSize: 11, fontWeight: 600, color: textMain, letterSpacing: '0.08em', textTransform: 'uppercase',
              }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#2563eb', flexShrink: 0 }} />
                {t('landing_hero_tag')}
              </div>

              {/* Headline */}
              <h1 style={{
                fontSize: 'clamp(2.4rem, 5vw, 4rem)', fontWeight: 500,
                lineHeight: 1.08, letterSpacing: '-0.04em',
                color: textMain, maxWidth: 620, margin: '0 0 16px',
                fontFamily: "'DM Sans', system-ui, sans-serif",
              }}>
                {t('landing_hero_1')}<br />
                <span style={{ color: '#2563eb' }}>{t('landing_hero_2')}</span>
              </h1>

              {/* Sub */}
              <p style={{
                fontSize: 'clamp(0.9rem, 1.4vw, 1.05rem)', color: textSub,
                maxWidth: 460, margin: '0 0 32px', lineHeight: 1.65,
                fontFamily: "'DM Sans', system-ui, sans-serif",
              }}>
                {t('landing_hero_sub')}
              </p>

              {/* Pill CTA */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                <button
                  onClick={onEnter}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 12,
                    background: textMain, color: bg, border: 'none', borderRadius: 9999,
                    paddingLeft: 28, paddingRight: 8, paddingTop: 8, paddingBottom: 8,
                    fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                    letterSpacing: '-0.01em', transition: 'opacity 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.80'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                >
                  {t('landing_cta_primary')}
                  <span style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <ArrowRight size={16} color={textMain} />
                  </span>
                </button>
              </div>

              {/* Currency marquee — bottom of hero */}
              <div style={{ position: 'absolute', bottom: 36, left: 0, right: 0, overflow: 'hidden' }}>
                <div className="curr-track">
                  {doubled.map((c, i) => (
                    <span key={i} style={{
                      marginLeft: 36, marginRight: 36, flexShrink: 0, whiteSpace: 'nowrap',
                      color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.30)',
                      ...c.style,
                    }}>
                      {c.sym}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats strip ──────────────────────────────────────────────────────── */}
      <section style={{ position: 'relative', zIndex: 1, padding: '80px 24px 0' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', gap: 48, flexWrap: 'wrap', justifyContent: 'center' }}>
          {[
            { val: '3', label: t('landing_stat_1') },
            { val: '95%', label: t('landing_stat_2') },
            { val: '∞', label: t('landing_stat_3') },
          ].map(({ val, label }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: 'clamp(2.2rem, 4vw, 3rem)', fontWeight: 500,
                color: textMain, lineHeight: 1, letterSpacing: '-0.04em',
                fontFamily: "'DM Sans', system-ui, sans-serif",
              }}>{val}</div>
              <div style={{ fontSize: 11, color: textMuted, marginTop: 6, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────────────────────── */}
      <section style={{ position: 'relative', zIndex: 1, padding: '80px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          {/* Section header */}
          <div style={{ marginBottom: 48 }}>
            <p style={{ fontSize: 12, color: textMuted, marginBottom: 8, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>
              {t('landing_feat_title')}
            </p>
            <h2 style={{
              fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', fontWeight: 500, color: textMain,
              letterSpacing: '-0.04em', lineHeight: 1.1, maxWidth: 500,
              fontFamily: "'DM Sans', system-ui, sans-serif",
            }}>{t('landing_feat_sub')}</h2>
          </div>

          {/* Feature cards grid */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 12,
          }}>
            {features.map(({ icon, tk, dk }, i) => (
              <div key={tk} style={{
                background: i % 3 === 2 ? accentCard : cardBg,
                borderRadius: 16, padding: '28px 28px',
                border: `1px solid ${i % 3 === 2 ? 'transparent' : border}`,
                transition: 'transform 0.2s',
              }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{ fontSize: 24, marginBottom: 16 }}>{icon}</div>
                <div style={{
                  fontSize: 16, fontWeight: 600, letterSpacing: '-0.02em',
                  color: i % 3 === 2 ? '#fff' : textMain, marginBottom: 8,
                  fontFamily: "'DM Sans', system-ui, sans-serif",
                }}>{t(tk)}</div>
                <p style={{
                  fontSize: 14, lineHeight: 1.60, margin: 0,
                  color: i % 3 === 2 ? 'rgba(255,255,255,0.60)' : textSub,
                }}>{t(dk)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────────────────────────── */}
      <section id="how" style={{ position: 'relative', zIndex: 1, padding: '0 24px 80px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 48, alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: 12, color: textMuted, marginBottom: 8, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>
              {t('landing_how_title')}
            </p>
            <h2 style={{
              fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', fontWeight: 500, color: textMain,
              letterSpacing: '-0.04em', lineHeight: 1.1,
              fontFamily: "'DM Sans', system-ui, sans-serif",
            }}>
              3 langkah<br />mulai sekarang
            </h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {steps.map(({ num, tk, dk }, i) => (
              <div key={num} style={{
                display: 'flex', gap: 20, alignItems: 'flex-start',
                paddingBottom: i < 2 ? 32 : 0, position: 'relative',
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    border: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: isDark ? 'rgba(37,99,235,0.08)' : 'rgba(37,99,235,0.06)',
                    fontSize: 12, fontWeight: 700, color: '#2563eb', letterSpacing: '0.04em',
                  }}>{num}</div>
                  {i < 2 && <div style={{ width: 1, flex: 1, minHeight: 28, background: border, margin: '8px 0' }} />}
                </div>
                <div style={{ paddingTop: 8 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: textMain, marginBottom: 4, letterSpacing: '-0.01em' }}>
                    {t(tk)}
                  </div>
                  <p style={{ fontSize: 13, color: textSub, lineHeight: 1.65, margin: 0 }}>{t(dk)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ────────────────────────────────────────────────────────── */}
      <section style={{ position: 'relative', zIndex: 1, padding: '0 24px 80px' }}>
        <div style={{
          maxWidth: 1100, margin: '0 auto',
          background: accentCard, borderRadius: 20,
          padding: '56px 48px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 32,
        }}>
          <div>
            <h2 style={{
              fontSize: 'clamp(1.6rem, 3vw, 2.25rem)', fontWeight: 500, color: '#fff',
              letterSpacing: '-0.04em', lineHeight: 1.15,
              fontFamily: "'DM Sans', system-ui, sans-serif", margin: 0, marginBottom: 12,
            }}>
              {t('landing_hero_1')}<br />
              <span style={{ color: 'rgba(255,255,255,0.60)' }}>{t('landing_hero_2')}</span>
            </h2>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', margin: 0, lineHeight: 1.6 }}>
              {t('landing_hero_sub')}
            </p>
          </div>
          <button
            onClick={onEnter}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 12,
              background: '#fff', color: accentCard, border: 'none', borderRadius: 9999,
              paddingLeft: 28, paddingRight: 8, paddingTop: 9, paddingBottom: 9,
              fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
              letterSpacing: '-0.01em', flexShrink: 0, transition: 'opacity 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            {t('landing_cta_final')}
            <span style={{
              width: 34, height: 34, borderRadius: '50%',
              background: accentCard, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <ArrowRight size={15} color="#fff" />
            </span>
          </button>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────────── */}
      <footer style={{
        position: 'relative', zIndex: 1,
        borderTop: `1px solid ${border}`,
        padding: '20px 24px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: 8,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: textMain }}>
          <LogoIcon />
          <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-0.02em', color: textMain }}>
            AI Financial Intelligence
          </span>
        </div>
        <span style={{ fontSize: 12, color: textMuted }}>{t('landing_footer')}</span>
      </footer>
    </div>
  );
}
