import { useState, useEffect, useRef } from "react";
import { PDFDocument } from "../types";

// We use dynamic import for pdfjs-dist to avoid bundling the canvas dependency
// during server-side builds. The canvas package is a native Node.js module that
// pdfjs-dist optionally uses for server-side rendering, but it can't be bundled
// for the browser and causes build errors in Next.js/webpack environments.
// By using dynamic import, we ensure pdfjs-dist is only loaded on the client.

export function usePDFDocument(
  url: string,
  onError?: (error: Error) => void,
  withCredentials: boolean = false,
) {
  const [document, setDocument] = useState<PDFDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const pdfjsInitialized = useRef(false);

  useEffect(() => {
    if (!url) return;
    if (typeof window === "undefined") return; // Skip on server

    setLoading(true);
    setError(null);

    const loadPDF = async () => {
      try {
        // Dynamically import pdfjs-dist to avoid SSR/build issues with canvas
        const pdfjsLib = await import("pdfjs-dist");

        // Set up PDF.js worker only once
        if (!pdfjsInitialized.current) {
          pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
          pdfjsInitialized.current = true;
        }

        const loadingTask = pdfjsLib.getDocument({
          url,
          withCredentials,
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
          fingerprint:
            (pdf as any).fingerprint || (pdf as any).fingerprints?.[0] || "",
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
        const error =
          err instanceof Error ? err : new Error("Failed to load PDF");
        setError(error);
        onError?.(error);
      } finally {
        setLoading(false);
      }
    };

    loadPDF();
  }, [url, onError, withCredentials]);

  return { document, pdfDoc, loading, error };
}
