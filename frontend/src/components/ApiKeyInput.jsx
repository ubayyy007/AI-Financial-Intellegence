import { useState, useEffect } from 'react';
import { Key, Eye, EyeOff, Check, X, ChevronDown, ChevronUp } from 'lucide-react';
import { getStoredApiKey, saveApiKey } from '../utils/pdfParser';

export default function ApiKeyInput({ onKeyChange }) {
  const [draft, setDraft] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const storedKey = getStoredApiKey();
  const hasKey = !!storedKey;

  useEffect(() => {
    if (storedKey) setDraft(storedKey);
  }, []);

  const handleSave = () => {
    if (!draft.trim()) return;
    saveApiKey(draft.trim());
    setSaved(true);
    onKeyChange?.();
    setTimeout(() => setSaved(false), 2000);
  };

  const handleClear = () => {
    setDraft('');
    saveApiKey('');
    onKeyChange?.();
  };

  return (
    <div
      style={{
        marginTop: '1rem',
        borderTop: '1px solid var(--border-light)',
        paddingTop: '1rem',
      }}
    >
      {/* Toggle header */}
      <button
        onClick={() => setExpanded((p) => !p)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--text-muted)',
          fontSize: '0.8rem',
          padding: '0.2rem 0',
          width: '100%',
          textAlign: 'left',
        }}
      >
        <Key size={13} />
        <span>Pengaturan API untuk membaca PDF</span>
        <span
          style={{
            marginLeft: 'auto',
            marginRight: '0.25rem',
            fontSize: '0.68rem',
            fontWeight: 600,
            padding: '0.15rem 0.5rem',
            borderRadius: '999px',
            backgroundColor: hasKey
              ? 'rgba(52,211,153,0.12)'
              : 'rgba(248,113,113,0.12)',
            color: hasKey ? 'var(--success)' : 'var(--danger)',
            border: `1px solid ${hasKey ? 'var(--success)' : 'var(--danger)'}28`,
          }}
        >
          {hasKey ? 'API key aktif' : 'Belum diatur'}
        </span>
        {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
      </button>

      {/* Expanded form */}
      {expanded && (
        <div
          style={{
            marginTop: '0.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
          }}
        >
          <p
            style={{
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              margin: 0,
              lineHeight: 1.65,
            }}
          >
            API key Google Gemini diperlukan untuk memahami isi dokumen PDF.
            Gratis hingga 1.500 request/hari — tidak perlu kartu kredit.
            Key disimpan hanya di browser Anda (localStorage) dan dikirim langsung ke server Google.
          </p>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {/* Input wrapper */}
            <div style={{ position: 'relative', flex: 1 }}>
              <input
                type={showKey ? 'text' : 'password'}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="AIzaSy..."
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '0.5rem 2.25rem 0.5rem 0.75rem',
                  borderRadius: '6px',
                  border: '1px solid var(--border)',
                  background: 'var(--bg-card)',
                  color: 'var(--text-main)',
                  fontSize: '0.8rem',
                  fontFamily: 'monospace',
                  outline: 'none',
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              />
              <button
                onClick={() => setShowKey((p) => !p)}
                style={{
                  position: 'absolute',
                  right: '0.5rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0.15rem',
                }}
                tabIndex={-1}
              >
                {showKey ? <EyeOff size={13} /> : <Eye size={13} />}
              </button>
            </div>

            <button
              className="btn btn-primary"
              onClick={handleSave}
              disabled={!draft.trim()}
              style={{ padding: '0.5rem 0.875rem', fontSize: '0.8rem', flexShrink: 0 }}
            >
              {saved ? <Check size={13} /> : 'Simpan'}
              {saved ? '' : ''}
            </button>

            {hasKey && (
              <button
                className="btn btn-ghost"
                onClick={handleClear}
                title="Hapus API key"
                style={{ padding: '0.5rem', flexShrink: 0 }}
              >
                <X size={13} />
              </button>
            )}
          </div>

          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: 0 }}>
            Dapatkan API key gratis di{' '}
            <span style={{ color: 'var(--primary)' }}>aistudio.google.com</span>
            {' '}→ klik <strong>Get API key</strong>. Hanya berlaku untuk file PDF — CSV/Excel tidak perlu key.
          </p>
        </div>
      )}
    </div>
  );
}
