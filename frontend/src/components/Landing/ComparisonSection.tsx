'use client';

import React from 'react';
import styles from './ComparisonSection.module.css';

export function ComparisonSection() {
  const rows = [
    {
      feature: 'Page-by-Page Verbatim Citations',
      generic: { status: 'bad', text: 'Hallucinates pages or guesses' },
      rag: { status: 'warn', text: 'Approximate text chunks' },
      legalTruth: { status: 'good', text: 'Exact Page + Verbatim Quote' },
    },
    {
      feature: 'Hallucination Prevention Gate',
      generic: { status: 'bad', text: 'Fabricates plausible terms' },
      rag: { status: 'bad', text: 'Blends unrelated chunks' },
      legalTruth: { status: 'good', text: 'Dual-Engine Grounding Guardrail' },
    },
    {
      feature: 'RAM-Only Ephemeral Privacy',
      generic: { status: 'bad', text: 'Stored & used for model training' },
      rag: { status: 'warn', text: 'Saved in persistent vector database' },
      legalTruth: { status: 'good', text: 'RAM-Only Heap, 15m Auto-Purge' },
    },
    {
      feature: 'Interactive PDF Viewer Deep-Jump',
      generic: { status: 'bad', text: 'No document viewer interface' },
      rag: { status: 'bad', text: 'Raw unformatted text output' },
      legalTruth: { status: 'good', text: '1-Click Auto-Scroll & Highlight' },
    },
    {
      feature: 'Source Boundary Demarcation',
      generic: { status: 'bad', text: 'Blends guesses with facts' },
      rag: { status: 'warn', text: 'No external search boundary' },
      legalTruth: { status: 'good', text: 'Strict Green / Blue Separation' },
    },
    {
      feature: 'Interactive Clause Risk Inspector',
      generic: { status: 'bad', text: 'Requires copy-pasting entire docs' },
      rag: { status: 'bad', text: 'No on-page selection analysis' },
      legalTruth: { status: 'good', text: 'Direct On-PDF Clause Diagnostic' },
    },
  ];

  return (
    <section
      id="comparison"
      className={styles.sectionWrapper}
      aria-labelledby="comparison-heading"
    >
      <div className={styles.header}>
        <div className={styles.badge} role="status">
          <span>⚖️ Technical Evaluation</span>
        </div>
        <h2 id="comparison-heading" className={styles.title}>
          Why LegalTruth Stands Apart
        </h2>
        <p className={styles.subtitle}>
          Compare LegalTruth against generic chatbots and naive retrieval systems across the critical dimensions of legal reliability.
        </p>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col">Evaluation Metric</th>
              <th scope="col">Generic AI (ChatGPT / Claude)</th>
              <th scope="col">Naive Vector RAG</th>
              <th scope="col" className={styles.highlightCol}>
                LegalTruth Engine
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.feature}>
                <td className={styles.featureName}>{row.feature}</td>
                <td>
                  <span
                    className={
                      row.generic.status === 'good'
                        ? styles.statusGood
                        : styles.statusBad
                    }
                  >
                    <span aria-hidden="true">
                      {row.generic.status === 'good' ? '✅' : '❌'}
                    </span>
                    <span>{row.generic.text}</span>
                  </span>
                </td>
                <td>
                  <span
                    className={
                      row.rag.status === 'good'
                        ? styles.statusGood
                        : row.rag.status === 'warn'
                        ? styles.statusWarn
                        : styles.statusBad
                    }
                  >
                    <span aria-hidden="true">
                      {row.rag.status === 'good'
                        ? '✅'
                        : row.rag.status === 'warn'
                        ? '⚠️'
                        : '❌'}
                    </span>
                    <span>{row.rag.text}</span>
                  </span>
                </td>
                <td className={styles.highlightCol}>
                  <span className={styles.statusGood}>
                    <span aria-hidden="true">✅</span>
                    <span>{row.legalTruth.text}</span>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
