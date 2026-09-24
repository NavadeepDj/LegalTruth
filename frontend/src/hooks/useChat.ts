'use client';

import { useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { AnswerMode, AnswerResponse, ConversationEntry, EvidenceItem } from '@/lib/types';

interface UseChatProps {
  sessionId: string | null;
  documentId: string | null;
}

export function useChat({ sessionId, documentId }: UseChatProps) {
  const [messages, setMessages] = useState<ConversationEntry[]>([]);
  const [mode, setMode] = useState<AnswerMode>('document_and_web');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceItem | null>(null);

  const askQuestion = useCallback(
    async (questionText: string) => {
      if (!questionText.trim()) return;
      if (!sessionId || !documentId) {
        setError('Please upload a document first before asking questions.');
        return;
      }

      setError(null);
      setIsLoading(true);

      const userEntry: ConversationEntry = {
        role: 'user',
        content: questionText,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userEntry]);

      try {
        const response: AnswerResponse = await api.askQuestion(
          questionText,
          mode,
          sessionId,
          documentId
        );

        const assistantEntry: ConversationEntry = {
          role: 'assistant',
          content: response.answer,
          timestamp: new Date().toISOString(),
          response,
        };

        setMessages((prev) => [...prev, assistantEntry]);

        // Automatically focus first evidence item if present
        if (response.evidence && response.evidence.length > 0) {
          setSelectedEvidence(response.evidence[0]);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to get answer';
        setError(msg);
      } finally {
        setIsLoading(false);
      }
    },
    [sessionId, documentId, mode]
  );

  const explainClause = useCallback(
    async (clauseText: string, pageNumber: number) => {
      if (!clauseText.trim()) return;
      if (!sessionId || !documentId) {
        setError('No active document session.');
        return;
      }

      setError(null);
      setIsLoading(true);

      const userEntry: ConversationEntry = {
        role: 'user',
        content: `Explain clause from Page ${pageNumber}: "${clauseText.slice(0, 120)}${clauseText.length > 120 ? '...' : ''}"`,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userEntry]);

      try {
        const response: AnswerResponse = await api.explainClause(
          clauseText,
          pageNumber,
          sessionId,
          documentId
        );

        const assistantEntry: ConversationEntry = {
          role: 'assistant',
          content: response.answer,
          timestamp: new Date().toISOString(),
          response,
        };

        setMessages((prev) => [...prev, assistantEntry]);
        if (response.evidence && response.evidence.length > 0) {
          setSelectedEvidence(response.evidence[0]);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to explain clause';
        setError(msg);
      } finally {
        setIsLoading(false);
      }
    },
    [sessionId, documentId]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    setSelectedEvidence(null);
    setError(null);
  }, []);

  return {
    messages,
    mode,
    setMode,
    isLoading,
    error,
    selectedEvidence,
    setSelectedEvidence,
    askQuestion,
    explainClause,
    clearMessages,
  };
}
