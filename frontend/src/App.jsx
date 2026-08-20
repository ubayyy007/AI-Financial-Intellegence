import { lazy, Suspense, useMemo, useState } from 'react';
import './App.css';
import LandingPage from './components/LandingPage';
import { Check, User, Store, ShoppingBag, Moon, Sun } from 'lucide-react';
import { useApp } from './context/useApp';
import { buildPeriods, computeForecast } from './utils/multiPeriodEngine';

// Keep the landing page fast. Analysis modules load only when the workspace is used.
const FileUpload = lazy(() => import('./components/FileUpload'));
const ConfidenceReview = lazy(() => import('./components/ConfidenceReview'));
const FinancialStatements = lazy(() => import('./components/FinancialStatements'));
const BIDashboard = lazy(() => import('./components/BIDashboard'));
const MultiPeriodView = lazy(() => import('./components/MultiPeriodView'));
const PersonalFinanceView = lazy(() => import('./components/PersonalFinanceView'));
const MikroView = lazy(() => import('./components/MikroView'));
const InvestmentView = lazy(() => import('./components/InvestmentView'));
const BenchmarkView = lazy(() => import('./components/BenchmarkView'));

// ─── Mode Toggle ──────────────────────────────────────────────────────────────

const MODES = [
  {
    value: 'personal', tKey: 'mode_personal', Icon: User,
    tooltipTitle: 'Mode Personal',
    tooltipLines: ['Untuk individu yang ingin memantau', 'keuangan pribadi: gaji, pengeluaran,', 'tabungan, dan cicilan.'],
  },
  {
    value: 'mikro', tKey: 'mode_warung', Icon: ShoppingBag,
    tooltipTitle: 'Mode UMKM',
    tooltipLines: ['Untuk warung, toko, atau usaha', 'rumahan yang butuh laporan', 'penjualan dan stok sederhana.'],
  },
  {
    value: 'business', tKey: 'mode_business', Icon: Store,
    tooltipTitle: 'Mode Bisnis Enterprise',
    tooltipLines: ['Untuk bisnis terstruktur dengan', 'karyawan, invoice B2B, aset,', 'dan akuntansi formal.'],
  },
];

const ModeToggle = ({ mode, onChange, t }) => {
  const [hoveredMode, setHoveredMode] = useState(null);
  const hoveredData = MODES.find(m => m.value === hoveredMode);

  return (
    // Outer wrapper — tooltip renders here, OUTSIDE the overflow:hidden buttons container
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <div style={{
        display: 'inline-flex', borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--border)',
        overflow: 'hidden', background: 'var(--bg-secondary)',
      }}>
        {MODES.map(({ value, tKey, Icon }) => {
          const active = mode === value;
          return (
            <button
              key={value}
              onClick={() => onChange(value)}
              onMouseEnter={() => setHoveredMode(value)}
              onMouseLeave={() => setHoveredMode(null)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.35rem',
                padding: '0.4rem 0.875rem',
                border: 'none', cursor: 'pointer',
                fontSize: '0.8125rem', fontWeight: active ? 500 : 400,
                background: active ? 'var(--primary)' : 'transparent',
                color: active ? '#fff' : 'var(--text-muted)',
                transition: 'all 0.15s',
                letterSpacing: '0.01em',
              }}
            >
              <Icon size={12} />
              {t(tKey)}
            </button>
          );
        })}
      </div>

      {/* Tooltip — outside overflow:hidden so it's not clipped */}
      {hoveredData && (
        <div style={{
          position: 'absolute', bottom: 'calc(100% + 10px)', left: '50%',
          transform: 'translateX(-50%)',
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)',
          padding: '0.5rem 0.75rem',
          minWidth: 190,
          boxShadow: '0 4px 20px rgba(0,0,0,0.18)',
          zIndex: 200,
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
        }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.3rem' }}>
            {hoveredData.tooltipTitle}
          </div>
          {hoveredData.tooltipLines.map((line, i) => (
            <div key={i} style={{ fontSize: '0.65rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              {line}
            </div>
          ))}
          <div style={{
            position: 'absolute', bottom: -5, left: '50%',
            transform: 'translateX(-50%) rotate(45deg)',
            width: 8, height: 8,
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderTop: 'none', borderLeft: 'none',
          }} />
        </div>
      )}
    </div>
  );
};

// ─── App ──────────────────────────────────────────────────────────────────────

function App() {
  const { t, lang, setLang, theme, setTheme } = useApp();
  const [showLanding, setShowLanding] = useState(true);
  const [mode, setMode] = useState(() => localStorage.getItem('mode') || 'personal');
  const [parsedData, setParsedData] = useState([]);
  const [extractionResult, setExtractionResult] = useState(null);
  const [activeMainTab, setActiveMainTab] = useState('data');
  const [openingBalance, setOpeningBalance] = useState(0);

  // Derived
  const periods  = useMemo(() => buildPeriods(parsedData, mode, openingBalance), [parsedData, mode, openingBalance]);
  const forecast = useMemo(() => computeForecast(periods, 3), [periods]);
  const hasData  = parsedData.length > 0;
  const isMulti  = periods.length > 1;

  // Stepper steps differ by mode
  // personal/mikro: data → statements → multi
  // business:       data → statements → bi → multi
  const STEPS = mode === 'business'
    ? ['data', 'statements', 'bi', 'investment', 'benchmark', 'multi']
    : ['data', 'report', 'statements', 'multi'];

  // ── Mode change ────────────────────────────────────────────────────────────
  const handleModeChange = (newMode) => {
    if (newMode === mode) return;
    if (hasData) {
      const ok = window.confirm(
        'Mengganti mode akan menghapus data yang sudah dimuat.\nData perlu diupload ulang sesuai mode baru.\n\nLanjutkan?'
      );
      if (!ok) return;
      setParsedData([]);
      setExtractionResult(null);
      setActiveMainTab('data');
    }
    setMode(newMode);
    localStorage.setItem('mode', newMode);
    const businessOnly = ['bi', 'investment', 'benchmark'];
    if (newMode === 'business' && activeMainTab === 'report') {
      setActiveMainTab('statements');
    } else if (newMode !== 'business' && businessOnly.includes(activeMainTab)) {
      setActiveMainTab('report');
    }
  };

  // ── Upload handlers ────────────────────────────────────────────────────────
  const handleDataParsed = (result) => setExtractionResult(result);

  const handleConfirmExtraction = (reviewedResult = extractionResult) => {
    setParsedData(reviewedResult.transactions);
    setExtractionResult(null);
    setActiveMainTab(mode === 'business' ? 'statements' : 'report');
  };

  const handleMergeExtraction = (reviewedResult = extractionResult) => {
    setParsedData((prev) => [...prev, ...reviewedResult.transactions]);
    setExtractionResult(null);
    setActiveMainTab('multi');
  };

  const handleResetExtraction = () => setExtractionResult(null);

  // ── Stepper helpers ────────────────────────────────────────────────────────
  const getStepStatus = (stepId) => {
    const ci = STEPS.indexOf(activeMainTab);
    const ti = STEPS.indexOf(stepId);
    if (ti < ci)  return 'completed';
    if (ti === ci) return 'active';
    return 'pending';
  };

  const goToStep = (stepId) => {
    if (stepId === 'data' || hasData) setActiveMainTab(stepId);
  };

  const stepConfig = mode === 'business'
    ? [
        { id: 'data',       label: t('step_data')       },
        { id: 'statements', label: t('step_statements')  },
        { id: 'bi',         label: t('step_bi')          },
        { id: 'investment', label: t('step_investment')  },
        { id: 'benchmark',  label: t('step_benchmark')   },
        { id: 'multi',      label: t('step_multi')       },
      ]
    : mode === 'mikro'
    ? [
        { id: 'data',       label: t('step_data')           },
        { id: 'report',     label: t('step_report_warung')  },
        { id: 'statements', label: t('step_statements')     },
        { id: 'multi',      label: t('step_multi')          },
      ]
    : [
        { id: 'data',       label: t('step_data')            },
        { id: 'report',     label: t('step_report_personal') },
        { id: 'statements', label: t('step_statements')      },
        { id: 'multi',      label: t('step_multi')           },
      ];

  if (showLanding) return <LandingPage onEnter={() => setShowLanding(false)} />

  const goHome = () => setShowLanding(true);

  // ── Shared icon-button style ────────────────────────────────────────────────
  const iconBtn = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    width: 34, height: 34, borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border-strong)',
    background: 'var(--bg-secondary)',
    color: 'var(--text-muted)', cursor: 'pointer', transition: 'all 0.2s',
    flexShrink: 0,
  };

  return (
    <div className="container">
      <header className="header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ textAlign: 'left' }}>
            <h1>{t('app_title')}</h1>
            <p style={{ marginTop: '0.375rem' }}>{t('app_desc')}</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.625rem', paddingTop: '0.25rem', flexShrink: 0 }}>
            {/* Controls row: lang + theme + mode */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {/* Back to home */}
              <button
                style={{ ...iconBtn, paddingLeft: '0.65rem', paddingRight: '0.65rem', width: 'auto', gap: '0.3rem', fontSize: '0.75rem' }}
                onClick={goHome}
                title="Kembali ke Beranda"
              >
                <span style={{ fontSize: 13 }}>←</span>
                <span style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.02em' }}>Beranda</span>
              </button>
              {/* Language toggle */}
              <button
                style={iconBtn}
                onClick={() => setLang(lang === 'id' ? 'en' : 'id')}
                title="Switch language"
              >
                <span style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.04em' }}>
                  {lang === 'id' ? 'EN' : 'ID'}
                </span>
              </button>
              {/* Theme toggle */}
              <button
                style={iconBtn}
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                title={theme === 'dark' ? 'Switch to light' : 'Switch to dark'}
              >
                {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
              </button>
            </div>
            <div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.3rem', textAlign: 'right', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{t('mode_label')}</div>
              <ModeToggle mode={mode} onChange={handleModeChange} t={t} />
            </div>
          </div>
        </div>
      </header>

      <Suspense fallback={<main><div className="card page-fade">Memuat modul analisis...</div></main>}>
      <main>
        {/* ── Stepper ───────────────────────────────────────────────── */}
        <div className="stepper-container">
          {stepConfig.map((step, idx) => {
            const isLast = idx === stepConfig.length - 1;
            return (
              <div key={step.id} style={{ display: 'contents' }}>
                <div
                  className={`step-item ${getStepStatus(step.id)}`}
                  onClick={() => goToStep(step.id)}
                  style={{ cursor: (step.id === 'data' || hasData) ? 'pointer' : 'not-allowed', opacity: (step.id === 'data' || hasData) ? 1 : 0.5 }}
                >
                  <div className="step-circle" style={{ position: 'relative' }}>
                    {getStepStatus(step.id) === 'completed' ? <Check size={16} /> : idx + 1}
                    {step.id === 'multi' && isMulti && getStepStatus('multi') !== 'active' && getStepStatus('multi') !== 'completed' && (
                      <span style={{ position: 'absolute', top: -3, right: -3, width: 8, height: 8, borderRadius: '50%', background: '#818cf8', border: '2px solid var(--bg-card)' }} />
                    )}
                  </div>
                  <div className="step-label">
                    {step.label}
                    {step.id === 'multi' && isMulti && (
                      <span style={{ marginLeft: '0.3rem', fontSize: '0.6rem', color: '#818cf8', fontWeight: 700 }}>{periods.length}P</span>
                    )}
                  </div>
                </div>
                {!isLast && (
                  <div className={`step-line ${getStepStatus(stepConfig[idx + 1].id) !== 'pending' ? 'active' : ''}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* ── Tab 1: Upload & Confidence Review ───────────────────── */}
        {activeMainTab === 'data' && (
          <div key="data" className="page-fade">
            {!extractionResult ? (
              <>
                <FileUpload
                onDataParsed={handleDataParsed}
                openingBalance={openingBalance}
                onOpeningBalanceChange={setOpeningBalance}
              />
                {hasData && (
                  <p style={{ textAlign: 'center', marginTop: '0.875rem', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    {parsedData.length} {t('periods_loaded')} ({periods.length} {t('periods_count')}).{' '}
                    {t('upload_new_period')}
                  </p>
                )}
              </>
            ) : (
              <ConfidenceReview
                result={extractionResult}
                onConfirm={handleConfirmExtraction}
                onMerge={handleMergeExtraction}
                onReset={handleResetExtraction}
                hasPreviousData={hasData}
              />
            )}
          </div>
        )}

        {/* ── Tab 2: Laporan Personal / Laporan Toko (non-bisnis) ──────── */}
        {activeMainTab === 'report' && hasData && (mode === 'personal' || mode === 'mikro') && (
          <div key="report" className="page-fade">
            {mode === 'personal' ? (
              <>
                <div style={{ marginBottom: '1.25rem' }}>
                  <h2 style={{ margin: '0 0 0.25rem 0', fontSize: '1.25rem', fontWeight: 700 }}>Laporan Keuangan Personal</h2>
                  <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    Analisis kesehatan keuangan pribadi berdasarkan framework budgeting pilihan Anda.
                  </p>
                </div>
                <PersonalFinanceView transactions={parsedData} />
              </>
            ) : (
              <MikroView transactions={parsedData} />
            )}
          </div>
        )}

        {/* ── Tab 3 (semua mode): 3 Financial Statements ───────────────── */}
        {activeMainTab === 'statements' && hasData && (
          <div key="statements" className="page-fade">
            <FinancialStatements parsedData={parsedData} mode={mode} openingBalance={openingBalance} />
          </div>
        )}

        {/* ── Tab 3: BI Insight (bisnis saja) ─────────────────────── */}
        {activeMainTab === 'bi' && mode === 'business' && (
          <div key="bi" className="page-fade">
            <BIDashboard initialParsedData={parsedData} />
          </div>
        )}

        {/* ── Tab 4: Skor Investasi (bisnis saja) ──────────────────── */}
        {activeMainTab === 'investment' && mode === 'business' && (
          <div key="investment" className="page-fade">
            <div style={{ marginBottom: '1.25rem' }}>
              <h2 style={{ margin: '0 0 0.25rem 0', fontSize: '1.25rem', fontWeight: 700 }}>Skor Kelayakan Investasi</h2>
              <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                Evaluasi kesiapan bisnis untuk pengajuan pinjaman atau pendanaan investor, berdasarkan data keuangan historis.
              </p>
            </div>
            <InvestmentView periods={periods} />
          </div>
        )}

        {/* ── Tab 5: Benchmark (bisnis saja) ───────────────────────── */}
        {activeMainTab === 'benchmark' && mode === 'business' && (
          <div key="benchmark" className="page-fade">
            <div style={{ marginBottom: '1.25rem' }}>
              <h2 style={{ margin: '0 0 0.25rem 0', fontSize: '1.25rem', fontWeight: 700 }}>Benchmark Sektor UMKM</h2>
              <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                Bandingkan performa keuangan bisnis Anda dengan rata-rata UMKM sejenis di Indonesia.
              </p>
            </div>
            <BenchmarkView periods={periods} />
          </div>
        )}

        {/* ── Tab 4: Tren & Proyeksi ───────────────────────────────── */}
        {activeMainTab === 'multi' && (
          <div key="multi" className="page-fade">
            <div style={{ marginBottom: '1.25rem' }}>
              <h2 style={{ margin: '0 0 0.25rem 0' }}>{t('multi_title')}</h2>
              <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                {t('multi_sub')}
                {!isMulti && (
                  <span style={{ color: 'var(--warning)', marginLeft: '0.4rem' }}>
                    {t('multi_single_warn')}
                  </span>
                )}
              </p>
            </div>
            <MultiPeriodView periods={periods} forecast={forecast} />
          </div>
        )}
      </main>
      </Suspense>
    </div>
  );
}

export default App;
