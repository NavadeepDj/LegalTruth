'use client';

import React from 'react';
import Link from 'next/link';
import styles from './LandingNavbar.module.css';

export function LandingNavbar() {
  return (
    <header className={styles.navbarWrapper} role="banner">
      <div className={styles.navInner}>
        <Link href="/" className={styles.brandLink} aria-label="LegalTruth Home">
          <span className={styles.brandIcon} aria-hidden="true">⚖️</span>
          <span>
            Legal<span className={styles.brandGradient}>Truth</span>
          </span>
        </Link>

        <nav aria-label="Landing Page Navigation">
          <ul className={styles.navLinks}>
            <li>
              <a href="#problem" className={styles.navLink}>
                The Danger
              </a>
            </li>
            <li>
              <a href="#how-it-works" className={styles.navLink}>
                How It Works
              </a>
            </li>
            <li>
              <a href="#privacy" className={styles.navLink}>
                Privacy By Design
              </a>
            </li>
            <li>
              <a href="#simulator" className={styles.navLink}>
                Live Preview
              </a>
            </li>
            <li>
              <a href="#comparison" className={styles.navLink}>
                Comparison
              </a>
            </li>
            <li>
              <a href="#faq" className={styles.navLink}>
                FAQ
              </a>
            </li>
          </ul>
        </nav>

        <div className={styles.actionsGroup}>
          <Link
            href="/workspace?demo=true"
            className={styles.demoButton}
            id="nav-demo-btn"
          >
            Try Demo
          </Link>
          <Link
            href="/workspace"
            className={styles.workspaceButton}
            id="nav-workspace-btn"
          >
            <span>Open Workspace</span>
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
