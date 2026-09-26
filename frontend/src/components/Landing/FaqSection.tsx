'use client';

import React, { useState } from 'react';
import styles from './FaqSection.module.css';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    id: 'privacy-guarantee',
    question: 'How does LegalTruth guarantee my document is never stored or trained on?',
    answer:
      'Uploaded contracts are processed exclusively in volatile RAM heap memory and associated with an ephemeral cryptographic session ID. Files are never saved to disk, cloud buckets, or relational databases. A background sweeper process actively purges expired session buffers every 15 minutes, or immediately when you click "New Session". Furthermore, our API configurations strictly prohibit training foundational AI models on your inputs.',
  },
  {
    id: 'hallucination-mechanics',
    question: 'Why do generic AI chatbots hallucinate when reading contracts?',
    answer:
      'Standard LLMs are trained to predict plausible word sequences rather than perform deterministic document citations. When asked about compensation, non-competes, or termination clauses, they often blend fragments of generic internet templates with your prompt. LegalTruth eliminates this by enforcing strict dual-engine grounding: every statement must be bound to verbatim text and verified page coordinates.',
  },
  {
    id: 'source-boundaries',
    question: 'What is the difference between Document Evidence and External Search Grounding?',
    answer:
      'Document Evidence is strictly confined to your uploaded agreement—if a clause is not found, LegalTruth explicitly reports that the document is silent. When external statutory context is helpful, LegalTruth activates External Search Grounding via Google Search, displayed in a clearly demarcated blue container with prominent source attribution.',
  },
  {
    id: 'supported-documents',
    question: 'What types of legal agreements work best with LegalTruth?',
    answer:
      'LegalTruth is optimized for multi-page complex contracts including Employment Offer Letters, Non-Disclosure Agreements (NDAs), Master Services Agreements (MSAs), Intellectual Property Assignments, Independent Contractor Agreements, and Commercial Leases.',
  },
  {
    id: 'legal-advice',
    question: 'Does LegalTruth provide formal legal advice or substitute for an attorney?',
    answer:
      'No. LegalTruth is an AI-powered document verification and evidence extraction tool designed to help you quickly understand your contracts and pinpoint critical terms. It does not establish an attorney-client relationship and should not replace formal legal counsel from a qualified attorney.',
  },
];

export function FaqSection() {
  const [openIds, setOpenIds] = useState<Record<string, boolean>>({
    'privacy-guarantee': true,
  });

  const toggleItem = (id: string) => {
    setOpenIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <section
      id="faq"
      className={styles.sectionWrapper}
      aria-labelledby="faq-heading"
    >
      <div className={styles.header}>
        <div className={styles.badge} role="status">
          <span>❓ Got Questions?</span>
        </div>
        <h2 id="faq-heading" className={styles.title}>
          Frequently Asked Questions
        </h2>
        <p className={styles.subtitle}>
          Everything you need to know about our privacy architecture, grounding mechanisms, and document security.
        </p>
      </div>

      <div className={styles.accordionList}>
        {FAQS.map((faq) => {
          const isOpen = !!openIds[faq.id];
          return (
            <div key={faq.id} className={styles.item}>
              <button
                type="button"
                id={`faq-btn-${faq.id}`}
                aria-expanded={isOpen}
                aria-controls={`faq-body-${faq.id}`}
                className={styles.trigger}
                onClick={() => toggleItem(faq.id)}
              >
                <span>{faq.question}</span>
                <span
                  className={`${styles.triggerIcon} ${
                    isOpen ? styles.triggerIconOpen : ''
                  }`}
                  aria-hidden="true"
                >
                  ▾
                </span>
              </button>

              {isOpen && (
                <div
                  id={`faq-body-${faq.id}`}
                  role="region"
                  aria-labelledby={`faq-btn-${faq.id}`}
                  className={styles.answerBody}
                >
                  <p>{faq.answer}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
