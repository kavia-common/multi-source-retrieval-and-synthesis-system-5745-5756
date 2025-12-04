import React, { useCallback, useState } from 'react';
import { queryRAG } from '../api';

// PUBLIC_INTERFACE
export default function QueryConsolePage() {
  /** Query console page for RAG queries and showing citations. */
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const onSubmit = useCallback(async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    setResult(null);
    let filtersObj = undefined;
    if (filters.trim()) {
      try {
        filtersObj = JSON.parse(filters);
      } catch (e) {
        setError('Filters must be valid JSON');
        setBusy(false);
        return;
      }
    }
    try {
      const resp = await queryRAG({ query, filters: filtersObj });
      // Expect { answer: string, citations: [{ source, uri, snippet? }] }
      setResult(resp);
    } catch (e) {
      setError(e.message || 'Query failed');
    } finally {
      setBusy(false);
    }
  }, [query, filters]);

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <h1 style={{ margin: 0, color: '#111827' }}>Query</h1>
      <p style={{ marginTop: 0, color: '#4B5563' }}>
        Ask questions and view synthesized answers with citations.
      </p>

      <form
        onSubmit={onSubmit}
        style={{
          display: 'grid',
          gap: 12,
          background: '#ffffff',
          border: '1px solid #E5E7EB',
          borderRadius: 12,
          padding: 16,
        }}
      >
        <label style={{ display: 'grid', gap: 6 }}>
          <span style={{ fontWeight: 600, color: '#111827' }}>Query</span>
          <input
            type="text"
            placeholder="Type your question..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            required
            style={{
              padding: '12px 14px',
              borderRadius: 8,
              border: '1px solid #D1D5DB',
              outline: 'none',
            }}
          />
        </label>

        <label style={{ display: 'grid', gap: 6 }}>
          <span style={{ fontWeight: 600, color: '#111827' }}>
            Optional Filters (JSON)
          </span>
          <textarea
            placeholder='e.g. {"sourceType":"pdf"}'
            rows={4}
            value={filters}
            onChange={(e) => setFilters(e.target.value)}
            style={{
              padding: '12px 14px',
              borderRadius: 8,
              border: '1px solid #D1D5DB',
              outline: 'none',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
              fontSize: 13,
            }}
          />
        </label>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="submit"
            disabled={!query.trim() || busy}
            style={{
              padding: '10px 14px',
              background: '#2563EB',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              cursor: !query.trim() || busy ? 'not-allowed' : 'pointer',
              opacity: !query.trim() || busy ? 0.6 : 1,
            }}
          >
            {busy ? 'Running...' : 'Run Query'}
          </button>
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setFilters('');
              setResult(null);
              setError('');
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
      </form>

      {result && (
        <section
          style={{
            display: 'grid',
            gap: 12,
            background: '#ffffff',
            border: '1px solid #E5E7EB',
            borderRadius: 12,
            padding: 16,
          }}
        >
          <div>
            <h3 style={{ marginTop: 0, color: '#111827' }}>Answer</h3>
            <div
              style={{
                background: '#F9FAFB',
                border: '1px solid #E5E7EB',
                borderRadius: 8,
                padding: 12,
                color: '#111827',
              }}
            >
              {result.answer || 'No answer returned'}
            </div>
          </div>

          <div>
            <h3 style={{ marginTop: 0, color: '#111827' }}>Citations</h3>
            {Array.isArray(result.citations) && result.citations.length > 0 ? (
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {result.citations.map((c, idx) => (
                  <li key={idx} style={{ marginBottom: 8 }}>
                    <div style={{ color: '#111827' }}>
                      <strong>{c.source || 'Unknown Source'}</strong>
                    </div>
                    {c.uri && (
                      <a
                        href={c.uri}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: '#2563EB', textDecoration: 'underline' }}
                      >
                        {c.uri}
                      </a>
                    )}
                    {c.snippet && (
                      <div
                        style={{
                          marginTop: 6,
                          background: '#F3F4F6',
                          padding: 8,
                          borderRadius: 6,
                          fontSize: 13,
                          color: '#111827',
                        }}
                      >
                        {c.snippet}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <div style={{ color: '#6B7280' }}>No citations returned</div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
