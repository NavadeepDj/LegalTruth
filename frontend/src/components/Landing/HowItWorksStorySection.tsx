'use client';

import React from 'react';
import styles from './HowItWorksStorySection.module.css';

export function HowItWorksStorySection() {
  const steps = [
    {
      num: '01',
      icon: '📥',
      title: 'Volatile Ingestion',
      desc: 'The document is verified against %PDF- binary headers and stored solely in transient memory buffers. No persistent disk writes, no long-term storage.',
      tag: '🛡️ RAM-Only Session Storage',
    },
    {
      num: '02',
      icon: '⚡',
      title: 'Dual-Engine Extraction',
      desc: 'Combines deterministic regex/keyword pattern boundary matchers with Gemini structured semantic reasoning to locate clauses accurately.',
      tag: '🔍 Fast Syntactic + Semantic ML',
    },
    {
      num: '03',
      icon: '📍',
      title: 'Pinpoint Citation Linking',
      desc: 'Every factual assertion is locked to exact page numbers, section headers, and verbatim quotes. Clicking a citation jumps straight to the page in the viewer.',
      tag: '🎯 Direct Interactive PDF Jump',
    },
    {
      num: '04',
      icon: '🛡️',
      title: 'Source Boundary Firewall',
      desc: 'If the contract does not mention the topic, LegalTruth refuses to speculate. It signals missing evidence and switches cleanly to demarcated external search.',
      tag: '🔀 Zero Hallucination Guarantee',
    },
  ];

  return (
    <section
      id="how-it-works"
      className={styles.sectionWrapper}
      aria-labelledby="how-it-works-title"
    >
      <div className={styles.inner}>
        <div className={styles.header}>
          <div className={styles.badge} role="status">
            <span>⚙️ Transparent Architecture</span>
          </div>
          <h2 id="how-it-works-title" className={styles.title}>
            How LegalTruth Guarantees The Truth
          </h2>
          <p className={styles.subtitle}>
            A 4-step verifiable verification pipeline engineered to eliminate AI hallucination from legal analysis.
          </p>
        </div>

        <div className={styles.stepsGrid}>
          {steps.map((step) => (
            <article key={step.num} className={styles.stepCard}>
              <span className={styles.stepNumber} aria-label={`Step ${step.num}`}>
                STEP {step.num}
              </span>
              <div className={styles.stepIconWrapper} aria-hidden="true">
                {step.icon}
              </div>
              <h3 className={styles.stepTitle}>{step.title}</h3>
              <p className={styles.stepDesc}>{step.desc}</p>
              <div className={styles.stepTag}>{step.tag}</div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
