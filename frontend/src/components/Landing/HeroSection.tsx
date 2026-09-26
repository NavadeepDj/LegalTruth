'use client';

import React from 'react';
import Link from 'next/link';
import styles from './HeroSection.module.css';

export function HeroSection() {
  return (
    <section className={styles.heroContainer} aria-label="Introduction to LegalTruth">
      <div className={styles.heroContent}>
        <div className={styles.pillBadge} role="status">
          <span className={styles.liveDot} aria-hidden="true" />
          <span>Zero-Retention Architecture • Gemini Grounded • RAM-Only Privacy</span>
        </div>

        <h1 className={styles.title}>
          Stop Trusting Hallucinating AI With Your Contracts. <br />
          <span className={styles.gradientText}>Verify The Exact Legal Truth.</span>
        </h1>

        <p className={styles.subtitle}>
          Ask complex questions about your NDAs, employment agreements, or commercial contracts. Every single response is bound to verbatim quotes and exact PDF page coordinates. No silent assumptions. No permanent file storage.
        </p>

        <div className={styles.ctaGroup}>
          <Link href="/workspace" className={styles.primaryButton} id="get-started-btn">
            <span>Analyze Your Agreement</span>
            <span aria-hidden="true">→</span>
          </Link>
          <Link href="/workspace?demo=true" className={styles.secondaryButton} id="demo-btn">
            <span>Explore Demo Contract</span>
          </Link>
        </div>

        <div className={styles.pillarsBanner}>
          <div className={styles.pillarCard}>
            <div className={styles.pillarHeader}>
              <span className={styles.pillarIcon} aria-hidden="true">🛡️</span>
              <h2 className={styles.pillarTitle}>Session-Only Privacy</h2>
            </div>
            <p className={styles.pillarDesc}>
              Files reside strictly in volatile RAM. Wiped when you leave or purged every 15 minutes.
            </p>
          </div>

          <div className={styles.pillarCard}>
            <div className={styles.pillarHeader}>
              <span className={styles.pillarIcon} aria-hidden="true">🎯</span>
              <h2 className={styles.pillarTitle}>Pinpoint Page Citations</h2>
            </div>
            <p className={styles.pillarDesc}>
              Every claim is backed by verbatim text and exact page numbers. Click to jump directly in the PDF.
            </p>
          </div>

          <div className={styles.pillarCard}>
            <div className={styles.pillarHeader}>
              <span className={styles.pillarIcon} aria-hidden="true">🔀</span>
              <h2 className={styles.pillarTitle}>Strict Source Boundaries</h2>
            </div>
            <p className={styles.pillarDesc}>
              Clear demarcation between internal contract terms and external Google Grounding search facts.
            </p>
          </div>

          <div className={styles.pillarCard}>
            <div className={styles.pillarHeader}>
              <span className={styles.pillarIcon} aria-hidden="true">🔍</span>
              <h2 className={styles.pillarTitle}>Interactive Clause Risk</h2>
            </div>
            <p className={styles.pillarDesc}>
              Select any obscure clause on the PDF viewer to trigger instant plain-English risk diagnostics.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
