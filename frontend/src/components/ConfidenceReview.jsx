import { AlertTriangle, CheckCircle, RefreshCw, ArrowRight, Bot, Cpu, PlusCircle, Layers } from 'lucide-react';
import { useApp } from '../context/AppContext';

const formatCurrency = (amount) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

const LEVEL_CONFIG = {
  high:   { color: '#22c55e', bg: 'rgba(34,197,94,0.1)',   border: 'rgba(34,197,94,0.3)',   tk: 'cr_confidence_high', Icon: CheckCircle },
  medium: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.3)',  tk: 'cr_confidence_med',  Icon: AlertTriangle },
  low:    { color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.3)',   tk: 'cr_confidence_low',  Icon: AlertTriangle },
};

export default function ConfidenceReview({ result, onConfirm, onMerge, onReset, hasPreviousData }) {
  const { t } = useApp();
  const { transactions, confidence, meta } = result;
  const sheetsRead = meta?.sheetsRead ?? [];
  const { score, level, method, warnings, flaggedIds } = confidence;
  const cfg = LEVEL_CONFIG[level] || LEVEL_CONFIG.medium;
  const flaggedSet = new Set(flaggedIds);
  const flaggedCount = flaggedIds.length;
  const preview = transactions.slice(0, 80);

  return (
    <div className="card">
      {/* ── Header ────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
        <div>
          <h2 className="card-title">{t('cr_title')}</h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            {t('cr_sub')}
          </p>
        </div>
        <span style={{
          display: 'flex', alignItems: 'center', gap: '0.35rem',
          fontSize: '0.75rem', fontWeight: 500,
          padding: '0.25rem 0.625rem', borderRadius: '20px',
          background: 'var(--bg-secondary)', border: '1px solid var(--border)',
          color: 'var(--text-muted)',
        }}>
          {method === 'ai' ? <Bot size={12} /> : <Cpu size={12} />}
          {method === 'ai' ? 'Gemini AI' : 'Rule-Based'}
        </span>
      </div>

      {/* ── Score Banner ──────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '1.25rem',
        padding: '1rem 1.25rem', borderRadius: '10px',
        background: cfg.bg, border: `1px solid ${cfg.border}`,
        marginBottom: warnings.length > 0 ? '1rem' : '1.25rem',
      }}>
        {/* Circle score */}
        <div style={{
          width: 64, height: 64, borderRadius: '50%', flexShrink: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          background: `conic-gradient(${cfg.color} ${score * 3.6}deg, var(--bg-card) 0deg)`,
          boxShadow: `0 0 0 3px var(--bg-card), 0 0 0 4px ${cfg.color}33`,
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%',
            background: 'var(--bg-card)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: '1rem', fontWeight: 700, color: cfg.color, lineHeight: 1 }}>{score}</span>
            <span style={{ fontSize: '0.5rem', color: 'var(--text-muted)', lineHeight: 1 }}>/100</span>
          </div>
        </div>

        {/* Stats */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
            <cfg.Icon size={16} color={cfg.color} />
            <span style={{ fontSize: '1rem', fontWeight: 700, color: cfg.color }}>
              {t(cfg.tk)}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{transactions.length}</span> {t('cr_tx_extracted')}
            </span>
            {flaggedCount > 0 && (
              <span style={{ fontSize: '0.8125rem', color: '#f59e0b' }}>
                <span style={{ fontWeight: 600 }}>{flaggedCount}</span> {t('cr_need_verify')}
              </span>
            )}
            {flaggedCount === 0 && (
              <span style={{ fontSize: '0.8125rem', color: '#22c55e' }}>{t('cr_all_valid')}</span>
            )}
          </div>
        </div>
      </div>

      {/* ── Sheet Indicator ───────────────────────────────────────── */}
      {sheetsRead.length > 0 && (
        <div style={{
          padding: '0.75rem 1rem',
          background: 'rgba(99,102,241,0.07)',
          border: '1px solid rgba(99,102,241,0.2)',
          borderRadius: '8px',
          marginBottom: '1rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem', color: '#818cf8', fontWeight: 600, fontSize: '0.8125rem' }}>
            <Layers size={14} />
            {sheetsRead.length} {t('cr_sheets_merged')}
          </div>
          <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
            {sheetsRead.map(({ name, count }) => (
              <span key={name} style={{
                fontSize: '0.72rem', fontWeight: 500,
                padding: '0.2rem 0.6rem', borderRadius: '999px',
                background: 'rgba(99,102,241,0.12)',
                border: '1px solid rgba(99,102,241,0.25)',
                color: '#a5b4fc',
                display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
              }}>
                {name}
                {count !== null && (
                  <span style={{ opacity: 0.65 }}>· {count} baris</span>
                )}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── Warnings ──────────────────────────────────────────────── */}
      {warnings.length > 0 && (
        <div style={{
          padding: '0.75rem 1rem',
          background: 'rgba(245,158,11,0.07)',
          border: '1px solid rgba(245,158,11,0.25)',
          borderRadius: '8px',
          marginBottom: '1.25rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem', color: '#f59e0b', fontWeight: 600, fontSize: '0.8125rem' }}>
            <AlertTriangle size={14} />
            {t('cr_warnings')} ({warnings.length})
          </div>
          <ul style={{ margin: 0, paddingLeft: '1.1rem', listStyle: 'disc' }}>
            {warnings.map((w, i) => (
              <li key={i} style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Transaction Preview Table ─────────────────────────────── */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.625rem' }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            {t('cr_preview')}
          </span>
          {transactions.length > 80 && (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {t('cr_showing')} 80 {t('cr_of')} {transactions.length}
            </span>
          )}
        </div>
        <div className="table-container" style={{ maxHeight: '360px', overflowY: 'auto' }}>
          <table>
            <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
              <tr>
                <th style={{ width: 24 }}></th>
                <th>{t('cr_col_date')}</th>
                <th>{t('cr_col_desc')}</th>
                <th>{t('cr_col_cat')}</th>
                <th>{t('cr_col_amount')}</th>
                <th>{t('cr_col_type')}</th>
              </tr>
            </thead>
            <tbody>
              {preview.map((row) => {
                const isFlagged = flaggedSet.has(row.id);
                return (
                  <tr key={row.id} style={isFlagged ? { background: 'rgba(245,158,11,0.08)' } : {}}>
                    <td style={{ textAlign: 'center', padding: '0 0.25rem' }}>
                      {isFlagged && <AlertTriangle size={12} color="#f59e0b" />}
                    </td>
                    <td style={{ whiteSpace: 'nowrap', color: row.date === 'N/A' ? '#f59e0b' : undefined }}>
                      {row.date}
                    </td>
                    <td>{row.description}</td>
                    <td>{row.category}</td>
                    <td style={{ fontWeight: 500 }}>{formatCurrency(row.amount)}</td>
                    <td>
                      <span className={`badge ${row.type.toLowerCase() === 'kredit' ? 'badge-kredit' : 'badge-debit'}`}>
                        {row.type}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Actions ───────────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        <button className="btn btn-ghost" onClick={onReset} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <RefreshCw size={14} />
          {t('cr_btn_reset')}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap' }}>
          {level === 'low' && (
            <span style={{ fontSize: '0.75rem', color: '#ef4444' }}>
              {t('cr_low_warning')}
            </span>
          )}
          {hasPreviousData && onMerge && (
            <button
              className="btn btn-ghost"
              onClick={onMerge}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', borderColor: '#818cf8', color: '#818cf8' }}
            >
              <PlusCircle size={14} />
              {t('cr_btn_merge')}
            </button>
          )}
          <button
            className="btn btn-primary"
            onClick={onConfirm}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            {hasPreviousData ? t('cr_btn_replace') : t('cr_btn_confirm')}
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
