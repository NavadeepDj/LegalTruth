import {
  AnswerMode,
  AnswerResponse,
  ConversationEntry,
  SessionInfo,
  UploadResponse,
} from './types';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    let errorDetail = 'API request failed';
    try {
      const errorJson = await response.json();
      errorDetail = errorJson.detail || errorDetail;
    } catch {
      errorDetail = response.statusText;
    }
    throw new ApiError(response.status, errorDetail);
  }

  return response.json();
}

export const api = {
  async createSession(): Promise<SessionInfo> {
    return request<SessionInfo>('/api/sessions', {
      method: 'POST',
    });
  },

  async uploadDocument(file: File, sessionId: string): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('session_id', sessionId);

    const response = await fetch(`${API_BASE_URL}/api/documents/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      let errorDetail = 'Upload failed';
      try {
        const errorJson = await response.json();
        errorDetail = errorJson.detail || errorDetail;
      } catch {
        errorDetail = response.statusText;
      }
      throw new ApiError(response.status, errorDetail);
    }

    return response.json();
  },

  getDocumentPdfUrl(documentId: string, sessionId: string): string {
    return `${API_BASE_URL}/api/documents/${documentId}/pdf?session_id=${encodeURIComponent(
      sessionId
    )}`;
  },

  async askQuestion(
    question: string,
    mode: AnswerMode,
    sessionId: string,
    documentId: string
  ): Promise<AnswerResponse> {
    return request<AnswerResponse>('/api/chat/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question,
        mode,
        session_id: sessionId,
        document_id: documentId,
      }),
    });
  },

  async explainClause(
    clauseText: string,
    pageNumber: number,
    sessionId: string,
    documentId: string
  ): Promise<AnswerResponse> {
    return request<AnswerResponse>('/api/chat/clause', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clause_text: clauseText,
        page_number: pageNumber,
        session_id: sessionId,
        document_id: documentId,
      }),
    });
  },

  async getHistory(sessionId: string): Promise<{ history: ConversationEntry[] }> {
    return request<{ history: ConversationEntry[] }>(
      `/api/chat/history?session_id=${encodeURIComponent(sessionId)}`
    );
  },
};
