import { useState, useRef } from 'react';
import { UploadCloud, FileType, CheckCircle, AlertCircle, Download, FlaskConical } from 'lucide-react';
import { parseFile } from '../utils/parser';
import {
  downloadPersonalTemplate, downloadUMKMTemplate,
  downloadDemoPersonal, downloadDemoWarung, downloadDemoUMKM,
  generateDemoPersonalFile, generateDemoWarungFile, generateDemoUMKMFile,
} from '../utils/templateGenerator';
import { useApp } from '../context/AppContext';

const DEMO_KEYS = ['personal', 'warung', 'umkm'];
const DEMO_FNS      = { personal: downloadDemoPersonal,    warung: downloadDemoWarung,    umkm: downloadDemoUMKM };
const DEMO_GEN_FNS  = { personal: generateDemoPersonalFile, warung: generateDemoWarungFile, umkm: generateDemoUMKMFile };
const DEMO_DESC     = { personal: 'demo_personal_desc', warung: 'demo_warung_desc', umkm: 'demo_umkm_desc' };
const DEMO_LABELS   = { personal: 'mode_personal', warung: 'mode_warung', umkm: 'mode_business' };

export default function FileUpload({ onDataParsed, openingBalance = 0, onOpeningBalanceChange }) {
  const { t } = useApp();
  const [isDragging, setIsDragging]         = useState(false);
  const [file, setFile]                     = useState(null);
  const [status, setStatus]                 = useState('idle');
  const [errorMessage, setErrorMessage]     = useState('');
  const [processingMessage, setProcessingMessage] = useState('');
  const fileInputRef   = useRef(null);
  const demoDragKeyRef = useRef(null);

  const processFile = async (selectedFile) => {
    if (!selectedFile) return;
    const ext = selectedFile.name.split('.').pop().toLowerCase();
    setFile(selectedFile);
    setStatus('processing');
    setErrorMessage('');
    setProcessingMessage(ext === 'pdf' ? 'Mempersiapkan analisis AI...' : 'Mengekstrak data...');
    try {
      const data = await parseFile(selectedFile, { onProgress: (msg) => setProcessingMessage(msg) });
      setStatus('success');
      onDataParsed(data);
    } catch (error) {
      setStatus('error');
      setErrorMessage(error.message || 'Terjadi kesalahan saat memproses file.');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.length > 0) {
      processFile(e.dataTransfer.files[0]);
    } else if (demoDragKeyRef.current) {
      processFile(DEMO_GEN_FNS[demoDragKeyRef.current]());
    }
    demoDragKeyRef.current = null;
  };

  const loadDemoDirectly = (key) => processFile(DEMO_GEN_FNS[key]());

  const sectionStyle = {
    marginTop: '1rem',
    padding: '1rem 1.125rem',
    background: 'var(--bg-secondary)',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border)',
  };

  return (
    <div className="card">
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 className="card-title">{t('upload_title')}</h2>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          {t('upload_desc')}
        </p>
      </div>

      {/* ── Dropzone ──────────────────────────────────────────────── */}
      <div
        className={`dropzone ${isDragging ? 'active' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => e.target.files?.length > 0 && processFile(e.target.files[0])}
          accept=".csv,.pdf,.xls,.xlsx,application/pdf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
          style={{ display: 'none' }}
        />

        {status === 'idle' && (
          <>
            <UploadCloud className="dropzone-icon" />
            <div>
              <p className="dropzone-text">{t('upload_drop')}</p>
              <p className="dropzone-subtext">{t('upload_formats')}</p>
            </div>
          </>
        )}

        {status === 'processing' && (
          <>
            <div style={{ animation: 'spin 1s linear infinite' }}>
              <UploadCloud className="dropzone-icon" />
            </div>
            <div>
              <p className="dropzone-text">{file?.name}</p>
              <p className="dropzone-subtext">{processingMessage}</p>
            </div>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="dropzone-icon" style={{ color: 'var(--success)' }} />
            <div>
              <p className="dropzone-text" style={{ color: 'var(--success)' }}>✓ {file?.name}</p>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <AlertCircle className="dropzone-icon" style={{ color: 'var(--danger)' }} />
            <div>
              <p className="dropzone-text" style={{ color: 'var(--danger)' }}>
                {errorMessage}
              </p>
            </div>
          </>
        )}
      </div>

      <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        {/* Saldo Awal Kas input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: 220 }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
            Saldo Awal Kas <span style={{ fontWeight: 400, opacity: 0.7 }}>(Opsional)</span>
          </label>
          <div style={{ position: 'relative', flex: 1 }}>
            <span style={{
              position: 'absolute', left: '0.6rem', top: '50%', transform: 'translateY(-50%)',
              fontSize: '0.75rem', color: 'var(--text-muted)', pointerEvents: 'none',
            }}>Rp</span>
            <input
              type="number"
              min="0"
              value={openingBalance || ''}
              placeholder="0"
              onChange={(e) => onOpeningBalanceChange?.(Math.max(0, Number(e.target.value) || 0))}
              style={{
                width: '100%',
                padding: '0.35rem 0.5rem 0.35rem 2rem',
                fontSize: '0.8125rem',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)',
                outline: 'none',
              }}
            />
          </div>
          {openingBalance > 0 && (
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
              {new Intl.NumberFormat('id-ID').format(openingBalance)}
            </span>
          )}
        </div>

        <button className="btn btn-ghost" onClick={() => fileInputRef.current?.click()}>
          <FileType size={15} />
          {t('upload_pick')}
        </button>
      </div>

      {openingBalance > 0 && (
        <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.25rem', opacity: 0.8 }}>
          ✓ Saldo awal akan masuk ke Neraca (Kas) dan Arus Kas — tidak mempengaruhi Laba Rugi.
        </p>
      )}

      {/* ── Template download ─────────────────────────────────────── */}
      <div style={sectionStyle}>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.625rem', fontWeight: 500 }}>
          {t('upload_tpl_hint')}
        </p>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {[
            { label: 'upload_tpl_personal', fn: downloadPersonalTemplate },
            { label: 'upload_tpl_umkm',     fn: downloadUMKMTemplate },
          ].map(({ label, fn }) => (
            <button
              key={label}
              className="btn btn-ghost"
              style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
              onClick={(e) => { e.stopPropagation(); fn(); }}
            >
              <Download size={12} />
              {t(label)}
            </button>
          ))}
        </div>
      </div>

      {/* ── Demo files ────────────────────────────────────────────── */}
      <div style={{ ...sectionStyle, marginTop: '0.625rem' }}>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <FlaskConical size={12} />
          {t('upload_demo_hint')}
        </p>

        {/* Demo cards — draggable to dropzone */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {DEMO_KEYS.map((key) => (
            <div
              key={key}
              draggable
              onDragStart={(e) => {
                demoDragKeyRef.current = key;
                e.dataTransfer.effectAllowed = 'copy';
                e.dataTransfer.setData('text/plain', key);
              }}
              onDragEnd={() => { demoDragKeyRef.current = null; }}
              style={{
                flex: '1 1 160px',
                padding: '0.625rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)',
                background: 'var(--bg-card)',
                cursor: 'grab',
                userSelect: 'none',
              }}
            >
              <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                {t(DEMO_LABELS[key])}
              </div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', lineHeight: 1.45, marginBottom: '0.5rem' }}>
                {t(DEMO_DESC[key])}
              </div>
              <div style={{ display: 'flex', gap: '0.35rem' }}>
                <button
                  className="btn btn-ghost"
                  style={{ fontSize: '0.65rem', padding: '0.25rem 0.5rem', flex: 1 }}
                  onClick={(e) => { e.stopPropagation(); loadDemoDirectly(key); }}
                >
                  ▶ Muat Langsung
                </button>
                <button
                  className="btn btn-ghost"
                  style={{ fontSize: '0.65rem', padding: '0.25rem 0.5rem' }}
                  onClick={(e) => { e.stopPropagation(); DEMO_FNS[key](); }}
                  title="Download file"
                >
                  <Download size={11} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <p style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginTop: '0.5rem', opacity: 0.7 }}>
          Drag kartu demo ke dropzone di atas, atau klik "Muat Langsung"
        </p>
      </div>

      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
