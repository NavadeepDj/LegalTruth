'use client';

import React from 'react';
import Link from 'next/link';
import styles from './LandingFooter.module.css';

export function LandingFooter() {
  return (
    <footer className={styles.footerWrapper} role="contentinfo">
      <div className={styles.inner}>
        {/* Pre-footer Call to Action */}
        <div className={styles.ctaCard}>
          <h2 className={styles.ctaTitle}>
            Ready To Inspect Your Contracts Without Hallucinations?
          </h2>
          <p className={styles.ctaSubtitle}>
            Upload any contract to test our volatile in-memory parser, or test our live demo agreement with pre-indexed clauses.
          </p>
          <div className={styles.ctaButtonGroup}>
            <Link
              href="/workspace"
              className={styles.ctaPrimary}
              id="footer-workspace-btn"
            >
              <span>Launch LegalTruth Workspace</span>
              <span aria-hidden="true">→</span>
            </Link>
            <Link
              href="/workspace?demo=true"
              className={styles.ctaSecondary}
              id="footer-demo-btn"
            >
              <span>Explore Demo Contract</span>
            </Link>
          </div>
        </div>

        {/* Legal Disclaimer Banner */}
        <div className={styles.disclaimerBanner} role="note">
          <span className={styles.disclaimerIcon} aria-hidden="true">⚠️</span>
          <div>
            <strong>Legal Notice & Mandatory Disclaimer:</strong> LegalTruth provides AI-powered document extraction and factual grounding for informational and workflow-acceleration purposes only. LegalTruth does not provide formal legal advice, representation, or opinions of counsel. Document review does not establish an attorney-client relationship. Always consult a qualified, licensed attorney for legal counsel, dispute resolution, and contract negotiations.
          </div>
        </div>

        {/* Bottom Bar */}
        <div className={styles.bottomNav}>
          <div className={styles.brandPart}>
            <span aria-hidden="true">⚖️</span>
            <span>LegalTruth &bull; Evidence-First Grounding</span>
          </div>

          <ul className={styles.linksPart}>
            <li>
              <a href="#privacy" className={styles.footerLink}>
                Privacy Architecture
              </a>
            </li>
            <li>
              <a href="#how-it-works" className={styles.footerLink}>
                Verifiable Pipeline
              </a>
            </li>
            <li>
              <a
                href="https://github.com/NavadeepDj/LegalTruth"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.footerLink}
              >
                GitHub Repository ↗
              </a>
            </li>
            <li>
              <a href="#main-content" className={styles.footerLink}>
                Back to Top ↑
              </a>
            </li>
          </ul>
        </div>

        {/* Technology Stack Pill Badges */}
        <div className={styles.techPills}>
          <span className={styles.techPill}>Next.js 16 App Router</span>
          <span className={styles.techPill}>FastAPI Python Backend</span>
          <span className={styles.techPill}>Gemini Flash Grounding</span>
          <span className={styles.techPill}>Volatile In-Memory Heap</span>
          <span className={styles.techPill}>OWASP Hardened CSP</span>
          <span className={styles.techPill}>PDF.js Coordinate Mapper</span>
        </div>
      </div>
    </footer>
  );
}
