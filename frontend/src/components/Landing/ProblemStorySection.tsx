'use client';

import React from 'react';
import styles from './ProblemStorySection.module.css';

export function ProblemStorySection() {
  return (
    <section
      id="problem"
      className={styles.sectionContainer}
      aria-labelledby="problem-heading"
    >
      <div className={styles.sectionHeader}>
        <div className={styles.badge} role="status">
          <span>⚠️ The Real-World Risk</span>
        </div>
        <h2 id="problem-heading" className={styles.title}>
          The $100,000 Hallucination Trap
        </h2>
        <p className={styles.subtitle}>
          Generic LLMs are trained to sound agreeable and articulate. But in legal agreements, an educated guess is a lawsuit waiting to happen.
        </p>
      </div>

      <div className={styles.storyCard}>
        <div className={styles.storyHeader}>
          <div className={styles.storyIcon} aria-hidden="true">🚨</div>
          <div>
            <h3 className={styles.storyHeadline}>A Cautionary Story: The Silent Covenant</h3>
          </div>
        </div>
        <p className={styles.storyText}>
          Imagine signing a senior software engineering offer. Before launching a side startup on weekends, you ask a generic AI chatbot if your employment agreement restricts personal projects. The chatbot enthusiastically replies: <em>&ldquo;You own your personal weekend inventions unless developed using company hardware!&rdquo;</em> Six months later, you receive a cease-and-desist letter with a $100,000 liquidated damages claim. Buried on Page 19, Clause 12.4, an aggressive intellectual property assignment clause claimed ownership over <strong>any software conceived during the entire employment tenure</strong>.
        </p>
      </div>

      <div className={styles.comparisonGrid}>
        {/* Generic LLM Failure */}
        <article className={styles.compareCardDanger} aria-label="Generic AI Failure Example">
          <div className={styles.compareHeader}>
            <span className={styles.compareTagDanger}>
              <span aria-hidden="true">❌</span> Generic Black-Box AI
            </span>
          </div>

          <div className={styles.comparePrompt}>
            <strong>User prompt:</strong> &ldquo;Can I build an open source tool on weekends while employed?&rdquo;
          </div>

          <div className={styles.compareResponse}>
            <p>
              &ldquo;Yes! Under standard labor principles, employers generally cannot claim ownership of code written on your own personal laptop outside business hours, unless related to company secrets.&rdquo;
            </p>
          </div>

          <div className={styles.dangerCallout}>
            <span aria-hidden="true">⚠️</span>
            <span>
              <strong>Fatal Flaw:</strong> Made polite assumptions based on generic web training. Never inspected the actual contract text.
            </span>
          </div>
        </article>

        {/* LegalTruth Grounded Success */}
        <article className={styles.compareCardSuccess} aria-label="LegalTruth Grounded Solution">
          <div className={styles.compareHeader}>
            <span className={styles.compareTagSuccess}>
              <span aria-hidden="true">✅</span> LegalTruth Verifiable Grounding
            </span>
          </div>

          <div className={styles.comparePrompt}>
            <strong>User prompt:</strong> &ldquo;Can I build an open source tool on weekends while employed?&rdquo;
          </div>

          <div className={styles.compareResponse}>
            <p>
              <strong>Status: Supported In-File (Page 19, Clause 12.4)</strong>
            </p>
            <div className={styles.quoteSnippet}>
              &ldquo;The Employee irrevocably assigns to the Company all right, title, and interest in any invention or software created during the term of employment, whether or not during normal working hours.&rdquo;
            </div>
            <p>
              Direct restriction identified. Consult counsel before releasing independent software.
            </p>
          </div>

          <div className={styles.successCallout}>
            <span aria-hidden="true">🛡️</span>
            <span>
              <strong>Grounded Truth:</strong> Verbatim quote, exact page link, and dual-engine verification. Zero hallucinations.
            </span>
          </div>
        </article>
      </div>
    </section>
  );
}
