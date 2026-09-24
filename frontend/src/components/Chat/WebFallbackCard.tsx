'use client';

import React from 'react';
import { WebSource } from '@/lib/types';
import styles from './WebFallbackCard.module.css';

interface WebFallbackCardProps {
  source: WebSource;
}

export function WebFallbackCard({ source }: WebFallbackCardProps) {
  let domain = '';
  try {
    if (source.url) {
      domain = new URL(source.url).hostname;
    }
  } catch {
    domain = source.url;
  }

  return (
    <article className={styles.card} aria-label={`External source: ${source.title}`}>
      <div className={styles.header}>
        <span className={styles.typeBadge}>
          {source.source_type || 'PUBLIC WEB'}
        </span>
        {domain && <span className={styles.urlDomain}>{domain}</span>}
      </div>

      <div>
        <a
          href={source.url}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.sourceLink}
        >
          <span>{source.title || 'External Source'}</span>
          <span aria-hidden="true">↗</span>
        </a>
      </div>

      {source.snippet && <p className={styles.snippet}>{source.snippet}</p>}
    </article>
  );
}
