'use client';

import React from 'react';
import styles from './PrivacyByDesignSection.module.css';

export function PrivacyByDesignSection() {
  const pillars = [
    {
      icon: '🧠',
      title: 'Volatile In-Memory Processing',
      desc: 'Uploaded contracts are held strictly in temporary Python heap memory for the duration of your session. They are never written to disk, databases, or permanent cloud storage buckets.',
      code: 'RAM-Only Heap • Zero Disk Footprint',
    },
    {
      icon: '🚫',
      title: 'Zero AI Training Retraining',
      desc: 'Your proprietary clauses, salary compensation figures, and non-disclosure terms are never used to train, evaluate, or fine-tune public Gemini or third-party AI models.',
      code: 'Zero-Retention API Contracts',
    },
    {
      icon: '🧹',
      title: 'Automated 15-Minute Sweeper',
      desc: 'A background worker process runs every 15 minutes, actively detecting expired sessions, scrubbing PDF byte buffers, and wiping chat contexts from server memory.',
      code: 'Active Garbage Collection Daemon',
    },
    {
      icon: '🔒',
      title: 'OWASP-Hardened Defense Layer',
      desc: 'Protected with strict Content Security Policy frame-ancestors, binary %PDF- magic-byte sniffing prevention, sliding-window rate limiters, and anti-path-traversal sanitizers.',
      code: 'OWASP Compliant • 60 req/min Limiter',
    },
  ];

  return (
    <section
      id="privacy"
      className={styles.sectionContainer}
      aria-labelledby="privacy-heading"
    >
      <div className={styles.header}>
        <div className={styles.badge} role="status">
          <span>🛡️ Privacy by Design</span>
        </div>
        <h2 id="privacy-heading" className={styles.title}>
          Your Contracts Belong To You. Period.
        </h2>
        <p className={styles.subtitle}>
          Legal agreements contain trade secrets, financial records, and personal identities. LegalTruth is engineered with zero-retention privacy as a foundational architecture, not an afterthought.
        </p>
      </div>

      <div className={styles.guaranteeBox}>
        <div className={styles.guaranteeIcon} aria-hidden="true">
          🔐
        </div>
        <div>
          <h3 className={styles.guaranteeTitle}>The LegalTruth Session-Only Guarantee</h3>
          <p className={styles.guaranteeText}>
            When you end your session or close your browser tab, your document and conversation history cease to exist. There is no account registration required, no persistent database table, and no residual document cache left behind.
          </p>
        </div>
      </div>

      <div className={styles.grid}>
        {pillars.map((pillar) => (
          <article key={pillar.title} className={styles.card}>
            <span className={styles.cardIcon} aria-hidden="true">
              {pillar.icon}
            </span>
            <h3 className={styles.cardTitle}>{pillar.title}</h3>
            <p className={styles.cardDesc}>{pillar.desc}</p>
            <div className={styles.cardMeta}>
              <span aria-hidden="true">⚡</span>
              <span>{pillar.code}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
