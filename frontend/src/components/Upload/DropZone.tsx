'use client';

import React, { useState, useRef, useCallback } from 'react';
import styles from './DropZone.module.css';

interface DropZoneProps {
  onFileSelected: (file: File) => void;
  onLoadSample: () => void;
  isUploading: boolean;
  error?: string | null;
}

export function DropZone({
  onFileSelected,
  onLoadSample,
  isUploading,
  error,
}: DropZoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndHandle = useCallback(
    (file: File) => {
      setLocalError(null);

      if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
        setLocalError('Only PDF files are supported. Please upload a valid PDF document.');
        return;
      }

      if (file.size > 20 * 1024 * 1024) {
        setLocalError('File size exceeds the 20MB limit. Please upload a smaller document.');
        return;
      }

      onFileSelected(file);
    },
    [onFileSelected]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = () => {
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndHandle(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndHandle(e.target.files[0]);
    }
  };

  const triggerBrowse = () => {
    if (!isUploading) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '720px', margin: '0 auto' }}>
      <div
        className={`${styles.dropzoneContainer} ${
          isDragActive ? styles.dropzoneActive : ''
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={triggerBrowse}
        role="button"
        tabIndex={0}
        aria-label="Upload PDF legal document"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            triggerBrowse();
          }
        }}
        id="pdf-dropzone"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          style={{ display: 'none' }}
          onChange={handleFileChange}
          aria-hidden="true"
        />

        {isUploading ? (
          <>
            <div className={styles.spinner} role="status" aria-label="Loading" />
            <h2 className={styles.title}>Processing Document...</h2>
            <p className={styles.subtitle}>
              Extracting text, sections, and chunking for evidence tracking
            </p>
          </>
        ) : (
          <>
            <div className={styles.iconWrapper} aria-hidden="true">
              📄
            </div>
            <h2 className={styles.title}>Upload your Legal Document</h2>
            <p className={styles.subtitle}>
              Drag and drop your PDF here, or click to browse files
            </p>
            <button
              type="button"
              className={styles.browseButton}
              onClick={(e) => {
                e.stopPropagation();
                triggerBrowse();
              }}
            >
              Choose PDF File
            </button>
            <p className={styles.helperText}>
              Supported: PDF agreements, NDAs, offer letters, leases up to 20MB
            </p>
          </>
        )}

        {(localError || error) && (
          <div className={styles.errorBanner} role="alert">
            {localError || error}
          </div>
        )}
      </div>

      <div className={styles.divider}>
        <span>OR QUICK DEMO</span>
      </div>

      <div className={styles.sampleCard}>
        <div className={styles.sampleInfo}>
          <div className={styles.sampleTitle}>Sample Employment Agreement</div>
          <div className={styles.sampleMeta}>
            3 pages • Notice period, confidentiality, non-compete clauses
          </div>
        </div>
        <button
          type="button"
          className={styles.sampleButton}
          onClick={onLoadSample}
          disabled={isUploading}
          id="load-sample-btn"
        >
          Load Sample Agreement →
        </button>
      </div>
    </div>
  );
}
