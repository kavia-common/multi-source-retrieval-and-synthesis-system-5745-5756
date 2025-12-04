import React, { useState } from 'react';
import UploadWidget from '../components/UploadWidget';

// PUBLIC_INTERFACE
export default function SourcesPage() {
  /** Sources management page - upload and see last operation result. */
  const [lastResult, setLastResult] = useState(null);

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <h1 style={{ margin: 0, color: '#111827' }}>Sources</h1>
      <p style={{ marginTop: 0, color: '#4B5563' }}>
        Upload documents to be ingested into the knowledge base.
      </p>

      <UploadWidget onUploadComplete={(data) => setLastResult(data)} />

      {lastResult && (
        <section
          style={{
            marginTop: 8,
            background: '#ffffff',
            border: '1px solid #E5E7EB',
            borderRadius: 12,
            padding: 16,
          }}
        >
          <h3 style={{ marginTop: 0, color: '#111827' }}>Last Upload Result</h3>
          <pre
            style={{
              margin: 0,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              background: '#F9FAFB',
              padding: 12,
              borderRadius: 8,
              fontSize: 12,
              color: '#111827',
            }}
          >
            {JSON.stringify(lastResult, null, 2)}
          </pre>
        </section>
      )}
    </div>
  );
}
