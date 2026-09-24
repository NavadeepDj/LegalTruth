'use client';

import React from 'react';
import Link from 'next/link';
import styles from './Navbar.module.css';

interface NavbarProps {
  filename?: string | null;
  totalPages?: number;
  sessionId?: string | null;
  onChangeDocument?: () => void;
  onResetSession?: () => void;
}

export function Navbar({
  filename,
  totalPages,
  sessionId,
  onChangeDocument,
  onResetSession,
}: NavbarProps) {
  return (
    <header className={styles.navbar} role="banner">
      <div className={styles.leftSection}>
        <Link href="/" className={styles.logo} aria-label="LegalTruth Home">
          <div className={styles.logoIcon} aria-hidden="true">
            ⚖️
          </div>
          <span className={styles.logoText}>LegalTruth</span>
        </Link>

        {filename && (
          <div className={styles.docBadge} role="status">
            <span>📄</span>
            <span>
              <strong>{filename}</strong>
              {totalPages ? ` (${totalPages} ${totalPages === 1 ? 'page' : 'pages'})` : ''}
            </span>
            {onChangeDocument && (
              <button
                type="button"
                className={styles.changeDocButton}
                onClick={onChangeDocument}
                title="Upload a different document"
              >
                Change
              </button>
            )}
          </div>
        )}
      </div>

      <div className={styles.rightSection}>
        {sessionId && (
          <span
            className={styles.sessionBadge}
            title={`Active session ID: ${sessionId}`}
          >
            Session: {sessionId.slice(0, 8)}...
          </span>
        )}

        {onResetSession && (
          <button
            type="button"
            className={styles.actionButton}
            onClick={onResetSession}
            title="Start a new session"
          >
            New Session
          </button>
        )}
      </div>
    </header>
  );
}
