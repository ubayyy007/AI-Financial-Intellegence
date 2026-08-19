import { ArrowRight } from 'lucide-react';

// ─── Logo Icon ────────────────────────────────────────────────────────────────
function LogoIcon({ style }) {
  return (
    <svg
      viewBox="0 0 256 256"
      style={{ width: 28, height: 28, color: '#000', ...style }}
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M 128.005 191.173 C 128.448 156.208 156.93 128 192 128 L 192 64 L 128 64 C 128 99.346 99.346 128 64 128 L 64 192 L 128 192 Z M 192 256 L 64 256 C 28.654 256 0 227.346 0 192 L 0 64 L 64 64 L 64 0 L 192 0 C 227.346 0 256 28.654 256 64 L 256 192 L 192 192 Z" />
    </svg>
  );
}

// ─── Brand lists ──────────────────────────────────────────────────────────────
const HERO_BRANDS = [
  { name: 'Stripe',   style: { fontFamily: 'Georgia, serif', fontWeight: 700, letterSpacing: '-0.02em', fontSize: 15 } },
  { name: 'Coinbase', style: { fontFamily: 'Arial, sans-serif', fontWeight: 900, letterSpacing: '0.08em', fontSize: 13, textTransform: 'uppercase' } },
  { name: 'Uniswap',  style: { fontFamily: "'Trebuchet MS', sans-serif", fontWeight: 600, letterSpacing: '0.01em', fontSize: 15, fontStyle: 'italic' } },
  { name: 'Aave',     style: { fontFamily: "'Courier New', monospace", fontWeight: 700, letterSpacing: '0.12em', fontSize: 13, textTransform: 'uppercase' } },
  { name: 'Compound', style: { fontFamily: "'Palatino', 'Book Antiqua', serif", fontWeight: 400, letterSpacing: '-0.01em', fontSize: 16 } },
  { name: 'MakerDAO', style: { fontFamily: "'Impact', 'Arial Narrow', sans-serif", fontWeight: 400, letterSpacing: '0.04em', fontSize: 14 } },
  { name: 'Chainlink',style: { fontFamily: 'Verdana, sans-serif', fontWeight: 700, letterSpacing: '-0.03em', fontSize: 13 } },
];

const BACKER_BRANDS = [
  { name: 'Fundamental Labs', style: { fontFamily: "'Times New Roman', serif", fontWeight: 400, letterSpacing: '0.02em', fontSize: 14 } },
  { name: 'KUCOIN',           style: { fontFamily: "'Arial Black', sans-serif", fontWeight: 900, letterSpacing: '0.08em', fontSize: 16 } },
  { name: 'NGC',              style: { fontFamily: 'Impact, sans-serif', fontWeight: 700, letterSpacing: '0.05em', fontSize: 18 } },
  { name: 'NxGen',            style: { fontFamily: 'Georgia, serif', fontWeight: 600, letterSpacing: '-0.02em', fontSize: 17 } },
  { name: 'Matter Labs',      style: { fontFamily: 'Helvetica, sans-serif', fontWeight: 700, letterSpacing: '-0.01em', fontSize: 15 } },
  { name: 'DEXTools',         style: { fontFamily: 'Verdana, sans-serif', fontWeight: 700, letterSpacing: '0.06em', fontSize: 14, textTransform: 'uppercase' } },
  { name: 'NGRAVE',           style: { fontFamily: "'Courier New', monospace", fontWeight: 700, letterSpacing: '0.18em', fontSize: 14 } },
  { name: 'Polychain',        style: { fontFamily: "'Palatino', serif", fontWeight: 500, letterSpacing: '0.03em', fontSize: 15 } },
];

// ─── Marquee ──────────────────────────────────────────────────────────────────
function Marquee({ brands, animClass, duration, colorStyle }) {
  const doubled = [...brands, ...brands];
  return (
    <div style={{ overflow: 'hidden', width: '100%' }}>
      <div className={animClass} style={{ display: 'flex', width: 'max-content' }}>
        {doubled.map((b, i) => (
          <span
            key={i}
            style={{
              marginLeft: 28, marginRight: 28,
              flexShrink: 0,
              whiteSpace: 'nowrap',
              ...colorStyle,
              ...b.style,
            }}
          >
            {b.name}
          </span>
        ))}
      </div>
      <style>{`
        @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes backers-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .marquee-track { animation: marquee ${duration}s linear infinite; }
        .backers-track { animation: backers-marquee ${duration}s linear infinite; }
      `}</style>
    </div>
  );
}

// ─── Pill CTA Button ──────────────────────────────────────────────────────────
function PillButton({ children, onClick, size = 'md', inverted = false }) {
  const base = {
    display: 'inline-flex', alignItems: 'center', gap: 12,
    background: inverted ? '#fff' : '#000',
    color: inverted ? '#000' : '#fff',
    border: 'none', borderRadius: 9999, cursor: 'pointer',
    fontFamily: 'inherit', fontWeight: 600,
    transition: 'background 0.2s',
  };
  const sizes = {
    md: { paddingLeft: 32, paddingRight: 8, paddingTop: 8, paddingBottom: 8, fontSize: 16 },
    sm: { paddingLeft: 24, paddingRight: 6, paddingTop: 6, paddingBottom: 6, fontSize: 14 },
  };
  return (
    <button style={{ ...base, ...sizes[size] }} onClick={onClick}
      onMouseEnter={e => e.currentTarget.style.background = inverted ? '#f0f0f0' : '#222'}
      onMouseLeave={e => e.currentTarget.style.background = inverted ? '#fff' : '#000'}
    >
      {children}
      <span style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: size === 'md' ? 36 : 28, height: size === 'md' ? 36 : 28,
        borderRadius: '50%',
        background: inverted ? '#000' : '#fff',
      }}>
        <ArrowRight size={size === 'md' ? 18 : 14} color={inverted ? '#fff' : '#000'} />
      </span>
    </button>
  );
}

// ─── Sections ─────────────────────────────────────────────────────────────────

function Navbar({ onEnter }) {
  return (
    <nav style={{
      position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20,
      padding: '20px 24px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Left */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <LogoIcon />
          <span style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.04em', color: '#000' }}>Halo</span>
        </div>

        {/* Center links */}
        <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
          {['Network','Ecosystem','Rewards','Help','News'].map(l => (
            <a key={l} href="#" style={{
              fontSize: 15, color: '#555', fontWeight: 500, textDecoration: 'none',
              transition: 'color 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.color = '#000'}
              onMouseLeave={e => e.currentTarget.style.color = '#555'}
            >{l}</a>
          ))}
        </div>

        {/* Right */}
        <button
          onClick={onEnter}
          style={{
            background: '#000', color: '#fff', border: 'none', borderRadius: 9999,
            padding: '10px 28px', fontSize: 15, fontWeight: 500, cursor: 'pointer',
            fontFamily: 'inherit', transition: 'background 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#333'}
          onMouseLeave={e => e.currentTarget.style.background = '#000'}
        >
          Open Wallet
        </button>
      </div>
    </nav>
  );
}

function HeroSection({ onEnter }) {
  return (
    <div style={{ flex: 1, padding: '0 24px 24px', display: 'flex', alignItems: 'flex-end' }}>
      <div style={{
        position: 'relative', width: '100%', borderRadius: 16, overflow: 'hidden',
        height: 'calc(100vh - 96px)',
      }}>
        {/* Background video */}
        <video
          autoPlay muted loop playsInline
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260423_161253_c72b1869-400f-45ed-ac0c-52f68c2ed5bd.mp4"
        />

        {/* Content */}
        <div style={{
          position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column',
          alignItems: 'flex-start', justifyContent: 'flex-start',
          height: '100%', padding: '48px 48px 48px 48px', paddingTop: 144,
        }}>
          <h1 style={{
            color: '#000', fontSize: 'clamp(2.5rem, 5vw, 3.75rem)', fontWeight: 500,
            lineHeight: 1.1, letterSpacing: '-0.04em',
            maxWidth: 580, marginBottom: 16, marginTop: 0,
          }}>
            Your Wealth<br />Works
          </h1>

          <p style={{
            color: 'rgba(0,0,0,0.70)', fontSize: 'clamp(0.9rem, 1.5vw, 1.125rem)',
            maxWidth: 480, marginBottom: 32, lineHeight: 1.65, marginTop: 0,
            fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
          }}>
            An automated, reward-powered digital dollar built for native passive earnings and effortless connection into DeFi.
          </p>

          <PillButton onClick={onEnter}>Join us</PillButton>

          {/* Brand Marquee */}
          <div style={{ marginTop: 96, width: '100%', maxWidth: 480 }}>
            <Marquee
              brands={HERO_BRANDS}
              animClass="marquee-track"
              duration={22}
              colorStyle={{ color: 'rgba(0,0,0,0.60)' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoSection({ onEnter }) {
  return (
    <section style={{ background: '#F5F5F5', padding: '96px 24px' }}>
      <div style={{ maxWidth: '88rem', margin: '0 auto' }}>
        {/* Row 1 */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 48, marginBottom: 64, alignItems: 'flex-start',
        }}>
          <div>
            <h2 style={{
              fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 500, color: '#000',
              lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: 32, marginTop: 0,
            }}>
              Meet USD Halo.
            </h2>
            <PillButton onClick={onEnter} size="sm">Discover it</PillButton>
          </div>
          <p style={{
            color: 'rgba(0,0,0,0.70)', fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)',
            lineHeight: 1.5, margin: 0,
          }}>
            USD Halo is a reward-earning dollar coin that lets your savings grow while remaining tied to the U.S. dollar.
          </p>
        </div>

        {/* Row 2 — 4 cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 16,
        }}>
          {/* Card 1 — image bg, spans 2 cols */}
          <div style={{
            gridColumn: 'span 2',
            borderRadius: 16, overflow: 'hidden', minHeight: 320,
            backgroundImage: 'url("https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260423_164207_f243351d-ed59-48ec-83a0-a5e996bdbe3c.png&w=1280&q=85")',
            backgroundSize: 'cover', backgroundPosition: 'center',
            padding: 28, display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          }}>
            <div style={{
              fontSize: 22, fontWeight: 500, color: '#000',
              lineHeight: 1.25, letterSpacing: '-0.02em',
            }}>
              Savings that bloom
            </div>
            <p style={{ color: 'rgba(0,0,0,0.70)', fontSize: 15, maxWidth: 300, margin: 0, lineHeight: 1.55 }}>
              Gain steady returns as your dollar tokens are routed into top-performing DeFi strategies.
            </p>
          </div>

          {/* Card 2 */}
          <div style={{
            background: '#2B2644', borderRadius: 16, padding: 28, minHeight: 320,
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          }}>
            <div style={{ fontSize: 22, fontWeight: 500, color: '#fff', lineHeight: 1.25, letterSpacing: '-0.02em' }}>
              Always fluid,<br />always pegged.
            </div>
            <p style={{ color: 'rgba(255,255,255,0.60)', fontSize: 15, margin: 0, lineHeight: 1.55 }}>
              Keep fully dollar-anchored with on-demand access to funds — no lockups or waits.
            </p>
          </div>

          {/* Card 3 */}
          <div style={{
            background: '#2B2644', borderRadius: 16, padding: 28, minHeight: 320,
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          }}>
            <div style={{ fontSize: 22, fontWeight: 500, color: '#fff', lineHeight: 1.25, letterSpacing: '-0.02em' }}>
              Fully<br />automated.
            </div>
            <p style={{ color: 'rgba(255,255,255,0.60)', fontSize: 15, margin: 0, lineHeight: 1.55 }}>
              Skip the task of tuning positions yourself. USD Halo runs in the background for you.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function BackedBySection() {
  return (
    <section style={{ background: '#F5F5F5', padding: '48px 24px' }}>
      <div style={{
        maxWidth: '88rem', margin: '0 auto',
        display: 'grid', gridTemplateColumns: '1fr 3fr', gap: 32, alignItems: 'center',
      }}>
        <p style={{ color: 'rgba(0,0,0,0.70)', fontSize: 15, lineHeight: 1.65, margin: 0 }}>
          Funded by premier partners<br />and forward-thinking leaders.
        </p>
        <Marquee
          brands={BACKER_BRANDS}
          animClass="backers-track"
          duration={30}
          colorStyle={{ color: 'rgba(0,0,0,0.50)' }}
        />
      </div>
    </section>
  );
}

function UseCasesSection({ onEnter }) {
  return (
    <section style={{ background: '#F5F5F5', padding: '96px 24px' }}>
      <div style={{
        maxWidth: '88rem', margin: '0 auto',
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: 32, alignItems: 'flex-start',
      }}>
        {/* Left */}
        <div style={{ paddingTop: 8 }}>
          <p style={{ color: 'rgba(0,0,0,0.60)', fontSize: 13, marginBottom: 8, marginTop: 0, letterSpacing: '0.01em' }}>
            USD Halo in Practice
          </p>
          <h2 style={{
            fontSize: 'clamp(2.5rem, 5vw, 3.75rem)', fontWeight: 500, color: '#000',
            lineHeight: 1, letterSpacing: '-0.04em', marginBottom: 24, marginTop: 0,
          }}>
            Use modes
          </h2>
          <p style={{ color: 'rgba(0,0,0,0.60)', fontSize: 15, lineHeight: 1.65, maxWidth: 340, margin: 0 }}>
            USD Halo powers a wide range of modes for builders, companies and treasuries wanting safe and rewarding stablecoin integrations plus more
          </p>
        </div>

        {/* Right — video card */}
        <div style={{ position: 'relative', borderRadius: 24, overflow: 'hidden', minHeight: 720 }}>
          <video
            autoPlay muted loop playsInline
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260423_183428_ab5e672a-f608-4dcb-b319-f3e040f02e2d.mp4"
          />
          <div style={{ position: 'relative', zIndex: 10, padding: '48px 40px' }}>
            <h3 style={{
              fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 500, color: '#000',
              lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: 20, marginTop: 0,
            }}>
              Commerce
            </h3>
            <p style={{
              color: 'rgba(0,0,0,0.70)', fontSize: 15, maxWidth: 480, marginBottom: 32, lineHeight: 1.65, marginTop: 0,
            }}>
              Lift customer retention by offering USD Halo, a trusted dollar-backed stablecoin with strong yields, letting your patrons earn with zero effort on your platform.
            </p>
            <button
              onClick={onEnter}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 10,
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 15, fontWeight: 500, color: '#000', fontFamily: 'inherit',
                padding: 0,
              }}
            >
              <span style={{
                width: 36, height: 36, borderRadius: '50%',
                background: 'rgba(255,255,255,0.80)',
                backdropFilter: 'blur(8px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.2s',
              }}>
                <ArrowRight size={16} color="#000" />
              </span>
              Know more
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Landing Page ──────────────────────────────────────────────────────────────
export default function LandingPage({ onEnter }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', background: '#F5F5F5',
      fontFamily: "'TT Norms Pro', 'DM Sans', system-ui, sans-serif",
    }}>
      <style>{`
        @font-face {
          font-family: 'TT Norms Pro';
          src: url('/fonts/tt-norms-pro-regular.woff2') format('woff2');
          font-weight: 400;
          font-display: swap;
        }
        @font-face {
          font-family: 'TT Norms Pro';
          src: url('/fonts/tt-norms-pro-semibold.woff2') format('woff2');
          font-weight: 600;
          font-display: swap;
        }
        * { box-sizing: border-box; }
      `}</style>

      {/* First section: h-screen with navbar + hero */}
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
        <Navbar onEnter={onEnter} />
        <HeroSection onEnter={onEnter} />
      </div>

      <InfoSection onEnter={onEnter} />
      <BackedBySection />
      <UseCasesSection onEnter={onEnter} />
    </div>
  );
}
