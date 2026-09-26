'use client';

import React, { useState } from 'react';
import styles from './InteractiveSimulator.module.css';

interface DemoQuery {
  id: string;
  tabLabel: string;
  question: string;
  sourceType: 'in-file' | 'external';
  sourceTitle: string;
  pageNumber?: number;
  answerSummary: string;
  quoteSnippet: string;
  reasoning: string;
}

const DEMO_QUERIES: DemoQuery[] = [
  {
    id: 'comp',
    tabLabel: '💰 Fixed Pay',
    question: 'What is my annual fixed compensation and basic salary structure?',
    sourceType: 'in-file',
    sourceTitle: 'Uploaded Document Evidence (Verified In-File)',
    pageNumber: 3,
    answerSummary: 'Your Annual Fixed Compensation is INR 3,83,000/- per annum, structured according to the guidelines in the Allsec Payroll FAQs annexed to this agreement.',
    quoteSnippet: '“Annual Fixed Compensation: INR 3,83,000/- per annum. Please refer to Allsec Payroll FAQs which elaborates the guidelines applicable to structure your Fixed Compensation.”',
    reasoning: 'Extracted directly from Annexure A (Page 3). Explicit compensation table detected.',
  },
  {
    id: 'non-compete',
    tabLabel: '⚖️ Non-Compete',
    question: 'What is the post-employment non-compete duration and geographical scope?',
    sourceType: 'in-file',
    sourceTitle: 'Uploaded Document Evidence (Verified In-File)',
    pageNumber: 6,
    answerSummary: 'The agreement imposes a 12-month post-termination restrictive covenant prohibiting employment with direct competitors within a 50-mile radius.',
    quoteSnippet: '“Clause 8.1: The Employee covenants and agrees that for a period of twelve (12) months following termination, the Employee shall not directly engage with any competing business entity within a 50-mile geographical radius.”',
    reasoning: 'Located in Section 8 (Restrictive Covenants) on Page 6.',
  },
  {
    id: 'termination',
    tabLabel: '📄 Termination Notice',
    question: 'Can the company terminate my employment without cause, and what notice is required?',
    sourceType: 'in-file',
    sourceTitle: 'Uploaded Document Evidence (Verified In-File)',
    pageNumber: 5,
    answerSummary: 'Either party may terminate the employment relationship by providing thirty (30) days prior written notice, or basic salary in lieu of notice.',
    quoteSnippet: '“Clause 7.2: Either party may terminate this employment without cause by giving thirty (30) calendar days prior written notice, or payment of base remuneration in lieu thereof.”',
    reasoning: 'Located in Section 7 (Term & Termination) on Page 5.',
  },
  {
    id: 'whistleblower',
    tabLabel: '🌐 Search Grounding',
    question: 'Does this contract comply with federal whistleblower protection statutes?',
    sourceType: 'external',
    sourceTitle: 'External Search Grounding (Document Silent)',
    answerSummary: 'The uploaded contract contains no explicit whistleblower clause. Under federal law (Dodd-Frank and Defend Trade Secrets Act), employers cannot restrict employees from disclosing trade secrets to government agencies.',
    quoteSnippet: '“18 U.S. Code § 1833(b): An individual shall not be held criminally or civilly liable under any trade secret law for disclosure made in confidence to a government official solely for reporting a violation of law.”',
    reasoning: 'Document is silent on whistleblower immunity. External legal search invoked with clear boundary warning.',
  },
];

export function InteractiveSimulator() {
  const [activeId, setActiveId] = useState<string>('comp');
  const [jumpFeedback, setJumpFeedback] = useState<string | null>(null);

  const activeQuery = DEMO_QUERIES.find((q) => q.id === activeId) || DEMO_QUERIES[0];

  const handleSimulateJump = (page: number) => {
    setJumpFeedback(`Simulated Jump: In the workspace, this action instantly auto-scrolls the PDF viewer to Page ${page} and highlights the paragraph!`);
    setTimeout(() => {
      setJumpFeedback(null);
    }, 4500);
  };

  return (
    <section
      id="simulator"
      className={styles.simulatorSection}
      aria-labelledby="simulator-heading"
    >
      <div className={styles.inner}>
        <div className={styles.header}>
          <div className={styles.badge} role="status">
            <span>⚡ Interactive Live Preview</span>
          </div>
          <h2 id="simulator-heading" className={styles.title}>
            See It In Action: Verifiable Contract Reasoning
          </h2>
          <p className={styles.subtitle}>
            Select any real-world question below to see how LegalTruth extracts exact quotes, page numbers, and boundary demarcations with zero hallucinations.
          </p>
        </div>

        {/* Tab Controls */}
        <div
          role="tablist"
          aria-label="Contract sample questions"
          className={styles.tabsContainer}
        >
          {DEMO_QUERIES.map((query) => {
            const isActive = query.id === activeId;
            return (
              <button
                key={query.id}
                role="tab"
                id={`tab-${query.id}`}
                aria-selected={isActive}
                aria-controls={`panel-${query.id}`}
                tabIndex={isActive ? 0 : -1}
                className={`${styles.tabButton} ${isActive ? styles.tabButtonActive : ''}`}
                onClick={() => {
                  setActiveId(query.id);
                  setJumpFeedback(null);
                }}
              >
                <span>{query.tabLabel}</span>
              </button>
            );
          })}
        </div>

        {/* Live Simulator Preview Frame */}
        <div className={styles.previewFrame}>
          <div className={styles.frameBar}>
            <div className={styles.windowControls} aria-hidden="true">
              <span className={`${styles.circleDot} ${styles.circleRed}`} />
              <span className={`${styles.circleDot} ${styles.circleYellow}`} />
              <span className={`${styles.circleDot} ${styles.circleGreen}`} />
            </div>
            <span className={styles.frameTitle}>
              LegalTruth Workspace Preview &bull; session_id: a7f8e12c
            </span>
            <span style={{ width: 48 }} />
          </div>

          <div
            id={`panel-${activeQuery.id}`}
            role="tabpanel"
            aria-labelledby={`tab-${activeQuery.id}`}
            className={styles.cardBody}
            aria-live="polite"
          >
            {/* User Query Display */}
            <div className={styles.queryBox}>
              <span className={styles.queryIcon} aria-hidden="true">💬</span>
              <div>
                <span style={{ fontSize: '0.78rem', color: '#a5b4fc', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
                  Contract Query
                </span>
                <p className={styles.queryText}>{activeQuery.question}</p>
              </div>
            </div>

            {/* Response Card */}
            <article
              className={
                activeQuery.sourceType === 'in-file'
                  ? styles.resultCardInFile
                  : styles.resultCardExternal
              }
            >
              <div>
                <span
                  className={
                    activeQuery.sourceType === 'in-file'
                      ? styles.sourceBadgeInFile
                      : styles.sourceBadgeExternal
                  }
                >
                  <span aria-hidden="true">
                    {activeQuery.sourceType === 'in-file' ? '📜' : '🌐'}
                  </span>
                  <span>{activeQuery.sourceTitle}</span>
                </span>
              </div>

              <p className={styles.answerSummary}>{activeQuery.answerSummary}</p>

              <div
                className={
                  activeQuery.sourceType === 'in-file'
                    ? styles.evidenceBox
                    : styles.evidenceBoxExternal
                }
              >
                <div className={styles.evidenceHeader}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8' }}>
                    {activeQuery.sourceType === 'in-file' ? 'VERBATIM CONTRACT CITATION' : 'LEGAL AUTHORITY SOURCE'}
                  </span>
                  {activeQuery.pageNumber && (
                    <span className={styles.pagePill}>PAGE {activeQuery.pageNumber}</span>
                  )}
                </div>
                <blockquote className={styles.verbatimQuote}>
                  {activeQuery.quoteSnippet}
                </blockquote>
              </div>

              <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: 16 }}>
                💡 <em>{activeQuery.reasoning}</em>
              </p>

              {activeQuery.pageNumber && (
                <div>
                  <button
                    type="button"
                    className={styles.jumpSimButton}
                    onClick={() => handleSimulateJump(activeQuery.pageNumber!)}
                    aria-label={`Jump to page ${activeQuery.pageNumber} in viewer`}
                  >
                    <span>Jump to Page {activeQuery.pageNumber}</span>
                    <span aria-hidden="true">→</span>
                  </button>
                </div>
              )}

              {jumpFeedback && (
                <div className={styles.jumpToast} role="status">
                  <span aria-hidden="true">✨</span>
                  <span>{jumpFeedback}</span>
                </div>
              )}
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}
