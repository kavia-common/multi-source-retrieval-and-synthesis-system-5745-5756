const API_BASE =
  (typeof process !== 'undefined' &&
    process.env &&
    process.env.REACT_APP_BACKEND_URL) ||
  'http://localhost:3001';

async function handleResponse(res) {
  const contentType = res.headers.get('content-type') || '';
  let data = null;
  if (contentType.includes('application/json')) {
    data = await res.json().catch(() => ({}));
  } else {
    const text = await res.text().catch(() => '');
    data = { message: text };
  }
  if (!res.ok) {
    const message = data?.message || data?.error || res.statusText || 'Request failed';
    const error = new Error(message);
    error.status = res.status;
    error.data = data;
    throw error;
  }
  return data;
}

// PUBLIC_INTERFACE
export async function uploadSourceFile(file, options = {}) {
  /** Upload a source file (PDF/DOCX/TXT/CSV/XLSX) to ingestion endpoint.
   * Returns a JSON payload which may include a jobId for polling.
   */
  const form = new FormData();
  form.append('file', file);
  if (options?.metadata) {
    form.append('metadata', JSON.stringify(options.metadata));
  }
  // Endpoint path assumption: /ingest/upload
  const res = await fetch(`${API_BASE}/ingest/upload`, {
    method: 'POST',
    body: form,
  });
  return handleResponse(res);
}

// PUBLIC_INTERFACE
export async function getIngestStatus(jobId) {
  /** Poll job status by jobId, expected endpoint: /ingest/status/:jobId */
  const res = await fetch(`${API_BASE}/ingest/status/${encodeURIComponent(jobId)}`, {
    method: 'GET',
  });
  return handleResponse(res);
}

// PUBLIC_INTERFACE
export async function queryRAG(payload) {
  /** Call /query with body { query: string, filters?: object } and return answer and citations */
  const res = await fetch(`${API_BASE}/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

// PUBLIC_INTERFACE
export { API_BASE };
