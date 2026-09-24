'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import styles from './SplitPane.module.css';

interface SplitPaneProps {
  left: React.ReactNode;
  right: React.ReactNode;
  initialLeftRatio?: number; // e.g. 0.55
  minLeftWidth?: number; // px
  minRightWidth?: number; // px
}

export function SplitPane({
  left,
  right,
  initialLeftRatio = 0.55,
  minLeftWidth = 360,
  minRightWidth = 360,
}: SplitPaneProps) {
  const [leftRatio, setLeftRatio] = useState(initialLeftRatio);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const startDrag = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const totalWidth = rect.width;
      const offsetX = e.clientX - rect.left;

      if (offsetX >= minLeftWidth && totalWidth - offsetX >= minRightWidth) {
        setLeftRatio(offsetX / totalWidth);
      }
    },
    [isDragging, minLeftWidth, minRightWidth]
  );

  const stopDrag = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', stopDrag);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', stopDrag);
    };
  }, [isDragging, handleMouseMove, stopDrag]);

  const leftWidthStyle = `${leftRatio * 100}%`;
  const rightWidthStyle = `${(1 - leftRatio) * 100}%`;

  return (
    <div
      ref={containerRef}
      className={styles.splitPaneContainer}
      style={{ cursor: isDragging ? 'col-resize' : 'default' }}
    >
      <div
        className={styles.leftPane}
        style={{ width: leftWidthStyle }}
        aria-label="Document viewer pane"
      >
        {left}
      </div>

      <div
        className={`${styles.divider} ${isDragging ? styles.dividerDragging : ''}`}
        onMouseDown={startDrag}
        role="separator"
        aria-orientation="vertical"
        aria-valuenow={Math.round(leftRatio * 100)}
        tabIndex={0}
        aria-label="Resize panel divider"
      >
        <div className={styles.dividerHandle} />
      </div>

      <div
        className={styles.rightPane}
        style={{ width: rightWidthStyle }}
        aria-label="Answer and chat pane"
      >
        {right}
      </div>
    </div>
  );
}
