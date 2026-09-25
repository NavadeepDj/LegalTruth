'use client';

import React from 'react';
import { AnswerMode, ConversationEntry } from '@/lib/types';
import { ModeToggle } from '@/components/Controls/ModeToggle';
import { ConversationHistory } from './ConversationHistory';
import { QuestionInput } from './QuestionInput';
import styles from './AnswerPanel.module.css';

interface AnswerPanelProps {
  messages: ConversationEntry[];
  mode: AnswerMode;
  onModeChange: (mode: AnswerMode) => void;
  onAsk: (question: string) => void;
  onClear: () => void;
  onJumpToPage: (pageNumber: number, quote: string) => void;
  isLoading: boolean;
  error?: string | null;
  hasDocument: boolean;
}

export function AnswerPanel({
  messages,
  mode,
  onModeChange,
  onAsk,
  onClear,
  onJumpToPage,
  isLoading,
  error,
  hasDocument,
}: AnswerPanelProps) {
  return (
    <section className={styles.panelContainer} aria-label="Evidence Q&A Panel">
      <div className={styles.panelHeader}>
        <div className={styles.headerLeft}>
          <span className={styles.headerTitle}>Evidence Assistant</span>
        </div>

        <div className={styles.headerRight}>
          <ModeToggle mode={mode} onChange={onModeChange} disabled={isLoading} />
          {messages.length > 0 && (
            <button
              type="button"
              className={styles.clearButton}
              onClick={onClear}
              title="Clear conversation messages"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className={styles.errorMessage} role="alert">
          {error}
        </div>
      )}

      <ConversationHistory
        messages={messages}
        isLoading={isLoading}
        onJumpToPage={onJumpToPage}
      />

      <QuestionInput
        onAsk={onAsk}
        isLoading={isLoading}
        disabled={!hasDocument}
        showSuggestions={messages.length === 0}
      />
    </section>
  );
}
