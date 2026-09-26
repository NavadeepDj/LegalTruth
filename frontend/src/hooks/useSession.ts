'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { DocumentState } from '@/lib/types';

const SESSION_STORAGE_KEY = 'legaltruth_session_id';

export function useSession() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [document, setDocument] = useState<DocumentState>({
    documentId: null,
    filename: null,
    totalPages: 0,
    isUploading: false,
  });
  const [error, setError] = useState<string | null>(null);

  const initSession = useCallback(async () => {
    try {
      setIsInitializing(true);
      setError(null);

      // Check session storage first
      const cachedSession = typeof window !== 'undefined' ? sessionStorage.getItem(SESSION_STORAGE_KEY) : null;
      if (cachedSession) {
        setSessionId(cachedSession);
        setIsInitializing(false);
        return cachedSession;
      }

      const res = await api.createSession();
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(SESSION_STORAGE_KEY, res.session_id);
      }
      setSessionId(res.session_id);
      setIsInitializing(false);
      return res.session_id;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to initialize session';
      setError(msg);
      setIsInitializing(false);
      return null;
    }
  }, []);

  useEffect(() => {
    let active = true;
    const run = async () => {
      await Promise.resolve();
      if (active) {
        await initSession();
      }
    };
    run();
    return () => {
      active = false;
    };
  }, [initSession]);

  const upload = useCallback(
    async (file: File) => {
      let activeSessionId = sessionId;
      if (!activeSessionId) {
        activeSessionId = await initSession();
      }

      if (!activeSessionId) {
        setError('No active session. Please refresh.');
        return null;
      }

      setDocument((prev) => ({ ...prev, isUploading: true }));
      setError(null);

      try {
        const uploadRes = await api.uploadDocument(file, activeSessionId);
        const docState: DocumentState = {
          documentId: uploadRes.document_id,
          filename: uploadRes.filename,
          totalPages: uploadRes.total_pages,
          isUploading: false,
        };
        setDocument(docState);
        return docState;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to upload document';
        setError(msg);
        setDocument((prev) => ({ ...prev, isUploading: false }));
        return null;
      }
    },
    [sessionId, initSession]
  );

  const resetSession = useCallback(async () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
    }
    setDocument({
      documentId: null,
      filename: null,
      totalPages: 0,
      isUploading: false,
    });
    setError(null);
    return initSession();
  }, [initSession]);

  const pdfUrl =
    sessionId && document.documentId
      ? api.getDocumentPdfUrl(document.documentId, sessionId)
      : null;

  return {
    sessionId,
    isInitializing,
    document,
    pdfUrl,
    error,
    uploadDocument: upload,
    resetSession,
  };
}
