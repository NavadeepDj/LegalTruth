import { api } from '@/lib/api';

describe('API Client Module', () => {
  it('exports all required API methods', () => {
    expect(api.createSession).toBeDefined();
    expect(api.uploadDocument).toBeDefined();
    expect(api.askQuestion).toBeDefined();
    expect(api.explainClause).toBeDefined();
    expect(api.getHistory).toBeDefined();
    expect(api.getDocumentPdfUrl).toBeDefined();
  });

  it('generates correct PDF URL with encoded session ID', () => {
    const url = api.getDocumentPdfUrl('doc-123', 'session-456');
    expect(url).toContain('/api/documents/doc-123/pdf');
    expect(url).toContain('session_id=session-456');
  });

  it('encodes special characters in session ID', () => {
    const url = api.getDocumentPdfUrl('doc-1', 'session with spaces & symbols');
    expect(url).toContain('session_id=session%20with%20spaces%20%26%20symbols');
  });
});
