import { useState } from 'react';
import { calculateRatios, prepareChartData } from '../utils/ratioEngine';
import { generateStatements } from '../utils/financialEngine';
import { generateAISummary } from '../utils/aiSummaryEngine';
import { 
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend, 
  LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer 
} from 'recharts';
import { AlertCircle, TrendingUp, ShieldAlert, CheckCircle2, Sparkles, Languages } from 'lucide-react';
import FileUpload from './FileUpload';

const COLORS = ['#818cf8', '#34d399', '#fbbf24', '#f87171', '#38bdf8'];

const ScoreCard = ({ title, data }) => {
  const isHealthy = data.status === 'Sehat';
  const isWarning = data.status === 'Cukup';
  
  let color = 'var(--danger)';
  let Icon = ShieldAlert;
  
  if (isHealthy) {
    color = 'var(--success)';
    Icon = CheckCircle2;
  } else if (isWarning) {
    color = 'var(--accent)';
    Icon = TrendingUp;
  }

  const formatValue = (val, isRatio) => {
    if (isRatio && val > 100) return 'N/A'; // For extreme values like 999
    return isRatio ? `${val.toFixed(2)}x` : `${(val * 100).toFixed(1)}%`;
  };

  const isRatioVal = title.toLowerCase().includes('ratio') || title.toLowerCase().includes('der');

  return (
    <div className="card" style={{ padding: '1.25rem 1.5rem', marginBottom: 0, flex: '1', minWidth: '190px', position: 'relative', overflow: 'hidden' }}>
      {/* Subtle color accent line at top */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg, ${color}40, ${color}20)` }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
        <h4 style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{title}</h4>
        <div style={{ width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: `${color}15` }}>
          <Icon size={15} color={color} />
        </div>
      </div>
      <div style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
        {formatValue(data.value, isRatioVal)}
      </div>
      <div style={{ fontSize: '0.7rem', fontWeight: 600, color, padding: '0.2rem 0.5rem', backgroundColor: `${color}15`, borderRadius: '999px', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', border: `1px solid ${color}25` }}>
        {data.status}
      </div>
    </div>
  );
};

export default function BIDashboard({ initialParsedData }) {
  const [parsedData, setParsedData] = useState(initialParsedData || []);
  const [language, setLanguage] = useState('id'); // 'id' or 'en'

  const handleNewUpload = (data) => {
    setParsedData(data);
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'id' ? 'en' : 'id');
  };

  if (!parsedData || parsedData.length === 0) {
    return (
      <div className="card" style={{ marginTop: '2rem' }}>
        <h2 className="card-title">Business Intelligence Dashboard</h2>
        <div style={{ backgroundColor: 'var(--accent-bg)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
          <AlertCircle color="var(--accent)" style={{ flexShrink: 0, marginTop: '2px' }} size={20} />
          <div>
            <h4 style={{ margin: '0 0 0.25rem 0', color: 'var(--accent)' }}>Data Kosong</h4>
            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-main)' }}>
              Unggah file data keuangan Anda (CSV/Excel) untuk memulai analisis Business Intelligence.
            </p>
          </div>
        </div>
        <FileUpload onDataParsed={handleNewUpload} />
      </div>
    );
  }

  // Generate Statements silently to calculate ratios
  const statements = generateStatements(parsedData);
  const ratios = calculateRatios(statements);
  const chartData = prepareChartData(parsedData, statements);
  
  // Generate AI Summary
  const aiSummary = generateAISummary(ratios, statements, language);

  return (
    <div style={{ marginTop: '2rem' }}>
      {/* Disclaimer Warning */}
      <div style={{ backgroundColor: 'var(--danger-bg)', border: '1px solid var(--danger-border)', padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)', marginBottom: '2rem', display: 'flex', gap: '0.875rem', alignItems: 'flex-start' }}>
        <ShieldAlert color="var(--danger)" style={{ flexShrink: 0, marginTop: '2px' }} size={20} />
        <div>
          <h4 style={{ margin: '0 0 0.375rem 0', color: 'var(--danger)', fontSize: '0.875rem', fontWeight: 600 }}>{language === 'id' ? 'Disclaimer Akurasi Analisis' : 'Analysis Accuracy Disclaimer'}</h4>
          <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-sub)', lineHeight: 1.65 }}>
            {language === 'id' 
              ? 'Untuk hasil analisis BI yang maksimal dan akurat, pastikan data yang Anda proses adalah data buku kas yang lengkap, atau telah dikompilasi menjadi laporan keuangan terstruktur (3 statement) sebelumnya. Memproses data mentah tunggal (seperti mutasi bank yang tidak mencantumkan kewajiban/modal) dapat mengurangi akurasi metrik Solvabilitas dan Likuiditas.'
              : 'For maximum and accurate BI analysis results, ensure the processed data is a complete cash book or has been previously compiled into structured financial statements. Processing singular raw data (like bank statements lacking liability/equity info) may reduce the accuracy of Solvency and Liquidity metrics.'}
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 className="card-title" style={{ margin: 0 }}>Business Intelligence Dashboard</h2>
        <button className="btn btn-ghost" onClick={toggleLanguage}>
          <Languages size={15} />
          {language === 'id' ? 'Switch to English' : 'Bahasa Indonesia'}
        </button>
      </div>

      {/* AI Executive Summary */}
      <div className="card" style={{ border: '1px solid var(--accent-border)', backgroundColor: 'var(--bg-card)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', backgroundColor: 'var(--accent)' }}></div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
          <div style={{ backgroundColor: 'var(--accent-bg)', padding: '0.75rem', borderRadius: '50%' }}>
            <Sparkles color="var(--accent)" size={24} />
          </div>
          <div>
            <h3 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              AI Executive Summary
              <span className="badge" style={{ backgroundColor: 'var(--accent-bg)', color: 'var(--accent)', fontSize: '0.7rem' }}>BETA</span>
            </h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>{aiSummary.greeting}</p>
            
            <p style={{ fontWeight: 500, marginBottom: '1.25rem', lineHeight: 1.6 }}>
              {aiSummary.condition}
            </p>

            <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '1rem' }}>
              {language === 'id' ? 'Rekomendasi Strategis:' : 'Strategic Recommendations:'}
            </h4>
            <ul style={{ margin: 0, paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {aiSummary.recommendations.map((rec, idx) => (
                <li key={idx} style={{ lineHeight: 1.5 }}>
                  <strong>{rec.split(':')[0]}:</strong> {rec.split(':')[1]}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Ratios Scorecards */}
      <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem', marginTop: '2rem' }}>Key Performance Indicators</h3>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
        <ScoreCard title={ratios.liquidity.currentRatio.label} data={ratios.liquidity.currentRatio} />
        <ScoreCard title={ratios.profitability.netProfitMargin.label} data={ratios.profitability.netProfitMargin} />
        <ScoreCard title={ratios.solvency.der.label} data={ratios.solvency.der} />
        <ScoreCard title={ratios.efficiency.operatingRatio.label} data={ratios.efficiency.operatingRatio} />
      </div>

      {/* Visualizations */}
      <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>Visualisasi Finansial</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        
        {/* Trend Arus Kas */}
        <div className="card" style={{ marginBottom: 0 }}>
          <h4 style={{ margin: '0 0 1.5rem 0' }}>Tren Arus Kas (Pemasukan vs Pengeluaran)</h4>
          <div style={{ height: '300px', width: '100%' }}>
            {chartData.cashFlowTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData.cashFlowTrend} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="var(--text-muted)" />
                  <YAxis tick={{ fontSize: 12 }} stroke="var(--text-muted)" 
                         tickFormatter={(value) => `Rp${(value/1000000).toFixed(0)}M`} />
                  <RechartsTooltip formatter={(value) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value)} />
                  <Legend />
                  <Line type="monotone" name="Pemasukan" dataKey="masuk" stroke="var(--success)" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" name="Pengeluaran" dataKey="keluar" stroke="var(--danger)" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                Belum ada data arus kas
              </div>
            )}
          </div>
        </div>

        {/* Komposisi Biaya */}
        <div className="card" style={{ marginBottom: 0 }}>
          <h4 style={{ margin: '0 0 1.5rem 0' }}>Komposisi Pengeluaran</h4>
          <div style={{ height: '300px', width: '100%' }}>
            {chartData.expenseComposition.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData.expenseComposition}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {chartData.expenseComposition.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(value) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value)} />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                Tidak ada pengeluaran spesifik terdeteksi
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Upload Baru di BI */}
      <div className="card" style={{ border: '1px dashed var(--border)', backgroundColor: 'transparent' }}>
        <h4 style={{ margin: '0 0 1rem 0', textAlign: 'center' }}>Simulasikan Analisis Baru</h4>
        <FileUpload onDataParsed={handleNewUpload} />
      </div>

    </div>
  );
}
