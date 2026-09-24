'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSession } from '@/hooks/useSession';
import { useChat } from '@/hooks/useChat';
import { Navbar } from '@/components/Layout/Navbar';
import { SplitPane } from '@/components/Layout/SplitPane';
import { DropZone } from '@/components/Upload/DropZone';
import { PdfViewer } from '@/components/Viewer/PdfViewer';
import { AnswerPanel } from '@/components/Chat/AnswerPanel';

function WorkspaceContent() {
  const searchParams = useSearchParams();
  const demoParam = searchParams.get('demo');

  const {
    sessionId,
    document,
    pdfUrl,
    error: sessionError,
    uploadDocument,
    resetSession,
  } = useSession();

  const {
    messages,
    mode,
    setMode,
    isLoading,
    error: chatError,
    askQuestion,
    explainClause,
    clearMessages,
  } = useChat({
    sessionId,
    documentId: document.documentId,
  });

  const [targetCitation, setTargetCitation] = useState<{
    page: number;
    quote: string;
  } | null>(null);

  // Load sample agreement
  const handleLoadSample = useCallback(async () => {
    try {
      const response = await fetch('/sample/employment_agreement.pdf');
      if (!response.ok) {
        throw new Error('Failed to load sample PDF from public directory');
      }
      const blob = await response.blob();
      const sampleFile = new File([blob], 'employment_agreement.pdf', {
        type: 'application/pdf',
      });
      await uploadDocument(sampleFile);
    } catch (err) {
      console.error('Failed to load sample document:', err);
    }
  }, [uploadDocument]);

  // Auto-load demo if ?demo=true
  useEffect(() => {
    if (demoParam === 'true' && !document.documentId && sessionId) {
      handleLoadSample();
    }
  }, [demoParam, document.documentId, sessionId, handleLoadSample]);

  // Jump to page from EvidenceCard
  const handleJumpToPage = useCallback((pageNumber: number, quote: string) => {
    setTargetCitation({ page: pageNumber, quote });
  }, []);

  const handleChangeDocument = () => {
    resetSession();
    clearMessages();
    setTargetCitation(null);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar
        filename={document.filename}
        totalPages={document.totalPages}
        sessionId={sessionId}
        onChangeDocument={document.documentId ? handleChangeDocument : undefined}
        onResetSession={resetSession}
      />

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }} id="main-content">
        {!document.documentId ? (
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px',
            }}
          >
            <DropZone
              onFileSelected={uploadDocument}
              onLoadSample={handleLoadSample}
              isUploading={document.isUploading}
              error={sessionError}
            />
          </div>
        ) : (
          <SplitPane
            left={
              <PdfViewer
                pdfUrl={pdfUrl}
                filename={document.filename}
                totalPages={document.totalPages}
                targetPage={targetCitation?.page}
                targetQuote={targetCitation?.quote}
                onExplainClause={explainClause}
              />
            }
            right={
              <AnswerPanel
                messages={messages}
                mode={mode}
                onModeChange={setMode}
                onAsk={askQuestion}
                onClear={clearMessages}
                onJumpToPage={handleJumpToPage}
                isLoading={isLoading}
                error={chatError}
                hasDocument={!!document.documentId}
              />
            }
          />
        )}
      </main>
    </div>
  );
}

export default function WorkspacePage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            color: '#94a3b8',
          }}
        >
          Loading workspace...
        </div>
      }
    >
      <WorkspaceContent />
    </Suspense>
  );
}
