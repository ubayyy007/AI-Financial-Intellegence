import { useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

// ─── Floating Coins Canvas ────────────────────────────────────────────────────
function CoinsCanvas() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width  = canvas.offsetWidth  * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();

    const W = () => canvas.offsetWidth;
    const H = () => canvas.offsetHeight;

    const coins = Array.from({ length: 14 }, (_, i) => ({
      x:    Math.random() * W(),
      y:    H() + Math.random() * H() * 0.8,
      r:    22 + Math.random() * 58,
      vx:   (Math.random() - 0.5) * 0.4,
      vy:   -(0.45 + Math.random() * 1.0),
      rot:  Math.random() * Math.PI * 2,
      vrot: (Math.random() - 0.5) * 0.018,
      alpha: 0.35 + Math.random() * 0.55,
    }));

    const drawCoin = (x, y, r, rot, alpha) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.globalAlpha = alpha;

      // perspective tilt
      const tilt = Math.abs(Math.cos(rot * 2.5)) * 0.55 + 0.45;
      ctx.scale(1, tilt);
      ctx.rotate(rot);

      // drop shadow
      ctx.shadowColor = 'rgba(80, 70, 140, 0.18)';
      ctx.shadowBlur  = 24;
      ctx.shadowOffsetY = 8;

      // body gradient
      const grad = ctx.createRadialGradient(-r * 0.28, -r * 0.28, r * 0.04, 0, 0, r);
      grad.addColorStop(0,   '#dddaee');
      grad.addColorStop(0.35,'#c0bad8');
      grad.addColorStop(0.72,'#9e98c0');
      grad.addColorStop(1,   '#7c78a8');
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      // outer rim
      ctx.shadowColor = 'transparent';
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(210, 205, 230, 0.65)';
      ctx.lineWidth   = r * 0.09;
      ctx.stroke();

      // serrated edge dots
      const dots = Math.round(r * 0.75);
      for (let d = 0; d < dots; d++) {
        const a = (d / dots) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(Math.cos(a) * r * 0.93, Math.sin(a) * r * 0.93, r * 0.035, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(175, 168, 205, 0.60)';
        ctx.fill();
      }

      // inner medallion glow
      const inner = ctx.createRadialGradient(-r * 0.12, -r * 0.12, 0, 0, 0, r * 0.6);
      inner.addColorStop(0, 'rgba(235, 230, 250, 0.48)');
      inner.addColorStop(1, 'rgba(120, 115, 170, 0.12)');
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.60, 0, Math.PI * 2);
      ctx.fillStyle = inner;
      ctx.fill();

      // highlight arc
      ctx.beginPath();
      ctx.arc(-r * 0.18, -r * 0.22, r * 0.38, Math.PI * 1.1, Math.PI * 1.65);
      ctx.strokeStyle = 'rgba(245, 242, 255, 0.40)';
      ctx.lineWidth   = r * 0.12;
      ctx.lineCap     = 'round';
      ctx.stroke();

      ctx.restore();
    };

    let animId;
    const tick = () => {
      ctx.clearRect(0, 0, W(), H());
      coins.forEach(c => {
        drawCoin(c.x, c.y, c.r, c.rot, c.alpha);
        c.x   += c.vx;
        c.y   += c.vy;
        c.rot += c.vrot;
        if (c.y < -c.r * 3) {
          c.y = H() + c.r * 1.5;
          c.x = Math.random() * W();
        }
      });
      animId = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
    />
  );
}

// ─── Landing Page ──────────────────────────────────────────────────────────────
export default function LandingPage({ onEnter }) {
  const { t, lang, setLang, theme, setTheme } = useApp();
  const isDark = theme === 'dark';

  const bg       = isDark ? '#0a0a14' : '#F5F5F5';
  const textMain = isDark ? '#eeeef2' : '#0a0a14';
  const textSub  = isDark ? 'rgba(238,238,242,0.62)' : 'rgba(10,10,20,0.60)';
  const textMuted= isDark ? 'rgba(238,238,242,0.40)' : 'rgba(10,10,20,0.38)';
  const cardBg   = isDark ? '#17172a' : '#ffffff';
  const border   = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.09)';
  const heroBg   = isDark ? '#0f0f20' : '#e8e8f0';
  const accentCard = '#2B2644';

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

      {/* ── First screen ─────────────────────────────────────────────────────── */}
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>

        {/* Navbar */}
        <nav style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20, padding: '20px 28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {/* Brand name only — no icon */}
            <span style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 17, fontWeight: 500, letterSpacing: '-0.02em', color: textMain,
            }}>
              AI Financial Intelligence
            </span>

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
              <button
                onClick={onEnter}
                style={{
                  background: textMain, color: bg, border: 'none', borderRadius: 9999,
                  padding: '9px 24px', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                  fontFamily: 'inherit', letterSpacing: '-0.01em', transition: 'opacity 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.78'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >{t('landing_nav_enter')}</button>
            </div>
          </div>
        </nav>

        {/* Hero card */}
        <div style={{ flex: 1, padding: '0 20px 20px', display: 'flex', alignItems: 'flex-end' }}>
          <div style={{
            position: 'relative', width: '100%', borderRadius: 20, overflow: 'hidden',
            height: 'calc(100vh - 88px)', background: heroBg,
          }}>
            {/* Coins animation fills the whole card */}
            <CoinsCanvas />

            {/* Gradient overlay — bottom half for text readability */}
            <div style={{
              position: 'absolute', inset: 0,
              background: isDark
                ? 'linear-gradient(to top, rgba(15,15,32,0.80) 0%, rgba(15,15,32,0.30) 45%, transparent 75%)'
                : 'linear-gradient(to top, rgba(232,232,240,0.88) 0%, rgba(232,232,240,0.40) 45%, transparent 75%)',
              zIndex: 1,
            }} />

            {/* Content overlay */}
            <div style={{
              position: 'absolute', inset: 0, zIndex: 2,
              display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
              padding: '52px 52px',
            }}>
              {/* Tag pill — sits just above the headline */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)',
                backdropFilter: 'blur(12px)', borderRadius: 999,
                padding: '5px 14px', marginBottom: 20, width: 'fit-content',
                fontSize: 10, fontWeight: 700, color: textMain,
                letterSpacing: '0.10em', textTransform: 'uppercase',
              }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#2563eb', flexShrink: 0 }} />
                {t('landing_hero_tag')}
              </div>

              {/* Headline — serif, plain black/white, no gradient */}
              <h1 style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 'clamp(2.6rem, 5.5vw, 4.5rem)', fontWeight: 400,
                lineHeight: 1.08, letterSpacing: '-0.03em',
                color: textMain, margin: '0 0 16px', maxWidth: 640,
              }}>
                {t('landing_hero_1')}<br />
                {t('landing_hero_2')}
              </h1>

              {/* Subtitle */}
              <p style={{
                fontSize: 'clamp(0.875rem, 1.4vw, 1.05rem)', color: textSub,
                maxWidth: 440, margin: '0 0 32px', lineHeight: 1.65,
              }}>
                {t('landing_hero_sub')}
              </p>

              {/* Pill CTA */}
              <button
                onClick={onEnter}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 12, width: 'fit-content',
                  background: textMain, color: bg, border: 'none', borderRadius: 9999,
                  paddingLeft: 28, paddingRight: 8, paddingTop: 9, paddingBottom: 9,
                  fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                  letterSpacing: '-0.01em', transition: 'opacity 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.78'}
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
          </div>
        </div>
      </div>

      {/* ── Stats strip ──────────────────────────────────────────────────────── */}
      <section style={{ position: 'relative', zIndex: 1, padding: '72px 28px 0' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', gap: 48, flexWrap: 'wrap', justifyContent: 'center' }}>
          {[
            { val: '3', label: t('landing_stat_1') },
            { val: '95%', label: t('landing_stat_2') },
            { val: '∞', label: t('landing_stat_3') },
          ].map(({ val, label }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 'clamp(2.2rem, 4vw, 3rem)', fontWeight: 400,
                color: textMain, lineHeight: 1, letterSpacing: '-0.03em',
              }}>{val}</div>
              <div style={{ fontSize: 10, color: textMuted, marginTop: 7, letterSpacing: '0.09em', textTransform: 'uppercase', fontWeight: 600 }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────────────────────── */}
      <section style={{ position: 'relative', zIndex: 1, padding: '80px 28px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ marginBottom: 48 }}>
            <p style={{ fontSize: 11, color: textMuted, marginBottom: 10, letterSpacing: '0.09em', textTransform: 'uppercase', fontWeight: 700 }}>
              {t('landing_feat_title')}
            </p>
            <h2 style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 'clamp(1.8rem, 3.5vw, 2.75rem)', fontWeight: 400, color: textMain,
              letterSpacing: '-0.03em', lineHeight: 1.15, maxWidth: 480, margin: 0,
            }}>{t('landing_feat_sub')}</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 12 }}>
            {features.map(({ icon, tk, dk }, i) => (
              <div key={tk} style={{
                background: i % 3 === 2 ? accentCard : cardBg,
                borderRadius: 16, padding: '28px',
                border: `1px solid ${i % 3 === 2 ? 'transparent' : border}`,
                transition: 'transform 0.2s',
              }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{ fontSize: 24, marginBottom: 16 }}>{icon}</div>
                <div style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: 17, fontWeight: 500, letterSpacing: '-0.02em',
                  color: i % 3 === 2 ? '#fff' : textMain, marginBottom: 8,
                }}>{t(tk)}</div>
                <p style={{
                  fontSize: 13.5, lineHeight: 1.62, margin: 0,
                  color: i % 3 === 2 ? 'rgba(255,255,255,0.58)' : textSub,
                }}>{t(dk)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────────────────────────── */}
      <section id="how" style={{ position: 'relative', zIndex: 1, padding: '0 28px 80px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 48, alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: 11, color: textMuted, marginBottom: 10, letterSpacing: '0.09em', textTransform: 'uppercase', fontWeight: 700 }}>
              {t('landing_how_title')}
            </p>
            <h2 style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 'clamp(1.8rem, 3.5vw, 2.75rem)', fontWeight: 400, color: textMain,
              letterSpacing: '-0.03em', lineHeight: 1.15, margin: 0,
            }}>
              3 langkah,<br />mulai sekarang
            </h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {steps.map(({ num, tk, dk }, i) => (
              <div key={num} style={{
                display: 'flex', gap: 20, alignItems: 'flex-start',
                paddingBottom: i < 2 ? 32 : 0,
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    border: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: isDark ? 'rgba(37,99,235,0.08)' : 'rgba(37,99,235,0.06)',
                    fontSize: 11, fontWeight: 700, color: '#2563eb', letterSpacing: '0.05em',
                    fontFamily: "'DM Sans', system-ui, sans-serif",
                  }}>{num}</div>
                  {i < 2 && <div style={{ width: 1, flex: 1, minHeight: 24, background: border, margin: '8px 0' }} />}
                </div>
                <div style={{ paddingTop: 8 }}>
                  <div style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: 15, fontWeight: 500, color: textMain, marginBottom: 5, letterSpacing: '-0.01em',
                  }}>{t(tk)}</div>
                  <p style={{ fontSize: 13, color: textSub, lineHeight: 1.65, margin: 0 }}>{t(dk)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ────────────────────────────────────────────────────────── */}
      <section style={{ position: 'relative', zIndex: 1, padding: '0 28px 80px' }}>
        <div style={{
          maxWidth: 1100, margin: '0 auto',
          background: accentCard, borderRadius: 20, padding: '56px 52px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 32,
        }}>
          <div>
            <h2 style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 'clamp(1.6rem, 3vw, 2.25rem)', fontWeight: 400, color: '#fff',
              letterSpacing: '-0.03em', lineHeight: 1.18, margin: '0 0 12px',
            }}>
              {t('landing_hero_1')}<br />
              <span style={{ color: 'rgba(255,255,255,0.55)' }}>{t('landing_hero_2')}</span>
            </h2>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.50)', margin: 0, lineHeight: 1.6 }}>
              {t('landing_hero_sub')}
            </p>
          </div>
          <button
            onClick={onEnter}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 12, flexShrink: 0,
              background: '#fff', color: accentCard, border: 'none', borderRadius: 9999,
              paddingLeft: 28, paddingRight: 8, paddingTop: 9, paddingBottom: 9,
              fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
              letterSpacing: '-0.01em', transition: 'opacity 0.2s',
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
        position: 'relative', zIndex: 1, borderTop: `1px solid ${border}`,
        padding: '20px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8,
      }}>
        <span style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: 14, fontWeight: 400, color: textMuted, letterSpacing: '-0.01em',
        }}>
          AI Financial Intelligence
        </span>
        <span style={{ fontSize: 12, color: textMuted }}>{t('landing_footer')}</span>
      </footer>
    </div>
  );
}
