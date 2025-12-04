import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { uploadSourceFile, getIngestStatus } from '../api';

const ACCEPTED = [
  '.pdf',
  '.docx',
  '.txt',
  '.csv',
  '.xlsx',
];

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024, sizes = ['B', 'KB', 'MB', 'GB'], i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

// PUBLIC_INTERFACE
export default function UploadWidget({ onUploadComplete }) {
  /** Upload widget for PDF/DOCX/TXT/CSV/XLSX with drag/drop, progress, and status polling. */
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState(null); // { state, message, jobId }

  const acceptAttr = useMemo(() => ACCEPTED.join(','), []);

  const onFilePicked = useCallback((f) => {
    if (!f) return;
    const ext = '.' + f.name.split('.').pop().toLowerCase();
    if (!ACCEPTED.includes(ext)) {
      setError(`Unsupported file type: ${ext}. Allowed: ${ACCEPTED.join(', ')}`);
      return;
    }
    setError('');
    setFile(f);
  }, []);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    if (busy) return;
    const f = e.dataTransfer.files?.[0];
    onFilePicked(f);
  }, [busy, onFilePicked]);

  const onUpload = useCallback(async () => {
    if (!file) return;
    setBusy(true);
    setError('');
    setStatus({ state: 'uploading', message: 'Uploading...' });
    try {
      const resp = await uploadSourceFile(file);
      // Expect backend to return { jobId, message? }
      const jobId = resp?.jobId;
      if (jobId) {
        setStatus({ state: 'queued', message: 'Queued for processing', jobId });
      } else {
        setStatus({ state: 'completed', message: resp?.message || 'Upload completed' });
        onUploadComplete && onUploadComplete(resp);
        setFile(null);
      }
    } catch (e) {
      setError(e.message || 'Upload failed');
      setStatus(null);
    } finally {
      setBusy(false);
    }
  }, [file, onUploadComplete]);

  useEffect(() => {
    let timer;
    const poll = async () => {
      if (!status?.jobId) return;
      try {
        const s = await getIngestStatus(status.jobId);
        // Expect { state: 'queued'|'processing'|'completed'|'failed', progress?, message? }
        setStatus((prev) => ({ ...prev, ...s }));
        if (s.state === 'completed') {
          onUploadComplete && onUploadComplete(s);
          setFile(null);
        } else if (s.state === 'failed') {
          setError(s.message || 'Ingestion failed');
        } else {
          timer = setTimeout(poll, 1500);
        }
      } catch (e) {
        setError(e.message || 'Status polling failed');
      }
    };
    if (status?.jobId && (status.state === 'queued' || status.state === 'processing')) {
      timer = setTimeout(poll, 1000);
    }
    return () => timer && clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status?.jobId, status?.state]);

  return (
    <div
      style={{
        border: '1px dashed #2563EB55',
        background: '#ffffff',
        borderRadius: 12,
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
    >
      <div style={{ fontWeight: 600 }}>Upload a document</div>
      <div style={{ color: '#374151', fontSize: 14 }}>
        Accepted types: {ACCEPTED.join(', ')}
      </div>

      <label
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          width: 'fit-content',
          padding: '10px 14px',
          background: '#2563EB',
          color: '#fff',
          borderRadius: 8,
          cursor: 'pointer',
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
        }}
      >
        Choose File
        <input
          type="file"
          accept={acceptAttr}
          onChange={(e) => onFilePicked(e.target.files?.[0])}
          style={{ display: 'none' }}
        />
      </label>

      {file && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '8px 12px',
            borderRadius: 8,
            background: '#F3F4F6',
            color: '#111827',
            fontSize: 14,
          }}
        >
          <span title={file.name} style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%' }}>
            {file.name}
          </span>
          <span>{formatBytes(file.size)}</span>
        </div>
      )}

      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={onUpload}
          disabled={!file || busy}
          style={{
            padding: '10px 14px',
            background: '#2563EB',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            cursor: !file || busy ? 'not-allowed' : 'pointer',
            opacity: !file || busy ? 0.6 : 1,
          }}
        >
          {busy ? 'Uploading...' : 'Upload'}
        </button>
        <button
          onClick={() => {
            setFile(null);
            setError('');
            setStatus(null);
          }}
          disabled={busy}
          style={{
            padding: '10px 14px',
            background: '#F59E0B',
            color: '#111827',
            border: 'none',
            borderRadius: 8,
            cursor: busy ? 'not-allowed' : 'pointer',
            opacity: busy ? 0.6 : 1,
          }}
        >
          Reset
        </button>
      </div>

      {status && (
        <div
          role="status"
          style={{
            background: '#EFF6FF',
            border: '1px solid #BFDBFE',
            color: '#1E3A8A',
            padding: '10px 12px',
            borderRadius: 8,
            fontSize: 14,
          }}
        >
          <strong>Status:</strong> {status.state} {status.progress != null ? `(${status.progress}%)` : ''} {status.message ? `- ${status.message}` : ''}
          {status.jobId ? ` • Job: ${status.jobId}` : ''}
        </div>
      )}

      {error && (
        <div
          role="alert"
          style={{
            background: '#FEE2E2',
            border: '1px solid #FCA5A5',
            color: '#991B1B',
            padding: '10px 12px',
            borderRadius: 8,
            fontSize: 14,
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
}
