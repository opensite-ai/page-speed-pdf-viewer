import { useState, useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument, PDFMetadata } from '../types';

// Set up PDF.js worker
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

export function usePDFDocument(url: string, onError?: (error: Error) => void) {
  const [document, setDocument] = useState<PDFDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null);

  useEffect(() => {
    if (!url) return;

    setLoading(true);
    setError(null);

    const loadPDF = async () => {
      try {
        const loadingTask = pdfjsLib.getDocument({
          url,
          withCredentials: true,
          rangeChunkSize: 65536, // For linearized PDFs
        });

        const pdf: any = await loadingTask.promise;
        setPdfDoc(pdf);

        // Extract metadata (types in pdfjs-dist are limited, so cast to any)
        const metadata: any = await pdf.getMetadata();
        const info: any = metadata?.info || {};
        const isLinearized: boolean = !!(pdf as any).isLinearized;

        setDocument({
          numPages: pdf.numPages,
          fingerprint: (pdf as any).fingerprint || (pdf as any).fingerprints?.[0] || '',
          metadata: {
            title: info.Title,
            author: info.Author,
            subject: info.Subject,
            keywords: info.Keywords,
            creator: info.Creator,
            producer: info.Producer,
          },
          isLinearized,
          isEncrypted: !!(pdf as any).isEncrypted,
        });
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to load PDF');
        setError(error);
        onError?.(error);
      } finally {
        setLoading(false);
      }
    };

    loadPDF();
  }, [url, onError]);

  return { document, pdfDoc, loading, error };
}

