'use client';

import React from 'react';
import Link from 'next/link';
import styles from './HeroSection.module.css';

export function HeroSection() {
  return (
    <section className={styles.heroContainer} aria-label="Introduction to LegalTruth">
      <div className={styles.heroContent}>
        <div className={styles.pillBadge} role="status">
          <span>✨</span>
          <span>Powered by Gemini & Google Grounding</span>
        </div>

        <h1 className={styles.title}>
          Never Guess If An AI Is Hallucinating. <br />
          <span className={styles.gradientText}>See The Legal Truth.</span>
        </h1>

        <p className={styles.subtitle}>
          Ask your legal documents anything. Every answer is backed by verbatim quotes,
          exact page numbers, and detected clauses. If your document doesn&apos;t answer,
          get clearly demarcated Google Search guidance without silent assumptions.
        </p>

        <div className={styles.ctaGroup}>
          <Link href="/workspace" className={styles.primaryButton} id="get-started-btn">
            <span>Analyze Your Document</span>
            <span aria-hidden="true">→</span>
          </Link>
          <Link href="/workspace?demo=true" className={styles.secondaryButton} id="demo-btn">
            <span>Load Demo Contract</span>
          </Link>
        </div>

        <div className={styles.featureGrid}>
          <div className={styles.featureCard}>
            <div className={styles.iconWrapper} aria-hidden="true">🎯</div>
            <h2 className={styles.featureTitle}>Evidence-First Citations</h2>
            <p className={styles.featureDescription}>
              Every material statement links to an exact page, section heading, and verbatim quote.
              Click any citation to jump straight to the source in the interactive PDF viewer.
            </p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.iconWrapper} aria-hidden="true">🛡️</div>
            <h2 className={styles.featureTitle}>Clear Source Boundaries</h2>
            <p className={styles.featureDescription}>
              Explicit separation between <em>Document Authority</em> and <em>External Guidance</em>.
              If the document is silent, LegalTruth states what&apos;s missing instead of hallucinating.
            </p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.iconWrapper} aria-hidden="true">🔍</div>
            <h2 className={styles.featureTitle}>Interactive Clause Inspector</h2>
            <p className={styles.featureDescription}>
              Select any obscure clause, indemnity, or restrictive covenant directly on the PDF.
              Get plain-English explanations of obligations, risks, and next steps immediately.
            </p>
          </div>
        </div>

        <div className={styles.disclaimerBanner} role="note">
          <span aria-hidden="true">⚠️</span>
          <span>
            <strong>Legal Disclaimer:</strong> LegalTruth provides AI-powered document analysis and search grounding, not formal legal advice. Always consult a qualified attorney for legal counsel.
          </span>
        </div>
      </div>
    </section>
  );
}
