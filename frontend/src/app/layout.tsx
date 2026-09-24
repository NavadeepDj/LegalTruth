import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'LegalTruth — Evidence-First Legal Document Assistant',
  description: "Ask your legal documents. See exactly where the answer comes from. When the document doesn't answer, get clearly separated external guidance.",
  keywords: ['legal assistant', 'contract analysis', 'evidence citations', 'grounded AI', 'Gemini'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="theme-color" content="#0a0e1a" />
      </head>
      <body>
        <a href="#main-content" className="sr-only">Skip to main content</a>
        <main id="main-content">{children}</main>
      </body>
    </html>
  );
}
