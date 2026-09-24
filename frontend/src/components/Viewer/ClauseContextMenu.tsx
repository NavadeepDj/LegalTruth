'use client';

import React from 'react';
import styles from './ClauseContextMenu.module.css';

interface ClauseContextMenuProps {
  x: number;
  y: number;
  selectedText: string;
  onExplain: (text: string) => void;
  onClose: () => void;
}

export function ClauseContextMenu({
  x,
  y,
  selectedText,
  onExplain,
}: ClauseContextMenuProps) {
  if (!selectedText.trim()) return null;

  return (
    <div
      className={styles.menuContainer}
      style={{ left: `${x}px`, top: `${y}px` }}
      role="dialog"
      aria-label="Clause actions"
    >
      <button
        type="button"
        className={styles.explainButton}
        onClick={() => onExplain(selectedText)}
        id="explain-clause-btn"
      >
        <span aria-hidden="true">⚖️</span>
        <span>Explain this clause</span>
      </button>
    </div>
  );
}
