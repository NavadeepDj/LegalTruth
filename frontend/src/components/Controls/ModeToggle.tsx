'use client';

import React from 'react';
import { AnswerMode } from '@/lib/types';
import styles from './ModeToggle.module.css';

interface ModeToggleProps {
  mode: AnswerMode;
  onChange: (mode: AnswerMode) => void;
  disabled?: boolean;
}

export function ModeToggle({ mode, onChange, disabled = false }: ModeToggleProps) {
  return (
    <div className={styles.container} role="group" aria-label="Answer Mode Selection">
      <span className={styles.label}>Mode</span>
      <div className={styles.toggleWrapper}>
        <button
          type="button"
          className={`${styles.optionButton} ${
            mode === 'document_only' ? styles.activeDocOnly : ''
          }`}
          onClick={() => onChange('document_only')}
          disabled={disabled}
          role="radio"
          aria-checked={mode === 'document_only'}
          id="mode-doc-only-btn"
          title="Strictly limit answers to uploaded document content"
        >
          <span>🔒</span>
          <span>Document Only</span>
        </button>

        <button
          type="button"
          className={`${styles.optionButton} ${
            mode === 'document_and_web' ? styles.activeDocAndWeb : ''
          }`}
          onClick={() => onChange('document_and_web')}
          disabled={disabled}
          role="radio"
          aria-checked={mode === 'document_and_web'}
          id="mode-doc-web-btn"
          title="Search public sources if the document lacks answers"
        >
          <span>🌐</span>
          <span>Document + Web</span>
        </button>
      </div>
    </div>
  );
}
