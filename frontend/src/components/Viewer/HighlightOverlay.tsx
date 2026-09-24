'use client';

import React from 'react';
import styles from './HighlightOverlay.module.css';

interface HighlightOverlayProps {
  top: number;
  left: number;
  width: number;
  height: number;
  label?: string;
}

export function HighlightOverlay({
  top,
  left,
  width,
  height,
  label = 'Cited Clause',
}: HighlightOverlayProps) {
  return (
    <div
      className={styles.overlayBox}
      style={{
        top: `${top}px`,
        left: `${left}px`,
        width: `${width}px`,
        height: `${height}px`,
      }}
      aria-label="Highlighted contract evidence"
    >
      <span className={styles.citationTag}>{label}</span>
    </div>
  );
}
