'use client';

import React from 'react';
import styles from './WhyCantAnswer.module.css';

interface WhyCantAnswerProps {
  reason: string;
  actionGuidance?: string[];
}

export function WhyCantAnswer({ reason, actionGuidance = [] }: WhyCantAnswerProps) {
  if (!reason && actionGuidance.length === 0) return null;

  return (
    <div className={styles.card} role="region" aria-label="Coverage Gap Explanation">
      <div className={styles.header}>
        <span aria-hidden="true">⚠️</span>
        <span>Coverage Gap: Not Found In Uploaded Document</span>
      </div>

      {reason && <p className={styles.explanation}>{reason}</p>}

      {actionGuidance.length > 0 && (
        <div>
          <div className={styles.guidanceTitle}>Recommended Steps</div>
          <ul className={styles.guidanceList}>
            {actionGuidance.map((step, idx) => (
              <li key={idx} className={styles.guidanceItem}>
                <span className={styles.guidanceBullet} aria-hidden="true">
                  •
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
