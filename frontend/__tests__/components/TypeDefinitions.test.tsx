import type {
  EvidenceStatus,
  AnswerMode,
  EvidenceItem,
  WebSource,
  AnswerResponse,
  SessionInfo,
  UploadResponse,
  ConversationEntry,
  DocumentState,
} from '@/lib/types';

describe('TypeScript Type Definitions', () => {
  it('validates EvidenceItem interface shape', () => {
    const item: EvidenceItem = {
      page_number: 3,
      section: 'Section 7.2',
      quote: 'Either party may terminate.',
      relevance: 'Directly relevant.',
    };
    expect(item.page_number).toBe(3);
    expect(item.section).toBe('Section 7.2');
    expect(item.quote).toBeTruthy();
    expect(item.relevance).toBeTruthy();
  });

  it('validates WebSource interface shape', () => {
    const source: WebSource = {
      title: 'California Labor Code',
      url: 'https://leginfo.legislature.ca.gov',
      snippet: 'Section 16600 voids non-compete clauses.',
      source_type: 'government',
    };
    expect(source.title).toBeTruthy();
    expect(source.url).toContain('https://');
    expect(source.source_type).toBe('government');
  });

  it('validates AnswerResponse with evidence status values', () => {
    const statuses: EvidenceStatus[] = ['SUPPORTED', 'NOT_FOUND', 'PARTIAL'];
    statuses.forEach((status) => {
      expect(['SUPPORTED', 'NOT_FOUND', 'PARTIAL']).toContain(status);
    });
  });

  it('validates AnswerMode union type values', () => {
    const modes: AnswerMode[] = ['document_only', 'document_and_web'];
    expect(modes).toHaveLength(2);
    expect(modes).toContain('document_only');
    expect(modes).toContain('document_and_web');
  });

  it('validates DocumentState defaults', () => {
    const state: DocumentState = {
      documentId: null,
      filename: null,
      totalPages: 0,
      isUploading: false,
    };
    expect(state.documentId).toBeNull();
    expect(state.totalPages).toBe(0);
    expect(state.isUploading).toBe(false);
  });

  it('validates SessionInfo and UploadResponse shapes', () => {
    const session: SessionInfo = { session_id: 'abc-123' };
    const upload: UploadResponse = {
      document_id: 'doc-456',
      filename: 'contract.pdf',
      total_pages: 12,
      status: 'processed',
    };
    expect(session.session_id).toBeTruthy();
    expect(upload.total_pages).toBeGreaterThan(0);
    expect(upload.status).toBe('processed');
  });

  it('validates ConversationEntry with optional response', () => {
    const entry: ConversationEntry = {
      role: 'user',
      content: 'What is my notice period?',
      timestamp: new Date().toISOString(),
    };
    expect(entry.role).toBe('user');
    expect(entry.response).toBeUndefined();
  });
});
