'use client';

import React from 'react';
import { EvidenceItem } from '@/lib/types';
import styles from './EvidenceCard.module.css';

interface EvidenceCardProps {
  evidence: EvidenceItem;
  onJumpToPage?: (pageNumber: number, quote: string) => void;
}

export function EvidenceCard({ evidence, onJumpToPage }: EvidenceCardProps) {
  return (
    <article className={styles.card} aria-label={`Evidence from page ${evidence.page_number}`}>
      <div className={styles.header}>
        <div className={styles.badgeGroup}>
          <span className={styles.pageBadge}>PAGE {evidence.page_number}</span>
          {evidence.section && (
            <span className={styles.sectionBadge}>{evidence.section}</span>
          )}
        </div>

        {onJumpToPage && (
          <button
            type="button"
            className={styles.jumpButton}
            onClick={() => onJumpToPage(evidence.page_number, evidence.quote)}
            title={`Scroll to Page ${evidence.page_number} and highlight clause`}
          >
            <span>Jump to Page {evidence.page_number}</span>
            <span aria-hidden="true">→</span>
          </button>
        )}
      </div>

      <blockquote className={styles.quoteBlock}>
        &ldquo;{evidence.quote}&rdquo;
      </blockquote>

      {evidence.relevance && (
        <div className={styles.relevance}>
          <span>💡</span>
          <span>{evidence.relevance}</span>
        </div>
      )}
    </article>
  );
}
