'use client';

import React, { useEffect, useRef } from 'react';
import { ConversationEntry } from '@/lib/types';
import { SourceBoundary } from './SourceBoundary';
import { EvidenceCard } from './EvidenceCard';
import { WebFallbackCard } from './WebFallbackCard';
import { WhyCantAnswer } from './WhyCantAnswer';
import styles from './ConversationHistory.module.css';

interface ConversationHistoryProps {
  messages: ConversationEntry[];
  isLoading: boolean;
  onJumpToPage: (pageNumber: number, quote: string) => void;
}

export function ConversationHistory({
  messages,
  isLoading,
  onJumpToPage,
}: ConversationHistoryProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (messages.length === 0) {
    return (
      <div className={styles.historyContainer}>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon} aria-hidden="true">
            📑
          </div>
          <h2 className={styles.emptyTitle}>Your Evidence Assistant is Ready</h2>
          <p className={styles.emptyDesc}>
            Ask any question about your document or choose one of the suggestions below.
            Every answer will be verified with exact citations and page references.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={styles.historyContainer}
      role="log"
      aria-label="Conversation with LegalTruth"
      aria-live="polite"
      aria-relevant="additions"
    >
      {messages.map((msg, idx) => {
        if (msg.role === 'user') {
          return (
            <div key={idx} className={styles.messageRow}>
              <div className={styles.userMessage}>
                <strong>{msg.content}</strong>
              </div>
            </div>
          );
        }

        const res = msg.response;

        return (
          <div key={idx} className={styles.messageRow}>
            <div className={styles.assistantMessage}>
              <div className={styles.assistantHeader}>
                <div className={styles.assistantBadge}>
                  <span aria-hidden="true">⚖️</span>
                  <span>LegalTruth Analysis</span>
                </div>
              </div>

              {res && <SourceBoundary boundary={res.source_boundary} />}

              <div className={styles.answerBody}>{msg.content}</div>

              {/* Document Evidence */}
              {res && res.evidence && res.evidence.length > 0 && (
                <div className={styles.evidenceSection}>
                  <div className={styles.sectionHeader}>
                    <span>📌</span>
                    <span>Document Evidence ({res.evidence.length})</span>
                  </div>
                  {res.evidence.map((item, eIdx) => (
                    <EvidenceCard
                      key={eIdx}
                      evidence={item}
                      onJumpToPage={onJumpToPage}
                    />
                  ))}
                </div>
              )}

              {/* Reasoning breakdown - collapsed by default to keep answers clean */}
              {res && res.reasoning && (
                <details className={styles.reasoningDetails}>
                  <summary className={styles.reasoningSummary}>
                    <span>🔍 View Analysis Derivation</span>
                  </summary>
                  <div className={styles.reasoningBox}>
                    {res.reasoning}
                  </div>
                </details>
              )}

              {/* If NOT_FOUND */}
              {res && res.evidence_status === 'NOT_FOUND' && res.why_cant_answer && (
                <WhyCantAnswer
                  reason={res.why_cant_answer}
                  actionGuidance={res.action_guidance}
                />
              )}

              {/* External Web Sources */}
              {res && res.web_sources && res.web_sources.length > 0 && (
                <div className={styles.evidenceSection}>
                  <div className={styles.sectionHeader}>
                    <span>🌐</span>
                    <span>External Public Sources ({res.web_sources.length})</span>
                  </div>
                  {res.web_sources.map((src, sIdx) => (
                    <WebFallbackCard key={sIdx} source={src} />
                  ))}
                </div>
              )}

              {res?.disclaimer && idx === messages.length - 1 && (
                <div className={styles.disclaimer} role="note">
                  {res.disclaimer}
                </div>
              )}
            </div>
          </div>
        );
      })}

      {isLoading && (
        <div className={styles.messageRow}>
          <div className={styles.assistantMessage} role="status" aria-label="Analyzing document">
            <div className={styles.assistantBadge}>
              <span aria-hidden="true">⚖️</span>
              <span>Analyzing Document & Citations...</span>
            </div>
            <div
              className="skeleton-loading"
              style={{ height: '50px', marginTop: '12px' }}
            />
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
