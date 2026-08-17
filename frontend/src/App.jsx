import { useState, useMemo } from 'react';
import './App.css';
import LandingPage from './components/LandingPage';
import { Check, User, Store, ShoppingBag } from 'lucide-react';
import FileUpload from './components/FileUpload';
import ConfidenceReview from './components/ConfidenceReview';
import FinancialStatements from './components/FinancialStatements';
import BIDashboard from './components/BIDashboard';
import MultiPeriodView from './components/MultiPeriodView';
import PersonalFinanceView from './components/PersonalFinanceView';
import MikroView from './components/MikroView';
import InvestmentView from './components/InvestmentView';
import BenchmarkView from './components/BenchmarkView';
import { buildPeriods, computeForecast } from './utils/multiPeriodEngine';

// ─── Mode Toggle ──────────────────────────────────────────────────────────────

const MODES = [
  { value: 'personal', label: 'Personal',    Icon: User        },
  { value: 'mikro',    label: 'Toko/Warung', Icon: ShoppingBag },
  { value: 'business', label: 'Bisnis/UMKM', Icon: Store       },
];

const ModeToggle = ({ mode, onChange }) => (
  <div style={{
    display: 'inline-flex', borderRadius: '8px',
    border: '1px solid var(--border)',
    overflow: 'hidden', background: 'var(--bg-secondary)',
  }}>
    {MODES.map(({ value, label, Icon }) => {
      const active = mode === value;
      return (
        <button
          key={value}
          onClick={() => onChange(value)}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.375rem',
            padding: '0.4rem 0.875rem',
            border: 'none', cursor: 'pointer',
            fontSize: '0.8125rem', fontWeight: active ? 600 : 400,
            background: active ? 'var(--primary)' : 'transparent',
            color: active ? '#fff' : 'var(--text-muted)',
            transition: 'all 0.15s',
          }}
        >
          <Icon size={13} />
          {label}
        </button>
      );
    })}
  </div>
);

// ─── App ──────────────────────────────────────────────────────────────────────

function App() {
  const [showLanding, setShowLanding] = useState(true);
  const [mode, setMode] = useState('business'); // 'personal' | 'business'
  const [parsedData, setParsedData] = useState([]);
  const [extractionResult, setExtractionResult] = useState(null);
  const [activeMainTab, setActiveMainTab] = useState('data');

  // Derived
  const periods  = useMemo(() => buildPeriods(parsedData), [parsedData]);
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
    setMode(newMode);
    const businessOnly = ['bi', 'investment', 'benchmark'];
    if (newMode === 'business' && activeMainTab === 'report') {
      setActiveMainTab('statements');
    } else if (newMode !== 'business' && businessOnly.includes(activeMainTab)) {
      setActiveMainTab('report');
    }
  };

  // ── Upload handlers ────────────────────────────────────────────────────────
  const handleDataParsed = (result) => setExtractionResult(result);

  const handleConfirmExtraction = () => {
    setParsedData(extractionResult.transactions);
    setExtractionResult(null);
    setActiveMainTab(mode === 'business' ? 'statements' : 'report');
  };

  const handleMergeExtraction = () => {
    setParsedData((prev) => [...prev, ...extractionResult.transactions]);
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

  // Step label & number based on mode
  const stepConfig = mode === 'business'
    ? [
        { id: 'data',       label: 'Upload Data'    },
        { id: 'statements', label: '3 Statement'     },
        { id: 'bi',         label: 'BI Insight'      },
        { id: 'investment', label: 'Skor Investasi'  },
        { id: 'benchmark',  label: 'Benchmark'       },
        { id: 'multi',      label: 'Tren & Proyeksi' },
      ]
    : mode === 'mikro'
    ? [
        { id: 'data',       label: 'Upload Data'    },
        { id: 'report',     label: 'Laporan Toko'   },
        { id: 'statements', label: '3 Statement'    },
        { id: 'multi',      label: 'Tren & Proyeksi' },
      ]
    : [
        { id: 'data',       label: 'Upload Data'     },
        { id: 'report',     label: 'Laporan Personal' },
        { id: 'statements', label: '3 Statement'      },
        { id: 'multi',      label: 'Tren & Proyeksi'  },
      ];

  if (showLanding) return <LandingPage onEnter={() => setShowLanding(false)} />;

  return (
    <div className="container">
      <header className="header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h1>AI Financial Intelligence</h1>
            <p>Platform AI elegan untuk mengekstrak insight bisnis dan menyusun laporan standar langsung dari data mentah Anda.</p>
          </div>
          <div style={{ paddingTop: '0.25rem', flexShrink: 0 }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.375rem', textAlign: 'right' }}>Mode Analisis</div>
            <ModeToggle mode={mode} onChange={handleModeChange} />
          </div>
        </div>
      </header>

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
                <FileUpload onDataParsed={handleDataParsed} />
                {hasData && (
                  <p style={{ textAlign: 'center', marginTop: '0.875rem', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    {parsedData.length} transaksi dimuat ({periods.length} periode).
                    Upload file baru untuk menambahkan periode atau mengganti data.
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
            <FinancialStatements parsedData={parsedData} />
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
              <h2 style={{ margin: '0 0 0.25rem 0', fontSize: '1.25rem', fontWeight: 700 }}>
                Tren &amp; Proyeksi Multi-Periode
              </h2>
              <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                Komparasi antar bulan dan proyeksi arus kas 3 bulan ke depan berbasis tren historis.
                {!isMulti && (
                  <span style={{ color: '#f59e0b', marginLeft: '0.4rem' }}>
                    Data hanya 1 periode — tambahkan file periode lain untuk komparasi penuh.
                  </span>
                )}
              </p>
            </div>
            <MultiPeriodView periods={periods} forecast={forecast} />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
