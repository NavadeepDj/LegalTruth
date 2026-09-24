export type EvidenceStatus = 'SUPPORTED' | 'NOT_FOUND' | 'PARTIAL';
export type AnswerMode = 'document_only' | 'document_and_web';

export interface EvidenceItem {
  page_number: number;
  section: string;
  quote: string;
  relevance: string;
}

export interface WebSource {
  title: string;
  url: string;
  snippet: string;
  source_type: 'government' | 'institutional' | 'web';
}

export interface AnswerResponse {
  answer: string;
  evidence_status: EvidenceStatus;
  evidence: EvidenceItem[];
  reasoning: string;
  web_sources: WebSource[];
  source_boundary: 'DOCUMENT' | 'EXTERNAL' | 'BOTH' | '';
  why_cant_answer: string;
  action_guidance: string[];
  disclaimer: string;
}

export interface SessionInfo {
  session_id: string;
}

export interface UploadResponse {
  document_id: string;
  filename: string;
  total_pages: number;
  status: string;
}

export interface ConversationEntry {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  response?: AnswerResponse;
}

export interface DocumentState {
  documentId: string | null;
  filename: string | null;
  totalPages: number;
  isUploading: boolean;
}
