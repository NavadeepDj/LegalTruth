'use client';

import React from 'react';
import styles from './SourceBoundary.module.css';

interface SourceBoundaryProps {
  boundary: 'DOCUMENT' | 'EXTERNAL' | 'BOTH' | '';
}

export function SourceBoundary({ boundary }: SourceBoundaryProps) {
  if (!boundary) return null;

  if (boundary === 'DOCUMENT') {
    return (
      <div className={`${styles.boundaryBanner} ${styles.documentBoundary}`} role="status">
        <div className={styles.boundaryLeft}>
          <span aria-hidden="true">📜</span>
          <span>Source: Uploaded Document Evidence</span>
        </div>
        <span className={styles.boundaryTag}>Verified In-File</span>
      </div>
    );
  }

  if (boundary === 'EXTERNAL') {
    return (
      <div className={`${styles.boundaryBanner} ${styles.externalBoundary}`} role="status">
        <div className={styles.boundaryLeft}>
          <span aria-hidden="true">🌐</span>
          <span>Source: External Public Information</span>
        </div>
        <span className={styles.boundaryTag}>Google Search Grounding</span>
      </div>
    );
  }

  return (
    <div className={`${styles.boundaryBanner} ${styles.mixedBoundary}`} role="status">
      <div className={styles.boundaryLeft}>
        <span aria-hidden="true">⚖️</span>
        <span>Source: Document + External Guidance</span>
      </div>
      <span className={styles.boundaryTag}>Dual Source</span>
    </div>
  );
}
