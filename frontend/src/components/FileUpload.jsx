import { useState, useRef } from 'react';
import { UploadCloud, FileType, CheckCircle, AlertCircle, Download } from 'lucide-react';
import { parseFile } from '../utils/parser';
import { downloadPersonalTemplate, downloadUMKMTemplate } from '../utils/templateGenerator';

export default function FileUpload({ onDataParsed }) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle'); // idle, processing, success, error
  const [errorMessage, setErrorMessage] = useState('');
  const [processingMessage, setProcessingMessage] = useState('Mengekstrak data...');
const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processFile = async (selectedFile) => {
    if (!selectedFile) return;

    const ext = selectedFile.name.split('.').pop().toLowerCase();
    const isPdf = ext === 'pdf';

    setFile(selectedFile);
    setStatus('processing');
    setErrorMessage('');
    setProcessingMessage(
      isPdf
        ? 'Mempersiapkan analisis AI — mohon tunggu...'
        : 'Mengekstrak data menggunakan parser...'
    );

    try {
      const data = await parseFile(selectedFile, {
        onProgress: (msg) => setProcessingMessage(msg),
      });
      setStatus('success');
      onDataParsed(data);
    } catch (error) {
      console.error(error);
      setStatus('error');
      setErrorMessage(error.message || 'Terjadi kesalahan saat memproses file.');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="card">
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 className="card-title">Upload Data Keuangan</h2>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          Unggah buku kas, mutasi bank, atau laporan keuangan dalam format CSV, Excel, atau PDF.
        </p>
      </div>

      <div
        className={`dropzone ${isDragging ? 'active' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".csv, .pdf, application/pdf, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
          style={{ display: 'none' }}
        />

        {status === 'idle' && (
          <>
            <UploadCloud className="dropzone-icon" />
            <div>
              <p className="dropzone-text">Klik atau Drag &amp; Drop file ke sini</p>
              <p className="dropzone-subtext">
                Mendukung CSV, Excel (.xls/.xlsx), dan PDF laporan keuangan (Max 10MB)
              </p>
            </div>
          </>
        )}

        {status === 'processing' && (
          <>
            <div style={{ animation: 'spin 1s linear infinite' }}>
              <UploadCloud className="dropzone-icon" />
            </div>
            <div>
              <p className="dropzone-text">Sedang memproses {file?.name}...</p>
              <p className="dropzone-subtext">{processingMessage}</p>
            </div>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="dropzone-icon" style={{ color: 'var(--success)' }} />
            <div>
              <p className="dropzone-text" style={{ color: 'var(--success)' }}>
                File berhasil diproses!
              </p>
              <p className="dropzone-subtext">{file?.name}</p>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <AlertCircle className="dropzone-icon" style={{ color: 'var(--danger)' }} />
            <div>
              <p className="dropzone-text" style={{ color: 'var(--danger)' }}>
                Gagal memproses file
              </p>
              <p className="dropzone-subtext" style={{ whiteSpace: 'pre-line' }}>
                {errorMessage}
              </p>
            </div>
          </>
        )}
      </div>

      <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn btn-ghost" onClick={() => fileInputRef.current?.click()}>
          <FileType size={16} />
          Pilih File Manual
        </button>
      </div>

      {/* Template download buttons */}
      <div style={{
        marginTop: '1.25rem',
        padding: '1rem',
        background: 'var(--bg-secondary)',
        borderRadius: '8px',
        border: '1px solid var(--border)',
      }}>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem', fontWeight: 500 }}>
          Butuh template? Download dan isi lalu upload ke sini:
        </p>
        <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap' }}>
          <button
            className="btn btn-ghost"
            style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem' }}
            onClick={(e) => { e.stopPropagation(); downloadPersonalTemplate(); }}
          >
            <Download size={13} />
            Template Personal
          </button>
          <button
            className="btn btn-ghost"
            style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem' }}
            onClick={(e) => { e.stopPropagation(); downloadUMKMTemplate(); }}
          >
            <Download size={13} />
            Template UMKM
          </button>
        </div>
      </div>

<style>{`
        @keyframes spin {
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
