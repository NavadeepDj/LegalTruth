'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ClauseContextMenu } from './ClauseContextMenu';
import styles from './PdfViewer.module.css';

interface PdfViewerProps {
  pdfUrl: string | null;
  filename?: string | null;
  totalPages?: number;
  targetPage?: number;
  targetQuote?: string;
  onExplainClause?: (clauseText: string, pageNumber: number) => void;
}

export function PdfViewer({
  pdfUrl,
  filename,
  totalPages = 1,
  targetPage,
  targetQuote,
  onExplainClause,
}: PdfViewerProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    text: string;
  } | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  // Listen for targetPage changes from EvidenceCard clicks
  useEffect(() => {
    if (targetPage && targetPage >= 1 && targetPage <= totalPages) {
      const targetElement = pageRefs.current.get(targetPage);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      const raf = requestAnimationFrame(() => {
        setCurrentPage(targetPage);
      });
      return () => cancelAnimationFrame(raf);
    }
  }, [targetPage, totalPages]);

  // Handle text selection for "Explain this clause"
  const handleMouseUp = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      setContextMenu(null);
      return;
    }

    const selectedText = selection.toString().trim();
    if (selectedText.length > 5) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const containerRect = scrollContainerRef.current?.getBoundingClientRect();

      if (containerRect) {
        setContextMenu({
          x: rect.left + rect.width / 2,
          y: rect.top - 8,
          text: selectedText,
        });
      }
    } else {
      setContextMenu(null);
    }
  }, []);

  const handleExplain = (text: string) => {
    if (onExplainClause) {
      onExplainClause(text, currentPage);
    }
    setContextMenu(null);
    window.getSelection()?.removeAllRanges();
  };

  const handleZoom = (delta: number) => {
    setZoomLevel((prev) => Math.min(Math.max(prev + delta, 60), 180));
  };

  if (!pdfUrl) {
    return (
      <div className={styles.viewerContainer}>
        <div className={styles.emptyState}>
          <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>📖</div>
          <h3>No Document Loaded</h3>
          <p>Upload a legal contract to begin evidence inspection.</p>
        </div>
      </div>
    );
  }

  // Create page cards array
  const pagesList = Array.from({ length: totalPages || 1 }, (_, i) => i + 1);

  return (
    <div className={styles.viewerContainer} role="region" aria-label="PDF Document Viewer">
      {/* Viewer Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.navGroup}>
          <button
            type="button"
            className={styles.toolButton}
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage <= 1}
            title="Previous page"
            aria-label="Previous page"
          >
            ‹
          </button>
          <span className={styles.pageIndicator}>
            Page {currentPage} of {totalPages}
          </span>
          <button
            type="button"
            className={styles.toolButton}
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage >= totalPages}
            title="Next page"
            aria-label="Next page"
          >
            ›
          </button>
        </div>

        <div className={styles.zoomGroup}>
          <button
            type="button"
            className={styles.toolButton}
            onClick={() => handleZoom(-15)}
            title="Zoom out"
            aria-label="Zoom out"
          >
            −
          </button>
          <span className={styles.zoomText}>{zoomLevel}%</span>
          <button
            type="button"
            className={styles.toolButton}
            onClick={() => handleZoom(15)}
            title="Zoom in"
            aria-label="Zoom in"
          >
            +
          </button>
        </div>
      </div>

      {/* Floating Clause Context Menu */}
      {contextMenu && (
        <ClauseContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          selectedText={contextMenu.text}
          onExplain={handleExplain}
          onClose={() => setContextMenu(null)}
        />
      )}

      {/* Document Viewport */}
      <div
        ref={scrollContainerRef}
        className={styles.scrollArea}
        onMouseUp={handleMouseUp}
      >
        <div
          className={styles.canvasWrapper}
          style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
        >
          {pagesList.map((pageNum) => {
            const isTarget = pageNum === targetPage;

            return (
              <div
                key={pageNum}
                ref={(el) => {
                  if (el) pageRefs.current.set(pageNum, el);
                  else pageRefs.current.delete(pageNum);
                }}
                className={`${styles.pageCard} ${isTarget ? styles.activePageCard : ''}`}
                id={`document-page-${pageNum}`}
                data-page-number={pageNum}
              >
                <div className={styles.pageHeader}>
                  <span>{filename || 'Document'}</span>
                  <span>Page {pageNum}</span>
                </div>

                {/* Render the embedded iframe / object for PDF rendering */}
                <div style={{ minHeight: '680px', width: '100%', position: 'relative' }}>
                  <iframe
                    src={`${pdfUrl}#page=${pageNum}&toolbar=0&navpanes=0`}
                    title={`${filename} - Page ${pageNum}`}
                    style={{
                      width: '100%',
                      height: '700px',
                      border: 'none',
                      borderRadius: '4px',
                      background: '#fff',
                    }}
                  />
                  {isTarget && targetQuote && (
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '12px',
                        left: '12px',
                        right: '12px',
                        background: 'rgba(52, 211, 153, 0.95)',
                        color: '#0a0e1a',
                        padding: '10px 14px',
                        borderRadius: '6px',
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                        pointerEvents: 'none',
                      }}
                    >
                      <span style={{ textTransform: 'uppercase', fontSize: '0.7rem', display: 'block', opacity: 0.8 }}>
                        Cited In Answer
                      </span>
                      &ldquo;{targetQuote}&rdquo;
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
