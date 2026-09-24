'use client';

import React, { useState } from 'react';
import styles from './QuestionInput.module.css';

interface QuestionInputProps {
  onAsk: (question: string) => void;
  isLoading: boolean;
  disabled?: boolean;
}

const SAMPLE_QUESTIONS = [
  'What is my notice period?',
  'Can I terminate this agreement early?',
  'Can my employer withhold my salary?', // Demo for NOT_FOUND & Google Search Grounding fallback
  'What are my confidentiality obligations?',
];

export function QuestionInput({ onAsk, isLoading, disabled = false }: QuestionInputProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isLoading && !disabled) {
      onAsk(query.trim());
      setQuery('');
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (!isLoading && !disabled) {
      onAsk(suggestion);
    }
  };

  return (
    <div className={styles.inputContainer}>
      <div
        className={styles.suggestionsWrapper}
        role="region"
        aria-label="Suggested contract questions"
      >
        {SAMPLE_QUESTIONS.map((q, idx) => (
          <button
            key={idx}
            type="button"
            className={styles.suggestionChip}
            onClick={() => handleSuggestionClick(q)}
            disabled={isLoading || disabled}
          >
            {q}
          </button>
        ))}
      </div>

      <form className={styles.inputForm} onSubmit={handleSubmit}>
        <input
          type="text"
          className={styles.textInput}
          placeholder="Ask a question about your uploaded document..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={isLoading || disabled}
          aria-label="Ask a question about your document"
          id="question-input-field"
        />
        <button
          type="submit"
          className={styles.sendButton}
          disabled={!query.trim() || isLoading || disabled}
          id="send-question-btn"
        >
          {isLoading ? (
            <span>Analyzing...</span>
          ) : (
            <>
              <span>Ask</span>
              <span aria-hidden="true">→</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
